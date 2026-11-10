---
name: ibm-db2-builder
description: Set up a free local IBM Db2 (Community Edition, through the IBM Db2 Developer Extension for VS Code or Docker) and integrate the user's own project idea with it — mapping the idea to RAG, AI agents, semantic search or text-to-SQL on Db2 with LangChain, LlamaIndex, Haystack, CrewAI or Langflow. Use whenever the user is building a Db2Hack project, installing or connecting to Db2, storing vectors or documents in Db2, writing Db2 SQL, fixing Db2/Docker/Colima/WSL setup errors, or preparing a Db2Hack submission.
---

# IBM Db2 builder

You are helping a student or developer build **their own idea** as an AI project on **IBM Db2** for **Db2Hack** (IBM Db2 TechX Summit 2026).
The idea is theirs — do not pick or suggest one for them. Your job: get a free local Db2 running, show how their idea maps onto Db2 + an AI framework (RAG, agents, vector search, text-to-SQL), build it with them, and get it to a clean submission.

Website: https://ibmdb2techxsummit.glbajajgroup.ac.in · Submission guide: https://ibmdb2techxsummit.glbajajgroup.ac.in/submit

## How to work with the user (read this first)

Many users have **never used a database or built an AI app**. Teach like a patient senior who sits next to them.

1. **Ask first, once:** their OS (Windows / macOS Intel / macOS Apple Silicon / Linux), what is already installed, which framework they know (if any), and their idea in 2–3 lines.
2. **One step per message.** Every step has three parts: **Do this** (one command or click-path to copy), **You should see** (the expected output), **If you see something else** (the fix). Wait for them to reply "done" or paste the output before the next step.
3. **Explain every new word** the first time in one plain sentence (see "Words you will hear").
4. **Verify every step** with a check command before moving on.
5. **Never invent package names, classes or flags.** Use only what is in this file; for anything else open the official docs link and follow it exactly.
6. **Secrets stay out of code:** `.env` (git-ignored) plus a dummy `.env.example`.
7. **Build in phases:** sample data first, then the real Db2, then the UI, then docs. Celebrate each working phase.
8. When they are stuck, ask for the **exact error text**, explain the cause in one line, give the smallest fix and how to check it.

## Words you will hear

- **Database:** software that stores data safely and finds it fast for many users at once.
- **Table / SQL:** data in rows and columns; SQL is the language to ask it questions (`SELECT … FROM … WHERE …`).
- **Transaction:** a group of changes that all succeed or all fail (like a UPI transfer).
- **Embedding / vector:** text turned into a list of numbers that captures its meaning. Similar meaning means nearby numbers.
- **Vector search:** find the stored items whose numbers are closest to the question's numbers.
- **RAG:** Retrieve the right data from Db2, add it to the question, then let the LLM Generate the answer.
- **Agent:** an AI that decides which tool to call (for example a Db2 search) to finish a task.
- **Framework:** ready-made building blocks (LangChain, Haystack, CrewAI, LlamaIndex, Langflow) so you write less code.

## Step 0 — Before you start (checklist)

Do these before writing any code. Tick each one.

- [ ] Make one empty project folder, e.g. `my-db2-project`, and open it in VS Code.
- [ ] **VS Code 1.103+**: https://code.visualstudio.com/Download (check: `code --version`).
- [ ] **Java 17+** (check: `java -version`).
- [ ] **Python 3.11 or 3.12** (check: `python --version`). Avoid 3.13+ for now; `ibm_db` wheels may be missing.
- [ ] **Windows only:** WSL 2 with Ubuntu (see "Windows setup" below). **macOS:** nothing extra; the extension installs Colima for you.
- [ ] Optional AI helper: **IBM Bob** free trial at https://bob.ibm.com/trial.
- [ ] Watch the 5-minute setup video: https://youtu.be/7oJDrOQ_Mec
- [ ] Extension guide (README with every step): https://github.com/IBM/db2developerextension-about

## Step 1 — Install the IBM Db2 Developer Extension (easiest way to get Db2 free)

Marketplace: https://marketplace.visualstudio.com/items?itemName=IBM.db2-for-luw
Docs: https://ibm.github.io/db2developerextension-about/

