# IBM Db2Hack 2026 — organizers, judges, and what they reward

Research time: 2026-11-09 ~18:30–20:00 CST (UTC-6). Read-only. No sign-in, no posts, no comments.
Labels: **VERIFIED** = I read it in the source today. **INFERENCE** = my reasoning from verified facts. **UNKNOWN** = I could not verify.
Raw sources saved under `scratchpad/ibm26/research/src/` (event-site, db2-uc, submission-repo, devpost, ibmdb-haystack, langchain-db2, yt, linkedin).

---

## 0. Deadline and rule conflicts (read first)

| Item | Value | Source | Status |
|---|---|---|---|
| Final deadline (PR + Google Form) | **Tue 10 Nov 2026, 5:00 PM IST = 05:30 CST Tue 10 Nov** (about 11 h after 18:30 CST 9 Nov) | Event site `src/data.js` `MOMENTS.hackEnd`, Devpost Rules text, Luma, Unstop details | VERIFIED |
| Devpost header deadline | Nov 10, 2026 @ 7:00 PM IST (07:30 CST) | Devpost header | VERIFIED, conflicts with Devpost's own rules text (5 PM IST). Use 5 PM IST. |
| Unstop | `end_date` 2026-11-10T19:00 IST; `end_regn_dt` 2026-11-10T17:00 IST; team size 1–1; round 1 ≈299 players, round 2 ≈297 | `unstop.com/api/public/competition/1795047` | VERIFIED |
| Results | Wed 11 Nov 2026 (Top 3, Top 10, "projects with real potential") | site, Devpost, Luma, Unstop | VERIFIED |
| Team | **Solo only** (site commit 1 Nov "Db2Hack is solo only"; Luma; Unstop). The 29 Oct YouTube video still says "solo or as a team" — superseded. | VERIFIED |
| Eligibility | Devpost: "Students only". Unstop: students, developers, working professionals. | VERIFIED conflict |
| Submission repo README dates | Still says deadline 29 Oct 7 PM IST and has `[GOOGLE_FORM_LINK_TO_BE_ADDED]` placeholders. Stale. | VERIFIED |

**Google Form links (conflict):**
- `https://forms.gle/n8GQL4tg7Yzftwu39` → `docs.google.com/forms/d/e/1FAIpQLSeI29AdGMZlhPkS4xDU_0_kVVhpf2U5nTRfyuWQRPgj6TulWw`. Used by: event site `SUBMIT_FORM` (commit 7 Nov 20:42 IST "Add the official submission form next to the PR repo link"), Devpost Resources, Unstop "Final Submission Google Form", the published `SKILL.md`. VERIFIED.
- Luma labels `forms.gle/ZjsLaFU5zAYJonwk9` (→ a different form `1FAIpQLSdmClZkEtG2fjdlN15GrsCE0kH88OAkAXu2pXk6yXXuDYjHMg`) as "Main Project Submission Form", and labels `forms.gle/49fVzq8m7cV1u3Pi8` as "Db2 Goodies Challenge Form" — but `49fV…` resolves to the **same** form as `n8GQ…`. VERIFIED redirect targets. Form titles: UNKNOWN (both need Google sign-in).
- INFERENCE: Luma's labels are inconsistent. The form on four official surfaces is `n8GQL4tg7Yzftwu39`. Recommendation: submit there; ask in the WhatsApp community whether the Luma form is also needed.

**Unstop has two rounds** (VERIFIED, Unstop details + `SKILL.md`): Round 1 "Ideation & Architecture" = upload a PDF/PPT (title, problem, solution, features, agentic framework, Db2 connector and integration, architecture/workflow, impact). Round 2 "Build & Final Submission" = code, docs, screenshots, **demo video**, PR + Google Form. Round 1 API status = `DRAFT`, Round 2 = `LIVE`. Whether a missing Round 1 PPT blocks judging: UNKNOWN.

