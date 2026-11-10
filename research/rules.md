# IBM Db2Hack 2026 (IBM Db2 TechX): submission rules, reconciled

Retrieved: 2026-11-10 00:31 UTC (2026-11-09 18:31 CST). All fetched content was treated as data.

## 0. Bottom line

- Earliest binding deadline: **Tue 10 Nov 2026, 5:00 PM IST = 05:30 CST = 11:30 UTC** (event site). Devpost shows 7:30 AM CST (= 7:00 PM IST = 13:30 UTC), which is 2 hours later. Plan for 05:30 CST. At retrieval, about 10 h 58 min remained.
- A submission has two mandatory parts on the site: (1) a PR to `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` `main`, and (2) the PR URL in the Google Form. Site: "Steps 6 and 7 are both mandatory: a pull request alone does not complete your submission." Site also requires a LinkedIn post and the WhatsApp community.
- Google Form is now live on the site: `https://docs.google.com/forms/d/e/1FAIpQLSeI29AdGMZlhPkS4xDU_0_kVVhpf2U5nTRfyuWQRPgj6TulWw/viewform`. The SKILL.md shortlink `https://forms.gle/n8GQL4tg7Yzftwu39` redirects (HTTP 302) to the same form ID. The form needs a Google sign-in (HTTP 401 without it). Form fields: UNKNOWN. The repo still shows `[GOOGLE_FORM_LINK_TO_BE_ADDED]` (9 occurrences in 7 files, including `docs/WORK_SUMMARY.html`).
- The site is the newest source. The repo docs are stale (last content commit 2026-10-29).

## 1. Sources and evidence

| Source | Identifier | Freshness evidence |
|---|---|---|
| Event site HTML | `https://ibmdb2techxsummit.glbajajgroup.ac.in/` (title "Db2Hack is live · IBM Db2 TechX 2026") | Served live. One JS bundle `/assets/index-D2dDR6AR.js`. |
| Event site JS bundle | `index-D2dDR6AR.js`, 709,492 bytes, etag `W/"6e1fad054ca95b5a159a6686dbf9caf8"` | `last-modified: Sat, 07 Nov 2026 20:54:26 GMT`. No lazy chunks. `/submit` route serves the same bundle. |
| Site skill | `/skill/ibm-db2-builder/SKILL.md` (21,073 bytes) and `/skill/ibm-db2-builder.zip` | Zip entry `SKILL.md` timestamp 2026-11-07 05:20:54 (zip local time). Zip copy is byte-identical to the served SKILL.md. Zip holds only that one file. |
| Official repo | `KunalGolaIBM/IBM_Db2_TechX_Project_Submission`, branch `main` only, HEAD `4d685c2cb98edaf2dba6a1b63d341227ac6e42ab` (2026-10-29 16:37 +0530) | `pushed_at 2026-10-29T11:07:16Z`. `updated_at 2026-11-09T10:55:48Z` is metadata (forks/stars), not content. No LICENSE (`license: null`). 88 forks. |
| Unstop | `https://unstop.com/o/5GAmOMJ` | Static HTML has no event content (client-rendered). Round details: UNKNOWN. |

