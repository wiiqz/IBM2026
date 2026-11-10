# NEEDLE — Architecture and Db2 Engineering Contract

## System diagram
```
User: query + SBOM
       |
       v
React/Vite (Search / SBOM Impact / Retrieval Lab)
       |
       v
FastAPI /api/* -----------> evidence report / benchmark JSON
       |
       v
Haystack Pipeline (custom Db2HybridRetriever + DeterministicApplicability + OptionalGenerator)
       |                  |                          |
       |                  +---- Ollama 768D embed ---+
       v
Db2DbAdapter (ibm_db, prepared statements, read-only query role suggested)
       |
       v
IBM Db2 12.1.5 Community Edition
  ADVISORIES VECTOR(768,FLOAT32) / optional DiskANN index
  ADVISORY_TERMS / QUERY_TERMS / PACKAGES / AFFECTED_RELEASES
  SBOMS / SBOM_COMPONENTS / BENCHMARK_RUNS
```

## Execution paths
**Ingest:** synthetic `adv_id`, summary, affected release data -> token normalizer and embedding generator -> Db2 INSERT with prepared statements -> inspect row count and embedding dimension -> RUNSTATS -> optional native vector index (build AFTER loading) -> rerun RUNSTATS. No auto-fabricated coverage claims.

**Search:** query -> normalized lexical tokens and 768-dimensional embedding -> store NDL_QUERY_TERMS under UUID -> Db2 lexical rank + vector rank (EXACT, or APPROX only if enabled) -> RRF (`1/(60+rank)`) -> join advisory details -> optional join exact affected releases + SBOM components -> UI. Clean query tokens with DELETE in `finally`; scheduled cleanup as defense.

**Haystack:** implement `@component class Db2HybridRetriever` with `.run(query, query_vector, mode, sbom_id=None, top_k=10) -> {documents:list[Document], meta:dict}`. Use a genuine `haystack.Pipeline`; embedder can be an explicit Haystack custom component that calls local Ollama endpoint. `DeterministicApplicability` uses SQL results rather than model text. `OptionalGroundedSummary` is a pipeline component that uses local Ollama and cannot write any risk verdict.

**DB2:** all advisory and package data lives in real Db2. SQL uses bounded `FETCH FIRST` and parameter markers. Entire corpus uses same embedding model and same 768-dimensional coordinate type. Version-matching is exact release only in P0. User query is never executed as SQL.

## Retrieval modes
1. KEYWORD: `QUERY_TERMS` indexed equality with `ADVISORY_TERMS`, summed weights, `ROW_NUMBER()` with stable ADV_ID tie break.
2. EXACT: `VECTOR_DISTANCE(A.EMBEDDING, VECTOR(CAST(? AS CLOB(32K)),768,FLOAT32), COSINE)` with `FETCH EXACT FIRST ? ROWS ONLY`. If Db2 refuses parameterized `FETCH`, interpolate ONLY a validated integer constant 1..50, never arbitrary input.
3. APPROX: same ORDER BY and same distance metric; replace `FETCH EXACT` with `FETCH APPROX`. Do not equate mode request with index use.
4. HYBRID: use exact vector top-30 and lexical top-30 in baseline; `UNION ALL`, aggregate RRF, join advisory details; dynamic query token records tied to request ID. P1 may use ANN top-30 inside the same SQL statement if EXPLAIN proves the ANN index is actually used there. Keeping a stable lexical/vector rank and RRF formula is mandatory.

## Indexed approximate search caveats
- Native vector index only Db2 12.1.5+. `CREATE VECTOR INDEX NDL_VIX_COS ON NDL_ADVISORIES(EMBEDDING) WITH DISTANCE COSINE` (official syntax).
- 768-d FLOAT32 requires <= one-quarter index page per vector key; 32K page ensures room; use 32K buffer pool and tablespace.
- Confirm CPU AVX2, Linux AMD64 and `db2level`. Ryzen 9 7900X supports AVX2, but installed VM/runtime still must be verified.
- Enable `DB2_VECTOR_INDEXING=YES` if build requires; changes may require instance restart. Never modify unrelated Db2 instances.
- `RUNSTATS` is required; index usage depends on optimizer statistics and table size. For small corpus optimizer may select EXACT even with APPROX requested.
- `EXPLAIN PLAN FOR <actual query>` and Db2 `db2exfmt` are judge evidence; save command/version/status and source SQL. Do not assert access path from timings alone.
- 768-D embedding JSON may exceed a 4K VARCHAR; bind as CLOB in `VECTOR(CAST(? AS CLOB(32K)),768,FLOAT32)`. This exact parameter form is **UNVERIFIED** and must be tested immediately on live DB2. If it fails, use a verified Db2 driver LOB binding and record actual syntax.