**Devpost** shows 62 participants; the project gallery is "not published yet". Devpost rules do not ask for a Devpost project entry; they ask for PR + Google Form + LinkedIn. Whether a Devpost project entry is counted: UNKNOWN. Recommendation (low cost insurance): also create the Devpost entry if the account joined there.

---

## 1. Workshops and webinars

### 1.1 The 7 Nov workshop (VERIFIED from Devpost update 47544, posted ~6 Nov)
- **Title:** "📢 IBM Db2 Live Webinar & Hands-on Project Development Workshop"
- **URL:** https://ibm-db2hack-2026.devpost.com/updates/47544-ibm-db2-live-webinar-hands-on-project-development-workshop
- **When / where:** 7 November 2026, 3:00–5:00 PM IST, Microsoft Teams. Join link: `https://events.teams.microsoft.com/event/87644e87-0a6f-4e12-a974-a0276cbdb435@fcf67057-50c9-4ad4-98f3-ffca64add9e9`
- **Presenters:** Dhruv Chaturvedi ("Software & AI Engineer, IBM | Event Lead & Speaker"), Kunal Gola ("Software & AI Engineer, IBM | Speaker").
- **Agenda:** "Building a project from scratch", "Practical Db2 demonstrations", "Q&A with IBM engineers". "All hackathon participants are strongly encouraged to attend."
- **Recording / slides / transcript: UNKNOWN — not found.** I checked: Devpost updates (2 posts only), event site and its repo, YouTube search ("Db2Hack", workshop title, "IBM Db2 TechX"), the GL Bajaj channel (`UConWAm06IXR9pXHcF-kZUFA`), `@dhruv_insights` (last upload 23 Jan 2026), `@IBMProductHub` (no Db2 upload 2–9 Nov). Teams-event recordings are usually behind the registration link; it may have been shared in WhatsApp (not accessible).
- **What they most likely built (INFERENCE):** The event-site repo changed `SKILL.md` on 6 Nov 23:52 IST, the night before: "beginner step-by-step (checklist, glossary, expected output), **tested langchain-db2 + Ollama pattern**". That pattern (tested on Db2 12.1.5 and `langchain-db2` 1.0.0):
  - `ibm_db_dbi.connect(DSN from .env)` → `OllamaEmbeddings("nomic-embed-text:v1.5")` → `DB2VS.from_documents(..., table_name="MEMORIES", distance_strategy=DistanceStrategy.COSINE)` → `similarity_search_with_score(q, k=20, filter={"user": ["aditi"]})[:4]` → `ChatOllama("granite4.2:3b")` with "Use only this context".
  - Two gotchas they call out: filter values must be **lists**; the filter is applied **after** top-k, so over-fetch (k=20) and slice.
  - Build phases they teach: plan ("user does X → app does Y with data Z", 5 real questions) → 5 sample records in Python → swap in Db2 and check rows in the VS Code extension → UI (Streamlit/Gradio/React+FastAPI) → polish (errors, README, architecture.md, screenshots, short demo video).
  - The site's `QUICK_EXAMPLE` "Ask my notes" (LangChain + DB2VS + HuggingFace `all-mpnet-base-v2`) is the other candidate demo.