Local copies: `C:\Users\ganes\AppData\Local\Temp\claude\f625f35ee6250202\b711d524-46be-4a65-bfc3-73e82e135939\scratchpad\ibm26\site\` (index.html, index.js, strings.txt, skill\SKILL.md) and `...\ibm26\repos\official\`.

## 2. Changes since the prior audit (HEAD 4d685c2)

Repo:
- `gh api .../commits?since=2026-11-07T00:00:00Z` returned **0 commits**. HEAD is still `4d685c2`. No repo file changed. No new branch.
- Activity only: 43 open PRs (newest #50, 2026-11-09T23:40Z). 4 PRs closed without merge. No maintainer issue comments since 2026-11-01. No merges since 2026-10-29.
- CI: the last 100 Actions runs are 96 `action_required` and 4 `failure`. Fork-PR workflows wait for maintainer approval, so CI is not validating current PRs. Run the validator locally.

Site (no prior snapshot exists, so a byte diff is not possible; these are the current facts that differ from the prior findings):
- Google Form link is now a real URL in the bundle (constant `Yb`); the placeholder string `GOOGLE_FORM` occurs 0 times in the bundle.
- Deadline on the site is "Tue 10 Nov · 5:00 PM IST". Registration "open until Sun 8 Nov" (now past).
- Rubric still has six rows including Security 15.
- Solo-only rule still present (FAQ, home page, Submit page).
- Framework rule still mandatory.

## 3. Prior findings: verification

| Prior finding | Status now | Evidence |
|---|---|---|
| Repo rubric 30/25/20/15/10, no Security row | CONFIRMED | `README.md` L146-151; `docs/judging-criteria.md` table. |
| Site rubric 25/20/15/15/15/10 incl. Security | CONFIRMED | bundle array `tx` (weights 25, 20, 15, 15, 15, 10). SKILL.md L271 agrees. |
| Repo FAQ: teams allowed, list all members | CONFIRMED (stale) | `docs/faq.md` L5-6. |
| Site FAQ: solo only | CONFIRMED | "Db2Hack is solo only: no teams, each person builds and submits their own project." |
| One of LangChain/LlamaIndex/Haystack/CrewAI/Langflow mandatory (site) | CONFIRMED | FAQ: "Every project must use at least one of LangChain, Haystack, CrewAI, LlamaIndex or the no-code Langflow." Repo says frameworks are "encouraged" and AI is optional. |
| Google Form link was `[GOOGLE_FORM_LINK_TO_BE_ADDED]` | CHANGED on site, UNCHANGED in repo | Site: live link. Repo: placeholder in `README.md` (L7, L129), `docs/faq.md` L39, `docs/submission-guide.md` L124, `.github/PULL_REQUEST_TEMPLATE.md` (L7, L76), `CONTRIBUTING.md` and `.github/CONTRIBUTING.md`. |
| Repo README deadline 29 Oct 2026 | CONFIRMED (stale) | `README.md` L29: "29 October 2026, 7:00 PM IST · Hard Deadline". Site supersedes: 10 Nov 5:00 PM IST. |
| Disqualifiers: zero Db2, secrets, plagiarism, tampering | CONFIRMED in both | Site `nx` array; `docs/judging-criteria.md` L19-25. |
| PR only touches `submissions/<slug>/` | CONFIRMED as a rule; NOT enforced by CI | `CONTRIBUTING.md` rule 2 and PR checklist. `validate_submission.py` does not check paths outside the folder. The FAQ claim that CI fails on outside files is not true for the current script. |
| Slug regex `^[a-z0-9]+(-[a-z0-9]+)*$` | CONFIRMED | `validate_submission.py` L14; `CONTRIBUTING.md`. |
| Branch `submission/<slug>` | CONFIRMED | site naming table; README; CONTRIBUTING. |
| PR title `[Submission] <slug>: <Title>` | CONFIRMED | site, README, PR template, CONTRIBUTING. |
| Commits `feat(<slug>): ...` | CONFIRMED | site naming table; CONTRIBUTING also shows `docs(<project-slug>): ...`. |
| Required files README.md, architecture.md, submission.json, .env.example (+ src/) | CONFIRMED | Validator requires the 4 files. `submissions/README.md` also lists `src/` (not checked by the validator). Site: "Four required files". |

## 4. Submission checklist (reconciled; site wins on conflict)

### 4.1 Eligibility and content rules
- [ ] Solo participant (site). Registered on Unstop (closed Sun 8 Nov) and joined the WhatsApp community (site: mandatory).
- [ ] Code actually talks to IBM Db2: Db2 Community Edition (Docker or VS Code extension), Db2 on Cloud, or watsonx.data. "Mentioning Db2 only in the docs is ineligible."
- [ ] Uses at least one of LangChain, Haystack, CrewAI, LlamaIndex, Langflow (site, mandatory). Drivers such as `ibm_db` and SQLAlchemy are "welcome on top". Note: SKILL.md L249 also lists LangGraph in a Round 1 example; the site's five-framework list does not include it.
- [ ] Any language. AI/LLM is "encouraged, not required" (site).
- [ ] No secrets committed. Real keys in local `.env`; commit only `.env.example`. Declare third-party licences. Follow `CODE_OF_CONDUCT.md`.

### 4.2 Folder layout (`submissions/<project-slug>/`, copied from `submissions/_template/`)
```text
submissions/<project-slug>/
├── README.md          # required (validator), >= 20 bytes
├── architecture.md    # required (validator), >= 20 bytes
├── submission.json    # required (validator), keys below
├── .env.example       # required (validator), placeholders only
├── src/               # required by submissions/README.md (not validated)
├── tests/             # template has tests/.gitkeep; "optional but recommended"
└── docs/screenshots/  # template has .gitkeep
```
Template `.env.example` keys: `DB2_HOST=localhost`, `DB2_PORT=50000`, `DB2_DATABASE=testdb`, `DB2_USER=db2inst1`, `DB2_PASSWORD=your_db2_password_here`, `DB2_SECURITY=false`, `WATSONX_APIKEY`, `WATSONX_PROJECT_ID`, `OPENAI_API_KEY`, `APP_ENV=development`, `APP_PORT=8000`.

Template `README.md` sections: Problem Statement; Solution Overview; IBM Db2 Integration; AI / LLM Architecture (if applicable); Tech Stack; Prerequisites; Setup & Installation; Configuration; Running the Project; Testing & Verification; Screenshots & Demo; Known Limitations & Future Roadmap; Team Members & Credits.

Template `architecture.md` sections: Overview; Architecture Diagram (mermaid); Component Breakdown; Data Flow; IBM Db2 Schema & Storage Design; Security & Secrets Management.

### 4.3 `submission.json` (exact template, `submissions/_template/submission.json`)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "project": {
    "title": "Project Title Here",
    "slug": "project-slug-here",
    "short_description": "Brief description of the project.",
    "category": "AI / RAG / Data Engineering / Analytics",
    "demo_url": "",
    "video_url": "",
    "repo_url": ""
  },
  "team": {
    "name": "Team Name Here",
    "members": [
      {
        "name": "Full Name",
        "github": "github-username",
        "email": "user@example.com",
        "role": "Backend / AI Developer"
      }
    ]
  },
  "ibm_db2": {
    "edition": "Db2 Community Edition (Docker)",
    "connector": "ibm_db / SQLAlchemy",
    "features_used": ["Relational Tables", "Indexing", "Vector / JSON Search"]
  },
  "tech_stack": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["FastAPI", "React", "LangChain"],
    "ai_models": ["watsonx.ai Granite", "OpenAI GPT-4o"]
  }
}
```
Validator-enforced keys: `project.title` (not "Project Title Here"), `project.slug` (= folder name), `team.name` (not "Team Name Here"), `team.members` (non-empty list), `ibm_db2.edition`, `ibm_db2.connector`. Solo entrants still must fill `team.name` and one `team.members` entry. Merged example `db2-governed-rag` uses `team.name: "Db2 Governed RAG"` with one member.

