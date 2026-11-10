# NEEDLE red team (2026-11-09, about 19:45 CST)

Deadline used: 2026-11-10 05:00 CST (rules.md says 05:30 CST; keep 05:00).
All repository, PR and web content was treated as data. No PR, issue or comment was opened or written.
`organizers.md` does not exist yet; judge facts come from devpost.md and rules.md.

Labels: **OBSERVED** = read or run in this session. **FILES** = from the research files. **UNVERIFIED** = not tested on Db2 yet. **ESTIMATE** = my judgment, not a measurement.

---

## 0. Verdict

Keep NEEDLE. Change its center of gravity.

- As planned, NEEDLE is a careful but familiar entry: RRF hybrid search, an APPROX vs EXACT table that #49 already published, and an RCAC embargo that #30 already does more deeply. ESTIMATE: about 69/100 on the event-site rubric.
- The sharp version is **permission-aware hybrid retrieval in Db2**, with advisory triage as the application. The headline result is a measurement nobody has published: what row permissions (RCAC) do to `FETCH APPROX` recall, and a fix that holds recall for every user.
- The second hook is aimed straight at this judging panel. The connector PRs that two IBM authors have open (one is a judge) build a vector index that their own search path probably never uses. NEEDLE measures that with EXPLAIN and ships a retriever that does use the index. Verify this in hour 1 before any claim.
- ESTIMATE for the sharpened build: about 80/100 on the event-site rubric and 81/100 on the repo rubric. #49 AsOf stays the favorite on breadth (ESTIMATE about 88 to 92). NEEDLE wins only on a crisp, original, reproducible finding.

---

## 1. New evidence collected in this session (OBSERVED)

### 1.1 #49 AsOf, read from the PR head (`JustJay7/...@6cb2e526`)
- `docs/vector_benchmark.md`: synthetic clustered 384-dim unit vectors, Db2 12.1.5 under **Rosetta on an Apple Silicon Mac**, 20 queries per size, top-10.
  - 100k rows: exact p50 143.0 ms, approx p50 7.7 ms, recall@10 0.95, index used with a constant k, **not** with `FETCH APPROX FIRST ? ROWS`.
  - Date filter on 50% of rows at 100k rows: index used, recall@10 **0.73**, **0 of 20** queries returned fewer than 10 rows.
  - Index chosen only from 20k rows upward.
- AsOf's production retrieval uses `FETCH EXACT FIRST ? ROWS ONLY`. Its vector index is a benchmark exhibit, not its serving path.
- AsOf RCAC = four **column masks** on the ledger plus a `1 = 0`-avoiding permission on an MQT. **No row permission on any vector table. No filtered-ANN measurement under RCAC.** No keyword search.
- AsOf credits nothing about filtered recall beyond the single 50% date point.

### 1.2 IBM documentation and blogs
- fetch-clause page: "For vector tables with nullable vector columns, the optimizer chooses an EXACT search instead of using the index ... even when the query includes the APPROX clause. A VECTOR index can still be used if a NOT NULL predicate is included in the query." RUNSTATS is required. The metric must match.
- The fetch-clause page, the CREATE VECTOR INDEX page and both IBM community blogs say **nothing** about WHERE predicates, row permissions, pre-filter or post-filter with the vector index, or whether fewer than k rows can come back. A web search found no source on RCAC plus vector index.
- Query-time knob: `SEARCH_LIST_SIZE` (L, default 50) and `SEARCH_BEAM_WIDTH` (W, default 2), set per query through `OPTGUIDELINES`, example `<IXSCAN TABLE='VD1' SEARCH_LIST_SIZE='100'/>` (Garcia-Arellano, Feb 2026). IBM's numbers on 10M 768-dim vectors: L=10 about 68% recall, L=50 about 90%, L=100 about 97%.
- `PCT_COMP_VECT_SIZE` 5% to 15%: recall change under 1% (Hoggard, Jun 2026). A sweep of it is not worth the time.
- Early preview (Oct 2025): "A table with a vector index becomes read-only", and no new index of any type after the vector index. GA status of both: UNVERIFIED. Design so that it does not matter.

