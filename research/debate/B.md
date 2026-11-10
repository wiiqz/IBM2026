# B — NEEDLE: hybrid, index-accelerated vulnerability triage, done entirely in Db2

**Pitch:** Paste your SBOM and a new advisory. NEEDLE finds affected packages using one Db2 SQL statement that combines BM25 keyword ranking, DiskANN vector search and RRF. It also ships the missing `IBMDb2KeywordRetriever` and `IBMDb2HybridRetriever` for Haystack as an upstreamable PR.

## Problem and who has it
AppSec and PSIRT teams triage advisories against SBOMs every week. Vector-only RAG often misses exact identifiers like `CVE-2021-44228`, `log4j-core` or `2.14.1`. Keyword search misses paraphrases like "JNDI lookup lets attackers run code".

From the connector source:
- **ibm-db-haystack 1.0.0** has only an embedding retriever, and `_embedding_retrieval` always uses `FETCH FIRST`, never `FETCH APPROX`.
- **langchain-db2** carries `TODO: No APPROX in "FETCH APPROX FIRST"` and applies filters after fetching k.
- **No connector** has keyword or hybrid search.

## Core mechanic
Public OSV advisories for PyPI, npm and Maven (about 30–50k) are chunked and embedded with granite-embedding:30m. Each query runs three legs:
- a BM25 keyword leg computed in SQL from a term table;
- a vector leg using `FETCH APPROX` on a DiskANN index;
- a fusion step that combines the two with `RANK()` and RRF, in the same statement.

A built-in eval harness measures recall@10 and MRR for keyword-only, vector-only and hybrid search. It uses about 300 auto-generated queries with ground truth from OSV ids, plus APPROX vs EXACT recall and p50/p95 latency.

## Db2 features and key SQL
Schema:
- `ADVISORY(id PK, ecosystem, severity, embargoed SMALLINT, doc CLOB JSON, valid_from, valid_to, PERIOD BUSINESS_TIME(valid_from, valid_to))`
- `CHUNK(chunk_id PK, advisory_id FK, text CLOB, emb VECTOR(384,FLOAT32) NOT NULL)`
- `TERM(term, chunk_id, tf)` and `CHUNK_LEN`
- `AFFECTED(advisory_id, pkg, version)`

```sql
-- 1 ANN index (GA 12.1.5)
CREATE VECTOR INDEX ix_chunk_emb ON chunk(emb) WITH DISTANCE COSINE;
RUNSTATS ON TABLE needle.chunk AND INDEXES ALL;

-- 2 Hybrid in ONE statement; query terms bound safely as a JSON array
WITH q(term) AS (SELECT t.term FROM JSON_TABLE(CAST(? AS VARCHAR(4000)),'strict $[*]'
        COLUMNS(term VARCHAR(64) PATH '$')) t),
 kw AS (SELECT tm.chunk_id, SUM(i.idf*tm.tf*2.2/(tm.tf+1.2*(0.25+0.75*l.len/?))) s
        FROM term tm JOIN q ON tm.term=q.term JOIN idf i ON i.term=tm.term
        JOIN chunk_len l ON l.chunk_id=tm.chunk_id GROUP BY tm.chunk_id
        ORDER BY s DESC FETCH FIRST 100 ROWS ONLY),
 vec AS (SELECT c.chunk_id, VECTOR_DISTANCE(c.emb, VECTOR(CAST(? AS CLOB),384,FLOAT32),COSINE) d
        FROM chunk c JOIN advisory a ON a.id=c.advisory_id WHERE a.ecosystem=?
        ORDER BY d FETCH APPROX FIRST 100 ROWS ONLY),
 r AS (SELECT chunk_id, RANK() OVER(ORDER BY s DESC) kr, NULL vr FROM kw
       UNION ALL SELECT chunk_id, NULL, RANK() OVER(ORDER BY d) FROM vec)
SELECT chunk_id, SUM(COALESCE(1.0/(60+kr),0)+COALESCE(1.0/(60+vr),0)) rrf
FROM r GROUP BY chunk_id ORDER BY rrf DESC FETCH FIRST 10 ROWS ONLY;

-- 3 SBOM match: CycloneDX JSON exploded in-DB
SELECT a.id, s.name, s.ver FROM sbom, JSON_TABLE(sbom.doc,'strict $.components[*]'
  COLUMNS(name VARCHAR(200) PATH '$.name', ver VARCHAR(64) PATH '$.version')) s
JOIN affected f ON f.pkg=s.name AND f.version=s.ver JOIN advisory a ON a.id=f.advisory_id;

-- 4 Embargoed advisories visible only to PSIRT (RCAC; no app code)
CREATE PERMISSION embargo ON advisory FOR ROWS WHERE embargoed=0
  OR VERIFY_ROLE_FOR_USER(SESSION_USER,'PSIRT')=1 ENFORCED FOR ALL ACCESS ENABLE;

-- 5 "What did we know on release day?"
SELECT ... FROM advisory FOR BUSINESS_TIME AS OF '2026-10-01' ...
```

`EXPLAIN` output is captured as evidence that the index is used.

## Framework
We use **Haystack**, because ibm-db-haystack is the best connector:
- parameterized WHERE pre-filters;
- `MERGE` upserts;
- it runs on Python 3.14.