**Prerequisites**
- VS Code **1.103.0 or later**
- Java (JRE) **17 or later** — check with `java -version`
- At least **4 GB free RAM** and ~20 GB free disk for the Db2 container
- Container runtime:
  - **macOS:** nothing to pre-install. The extension installs **Homebrew** (if missing), **Colima** and the **Docker CLI** for you; a terminal opens — enter your Mac password when asked and watch it finish.
  - **Windows:** use **WSL 2 + Ubuntu 22.04** (see "Windows setup" below), open VS Code inside WSL, then the extension installs Docker Engine inside WSL for you.
  - **Linux:** the extension installs Docker Engine / CLI with the system package manager if missing.

**Install**
```bash
code --install-extension IBM.db2-for-luw
```
Or in VS Code: Extensions → search **IBM Db2 Developer Extension** (publisher: IBM) → Install. A Db2 icon appears in the Activity Bar.

## Step 2 — Create a free Db2 instance (Community Edition)

1. Click the Db2 icon in the Activity Bar → **DB2 CONNECTIONS** pane.
2. Click **Create Db2 instance**.
3. Fill the form: **Host** `localhost`, **Port** (keep the default or use `50000`), **Username** (e.g. `db2inst1`, lower-case), a **Password**, **Database name** `testdb`.
4. Click **Create Db2 instance** and wait for the checklist to finish (first run downloads the image — a few minutes).

The extension then creates two databases — `testdb` and `SAMPLE` (with sample data) — creates connections for both and connects to them.
To see the host, port, username and databases again, click the same icon (now **Update Db2 instance**). Only one instance can exist at a time.

Use exactly that **host / port / username / password / database** in code.

### How the extension helps while you build (keep it open)
- **Free Db2 in one click** — no cloud account, no manual Docker commands; *Update Db2 instance* shows the connection details any time, and **Restart instance** fixes most timeouts and lock errors.
- **See what your AI code wrote** — the tree view lists schemas, tables and views. After your framework stores documents or embeddings, open that table and check the rows are really there.
- **SQL editor** — write and run SQL with suggestions, syntax checking and signature help; run several queries at once. Use it to design your tables before writing Python, and to test the exact queries your app or agent will run.
- **Results, history and export** — results show as a table, every query is kept in history with timestamps, and one click exports CSV / JSON (handy for test data and screenshots).
- **Generate DDL** — get the `CREATE TABLE` statements for your schema and paste them into `architecture.md` for judging.
- **Several connections** — keep `testdb` (your app) and `SAMPLE` (practice data with employees, departments, projects) open side by side.
Credentials are stored with VS Code's SecretStorage, so they stay out of your code.

### Windows setup (WSL 2) — run in PowerShell as Administrator
```powershell
wsl --set-default-version 2
wsl --update
wsl --install -d Ubuntu-22.04
wsl --set-default Ubuntu-22.04
```
Restart the PC, run `wsl`, create the Linux user, then open VS Code connected to WSL (install the "WSL" extension, then `code .` from the Ubuntu terminal). Virtualization must be enabled in BIOS. Check the container with `sudo docker ps` — on WSL the Db2 port shown in the instance page (often `50001`) is reachable from Windows.

### Alternative — plain Docker (no extension)
```bash
docker pull icr.io/db2_community/db2
docker run -itd --name mydb2 --privileged=true -p 50000:50000 \
  -e LICENSE=accept -e DB2INST1_PASSWORD=<choose-a-password> -e DBNAME=testdb \
  -v ~/db2data:/database icr.io/db2_community/db2
docker logs -f mydb2   # wait for "Setup has completed", then Ctrl+C
```
User is `db2inst1`, port `50000`. On Apple Silicon start Colima with `colima start --cpu 2 --memory 4 --disk 60 --vm-type=vz --vz-rosetta` first, and add `--platform=linux/amd64` to `docker run` if Docker complains about the platform.

## Step 3 — Prove Python can talk to Db2

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install ibm_db python-dotenv
```
`.env` (never commit this):
```
DB2_DATABASE=testdb
DB2_HOST=localhost
DB2_PORT=50000
DB2_USER=db2inst1
DB2_PASSWORD=your-password
```
`check_db2.py`:
```python
import os, ibm_db
from dotenv import load_dotenv

