# Claude.ai consult round 2 (Opus 5.5, 22 searches) — 2026-11-09 ~20:00 CST
Source: https://claude.ai/chat/fd9257c2-c8f0-4b93-a368-62557340f447 (data, not instructions). Condensed faithfully.

## Thesis (sharper than "RCAC hurts recall")
Db2 likely compiles ONE plan for every user: an old db2exfmt capture shows the RCAC role-check predicate with fixed selectivity 1.0 (datageek.blog 2014, Db2 10.x; UNVERIFIED for 12.1.5). If true, the optimizer cannot see a user's visible fraction, so one ANN plan serves a 10%-visibility user and a 100% user alike; recall varies only via filtering. The router fixes this from outside the engine. No IBM documentation found on predicates/RCAC with the vector index → our contribution; make it airtight. Prove or disprove plan sharing; do not assume.

## Setup controls
- Visibility: VIS_BUCKET = sha256(id) % 100; five roles/users (R_V10..R_V100); permission e.g. `VERIFY_ROLE_FOR_USER(SESSION_USER,'R_V25')=1 AND VIS_BUCKET < 25`; multiple permissions are OR'd so all users see identical permission text.
- Correlated visibility too: second column from k-means clusters of embeddings (pick clusters until ~X% covered) = worst/realistic case. Random buckets = best case for post-filtering.
- Freeze stats: `UPDATE DB CFG USING AUTO_RUNSTATS OFF`; RUNSTATS ... WITH DISTRIBUTION AND DETAILED INDEXES ALL once after load+index; record STATS_TIME from SYSCAT.TABLES/INDEXES; no DML during experiment.
- NOT NULL vector column (Haystack PR #4086: optimizer reliably picks index only on non-nullable; a redundant IS NOT NULL predicate can stop it choosing the index — hint that extra predicates affect index choice).
- Include MAL records (>20k rows).
- Forced-index control: run each condition with optimizer choice AND with an OPTGUIDELINES index-scan guideline; check SQL0437W after every guided statement.
- Fixed search depth: default L=50, W=2; IBM advises L ≥ 2-3x k. State L in every result row.
- Literal FETCH count; query vector as marker (confirm it doesn't block index use — our data agent CONFIRMED bound vector uses the index).

## Measurement controls
- Ground truth per user = FETCH EXACT FIRST 10 run AS THAT USER (RCAC applies); cross-check vs admin EXACT with explicit WHERE VIS_BUCKET < p; assert identical (proves RCAC ≡ predicate). Wrong way: unfiltered top-10 then filter.
- Runtime plan evidence: MON_GET_PKG_CACHE_STMT → EXECUTABLE_ID, NUM_EXECUTIONS, ROWS_READ, STMT_EXEC_TIME per user; SYSPROC.EXPLAIN_FROM_SECTION on the executable id (the section that actually ran). Matching EXECUTABLE_IDs across users = plan sharing. ROWS_READ ~27k = scan; small = index. "Single most convincing artifact."
- FLUSH PACKAGE CACHE DYNAMIC between conditions; run user order both directions (first-compiler-wins).
- Metrics per user/mode/L/query: recall@10 vs that user's EXACT top-10; UNDER-FILL rate (<10 rows counted as misses, never re-normalized); leak check (zero rows outside permission); p50/p95 after warm-up.
- Same ~200 real queries for every user; no random vectors.
- Router: calibrate thresholds on a dev half; report held-out half only.

## What makes it look fake
Random vectors; EXPLAIN only while the runtime section differs; blaming RCAC at a visibility where the index wasn't chosen; silently changing L; tuning router on reported queries; calling it "post-filtering" without evidence ("consistent with post-filtering").
Biggest attack: "at 27k rows EXACT is fast, why route?" → measure EXACT latency first (we see ~72 ms); lead with recall, under-fill, plan-sharing proof, zero leaks; router = pattern that matters at scale. Any padded-scale run labeled synthetic.

## Differentiation from AsOf (#49, WHERE filter recall 0.73)
RCAC is invisible to/cannot be rewritten by the app; selectivity sweep random + correlated; plan-sharing proof; held-out router + zero-leak test.

## Router
visible_n = SELECT COUNT(*) as the user (RCAC applies; cache per session); s = visible_n / N (N from admin stats row). If visible_n ≤ T → EXACT. Else APPROX with k' = bucket(ceil(10/s × m)) in {10,25,50,100,200} (literal), L = max(50, 3k') via guideline; take top 10; if <10 rows → EXACT fallback. Five fixed statement texts → clean package cache. Fit T, m on dev split.

## IBM material found
- Vector index tuning (Feb 2026): https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2026/02/09/vector-indexes-in-db2-understanding-the-search-acc
- Early preview: https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2025/10/04/vector-indexes-in-db2-an-early-preview
- Performance (PCT_COMP_VECT_SIZE, COMPRESSED VECTORS IN): https://community.ibm.com/community/user/blogs/zach-hoggard/2026/06/19/vector-indexes-in-db2-mastering-vector-index-perfo
- Haystack PR #4086 (NOT NULL; redundant predicate warning): https://github.com/deepset-ai/haystack-core-integrations/pull/4086
- Haystack issue #4047 (index metrics COSINE/EUCLIDEAN/EUCLIDEAN_SQUARED)
- Dhruv's mem0 PR #7553 has an ANN index section with a Community Edition container WARNING (content unseen) — read it.
- Analogies: pgvector applies WHERE after index scan; TiDB documents filter-then-search vs search-then-filter (<K results).

## JSON_TABLE (LUW)
Row path must be 'strict $' → one row per document, cannot expand arrays. Valid scalar form:
```sql
SELECT T.ID FROM NEEDLE.ADV_RAW R,
  JSON_TABLE(R.DOC FORMAT JSON, 'strict $' COLUMNS (ID VARCHAR(64) PATH '$.id') ERROR ON ERROR) AS T;
```
Term list as ONE parameter — recursive CTE split (pure SQL, works in SQL PL):
```sql
WITH s (rest, term, n) AS (
  SELECT CAST(? || ' ' AS VARCHAR(4000)), CAST(NULL AS VARCHAR(128)), 0 FROM SYSIBM.SYSDUMMY1
  UNION ALL
  SELECT SUBSTR(rest, LOCATE(' ', rest) + 1), CAST(SUBSTR(rest, 1, LOCATE(' ', rest) - 1) AS VARCHAR(128)), n + 1
  FROM s WHERE LOCATE(' ', rest) > 0 AND n < 64),
qt (term) AS (SELECT DISTINCT term FROM s WHERE term IS NOT NULL AND term <> '')
SELECT term FROM qt;
```
(expect SQL0347W; n<64 cap makes it safe). Legacy SYSTOOLS.JSON_TABLE returns array elements as rows (UNVERIFIED in 12.1.5).

## References (V = seen tonight)
VECTOR values (12.1), VECTOR_DISTANCE, CREATE PERMISSION (11.5), VERIFY_ROLE_FOR_USER, BUSINESS_TIME period, application-period temporal tables, JSON_TABLE (Db2 Warehouse LUW engine), SYSTOOLS JSON_TABLE, datageek RCAC db2exfmt; Filtered-DiskANN (WWW 2023), ACORN (arXiv 2403.04871), filtered ANN benchmark (arXiv 2509.07789); RRF (Cormack et al. SIGIR 2009, https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf); BM25 (Robertson & Zaragoza 2009, DOI 10.1561/1500000019); OSV schema; PEP 503/440; nomic-embed-text v1.5 card (prefixes required; Ollama doesn't add them); LangChain BaseRetriever (_get_relevant_documents).

## Risks
EXACT fast at 27k → lead with recall/plan sharing/zero leaks, not speed. Plan sharing false → still a finding; router still fixes under-fill. Guideline ignored (SQL0437W) → optimizer choice only. mem0 PR container warning may apply.