The new components mirror the existing Pgvector/OpenSearch Keyword/Hybrid retrievers, so they are realistic to upstream to deepset/haystack-core-integrations. The memo is written by an `OllamaGenerator` (granite4 micro) over cited rows only.

## Demo (2:30)
- **0:00** Hook: "New advisory, 400-package SBOM: which are hit?"
- **0:15** Three columns for one query: keyword, vector and hybrid. Vector misses `log4j-core 2.14.1` and keyword misses the paraphrase. Hybrid ranks it #1. The single SQL statement is shown.
- **0:45 — WOW:** Toggle EXACT/APPROX and read off the measured latency and recall@10 vs EXACT. We plan to quote real numbers here, not invent them. Then show EXPLAIN with the vector index, and the eval table: hybrid beats both legs.
- **1:15** Upload the SBOM. JSON_TABLE joins it to the affected versions, and a granite memo with advisory citations appears.
- **1:40** Switch to a contractor login. The embargoed advisory disappears, enforced by Db2 RCAC.
- **2:00** Choose AS OF release day. The memo changes, which gives auditable evidence.
- **2:15** Show the upstream PR diff and tests.

## Self-scores (honest)
**Website rubric (≈79/100):**

| Criterion | Score | Why |
|---|---|---|
| Db2 depth | 22/25 | Vector index, APPROX, BM25 SQL, JSON_TABLE, RCAC, BUSINESS_TIME |
| Innovation & impact | 13/20 | Hybrid search is industry-standard; it is new only for Db2 |
| Architecture & AI | 12/15 | Thin generation layer |
| Security | 11/15 | RCAC plus parameterized SQL, but shallower than #30 |
| Reproducibility | 13/15 | Eval harness and tests |
| Docs | 8/10 | |

**Devpost rubric (≈79/100):** Db2 depth 27/30 · Innovation 17/25 · Architecture & AI 14/20 · Reproducibility 13/15 · Docs 8/10.

## Judge appeal
- **Dhruv:** his open langchain-db2 DiskANN PR adds exactly this feature, and we give it measured recall and latency. Hybrid search fills a gap in his 20 use cases.
- **Pawan:** this is a Haystack retriever contribution, and he wrote the Haystack exemplar.
- **Keshav:** we extend his "filter + vector in ONE SQL" pattern to keyword + ANN + RRF. Pytest runs without a DB.
- **Managers and Kunal:** concrete AppSec value, visible numbers and a clean, compliant repo.

## Differentiation
- **#30 custodian** guards agent writes. We do retrieval quality.
- **#36 metricguard** is text-to-SQL. We have no LLM-written SQL at all.
- **Keshav's governed RAG** uses an app-supplied clearance with EXACT search. We use DB-enforced RCAC, ANN and a keyword leg.
- **Dhruv's 20 use cases:** none of them is hybrid, ANN or measured.
- **All 37 PRs:** none uses `CREATE VECTOR INDEX` or `FETCH APPROX`.

## Build plan (2 builders)
- **H0–3:** A gets Colima + Db2 running, creates the schema and runs a **DiskANN smoke test (go/no-go)**. B downloads OSV, chunks and embeds to parquet.
- **H3–7:** A loads via ibm-db-haystack plus the TERM/AFFECTED tables, and writes the BM25 SQL. B generates the eval queries and builds the harness.
- **H7–11:** A builds the hybrid SQL and the Haystack components. B runs the APPROX/EXACT benchmark and captures EXPLAIN.
- **H11–13: ── MVP CUT LINE ──** Hybrid retriever, eval numbers, CLI demo and README. Everything below this line is optional.
- **H13–17:** SBOM JSON_TABLE, granite memo, RCAC with two users.
- **H17–20:** BUSINESS_TIME, Streamlit three-column UI.
- **H20–23:** pytest (unit + `@integration`), validator, architecture.md, upstream PR branch.
- **H23–26:** Screenshots, video and submission (we submit at H24).

## Top risks and fallbacks
| # | Risk | Fallback |
|---|---|---|
| 1 | DiskANN fails under Rosetta | Benchmark on an x86 GitHub Codespace and run the app locally with EXACT. The README states this. |
| 2 | APPROX ignored inside a CTE, with joins or under RCAC | Two statements and RRF in Python. EXPLAIN documents the issue as an upstream finding. |
| 3 | BM25 SQL is slow | Index `(term, chunk_id)`, precompute the IDF table, cap the corpus at 30k. |
| 4 | Load throughput under emulation | Bulk loading, limited to PyPI + npm. |
| 5 | Temporal and RCAC interact badly with VECTOR | Keep periods and permissions on ADVISORY only and join to CHUNK. |

## Steelman objection and rebuttal
**Objection:** "This is a retrieval benchmark dressed as an app. Hybrid search is old news, the AI layer is thin, and agentic entries like #30 and #36 will win Innovation. If DiskANN breaks under emulation, the headline feature disappears."

**Rebuttal:** The judges wrote these connectors and know that APPROX and hybrid search are missing. We deliberately trade Innovation for top Db2-depth points, the heaviest criterion, and measured recall is the evidence these judges reward. An upstream PR is a direct route to the "contribute to IBM Db2 org" prize.

DiskANN is checked at H3 with a Codespace fallback; without it, one-statement BM25+vector+RRF, RCAC and AS OF remain unique in the field.