### 1.3 Connectors the judges wrote (installed source and open PRs)
- `langchain-db2` 1.0.0 `DB2VS`: creates `embedding vector(n, FLOAT32)` **nullable**. Search SQL is an f-string with the vector and k inlined, `ORDER BY distance FETCH FIRST {k} ROWS ONLY`, no `IS NOT NULL`, no APPROX (a TODO says so). The metadata `filter` is applied **in Python after the top-k fetch**, so a filtered search can return fewer than k documents, or none. #30 Custodian lists this as roadmap but did not measure or fix it.
- **langchain-ibm PR #342** by **DhruvChaturvediIBM** (a judge), open: adds `create_index()`. Its own description: "purely additive — no existing search, ingestion, or retrieval logic is modified". So the column stays nullable and the search has no `IS NOT NULL`. By IBM's fetch-clause text, the index that `create_index()` builds is **not chosen** by `similarity_search()`. Its test runs a search after `create_index()`; an exact scan also passes that test. **UNVERIFIED on Db2 until an EXPLAIN.**
- `ibm-db-haystack` 1.0.0: filters are pushed into SQL `WHERE` (good), the query has `embedding IS NOT NULL` (good), but k is a parameter marker: `FETCH FIRST ? ROWS ONLY`. **Haystack PR #4086** (GeetikaChughIBM, open) adds `CREATE VECTOR INDEX` and a NOT NULL column, but does not touch the `FETCH FIRST ? ROWS` line. By #49's finding, a parameter-marker k stops the index match. **UNVERIFIED for the no-keyword case.**

### 1.4 OSV data
- `PyPI/all.zip` is 37.7 MB compressed (Last-Modified 2026-11-09 23:33 GMT). Record count: UNVERIFIED (ESTIMATE 15k to 30k including `MAL-*`).
- `PYSEC-2020-96` and `GHSA-6757-jp84-gxfx` (PyYAML, CVE-2020-1747) are aliases and have **the same details text** (copied from NVD). Both carry enumerated `affected[].versions` (7 and 8) plus an `ECOSYSTEM` range. Consequence: the deterministic SBOM join is feasible, and the planned "cross-source" or "masked details" eval is leaky (see A5).

---

## 2. The five strongest attacks and how to neutralize each

### A1. "AsOf already did APPROX vs EXACT, and even a filtered case."
Attack. #49 published 1k to 100k rows, latency, recall, the parameter-marker trap, the 32K page need, and a 50%-selective date filter (0.73). A second APPROX vs EXACT table is a rerun on a judge's desk that already has the first one.

Fix.
- Drop APPROX vs EXACT as a result. Keep it only as the 100%-visible point of the RCAC sweep.
- Credit the parameter-marker finding to #49 in one line and cite IBM's L-vs-recall numbers for the unfiltered case.
- Measure what #49 and IBM did not: recall and rows returned **as a function of permission selectivity**, enforced by **RCAC row permissions** (not a WHERE the app wrote), on **real 768-dim text embeddings** on **native x86** (not synthetic clusters under Rosetta), plus the connectors' behavior on the same data.
- Report the mitigation and its cost, not just the loss.

### A2. "BM25 in SQL is a toy. Db2 has Text Search. And you tokenize in Python anyway."
Attack. BM25 over a postings table is a classroom exercise. Db2 Text Search exists. The SQL only adds a formula on top of a Python tokenizer. A variable-length `IN (?, ?, ...)` list is string-built SQL.