### 4.4 Naming (site table = repo README table)
| Asset | Format | Example |
|---|---|---|
| Branch | `submission/<project-slug>` | `submission/db2-support-rag` |
| Folder | `submissions/<project-slug>/` | `submissions/db2-support-rag/` |
| PR title | `[Submission] <project-slug>: <Project Title>` | `[Submission] db2-support-rag: Db2 Support RAG Agent` |
| Commit | `feat(<project-slug>): <message>` | `feat(db2-support-rag): implement vector search chain` |

Slug: `^[a-z0-9]+(-[a-z0-9]+)*$`. CONTRIBUTING: avoid `project`, `test`, `submission1`, `final`. Site step command: `git commit -m "feat(<project-slug>): add hackathon submission"`. PR base: `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` · `main`. One project per PR. Do not close and reopen a PR; push to the same branch.

### 4.5 Validator (`scripts/validate_submission.py`, stdlib only)
Checks, in order, per folder (skips `_template`):
1. Folder name matches `^[a-z0-9]+(-[a-z0-9]+)*$`.
2. `README.md`, `architecture.md`, `submission.json`, `.env.example` exist as files and are each >= 20 bytes.
3. No file anywhere in the folder named (case-insensitive) `.env`, `.env.local`, `.env.development`, `.env.production`, `id_rsa`, `id_ed25519`, and no file ending `.pem`, `.pfx`, `.p12`, `.key`.
4. `submission.json` parses, root is an object, and the six keys in 4.3 pass.

