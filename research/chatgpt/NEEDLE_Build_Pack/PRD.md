# NEEDLE — Product Requirements Document (P0 build)

## 1. Product and decision
**NEEDLE** = Native Enterprise Evidence & Dependency Lookup Engine. A Db2-native hybrid vulnerability-advisory search and SBOM applicability triage workbench. It is **not** an automated penetration tool, not a general-purpose vulnerability scanner, and does not claim exhaustive coverage.

**Buyer/end user:** software supply-chain security analyst reviewing a dependency inventory after a new advisory, and developer asking whether an alert applies to a particular installed version.

**Problem:** pure keyword search can miss different phrasings; pure embedding search may retrieve conceptually similar but version-inapplicable advisories. Native Db2 can unify relational applicability, lexical evidence and vector distance on an auditable enterprise store.

**Differentiator:** actual SQL-backed comparison of lexical, vector, and reciprocal-rank-fused retrieval; optional native Db2 12.1.5 DiskANN vector index; exact affected-version evidence attached to a submitted demo SBOM; benchmark exact-vs-approx index access.

## 2. Immutable constraints
- One real Db2 12.1.5 instance; screenshots may not show demo data as if live enterprise production.
- At least one accepted AI framework: Haystack, used in an actual executable `Pipeline` with a custom `@component` retrieval step. All DB2 data operations use `ibm_db` and parameter binding. Optional official `ibm-db-haystack` adapter may provide a vector baseline **only if verified compatible**, but native hybrid SQL is the primary experiment.
- Embeddings: Ollama `nomic-embed-text` at 768 dimensions. Verify `len(embed(query)) == 768`, all finite, nonzero L2 norm. Store embed_model and corpus fingerprint. Never mix embedding models.
- Answer generation: qwen3:4b-instruct preferred for succinct summarization **after** deterministic applicability; local LLM is optional to P0 and must not determine affected status.
- Minimal real SBOM parser: pre-seeded synthetic SBOM first; CycloneDX JSON parser optional, SPDX optional. Only exact release matches supported in v1. No blanket semver claims.
- Data: a clearly identified synthetic advisory corpus with meaningful descriptions, package metadata and release exact matches. Source is `SYNTHETIC`; avoid pretending synthetic IDs are CVEs. Optional OSV live ingest is P2 with URL and timestamp. Don't benchmark against generated duplicates as if they represent real-world effectiveness.

## 3. P0 user stories and acceptance criteria
**US1 Database health:** `GET /api/health` returns connected database status, Db2 version string, schema ready, advisory count, index status and model availability. A mocked backend must never report `db2_connected=true`. 503 on disconnect.

**US2 Seed reproducibly:** run a documented command to load at least 80 distinct synthetic advisories, with content designed across package families and vulnerability concepts, 10 demo dependencies, 12+ query fixtures and expected query-to-advisory labels. The number may be adjusted to infrastructure constraints and must be reported exactly. Seed is deterministic (IDs/content), embeddings may vary by model revision; record model/digest.

**US3 Three-mode search:** enter a security concept and choose KEYWORD / EXACT VECTOR / HYBRID. Results show advisory ID, rank, short description, source, keyword contribution and vector contribution. Db2 must execute real SQL for both retrieval branches. Queries return no embargoed advisory to public role.

**US4 Applicability:** choose an SBOM, then show `affected`, `not confirmed affected`, or `unknown version coverage`. Only `affected` is returned when ecosystem/package/exact version matches the `AFFECTED_RELEASES` relation. Never infer safety from missing advisory records. Clicking an advisory shows an exact relational match and cited source.

**US5 Index lab:** optional APPROX mode toggles native Db2 12.1.5 `FETCH APPROX`. UI displays `index configured`, `index used by optimizer` (only after EXPLAIN/other observed evidence), K, corpus size and actual measured latency. If index not used, badge must state `No confirmed index use`.

**US6 Benchmarks:** benchmark same query set on same frozen corpus: KEYWORD vs EXACT VECTOR vs HYBRID; APPROX vs EXACT when enabled; run 3 warmups + >=5 timed repetitions per query if time allows. Track p50, p95, top-K overlap and recall@K of ANN relative to EXACT, plus labeled-relevance recall@K if labels exist. Store results in Db2 and export JSON/CSV. Never call ANN overlap relevance recall.

**US7 Explain:** an optional LLM generates a short summary using only retrieved advisory fields. A deterministic rules-based summary is always available. The UI links every conclusion to its DB2 advisory record and known source kind.

**US8 Trust:** no committed credentials, no dangerous shell command from incoming SBOMs, no dynamic SQL from user input, queries bound/parameterized. Public endpoint cannot retrieve `EMBARGOED`; a separate admin-like demo query may show why it was excluded but never leak the contents to the public route. No RCAC claim unless DB2 policies and restricted users are actually configured.