Fix.
- Spend 10 minutes on `db2ts ENABLE DATABASE FOR TEXT`. If it works, add `CONTAINS`/`SCORE` as a third keyword leg and compare. If it fails, commit the exact error text as evidence. Do not cite #49 for it; reproduce it.
- Make the keyword leg do the job vectors cannot: an **identifier-preserving tokenizer** (keep `yaml.full_load`, `FullLoader`, `CVE-2020-1747`, `GHSA-...`, package names, version strings; no stemming of code tokens).
- Keep the statement text fixed: pass the query terms as **one JSON array parameter** and expand it with `JSON_TABLE` inside the SQL. No string building.
- Keep corpus statistics (df, average length) in tables refreshed by one SQL PL procedure. Put a B-tree index on `POSTINGS(TERM)`. Commit the db2exfmt plan.
- Add a **parity test**: the SQL BM25 top-10 equals `rank_bm25` on the same tokens for 50 queries. That turns "toy" into "verified".
- Frame the contribution as one optimizer plan: ANN index scan + relational keyword scoring + permission predicates + inventory join, not "we wrote BM25".

### A3. "Innovation is weak. RRF is commodity, and osv-scanner already matches SBOMs to OSV with no AI."
Attack. Elastic, OpenSearch and pgvector+tsvector all ship hybrid RRF. For any named advisory, osv-scanner / pip-audit give the exact answer deterministically. "Vague advisory" sounds contrived.

Fix.
- Concede the deterministic part and use it. The **decision** "service X is affected" comes only from an exact SQL join of normalized SBOM versions against OSV `affected[].versions`. Retrieval only **identifies candidate advisories**. The LLM decides nothing.
- Name the real gap: the hours before an advisory has a package name and range (mailing-list or chat reports, vendor bulletins that name products, internal findings), plus the pile of near-duplicate advisories a triager must search by meaning and by identifier at once.
- Move the novelty claim to what is new and useful to every Db2 RAG user: **retrieval that honors Db2 row permissions without silently losing recall**, and **evidence about the official connectors' index use**. Rubric text: "Practical for enterprise, developer tooling". Both fit.
- Commit to per-slice reporting. Expect vector to win on vague text and keyword on identifiers. The hybrid claim is "best worst-slice", not "beats both everywhere".

### A4. "RCAC + APPROX hurts recall, and your RCAC leaks anyway."
Attack, three parts.
1. Recall: a junior analyst's top-10 is worse than a senior's, not just shorter by the embargoed rows. Or the optimizer drops the index under RCAC and the latency claims are wrong.
2. Leak: RCAC on `ADVISORY` alone leaves `POSTINGS`, the embedding table and df statistics readable. Terms, scores and embeddings of embargoed advisories leak (embeddings can be partly inverted to text).
3. Plan sharing: one cached plan serves all users, but selectivity differs per user, so a cost-based choice cannot be right for both (UNVERIFIED hypothesis).

Fix.
- Put the **same permission** on every table that carries advisory content: advisory, postings, vectors, and the df statistics (compute stats over public rows only, or per tier).
- Keep embargo state in a **separate small table** `EMBARGO(ADV_ID, LIFTS_AT)`. The permission is `senior role OR NOT EXISTS (embargo row with LIFTS_AT > CURRENT TIMESTAMP)`. Embargo lifts by time with no DML on the indexed table, so a read-only-after-index rule does not matter. Subquery in a permission: expected to be allowed, UNVERIFIED.
- Test as the junior user: every table returns zero embargoed IDs; `COUNT(*)` equals the public count; 10,000 APPROX queries never return a forbidden ID.
- Measure recall loss honestly (section 3). Note: for embargo alone, about 95%+ of rows stay visible, so the loss is small. The sweep must use a selective tenant-style permission to show the real failure mode.
- Ship the router in section 3.3 and show it holds recall at every selectivity.
- Also from A4: literal k is required for the index, so keep a **closed set of statement texts** (k and L from a fixed ladder), never interpolated. Vectors and dates stay bound as `?`.

### A5. "Your eval is circular."
Attack. Masked `details` text queried against the same `details` text makes vector recall near 1.0 by construction. PYSEC and GHSA aliases share NVD text, so a "cross-source" query hits its own duplicate. Any hybrid win is an artifact.