### 1.2 Other Db2Hack sessions (VERIFIED)
| Date | Item | URL | Notes |
|---|---|---|---|
| 29 Oct | "IBM Db2 TechX Summit 2026 & Db2Hack — How to Register, Build an AI Use Case and Submit" (4 min, GL Bajaj channel) | https://www.youtube.com/watch?v=bEUKtt70MP4 | Chapters: 0:00 Summit · 0:16 schedule · 0:52 speakers · 1:07 "The real motive: learn & contribute" · 1:32 Db2Hack live · 1:53 register · 2:15 resources · 2:50 "What you build + IBM Bob example" · 3:39 "Submission process + judging rubric" · 4:10. Description: "This event is not about prizes… learning IBM Db2, learning AI frameworks… contributing to open source"; "**Submit early — early submissions are reviewed first, so you get feedback and time to improve.**" |
| 30 Oct | Summit live streams (GL Bajaj channel), Hindi auto-captions | K_EuOVHNBbo (10 m, 10:37 IST), xUg-jxoR0sQ (7 m, 11:10), ec3RR8DSWXw (10 m, 11:21), **lGMa-E57oRI (55 m, 12:17 IST)**, **xhl1QYvcomw (44 m, 15:04 IST)** | INFERENCE from the schedule: lGMa = technical session/hands-on workshop (10:40–13:00 slot); xhl1 = panel "AI, data and the road ahead" (15:00–16:00). Transcripts: UNKNOWN (caption endpoint returns empty without a token). |
| Ongoing | IBM Product Hub framework tutorials listed on the site | Langflow `NRo4ePT2MEE`, Haystack `T3it5_2JwIw`, CrewAI `qZnhCnwGttg` | "Copy the pattern, then add your own idea." |
| — | 5-min setup video (in SKILL.md) | https://youtu.be/7oJDrOQ_Mec | VS Code Db2 Developer Extension setup |
| TBA | "Doubt-solving session" | WhatsApp only | Date UNKNOWN |

---

## 2. `DhruvChaturvediIBM/db2-enterprise-ai-use-cases`

### 2.1 State (VERIFIED)
- `main`: 2 commits (23 Sep 2026, "initial scaffold — 20 IBM Db2 AI use cases"). On `main`, every use case is a **scoped README + validation.sql only** ("🔲 Scope defined. Code not yet written."). `common/` helpers exist.
- Oct–Nov activity: 9 **open, unmerged** PRs. #1 (KhushiTyagiIBM, UC11, 3 Oct → fixes 28 Oct). #2–#8 (GeetikaChughIBM, 25 Oct: UC07, UC08, UC09, UC12, UC13, UC17, UC19). #9 (GeetikaChughIBM, 29 Oct: UC01). Last push 29 Oct (force-push to `feat/uc01`).
- The repo README says `db2-haystack` and "DB2VS lives in langchain-community"; the real code on branches uses `ibm-db-haystack` (`IBMDb2DocumentStore`, `IBMDb2EmbeddingRetriever`) and `langchain_db2.DB2VS`. `db2-haystack` does not exist on PyPI.

### 2.2 The 20 use cases (framework · Db2 feature · one line)
| UC | Framework · Db2 feature | One line |
|---|---|---|
| 01 Enterprise Knowledge RAG | Haystack · `Db2DocumentStore`/`Db2EmbeddingRetriever`, VECTOR column, COSINE | Grounded Q&A with source citations; top-5 + scores; 3-query eval. Code in PR #9. |
| 02 Policy metadata filtering | Haystack · metadata + compound filters | Only the active policy for the right department/region. |
| 03 Technical doc search | Haystack · `top_k`, EUCLIDEAN | Pure retrieval, no LLM. |
| 04 Date-aware compliance | Haystack · date filters on `effective_date`/`status`, MANHATTAN | Exclude superseded/expired rules. |
| 05 Reranked search | Haystack · broad candidates (top_k=15) + reranker | Better precision without changing Db2 storage. |
| 06 Local Ollama reranking | Haystack + Ollama · vector candidates | Data-sovereign: Db2 stores, Ollama ranks, Granite answers. |
| 07 Similarity scores | LangChain `DB2VS` · `similarity_search_with_score` | "Knows when it doesn't know": HIGH/MEDIUM/LOW evidence tiers from distance → "insufficient evidence". PR #2. |
| 08 MMR retrieval | LangChain `DB2VS` · `max_marginal_relevance_search(k=5, fetch_k=20, lambda_mult=0.5)` | Diverse context vs plain similarity. PR #3. |
| 09 Duplicate detection | LangChain `DB2VS` · scores | Ingestion gate: DUPLICATE / RELATED / NEW. PR #4. |
| 10 Recommendation | LangChain `DB2VS` · `similarity_search_by_vector` | Similar incidents/requirements/tickets. |
| 11 Incident discovery | LangChain `DB2VS` · scores + metadata filter (`service`, `severity`) | Top-3 similar past incidents with root causes. PR #1 (reviewed by Dhruv). |
| 12 Architecture decisions | LangChain `DB2VS` · `similarity_search` | "Have we already decided this?" over ADRs. PR #5. |
| 13 CrewAI research agent | CrewAI · `DB2VectorSearchTool` (`limit`, `distance_metric`, `return_columns`, `custom_embedding_fn`) | One agent, one tool; cites `document_id`. PR #6. |
| 14 Incident crew | CrewAI · 5 agents, scoped Db2 searches | Structured investigation report. |
| 15 Procurement/RFP crew | CrewAI · 5 analysts | Proposal vs requirements/policy/risk. |
| 16 Compliance crew | CrewAI · 5 roles | Human-reviewable evidence report, "explicitly not the final decision". |
| 17 Ticket routing | LangChain `DB2VS` · k-NN over labelled history | Routing without retraining; LLM optional (not for the decision). PR #7. |
| 18 Operational memory | LangChain (or Haystack) · `add_texts` + search | Read-write memory of resolutions. |
| 19 Change impact | LangChain (or Haystack) · search across all doc types | Blast radius of a change + evidence-grounded summary. PR #8. |
| 20 Knowledge maintenance | LangChain · `get_pks`, `delete`, scores, filters | Flag stale/duplicate docs; human approval before delete. |