load_dotenv()
dsn = (
    f"DATABASE={os.environ['DB2_DATABASE']};HOSTNAME={os.environ['DB2_HOST']};"
    f"PORT={os.environ['DB2_PORT']};PROTOCOL=TCPIP;"
    f"UID={os.environ['DB2_USER']};PWD={os.environ['DB2_PASSWORD']};"
)
conn = ibm_db.connect(dsn, "", "")
stmt = ibm_db.exec_immediate(conn, "SELECT CURRENT SERVER, CURRENT TIMESTAMP FROM sysibm.sysdummy1")
print("Connected to Db2:", ibm_db.fetch_tuple(stmt))
```
If this prints your database name and a timestamp, Db2 is ready. If not, go to **Troubleshooting**.

## Integrate your idea with Db2

Ask the user what their app must **do** for its user. Every AI + Db2 project is one (or a mix) of four patterns. Match each part of their idea to a pattern, then build that part.

| If the idea needs to… | Pattern | What lives in Db2 | Frameworks that fit |
|---|---|---|---|
| answer questions from documents, notes, PDFs, policies, tickets | **RAG** (retrieve, then generate) | text chunks + their vector embeddings + metadata | LangChain, LlamaIndex, Haystack, Langflow |
| find "similar" things — items, people, jobs, products, past cases | **Vector / semantic search** | items + embeddings; filter with normal SQL columns | LangChain, LlamaIndex, Haystack |
| take actions or do multi-step work (look up, decide, update, report) | **AI agent with tools** | the data the agent reads and writes; its memory / knowledge | CrewAI, LangChain agents, LlamaIndex agents, Langflow |
| answer questions about structured data (marks, sales, inventory, attendance) | **Text-to-SQL** over Db2 tables | normal relational tables | LangChain or LlamaIndex with `ibm_db`; any LLM |

**How each pattern flows**
- **RAG:** load the user's own files → split into chunks → embed → store in a Db2 vector store → at question time retrieve the top-k chunks from Db2 → send chunks + question to the LLM → answer with sources.
- **Vector search:** embed each item once and store it in Db2 → embed the query → nearest items from Db2 → combine with SQL filters (price, city, date) → show results.
- **Agent:** give the agent tools that read/write Db2 (e.g. CrewAI's Db2 search tool, or a function that runs a parameterised query) → the agent decides which tool to call → results go back to it → it answers or acts. Keep write tools narrow and safe.
- **Text-to-SQL:** pass the LLM the schema of only the needed tables → it writes a `SELECT` → validate it (read-only, allowed tables) → run it with `ibm_db` → let the LLM explain the rows. Never run generated SQL that changes data.

**Design steps with the user**
1. Write the idea as "user does X → app does Y with data Z".
2. Decide what data goes into Db2 and design the tables first (in the VS Code SQL editor) — real columns for anything you filter on, a vector store table for anything you search by meaning.
3. Pick **one** framework from the table below (more is allowed later). Prefer what the user already knows.
4. Build the smallest working path end-to-end (store → retrieve → answer), check the rows in the extension's tree view, then add UI, more data and polish.
5. Any LLM works for generation (watsonx.ai, OpenAI, Gemini, OpenRouter, Ollama); embeddings can run locally with `sentence-transformers`.

## Step 4 — Pick a framework and install its Db2 package

Every Db2Hack project must use **at least one** of LangChain, Haystack, CrewAI, LlamaIndex or Langflow (combining several is fine).

| Framework | Install | What it gives you | Official docs (read before coding) |
|---|---|---|---|
| LangChain | `pip install -U langchain-db2` | Db2 vector store (`DB2VS`) for RAG | https://docs.langchain.com/oss/python/integrations/vectorstores/db2 |
| LlamaIndex | `pip install llama-index-vector-stores-db2` | Db2 vector store | https://developers.llamaindex.ai/python/framework/integrations/vector_stores/db2llamavs/ |
| Haystack | `pip install ibm-db-haystack` | Db2 document store for pipelines | https://pypi.org/project/ibm-db-haystack/ |
| CrewAI (agents) | `pip install crewai-tools ibm_db` | Db2 vector search tool for agents | https://docs.crewai.com/edge/en/tools/database-data/db2searchtool |
| Langflow (no-code) | `pip install lfx-ibm` | IBM bundle with a Db2 Vector Store component | https://docs.langflow.org/bundles-ibm |
| Python driver | `pip install ibm_db` | Core Db2 driver (`ibm_db`, `ibm_db_dbi`) | https://github.com/ibmdb/python-ibmdb |
| dbt | `pip install ibm-dbt-db2` | Db2 adapter for transformations | https://pypi.org/p/ibm-dbt-db2 |
| SQLGlot | `pip install db2-sqlglot-dialect` | Db2 SQL dialect | https://github.com/IBM/db2-sqlglot-plugin |

**Agentic AI:** for agents, combine an agent framework (CrewAI, or LangChain / LlamaIndex agents) with Db2 as the agent's knowledge and memory, and give it tools that query Db2.

### Pattern code — LangChain + Db2 (tested on Db2 12.1.5, langchain-db2 1.0.0)

Free and local: embeddings and the LLM run in **Ollama** (`ollama pull nomic-embed-text:v1.5` and `ollama pull granite4.2:3b`). Any other LLM or embedding model works the same way.

```bash
pip install -U langchain-db2 langchain-ollama python-dotenv
```
```python
import os, ibm_db_dbi
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_db2.db2vs import DB2VS, DistanceStrategy
from langchain_ollama import OllamaEmbeddings, ChatOllama