Fix.
- Deduplicate the index by alias group (CVE / GHSA / PYSEC). Ground truth = the alias group.
- Slice 1, identifier queries (real): CVE ID only, package name plus a function or module token only.
- Slice 2, vague queries (synthetic, labeled as such): qwen3:4b-instruct paraphrases the summary as chat talk without the package name or IDs. Generator differs from the embedder. Drop any query whose longest shared word n-gram with its target is 6 or more, and report how many were dropped.
- Freeze the query files with SHA-256 and commit the run JSON.
- Optional real slice (SHOULD, time permitting): fix-commit messages from OSV `FIX` references.

### Also likely from a Db2 engineer (short answers ready)
- "Does APPROX survive inside a CTE with FULL OUTER JOIN?" UNVERIFIED; gate G3. Fallback: SQL PL with a declared temporary table. Then claim "one procedure call", not "one statement".
- "Why Db2 and not Elastic with document-level security?" The advisories, the SBOMs, the deploy history and the entitlements sit in one database under one permission model. There is no second store whose ACLs drift.
- "Can a judge reproduce a Linux-only index?" Ship a `.devcontainer` that boots Db2 12.1.5 and runs the eval with one command, and commit the frozen embeddings for a small eval corpus so Ollama is optional.

---

## 3. Differentiator: filtered ANN under RCAC