Spec (`db2_enterprise_ai_use_cases.md`) also covers all six metrics (COSINE, EUCLIDEAN, EUCLIDEAN_SQUARED, DOT, HAMMING, MANHATTAN) and a later "combined UI".

### 2.3 Stated philosophy (VERIFIED quotes from the spec)
- "The objective is not to create 20 variations of a chatbot."
- "Use the smallest amount of code that demonstrates the largest meaningful enterprise capability."
- Every example: realistic enterprise problem, small Db2 dataset, 1–2 capabilities, minimal runnable code, **SQL that can be independently inspected**, "a clear explanation of why Db2 matters".
- "CrewAI should only be used when agent roles or multi-step orchestration provide real value." LinkedIn-series beats: "Do we actually need an agent?" then "When does an agent become useful?"
- "Do not build… custom vector-search SQL when the package already exposes the capability… complex agent architectures when a retriever is enough… duplicated Db2 connection code."
- "**Python proves the integration works. SQL proves what actually exists in Db2.**"
- Evaluation: Hit@K, Recall@K, MRR; RAG = evidence + answer + grounding check; reranking = before/after; agents = task, tool calls, evidence, output. "**The objective is reproducibility, not benchmark theatre.**"
- Definition of done includes: env-var credentials, no credentials in source, "can be independently inspected using SQL", sample input, expected output characteristics, ≥1 validation SQL query, minimal code.
- LinkedIn guidance in the spec: "Each post should be tied to one capability rather than simply saying: I built another RAG application." Example hook: "Can IBM Db2 handle enterprise RAG?" with "20 lines of Python → IBM Db2 → grounded answer".

### 2.4 Dhruv's code-review signal (VERIFIED, PR #1 inline comments)
1. "**Plaintext Db2 credentials committed** … highest-priority issue … rotate it … deleting the line alone does not remove it from Git history."
2. Connection never closed in `ingest.py`/`discovery.py` → "close the Db2 connection … in a finally block or context manager".
3. Re-running ingestion → "make ingestion intentionally repeatable … stable document IDs … documented upsert strategy … verify against the exact langchain-db2 version".
4. Eval PASS meant only "any relevant in top-3" while printing Top-1 → "report Top-1 and Top-3 separately and **return a non-zero exit code when a defined evaluation threshold fails** … document that relevance labels are manually supplied".
5. Metadata filter shape `{"service": [..]}` → "validate … against the actual DB2VS implementation … a test or documented manual validation".
(Several comments carry `?utm_source=chatgpt.com` links — INFERENCE: he drafts reviews with an AI assistant, so reviews may be systematic/checklist-like.)

