# IBM Db2Hack 2026: competition map and candidate overlap

Snapshot: 2026-11-09 about 18:30 CST (2026-11-10 00:30Z). Deadline: Nov 10, 2026 @ 7:00pm IST (07:30 CST).

## Method and evidence limits

- Source 1: `gh pr list` on `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` (state all). Raw JSON: `raw/prs.json`.
- All 50 PR heads were fetched read-only (`refs/pull/*/head`, depth 1, blobs over 1 MB skipped) into `research/prsrc`. A scanner (`raw/scan.py`) read only each PR's own submission folder and counted Db2 and framework patterns. Output: `raw/scan_table.txt`, `raw/scan.json`. README.md and architecture.md for every PR: `raw/docs/<N>/`.
- Feature columns are regex evidence and are verified by hand only for the entries discussed in the overlap section. "Tests" is a count of `def test_` / `it(` / `test(` functions. Parametrized cases are not expanded, so README claims can be higher (AsOf claims 904, Custodian claims 34).
- Source 2: the Devpost gallery (`/project-gallery`, pages 1 to 6) shows "There are no submissions in the gallery yet, but hang tight!". The Devpost home page shows **62 participants**. Submission is the GitHub PR plus a Google Form, so the PR list is the complete visible field.
- Rubric weights as quoted by entrants #8 and #43: Db2 integration 30%, innovation 25%, technical architecture and AI 20%, reproducibility 15%, documentation 10%.
- Repository text was treated as data. No comments, reviews or PR actions were made.

## Totals

