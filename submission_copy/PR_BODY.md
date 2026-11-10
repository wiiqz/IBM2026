[Submission] needle: NEEDLE — permission-aware hybrid retrieval in Db2

# IBM Db2 TechX Summit 2026 — Project Submission

---

## 1. Project Overview

- **Project Title:** NEEDLE — permission-aware hybrid retrieval in Db2
- **Project Slug (must match folder name):** `submissions/needle/`
- **Short Description (1–3 sentences):** NEEDLE is a vulnerability-triage tool that finds which of your services a vague security advisory hits, with all retrieval done inside IBM Db2. Keyword and vector search run and fuse in one Db2 SQL statement, and each analyst sees only the rows Db2 permits. Under row permissions, an analyst who may see 10% of the rows got 2.05 of 10 results; on 89 held-out queries, the vector leg of NEEDLE's per-user router returned 10 of 10 rows, with 0 leaks.
- **Problem Solved & Target Audience:** A security report often arrives before it has a CVE ID or a package name, as a chat message or a mailing-list post, so a triager has to search advisories by meaning and by exact identifier at the same time. Some advisories are embargoed, and the common fix (filter after the vector search) silently returns fewer than k results. Why a Db2 user should care: any `FETCH APPROX` on a table whose row permission reads the user's scope from an entitlement table (tenant, region, clearance) shares one plan. The question that matters, "which of our services run an affected version, and since when", must be answered by deterministic SQL, not by a model. NEEDLE is for PSIRT and on-call security triagers, service owners, and developers who build retrieval on Db2.

---

## 2. Team Information

- **Team Name:** Needlepoint
- **Team Members:**

| Full Name | GitHub Username | Email / Role |
|---|---|---|
| Kartikeya Lathi | @KnigguKniggu-droid | Db2 schema, retrieval SQL, RCAC research, evaluation |
| William Lu | @wiiqz | Web UI, demo and presentation |

---

## 3. IBM Db2 Integration Summary

- **IBM Db2 Edition / Environment:** Db2 Community Edition 12.1.5.0 in Docker (`icr.io/db2_community/db2:12.1.5.0`), database `VECDB` with 32K pages, built and measured in a GitHub Codespace (Linux x86-64).
- **How IBM Db2 is Used in the Solution:** Db2 does all of the retrieval, permission and impact work. `NEEDLE.TRIAGE` (SQL PL) runs a BM25 keyword leg in plain SQL and a `FETCH APPROX FIRST <literal> ROWS ONLY` vector leg on the DiskANN index `NEEDLE.ADV_DOC_VIX`, and fuses both ranks with RRF (`RANK() OVER`, `FULL OUTER JOIN`) in one statement. A row permission (`CREATE PERMISSION NEEDLE.ADV_DOC_ROWS`, looked up by `SESSION_USER` in `NEEDLE.USER_ACCESS`) applies to both legs, and each analyst connects as their own Db2 user, so the app never filters rows itself. An exact join of package versions against OSV affected versions gives AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE / PREVIOUSLY_AFFECTED per service, and an application-period temporal table (`PERIOD BUSINESS_TIME`) gives "exposed since" per service. We used `EXPLAIN`, `db2exfmt`, `MON_GET_PKG_CACHE_STMT` and `EXPLAIN_FROM_SECTION` to prove which access path Db2 chose for each user.
- **Db2 Connector / Driver / Framework Integration Used:** `ibm_db` 3.3.0 with parameter markers for every value (only validated integers k and depth are written as literals, because `FETCH APPROX FIRST ? ROWS` does not use the vector index). A LangChain `BaseRetriever` (`Db2HybridRetriever`) and a Haystack component (`NeedleTriageComponent`) wrap the SQL PL procedure. `langchain-db2` 1.0.0 (`DB2VS`) is used as a measured baseline.
- **Schema & Data Stored / Processed:** Schema `NEEDLE` (full DDL in `architecture.md`). `ADV_RAW` holds 26,842 raw OSV PyPI records (CLOB + SHA-256). `ADV_DOC` holds 26,210 searchable non-withdrawn advisories with `EMB VECTOR(768, FLOAT32) NOT NULL` (nomic-embed-text) and the RCAC columns `ROW_BUCKET` and `EMBARGO_UNTIL`. `ADV_ALIAS` and `ADV_AFFECTED` hold the alias graph and enumerated affected versions. `POSTING`, `TERM_DF` and `CORPUS_STATS` hold the BM25 index (1,944,102 postings). `USER_ACCESS` holds per-user visibility. `SERVICE` and `SBOM_COMPONENT` hold a synthetic service fleet with `PERIOD BUSINESS_TIME` deploy history. The fleet, the embargo flags and one prompt-injection test advisory are synthetic and labelled.
- **Steps to Verify Db2 Integration:**