### 2.5 House style to match (VERIFIED from `common/` and branches)
- **Config:** one `config.py` (or `Settings` dataclass) loads `.env` from repo root via `python-dotenv`; `_require(key)` raises `EnvironmentError("Required environment variable '…' is not set. Copy .env.example to .env…")`. Vars: `DB2_HOST`, `DB2_PORT` (50000), `DB2_DATABASE`, `DB2_USERNAME`, `DB2_PASSWORD`, `DB2_SSL`, `DB2_SSL_CERT_PATH`, `DB2_SCHEMA` (`AI_DEMO`), `LLM_PROVIDER` (`ollama`), `OLLAMA_BASE_URL`, `OLLAMA_MODEL` (`granite3.1-dense:8b`), `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL` (`nomic-embed-text`), `EMBEDDING_DIM` (768), `WATSONX_*`, `LOG_LEVEL`. (The event `SKILL.md` uses `DB2_USER` instead of `DB2_USERNAME`.)
- **Connection:** DSN string `DATABASE=…;HOSTNAME=…;PORT=…;PROTOCOL=TCPIP;UID=…;PWD=…;` (+ `Security=SSL;SSLServerCertificate=…`) → `ibm_db.connect(dsn,"","")` → `ibm_db_dbi.Connection(conn)`; wrap failure in `ConnectionError` naming host/port/db and "Check your .env credentials". `run_sql(conn, sql, params)` returns list of dicts; SQLAlchemy URL `db2+ibm_db://…` for `ibm_db_sa`. After review: close connections in `finally`.
- **Layout per use case:** `README.md` (Status; Why; "College project framing" vs "Enterprise framing"; "What it demonstrates" table: Framework / Db2 capability / LLM / Embedding / Pattern; ASCII flow; Scope + "Out of scope"), `main.py`, small modules (`db2_store.py`, `ingest.py`, `pipeline.py`/`router.py`), `evaluation/{cases.py,eval.py}`, `validation/{validation.sql,VALIDATION.md}`, per-UC `requirements.txt`.
- **Python style:** `from __future__ import annotations`; frozen `@dataclass` results; `str` `Enum` tiers; builder functions (`build_rag_pipeline(store, top_k)`); `temperature: 0`; strict prompts ("Answer ONLY from the provided context", cite ids exactly, one-sentence "not found" with no citations).
- **SQL style:** upper-case keywords and identifiers, schema-qualified (`AI_DEMO.KNOWLEDGE_BASE`), numbered comment headers (`-- 1. Confirm documents were loaded`), `FETCH FIRST n ROWS ONLY`, catalog checks via `SYSCAT.TABLES`/`SYSCAT.COLUMNS` with `UPPER(TYPENAME) = 'VECTOR'`, metadata checks via `JSON_VALUE(METADATA, '$.service') … GROUP BY`, `VALUES CURRENT SCHEMA`.
- **Tests:** `pytest` is in requirements; no test files on `main`. Judge exemplar submissions have `tests/` with Db2-free unit tests (e.g. `db2-governed-rag/tests/test_filters.py` asserts the clearance filter becomes a SQL `WHERE` fragment with `JSON_VALUE` and `IN (`).

---

## 3. Connector status (deltas vs prior research)