Not checked: `src/`, files outside the folder, branch, PR title, commit style, placeholder text in README/architecture, secrets inside file contents, `.env.example` content, other `.env.*` names (for example `.env.test`; `.gitignore` ignores `.env.*` except `.env.example`).

CI: `.github/workflows/validate-submission.yml` runs `python scripts/validate_submission.py` (no args, all folders) on PRs to `main` touching `submissions/**`, `scripts/**` or the workflow, on Python 3.11. Fork runs currently stop at `action_required`.

Run results (Python 3.13.2, Windows, from the clone root):
- `python -I scripts/validate_submission.py` -> **exit 1, crash**: `UnicodeEncodeError: 'charmap' codec can't encode character '\u2705'`. This is a Windows cp1252 console issue, not a validation failure. `-I` ignores `PYTHONIOENCODING`/`PYTHONUTF8`.
- `python -I -X utf8 scripts/validate_submission.py` -> **exit 0**:
```text
Validating 3 submission folder(s)...
Checking: submissions/crewai                      ✅ PASSED all validation checks.
Checking: submissions/db2-governed-rag            ✅ PASSED all validation checks.
Checking: submissions/db2-multilingual-voice-rag  ✅ PASSED all validation checks.
ALL VALIDATION CHECKS PASSED.
```
- Negative test on a scratch copy (`...\ibm26\repos\vtest`): an unedited template copy plus `.env` and `key.pem` gave 5 errors (secret files x2, title unchanged, slug mismatch, team.name unchanged); a `Bad_Slug` folder added the invalid-name error. Exit 1.

Windows command to use: `python -X utf8 scripts/validate_submission.py submissions/<project-slug>`.

### 4.6 PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
Header notes: PR title format, folder format, "Mandatory Next Step" Google Form.
Sections: 1. Project Overview (Title; Slug; Short Description 1-3 sentences; Problem Solved & Target Audience). 2. Team Information (Team Name; members table: Full Name | GitHub Username | Email / Role). 3. IBM Db2 Integration Summary (Edition / Environment; How Db2 is Used; Connector / Driver / Framework; Schema & Data; Steps to Verify Db2 Integration). 4. Technology Stack & AI / LLM Usage (Languages; Frameworks & Libraries; AI / LLM Framework; Model Provider & Model Name; Where AI/LLM is Applied). 5. Demonstration & Links (Live Demo URL; Demo Video (YouTube / Loom / Drive); External Source Repo; Presentation / Slides URL (optional)). 6. Submission Verification Checklist. 7. Additional Notes for Reviewers & Judges.

Checklist (10 boxes, verbatim labels): Folder Structure; Naming Conventions; Complete Documentation; Metadata File; No Secrets or Credentials; Tested Setup Instructions; License Declared ("Open-source license or distribution terms are specified."); Code of Conduct; Scope Isolation ("This PR only adds/modifies files inside `submissions/<project-slug>/` and does not touch root files or other submissions."); Google Form Submission.