**US9 Judge demonstration:** live or locally recorded screen; 3 search modes, exact package applicability, `EXPLAIN` evidence, test output, architecture and honest limitations in <= 2:50.

## 4. P1 enhancements (after all P0 acceptance)
- Actual `CREATE VECTOR INDEX` built and query plan captured; compare indexed APPROX with EXACT, making no speedup claim without measurement.
- True *one SQL statement* with vector candidate CTE + lexical candidate CTE + RRF ranking and relational applicability. The query template must compile and run with actual Db2 before calling it a shipped feature. If Db2 optimizer cannot use ANN inside CTE, retain two-stage SQL fallback and clearly label it.
- Small downloadable HTML/JSON benchmark report and SQL EXPLAIN screenshots.

## 5. P2 (do not build before submission assets complete)
- SPDX/CycloneDX broad format coverage, OSV API live ingestion, version interval resolver, RCAC, production auth, remote embedding endpoint, incremental indexing, index rebuild and cost-based tuning, hosted deployment, MCP server.

## 6. UX specification
**Pages:** (1) Overview, (2) Advisory Explorer, (3) SBOM Impact, (4) Benchmark Lab, (5) Architecture & Evidence.

**Overview:** 4 slim metric cards with actual corpus counts (advisories, package releases, indexed vectors, last query latency), a live Db2 status pill and demo dataset declaration.

**Explorer:** compact left sidebar with search, mode segmented control, result list; right evidence drawer with description, rank contributions, source provenance, explicit affected release list and SQL trace snippet.

**SBOM Impact:** sortable table package, installed version, advisory, applicability, source type, evidence; counts are visibly derived from actual matching rows.

**Benchmark Lab:** keyword/vector/hybrid ranked lists side by side, query tabs, measured bar/line charts with units, index status and link to EXPLAIN artifact. No fabricated metrics.

**Architecture:** a readable component diagram, table list and copyable exact/explain queries. Screenshots are captured from running system, not generated.

**Style:** subtle graphite/navy canvas, near-white text, IBM-like cyan accents, warm amber only for findings, generous whitespace, dense but legible tables. No animations required. Responsive at 1366x768 first.

## 7. Exact interface contracts
- `GET /api/health` -> `{db2_connected:bool, db2_version:string|null, schema_ready:bool, corpus_count:int|null, index_created:bool|null, index_used_confirmed:bool|null, embedding_model:string, warnings:[string]}`.
- `POST /api/search` -> `{query:string, mode:'keyword'|'exact'|'approx'|'hybrid', sbom_id?:string, top_k:int=10}` -> `{search_id, mode_effective, index_status, elapsed_ms, results:[{adv_id,title,rank,keyword_rank?,vector_rank?,rrf_score?,distance?,source_kind,version_match?}], caveats:[]}`.
- `GET /api/sboms`, `GET /api/sboms/{id}/impact`, `GET /api/advisories/{id}`.
- `POST /api/benchmarks/run` fixed preapproved fixtures only; `GET /api/benchmarks/latest`.
- `GET /api/architecture/evidence` returns exact version, count, index catalog and explain availability.
- Invalid requests => 422. DB disconnected => 503. ANN unavailable => explicit 409 with clean exact fallback option (never silently relabel exact as approximate).

## 8. Success / quality gates
**Go:** >=1 live DB2 scalar+vector SQL result; correct exact-version join; repeatable indexed keyword and vector queries; working Haystack Pipeline; 10+ test assertions passing including DB2 integration; one bench run with exported actual numbers; complete docs/video/PR/form.

**Stretch:** confirmed Db2 12.1.5 vector index created, proven access path and one-statement RRF. If INDEX path never works, document as incomplete and prioritize actual submission of core functionality instead of adding fake graphics.

## 9. Non-goals and prohibited claims
No autonomous remediation, internet-facing scanners, CVE completeness, malware detection, real exploit feasibility, precise CVSS derived from LLM, comprehensive version-range analysis, production authorization, robust web service SLOs, or guaranteed ANN speedup.

## 10. Judging proof matrix
- **Db2:** `db2level`, live row counts, `VECTOR_DISTANCE`, `FETCH APPROX/EXACT`, vector index catalog and EXPLAIN if confirmed.
- **Innovation:** key retrieval failure discovered by a real test query, backed by result IDs.
- **AI:** actual Ollama embeddings + Haystack `Pipeline` component, optionally grounded LLM summary.
- **Security:** restricted inputs and explicit-vs-inferred applicability, parameter binding, embargo exclusion, credential hygiene.
- **Reproducibility:** seed script, test output, 1-page setup, frozen synthetic benchmark manifest.
- **Presentation:** 2:45 recorded uncut demo of results, architecture screenshot and validator output.