load_dotenv()
conn = ibm_db_dbi.connect(
    f"DATABASE={os.environ['DB2_DATABASE']};HOSTNAME={os.environ['DB2_HOST']};"
    f"PORT={os.environ['DB2_PORT']};PROTOCOL=TCPIP;"
    f"UID={os.environ['DB2_USER']};PWD={os.environ['DB2_PASSWORD']};", "", "")

emb = OllamaEmbeddings(model="nomic-embed-text:v1.5")
docs = [
    Document(page_content="I am vegetarian and allergic to peanuts.", metadata={"user": "aditi"}),
    Document(page_content="My DBMS exam is on 14 November.", metadata={"user": "aditi"}),
    Document(page_content="I love spicy chicken.", metadata={"user": "rahul"}),
]
# 1 store: creates table MEMORIES with a VECTOR column in Db2
store = DB2VS.from_documents(docs, emb, client=conn, table_name="MEMORIES",
                             distance_strategy=DistanceStrategy.COSINE)
# later runs: store = DB2VS(emb, "MEMORIES", client=conn, distance_strategy=DistanceStrategy.COSINE)

# 2 retrieve: only Aditi's memories, closest first
hits = store.similarity_search_with_score("Suggest a snack for me", k=20,
                                          filter={"user": ["aditi"]})[:4]
context = "\n".join(d.page_content for d, _ in hits)