### 4.7 Other requirements
- License: no specific license is mandated. PR checkbox requires a declared open-source license or distribution terms. README: "Declare open-source licensing for third-party libraries and assets." Site: "declare third-party licences." The repo itself has no LICENSE.
- Video: optional. No length limit appears on the site, SKILL.md or the repo. Rubric (Documentation 10): "Screenshots, demo URL or video walkthrough". SKILL.md: "a short demo video"; Round 2 "optionally a demo video". SKILL.md links a "5-minute setup video" (Db2 setup, not a submission limit). Video length limit: UNKNOWN in these sources (check Devpost rules separately).
- LinkedIn: required by the site. Verbatim: "Post on LinkedIn — Explain your use case clearly and tag the organising team. The best posts get appreciation from IBM experts." SKILL.md: "Post the project on LinkedIn and tag the organisers." No handles and no hashtags are specified (0 hashtag strings in the bundle). Organiser LinkedIn profiles listed on the site: Gaurav Saxena (`linkedin.com/in/gaurav-saxena-95044594/`), Daya Nand (`/in/2mrdaya/`), Dhruv Chaturvedi, Event SPOC (`/in/dhruvinsights/`), Keshav Maheshwari (`/in/keshav-maheshwari-666738186/`), Kunal Gola (`/in/kunal-gola-459030203/`), Pawan Thakur (`/in/pawanthakurindia/`), Shaik Sadiq (`/in/shaik-sadiq-068a39242/`). Which accounts count as "the organising team": UNKNOWN.
- Google Form: see section 0. Repo `submission-guide.md` says to "Fill out the team details and paste your PR URL" in the form.
- Round 1 ideation (PDF/PPT): appears only in SKILL.md L246-250: "Db2Hack runs on **Unstop** in two rounds. Do both; check the deadline on the Unstop page." and "Round 1, Ideation & Architecture: upload a PDF or PPT on Unstop with the project title and problem statement, solution and key features, chosen framework (LangChain, CrewAI, Haystack, LangGraph…), the Db2 connector and how you use it, architecture and workflow, and expected impact." The site bundle has 0 matches for "Round 1", "Ideation", "PPT", ".pdf". Whether Round 1 is still required or still open: UNKNOWN.

## 5. Rubric reconciliation

| Dimension | Site (bundle `tx`, Nov 7) | SKILL.md L271 (Nov 7) | Repo `docs/judging-criteria.md` / `README.md` (Oct 28-29) |
|---|---|---|---|
| Db2 | **IBM Db2 integration & depth 25**: "Substantive use of Db2: storage, querying, indexing, stored procedures, vector / JSON"; "Correct drivers, connectors or framework integrations"; "Clean schema design, efficient queries, reliable data" | Db2 integration & depth 25 | **IBM Db2 Integration & Depth 30%**: "Substantive, non-trivial use of IBM Db2 (storage, querying, indexing, stored procedures, vector/JSON capabilities, or specialized engines)."; "Correct implementation of drivers, connectors, or framework integrations (e.g. `ibm_db`, SQLAlchemy, LangChain Db2 vector stores / SQL chains)."; "Clean schema design, efficient querying, and data reliability." |
| Innovation | **Innovation & real-world impact 20**: "Original solution to a real problem"; "Practical for enterprise, developer tooling, analytics or AI automation"; "Clear value for the end user" | Innovation & impact 20 | **Innovation & Impact 25%**: "Originality and novelty of the solution addressing real-world problems."; "Practical applicability for enterprise, developer tooling, analytics, or AI automation."; "Value delivered to end-users or target personas." |
| Architecture & AI | **Technical architecture & AI 15**: "Modular, clean engineering"; "Well-designed RAG / agents / embeddings / prompts, if used"; "Clear, complete architecture.md" | Architecture & AI 15 | **Technical Architecture & AI Integration 20%**: "Sound software engineering principles, modularity, and clean code."; "Effective AI/LLM workflow design (RAG, agentic routing, embeddings, prompt engineering, or fallback handling) if applicable."; "Clarity and completeness of `architecture.md`." |
| Security | **Security 15**: "No secrets in code — credentials via .env, with .env in .gitignore"; "Parameterised SQL (no string-built queries), input validation, least-privilege Db2 users"; "Safe handling of user data, prompts and LLM output (no prompt-injection shortcuts)" | Security 15 | No row. Secrets hygiene sits inside Documentation ("security hygiene (zero secrets committed)"). |
| Reproducibility | **Reproducibility & code quality 15**: "Easy setup by following README.md"; "Working .env.example with prerequisites"; "Tests, input validation and error handling" | Reproducibility & code quality 15 | **Reproducibility & Code Quality 15%**: "Ease of setup and testing following `README.md` instructions."; "Working `.env.example` with clear prerequisite instructions."; "Presence of automated tests, input validation, and clean error handling." |
| Documentation | **Documentation & presentation 10**: "Templates filled — no placeholders left"; "Screenshots, demo URL or video walkthrough"; "Naming rules followed, clean commit history" | Documentation & presentation 10 | **Documentation & Presentation 10%**: "Complete, polished documentation following repository templates without unfilled placeholders."; "Compelling demonstration (screenshots, live demo URL, or video walk-through)."; "Adherence to submission rules, naming conventions, and security hygiene (zero secrets committed)." |
| Total | 100 (6 rows) | 100 | 100 (5 rows) |