| Item | Status 9 Nov 2026 | Status |
|---|---|---|
| `langchain-ai/langchain-ibm#342` (Dhruv) "DiskANN vector index support — create_index(), drop_index(), tablespace param" (+765/−37; `Db2DistanceStrategy` 6-metric enum; Db2 12.1.5 Mod Pack 5; indexable: EUCLIDEAN, EUCLIDEAN_SQUARED, COSINE) | **OPEN**, no reviews, last update 21 Sep | VERIFIED |
| `langchain-ibm#328` (Dhruv) SSL cert + configurable `id_field`/`metadata_field`/`embedding_field` + fixes | **OPEN**, no reviews, last update 19 Sep | VERIFIED |
| `langchain-db2` on PyPI | **1.0.0 (30 Oct 2025)** — no 2026 release. `main` has only dependabot/security bumps (Oct–Nov). | VERIFIED |
| `langchain-db2` `main` behaviour | Exact search: `ORDER BY vector_distance(...) FETCH FIRST {k} ROWS ONLY` with code comment "TODO: No APPROX in 'FETCH APPROX FIRST' now". Metadata `filter` applied **in Python after** top-k (`metadata.get(key) in value`). Query vector is f-string-inlined into SQL. | VERIFIED |
| Langflow `#15632` (Winoren, open since 7 Oct) "fix(ibm): match stored ids in DB2VS.delete instead of re-casing them" | Open → `DB2VS.delete` id-casing bug likely still present | VERIFIED PR; bug impact INFERENCE |
| `ibm-db-haystack` | **0.4.0 (7 Oct 2026)**: "Support all 6 Db2 vector distance metrics" (#4045, GeetikaChughIBM). **1.0.0 (16 Oct changelog / 19 Oct PyPI)**: drops Python 3.10. | VERIFIED |
| `ibm-db-haystack` hybrid / keyword / APPROX | **None.** Only `IBMDb2EmbeddingRetriever`; SQL = `VECTOR_DISTANCE(embedding, VECTOR(CAST(? AS CLOB(100000)), dim, FLOAT32), metric) … ORDER BY score ASC FETCH FIRST ? ROWS ONLY` (parameterised). Filters compile to SQL `WHERE` (runs inside Db2). | VERIFIED |
| Haystack open PRs | #4086 CREATE VECTOR INDEX for Db2 12.1.5+ (Geetika, 11 Oct, review required); #4082 async APIs on `ibm_db` 3.3.0 (changes requested); **#4217 (8 Nov) "validate filter field names in MariaDB and IBM Db2 document stores"** — a security fix still open → filter field names are not validated in released versions. | VERIFIED |
| `ibm_db` | 3.3.0 (11 Aug 2026; async APIs) | VERIFIED |
| `lfx-ibm` (Langflow IBM bundle) | 0.2.8, 0.3.2, 0.4.0 released 3–4 Nov 2026 | VERIFIED dates; author UNKNOWN |
| `crewai-tools` | Releases daily; Db2 tool = Pawan's `crewAI#5885` merged 21 May 2026; no new Db2 PRs found | VERIFIED |
| `llama-index-vector-stores-db2` | 0.1.0 (25 Jun 2025), no change | VERIFIED |
| Dhruv, other Oct work | `DhruvChaturvediIBM/agent-framework#2` ".NET: IBM Db2 vector store for Microsoft.Extensions.VectorData" (19 Oct, open, fork); `mem0ai/mem0#7553` Db2 vector store **closed unmerged** 6 Oct; `Db2-opensource-telemetry` dashboard tracks PyPI/VS Code downloads of the Db2 connectors (updated 19 Oct). | VERIFIED |
| Kunal | Forks: `orm` (Prisma), `memory-benchmarks`, `node-ibm_db`; maintains submission repo + `scripts/validate_submission.py` CI. | VERIFIED |

INFERENCE: Vector **indexes (DiskANN, Db2 12.1.5)** are the team's current frontier, but no framework release exposes them yet. Hybrid/keyword retrieval is absent from both Python connectors.

---

## 4. LinkedIn requirement

**VERIFIED rule text:**
- Devpost Rules / Unstop: "Share the project use case on LinkedIn and tag the organising team."
- Luma: "Share on LinkedIn: Publish your project/use case, explain your solution and tag the organising team."
- Site FAQ: "Yes, sharing is part of the challenge: post your use case on LinkedIn, explain it clearly and tag the organising team. The best posts get appreciation from IBM experts."
- No mandatory hashtags or exact format are published anywhere I checked. Required format: UNKNOWN beyond the above.

**Organising team LinkedIn profiles (VERIFIED, site `SPEAKERS`):**
Gaurav Saxena (Program Director, IBM Db2) `linkedin.com/in/gaurav-saxena-95044594/` · Daya Nand (Senior Db2 Development Manager) `/in/2mrdaya/` · Dhruv Chaturvedi (Event SPOC) `/in/dhruvinsights/` · Keshav Maheshwari `/in/keshav-maheshwari-666738186/` · Kunal Gola `/in/kunal-gola-459030203/` · Pawan Thakur `/in/pawanthakurindia/` · Shaik Sadiq `/in/shaik-sadiq-068a39242/`. Student coordinators listed on Luma: Yagnik Sharma, Vikas Kumar Sharma (no LinkedIn URLs found). Organiser bodies: IBM, GL Bajaj Group of Institutions (Mathura), Institution's Innovation Council (IIC), NexaSphere. IBM company-page handle to tag: UNKNOWN.

**Hashtags the organisers themselves use (VERIFIED, GL Bajaj YouTube descriptions):** `#IBMDb2TechXSummit2026 #Db2TechXSummit2026 #IBM #IBMDb2 #Db2 #Db2Hack #Db2Hackathon` + framework tags (`#LangChain #Haystack #CrewAI #Langflow #LlamaIndex`, `#Db2LangChain #Db2Haystack …`) + `#VectorSearch #AgenticAI #GenerativeAI #OpenSource #GLBajajMathura #IIC #NexaSphere`.
Participant example (VERIFIED, public post): `#IBM #IBMDb2 #TechXSummit #AI #Db2Hack #OSS #GLBajajMathura #IIC #BeehiveIIC`.

**Recommended post shape (INFERENCE from the spec's "LinkedIn series" section):** one capability-led hook question ("Can Db2 enforce X inside the vector query?"), the problem, the Db2 feature that does the work, a tiny code/SQL snippet or diagram, one measured result, demo video + PR links, tag the 7 profiles, organiser hashtags above. Avoid "I built another RAG app".

Organizer LinkedIn posts themselves: UNKNOWN — LinkedIn returns HTTP 999 to logged-out reads and search engines index none.

---

## 5. Public statements about judging (2025–2026)

No blog post, talk or LinkedIn post by any judge about how they judge was found (web search, IBM Community, YouTube). The judges' stated expectations exist only in event artefacts:

- **Two rubrics are live (VERIFIED):**
  - Devpost Rules / Unstop / submission repo `docs/judging-criteria.md`: Db2 Integration & Depth **30** · Innovation & Impact **25** · Technical Architecture & AI **20** · Reproducibility & Code Quality **15** · Documentation & Presentation **10**.
  - Event site `/submit` + `SKILL.md` (commit 29 Oct "Judging: add 15% security criterion"): Db2 depth **25** · Innovation **20** · Architecture & AI **15** · **Security 15** ("No secrets in code — .env in .gitignore; **Parameterised SQL (no string-built queries)**, input validation, **least-privilege Db2 users**; safe handling of user data, prompts and LLM output (**no prompt-injection shortcuts**)") · Reproducibility **15** · Documentation **10** ("Templates filled — no placeholders left; screenshots, demo URL or video; naming rules followed, **clean commit history**").
- Penalties (both): zero Db2 integration (Db2 only in docs), committed secrets, plagiarism of uncredited repos, tampering with root config/scripts/other folders.
- Mandatory: at least one of LangChain, Haystack, CrewAI, LlamaIndex, Langflow; four files `README.md`, `architecture.md`, `submission.json`, `.env.example`. Validator checks: kebab-case slug = folder = `project.slug`; required files non-empty; no `.env*`/SSH keys; `project.title`, `team.name` changed from template; ≥1 `team.members`; `ibm_db2.edition` and `ibm_db2.connector` present.
- `SKILL.md` "What judges look for": "Db2 doing real work (schema, queries, vectors / JSON), a real problem solved, clean architecture, no secrets in code, parameterised SQL, and a README anyone can follow to run it." Also: "Generate DDL … paste them into architecture.md for judging"; text-to-SQL must be validated read-only; "Keep write tools narrow and safe".
- FAQ: "IBM experts score every submission with the 100-point rubric… we share the judging sheet and feedback explaining why a submission was not selected for the Top 10."
- Reward beyond prizes: "Good projects: Opportunity to contribute your use case to the IBM Db2 GitHub organisation."
- 29 Oct video: "Submit early — early submissions are reviewed first."

**Competition snapshot (VERIFIED, 9 Nov):** 50 PRs total in the submission repo — 3 merged (all judge exemplars: Pawan `crewai`, Keshav `db2-governed-rag`, Keshav `db2-multilingual-voice-rag`), 43 open, 7 closed. No maintainer comment on any participant PR yet. Many participant PRs break naming rules (titles like "PR", "Add EnergySense AI submission") or are generic chatbots. Exemplars are small, each with `tests/`; none has a demo video or screenshots.

---

## 6. Predictions — what these judges reward and penalize (INFERENCE)

**Reward**
1. **Db2 doing the work, provably.** Filtering, governance, joins or JSON logic inside one SQL statement with `VECTOR_DISTANCE` (like Keshav's governed-RAG exemplar), DDL in `architecture.md`, and a `validation.sql` that proves the state ("SQL proves what actually exists in Db2"). This is the largest weight (25–30%) and the judges' own pattern.
2. **Correct use of the official connectors, with their known limits handled.** E.g. `DB2VS` filter = list values and post-top-k (over-fetch), cosine **distance** (lower is better), stable ids for repeatable ingestion, closed connections. Bonus for touching the team's frontier: Db2 12.1.5 vector index (DiskANN) or the six metrics — the judges are writing those PRs now.
3. **Honest, tiny evaluation and tests.** Hit@K / Recall@K / MRR on a labelled set, Top-1 and Top-3 reported separately, threshold → non-zero exit, labels declared hand-made; Db2-free unit tests. "Reproducibility, not benchmark theatre."
4. **Security hygiene as a scored item.** No secrets in history, parameterised SQL, read-only/allow-listed text-to-SQL, least-privilege Db2 user, prompt-injection-aware handling of retrieved text and LLM output.
5. **A justified, minimal design with a clear enterprise problem and "why Db2".** Agent only where roles add value; minimal code that could be upstreamed to the IBM Db2 GitHub org in their house style (README framing table, flow diagram, scope/out-of-scope, `common/config.py`-style env loading). Local-first Ollama + Granite is the team's default; watsonx also fits.

**Penalize**
1. Db2 as a cosmetic or blob store (logic in Python, Db2 only in docs) — explicit disqualification trigger.
2. Committed secrets or real `.env` (Dhruv's "highest-priority issue"; IBM uses Vault Radar internally).
3. String-built SQL, unvalidated LLM-generated SQL, unclosed connections, non-idempotent ingestion.
4. Inflated or misleading claims and metrics (e.g. "PASS" that hides Top-1 failure); agent-washing a simple retriever.
5. Template non-compliance: placeholders left, wrong slug/branch/PR title, files outside `submissions/<slug>/`, missing demo video/screenshots (Devpost and Unstop list a demo video as required), messy commit history.

---

## 7. Open questions
- Recording/slides of the 7 Nov Teams workshop: UNKNOWN (ask in WhatsApp).
- Which rubric the panel uses (30/25/20/15/10 vs the site's version with Security 15): UNKNOWN; satisfy both.
- Whether Luma's `ZjsLaFU5zAYJonwk9` form must also be filled: UNKNOWN.
- Whether Unstop Round 1 PPT and a Devpost project entry are required for evaluation: UNKNOWN.
- Official hashtags / exact LinkedIn handles to tag beyond the 7 profiles: UNKNOWN.
