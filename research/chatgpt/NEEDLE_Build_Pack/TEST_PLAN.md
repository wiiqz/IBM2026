# NEEDLE — Test and Benchmark Plan

## Truth policy
This is a plan; all PASS statuses and numbers are **UNVERIFIED until executed** by Claude Code on the user's machine. Unit mocks never substitute for live Db2 integration. Capture environment version, SQL, dataset digest, model tag/digest, exact commands and stdout to `docs/evidence/`.

## Test tiers

### Unit (offline, target 18 cases)
- UT01 token normalization removes punctuation, lowercases and splits unicode safely; stopword handling documented.
- UT02 query tokens are length-bounded, de-duplicated, deterministic and reject empty string.
- UT03 RRF score `1/(60+rank)` is correct at ranks 1 and 10, with stable ID tie-break.
- UT04 lexical-only ranking when vector unavailable; no fake semantic score.
- UT05 vector-only ranking when no lexical hits; no divide-by-zero.
- UT06 vector length mismatch 767/769 rejected before SQL.
- UT07 NaN, infinity, all-zero vector rejected.
- UT08 embedding model name mismatch rejected; no silent mixing.
- UT09 exact applicability `npm` + `pkg` + `1.2.3` positive only if exact record present.
- UT10 `1.2.4` has `NOT_CONFIRMED`, never SAFE.
- UT11 differing ecosystems do not match despite same package name.
- UT12 RRF candidate dedup combines both channels, not duplicated list items.
- UT13 benchmark recall@K = intersection(approx,exact) / len(exact[:K]), with nonzero denominator handling; distinct from relevance recall.
- UT14 percentile computation has deterministic definition and warmups excluded.
- UT15 secure mode and K whitelist rejects SQL-shaped user input and K > 50.
- UT16 embargo visibility applied in both lexical and vector branches (cannot influence public rank).
- UT17 optional LLM explanation includes sources or returns abstention.
- UT18 seed determinism: same inputs give same normalized records and checksum; model digest recorded.

### Live Db2 integration (target 14 cases)
- IT01 `db2level` confirms actual 12.1.5.
- IT02 buffer pool `NDL_BP32`, tablespace `NDL_TS32`, and `VECTOR(768,FLOAT32)` table created.
- IT03 sample insert uses `VECTOR(CAST(? AS CLOB(32K)),768,FLOAT32)` or verified equivalent and roundtrips.
- IT04 `VECTOR_DISTANCE` returns 0 for same nonzero vector in COSINE mode (within floating tolerance).
- IT05 `FETCH EXACT FIRST 10 ROWS ONLY` compiles and returns ordered IDs.
- IT06 lexical term join executes and uses real Db2 tables.
- IT07 hybrid RRF query compiles, ranks stable IDs, and excludes embargo.
- IT08 SBOM dependency exact version join produces one positive/one negative fixture.
- IT09 invalid query input never mutates data, and injected SQL string is treated as literal.
- IT10 row count and results change when seeded advisory row is added/deleted within sandbox transaction.
- IT11 SQL transaction rollback restores prior state.
- IT12 Haystack Pipeline calls actual Db2 component, not fake memory store.
- IT13 native index create & catalog proof if enabled; if unavailable, mark BLOCKED with SQLSTATE and screenshot.
- IT14 approximate-vs-exact EXPLAIN and query-plan evidence if enabled; if optimizer does not use vector index, mark `INDEX_NOT_SELECTED` accurately.

### API and end-to-end (target 8 cases)
- API01 `/api/health` truthful: 503 if DB unavailable.
- API02 `/api/search` returns real references matching SQL IDs.
- API03 invalid mode returns 422.
- API04 `top_k=0`/`51` rejected.
- API05 no results produces correct empty state, not mock suggestions.
- API06 evidence drawer returns matching `SOURCE_URL`, `SOURCE_KIND`, version join.
- API07 SBOM impact table matches Db2 query for the same id.
- API08 UI benchmark page renders only measured values, otherwise `Not measured`.

### Security tests (target 6 cases)
- SEC01 parameter marker used for all inputs; `'; DROP TABLE...` never executed.
- SEC02 EMBARGOED advisory not returned by PUBLIC search, get-by-id, or impact results.
- SEC03 `.env`, local passwords and tokens never committed. Run `git diff --cached --name-only` plus automated secret detection if available.
- SEC04 no arbitrary URL fetch from a supplied SBOM.
- SEC05 large request bodies/top_k terms rejected with clear validation errors.
- SEC06 LLM text cannot mutate applicability status or replace source records.

## Benchmark protocol
1. Freeze dataset and save `sha256` of normalized seed JSON, and model digest.
2. Curate 12-25 query fixtures. For each include expected relevant IDs with explicit relevance reasoning; at least 4 lexical paraphrases, 4 exact keyword, 4 negative/ambiguous. No random claims of representative security-domain performance.
3. Same corpus, query vectors, filters, top_k and DB connection mode for all modes. Query ordering fixed; optionally interleave queries across modes to reduce warm-cache bias.
4. Warm each query 3 times and run 5 timed trials (if time budget permits); record raw timings in milliseconds, not only the mean. Report p50/p95 by mode and query count.
5. Compute `retrieval_recall@10` against relevance judgments (annotated expected IDs). If a fixture has fewer than 10 expected relevant IDs, denominator is number of relevant IDs, not ten. Report `precision@10` too.
6. Compute `ANN_recall@10` as |APPROX top10 ∩ EXACT top10| / |EXACT top10|, and `top10_overlap`; this evaluates approximation fidelity, not semantic relevance.
7. Capture EXPLAIN to assert if the native vector index was actually used. `FETCH APPROX` alone is inconclusive. Report index catalog state and `INDEX_USED=UNKNOWN/0/1` separately.
8. For keyword, vector, hybrid: show top-result IDs and ranks. If hybrid is worse for some cases, display honest failure cases.
9. Segment `applicability_accuracy`: compare joins against curated exact-release truth, separate from retrieval relevance.
10. Do not compare 80-row benchmark latencies against internet-scale performance claims; small-corpus results may favor exact scan.

## Evidence artifacts
`docs/evidence/db2level.txt`, `db2_schema.log`, `db2_vector_insert.log`, `exact_query.sql`, `approx_query.sql`, `explain.txt`, `pytest.txt`, `benchmark_raw.csv`, `benchmark_summary.json`, `seed_sha256.txt`, `model_version.txt`, `ui_search.png`, `ui_impact.png`, `ui_lab.png`, `submission_validator.txt`.

## Release criteria
**REQUIRED:** IT01-IT12 with the applicable exact version and at least the first functional E2E flow, 0 committed secrets, passing organizer validator, real video. **STRETCH:** IT13-IT14. If any REQUIRED fails, reduce scope or fix; never mark a test passed without executing it.

## Factual comparison demo outline
Use a query shown on screen, e.g. a user-friendly phrase referring to unsafe object merging. Before recording, verify (1) lexical result list, (2) vector result list, (3) fused result list, (4) exact affected release join. Do not prewrite expected winner results that the chosen model cannot reproduce. If the query does not demonstrate a missed relevant item, select a different query from predeclared fixtures and disclose selection.
