# Db2Hack 2026 — verified research brief (compiled 2026-11-09)

## Event facts
- IBM Db2Hack 2026, online. Site: https://ibmdb2techxsummit.glbajajgroup.ac.in · Devpost: https://ibm-db2hack-2026.devpost.com (48 registrants) · Submission repo: github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
- HARD DEADLINE: Tue 10 Nov 2026, 5:00 PM IST = 5:30 AM CST (Texas) Tue 10 Nov. Builders have ~28 hours from now. Results 11 Nov.
- Submission = PR (only touches submissions/<slug>/, branch submission/<slug>, title "[Submission] <slug>: <Title>", commits feat(<slug>): …) + Google Form with PR link + LinkedIn post tagging organisers. Devpost also requires demo video + screenshots. Required files: README.md, architecture.md, submission.json, .env.example (+ src/, docs/screenshots/). Must actually talk to Db2 in code. Must use ≥1 of LangChain, Haystack, CrewAI, LlamaIndex, Langflow (site rule). Disqualifiers: no real Db2, committed secrets, uncredited plagiarism, touching root files/others' folders.
- Teams allowed per repo FAQ (list members in submission.json). Team here = 2 high-school/student builders (William + Kartikeya) using Claude Code heavily.
- Prizes: Top 3 trophy + kit, Top 10 goodies, strong projects invited to contribute to IBM Db2 GitHub org.

## Rubric (two versions; build for both)
- Website (newer): Db2 integration & depth 25 · Innovation & impact 20 · Architecture & AI 15 · Security 15 · Reproducibility & code quality 15 · Documentation & presentation 10.
- Devpost rules + repo docs/judging-criteria.md: Db2 depth 30 ("stored procedures, vector/JSON… clean schema, efficient querying") · Innovation & real-world impact 25 · Technical architecture & AI integration 20 (incl. architecture.md quality) · Reproducibility & code quality 15 ("automated tests, input validation, clean error handling") · Documentation & presentation 10 (no placeholders, screenshots/video, zero secrets).

