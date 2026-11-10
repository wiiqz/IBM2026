# NEEDLE: implementation plan (PRD level)

Owner: docs agent. Written 2026-11-09 19:25-20:15 CST. Build authority: `CONTRACT.md` (orchestrator).
Status words used here: **PLANNED** (not started or not verified), **UNKNOWN** (not measured),
**UNVERIFIED** (not run on Db2 yet), **OBSERVED** (seen in this session, with the evidence named).
No number in this plan is a NEEDLE result. Every result will come from a run and an evidence file.

---

## 0. BUILD_STATUS (update in place; one row per requirement)

Rules for this table:
- A row is **DONE** only with an evidence path that a reviewer can open.
- **BLOCKED** carries the SQLSTATE or error text.
- **CUT** carries the reason and the time.
- Nobody writes "works", "passes" or a number without the evidence file.

| ID | Item | Owner | Status | Evidence |
|---|---|---|---|---|
| F1 | Db2 v12.1.5.0 CE in Codespace, container `db2` | orchestrator | DONE | `docs/evidence/text_search_probe.md` (db2level line) |
| F2 | Database VECDB, 32K pages | orchestrator | DONE (CONTRACT) | TODO(evidence): `docs/evidence/db2level.txt` |
| F3 | VECTOR, VECTOR_DISTANCE, CREATE VECTOR INDEX, FETCH APPROX/EXACT execute | orchestrator | DONE (CONTRACT, 3k rows) | TODO(evidence) |
| F4 | At 3,000 rows EXPLAIN shows TBSCAN+SORT for APPROX (index not chosen) | orchestrator | OBSERVED (CONTRACT) | TODO(evidence) |
| F5 | NEEDLE.ADV_RAW, ADV_DOC, ADV_ALIAS, ADV_AFFECTED exist; EMB is VECTOR(768) NOT NULL | data | OBSERVED 19:22 via SYSCAT | catalog query in README "Steps to verify" |
| F6 | `data/docs.jsonl` has 26,842 lines | data | OBSERVED 19:24 (`wc -l`) | file is gitignored |
| F7 | Db2 Text Search not configured in the image (SQL20427N / CIE0774E) | orchestrator | OBSERVED | `docs/evidence/text_search_probe.md` |
| F8 | G1 PASSED: at 26,210 ADV_DOC rows (vector index + RUNSTATS), `FETCH APPROX FIRST 10` uses IXSCAN on `VECIDX NEEDLE.ADV_DOC_VIX` for literal and bound query vectors; median 3.0 / 4.8 ms vs EXACT 71.7 / 72.3 ms (TBSCAN); APPROX-vs-EXACT top-10 overlap mean 0.995, min 0.90 (20 queries) | data | DONE | `docs/evidence/g1_vector_index.md` |
| F9 | `FETCH APPROX FIRST ? ROWS ONLY` (k as a parameter marker) does not use the index (TBSCAN) | data | DONE | `docs/evidence/g1_vector_index.md` |
| F10 | Plain `WHERE ROW_BUCKET < b` (not RCAC): index kept at b = 50/25/10, recall@10 vs filtered EXACT 0.905 / 0.840 / 0.750, APPROX returned as few as 5 of 10 rows; at b = 5 the optimizer switched to a table scan (recall 1.000) | data | DONE (20 queries) | `docs/evidence/g1_vector_index.md` |
| F11 | Same sweep under RCAC row permissions | eval / rcac | PENDING | - |
| D1 | Scaffolding drafted: README.md, architecture.md, submission.json, .env.example, LICENSE (Apache-2.0 text from GitHub licenses API), docker-compose.yml, scripts/setup_db.sh, scripts/run_all.ps1 | docs | DRAFT (numbers, screenshots, video, team name pending; marked `TODO(final)`) | files in folder |
| D2 | Official validator on a scratch clone (`python -X utf8 -I scripts/validate_submission.py`, 4 folders incl. `submissions/needle`) | docs | PASS at 19:37 on the draft (exit 0) | re-run at G6 with `run_all.ps1 -Step validate -Evidence` |
| D3 | `setup_db.sh --validate` against the Codespace container (wait marker, VECDB found, USERSPACE1 = 32768, EXPLAIN tables present; no DDL applied) | docs | PASS at 19:30 (exit 0) | console output in docs agent report |
| D4 | CLP honours `--#SET TERMINATOR @` under `db2 -tv -f` | docs | OBSERVED 19:36 | console output in docs agent report |
| D5 | Secret scan of the copied folder for the 7 `*PASSWORD` values in `.env` (file names only) | docs | 0 files at 19:38 | re-run before PR |
| R1-R13 | P0 requirements (section 4) | see section 4 | PLANNED | - |
| R14-R19 | P1 requirements | see section 4 | PLANNED | - |
| R20-R25 | P2 requirements | see section 4 | PLANNED | - |

---

## 1. Objective

- Ship NEEDLE to IBM Db2Hack 2026 before **05:00 CST, Tue 10 Nov 2026**.
- NEEDLE does permission-aware hybrid retrieval inside IBM Db2, applied to software-vulnerability triage.
- One SQL PL call (`NEEDLE.TRIAGE`) fuses a BM25 keyword rank (plain SQL) and a DiskANN vector rank
  (`FETCH APPROX`) with reciprocal rank fusion (RRF). Db2 row and column access control (RCAC) applies to both legs.
- A deterministic SQL join against service SBOMs (application-period temporal history) says which services are
  affected and since when. The LLM writes a cited summary. It decides nothing.
- Headline measurement: what Db2 row permissions (RCAC) do to the DiskANN access path: recall@10 against each
  user's own EXACT top-10, under-fill (fewer than k rows), plan sharing across users, and zero leaks, as a function of
  the fraction of rows a user may see; plus a router that restores recall. No IBM page and no hackathon entry
  documents this (see section 2.5). Hybrid keyword + vector fusion in SQL is **not** new (IBM db2-ai-cookbook).
- Success = a judge can run the quickstart, run the SQL in "Steps to verify", and see the same numbers we report.

---

## 2. Evidence

### 2.1 Rules (sources: `research/rules.md`, `research/devpost.md`)
- Submission = PR to `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` `main` **and** the PR URL in the Google Form.
  The site says: "a pull request alone does not complete your submission."
- Folder `submissions/needle/`. Branch `submission/needle`. PR title `[Submission] needle: <title>`.
  Commits `feat(needle): ...`. Slug regex `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Validator (`scripts/validate_submission.py`) needs `README.md`, `architecture.md`, `submission.json`,
  `.env.example` (each >= 20 bytes), no `.env`/key files, and six `submission.json` keys
  (`project.title`, `project.slug` = folder, `team.name`, `team.members` non-empty, `ibm_db2.edition`, `ibm_db2.connector`).
- On Windows run it as `python -X utf8 -I scripts/validate_submission.py` (cp1252 console crash otherwise).
- Fork CI runs stop at `action_required`. The local validator is the only check we get.
- Mandatory framework: at least one of LangChain, Haystack, CrewAI, LlamaIndex, Langflow. NEEDLE uses LangChain.
- Code must talk to Db2. "Mentioning Db2 only in the docs is ineligible."
- Disqualifiers: zero Db2 use, committed secrets, uncredited copying, changes outside our folder ("tampering").
- Also required by the site and Devpost rules: a LinkedIn post that tags the organising team.
- Devpost lists a demo video and screenshots under "must include". Unstop Round 2 marks PR URL, demo video link
  and screenshots as mandatory fields.

### 2.2 Rubrics (two are live; satisfy both)

| Row | Event site + SKILL.md (Nov 7) | Devpost /rules, Unstop, repo (Oct 29) | What scores it in NEEDLE |
|---|---|---|---|
| Db2 integration & depth | **25** | **30** | VECTOR + vector index + APPROX, BM25 in SQL, SQL PL, RCAC, BUSINESS_TIME, EXPLAIN evidence |
| Innovation & impact | **20** | **25** | RCAC-vs-ANN-recall finding + router; vague-advisory triage to affected services |
| Technical architecture & AI | **15** | **20** | Modular retriever, LangChain `BaseRetriever`, verifier on LLM output, `architecture.md` |
| Security | **15** | (no row) | RCAC, least-privilege users, bound SQL, closed statement set, prompt-injection test, no secrets |
| Reproducibility & code quality | **15** | **15** | docker-compose, `setup_db.sh`, frozen eval, pytest, validator |
| Documentation & presentation | **10** | **10** | No placeholders, screenshots, video, naming rules, clean commits |

### 2.3 Deadline facts and conflicts

| Source | Stated deadline | CST |
|---|---|---|
| Event site, Devpost /rules text, Unstop text, Luma | 10 Nov 2026, 5:00 PM IST | **05:30 CST Tue 10 Nov** |
| Devpost header and countdown | 10 Nov 2026, 7:00 PM IST | 07:30 CST |
| Unstop API round end | 2026-11-10T19:00+05:30 | 07:30 CST |
| Repo README (stale) | 29 Oct 2026 | past |

- Decision: the binding deadline is 05:30 CST. Our target is **05:00 CST** (30 min buffer). Code freeze is **02:30 CST**.
- Google Form conflict: four sources use `forms.gle/n8GQL4tg7Yzftwu39`. Luma calls a different form
  `forms.gle/ZjsLaFU5zAYJonwk9` the "Main Project Submission Form". Decision: fill **both**.

### 2.4 Judges and what they reward
- Judges (Devpost): Daya Nand, Dhruv Chaturvedi (event SPOC), Kunal Gola, Pawan Thakur, Keshav Maheshwari, Shaik Sadiq.
  All are IBM Db2 engineers (Lucknow).
- They write the connectors. Dhruv has open `langchain-ibm#342` (vector index `create_index()`).
  Geetika Chugh has open Haystack `#4086` (CREATE VECTOR INDEX). Neither changes the search path.
