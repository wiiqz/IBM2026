# NEEDLE — RCAC × native ANN experimental protocol
**Status:** Research design only; no experiments were executed by ChatGPT. Prepared 2026-11-09. The reported VECDB experiments and 26,842-row OSV dataset are provided by the builder, not independently re-run here.

## Decision and falsification
The primary product is permission-aware hybrid vulnerability retrieval. The research question is how Db2 12.1.5's native row permissions affect vector-index access paths, authorized top-10 recall and latency. Do NOT promise a recall failure or a router win. `FETCH APPROX` is not evidence of DiskANN selection. If all guarded queries use TBSCAN+SORT, report a *plan-selection finding*; do not label exact-search results ANN recall. If the index is used at any RCAC level, report that cohort separately. See IBM native docs: https://www.ibm.com/docs/en/db2/12.1.x?topic=subselect-fetch-clause , https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-ann-index-implementation.

## Frozen materials and audit manifest
- Freeze the actual PyPI OSV corpus and record acquisition endpoint, snapshot UTC, SHA-256, total records, MAL count, advisory records with versions, parse-failure count, embed-failure count, valid embeddings, and exact final table row count. The numbers 26,842, 12,015 MAL and 19,931 with versions are **builder-reported**, not independently verified here.
- Store Nomic model name/digest, `search_document:` and `search_query:` instructions, truncation policy, input fields and lengths, 768-dimension validation, pre-normalization choice, embedding output hash, and FLOAT32 conversion.
- Freeze data, commits, Db2 `SELECT service_level, fixpack_num FROM TABLE(sysproc.env_get_inst_info())` or other actually working version output (query **UNVERIFIED**), database configuration, vector index DDL, stats commands, index-existence checks, tablespaces and page sizes.
- Index is built after all inserts, then RUNSTATS; no further DML during trials. Db2's vector insert journal changes performance after updates: https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-ann-index-implementation.

## Users, permissions, fractions
Use five low-privilege, distinct Db2 connection identities for 10/25/50/75/100 visibility, or a documented trusted-context design actually proven to switch session authorization. Keep separate identities for loading/index maintenance. Never substitute app-only `user_id` filters for RCAC. Run `VALUES SESSION_USER, CURRENT USER` (syntax should be checked in Codespace) and `SELECT COUNT(*) FROM schema.advisories` through *each caller connection*. Record observed fraction, not intended percentage. Do not mutate permission DDL across benchmark runs: use a stable permission referencing an immutable, indexed entitlement table and authenticated SESSION_USER; verify security semantics and optimizer plans. Avoid profiles that accidentally have multiple permissions OR'ed together. Document who owns the permission, who has SECADM, and whether a routine is evaluated with the original caller's effective authorization.

Native RCAC is managed with CREATE PERMISSION plus ALTER TABLE ... ACTIVATE ROW ACCESS CONTROL. CREATE MASK and column control are a distinct secondary test; masking can interact with expressions and ranking. SECADM is needed to manage RCAC, not an unconditional bypass: https://www.ibm.com/docs/en/db2/12.1.x?topic=security-row-column-access-control-rcac .

## Selectivity assignment (three filter structures)
A. Independent random mask: deterministic hash of advisory ID + study seed, selecting exact fractions; keep fixed across queries; repeat with 3-5 seeds if possible.
B. Relevance-correlated: users can access many nearest neighbors, few far neighbors, or an explicit topic subcluster.
C. Relevance-anticorrelated: users cannot access many global nearest neighbors; the hardest post-filter failure case.
All three conditions must share a frozen index per corpus, but *different cohorts* are generated with stable salts and stored entitlements. At least 30 frozen queries for the minimum demo, 100 preferred, select queries before inspecting results. Validate visible rows and positive/negative query groups. Stratify MAL vs non-MAL results: malicious package reports may be true cases but are not interchangeable with conventional CVE advisories.

## Query matrix (paired within query and user)
1. `FETCH EXACT FIRST 10 ROWS ONLY` under each caller's RCAC: **authorized oracle**.
2. `FETCH APPROX FIRST 10 ROWS ONLY`, same query, same caller, same metric, same filters.
3. APPROX with documented SEARCH_LIST_SIZE 50/100/200 and optionally SEARCH_BEAM_WIDTH 2/10, *only if* the optimizer hint is verified as accepted and the physical index path is chosen.
4. An otherwise identical, explicit predicate query on a control table with no RCAC (or a justified authorization-preserving control); this is a *mechanism comparison*, not production security.
5. Global exact and global approximate on an authorized admin/research control **only for offline diagnostics**; never as the oracle for a restricted caller.
6. Router (frozen thresholds from development queries) vs always-EXACT and always-APPROX on a separate holdout set.
7. Optional *global approximate then post-filter* solely as a diagnostic; never expose unpermitted rows or scores to the app layer.

Use literal `10` in FETCH, not a parameter marker, for the primary trial (builder reports parameter-marker plans fail to select index). The claim must be re-verified on this Db2 version. SEARCH_LIST_SIZE controls graph candidate breadth; FETCH determines result count; do not conflate them.