## Judges (Devpost lists 6; all IBM Lucknow Db2 engineers)
- Dhruv Chaturvedi (Event lead): authored Langflow Db2 vector store component; open PRs adding DiskANN CREATE VECTOR INDEX + 6 metrics and SSL to langchain-db2; Db2 vector integrations for mem0, n8n, .NET agent framework; owns github DhruvChaturvediIBM/db2-enterprise-ai-use-cases (20 reference use cases: RAG, metadata filtering, date-aware compliance, MMR, duplicate detection, ticket routing, CrewAI crews, operational memory). Hinglish YouTube on agentic AI.
- Pawan Thakur: authored CrewAI DB2VectorSearchTool (merged Jul 2026); wrote exemplar CrewAI+Haystack job-matching submission.
- Keshav Maheshwari: exemplar db2-governed-rag (JSON_VALUE clearance filter + VECTOR_DISTANCE in ONE SQL statement) and Hindi/English voice RAG; both with pytest that runs without DB, licenses.
- Kunal Gola: owns submission repo + CI validator (process compliance); forks: prisma db2 target, mem0 db2 benchmark, node-ibm_db; interest in MCP/agent skills.
- Daya Nand (Sr Dev Manager), Shaik Sadiq: little public info. Program Director Gaurav Saxena on site only.
- Predicted: reward going BEYOND default connector calls, Db2 doing work in-database (vector+relational in one statement, vector index + APPROX with EXPLAIN/recall, SQL PL procedures, temporal AS OF, RCAC), honest limits, test hygiene, filled templates. Penalize thin wrappers, generic chat-with-PDF (already in Dhruv's 20 use cases), string-built SQL, unguarded LLM SQL, secrets, validator failures. Managers weigh enterprise impact + clear demo.

## Competition (37 PRs, ~32 projects, all solo)
- Saturated: generic Db2 vector RAG bots, Db2 support/runbook assistants (3+), food waste/inventory (4), farmer/welfare bots (3), generic multi-agent enterprise platforms (~7), governance/guardrail agents.
- Very strong existing entries: #36 metricguard (LLM emits typed plan, SQL compiled deterministically, SELECT-only + audit accounts, 15 reconciliations, Next.js UI, 16 screenshots, 2:33 video); #30 custodian (Db2 as agent guardrail: RCAC masks/permissions, per-user auth IDs, EXPLAIN blast radius, system-period temporal rewind/replay, LangGraph approval interrupt, 34 real-container tests, 15/15 red-team); #28 yojana-lens (SQL PL stored procedure eligibility + vectors + LangGraph, 54 tests); #35 issuesmith (7 LangGraph agents); #31 AEGIS (219 files, Vercel); #29 Sentinel AML; #26 Kisan Mitra.
- Gaps: nobody uses CREATE VECTOR INDEX / FETCH APPROX; no hybrid keyword+vector search; no Db2 MCP server / agent tool interface; no query-tuning/EXPLAIN/workload copilot; no Oracle/Postgres→Db2 migration tool; little JSON/BSON depth; no OLAP/columnar; no Node/Java backend; no watsonx-native.

## Technical facts (verified from docs/source)
- Db2 CE 12.1.5.0 = latest, amd64 only → on Apple Silicon runs under Colima+Rosetta (15–20 min first setup; known SQL1032N risk under Rosetta). CE: 4 cores/8GB.
- ibm_db 3.3.0 has native macOS arm64 wheels incl. Python 3.14 (tested OK).
- In CE 12.1.5: VECTOR(n, FLOAT32|INT8) (max 8168 dims), VECTOR_DISTANCE (COSINE, EUCLIDEAN, EUCLIDEAN_SQUARED, DOT, HAMMING, MANHATTAN), CREATE VECTOR INDEX (DiskANN, GA in 12.1.5, Linux AMD64; row-organized non-partitioned; COSINE needs FLOAT32; max dims 4K page 256 / 8K 512 / 16K 1024; LOAD/REORG/TRUNCATE restricted; query metric must match; needs RUNSTATS; nullable column forces exact unless IS NOT NULL) — untested under emulation; FETCH APPROX/EXACT FIRST n ROWS; JSON_TABLE/JSON_VALUE/BSON; system-period temporal; RCAC (CREATE PERMISSION/MASK); triggers, MERGE, OLAP. CREATE EXTERNAL MODEL / TO_EMBEDDING in 12.1.5 release notes (medium confidence, watsonx examples only). Text search: unreliable in container.
- VECTOR columns: no PK/unique/GROUP BY/DISTINCT/compare/alter; bind via CAST(? AS CLOB) then VECTOR().
- Connectors: langchain-db2 1.0.0 (filters in Python AFTER fetch first k; vector literal in SQL string; no APPROX); llama-index-vector-stores-db2 0.1.0 (Python<3.13, SQL-injection risk in filters, stale); ibm-db-haystack 1.0.0 (best: full parameterized SQL WHERE pre-filter, MERGE upserts, 6 metrics, SSL; Python ≥3.11 OK on 3.14); crewai-tools (Python<3.14, single-column filter, defaults to OpenAI embeddings); lfx-ibm (Langflow, langchain-db2 fork). NONE do hybrid search, NONE use vector index/APPROX.
- Local models: Ollama granite-embedding:30m (384 dims), granite4 micro (~2.1GB, tool calling); OpenRouter free; watsonx Lite.

## Prior idea set (from a ChatGPT session — treat as input, not truth)
1 TraceForge (agent flight recorder: hash-chained trace events in Db2, deterministic replay of recorded tool/model responses under new policy, failure injection demo) — est. 92; 2 SiliconPulse (simulated GPU thermal/perf telemetry forensics) 89; 3 VisionVerdict (vision-language safety failure triage) 88; 4 PatchProof (reproducible AI fix verification) 87; 5 QueryShield (prompt-injection resistance for text-to-SQL agents) 87; 6 MemoryWeave (temporal contradiction-aware agent memory) 85; 7 SupplyShock (semiconductor supply-chain disruption sim) 84. NOTE: TraceForge/QueryShield overlap heavily with existing #30 custodian and #36 metricguard; MemoryWeave overlaps Dhruv's "operational memory" use case + mem0 work.