Site intro: "A panel of IBM engineers, subject-matter experts and academic mentors scores every submission on six dimensions — including security." Site FAQ: "IBM experts score every submission with the 100-point rubric on the Submit page. To keep it transparent, we share the judging sheet and feedback explaining why a submission was not selected for the Top 10."

Newest source: the site. Evidence: bundle `last-modified: Sat, 07 Nov 2026 20:54:26 GMT`; SKILL.md zip timestamp 2026-11-07; site text refers to post-summit events ("The workshop has ended", Summit "took place on Friday, 30 October 2026"). Repo content dates from 2026-10-28/29 (`docs/WORK_SUMMARY.html` lists the 30/25/20/15/10 weights and the Form placeholder as items "Requiring Organizer Decision"). The site and SKILL.md agree with each other.

Disqualification & penalties (site, verbatim): "Zero-secrets policy: keep real keys in a local `.env`, commit only `.env.example`. Follow the Code of Conduct and declare third-party licences." Zero Db2 integration — "Db2 mentioned in text but never used in code." Committed secrets — "Real passwords, API keys or tokens pushed to GitHub." Plagiarism — "Copying uncredited third-party repos without real innovation." Tampering — "Changing repo root config, scripts or another participant's folder."

## 6. Site mandatory steps and timeline (verbatim)

### 6.1 Submit page, "Step-by-step — From fork to finale."
Sub-heading: "Steps 6 and 7 are both mandatory: a pull request alone does not complete your submission."
1. **Fork & clone** — "Fork the submission repo to your GitHub account, then clone your fork."
   ```
   git clone https://github.com/<your-username>/IBM_Db2_TechX_Project_Submission.git
   cd IBM_Db2_TechX_Project_Submission
   git remote add upstream https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission.git
   ```
2. **Create your branch** — "Branch name: submission/<project-slug> — lowercase letters, numbers and hyphens only."
   ```
   git fetch upstream main
   git checkout -b submission/<project-slug> upstream/main
   ```
3. **Copy the template** — "Your folder gets README.md, architecture.md, submission.json, .env.example, src/ and docs/screenshots/."
   `cp -r submissions/_template submissions/<project-slug>`
4. **Build, document, validate** — "Code in src/, fill submission.json, explain setup in README.md and your design in architecture.md, put only dummy keys in .env.example. Then run the validator."
   `python scripts/validate_submission.py submissions/<project-slug>`
5. **Commit & push** — "Stage only your own project folder."
   ```
   git add submissions/<project-slug>
   git commit -m "feat(<project-slug>): add hackathon submission"
   git push -u origin submission/<project-slug>
   ```