Open a Db2 shell in the container and connect (run from `submissions/needle/` after the README setup):
```bash
docker exec -it needle-db2 su - db2inst1
db2 connect to VECDB
```

1. Version and page size:
```sql
SELECT SERVICE_LEVEL FROM TABLE(SYSPROC.ENV_GET_INST_INFO()) AS T;
SELECT TBSPACE, PAGESIZE FROM SYSCAT.TABLESPACES WHERE TBSPACE = 'USERSPACE1';
```
Expected: `DB2 v12.1.5.0`; page size 32768.

2. Objects, the vector column, the vector index, RCAC controls, routines and the temporal period:
```sql
SELECT TABNAME, TYPE, CONTROL FROM SYSCAT.TABLES WHERE TABSCHEMA = 'NEEDLE' ORDER BY TABNAME;
SELECT TABNAME, COLNAME, TYPENAME, LENGTH, NULLS FROM SYSCAT.COLUMNS WHERE TABSCHEMA = 'NEEDLE' AND TYPENAME = 'VECTOR';
SELECT TABNAME, INDNAME, INDEXTYPE FROM SYSCAT.INDEXES WHERE TABSCHEMA = 'NEEDLE' ORDER BY TABNAME, INDNAME;
SELECT CONTROLNAME, CONTROLTYPE, ENABLE, VALID, TABNAME, COLNAME FROM SYSCAT.CONTROLS WHERE TABSCHEMA = 'NEEDLE';
SELECT ROUTINENAME, ROUTINETYPE, LANGUAGE FROM SYSCAT.ROUTINES WHERE ROUTINESCHEMA = 'NEEDLE';
SELECT TABNAME, PERIODNAME, BEGINCOLNAME, ENDCOLNAME FROM SYSCAT.PERIODS WHERE TABSCHEMA = 'NEEDLE';
```
Expected: `ADV_DOC.EMB` is `VECTOR`, `NULLS = N`; `ADV_DOC_VIX` has `INDEXTYPE = VANN`; permission `ADV_DOC_ROWS` is enabled.

3. Row counts and in-database JSON checks (from the host):
```bash
bash scripts/setup_db.sh --validate
```

4. The keyword leg alone (plain SQL BM25; the query terms are one bound JSON array):
```sql
SELECT * FROM TABLE(NEEDLE.BM25_SEARCH('["pyyaml","full_load"]', 10)) AS T ORDER BY KW_RANK;
CALL NEEDLE.TRIAGE_MODE(NULL, '["pyyaml","full_load"]', 10, 50, 'KW');
```