- Their stated philosophy (Dhruv's use-case spec): "Python proves the integration works. SQL proves what actually
  exists in Db2." and "The objective is reproducibility, not benchmark theatre."
- Dhruv's review comments on a contributor PR: committed credentials are the "highest-priority issue";
  close connections in `finally`; make ingestion repeatable; report Top-1 and Top-3 separately;
  "return a non-zero exit code when a defined evaluation threshold fails"; label hand-made relevance labels.
- Predicted rewards (INFERENCE, `research/organizers.md` section 6): Db2 doing the work provably (DDL in
  `architecture.md`, validation SQL); correct connector use with known limits handled; small honest evals;
  security hygiene; a minimal design with a clear "why Db2".
- Predicted penalties: Db2 as a blob store, secrets, string-built SQL, inflated metrics, template placeholders,
  files outside the folder, missing video or screenshots.

### 2.5 Competition (50 PRs at 18:30 CST; `research/competition.md`, `research/redteam.md`)
- **#49 AsOf (A+)**: the deepest Db2 use. It has VECTOR + CREATE VECTOR INDEX + an APPROX vs EXACT benchmark
  (1k-100k synthetic 384-dim vectors under Rosetta; 100k rows: exact p50 143.0 ms, approx 7.7 ms, recall@10 0.95;
  index chosen from 20k rows; recall 0.73 with a 50% date filter; `FETCH APPROX FIRST ? ROWS` never uses the index).
  Its serving path uses `FETCH EXACT`. Its RCAC is column masks on a ledger. It has **no row permission on a
  vector table, no filtered-ANN measurement under RCAC, and no keyword search.**
- **#30 Custodian (A)**: RCAC masks and permissions per user, system-period temporal, EXPLAIN blast radius,
  DB2VS vectors. Agent-governance framing. It lists DB2VS post-filtering as roadmap. It did not measure it.
- **#36 MetricGuard (A)**: typed plan, deterministic SQL compile, SELECT-only account, video. No VECTOR/JSON/RCAC.
- **#8 bakebox (B)**: RRF of Db2 vector + Python BM25/TF-IDF. Fusion happens in Python.
- Field census: no entry fuses ranks inside one SQL statement. No entry does SBOM, CVE or OSV triage.
  No entry measures ANN recall under row permissions. Db2 Text Search works in no entry.

Prior art outside the hackathon (verified 19:50):
- IBM's own `IBM/db2-ai-cookbook` (Apache-2.0), recipe `03-hybrid-search/sql-fusion-local-models`, already fuses
  BM25 (Db2 Text Search, OpenSearch-backed) and native vector search in **one SQL query**. Its README calls the
  fusion a "gated, score-normalized weighted sum ... **not** plain RRF". https://github.com/IBM/db2-ai-cookbook
- So "hybrid search in Db2 SQL" is not our claim. We cite the cookbook.

Why NEEDLE differs (our contribution, in priority order):
1. **Measured RCAC x vector-index behaviour**: recall@10 against each user's own EXACT top-10, under-fill,
   plan sharing across users (package cache), and zero leaks, on real 768-dim text embeddings on native x86;
   plus a router evaluated on held-out queries. We **extend** #49's unfiltered and single-filter result and cite it.
2. **BM25 in plain SQL with a parity test** against a Python reference. It works where Db2 Text Search is not
   configured (the CE image) and it sits under the same row permission as the vector leg. RRF instead of a
   score-normalized sum.
3. **Temporal SBOM exposure**: exact version join + `BUSINESS_TIME` deploy history (valid time) = "exposed since".
4. **Connector findings** for the judges' own connectors: `langchain-db2` filters after top-k in Python;
   `ibm-db-haystack` binds k as a parameter marker, and G1 shows a parameter-marker k never uses the index (F9).
5. Open domain: no SBOM/advisory entry among the 50 PRs.

---

## 3. Product

### 3.1 Problem
- A security report often arrives before it has a package name, a CVE or a version range:
  a chat message, a mailing-list post, a vendor bulletin that names a product.
- A triager must search advisories by meaning (vague text) and by identifier (CVE, GHSA, `yaml.full_load`) at once.
  Keyword search misses paraphrases. Vector search misses exact identifiers.
- Embargoed advisories must stay hidden from people without clearance. Filtering after retrieval
  (what `langchain-db2` does in Python) silently returns fewer than k results, or none.
- The real question is not "which advisory" but "which of our services run an affected version, and since when".
  That answer must be deterministic, not generated.

### 3.2 Personas

| Persona | Job | Moment of value |
|---|---|---|
| PSIRT / on-call triager (senior, embargo clearance) | Map a vague report to advisories and affected services fast | Paste chat text, see the right advisory group at rank 1-3 and "N services, exposed since D" |
| Junior analyst or contractor (no embargo clearance) | Same search, least privilege | Same query; embargoed advisories never appear, and recall on what they may see does not drop |
| Service owner | Know if their service is affected | AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE per component, never "SAFE" |
| Db2 RAG developer (connector user) | Retrieval that honours Db2 permissions without losing recall | `Db2HybridRetriever` on their own connection; router picks APPROX depth or EXACT |
| Judge / reviewer | Verify claims | Runs quickstart and the SQL in "Steps to verify"; reads EXPLAIN evidence |

### 3.3 User journeys
- **UJ1 Vague report.** Triager pastes "the yaml loader everyone uses runs python code from a crafted file if you
  call the full loader". NEEDLE shows keyword, vector and hybrid ranks side by side, then affected services.
- **UJ2 Identifier lookup.** Triager pastes `CVE-2020-1747`. The keyword leg ranks the alias group first.
- **UJ3 Least privilege.** Same query as `NDL_JUNIOR`. Embargoed rows are absent. `SELECT COUNT(*)` equals the
  public count. POSTING returns no embargoed IDs. Db2 enforces it, not the app.
- **UJ4 Developer.** A LangChain app calls `Db2HybridRetriever.invoke(q)` on the caller's own Db2 connection.
  The router keeps recall@10 near the unfiltered level at each visible fraction (target; UNKNOWN until measured).
- **UJ5 Judge.** `docker compose up -d` -> `scripts/setup_db.sh` -> load -> eval -> "Steps to verify" SQL.

### 3.4 The killer 30-second demo (numbers are placeholders until measured)

| Time | Screen | Proof shown |
|---|---|---|
| 0-6 s | Paste the vague YAML-loader chat message (no package name, no ID) | Real input |
| 6-13 s | Three columns: keyword / vector / hybrid, with each leg's rank for the true alias group | Actual ranks from `NEEDLE.TRIAGE` |
| 13-20 s | "N services affected, exposed since D" from the SBOM BUSINESS_TIME join; AFFECTED vs NOT_CONFIRMED | Deterministic SQL rows |
| 20-25 s | Switch user to `NDL_JUNIOR`; the embargoed advisory disappears; counts come from Db2 | RCAC |
| 25-30 s | Figure 1: recall@10 vs visible fraction; router line vs plain APPROX and post-filter | Measured JSON |

Rule: if the chosen query does not show a hybrid win, show the real result and pick another query only from the
pre-declared demo list. Disclose the selection in the README.

---

## 4. Requirements

Status of every row: PLANNED. "Rubric" names the row each requirement scores (event-site names).

### 4.1 P0 (must ship)

| ID | Requirement | Acceptance criteria (all must hold, with evidence) | Rubric | Owner |
|---|---|---|---|---|
| R1 | Live Db2 schema | `db2level` = 12.1.5.0 and USERSPACE1 PAGESIZE 32768 saved to `docs/evidence/db2level.txt`; all NEEDLE objects listed by the SYSCAT queries in README | Db2 | orchestrator |
| R2 | Idempotent OSV ingest | ADV_RAW keeps raw JSON + SHA-256 for all 26,842 records; ADV_DOC has one row per non-withdrawn record; a second run changes no counts; counts saved to evidence | Db2, Repro | data |
| R3 | Vector index on the full corpus | `ADV_DOC_VIX` built after load; RUNSTATS done; EXPLAIN of a literal-k `FETCH APPROX FIRST 10` at full size saved; "index chosen" recorded as yes or no (both are results) | Db2 | data |
| R4 | BM25 in SQL | POSTING / TERM_DF / CORPUS_STATS loaded; SQL top-10 equals a Python reference of the same formula for 50 queries (`tests/test_bm25_parity.py`, `@pytest.mark.db`) | Db2, Repro | bm25 |
| R5 | `NEEDLE.TRIAGE` fusion | One CALL returns (ADV_ID, RRF, KW_RANK, VEC_RANK, VEC_DIST); vector and terms are bound; k and depth are validated integers (1..1000) and the only interpolated values; db2exfmt plan of the vector leg saved | Db2, Arch, Sec | bm25 |
| R6 | RCAC | Users NDL_SENIOR, NDL_JUNIOR, NDL_P10/P25/P50/P75 exist; permissions on ADV_DOC and POSTING; mask on DETAILS; GRANT SELECT/EXECUTE only; leak tests as NDL_JUNIOR return 0 embargoed IDs from every granted table | Sec, Db2 | rcac |
| R7 | RCAC recall sweep + router | At least visible fractions 100/50/25/10% (more if time); per cell: ann_recall@10, mean rows returned, short-result count, p50/p95 ms, index used (EXPLAIN), forbidden-ID count = 0; JSON + Figure 1 in `eval/results/` | Innovation, Db2 | eval |
| R8 | Retrieval eval | Frozen query files with `.sha256`; per-slice relevance recall@10 and MRR@10 for keyword / vector / hybrid; Top-1 reported separately; thresholds declared before the test run; script exits non-zero if a threshold fails | Arch, Repro, Innovation | eval |
| R9 | LangChain retriever | `Db2HybridRetriever(BaseRetriever)` calls `NEEDLE.TRIAGE` on the caller's own connection; one test and the demo execute it (not only import it) | Arch (eligibility) | app |
| R10 | SBOM applicability | Exact join of PEP 503 package name + normalized version against ADV_AFFECTED; states AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE; the word SAFE never appears; fixture test for each state | Innovation | app |
| R11 | Security baseline | No secrets in the folder; all SQL bound; query length and term caps; `.env.example` only; least-privilege app user; threat list in section 5.8 tested where marked | Security | all |
| R12 | Tests | >= 10 Db2-free unit tests pass; DB tests marked `@pytest.mark.db`; full pytest output in `docs/evidence/pytest.txt` | Repro | all |
| R13 | Submission package | README, architecture.md, submission.json, .env.example, LICENSE, screenshots, video link; validator exit 0 output saved; no `TODO` left | Docs | docs |

### 4.2 P1 (ship if P0 is green by its gate)

| ID | Requirement | Acceptance criteria | Rubric | Owner |
|---|---|---|---|---|
| R14 | Exposure window | SBOM_COMPONENT with `PERIOD BUSINESS_TIME`; "exposed since" from the latest contiguous run of affected versions; fixture test | Db2, Innovation | app |
| R15 | Cited LLM summary + verifier | qwen3:14b via LangChain (`temperature 0`); JSON output; verifier drops every advisory, package or service ID not in the SQL results; planted prompt-injection advisory (SYNTHETIC, labelled) does not change output fields | Security, Arch | app |
| R16 | Streamlit app | One page: query box, user switch, three rank columns, affected services, Figure 1; shows only measured values, else "Not measured" | Docs | app |
| R17 | Connector evidence note | EXPLAIN of a DB2VS-style query (nullable column, no APPROX, inlined k) and of a Haystack-style `FETCH FIRST ? ROWS` query; `docs/evidence/connectors.md` with minimal suggested diffs. No upstream PR or comment without user approval | Innovation, Db2 | eval |
| R18 | Ollama-free reproduction | Small frozen sample (about 2k docs) + embeddings committed under `eval/fixtures/`; quickstart "sample mode" runs without Ollama (index likely not chosen at this size; stated) | Repro | data |
| R19 | Clean-host setup | `docker compose up` + `scripts/setup_db.sh` run end to end on a fresh Linux Docker host (a second Codespace counts); log saved | Repro | orchestrator |

### 4.3 P2 (only after the P1 gate)

| ID | Requirement | Rubric |
|---|---|---|
| R20 | Haystack `@component` wrapper over `NEEDLE.TRIAGE` | Arch |
| R21 | `SEARCH_LIST_SIZE` cells through embedded OPTGUIDELINES (timebox 15 min) | Db2, Innovation |
| R22 | Plan sharing across users via `MON_GET_PKG_CACHE_STMT` + `EXPLAIN_FROM_SECTION` — **PROMOTED to P1 at 19:50** (it is the headline thesis: one shared plan for all RCAC users; see `research/consult_claude_ai_round2.md`) | Db2, Innovation |
| R23 | Correlated-filter sweep (KIND or ecosystem as tenant) beside the random-bucket sweep | Innovation |
| R24 | CycloneDX JSON import of real SBOM files | Innovation |
| R25 | Paired bootstrap 95% CI for hybrid-vs-best-leg recall difference | Innovation, Repro |

### 4.4 Forbidden false-success states (adopted from the ChatGPT pack, adapted)
1. A mocked or SQLite test called "Db2 integration".
2. `FETCH APPROX` executed and DiskANN claimed without EXPLAIN evidence of index use.
3. ANN fidelity (APPROX vs EXACT overlap) reported as relevance recall, or the reverse.
4. A service marked AFFECTED from semantic similarity. Only the exact version join decides AFFECTED.
5. NOT_CONFIRMED or UNKNOWN_COVERAGE shown as "safe".
6. Synthetic fixtures (fleet, embargo flags, injection advisory, paraphrased queries) presented as real data.
7. A chart or latency number without a run JSON behind it.
8. LangChain imported but not executed in the demo path.
9. "Submitted" said before the PR exists and both form confirmations are seen.
10. Index use inferred from timing alone.

---

## 5. Architecture

### 5.1 Components (paths per CONTRACT.md)

| Component | Path | Job |
|---|---|---|
| Config | `src/needle/config.py` | Load `needle/.env` with python-dotenv; fail with a clear message if a key is missing |
| Db access | `src/needle/db.py` | `ibm_db` connect per user; parameterised execute; close in `finally` |
| Tokenizer | `src/needle/tokenize.py` | Identifier-preserving tokens (`log4j-core`, `cve-2021-44228`, `yaml.full_load`); no stemming |
| Ingest | `src/needle/ingest_osv.py` | OSV JSON -> `data/docs.jsonl`; alias union-find -> CANON_ID; ROW_BUCKET = sha256(CANON_ID) mod 100 |
| Embed | `src/needle/embed.py` | Ollama nomic-embed-text, 768 dims, prefixes `search_document: ` / `search_query: ` |
| Loader | `scripts/load_in_codespace.py` | Bulk insert inside the Codespace (never through the tunnel) |
| BM25 | `src/needle/bm25.py`, `sql/02_bm25.sql` | Postings + df + stats; Python reference for parity |
| Triage | `sql/03_triage_proc.sql`, `src/needle/triage.py` | `NEEDLE.TRIAGE` and its caller |
| RCAC | `sql/04_rcac.sql`, `src/needle/rcac.py` | USER_ACCESS, permissions, mask, grants; leak checks |
| SBOM | `sql/05_sbom_temporal.sql`, `src/needle/sbom.py` | SERVICE, SBOM_COMPONENT (BUSINESS_TIME), applicability join |
| Retriever | `src/needle/retriever.py` | LangChain `Db2HybridRetriever(BaseRetriever)` + router |
| LLM + verifier | `src/needle/llm_summary.py`, `src/needle/verify.py` | Cited JSON summary; ID allow-list check |
| App | `src/needle/app.py` | Streamlit page |
| Eval | `eval/*.py` | Query build, retrieval eval, RCAC sweep, figures |

### 5.2 Data flow
1. Ingest (offline): OSV PyPI zip -> `ingest_osv` -> `docs.jsonl` + `raw.jsonl.gz` -> `embed` (Windows GPU) ->
   copy one compressed file to the Codespace -> loader inserts ADV_RAW, ADV_DOC, ADV_ALIAS, ADV_AFFECTED, POSTING,
   TERM_DF, CORPUS_STATS -> post-load: CREATE VECTOR INDEX + RUNSTATS.
2. Query: text -> tokenizer (terms as one JSON array) + Ollama embedding (`search_query: ` prefix) ->
   `CALL NEEDLE.TRIAGE(?, ?, k, depth)` on the **user's own connection** -> RCAC applies inside Db2 ->
   fused rows -> collapse to CANON_ID.
3. Applicability: top advisory groups -> `ADV_AFFECTED` x `SBOM_COMPONENT` exact join (FOR BUSINESS_TIME AS OF
   CURRENT DATE) -> AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE -> exposure window.
4. Summary (optional): rows -> LLM -> verifier -> UI. The UI shows the SQL rows even if the LLM is off.

### 5.3 Db2 schema (CONTRACT.md is the source of truth; NEEDLE schema)
- Data: `ADV_RAW(ADV_ID PK, RAW CLOB(2M), SHA256, LOADED_AT)`;
  `ADV_DOC(ADV_ID PK, CANON_ID, KIND, SUMMARY, DETAILS CLOB(1M), PACKAGES, PUBLISHED, MODIFIED, WITHDRAWN, CVSS,
  DOC_LEN, ROW_BUCKET 0-99, EMBARGO_UNTIL, EMB VECTOR(768, FLOAT32) NOT NULL)`;
  `ADV_ALIAS(ADV_ID, ALIAS)`; `ADV_AFFECTED(ADV_ID, ECOSYSTEM, PACKAGE, VERSION)` with index (PACKAGE, VERSION).
- Vector index: `CREATE VECTOR INDEX NEEDLE.ADV_DOC_VIX ON NEEDLE.ADV_DOC (EMB) WITH DISTANCE COSINE` after load.
- Keyword: `POSTING(TERM, ADV_ID, TF, ROW_BUCKET, EMBARGO_UNTIL) PK(TERM, ADV_ID)`; `TERM_DF(TERM PK, DF)`;
  `CORPUS_STATS(N, AVGDL)`.
- RCAC: `USER_ACCESS(AUTHID PK, MAX_BUCKET, SEES_EMBARGO)`.
- Fleet: `SERVICE(SERVICE_ID PK, NAME, OWNER_TEAM)`;
  `SBOM_COMPONENT(SERVICE_ID, PACKAGE, VERSION, BUS_START, BUS_END, PERIOD BUSINESS_TIME (BUS_START, BUS_END))`.
- Eval (optional): `EVAL_RUN`, `EVAL_RESULT`.
- Load order constraint: `sql/01_schema.sql` splits at `-- @POST_LOAD`. Pre-load parts run first, post-load parts
  (vector index, RUNSTATS) run once after the load. `scripts/setup_db.sh --phase pre|post` follows this.

### 5.4 RCAC model
- Visibility of a row for user U: `ROW_BUCKET < U.MAX_BUCKET` AND (`EMBARGO_UNTIL IS NULL` OR
  `EMBARGO_UNTIL <= CURRENT TIMESTAMP` OR `U.SEES_EMBARGO = 1`).
- ROW_BUCKET comes from a hash of CANON_ID, so it is independent of content, and all aliases share one bucket.
  Visible fraction s = MAX_BUCKET / 100.
- Embargo lifts by time. No DML touches the indexed table to lift it.
- EMBARGO_UNTIL is a **simulated** attribute. OSV has no embargo field. NEEDLE sets it on a declared set of rows.
- Users: NDL_SENIOR (100, 1), NDL_JUNIOR (100, 0), NDL_P75/P50/P25/P10 (75/50/25/10, 0). The sweep may also set a
  bench user's MAX_BUCKET to 5, 2, 1 (USER_ACCESS is not the indexed table).
- Draft DDL (UNVERIFIED; the rcac owner writes the real file):

```sql
CREATE PERMISSION NEEDLE.ADV_DOC_ROWS ON NEEDLE.ADV_DOC
  FOR ROWS WHERE EXISTS (
    SELECT 1 FROM NEEDLE.USER_ACCESS U
    WHERE U.AUTHID = SESSION_USER
      AND NEEDLE.ADV_DOC.ROW_BUCKET < U.MAX_BUCKET
      AND (NEEDLE.ADV_DOC.EMBARGO_UNTIL IS NULL
           OR NEEDLE.ADV_DOC.EMBARGO_UNTIL <= CURRENT TIMESTAMP
           OR U.SEES_EMBARGO = 1))
  ENFORCED FOR ALL ACCESS ENABLE;
ALTER TABLE NEEDLE.ADV_DOC ACTIVATE ROW ACCESS CONTROL;
-- Same pattern on NEEDLE.POSTING (it carries ROW_BUCKET and EMBARGO_UNTIL).
CREATE MASK NEEDLE.ADV_DOC_DETAILS ON NEEDLE.ADV_DOC FOR COLUMN DETAILS RETURN
  CASE WHEN NEEDLE.ADV_DOC.EMBARGO_UNTIL IS NULL
         OR NEEDLE.ADV_DOC.EMBARGO_UNTIL <= CURRENT TIMESTAMP
         OR EXISTS (SELECT 1 FROM NEEDLE.USER_ACCESS U WHERE U.AUTHID = SESSION_USER AND U.SEES_EMBARGO = 1)
       THEN DETAILS ELSE CAST(NULL AS CLOB(1M)) END
  ENABLE;
ALTER TABLE NEEDLE.ADV_DOC ACTIVATE COLUMN ACCESS CONTROL;
GRANT SELECT ON NEEDLE.ADV_DOC TO USER NDL_JUNIOR;  -- and the other analyst users; plus EXECUTE on NEEDLE.TRIAGE
```

- The mask is defense in depth. With the permission active, a user without SEES_EMBARGO never sees an embargoed row.
- Facts to check in the gate probes (UNVERIFIED): a subquery inside CREATE PERMISSION; INSERT under an active
  permission must satisfy it (SQL20471N risk), so the loader user needs a USER_ACCESS row or activation after load;
  activation before or after the vector index build; index use with a permission active.

### 5.5 TRIAGE fusion SQL

**Actual design (OBSERVED in `sql/03_triage_proc.sql` at 19:45; run status: see BUILD_STATUS):**
- `NEEDLE.BM25_SEARCH(P_QTERMS, P_DEPTH)` is an inline SQL table function: the one copy of the BM25 SQL
  (BM25Okapi IDF with an epsilon floor, at most 64 query terms, lowest DF first).
- Terms are one JSON array, expanded with `SYSTOOLS.JSON_TABLE(SYSTOOLS.JSON2BSON(...))`. The ISO `JSON_TABLE` in
  12.1.5 accepts only the row path `strict $` (SQL0104N), so it cannot expand an array.
- `NEEDLE.TRIAGE_MODE(..., P_MODE)` runs the APPROX vector leg as a bare dynamic SELECT with a literal depth,
  stores its rows in the declared temporary table `SESSION.NDL_TRIAGE_VEC` (table space `NEEDLE_UTMP`), then fuses
  both legs in one statement (`RANK()` with ADV_ID tie-break, `FULL OUTER JOIN`, RRF k = 60).
- `NEEDLE.TRIAGE` = `TRIAGE_MODE(..., 'HYBRID')` (contract signature). k and depth are validated integers 1..1000.
- So the claim is "one procedure call; the fusion is one statement", not "one statement end to end".

**Original draft (kept for reference; superseded by the file above):**
- BM25: `idf = LN(1 + (N - df + 0.5) / (df + 0.5))`, `k1 = 1.2`, `b = 0.75`. The Python reference uses the same formula.
- RRF: `score = sum over legs of 1 / (60 + rank)`. Ties break on ADV_ID.
- `k` in {5, 10, 20}; `depth` in {50, 100, 200, 500, 1000}. Both are validated integers, then written as literals
  (a parameter-marker `FETCH APPROX FIRST ? ROWS` never uses the index, per #49). Everything else is bound.

```sql
-- Statement text built inside the procedure from validated integers only; markers: 1 = terms JSON, 2 = query vector.
WITH QT (TERM) AS (
  SELECT DISTINCT J.TERM
  FROM JSON_TABLE(CAST(? AS CLOB(32K)), 'strict $[*]' COLUMNS (TERM VARCHAR(128) PATH '$')) AS J   -- syntax UNVERIFIED
), VEC AS (
  SELECT D.ADV_ID, VECTOR_DISTANCE(D.EMB, VECTOR(CAST(? AS CLOB(100K)), 768, FLOAT32), COSINE) AS DIST
  FROM NEEDLE.ADV_DOC D
  ORDER BY DIST
  FETCH APPROX FIRST 100 ROWS ONLY                       -- literal depth from the ladder
), VR AS (
  SELECT ADV_ID, DIST, ROW_NUMBER() OVER (ORDER BY DIST, ADV_ID) AS R FROM VEC
), KW AS (
  SELECT P.ADV_ID,
         SUM(LN(1 + (S.N - F.DF + 0.5) / (F.DF + 0.5))
             * (P.TF * 2.2) / (P.TF + 1.2 * (0.25 + 0.75 * D.DOC_LEN / S.AVGDL))) AS BM25
  FROM QT
  JOIN NEEDLE.POSTING P ON P.TERM = QT.TERM
  JOIN NEEDLE.TERM_DF F ON F.TERM = QT.TERM
  JOIN NEEDLE.ADV_DOC D ON D.ADV_ID = P.ADV_ID
  CROSS JOIN NEEDLE.CORPUS_STATS S
  GROUP BY P.ADV_ID
  ORDER BY BM25 DESC, P.ADV_ID
  FETCH FIRST 100 ROWS ONLY
), KR AS (
  SELECT ADV_ID, ROW_NUMBER() OVER (ORDER BY BM25 DESC, ADV_ID) AS R FROM KW
), U AS (
  SELECT ADV_ID, 1.0E0 / (60 + R) AS C, R AS VEC_RANK, CAST(NULL AS BIGINT) AS KW_RANK, DIST FROM VR
  UNION ALL
  SELECT ADV_ID, 1.0E0 / (60 + R), CAST(NULL AS BIGINT), R, CAST(NULL AS DOUBLE) FROM KR
)
SELECT ADV_ID, SUM(C) AS RRF, MIN(KW_RANK) AS KW_RANK, MIN(VEC_RANK) AS VEC_RANK, MIN(DIST) AS VEC_DIST
FROM U
GROUP BY ADV_ID
ORDER BY RRF DESC, ADV_ID
FETCH FIRST 10 ROWS ONLY;                                -- literal k from the ladder
```

- `UNION ALL` + `GROUP BY` replaces a `FULL OUTER JOIN` (simpler; same result).
- Term input fallbacks, in order, if `JSON_TABLE` fails (CONTRACT: one attempt gave SQL0104N):
  (a) the documented Db2 12.1 JSON_TABLE form; (b) `XMLTABLE` over `fn:tokenize` of a space-joined bound string;
  (c) a declared global temporary table filled by bound inserts on the same connection.
- Fallback if APPROX is ignored inside the CTE: the procedure inserts the APPROX top-depth into a DGTT, then fuses.
  Then we claim "one procedure call", not "one statement".
- Known leak: TERM_DF and CORPUS_STATS count embargoed rows, so df can reveal that a rare term exists.
  Mitigation: compute them over non-embargoed rows, or document the residual (decision for the bm25 owner).

### 5.6 Temporal SBOM and applicability
- The fleet is **SYNTHETIC** (about 20 fictional services) with deploy history. It is labelled in data and UI.
- Package names use PEP 503 normalization. Versions use `packaging.version` canonical strings at ingest.
- AFFECTED: the (package, version) pair is in ADV_AFFECTED for that advisory.
  NOT_CONFIRMED: the package matches, the advisory enumerates versions, and the installed version is not listed.
  UNKNOWN_COVERAGE: the advisory has no enumerated versions (ranges only; 26,842 - 19,931 = 6,911 records lack them).
- `BUSINESS_TIME` is **valid time**: the period in which a service actually ran a version, as the application
  states it. It is not discovery time and not SYSTEM_TIME. "Exposed since" = the start of the valid-time interval in
  which the service ran an affected version. "First known to us" would need an ingest or event timestamp; NEEDLE
  does not claim it.
- "Exposed since": for a service affected AS OF CURRENT DATE, the BUS_START of the earliest row in the latest
  unbroken chain of affected versions (gaps-and-islands with LAG over BUS_START). Draft core query:

```sql
SELECT S.SERVICE_ID, S.NAME, C.PACKAGE, C.VERSION, A.ADV_ID
FROM NEEDLE.SBOM_COMPONENT FOR BUSINESS_TIME AS OF CURRENT DATE AS C
JOIN NEEDLE.SERVICE S ON S.SERVICE_ID = C.SERVICE_ID
JOIN NEEDLE.ADV_AFFECTED A ON A.PACKAGE = C.PACKAGE AND A.VERSION = C.VERSION
WHERE A.ADV_ID IN (SELECT ADV_ID FROM NEEDLE.ADV_DOC WHERE CANON_ID = ?);
```

### 5.7 LangChain, LLM and verifier
- `Db2HybridRetriever(BaseRetriever)`: fields `conn_factory` (user's own connection), `k`, `router`.
  `_get_relevant_documents(query)` -> tokenize + embed -> router picks (APPROX, depth) or EXACT -> CALL -> Documents
  with metadata (adv_id, canon_id, kw_rank, vec_rank, rrf).
- Router (PLANNED; code owner app/eval, `src/needle/rcac.py`): visible_n = `SELECT COUNT(*) FROM NEEDLE.ADV_DOC`
  as the session user (RCAC applies; cached per session); s = visible_n / N, with N from an admin statistics row
  (never an unauthorized count query by the user). If visible_n <= T -> EXACT. Else APPROX with
  k' = bucket(ceil(10 / s x m)) in {10, 25, 50, 100, 200} (literal), optionally L = max(50, 3k') by guideline,
  then take the top 10. If fewer than 10 rows come back -> EXACT fallback. Five fixed statement texts keep the
  package cache clean. T and m are fitted on the dev split. The router chooses per call, so a plan shared across
  users cannot pick the wrong path for a low-visibility user.
- LLM: `ChatOllama(model="qwen3:14b", temperature=0)`. Input: SQL rows in delimited blocks marked as untrusted data.
  Output: JSON `{summary, citations[]}`.
- Verifier: every advisory ID, package and service ID in the output must appear in the SQL result set.
  Unknown IDs are removed and counted. If the LLM fails or times out, a deterministic template summary is shown.

### 5.8 Security model and threat list

| # | Threat | Control | Test |
|---|---|---|---|
| T1 | SQL injection via query text | Text never reaches SQL text; terms are one bound JSON parameter; closed statement set | Unit: `x' OR 1=1 --` as a query returns normal results; DB test |
| T2 | Prompt injection in advisory text | Advisory text delimited as data; LLM decides nothing; verifier ID allow-list | Planted SYNTHETIC advisory with instructions; output fields unchanged |
| T3 | Embargo leak via side tables | Permission on ADV_DOC and POSTING; ADV_RAW, ADV_ALIAS, ADV_AFFECTED not granted to analysts (or permissioned) | Leak test per granted table as NDL_JUNIOR |
| T4 | df/stats side channel | Stats over non-embargoed rows, or documented residual | Review |
| T5 | Embedding inversion of embargoed rows | EMB is in ADV_DOC under the row permission | Leak test |
| T6 | LLM invents IDs | Verifier removes them; count shown | Unit test with a fake LLM output |
| T7 | Oversized input | Query <= 4,000 chars; <= 64 distinct terms; k and depth from the ladder | Unit tests |
| T8 | Untrusted OSV and SBOM files | Parsed as JSON only; no URL fetch; no shell | Code review |
| T9 | Secrets | `.env` never committed; `.env.example` placeholders; validator + `git diff --cached --name-only` check | Pre-PR checklist |
| T10 | Over-privileged app user | Analysts get SELECT + EXECUTE only; db2inst1 used only for setup and load | SYSCAT.TABAUTH query |
| T11 | Connection leaks | Every connection closed in `finally` | Code review |
| T12 | Unauthorized rows in the session temporary table | RCAC does not cascade into a declared temporary table created from a fullselect. `SESSION.NDL_TRIAGE_VEC` has explicit columns and is filled only by the caller's own RCAC-filtered vector query | DB test: as NDL_JUNIOR, TRIAGE never returns an embargoed ID |
| T13 | Cross-user cache spill in Streamlit | One connection per selected user; no global `st.cache_data` of results; any cache key includes the user | Switch users in one session; no carry-over |
| T14 | Procedure runs with more privilege than the caller | Permission keys on SESSION_USER (the connected user), not the routine owner | Leak test through `CALL NEEDLE.TRIAGE` as each user |

---

## 6. Verification

### 6.1 Test matrix (PLANNED; none run yet)

| ID | Level | Assertion |
|---|---|---|
| UT01 | unit | Tokenizer keeps `cve-2021-44228`, `log4j-core` and its parts, `yaml.full_load`; drops > 128 chars |
| UT02 | unit | RRF at ranks 1 and 10; ties break on ADV_ID; one-leg-only items are not dropped |
| UT03 | unit | k and depth outside the ladder are rejected before SQL |
| UT04 | unit | Query vector length 767/769, NaN, all-zero are rejected |
| UT05 | unit | Router picks EXACT at low visibility and the right depth at s = 100/20/5% |
| UT06 | unit | Applicability: AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE fixtures; "SAFE" never produced |
| UT07 | unit | Verifier removes an invented GHSA ID and keeps a real one |
| UT08 | unit | Metrics: recall@10 vs alias groups; MRR; ann_recall@10 vs EXACT; empty-denominator handling ("N/A (0 evaluated)") |
| UT09 | unit | PEP 503 names and version normalization |
| UT10 | unit | Query and term caps |
| DB01 | db | db2level 12.1.5; USERSPACE1 32K |
| DB02 | db | Row counts match `docs.jsonl` (non-withdrawn) |
| DB03 | db | BM25 parity with the Python reference (50 queries) |
| DB04 | db | TRIAGE returns k rows with both ranks for a known query |
| DB05 | db | As NDL_JUNIOR: 0 embargoed IDs from ADV_DOC, POSTING, TRIAGE; COUNT = public count |
| DB06 | db | `x' OR 1=1 --` bound as data |
| DB07 | db | Retriever `invoke()` returns Documents from Db2 |
| DB08 | db | Exposure-window query on the fixture fleet |

### 6.2 Eval design (frozen slices)
- Corpus: all non-withdrawn PyPI records in ADV_DOC (all kinds; KIND is reported). Ground truth unit = alias group
  (CANON_ID). Results collapse to CANON_ID before scoring.
- Slices as built by the eval owner (OBSERVED 19:40: `eval/queries/*.jsonl`, 150 queries each, seed 20261109,
  `.sha256` + `.manifest.json` per slice, built from `docs.jsonl` sha256 `b66b2af5...`, GHSA/PYSEC groups only):
  - **named** (real): the advisory summary as written, kept only when it contains an affected package name.
  - **masked** (real text, edited): summary + first part of details, package names replaced by "a popular library".
    Near-circular against the same text (redteam A5). Report it; never use it as the headline.
  - **paraphrase** (synthetic, labelled): an LLM rewrites the advisory as chat talk without names or IDs.
    Queries sharing a 6-word run with the target are dropped (1 dropped, `paraphrase.dropped.jsonl`).
  - Optional **ident** slice (CVE ID only) if time allows.
- Tuning (RRF depth, router T) uses a declared dev subset only. The frozen files never change after the first
  scored run (`build_queries.py --verify` checks the hashes).
- Metrics (from `eval/run_eval.py`): RELEVANCE family = recall@1/3/10 (share of queries with a ground-truth
  adv_id in the top k; ground truth = all non-withdrawn adv_ids with the query's canon_id), MRR@10,
  set_recall@10 (secondary). ANN-FIDELITY family for the RCAC experiment: `ann_recall@10` =
  |APPROX top-10 ∩ EXACT top-10| / |EXACT top-10|. The two families are never mixed.
- Retrievers compared: bm25, exact, approx, rrf_client, triage, db2vs-style, plus over-fetch variants.
- Gate: `run_eval.py` has `--gate-retriever` / `--gate-min` and exits non-zero on failure. The threshold is set
  before the test run. Any change after a test run goes in the Decision log.
- Expectation (not a claim): vector wins VAGUE, keyword wins IDENT, hybrid has the best worst slice.

### 6.3 Headline experiment: ANN recall under RCAC
- Precondition: the vector index is chosen at full corpus (gate G1). If not, run the same sweep with EXACT and
  DB2VS-style post-filter, and report index non-selection with EXPLAIN.
- Two stages (eval owner, `eval/rcac_sweep.py synth-load | explain | sweep`, runs inside the Codespace):
  (1) de-risk on a synthetic table `NDL_DEV_RCAC.VEC_SYN` (30k clustered 768-dim vectors);
  (2) the headline run on `NEEDLE.ADV_DOC` with real nomic embeddings. The README states which table each number
  comes from. A synthetic-only result is labelled synthetic.
- Users or bench grants give visible fractions s in {100, 75, 50, 25, 10} and, if time, {5, 2, 1}.
- For each s, 100 frozen queries (VAGUE + IDENT test vectors), as that user:
  1. `FETCH EXACT FIRST 10` = truth (the permitted top-10).
  2. No keyword (optimizer choice).
  3. `FETCH APPROX FIRST 10`.
  4. Over-fetch ladder: APPROX 50 / 200 / 1000 in a subquery, outer top-10.
  5. Router.
  6. DB2VS-style: unfiltered top-10 as admin, then filter in Python to the user's visible set.
- Record per cell: ann_recall@10, mean rows returned, count of short results (< 10), p50/p95 ms (3 warm-ups),
  index used (EXPLAIN once per cell), forbidden IDs returned (must be 0).
- What G1 already shows with a plain `WHERE` (F10): the index stays in the plan at 50/25/10% visibility, recall@10
  falls to 0.905 / 0.840 / 0.750, and APPROX returns as few as 5 of 10 rows; at 5% the optimizer switches to a table
  scan and recall is 1.000. This is **consistent with** filtering after the index returns candidates. We do not
  claim the mechanism without plan details.
- Open question for RCAC (PENDING): does a row permission behave like the `WHERE`? Does Db2 compile one plan for all
  users (the optimizer may treat the permission predicate with a fixed selectivity; a 2014 db2exfmt capture on
  Db2 10.x suggests this, UNVERIFIED on 12.1.5)? If one plan is shared, a 10%-visibility user gets the plan chosen
  for whoever compiled first. Either outcome is reported.

Controls (from the round-2 consult and the ChatGPT protocol; adopt all that fit the time):
- Ground truth per user = `FETCH EXACT FIRST 10` run **as that user** (RCAC applies). Cross-check once: admin EXACT
  with the explicit predicate must give the same IDs (proves RCAC = predicate for results). Never use the
  unfiltered top-10 then filter as truth.
- Under-fill: fewer than 10 rows counts as misses. Never re-normalize. Report `returned_count` separately.
- If |EXACT| = 0 report N/A, never 100%.
- Plan evidence at runtime: `MON_GET_PKG_CACHE_STMT` (EXECUTABLE_ID, NUM_EXECUTIONS, ROWS_READ, STMT_EXEC_TIME per
  user) and `SYSPROC.EXPLAIN_FROM_SECTION` on the executable that actually ran. Same EXECUTABLE_ID across users =
  plan sharing. ROWS_READ near 26k = scan; small = index. This is the most convincing single artifact.
- `FLUSH PACKAGE CACHE DYNAMIC` between conditions; run the user order both ways (first compiler wins?).
- Frozen statistics: no DML during trials; record STATS_TIME from SYSCAT.TABLES / SYSCAT.INDEXES; consider
  `AUTO_RUNSTATS OFF` for the sweep (shared DB: orchestrator decides).
- Search list size L is stated in every result row (default L = 50, W = 2). Guideline cells only if SQL0437W is absent.
- Same frozen real queries for every user (no random query vectors). Pre-embed queries. Exclude embedding, connection
  setup and UI from latency. Warm up each statement shape. Interleave users and methods.
- Visibility structures: random buckets (best case for post-filtering) first; a relevance-correlated assignment
  (embedding clusters) if time allows. Stratify MAL vs non-MAL in the report.
- Router thresholds fitted on a dev half; report the held-out half only. No router claim without a held-out win.
- Security negatives in the same run: forbidden IDs returned must be 0 for every cell, including through
  `NEEDLE.TRIAGE` itself (prove the procedure is caller-scoped: the permission keys on SESSION_USER).
- Synthetic table results (`NDL_DEV_RCAC.VEC_SYN`) are labelled synthetic and never mixed with real-corpus numbers.
- Lead with recall, under-fill, plan sharing and zero leaks, not speed: EXACT is only ~72 ms at 26k rows (F8).
- Figure 1: recall@10 vs s (log x); lines APPROX, best fixed over-fetch, router, post-filter; hollow markers where
  mean rows < 10. Figure 1b: p50 latency on the same axis plus EXACT. Figure 2: per-slice recall and MRR bars.

### 6.4 Evidence files (`docs/evidence/`)
`db2level.txt`, `catalog.txt` (README SYSCAT queries), `row_counts.txt`, `explain_approx_fullcorpus.txt`,
`explain_triage.txt`, `explain_rcac_<user>.txt`, `rcac_leak_tests.txt`, `bm25_parity.txt`, `pytest.txt`,
`eval_<run>.json` (in `eval/results/`), `rcac_sweep_<run>.json`, `fig1_rcac_recall.png`, `fig2_slices.png`,
`connectors.md` (P1), `validator.txt`, `text_search_probe.md` (exists), `manifest.txt`
(db2level, image tag, Python, `ibm_db`, langchain-core, Ollama model digests, corpus SHA-256, query-file SHA-256).

---

## 7. Execution timeline (CST, Mon 9 Nov -> Tue 10 Nov)

| Time | Work (owner) | Gate at the end |
|---|---|---|
| 19:30-20:30 | Embed full corpus on Windows, copy, load in Codespace, build index, RUNSTATS (data). Gate probes: APPROX in CTE, JSON_TABLE syntax, permission with subquery, insert under permission (orchestrator/bm25/rcac). PLAN.md (docs) | **G1**: full corpus loaded; EXPLAIN for literal-k APPROX recorded |
| 20:30-21:30 | POSTING/TERM_DF/STATS + parity (bm25). Scaffolding files (docs). Query build + freeze (eval) | **G2**: TRIAGE v1 returns fused rows; parity green |
| 21:30-22:30 | RCAC users, permissions, mask, grants, leak tests (rcac). SBOM fixture fleet (app) | **G3**: leak tests 0; index-under-permission EXPLAIN recorded |
| 22:30-23:30 | Retrieval eval + RCAC sweep (eval). Retriever + router (app) | **G4**: eval JSON + sweep JSON exist -> **scope freeze** |
| 23:30-00:30 | Figures; router tuned on dev; exposure query; LLM + verifier (app) | **G5**: CLI end-to-end demo runs |
| 00:30-01:30 | Streamlit page; connector EXPLAIN note; P2 only if all P1 green | - |
| 01:30-02:30 | Tests, evidence capture, hardening, README numbers | **G6 (02:30)**: CODE FREEZE; pytest saved; validator exit 0 |
| 02:30-03:30 | Final docs with real numbers; screenshots; record video (<= 3 min) | Docs grep shows no `TODO` |
| 03:30-04:15 | Upload video; fork, branch, copy, validate, commit, push, PR (orchestrator) | **G7 (04:15)**: PR open |
| 04:15-05:00 | Both Google Forms; Unstop Round 2; Devpost; LinkedIn | **G8 (05:00)**: confirmations captured |
| 05:00-05:30 | Buffer only. No code. | Rules deadline 05:30 |

Gate status: **G1 PASSED at ~19:30** (F8, `docs/evidence/g1_vector_index.md`).

Go/no-go rules:
- G1 NO-GO (index not chosen at full corpus): keep APPROX in code; report non-selection with EXPLAIN; the sweep
  compares EXACT vs post-filter vs router-over-EXACT. Do not claim DiskANN.
- G2 NO-GO by 21:45: switch TRIAGE to the DGTT two-step form. By 22:15: fuse two Db2 queries in Python and say so.
- G3 NO-GO by 22:45: ship RCAC with the leak tests that pass; list the rest as limitations.
- G4 is the scope freeze. After G4 nobody adds a feature. Only cut-list items move.
- G6 is absolute. After 02:30 only docs, evidence and submission work happen.

Cut order (first to go first): R20 Haystack wrapper -> R21/R22/R23/R25 -> R16 Streamlit (CLI demo stays) ->
R15 LLM summary (template summary stays) -> R14 exposure window (plain SBOM join stays) -> R18 sample corpus ->
sweep points below 10%.
Never cut: R1-R13, the video, the PR, both forms.

---

## 8. Submission checklist (orchestrator executes; docs agent prepares text)

- [ ] `python -X utf8 -I scripts/validate_submission.py` in a fresh clone with `submissions/needle/` -> exit 0; save output.
- [ ] Grep the folder for `TODO`, `password`, `PWD=`, real hostnames; expect none (except documented placeholders in `.env.example`).
- [ ] Fork `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` (user approval needed).
- [ ] `git checkout -b submission/needle upstream/main`; copy ONLY via `powershell -File C:\Users\ganes\IBM26\make_submission.ps1 -Target <fork>\submissions\needle` (excludes CONTRACT.md, docs/PLAN.md, internal reviews, .env, .venv, data/; fails on any secret or judge/internal text; dry run passed 20:45 CST, 179 files). Never copy by hand.
- [ ] `git diff --stat upstream/main` touches only `submissions/needle/`.
- [ ] Commits: `feat(needle): ...`.
- [ ] PR title: `[Submission] needle: NEEDLE — permission-aware hybrid retrieval in Db2`. Fill every PR template section and all 10 checklist boxes.
- [ ] Google Form 1: https://forms.gle/n8GQL4tg7Yzftwu39 (PR URL). Capture confirmation.
- [ ] Google Form 2: https://forms.gle/ZjsLaFU5zAYJonwk9 (Luma "Main Project Submission Form"). Capture confirmation.
- [ ] Unstop Round 2: PR URL, demo video link, screenshots (zip or PDF). Check Round 1 status; if it is open, upload a PDF built from this plan and `architecture.md`.
- [ ] Devpost project: title, story, built-with, video, PR link, screenshots.
- [ ] Video: unlisted YouTube, viewable signed out; link in README, `submission.json` `video_url`, PR, forms.
- [ ] LinkedIn post (user posts): capability-led hook, one measured result, SQL snippet or Figure 1, video + PR links.
  Tag: Dhruv Chaturvedi, Kunal Gola, Daya Nand, Pawan Thakur, Keshav Maheshwari, Shaik Sadiq, Gaurav Saxena.
  Hashtags (organisers' own): `#IBMDb2TechXSummit2026 #Db2TechXSummit2026 #IBM #IBMDb2 #Db2 #Db2Hack #Db2Hackathon
  #LangChain #Db2LangChain #VectorSearch #GLBajajMathura #IIC #NexaSphere`.
- [ ] Final report fields: PR_URL, FORM1/FORM2 status, UNSTOP status, DEVPOST_URL, VIDEO_URL, DB2_VERSION,
  INDEX_CREATED, INDEX_CHOSEN_FULL_CORPUS, INDEX_CHOSEN_UNDER_RCAC, TESTS (pass/fail/skip + command), EVAL (n, metrics),
  LIMITATIONS. Anything not done says NOT DONE.

---

## 9. Risks and fallbacks

| # | Risk | Trigger | Fallback |
|---|---|---|---|
| K1 | Index not chosen at ~26k rows | G1 EXPLAIN shows TBSCAN | RESOLVED 19:30: index chosen at 26,210 rows (F8). Still re-check under RCAC |
| K15 | "EXACT is only ~72 ms at 26k rows, why route?" | Judge question | Lead with recall, under-fill, plan sharing, zero leaks; present the router as the pattern that matters at scale; label any padded-scale run synthetic |
| K16 | Optimizer drops the index at low visibility (seen at 5% with WHERE, F10) | Sweep cell EXPLAIN | Report the switch as an optimizer finding; never call a table-scan cell "ANN recall" |
| K17 | Claiming novelty for SQL hybrid search | Review | Cite IBM db2-ai-cookbook; claim only the items in section 2.5 |
| K2 | APPROX ignored inside CTE | EXPLAIN of TRIAGE | DGTT two-step procedure |
| K3 | JSON_TABLE syntax | SQL0104N | XMLTABLE tokenize, then DGTT of terms |
| K4 | Optimizer drops the index under RCAC | EXPLAIN as NDL_P10 | This is a finding; the router uses EXACT under RCAC; publish both plans |
| K5 | Inserts fail under active permission (SQL20471N) | Load error | Loader user row in USER_ACCESS, or activate RCAC after load |
| K6 | DDL on a table with a vector index fails or the table turns read-only | SQL error after index build | Do all DDL and RCAC before the index build; rebuild index if needed |
| K7 | Embedding throughput too slow for 26.8k docs | > 45 min projected | Embed ADV_DOC text truncated to 2,000 chars (current); reduce MAL-* rows last; record the corpus actually used |
| K8 | Tunnel hangs | Bulk insert through the forward | All bulk work runs inside the Codespace (CONTRACT) |
| K9 | Codespace idle stop or quota | Codespace stops | Long idle timeout; do not stop the container (setup re-runs) |
| K10 | Hybrid does not beat the best leg | Eval JSON | Report per slice and "best worst-slice"; no inflation |
| K11 | LLM slow on qwen3:14b | > 20 s per summary | qwen3:4b-instruct, then template summary |
| K12 | Late submission surfaces | Clock | G6/G7/G8 are fixed; forms before Devpost and LinkedIn |
| K13 | Secrets leak into the folder | Pre-PR grep | Validator + grep + copy excludes `.env` |
| K14 | Judges cannot reproduce without a Codespace and GPU | Review | docker-compose for Linux x86; sample mode (R18); state the Linux AMD64 requirement for vector indexes |

---

## 10. Open questions (owner -> decision needed by)

1. rcac: hide embargoed rows entirely (CONTRACT) or show the row with DETAILS masked? Recommendation: hide (keeps the
   recall experiment clean); keep the mask as defense in depth. By 21:30.
2. rcac: does the loader user need a USER_ACCESS row, and is RCAC activated before or after the vector index build? By G1.
3. bm25: compute TERM_DF/CORPUS_STATS over all rows or non-embargoed rows (T4)? By 21:00.
4. data: index all KINDs including 12,015 `MAL-*` rows? They push the corpus past the ~20k index threshold, and they
   are short, repetitive texts. Recommendation: include, and report KIND counts. By G1.
5. app: which demo query and which embargoed advisory? Pick from a pre-declared list after the eval dev run. By 23:30.
6. orchestrator: who owns `requirements.txt` and a folder-level `.gitignore` (`.env`, `.venv/`, `data/`, `__pycache__/`)?
   Both are needed for the Security and Reproducibility rows. By 21:30.
7. orchestrator: team member names for `submission.json` (currently one TODO entry). By 03:30.
8. All: Unstop Round 1 status and whether it blocks Round 2 judging (UNKNOWN).

---

## 11. Decision log

| Time (CST) | Decision | Why | Source |
|---|---|---|---|
| 19:15 | Build NEEDLE (not TraceForge/Timeron/QueryShield/MemoryWeave) | Open domain; SQL-side fusion and RCAC-vs-ANN finding unoccupied | competition.md, redteam.md, consult |
| 19:15 | Center of gravity = permission-aware hybrid retrieval; triage is the application | Redteam estimate 69 -> 80 on the event rubric; finding is new | redteam.md section 0 |
| 19:15 | Real OSV PyPI corpus (26,842 records), not a synthetic corpus | Real data scores on impact; synthetic is used only for fleet, embargo flags, injection test, paraphrases, and is labelled | orchestrator (overrides ChatGPT pack) |
| 19:45 | Db2 reached through an SSH tunnel (`gh codespace ssh -- -N -L 50000:127.0.0.1:50000`), not `gh codespace ports forward`; VECDB explicitly ACTIVATED | The gh port forward went stale (SQL30081N selectForRecvTimeout) while Db2 was healthy; DB was re-activating on each first connect and re-running a failing "Vector index asynchronous initialization" task (ADM13500E in the notify log) | orchestrator, observed |
| 19:50 | Plan sharing (R22) promoted to P1; experiment controls adopted: per-user EXACT ground truth, under-fill rate, leak count, frozen stats (AUTO_RUNSTATS OFF), held-out router evaluation | Adversarial Db2-engineer review: the thesis is one shared plan for all RCAC users | research/consult_claude_ai_round2.md, ChatGPT RCAC_ANN_EXPERIMENT_PROTOCOL.md |
| 19:50 | Hybrid RRF is not claimed as new; IBM db2-ai-cookbook cited as prior art for SQL hybrid fusion | ChatGPT research pack + docs agent check of the cookbook README | research/chatgpt/research_pack |
| 23:15 | RCAC overhead on the keyword leg fixed: under the row permission Db2 scanned all 1.94M POSTING index entries then joined the ~25 query terms; BM25_SEARCH rewritten with a per-term LATERAL lookup → BM25 p50 244.8 → 27.2 ms, TRIAGE 256.4 → 34.4 ms (NDL_SENIOR), identical results on 30 queries, 60 tests pass; canonical eval re-run ordered | Measured (docs/evidence/rcac_posting_overhead.md) | bm25 agent |
| 23:10 | Correlated visibility measured on a copy (100 k-means clusters, seed 7): P10 recall 0.104, 130/170 zero-row queries; router 10/10 rows, 0 leaks; FF 0.49296 on that table | Strengthens the headline (realistic worst case) | rcac agent |
| 21:40 | Headline experiment DONE (docs/evidence/rcac_real.md): shared plan proven (one EXECUTABLE_ID, section actuals = exactly 21 candidates = 10/0.495); 0.495 not from USER_ACCESS stats; literal-permission control on a copy raised P10 recall 0.205 → 0.765 (predicate visibility, not RCAC, is causal); router held-out 1.000/1.000/1.000/0.988/0.987, 0 leaks. Not run: correlated visibility, multiple seeds, SELECTIVITY test (needs restart) → listed as limitations | Measured | rcac agent |
| 21:40 | TRIAGE depth chosen per user by the RCAC router (default depth 100 now TBSCANs under RCAC FF 0.495); final eval to be RE-RUN after all fixes (~01:30) as NDL_SENIOR so README numbers reflect the shipped RCAC configuration; earlier eval run 20261110T014804Z was measured as DB2INST1 before RCAC activation and must be labelled so if quoted | Honest numbers for the shipped config | orchestrator |
| 21:15 | Review triage (docs/evidence/review_claude.md): C1 TERM_DF embargo-vocabulary leak → BM25 agent (public-only DF/stats + REVOKE + regression test); H1/M1/M2 verifier → app agent; H2 posting reload drops embargo → BM25 agent; M3 Streamlit bound to 127.0.0.1 (orchestrator, done); M4 batched copies → connector agent; M5 README misstatements → final docs | Security is 15% of the event rubric; C1 was reproduced live as NDL_JUNIOR | review_claude.md |
| 20:25 | Connector findings published as docs/CONNECTOR_NOTES.md ("Notes for connector maintainers"), linked under "Contributions back"; no person names; general Db2 behavior + suggested one-line changes; NOT in pitch/video/headline; no upstream issues/PRs without user approval | Some maintainers are judges; findings must read as help and credit their work | user decision via side-agent note |
| 20:25 | Demo embargo case: GHSA-5x8w-8jj5-q52h (Pillow FPX heap overflow, real advisory, hits 3 current fleet services) gets a labelled SYNTHETIC embargo flag after the RCAC sweep is frozen | Makes the senior-vs-junior RCAC difference visible in the demo | orchestrator |
| 20:20 | TRIAGE wrapper retries only on SQL0901N at depths 64 then 128, logged | Db2 12.1.5.0 raised SQL0901N "Fetched nodes unexpectedly unsorted" for FETCH APPROX FIRST 100/99 on one query vector | docs/evidence/eval_sql0901n_fetch_approx.md |
| 19:50 | Query terms passed as ONE JSON-array parameter, expanded inside Db2 with a recursive JSON_VALUE CTE (the sql/99_validation.sql V3 pattern); not JSON_TABLE, not legacy SYSTOOLS.JSON_TABLE (it corrupted values: `lets` -> `letsary`, parity failed 29/30) | Db2 LUW JSON_TABLE row path is fixed to 'strict $' and cannot expand arrays (verified by data agent + sources agent) | sql/99_validation.sql, research/sources_findings.md |
| 19:15 | LangChain retriever primary; Haystack wrapper optional (P2) | Mandatory-framework rule met by one executed framework; LangChain matches Dhruv's connector work | orchestrator (overrides ChatGPT pack) |
| 19:15 | Streamlit UI, not React/Vite | Time; judges read README, plans and charts | orchestrator (overrides ChatGPT pack) |
| 19:15 | Slug `needle` | Short, no collision in 50 PRs | orchestrator (overrides ChatGPT pack's `needle-db2-hybrid`) |
| 19:15 | Team composition is settled by the user; not re-raised here | User decision | orchestrator |
| 19:15 | Bulk loads run inside the Codespace | Tunnel load of 3k rows took ~10 min and hung | CONTRACT |
| 19:15 | k and depth written as literals from a closed ladder | `FETCH APPROX FIRST ? ROWS` never uses the index (#49) | CONTRACT |
| 19:27 | No Db2 Text Search; BM25 in plain SQL | CIE0774E: Text Search not configured in the image | evidence/text_search_probe.md |
| 19:30 | Adopted from ChatGPT pack: false-success list, BUILD_STATUS discipline, NOT_CONFIRMED != SAFE, ANN fidelity vs relevance metrics kept apart, demo storyboard shape, reference list (URLs re-checked) | Good discipline; consistent with CONTRACT | research/chatgpt/NEEDLE_Build_Pack |
| 19:30 | Fill both Google Forms | Luma names a second "main" form; cost is minutes | devpost.md section 4.6 |
| 19:30 | Deadline target 05:00 CST; freeze 02:30 | Binding rule text says 5:00 PM IST = 05:30 CST | rules.md, devpost.md |
| 19:35 | RRF via UNION ALL + GROUP BY, ties on ADV_ID | Simpler than FULL OUTER JOIN; deterministic | ChatGPT HYBRID_QUERY_REFERENCE |
| 19:45 | TRIAGE = DGTT for the APPROX leg + one fusion statement; SYSTOOLS.JSON_TABLE for terms | ISO JSON_TABLE in 12.1.5 takes only `strict $`; bare SELECT keeps the APPROX plan simple | sql/03_triage_proc.sql (bm25 owner) |
| 19:45 | Eval slices = named / masked / paraphrase (150 each, frozen) | Built and hashed by the eval owner | eval/queries/*.manifest.json |
| 19:30 | G1 passed; keep k and depth as validated literals | Index chosen at 26,210 rows; parameter-marker k uses TBSCAN | evidence/g1_vector_index.md |
| 19:55 | Positioning: hybrid SQL fusion is prior art (IBM db2-ai-cookbook); our claims = RCAC x vector-index measurements + router, BM25-in-SQL parity, temporal SBOM exposure, connector findings | Accuracy; the cookbook is IBM's own and the judges know it | orchestrator; github.com/IBM/db2-ai-cookbook (verified: weighted-sum fusion, "not plain RRF") |
| 19:55 | `BUSINESS_TIME` described as valid time of deployments, not discovery time | Correct temporal semantics | orchestrator; ChatGPT research pack |
| 19:55 | RCAC sweep adopts the controls in section 6.3 (per-user EXACT truth, under-fill as misses, package-cache plan evidence, held-out router) | Makes the finding hard to dismiss | consult_claude_ai_round2.md; RCAC_ANN_EXPERIMENT_PROTOCOL.md |
| 19:55 | Sources: cite `docs/REFERENCES.md` (sources agent, 75 verified entries); do not duplicate | One list to maintain | orchestrator |
| 19:40 | Healthcheck = marker file `/database/config/.shared-data/setup_complete` | The image touches it when it prints "Setup has completed." (read in `setup_db2_instance.sh` line 187) | Codespace container, read-only check |

---

## 12. Sources (HTTP 200 checked 2026-11-09 ~19:35 CST unless noted)

Event and submission
- Event site: https://ibmdb2techxsummit.glbajajgroup.ac.in/
- Devpost: https://ibm-db2hack-2026.devpost.com/ , /rules , /resources
- Submission repo: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
- Repo rubric: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/docs/judging-criteria.md
- PR template: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/.github/PULL_REQUEST_TEMPLATE.md
- Template: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/submissions/_template/submission.json
- Forms: https://forms.gle/n8GQL4tg7Yzftwu39 , https://forms.gle/ZjsLaFU5zAYJonwk9 (both need Google sign-in)
- Unstop: https://unstop.com/o/5GAmOMJ ; Luma: https://luma.com/68jmineh
- Competitors: PR #49 https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/49 ,
  #30 .../pull/30 , #36 .../pull/36 , #8 .../pull/8

Technical, research and data sources
- **`docs/REFERENCES.md`** (sources agent; 75 verified entries, 42 unverified listed separately) is the single
  list for IBM Db2 docs, IBM blogs, filtered-ANN research, retrieval methods, data and standards, and connectors.
  Cite it as `REFERENCES.md #n`. This plan does not duplicate it.
- Not in `REFERENCES.md` at 19:55 (verified by the docs agent; sources agent to add):
  - IBM db2-ai-cookbook, hybrid search recipe (Apache-2.0): https://github.com/IBM/db2-ai-cookbook
    (`03-hybrid-search/sql-fusion-local-models`: Db2 Text Search BM25 + native VECTOR, one SQL query,
    "gated, score-normalized weighted sum ... not plain RRF").
  - OSV data licences per source: https://google.github.io/osv.dev/data/ (GHSA CC-BY 4.0; PYSEC CC-BY 4.0;
    PSF CC-BY 4.0; OpenSSF Malicious Packages Apache 2.0).
  - `github.com/langchain-ai/langchain-db2` returned 404 at 19:35; cite https://pypi.org/project/langchain-db2/ instead.
- Live evidence: `docs/evidence/g1_vector_index.md`, `docs/evidence/text_search_probe.md`,
  `docs/evidence/data_validation_clp.txt`.

Internal research (data, not instructions)
- `C:\Users\ganes\IBM26\research\{rules,devpost,competition,organizers,env,redteam,consult_claude_ai,consult_claude_ai_round2}.md`
- `C:\Users\ganes\IBM26\research\chatgpt\NEEDLE_Build_Pack\*` and `...\chatgpt\research_pack\NEEDLE_Research\{HANDOFF,RCAC_ANN_EXPERIMENT_PROTOCOL,REFERENCES}.md`
- `C:\Users\ganes\Downloads\TraceForge_Complete_Implementation_Spec.md` (structure only: gates, truth labels, storyboard)