6. **Open a pull request** — "Base: KunalGolaIBM/IBM_Db2_TechX_Project_Submission · main. Title: [Submission] <project-slug>: <Short Project Title>. Complete every checklist in the PR template."
7. **Fill the submission form** — "A PR alone does not complete your submission. Open the official submission form and paste your PR URL into it. Submissions close at 5:00 PM IST on Tue 10 Nov." (button "Open the submission form" -> the Google Form URL)
8. **Post on LinkedIn** — "Explain your use case clearly and tag the organising team. The best posts get appreciation from IBM experts."

### 6.2 Submit page, eligibility cards
- "Meaningful IBM Db2 usage — Your code must actually talk to IBM Db2 — Db2 Community Edition (Docker or the VS Code extension), Db2 on Cloud or watsonx.data. Mentioning Db2 only in the docs is ineligible."
- "At least one Db2Hack framework — LangChain, Haystack, CrewAI, LlamaIndex or the no-code Langflow. Combining several is allowed. Drivers like ibm_db and SQLAlchemy are welcome on top."
- "Any language, AI optional — Python, TypeScript, Java, Go, Rust… AI/LLM workflows (RAG, text-to-SQL, agents) with watsonx.ai, OpenAI, Gemini, OpenRouter or Ollama are encouraged, not required."
- "Four required files — README.md, architecture.md, submission.json and .env.example — all copied from the template and filled in."

### 6.3 Home "Start here" steps
1. "Register and join WhatsApp — Register free on Unstop (open until Sun 8 Nov), then join the WhatsApp community — mandatory. Live updates and the dates for the online workshop and doubt-solving session are shared there first."
2. "Get Db2 free in VS Code — Install the IBM Db2 Developer Extension, click "Create Db2 instance" and you have a free Db2 Community Edition with testdb and SAMPLE databases on your laptop."
3. "Install one AI framework for Db2 — Pick one — LangChain, LlamaIndex, Haystack, CrewAI or no-code Langflow — and install its Db2 package. One is enough."
4. "Build it, then submit — by 10 Nov · 5 PM — Open a pull request on the submission repo, paste the PR link in the Google Form and post your project on LinkedIn. Both PR and form must be in before 5:00 PM IST, Tue 10 Nov."

Home "Good to know" list: "Open to everyone — solo participation only, no teams"; "Submit a GitHub pull request, then the PR link via Google Form"; "Joining the WhatsApp community is mandatory"; "Submissions close at 5:00 PM IST on Tue 10 Nov"; "Results on Wed 11 Nov — Top 3, Top 10 and projects with potential"; "Post your use case on LinkedIn and tag the organising team"; "Top 3 win trophies, Top 10 win IBM Db2 goodies". Framework rule: "Use at least one of these five. … One framework is enough; combining several (for example LangChain + CrewAI) is also allowed."

### 6.4 Key dates (Submit page)
- "Submissions open — Still live — Started 28 Oct, 7:00 PM IST. The workshop has ended — keep building and submit"
- "Submissions close — Tue 10 Nov · 5:00 PM IST — PR + Google Form must both be in before 5:00 PM"
- "Results — Wed 11 Nov — Top 3, Top 10 and the projects with potential are announced. Best submissions win IBM goodies and a chance to contribute to IBM open-source projects"

### 6.5 Timeline (home)
- Wed · 28 Oct — Db2Hack · online — "Db2Hack begins" (19:00-24:00) — "Submissions open at 7:00 PM IST — start building your AI use case on IBM Db2"
- Thu · 29 Oct — Db2Hack · online — "Build, share on LinkedIn, submit" — "Keep building, open your pull request and share on LinkedIn. Submissions are not strict and do not close tonight"
- Fri · 30 Oct — Summit · GL Bajaj, Mathura — Registration and seating; Inaugural ceremony; Technical session & workshop; Refuel and network; Build on campus after the workshop; Panel discussion; Certificates, felicitation and vote of thanks
- Tue · 10 Nov — Db2Hack · online · last day — "Final submissions" — "The workshop has ended but Db2Hack is still live. Open your PR and fill the Google Form before 5:00 PM IST — Top 3 win trophies, Top 10 win IBM Db2 goodies"
- Wed · 11 Nov — Db2Hack · results — "Winners announced" — "We close Db2Hack by announcing the Top 3, the Top 10 and the projects with real potential"