5. The vector index is used for `FETCH APPROX` with a literal k, and not with a parameter marker (from the `db2inst1` shell):
```bash
db2 connect to VECDB
db2 "EXPLAIN PLAN FOR SELECT ADV_ID FROM NEEDLE.ADV_DOC
     ORDER BY VECTOR_DISTANCE(EMB, VECTOR(CAST(? AS CLOB(100K)), 768, FLOAT32), COSINE)
     FETCH APPROX FIRST 10 ROWS ONLY"
db2exfmt -d VECDB -1 -o approx10.exfmt
grep -n "IXSCAN\|VECIDX" approx10.exfmt          # expect IXSCAN over VECIDX: NEEDLE.ADV_DOC_VIX

db2 "EXPLAIN PLAN FOR SELECT ADV_ID FROM NEEDLE.ADV_DOC
     ORDER BY VECTOR_DISTANCE(EMB, VECTOR(CAST(? AS CLOB(100K)), 768, FLOAT32), COSINE)
     FETCH APPROX FIRST ? ROWS ONLY"
db2exfmt -d VECDB -1 -o approx_param.exfmt
grep -n "IXSCAN\|VECIDX\|TBSCAN" approx_param.exfmt   # expect TBSCAN on ADV_DOC, no VECIDX
```
Needs the full corpus (at about 2,000 rows a table scan is cheaper). Our plans: `docs/evidence/g1_vector_index.md` (before RCAC), `docs/evidence/rcac_raw/section_forward_0.txt` (after RCAC: the section the analyst users actually ran, formatted with `EXPLAIN_FROM_SECTION`; the permission filter sits on the FETCH above the vector IXSCAN, est. 21 rows).

6. Row permissions at work (connect as each analyst; the CLP prompts for the password you set in `.env`):
```sql
CONNECT TO VECDB USER NDL_SENIOR;   SELECT COUNT(*) FROM NEEDLE.ADV_DOC;   -- 26210
CONNECT TO VECDB USER NDL_JUNIOR;   SELECT COUNT(*) FROM NEEDLE.ADV_DOC;   -- 26183
SELECT COUNT(*) FROM NEEDLE.ADV_DOC WHERE EMBARGO_UNTIL > CURRENT TIMESTAMP;   -- 0 for NDL_JUNIOR
SELECT COUNT(*) FROM NEEDLE.TERM_DF;   -- fails for NDL_JUNIOR: no SELECT privilege
CONNECT TO VECDB USER NDL_P10;      SELECT COUNT(*) FROM NEEDLE.ADV_DOC;   -- 2616 (about 10%)
```

7. Exposure window (temporal):
```sql
SELECT SERVICE_ID, PACKAGE, VERSION, BUS_START, BUS_END
FROM NEEDLE.SBOM_COMPONENT FOR BUSINESS_TIME AS OF CURRENT DATE
WHERE PACKAGE = 'pyyaml' ORDER BY SERVICE_ID;
```

8. Tests (from the host, with `.env` loaded and `PYTHONPATH=src`):
```bash
python -m pytest -q -m "not db" tests
python -m pytest -q -m db tests/test_rcac.py tests/test_triage_rcac.py
python -m pytest -q tests
```
Our final run of all tests (`python -m pytest -q tests`): 206 passed. Of these, 40 are `-m db` tests that ran against live Db2 and 166 are unit tests (`docs/evidence/pytest_final.txt`).

---

## 4. Technology Stack & AI / LLM Usage

- **Programming Languages:** Python (3.12+, built with 3.13), SQL, SQL PL, TypeScript.
- **Frameworks & Libraries:** `ibm_db` 3.3.0, LangChain (`langchain-core`, `langchain-ollama`, `langchain-db2` as baseline), Haystack (component wrapper), FastAPI + React/Vite/TypeScript/Tailwind (web UI), Streamlit, pytest, `rank-bm25` (parity reference), matplotlib, Docker Compose, GitHub Codespaces.
- **AI / LLM Framework (if applicable):** LangChain (primary): `Db2HybridRetriever` is a LangChain `BaseRetriever`, and the memo uses `ChatOllama`. Haystack: `NeedleTriageComponent` runs in a Haystack `Pipeline`. Db2 decides what matches, what is affected and who may see it; the model only explains.
- **Model Provider & Model Name (if applicable):** Ollama, local: `nomic-embed-text` (768-dim embeddings) and a memo model selected by `LLM_MODEL` (`qwen3:14b` in our runs; `qwen3:4b-instruct` also tested). No cloud key is needed.
- **Where AI/LLM is Applied in the Workflow:** The embedding model turns the query into a vector for the Db2 vector leg. After Db2 returns the fused advisories and the exact SBOM join, the local model (`qwen3:14b` in the evidence runs) writes a short cited memo. A verifier then removes any sentence whose advisory, package or service ID is not in the SQL results, and any safety claim, URL or install command. The model never decides which advisory matches, which service is affected, or who may see what; Db2 decides all three.