### 3.1 Is it real Db2 behavior worth showing?
Yes. Reasons:
- **Documented gap (OBSERVED):** no IBM page or blog states how predicates or row permissions interact with the vector index scan, or whether fewer than k rows can be returned.
- **One data point exists (OBSERVED, #49):** a 50%-selective predicate cut recall@10 from 0.95 to 0.73 while still returning 10 rows. That pattern fits a fixed candidate list (L=50) filtered during or after traversal.
- **Prediction (UNVERIFIED):** if that is the mechanism, recall keeps falling as selectivity drops, and short results appear once visible candidates in the list fall under k (around k/L, that is near 20% visible for L=50, k=10). If Db2 instead searches on until k rows pass, recall holds and latency rises. Either outcome is a publishable finding.
- **RCAC equals an injected predicate (documented RCAC behavior), but its effect on the vector access path is undocumented (UNVERIFIED).** The optimizer may also skip the index when RCAC is active. Each outcome is a result.
- **Panel relevance:** the connector authors either filter after top-k in Python (LangChain, guaranteed short results) or push the filter into SQL with a parameter-marker k (Haystack, probably no index). Both meet this exact problem.

### 3.2 Experiment protocol (about 60 min after data and RCAC exist)
- Table `ADV_VEC(ADV_ID, BUCKET SMALLINT NOT NULL, EMB VECTOR(768, FLOAT32) NOT NULL)` in a 32K tablespace. `BUCKET` = hash(ADV_ID) mod 1000, so it is independent of content.
- Order: load, then create permissions and activate row access control, then build the vector index, then RUNSTATS. (ALTER on a table with a vector index: UNVERIFIED, so avoid it.)
- Permission: `VERIFY_ROLE_FOR_USER(SESSION_USER,'NEEDLE_ADMIN') = 1 OR BUCKET < (SELECT MAX_BUCKET FROM NEEDLE.GRANTS WHERE AUTHID = SESSION_USER)`.
- One bench user. The admin changes `GRANTS.MAX_BUCKET` to set visible fraction s in {100, 50, 20, 10, 5, 2, 1}%. The indexed table is never touched.
- For 100 frozen queries per s, as the bench user:
  1. `FETCH EXACT FIRST 10` = ground truth (the true permitted top-10).
  2. No keyword (optimizer choice).
  3. `FETCH APPROX FIRST 10` (L=50 default).
  4. Over-fetch: `FETCH APPROX FIRST 50 / 200 / 1000 ROWS` in a subquery, outer `FETCH FIRST 10` (literal ladder).
  5. `SEARCH_LIST_SIZE` 100 / 200 / 400 through embedded `OPTGUIDELINES` (needs `DB2_OPTPROFILE=YES`, UNVERIFIED; timebox 15 min; fallback: skip, keep 4).
  6. DB2VS-style: unfiltered top-10 as admin, then filter in Python (what `langchain-db2` does today).
- Record per cell: recall@10, mean rows returned, count of short results, p50 and p95 ms, index used yes/no (EXPLAIN once per cell), and a safety counter (forbidden IDs returned, must be 0).
- SHOULD: run two users with different grants and read `MON_GET_PKG_CACHE_STMT` to see whether they share one plan.

### 3.3 Mitigation to ship: the plan router
Implement it in the retriever (Python, closed statement set) or in SQL PL if guidelines survive there.
1. Count visible rows for the session user: `SELECT COUNT(*) FROM ADV_VEC` (RCAC applies). Cache per user for 5 minutes.
2. If visible rows <= T (start with T = 5,000; tune from the sweep): use `FETCH EXACT`. Exact over a small permitted set is precise and cheap.
3. Else pick the smallest over-fetch k' (or L) from the ladder with k' * s >= 3k. Example for k=10: s=100% gives 50, s=20% gives 200, s=5% gives 1000 (cap). Above the cap, use EXACT.
4. Structural variant for the embargo demo: keep public advisories in the indexed table (s=100% for everyone, full ANN recall) and embargoed ones in a small unindexed table protected by RCAC; `UNION ALL` the two legs, then take the top-k. Show it as the zero-loss design for low-cardinality secrets.
5. The router chooses per call, so a cached plan shared across users cannot pick the wrong path.

### 3.4 The chart
- Figure 1, headline: "Recall@10 under Db2 row permissions". X = visible fraction s on a log axis (100% down to 1%). Y = recall@10 against the permitted EXACT top-10. Lines: APPROX default, best fixed over-fetch, NEEDLE router, DB2VS-style post-filter. Hollow markers where mean rows returned < 10. A thin bar strip under the x-axis shows short-result counts.
- Figure 1b: p50 latency on the same x-axis, same lines, plus EXACT. The router must be near APPROX at high s and near EXACT at low s.
- Table under the figures with every number and an "index used" column from EXPLAIN.
- Figure 2: grouped bars, recall@10 and MRR, keyword / vector / hybrid, per slice (identifier, vague), with the query count n on each slice.

---

## 4. Name and pitch

Keep **NEEDLE** (slug `needle`; no collision in the 50 PRs). The Haystack pun works on the `ibm-db-haystack` authors.

One line: **"NEEDLE finds which of your services a vague security advisory hits, with keyword and vector search fused in one Db2 plan, and Db2 row permissions that hide embargoed advisories without silently costing anyone recall."**

Short form for the video title: "Permission-aware hybrid search in one Db2 plan."

---

## 5. Ranked feature list

Points are ESTIMATES of the marginal score on the event-site rubric (25 / 20 / 15 / 15 / 15 / 10). They assume the feature works and is documented.

### MUST (core in by hour 5, about 00:45 CST; ship block fixed at the end)

| # | Feature | Rubric rows | ESTIMATE |
|---|---|---|---|
| M1 | **Gate probes, 45 min:** index use with literal-k APPROX; APPROX inside CTE + FULL OUTER JOIN; index use with a row permission active; EXPLAIN of DB2VS search after PR #342-style `create_index()` and of the Haystack `FETCH FIRST ? ROWS` query; 10-min `db2ts` probe. Commit every result as a findings table. | Db2, Innovation | +3 |
| M2 | OSV PyPI ingest: raw JSON in CLOB, `MERGE` (idempotent), `JSON_TABLE` shred of affected packages and versions (Python fallback after 20 min), alias-group dedupe; nomic 768-dim, `NOT NULL` vector column, 32K tablespace, vector index, RUNSTATS. | Db2 | +3 |
| M3 | Keyword leg in SQL: identifier-preserving tokenizer, postings + df + length tables, BM25 in SQL, terms passed as one JSON parameter through `JSON_TABLE`, parity test vs `rank_bm25`. | Db2, Security, Repro | +3 |
| M4 | Fusion: `TRIAGE` procedure (or one statement) with RRF over the APPROX leg and the BM25 leg; closed statement set; db2exfmt plan committed. | Db2, Arch | +4 |
| M5 | RCAC: `EMBARGO` table with time-based lift; one permission pattern on advisory, postings, vectors and stats; masks on details; users `needle_app` (EXECUTE only), `analyst_jr`, `analyst_sr`; leak tests per table. | Security, Db2 | +5 |
| M6 | Filtered-ANN sweep (section 3.2), router (3.3), Figure 1. | Innovation, Db2, Arch | +5 |
| M7 | Retrieval eval: frozen query sets, per-slice recall@10 and MRR, Figure 2, run JSON with SHA-256. | Innovation, Arch, Repro | +3 |
| M8 | LangChain `Db2HybridRetriever(BaseRetriever)` that runs on the **caller's own Db2 connection** (RCAC follows the user). Mandatory framework rule. | Arch (eligibility) | +2 |
| M9 | Minimal SBOM path: 10 to 20 CycloneDX files, components table, versions normalized with `packaging` at ingest, exact join to OSV versions, "affected services" output. | Innovation | +2 |
| M10 | Ship block (02:30 to 05:00): README, architecture.md, submission.json, `.env.example`, validator run, about 10 pytest tests, `.devcontainer`, video under 3 min, PR, Google Form, LinkedIn. | Docs, Repro | base |

### SHOULD (in order, 00:45 to 02:30)

| # | Feature | Rubric rows | ESTIMATE |
|---|---|---|---|
| S1 | LLM triage note (qwen3:4b-instruct for speed): JSON output; every (service, package, advisory) tuple must exist in the SQL join result, others are dropped; planted prompt-injection advisory test. | Security, Arch/AI | +2 |
| S2 | Connector notes: a short doc with the EXPLAIN evidence and a minimal diff for `langchain-db2` (NOT NULL column or `IS NOT NULL` predicate, literal-k ladder, filter pushdown into SQL) and for `ibm-db-haystack` (literal k). Do not open upstream PRs or comments without the user's approval. | Innovation, Db2 | +2 |
| S3 | Haystack `@component` wrapper over the same procedure. | Arch, panel affinity | +1 |
| S4 | `BUSINESS_TIME` deploy history: "exposed since" window per service. | Db2, Innovation | +1 |
| S5 | Plan-sharing check across two users with `MON_GET_PKG_CACHE_STMT`. | Db2 | +1 if confirmed |
| S6 | Correlated-filter sweep (tenant = ecosystem) beside the random-bucket sweep. | Innovation | +0.5 |
| S7 | One Streamlit page with a junior/senior switch, for the video. A `rich` CLI is the default. | Docs | +0.5 |

### CUT

| Item | Reason |
|---|---|
| Unfiltered APPROX vs EXACT scaling table as a result | Done by #49 and by IBM's blog. Keep only the s=100% point. |
| `PCT_COMP_VECT_SIZE` sweep | IBM measured under 1% recall change. |
| Db2 Text Search beyond the 10-min probe | #49 reports it fails in the container; time sink. |
| MCP server, CrewAI or LangGraph agents | No score gain; #49 owns MCP. |
| Hash-chained audit ledger | Saturated (#8, #41, #43, #49). |
| 100k multi-ecosystem corpus | Only if PyPI is under 20k rows and the index is not chosen. Then add npm GHSA records (not `MAL-*`). |
| Fix-commit-message query slice | Real but needs GitHub API time. |
| UI polish | Judges read README, plans and charts. |

### Score summary (ESTIMATE, not measured)

| Rubric | Db2 | Innov | Arch | Sec | Repro | Docs | Total |
|---|---|---|---|---|---|---|---|
| Event site (25/20/15/15/15/10), NEEDLE as planned | 20 | 11 | 11 | 10 | 10 | 7 | 69 |
| Event site, sharpened (MUST + S1 to S3) | 22 | 15 | 12 | 12 | 11 | 8 | 80 |
| Repo/Devpost (30/25/20/–/15/10), sharpened | 27 | 19 | 16 | – | 11 | 8 | 81 |

Failure case: if the index is unusable under RCAC or inside the fusion, report it with EXPLAIN evidence and fall back to EXACT plus the split-table design. ESTIMATE then: 72 to 75.

---

## 6. Abandon NEEDLE?

No. No alternative is clearly better and buildable in 8 hours.
- A connector-fix-only entry would please the panel but scores weakly on "real problem" and "application". NEEDLE carries it as S2.
- Timeron, TraceForge and QueryShield lose on overlap or feasibility (competition.md).
- MemoryWeave is not novel (consult file).

---

## 7. Schedule (from about 19:45 CST)

| Time | Work | Gate |
|---|---|---|
| 19:45-20:30 | M1 probes. Background: download OSV, embed, generate paraphrases. | G1 index used with literal k; G2 index used with a permission active; G3 APPROX inside the CTE |
| 20:30-21:30 | M2, M3 | G4 vector index built, parity test green |
| 21:30-22:15 | M4 | G5 fused plan EXPLAIN committed |
| 22:15-23:00 | M7, Figure 2 | numbers exist; freeze scope |
| 23:00-00:00 | M5, M6, Figure 1 | leak tests green, sweep JSON written |
| 00:00-00:45 | M8, M9, CLI demo | end-to-end demo runs |
| 00:45-02:30 | S1, S2, S3, then S4 if time | |
| 02:30-05:00 | M10 ship block; PR by 04:30 | validator exit 0 |

Data path: embed on Windows (local Ollama), copy one compressed `.npy`/`.parquet` file with `gh codespace cp`, insert inside the Codespace. Do not push 768-dim literals through a forwarded port.

---

## 8. Open items (UNVERIFIED until tested)

1. Index use for DB2VS search after PR #342's `create_index()` (nullable column). This is the most valuable single check.
2. Index use for the Haystack query with `FETCH FIRST ? ROWS` and no APPROX keyword.
3. `CREATE VECTOR INDEX` on a table with active row access control, and index use under a permission.
4. APPROX inside a CTE joined with FULL OUTER JOIN.
5. Embedded `OPTGUIDELINES` with `SEARCH_LIST_SIZE` (and `DB2_OPTPROFILE=YES`).
6. Over-fetch k' raising the effective search list.
7. Subquery inside `CREATE PERMISSION`.
8. Read-only table after index build in 12.1.5 GA.
9. OSV PyPI record count, and the share of records with enumerated versions.
10. Embedding throughput on this machine (GPU presence UNKNOWN).

## Sources
- #49 head files: `docs/vector_benchmark.md`, `src/asof/vectorbench.py`, `src/asof/sql/05_masks.sql` (saved in `research/redteam_src/`).
- IBM Docs fetch-clause: https://www.ibm.com/docs/en/db2/12.1.x?topic=subselect-fetch-clause
- IBM Docs CREATE VECTOR INDEX: https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-vector-index
- Garcia-Arellano, search accuracy (Feb 2026): https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2026/02/09/vector-indexes-in-db2-understanding-the-search-acc
- Hoggard, performance (Jun 2026): https://community.ibm.com/community/user/blogs/zach-hoggard/2026/06/19/vector-indexes-in-db2-mastering-vector-index-perfo
- Garcia-Arellano, early preview (Oct 2025): https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2025/10/04/vector-indexes-in-db2-an-early-preview
- langchain-ibm PR #342: https://github.com/langchain-ai/langchain-ibm/pull/342 (diff saved as `research/redteam_src/lc342.diff`)
- haystack-core-integrations PR #4086: https://github.com/deepset-ai/haystack-core-integrations/pull/4086 (diff saved as `research/redteam_src/hs4086.diff`)
- Installed sources: `venv313/Lib/site-packages/langchain_db2/db2vs.py` lines 601-627; `haystack_integrations/document_stores/ibm_db/document_store.py` lines 270-279 and about 905-930.
- OSV API records PYSEC-2020-96 and GHSA-6757-jp84-gxfx; `PyPI/all.zip` headers.