## Actual optimizer evidence
Run `EXPLAIN PLAN WITH SNAPSHOT FOR <query>` and `db2exfmt -d VECDB -1 -o <file>` under the same identity/context as the timed query. Exact syntax/flags must be validated on the actual server. Retain full SQL text and the plan per query template and identity/profile; note vector-index object name, IXSCAN vs TBSCAN, operators, estimated cardinalities, and whether the plan changed. One example plan is insufficient. Record a `plan_verified` boolean plus plan artifact hash. Query plans compiled with actual literals vs parameter markers may differ. Do not claim index use solely because approximate SQL ran.

## Metrics
Authorized ground truth G(u,q) = EXACT top 10 *with same RCAC*. Approximate A(u,q) = results of the APPROX statement. Report recall@10 = |IDs(A) intersection IDs(G)|/|IDs(G)|. If |G|=0 report N/A, never 100%; for 1..9 visible neighbors, use |G| and separately report `returned_count`. Deduplicate IDs; stabilize ranking by `(distance, advisory_id)` for exact ties. Supplement with index-selection rate, returned_count@10, unauthorized-ID count, p50/p95 client-side query-only latency, query CPU/reads if available, cardinality and rows-visible fraction. Distinguish recall vs relevance metrics: user relevance labels are needed to claim semantic retrieval gains; exact-top-10 overlap only measures ANN accuracy.

Keep query-embedding/connection creation/LLM inference/UI rendering OUT of database latency. Pre-embed queries. Warm up each SQL shape (and exclude warmups), randomly interleave profiles and SQL methods, avoid parallel embedding ingestion, repeat each query/condition 3 times if time allows. Record isolation level, client location, memory, system load and whether cache was warm. Bootstrap confidence intervals clustered by query, not individual results; include distributions rather than a single cherry-picked row.

## Router credibility
Train deterministic policy on a development split and freeze thresholds before held-out evaluation. Policy could use verified visible-row count and known plan behavior: choose EXACT below an *observed* threshold, else APPROX with literal candidate depth/hints only if index actually selected. If privileged row-count metadata is necessary, avoid letting app user query unauthorized counts. Restrict telemetry to aggregate statistics and avoid membership leakage. Show a Pareto comparison of recall and latency vs static exact, static approximate and tuned approximate. Abstain from claim if no held-out improvement.

## Required failures / security negative tests
- Query for an embargoed advisory as an unauthorized principal: no result ID, title, snippet, body, candidate score, memo citation, chart tooltip, export, log or API response may expose it.
- Switch users within a Streamlit session and demonstrate fresh caller-scoped connection, no cache spill, no old result carryover. `st.cache_data` keys must include a security-context key and never cache sensitive cross-user content globally.
- Query using a distinct Db2 identity, not a Python string. Recheck `SESSION_USER`.
- No unauthorized data in intermediate `SESSION` temporary tables. Db2 docs say RCAC protection does not cascade into declared temporary tables created with a fullselect. Materialize only from already RCAC-authorized caller queries, and never allow an elevated helper to export unfiltered rows.
- SQL PL procedure must not silently execute under a higher privilege context. Prove actual caller-scoped permission results through the procedure itself. Never rely on LLM to enforce embargo.
- LLM report verifier must restrict output IDs to retrieved + authorized IDs; fail closed for unmapped IDs or unsupported version match. Record that the memo is advisory, not a vulnerability proof.

## Primary hazards
- A pure `TBSCAN + SORT` cohort gives no ANN-specific recall measurement; label it optimizer behavior.
- The embedding index might not be picked for 26,842 rows despite a valid index. Read IBM 12.1.5 fetch-clause selection details.
- Approximating candidate depth by increasing FETCH may change optimizer plan; inspect plans at every K.
- App-period `BUSINESS_TIME` tracks *effective validity as supplied by the application*, not when the service learned a new fact. To say 'exposed since', intersect valid SBOM possession intervals with versions actually affected. To say 'first discovered', store event/ingest timestamps; BUSINESS_TIME is not SYSTEM_TIME.
- BM25: document IDF corpus scope. A global IDF computed across embargoed records could influence a permitted user's rank and constitute an inference channel; use explicitly documented research mode or user-visible statistics. Raw per-user IDF can be expensive and not trivially cached.
- Built-in IBM cookbook already does hybrid RRF; originality must come from empirical RCAC/ANN, temporal applicability and verifiable guardrails: https://github.com/IBM/db2-ai-cookbook.

## Report template
A figure with x=observed authorized fraction, y=authorized recall@10 and separate line/column for index-selection rates; small multiples by random/correlated/anticorrelated assignment. A separate p50/p95 latency plot. A plan-state table with per-condition result counts and access paths. Every plot states `N queries`, seed and corpus hash. Include negative/flat findings; no preset result or invented benchmark values.

## Final go/no-go
G0 Db2 native vector index setup and real corpus loaded; G1 same-caller EXACT/APPROX under two identities with EXPLAIN; G2 one pre-registered visibility sweep; G3 router holdout only if first two index/metric gates work; G4 UI and submission. If G1 finds no index use, pivot presentation to RCAC-driven optimizer switching plus safe exact retrieval and do NOT spend the final hour on a phantom ANN fix.