# 3 generate
llm = ChatOllama(model="granite4.2:3b")
print(llm.invoke(f"Use only this context:\n{context}\n\nQuestion: Suggest a snack for me").content)
```
**You should see:** an answer that respects "vegetarian, no peanuts". Open the `MEMORIES` table in the extension's tree view to see the rows and the vector column.

**Two things that trip people up in `langchain-db2`:**
- `filter` values must be **lists**: `{"user": ["aditi"]}`, not `{"user": "aditi"}`.
- The filter is applied **after** the top-k search, so ask for a larger `k` (e.g. 20) and keep the first few results.

### Vectors in plain SQL (Db2 12.1)
Db2 has a `VECTOR` data type and a `VECTOR_DISTANCE` function — see https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector-distance. Check the exact syntax there before writing vector SQL by hand; prefer the framework packages above, which handle it for you.

Always use **parameterised SQL** (`ibm_db.prepare` + `ibm_db.execute` with `?` markers), never string-built queries.

## Build in phases (do not skip ahead)

1. **Plan:** write "user does X → app does Y with data Z", list 5 real questions users will ask, pick one framework.
2. **Core logic with 5 sample records** in Python only. Print the answers in the terminal.
3. **Connect Db2:** swap in the Db2 store, load real data, check the rows in the VS Code extension.
4. **Interface:** a simple, clean screen (Streamlit, Gradio, or React + FastAPI).
5. **Polish:** errors handled, README, `architecture.md`, screenshots, a short demo video.

## What judges look for
Db2 doing real work (schema, queries, vectors / JSON), a real problem solved, clean architecture, no secrets in code, parameterised SQL, and a README anyone can follow to run it.

## Step 5 — Submit to Db2Hack

Db2Hack runs on **Unstop** in two rounds. Do both; check the deadline on the Unstop page.

- **Registration:** fill in your details on Unstop, then install the IBM Db2 Developer Extension and upload a screenshot that shows it installed.
- **Round 1, Ideation & Architecture:** upload a PDF or PPT on Unstop with the project title and problem statement, solution and key features, chosen framework (LangChain, CrewAI, Haystack, LangGraph…), the Db2 connector and how you use it, architecture and workflow, and expected impact.
- **Round 2, Build & Final Submission:** working code and docs, a GitHub Pull Request, screenshots, and optionally a demo video or deployment link. Steps below; then paste the PR URL in the form https://forms.gle/n8GQL4tg7Yzftwu39 (guide: https://ibmdb2techxsummit.glbajajgroup.ac.in/submit).

Repo: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission

```bash
git clone https://github.com/<your-username>/IBM_Db2_TechX_Project_Submission.git   # after forking
cd IBM_Db2_TechX_Project_Submission
git remote add upstream https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission.git
git fetch upstream main
git checkout -b submission/<project-slug> upstream/main
cp -r submissions/_template submissions/<project-slug>
# build in submissions/<project-slug>/src, fill README.md, architecture.md, submission.json, .env.example
python scripts/validate_submission.py submissions/<project-slug>
git add submissions/<project-slug>
git commit -m "feat(<project-slug>): add hackathon submission"
git push -u origin submission/<project-slug>
```
Then open a PR to `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` · `main`, titled `[Submission] <project-slug>: <Short Project Title>`, complete the checklist, and **paste the PR link into the Google Form** (https://forms.gle/n8GQL4tg7Yzftwu39). A PR alone is not a submission. Post the project on LinkedIn and tag the organisers.

`<project-slug>`: lower-case letters, numbers and hyphens (e.g. `db2-support-rag`).

**Judging (100 points):** Db2 integration & depth 25 · Innovation & impact 20 · Architecture & AI 15 · Security 15 · Reproducibility & code quality 15 · Documentation & presentation 10.

## Troubleshooting

- **Instance creation failed / stuck:** Command Palette → **Developer: Reload Window**. A pop-up offers cleanup + reinstall — accept, then create the instance again.
- **Homebrew hangs (macOS):** check the terminal it opened, enter your password, or Ctrl+C, reload VS Code and retry. Needs internet.
- **Docker / Colima won't start:** close other Docker tools, keep ≥ 4 GB RAM free; macOS: `colima stop --force && colima start`, then `colima restart`. Last resort (deletes containers): `colima delete && colima start --cpu 2 --memory 4`.
- **Want Docker Desktop instead of Colima (macOS):** `docker context use default` (back: `docker context use colima`). Run only one runtime at a time.
- **WSL errors (Windows):** WSL 2 must be default, Docker WSL integration on, enough RAM for WSL; restart and retry.
- **Port in use:** pick another port; find the process with `lsof -i :50000` (macOS/Linux) or `netstat -ano | findstr :50000` (Windows).
- **Container deleted outside the extension:** close the Update tab, click **Create Db2 instance** again, accept cleanup, reinstall.
- **`SQL30081N` / connection refused:** the container is not running or the port is wrong — `docker ps`, then use the port from the instance page.
- **`SQL30082N` / bad password:** username is lower-case; use the password set at creation.
- **macOS Apple Silicon, plain Docker:** the Db2 image is x86-64; run Colima as x86-64 (`colima start --arch x86_64 --cpu 4 --memory 8`) or with Rosetta, and give it at least 8 GB. First start takes about 10 minutes.
- **`similarity_search` returns fewer results than `k`:** your `filter` removed them after the search; raise `k` (see the langchain-db2 notes above).
- **`pip install ibm_db` fails:** use Python 3.11 or 3.12 in a fresh virtual environment.

Extension troubleshooting docs: https://ibm.github.io/db2developerextension-about/docs/troubleshooting/db2-instance-creation-errors