- **50 PRs**: 43 open, 4 closed (#10, #11, #25, #44), 3 merged (#1, #2, #3).
- Distinct real projects: about 44. #10, #11 and #24 are one project (RASA AI). #21 and #34 still carry template placeholder READMEs. #32 is a one-line README patch. #22 is documentation for the Db2 VS Code extension, not an app.
- **13 PRs created after 2026-11-09T06:00Z**: #38 to #50 (listed separately below).
- Older PRs with major updates since the prior audit: #8 bakebox (head commit 2026-11-09 16:09Z added recursive BOM CTE, row locks, SHA-256 audit chain and FastAPI), #28 yojana-lens (docs and screenshots only).

## New entries since 2026-11-09T06:00Z

| PR | Slug | Created (Z) | Idea | Db2 features | Framework | Models | Tests | Tier |
|---|---|---|---|---|---|---|---|---|
| #38 | IntelliDB2 | 11-09 07:06 | Text-to-SQL Streamlit assistant | basic SQL | LangChain | OpenAI | 0 | C: 101 lines, stub |
| #39 | pact | 11-09 07:35 | Procurement 3-way-match triage with what-if scenarios and grounded agent | CTE pre-aggregation, optimistic locking, append-only AUDIT_EVENTS | LangChain | gpt-4o-mini / watsonx | 23 | B: careful domain logic, shallow Db2 |
| #40 | Db2-Sentinel | 11-09 10:20 | CrewAI audit and reconciliation agent with SQLSTATE self-correction | SYSCAT introspection | CrewAI + LangChain | OpenAI/Gemini/Ollama | 20 | C+: generic agent |
| #41 | carbonnova | 11-09 11:38 | Agricultural carbon-credit marketplace with AI document review | basic tables, hash-chained audit log | LangChain (Node) | OpenAI | 57 | B-: big app, shallow Db2 |
| #42 | db2-workrelay-intelligence | 11-09 12:02 | Incident triage and runbook matching with Db2 audit trail | basic tables | LangChain Core, LlamaIndex | watsonx/Granite, OpenAI, Gemini | 33 | B-: Db2-ops domain, shallow Db2 |
| #43 | db2-cortex | 11-09 13:20 | Governed multi-agent text-to-SQL: SELECT-only, allow-list, role PII wall, PREPARE validation, semantic cache, hash-chained audit | VECTOR, VECTOR_DISTANCE, DB2VS, PREPARE, hash chain | LangGraph (9 nodes) | Ollama/watsonx/OpenAI/Gemini, offline demo | 19 | B+: strong design, no video |
| #44 | techgaint-db2-agent | 11-09 13:39 | CrewAI recruiter with governed RAG (CLOSED) | basic | CrewAI | none found | 9 | C: closed, stub |
| #45 | cloud-loop | 11-09 15:09 | Student opportunity matching (eligibility + cosine + skills) | basic tables, MERGE | LangChain, Haystack (light) | OpenAI/Gemini, MiniLM | 18 | C+ |
| #46 | gitmind-db2 | 11-09 15:20 | Repo knowledge graph + persistent findings memory + change-risk review | VECTOR(768), VECTOR_DISTANCE, DB2VS, JSON/BSON, relational graph | LangGraph (7 agents), LlamaIndex | Gemini, gpt-4o-mini | 28 | B+: MRR 0.858 eval, Context7 MCP client |
| #47 | mediflow-ai | 11-09 15:43 | Medicine stockout/expiry risk and reorder drafts with human approval | basic tables | LangGraph | none found | 4 | C+ |
| #48 | claimguard-ai | 11-09 16:46 | Agentic insurance claim verification and fraud detection | basic CRUD, transactions, VERIFICATION_LOGS | LangGraph + LangChain | Gemini | 76 | B: polished, video, shallow Db2 |
| #49 | asof | 11-09 21:10 | Checks AI answers against the policy version in force on the customer's date; tamper-evident ledger | VECTOR(384), VECTOR_DISTANCE, CREATE VECTOR INDEX (VANN), FETCH APPROX vs EXACT benchmark, bitemporal (BUSINESS_TIME + SYSTEM_TIME, FOR PORTION OF), JSON_TABLE/JSON_VALUE/JSON_EXISTS, column masks, 14 SQL PL procedures, triggers, EXPLAIN + db2exfmt, partitions, MQTs, TO_EMBEDDING, 5 least-privilege users | LangGraph, LangChain, langchain-db2, MCP server, Langflow, dbt, Airflow | OpenRouter Gemini 3.1 flash-lite, Ollama qwen2.5, watsonx Granite, replay mode | 513 (README: 904) + CI | **A+**: deepest Db2 use in the field; no video in PR yet |
| #50 | quantummedx | 11-09 23:40 | CrewAI agents run classical ML + Qiskit VQC on health data; Db2 as system of record | basic tables | CrewAI | OpenAI/Anthropic/Gemini/Groq | 22 | C+: video link, shallow Db2 |

## Top 8 (whole field)

| Rank | PR | Slug | Idea | Db2 features | Framework / model | Quality evidence | Tier |
|---|---|---|---|---|---|---|---|
| 1 | #49 | asof | Date-correct policy checks for AI answers, hash-chained ledger, change impact | see table above (VECTOR index + APPROX/EXACT, bitemporal, JSON_TABLE, masks, SQL PL, triggers, EXPLAIN, partitions, MQTs) | LangGraph; OpenRouter/Ollama/watsonx; replay mode | 513 test fns, CI, 9 frozen eval splits pinned by SHA-256, 0 of 121 wrong drafts released | A+ |
| 2 | #36 | metricguard | LLM typed plan, deterministic SQL compile, SELECT-only account, reconciliation | GRANT/roles (SELECT-only MGREADER, audit account); no VECTOR/JSON/RCAC | LangChain; Meta muse-spark | 164 test fns, 2:33 YouTube video, 37 live cases | A |
| 3 | #30 | custodian | Db2 as guardrail for agents: per-user identity, write blast radius, rewind, replay | RCAC masks + permissions, system-period temporal, EXPLAIN PLAN FOR blast radius, VECTOR via DB2VS, FINAL TABLE | LangGraph; Groq/Ollama, gpt-oss-120b | 15 test fns (README: 34), 15/15 red team, no video | A |
| 4 | #28 | yojana-lens | Welfare eligibility: SQL PL decides, LLM explains, replayable trace | SQL PL `SP_RECORD_TRACE`, VECTOR, decision_trace | LangGraph; Groq Llama 3.3 / watsonx Granite | 54 test fns | A- |
| 5 | #43 | db2-cortex | Governed self-auditing text-to-SQL copilot | VECTOR, DB2VS, PREPARE, hash chain | LangGraph | 19 test fns, 20+ verify checks | B+ |
| 6 | #46 | gitmind-db2 | Repo knowledge graph + change-risk review | VECTOR(768), DB2VS, JSON/BSON | LangGraph, LlamaIndex; Gemini | 28 test fns, MRR 0.858 | B+ |
| 7 | #35 | db2-issuesmith | Db2 extension log to evidence-based GitHub issue | VECTOR, VECTOR_DISTANCE, JSON, SQL PL dedup procedure | LangGraph; Granite 3.3 | 21 test fns | B+ |
| 8 | #31 | aegis-ai-safety | Research claim verification (SUPPORTED/CONTRADICTED/INSUFFICIENT) | JSON only; Db2 shallow | LangChain; Ollama qwen2.5 | 75 test fns, SciFact macro F1 0.678, public demo | B+ |

Next tier: #29 db2-sentinel-ai (VECTOR, recursive CTE cycle detection, LangGraph checkpointer in Db2; B), #8 bakebox (Db2 vector + Python BM25/TF-IDF RRF, recursive BOM CTE, SELECT FOR UPDATE, hash chain, 58 test fns; B), #39 pact (B), #48 claimguard (B), #26 kisan-mitra (VECTOR + text-to-SQL; B).

## All entries #1 to #37 (compact)

| PR | Slug | Idea | Db2 features (scan) | Framework | Models | Tests | Tier |
|---|---|---|---|---|---|---|---|
| #1 | crewai | Candidate-job matching | VECTOR, VECTOR_DISTANCE | CrewAI, Haystack | Granite/Ollama | 4 | B- |
| #2 | db2-governed-rag | Clearance-aware vector RAG (JSON_VALUE filter in same statement) | VECTOR, VECTOR_DISTANCE, JSON_VALUE | Haystack (ibm-db-haystack) | Ollama qwen2.5 | 2 | B-: small, clean |
| #3 | db2-multilingual-voice-rag | Hindi/English voice RAG | VECTOR, JSON_VALUE | Haystack | Ollama | 2 | C+ |
| #4 | aegis-analytics | Market intelligence, forecasting, text-to-SQL, SQLGlot transpiler | EXPLAIN helper | many | watsonx/OpenAI/Gemini | 18 | B-: sprawling |
| #5 | sharthi-ai | Student support chatbot | none | LangChain | mixed | 0 | C |
| #6 | gl-bajaj-campus-insights | Campus analytics (branch also holds kaamnearby) | none | none | none | 0 | C |
| #7 | kisanrakshak-ai | Farmer recommendations | none | LangChain | OpenAI | 0 | C |
| #8 | bakebox-choco-ai | Bakery management + hybrid RAG | VECTOR, recursive CTE, FOR UPDATE, hash chain | LlamaIndex | Gemini | 58 | B |
| #9 | interview-website | Interview prep | none | none | Gemini | 0 | C |
| #10, #11 | rasa_ai (CLOSED) | Duplicates of #24 | MERGE | Haystack | none | 0 | n/a |
| #12 | db2-runbook-assistant | Runbook RAG | VECTOR via Haystack | Haystack | Granite/Ollama | 0 | C+ |
| #13 | surplussync | Food rescue (SQLite primary, Db2 optional) | minimal | LangChain | watsonx Granite | 75 | B-: Db2 optional |
| #14 | db2-support-rag | Support RAG, category filter | VECTOR, VECTOR_DISTANCE | none | watsonx Granite | 3 | C+ |
| #15 | cloudchange-db2 | Terraform change impact + AWS verification | Db2 as store | none | none | 220 | B- |
| #16 | codefix-ai | Coding assistant with Db2 sessions | minimal | LangChain | watsonx/Ollama | 37 | C+ |
| #17 | quantumdefense | Security event monitor | none | none | watsonx | 14 | C |
| #18 | dbhaven-db2 | Encrypted Db2 backups | backup | none | none | 5 | C+: not AI |
| #19 | Digital Suraksha | Root-level files | none | none | none | 0 | C |
| #20 | cinematic-chess | 3D chess + Db2 analytics | MERGE | LangChain | OpenAI/Ollama | 30 | B- |
| #21 | db2-python-starter | Starter template | none | none | none | 0 | C |
| #22 | (docs) | VS Code Db2 extension documentation | n/a | n/a | n/a | 0 | C: not an app |
| #23 | internscrap | Internship aggregator | MERGE | none | Anthropic | 7 | C+ |
| #24 | rasa-ai | Audition analysis and casting support | MERGE | Haystack InMemoryBM25 | none | 0 | C+ |
| #25 | recipe-waste-optimizer (CLOSED) | Pantry recipe optimizer | minimal | LangChain | mixed | 14 | n/a |
| #26 | kisan-mitra | Bilingual farmer assistant, text-to-SQL | VECTOR, VECTOR_DISTANCE | LangChain | watsonx/Gemini/Ollama | 26 | B |
| #27 | db2-smartstock-ai | Food waste ML + multi-agent | minimal | CrewAI/LangChain | watsonx/OpenAI | 1 | C+ |
| #28 | yojana-lens | see top 8 | | | | 54 | A- |
| #29 | db2-sentinel-ai | AML surveillance, SAR drafting | VECTOR, recursive CTE, Db2 checkpointer | LangGraph | Granite | 15 | B |
| #30 | custodian | see top 8 | | | | 15 | A |
| #31 | aegis-ai-safety | see top 8 | | | | 75 | B+ |
| #32 | (README patch) | n/a | n/a | n/a | n/a | 0 | n/a |
| #33 | recalltrace | Recall notice to affected stock lots (LLM extracts codes with verbatim quotes, reviewer confirms, Db2 prepared SELECT) | basic join | LangChain | Granite 3.3 2B/Ollama | 0 | B-: careful, tiny |
| #34 | db2-rag-chatbot | Template README | none | mixed | mixed | 0 | C |
| #35 | db2-issuesmith | see top 8 | | | | 21 | B+ |
| #36 | metricguard | see top 8 | | | | 164 | A |
| #37 | energysense-ai | Appliance anomaly baselines + assistant | langchain-db2 | LangChain | OpenAI | 36 | B- |

## Field-wide Db2 feature census (verified by grep on each PR's own folder)

- CREATE VECTOR INDEX + FETCH APPROX: **only #49**. #35 lists the vector index as future work.
- Db2 Text Search (CONTAINS/SCORE/db2ts): **none**. #49 reports that enabling Text Search failed in IBM's container.
- Keyword + vector fusion (RRF): only in Python. #8 fuses Db2 vector + BM25 + TF-IDF (k=60) in LlamaIndex. #31 and #24 use Python BM25. **No entry fuses ranks inside one SQL statement.**
- RCAC: #30 (masks and permissions per user), #49 (column masks). #2 uses an application-supplied clearance in a JSON_VALUE WHERE clause, not RCAC.
- Temporal tables: #30 (system-period), #49 (bitemporal).
- EXPLAIN: #30 (blast radius), #49 (db2exfmt, index-use checks). **MON_GET_PKG_CACHE_STMT, EVALUATE INDEXES, db2advis, ADVISE_INDEX: none.**
- MCP server: **only #49** (exposes its own check). #30 lists an MCP front-end as roadmap. #46 is an MCP client (Context7).
- Federation (CREATE SERVER/NICKNAME/WRAPPER): none.
- Custom Haystack `@component`: none. Haystack use is stock `ibm-db-haystack` in #1, #2, #3, #4 and #12.
- Hash-chained audit logs: #8, #41, #43, #49 (only #49 computes the hash in SQL PL and blocks UPDATE/DELETE with triggers).

## Candidate overlap

### 1. NEEDLE (SBOM + advisory triage, SQL hybrid BM25 + vector RRF, recall@10, RCAC embargo, Haystack component)

- Domain: **unoccupied.** No PR does SBOM, CVE, OSV or advisory triage. Nearest analog in shape: #33 RecallTrace (notice to affected lots, LLM extracts identifiers with verbatim quotes, Db2 returns matches). It is small (963 additions, 0 tests).
- Hybrid retrieval: #8 bakebox does 3-way RRF in Python (B tier, bakery domain). #31 AEGIS does Python BM25 hybrid. No SQL-side fusion, no Db2 Text Search anywhere.
- APPROX vs EXACT evaluation: **already done by #49 (A+)** with a published table: 1k/5k/20k/100k rows, exact 143.0 ms vs approx 7.7 ms at 100k, recall@10 0.95, index chosen from 20k rows, recall 0.73 with a date filter. It also found that `FETCH APPROX FIRST ? ROWS` (parameter marker) never uses the index on 12.1.5, a constant k does, the VANN index key needs a 32K tablespace (SQL0614N in 4K), and with an index present Db2 defaults to approximate.
- RCAC: #30 does it more deeply. Embargo-hiding is a new use, not a new mechanism.
- Haystack component: unoccupied.
- To beat: (a) do keyword rank in SQL without Db2 Text Search (term/posting tables + BM25 formula in SQL), fused with vector rank via `RANK() OVER` + RRF in one statement; (b) a labeled set heavy in exact identifiers (CVE IDs, package names, version strings) that shows hybrid beating both legs, plus APPROX vs EXACT at a scale where the index is chosen; (c) measure the RCAC-filter effect on APPROX recall (the #49 0.73 result predicts post-filter loss); (d) a reusable Haystack component. Do not claim APPROX/EXACT benchmarking as novel; cite it as extended.
- Verdict: **LOW overlap on domain, MEDIUM on the eval sub-claim.** Best-differentiated candidate.

### 2. TraceForge (agent flight recorder, hash chain, deterministic replay, injection demo, regression gate)

- #49: hash chain in SQL PL with trigger-enforced append-only, `VERIFY_CHAIN`, external receipts and anchors; replay mode answers every model call from recorded outputs keyed by SHA-256 of the input and fails closed on unrecorded input; `FOR SYSTEM_TIME AS OF` replay; frozen eval splits pinned by SHA-256 in CI; an extractor-attack split.
- #30: as-of replay of any past answer as the same user; temporal rewind of agent writes; prompt injection through vector-retrieved tickets, 15/15 red team.
- #29: LangGraph checkpointer in Db2. #28: replayable decision_trace. #39: tool-call traces. #8, #41, #43: hash-chained logs.
- Gap: no generic recorder for any agent with counterfactual replay under a changed policy and a CI gate as the product.
- To beat: framework-agnostic capture (LangGraph callbacks or OpenTelemetry GenAI spans), counterfactual replay that flips an injected run from unsafe to blocked, run diffing, a CI exit-code gate, and hashing in Db2. Each part has an A-tier precedent.
- Verdict: **HIGH overlap on components** (#49, #30). Hard to differentiate in 10 hours.

### 3. Timeron (Db2 tuning agent: EXPLAIN, MON_GET_PKG_CACHE_STMT, EVALUATE INDEXES, MCP)

- No PR uses MON_GET_PKG_CACHE_STMT, EVALUATE INDEXES, db2advis or ADVISE_INDEX. EXPLAIN appears only as a helper in #30 (row-estimate blast radius) and #49 (plan inspection).
- Adjacent Db2-ops entries (support domain is saturated): #12 runbook RAG, #14 support RAG, #35 IssueSmith, #42 WorkRelay, #40 Db2-Sentinel.
- To beat: act on measured workload (top statements from the package cache), evaluate virtual indexes without DDL, show before/after estimated timerons and measured elapsed time, gate `CREATE INDEX` behind approval, expose it as MCP tools. A demo hook from #49's finding: detect vector queries with a parameter-marker k that never use the VANN index.
- Feasibility UNKNOWN until checked in the Community Edition container: EXPLAIN/ADVISE tables via `SYSPROC.SYSINSTALLOBJECTS`, package-cache metrics collection level.
- Verdict: **LOW overlap.** Risk: judges may lump it with the Db2 support bots unless it shows measured gains.

### 4. QueryShield (injection-resistant enterprise text-to-SQL)

- #36 (A): typed plan, deterministic compile, SELECT-only account, 12 hostile prompts, video.
- #43 (B+): SELECT-only, table allow-list, role PII wall, 200-row cap, Db2 PREPARE validation, self-repair, hash-chained audit, injection acceptance cases.
- #30 (A): per-user Db2 identity, RCAC, EXPLAIN blast radius, 15/15 red team.
- #49: SQLGlot-gated model-written query as a read-only user.
- Others: #4, #26, #27, #38, #40.
- Verdict: **SATURATED.** Avoid.

### 5. MemoryWeave (temporal, contradiction-aware agent memory)

- No dedicated agent-memory entry. Memory is a side feature in #46 (GITMIND_FINDINGS), #43 (session memory, semantic cache), #35 and #8.
- Mechanism overlap: #49 already does `FOR BUSINESS_TIME AS OF` + `VECTOR_DISTANCE` in one statement, CONTRADICTED verdicts and change impact on past answers. #31 does SUPPORTED/CONTRADICTED/INSUFFICIENT against source documents. #30 uses temporal tables.
- To beat: package it as a memory store for agents (LangGraph store or MCP) with belief revision (a contradicting fact closes the old business-time period), "what did the agent believe on date X" queries, and a measured knowledge-update evaluation.
- Verdict: **MEDIUM-LOW.** Product framing is open. Judges who saw #49 may read the temporal+vector pattern as derivative.

### 6. Db2 MCP server / agent tool interface

- Only #49 ships an MCP server, and it exposes the AsOf check, not Db2. #30 lists an MCP front-end as roadmap and states that existing Db2 MCP servers are read-only or use one shared service account (external prior art; not verified here).
- Verdict: **LOW overlap, low standalone value.** Use MCP as the delivery surface for Timeron or NEEDLE, not as the idea.

### 7. Unoccupied niches observed (fit "AI app on Db2", about 10 hours)

1. SBOM and advisory triage (NEEDLE domain): none in 50 PRs.
2. SQL-side hybrid retrieval (BM25 in SQL + RRF) as a reusable component with a benchmark: none, and #49 explicitly left keyword search out.
3. Workload tuning advisor (Timeron domain): none.
4. Schema and query migration to Db2 (Postgres/Oracle to Db2) with result-equivalence checks by running both: none. #4 has a SQLGlot transpiler side feature. #40 only rewrites LIMIT to FETCH FIRST.
5. PII discovery that generates RCAC masks and permissions and proves them by querying as different users: none. RCAC is hand-written in #30 and #49. #43 enforces PII in the application.
6. Federation (nicknames): none. Community Edition support is UNKNOWN.

Saturated: vector RAG chatbots (#1, #2, #3, #5, #12, #14, #34), Db2 support and ops bots (#12, #14, #35, #40, #42), text-to-SQL and governed analytics (#4, #26, #27, #36, #38, #43), food and inventory (#8, #13, #25, #27, #47), farmer bots (#7, #26), recruiting and student tools (#1, #5, #6, #9, #23, #44, #45), hash-chained audit trails (#8, #41, #43, #49), generic multi-agent platforms (#4, #27, #29, #40, #50), fraud and claims (#29, #39, #48).

## Recommendation

- NEEDLE has the clearest open domain and a mechanism nobody ships in SQL. Position the APPROX/EXACT evaluation as extending #49's result, and avoid Db2 Text Search.
- Timeron is second: open niche with feasibility risk on EVALUATE INDEXES and package-cache metrics in the container. Verify those first.
- Avoid QueryShield. Avoid TraceForge unless it is narrowed to something #49 and #30 do not show.