### 6.6 Site FAQ (rules-relevant, verbatim)
- "Who can participate? Can I join as a team?" — "Everyone can participate — students, developers and anyone curious. Db2Hack is solo only: no teams, each person builds and submits their own project."
- "Which frameworks can I use?" — "Every project must use at least one of LangChain, Haystack, CrewAI, LlamaIndex or the no-code Langflow. One is enough; combining several (for example LangChain + CrewAI) is also allowed."
- "Is joining the WhatsApp community mandatory?" — "Yes. Every participant must join the IBM Db2 TechX WhatsApp community — all live updates and any timing changes are shared there first."
- "How do I submit my project?" — "Two steps, both mandatory: open a pull request with your project folder on the official submission repo (github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission), then paste the PR link into the submission form (button on the Submit page). The full walkthrough is on the Submit page. Submissions close at 5:00 PM IST on Tuesday, 10 November."
- "Do I need to post on LinkedIn?" — "Yes, sharing is part of the challenge: post your use case on LinkedIn, explain it clearly and tag the organising team. The best posts get appreciation from IBM experts."
- "What do the winners get?" — "Top 3: a trophy, an IBM Db2 kit and a Certificate of Excellence. Top 10: IBM Db2 goodies and a Certificate of Merit. Students with good projects get the opportunity to contribute their use cases to the IBM Db2 GitHub organisation. Results are announced on Wednesday, 11 November."

## 7. Conflicts (all)

| # | Topic | Site (Nov 7) | Repo (Oct 29) | Other | Resolution |
|---|---|---|---|---|---|
| 1 | Deadline | 10 Nov 5:00 PM IST | 29 Oct 7:00 PM IST | Devpost 10 Nov 7:30 AM CST (= 7:00 PM IST); SKILL.md "check the deadline on the Unstop page" | Use site: 05:30 CST 10 Nov. |
| 2 | Teams | Solo only | Teams allowed (FAQ); template has team fields | Validator needs `team.name` + >=1 member | Solo; fill team fields with your own name. |
| 3 | Framework | One of 5 mandatory | "encouraged"; AI optional | SKILL.md Round 1 lists LangGraph | Use one of the 5. |
| 4 | Rubric | 6 rows incl. Security 15 | 5 rows, 30/25/20/15/10 | SKILL.md = site | Site. |
| 5 | Google Form | Live URL | Placeholder | SKILL.md `forms.gle/n8GQL4tg7Yzftwu39` = same form | Use site URL. |
| 6 | Outside-folder changes | "Tampering" disqualifier | FAQ/CONTRIBUTING say CI fails on them | Validator does not check them | Treat as a hard rule; check `git diff --stat upstream/main` yourself. |
| 7 | Required `src/` | Template copy "gets ... src/" | `submissions/README.md` lists `src/` | Validator ignores it | Include `src/`. |
| 8 | Rounds | Not mentioned | Not mentioned | SKILL.md: two Unstop rounds, Round 1 PDF/PPT | UNKNOWN whether Round 1 applies. |
| 9 | Commit example | `feat(<slug>): add hackathon submission` | README same; submission-guide uses `add hackathon project submission`; CONTRIBUTING allows `docs(<slug>)` | — | Any `feat(<slug>): ...` is fine. |
| 10 | Community links | Live WhatsApp links | `COMMUNITY_LINK_PLACEHOLDER`, site `ibmdb2techx.com` (unverified in WORK_SUMMARY) | — | Site links. |

## 8. UNKNOWN items
- Google Form questions and whether it is still accepting responses (requires Google sign-in).
- Whether Unstop Round 1 (ideation PDF/PPT) is required or still open.
- Video length limit (not stated in any of these sources; check Devpost).
- Exact accounts to tag on LinkedIn; any hashtag (none stated).
- Whether Devpost has extra requirements beyond these sources.