---

## 5. Demonstration & Links

- **Live Demo URL (if hosted):** None. The app runs locally against your own Db2 (web UI and API bound to 127.0.0.1).
- **Demo Video (YouTube / Loom / Drive):** https://youtu.be/5ZcVFBsjYLE (2:46)
- **External Source Repo (if hosted separately):** [REPO_URL]
- **Presentation / Slides URL (optional):** None.

---

## 6. Submission Verification Checklist

Please verify and check every item before requesting review:

- [x] **Folder Structure:** My submission is placed in a single new directory under `submissions/<project-slug>/` copied from `submissions/_template/`.
- [x] **Naming Conventions:** The `<project-slug>` uses lowercase letters, numbers, and hyphens only, matching the branch name and PR title.
- [x] **Complete Documentation:** Both `submissions/<project-slug>/README.md` and `submissions/<project-slug>/architecture.md` are completely filled out without unfilled placeholder markers.
- [x] **Metadata File:** `submissions/<project-slug>/submission.json` is completed and valid JSON.
- [x] **No Secrets or Credentials:** No API keys, passwords, private tokens, or connection strings with real credentials are committed. `.env.example` contains placeholders only.
- [x] **Tested Setup Instructions:** Setup and run instructions were tested from a fresh environment and can be reproduced by reviewers.
- [x] **License Declared:** Open-source license or distribution terms are specified.
- [x] **Code of Conduct:** All team members agree to adhere to the repository [Code of Conduct](../../CODE_OF_CONDUCT.md).
- [x] **Scope Isolation:** This PR only adds/modifies files inside `submissions/<project-slug>/` and does not touch root files or other submissions.
- [x] **Google Form Submission:** I understand that opening this PR is step 1, and I will submit this PR URL into the official Google Form (**https://forms.gle/n8GQL4tg7Yzftwu39**).

---

## 7. Additional Notes for Reviewers & Judges

NEEDLE is a triage tool, and the part we are proudest of is a measurement: what Db2 row permissions do to approximate vector search, per user, and how to keep recall. Every number below comes from a run file in `docs/evidence/` or `eval/results/`.

**What we measured (Db2 12.1.5.0, `NEEDLE.ADV_DOC`, 26,210 rows, k = 10, 170 queries; `docs/evidence/rcac_real.md`)**
- With row permissions active, `FETCH APPROX FIRST 10` still uses the vector index, and all users share one plan: after `FLUSH PACKAGE CACHE DYNAMIC`, five users left exactly one package-cache entry (one executable id), in both user orders.
- That plan sizes the vector index scan with one compile-time filter factor (0.495) for every user, so the index hands 21 candidates (10 / 0.495) to the permission check. Section actuals confirm exactly 21 rows out of the vector index in all 9 captured activities.
- A user who sees 10% of the rows therefore got 2.05 rows on average instead of 10 (recall@10 0.205), and 36 of 170 queries returned zero rows. A user who sees 25% got 5.08 rows (recall 0.502). This is how a shared plan behaves, not a defect: with the same permission written as a literal on a copy, the estimate moved to the true selectivity and recall at 10% rose from 0.205 to 0.765.
- A per-user router (fitted on 81 dev queries, reported on 89 held-out queries only) restored recall@10 to 1.000 / 1.000 / 1.000 / 0.988 / 0.987 at 10 / 25 / 50 / 75 / 100% visibility (10-25 %: exact scans; 50 %: APPROX 100, which Db2 ran as a table scan; 75-100 %: the vector index with search-list size 150), with 10 of 10 rows for every query and 0 permission leaks. Plain `APPROX 10` on the same held-out queries gave 0.208 / 0.506 / 0.852 / 0.947 / 0.948.
- Oracle check: for every user and all 170 queries, the user's own `FETCH EXACT` top-10 equals the admin's exact top-10 with the permission written as an explicit `WHERE` (170/170).
- Without permissions, `FETCH APPROX FIRST 10` ran in 4.8 ms median vs 72.3 ms for `FETCH EXACT`, with top-10 overlap 0.995 (`docs/evidence/g1_vector_index.md`).

**Retrieval quality (canonical run `20261110T024304Z`, signed in as NDL_SENIOR with row access control active, k = 10, n = 150 per slice; `docs/evidence/eval_final.md`)**

The paraphrase slice is the realistic case: synthetic chat-style rewrites that share no 6-word run with the source advisory. There, hybrid TRIAGE reaches hit@10 0.453 (share of queries with a correct advisory in the top 10), against 0.360 for vector APPROX and 0.340 for BM25 alone. The named and masked slices are text copied from a correct advisory, so they are upper bounds.

| Retriever | paraphrase hit@10 | paraphrase MRR@10 | named hit@10 | masked hit@10 | p50 ms (per slice) |
|---|---|---|---|---|---|
| Hybrid `NEEDLE.TRIAGE` (router depth) | **0.453** | 0.295 | 0.993 | 1.000 | 36.8–90.3 |
| Vector APPROX (`FETCH APPROX FIRST 10`) | 0.360 | 0.225 | 0.993 | 0.993 | 2.7–3.0 |
| Vector EXACT | 0.367 | 0.230 | 0.993 | 1.000 | 72.9–73.3 |
| BM25 only (plain SQL) | 0.340 | 0.241 | 0.993 | 1.000 | 29.9–74.5 |

Pooled over all 450 queries, p50 is 53.5 ms for hybrid TRIAGE and 43.4 ms for BM25 alone (Db2 time inside the Codespace, query embedding excluded). APPROX and EXACT top-10 lists overlapped 0.97 on average. The quality gate (hybrid named hit@10 at least 0.8) passed at 0.993, with 0 errors in 450 queries.

**Keyword leg under the row permission (fixed).** After we activated row access control on `POSTING`, Db2 scanned all 1.94 million posting-index entries for every query instead of probing the query terms. A per-term `LATERAL` rewrite of `NEEDLE.BM25_SEARCH` (no DDL) restored the per-term index probe: on 30 queries as NDL_SENIOR, BM25 p50 fell from 244.8 to 27.2 ms and TRIAGE from 256.4 to 34.4 ms, with identical top-10 results, and 60 tests passed (`docs/evidence/rcac_posting_overhead.md`).

**Security work.** An AI-assisted code review (Claude and Codex) of our own code found that the global BM25 statistics (`TERM_DF`, `CORPUS_STATS`) let an analyst subtract visible document frequencies from global ones and reconstruct the vocabulary of embargoed advisories, including their IDs. We now compute those statistics over public rows only, revoked SELECT on both tables from every analyst, and added a regression test for the difference attack (`docs/evidence/fix_c1_h2.txt`). The same review led to a stronger memo verifier (59 verifier tests in the final run, including Unicode-dash and fullwidth ID bypasses; `docs/evidence/fix_h1.txt`, `docs/evidence/pytest_final.txt`) and to a sign-in with each user's own Db2 credentials instead of a user picker.

**Notes we wrote along the way.** `docs/CONNECTOR_NOTES.md` lists seven Db2 behaviours we observed while building on the vector features (for example, `FETCH APPROX FIRST ? ROWS` does not use the vector index, and a nullable vector column leads to exact search unless the query adds `IS NOT NULL`), each with a repro script and a suggested one-line change.

**Topic-clustered visibility.** When analysts see whole topic clusters instead of random rows, the 10%-visibility analyst got zero results for 130 of 170 queries with plain `FETCH APPROX FIRST 10`, and the router still returned 10 of 10 rows on every held-out query with 0 leaks (`docs/evidence/rcac_real.md`, "Correlated visibility"; `eval/results/rcac_correlated.json`).

**Honest limits.** One corpus; one random and one topic-clustered visibility assignment, each with one seed. At 26,210 rows exact search is cheap (16 ms at 10% visibility, 146 ms at 100%), so the router's value here is recall and row count, not speed. The service fleet, embargo flags and the injection test advisory are synthetic and labelled. Full list: README "Known Limitations".