## Applicability and provenance
**Core principle:** semantic similarity finds *candidate advisories*. It does not prove installed release affected. A finding is `AFFECTED` only if advisory joins an exact release matching `(ecosystem,package_name,version)` in `NDL_AFFECTED_RELEASES`. Everything else is `NOT_CONFIRMED` or `UNKNOWN_COVERAGE`, never `SAFE`.

For P0, `NDL_PACKAGES` normalizes ecosystem+name, e.g. `npm`/`example-utils`; source SBOM maps to rows in `NDL_SBOM_COMPONENTS`. Do not imply CVE version ranges are parsed. Future range resolver must distinguish semver, PEP440, Maven, etc.

Every record contains `SOURCE_KIND` and `SOURCE_URL`. Synthetic entries use `SYNTHETIC` + `demo://...`, banner at top. Real external advisories (if P2) require ingestion timestamp and exact authoritative URLs.

## Security
- SQL parameter binding for vectors, terms, advisory IDs and SBOM IDs. Whitelisted modes and validated top-K (1-50).
- PUBLIC API includes `WHERE VISIBILITY='PUBLIC'` in BOTH lexical and vector paths, and output detail endpoint; never allow hidden record to influence public rank (otherwise inference leakage).
- Separate DB authorizations are stronger than application filtering but are P2. Do **not** claim RCAC unless CREATE PERMISSION has actually been run and two different Db2 users tested.
- Never send environment variables, DB passwords or secrets into Ollama prompts or event logs. `.env` untracked; use `.env.example` with placeholders.
- No network access to arbitrary user-controlled URLs in SBOM. Sanitized text, length-limited prompts; LLM provides only descriptions, not system-level actions.

## API contract / minimum files
```
src/backend/app/main.py
src/backend/app/db2.py
src/backend/app/models.py
src/backend/app/seed.py
src/backend/app/retrieval.py
src/backend/app/haystack_pipeline.py
src/backend/app/applicability.py
src/backend/app/benchmarks.py
src/backend/app/embed.py
src/backend/tests/test_retrieval.py
src/backend/tests/test_security.py
src/backend/tests/test_db2_integration.py
src/frontend/src/App.tsx
src/frontend/src/pages/{Explorer,Impact,Lab}.tsx
src/db/DB2_SCHEMA.sql
src/db/HYBRID_QUERY_REFERENCE.sql
src/demo/{advisories.json,sbom.json,queries.json}
README.md; architecture.md; submission.json; .env.example
```
Do not treat this as a requirement to create every file at the cost of running code: fewer accurate modules are better.

## Reproducibility manifest
Record: `db2level`, Docker image digest/tag, Python runtime, Node version, `ibm_db` version, Haystack version, Ollama model and digest, seed SHA-256, query-set SHA-256, DB2 index catalog, SQL statement text, EXPLAIN (if supported), benchmark times, test log. Judges must be able to reproduce the performance experiment; metrics must identify machine and dataset.

## Technical fallback sequence
1. ANN path fails -> exact vector + indexed lexical + RRF still running on Db2, visibly note index unverified/disabled.
2. Composite single-statement CTE cannot get ANN index -> separate `FETCH APPROX` Db2 query, exact lexical Db2 query, RRF aggregation in a final Db2 query or Python only if absolutely necessary, label method.
3. 768-D CLOB binding fails -> verify driver LOB handling, smaller **different** embedding model only if corpus rebuilt and indexes changed; never silently truncate vectors.
4. Local LLM too slow -> remove summary generation; embedding + Haystack retrieval remain mandatory.
5. Frontend deadline -> one functional React page with visible search results, Db2 status and benchmark log beats five empty polished pages.
