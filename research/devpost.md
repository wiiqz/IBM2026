# IBM Db2Hack 2026 — source-cited fact sheet

- Retrieved: 2026-11-09 about 18:30 CST (= 2026-11-10 00:30 UTC = 2026-11-10 06:00 IST).
- Method: `curl -sL` (logged out, no cookies), HTML-to-text extraction; event-site SPA read from its JS bundle; Unstop read from its public JSON endpoint; YouTube via `yt-dlp -J --skip-download`; GitHub via `gh api`.
- Nothing was signed into, submitted, joined, commented or posted. All fetched content was treated as data.
- Raw copies: `C:\Users\ganes\AppData\Local\Temp\claude\f625f35ee6250202\b711d524-46be-4a65-bfc3-73e82e135939\scratchpad\ibm26\research\raw\` (Devpost pages), `...\raw\ext\` (event site, Luma, Unstop, SKILL.md, repo files), `...\raw\yt\` (video metadata). Extracted text: `...\research\txt\`.
- Time-zone math: IST = UTC+5:30. CST = UTC-6 (US DST ended 2026-11-01).

---

## 0. Decision-relevant summary

| Item | Fact | Source |
|---|---|---|
| Devpost hard deadline | `2026-11-10T08:30:00-05:00` = **Nov 10 13:30 UTC = 7:00 PM IST = 7:30 AM CST** | Devpost overview/rules/dates HTML |
| Earlier deadline in the rules text and on every other channel | **"10 November 2026, 5:00 PM IST"** = 11:30 UTC = **5:30 AM CST Nov 10** | Devpost /rules, Unstop, Luma, event site, SKILL.md |
| Time left at retrieval | about 11 h to 5:00 PM IST; about 13 h to 7:00 PM IST. Devpost API said "about 14 hours left". | computed; Devpost API |
| Safe target | Finish everything before **5:00 PM IST (5:30 AM CST) Nov 10**. | recommendation |
| Mandatory pieces (Devpost) | GitHub PR to `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` + PR URL in the Google Form; rules add a LinkedIn post that tags the organisers. | Devpost overview + /rules |
| Team | Devpost: no rule. Unstop, Luma, event site: **solo only**. Repo FAQ: teams allowed. | see §3 |
| Eligibility | Devpost: "Students only"; companies excluded. Unstop/Luma/event site: open to everyone including working professionals. | see §3 |
| Rubric | Devpost /rules: 30/25/20/15/10 (no Security). Event site: 25/20/15/**15 Security**/15/10. | see §5 |
| Google Form | Devpost, Unstop, event site: `forms.gle/n8GQL4tg7Yzftwu39`. **Luma labels that same form "Db2 Goodies Challenge Form" and names a different "Main Project Submission Form" `forms.gle/ZjsLaFU5zAYJonwk9`.** Both forms need Google sign-in; titles UNKNOWN. | see §4.6 |
| Devpost submission form fields | **UNKNOWN** — `/submit-to/32023-ibm-db2hack-2026/start/submissions/new` redirects to `https://secure.devpost.com/users/login`. | curl |
| Discussions / Gallery | No forum topics. Gallery not published. | Devpost |
| Updates | 2 posts: "Final call for submissions"; webinar 7 Nov 3–5 PM IST (past). | Devpost /updates |

---

## 1. Sources fetched

| URL | Result |
|---|---|
| https://ibm-db2hack-2026.devpost.com/ | 200, read |
| https://ibm-db2hack-2026.devpost.com/rules | 200, read |
| https://ibm-db2hack-2026.devpost.com/resources | 200, read |
| https://ibm-db2hack-2026.devpost.com/updates (+ both posts) | 200, read |
| https://ibm-db2hack-2026.devpost.com/forum_topics | 200, "No topics have been created yet." |
| https://ibm-db2hack-2026.devpost.com/project-gallery | 200, "The hackathon managers haven't published this gallery yet, but hang tight!" |
| https://ibm-db2hack-2026.devpost.com/details/dates | 200, read |
| https://ibm-db2hack-2026.devpost.com/prizes | **404** (page does not exist; prizes are on the overview) |
| https://devpost.com/api/hackathons?search=db2hack | 200, listing JSON |
| https://devpost.com/submit-to/32023-ibm-db2hack-2026/start/submissions/new | 302 → login. Form fields UNKNOWN. |
| https://ibmdb2techxsummit.glbajajgroup.ac.in/ (+ `/assets/index-D2dDR6AR.js`) | 200, SPA; content read from bundle |
| https://ibmdb2techxsummit.glbajajgroup.ac.in/skill/ibm-db2-builder/SKILL.md | 200, read |
| https://luma.com/68jmineh | 200, read (`__NEXT_DATA__`) |
| https://unstop.com/hackathons/db2hack-2026-...-1795047 | 200 SPA shell; data read from https://unstop.com/api/public/competition/1795047 |
| https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission | read via `gh api` |
| https://forms.gle/n8GQL4tg7Yzftwu39 | 302 → Google Form `1FAIpQLSeI29…`, then **401 "You must sign in to access this content"** |
| https://forms.gle/ZjsLaFU5zAYJonwk9 (from Luma) | 302 → Google Form `1FAIpQLSdmClZ…`, **401** |
| https://forms.gle/49fVzq8m7cV1u3Pi8 (from Luma) | 302 → **same** Google Form `1FAIpQLSeI29…`, **401** |
| https://chat.whatsapp.com/L5EwLpFMmqa179MsOgi9fu | Not opened (joining a group is out of scope). Content UNKNOWN. |
| 6 YouTube videos | metadata read with yt-dlp |

---

## 2. Deadline — every appearance

| Where | Verbatim | Instant (UTC) | CST |
|---|---|---|---|
| Devpost header (overview, rules, every tab), logged out | "Deadline: Nov 10, 2026 @ 7:00pm IST" | 13:30 Nov 10 | 7:30 AM Nov 10 |
| Devpost overview, user's own view (per brief) | "Deadline Nov 10, 2026 @ 7:30am CST" | 13:30 Nov 10 | same instant |
| Devpost overview countdown HTML | `<time id="time-left" ... datetime="2026-11-10T08:30:00-05:00">November 10 at 8:30am EST</time> to deadline` | 13:30 | 7:30 AM |
| Devpost /details/dates | "Submissions … November 06 at 12:45am IST … November 10 at 7:00pm IST" (`data-iso-date="2026-11-05T14:15:00-05:00"` / `"2026-11-10T08:30:00-05:00"`) | 13:30 | 7:30 AM |
| Devpost API | `"submission_period_dates": "Nov 05 - 10, 2026"`, `"time_left_to_submission": "about 14 hours left"` | — | — |
| **Devpost /rules body** | "Final Submission Deadline: 10 November 2026, 5:00 PM IST." | **11:30** | **5:30 AM** |
| Unstop details | "Final Submission Deadline: 10 November 2026, 5:00 PM IST" and "All deadlines follow Indian Standard Time (IST)." | 11:30 | 5:30 AM |
| Unstop API | opportunity `end_date "2026-11-10T19:00:00+05:30"`; both rounds `end_date "2026-11-10T19:00:00+05:30"`, `grace_period: 15` (unit not stated); registration `end_regn_dt "2026-11-10T17:00:00+05:30"` | 13:30 (rounds) / 11:30 (registration) | 7:30 / 5:30 AM |
| Event site meta | "submit by 5 PM IST, 10 Nov"; "Submissions close 10 Nov, 5 PM IST. Results 11 Nov." | 11:30 | 5:30 AM |
| Event site Submit page | "Submissions close — Tue 10 Nov · 5:00 PM IST — PR + Google Form must both be in before 5:00 PM" | 11:30 | 5:30 AM |
| Luma description | "Final Submission Deadline: 10 November 2026, 5:00 PM IST" | 11:30 | 5:30 AM |
| Luma event object | `start_at 2026-10-28T06:30:00Z`, `end_at 2026-11-11T11:30:00Z`, tz `Asia/Kolkata` | — | — |
| SKILL.md | "Db2Hack runs on **Unstop** in two rounds. Do both; check the deadline on the Unstop page." | — | — |
| Repo README (stale) | "Db2Hack Submission Deadline \| 29 October 2026, 7:00 PM IST \| Hard Deadline — PRs & Google Form" | past | past |

Conclusion (observed): the Devpost platform closes at 7:00 PM IST. Every written rule, including Devpost's own /rules page, says 5:00 PM IST. The PR and Google Form are the judged artefacts, so 5:00 PM IST is the binding one.

---

## 3. Eligibility and team rules

**Devpost overview** ("Who can participate"), verbatim:
> - Above legal age of majority in country of residence
> - Students only
> - Companies/professional organizations excluded from participation
> - All countries/territories, excluding standard exceptions

Devpost text has **no team-size rule** on any tab (searched overview, rules, resources, updates, dates for team/solo/individual/members). Devpost team limit: UNKNOWN.

**Other channels:**
- Unstop details: "Participation Mode: Individual (Solo Only)" … "Db2Hack 2026 is open to: Students from any college or university. Software developers and fresh graduates. Working professionals. AI, machine learning, and technology enthusiasts. Participation is strictly individual. Each participant must register and submit their own project. Team submissions are not permitted." Unstop API: `max_team_size: 1, min_team_size: 1`.
- Luma: "open to students, developers, innovators and technology enthusiasts from anywhere in the world" … "Participation is strictly individual. Team submissions are not allowed."
- Event site FAQ: "Everyone can participate — students, developers and anyone curious. Db2Hack is solo only: no teams, each person builds and submits their own project."
- Repo `docs/faq.md`: "Q: Can we work in teams or only individually? A: Both individual participants and teams are eligible, subject to the official hackathon rules." (`submission.json` template also has `team.name` and `team.members[]`; the validator requires `team.name` not equal to "Team Name Here" and at least one member.)

Other participation requirements stated outside Devpost:
- WhatsApp community "mandatory" (event site FAQ: "Yes. Every participant must join the IBM Db2 TechX WhatsApp community"; Unstop: "Joining the official WhatsApp community is mandatory.").
- Unstop: "Unstop and Luma registration must be completed." and "register through the official Luma event page by 8 November 2026." Event site: "Register free on Unstop (open until Sun 8 Nov)". Unstop API registration window actually ends `2026-11-10T17:00:00+05:30`.
- Framework: event site, Unstop, Luma: at least one of LangChain, LlamaIndex, Haystack, CrewAI, Langflow is mandatory. Event site: "Mentioning Db2 only in the docs is ineligible." Repo FAQ says AI is optional.

---

## 4. Submission requirements

### 4.1 Devpost overview — "Requirements" (verbatim)
> **What to Build**
> Participants develop a functional implementation of their proposed solution, demonstrating meaningful IBM Db2 integration with their selected AI framework.
> Final submission must include:
> - Working project and complete source code.
> - Project documentation, including setup and execution instructions.
> - System architecture and implementation details.
> - Screenshots demonstrating the application.
> - A demo video showcasing the working solution.
>
> GitHub Submission: Participants must fork the official repository, follow its submission template, add their project, and raise a Pull Request (PR) against the original repository.
> Google Form: Participants must submit their GitHub PR link through the official Google Form.
> Both the GitHub PR and Google Form submission are mandatory.

### 4.2 Devpost /rules — "Submission Guidelines" (verbatim)
> All participants must complete the following requirements:
> - Submit the project through a Pull Request to the official GitHub repository.
> - Follow the repository's submission template and documentation guidelines.
> - Include working source code, setup instructions, and project documentation.
> - Submit the GitHub PR URL through the official Google Form.
> - Share the project use case on LinkedIn and tag the organising team.
> Final Submission Deadline: 10 November 2026, 5:00 PM IST.
> Incomplete submissions or submissions received after the deadline may not qualify for evaluation.

The /rules page also has empty headings "Prizes" and "Judging Criteria and Winner Selection" (no body text in the HTML).

### 4.3 Devpost submission form
- UNKNOWN. Reason: the form is behind login (302 → `https://secure.devpost.com/users/login`).
- Not stated anywhere: video length limit, "Built with", try-it link, image requirements, custom questions.
- No page says a Devpost project entry is required; Devpost Requirements name only the PR and the Google Form as mandatory. Whether judges read Devpost entries: UNKNOWN.
- Assumption (not verified for this event): Devpost's standard form asks for project name, elevator pitch, story, "Built with", "Try it out" links, image gallery and a video demo link.

### 4.4 Video
- Devpost overview: "A demo video showcasing the working solution." (listed under "must include").
- Unstop Round 2 text: "Demo video or deployment link (optional)." But the Round 2 field "Demo video link" has `is_mandatory: 1`.
- SKILL.md: "optionally a demo video or deployment link".
- Repo PR template: "Demo Video (YouTube / Loom / Drive):" field; `submission.json` has `video_url`.
- Length limit: **none stated anywhere** (UNKNOWN).

### 4.5 LinkedIn
- Devpost /rules: "Share the project use case on LinkedIn and tag the organising team."
- Event site FAQ: "Yes, sharing is part of the challenge: post your use case on LinkedIn, explain it clearly and tag the organising team. The best posts get appreciation from IBM experts."
- Specific handles or hashtags: **not stated** (UNKNOWN). Event site lists LinkedIn profiles for the IBM speakers (see §6).

### 4.6 Google Form — conflict
| Source | Label | Short link | Resolves to form ID |
|---|---|---|---|
| Devpost /resources | "Final Submission Google Form" | `https://forms.gle/n8GQL4tg7Yzftwu39` | `1FAIpQLSeI29AdGMZlhPkS4xDU_0_kVVhpf2U5nTRfyuWQRPgj6TulWw` |
| Unstop details + Round 2 text | "Final Submission Google Form" / "Submit your PR URL here" | same `n8GQL…` | same |
| Event site (Submit page, bundle) | "Fill the submission form" | direct `…/1FAIpQLSeI29…/viewform` | same |
| SKILL.md | "paste the PR URL in the form" | same `n8GQL…` | same |
| **Luma** | "Main Project Submission Form" | `https://forms.gle/ZjsLaFU5zAYJonwk9` | **`1FAIpQLSdmClZkEtG2fjdlN15GrsCE0kH88OAkAXu2pXk6yXXuDYjHMg`** |
| **Luma** | "Db2 Goodies Challenge Form" | `https://forms.gle/49fVzq8m7cV1u3Pi8` | **`1FAIpQLSeI29…`** (the same form Devpost calls the final submission form) |
| Repo README / PR template / submission-guide | "[GOOGLE_FORM_LINK_TO_BE_ADDED]" | placeholder | — |

Both forms return 401 (Google sign-in required). Form titles and questions: UNKNOWN. Four sources agree on `n8GQL…`; only Luma differs. Recommendation: submit `n8GQL…`; open the Luma "main" form while signed in to see whether it is a duplicate, or ask the organisers.

Luma also describes a separate "Bonus: Db2 Goodies Challenge": install the extension, make "a meaningful open-source contribution, such as raising a well-documented GitHub issue or contributing an improvement to the extension", submit evidence "through the dedicated form".

### 4.7 Unstop rounds (if registered on Unstop)
- Round 1 "Get Started with Db2Hack 2026 | Ideation & Architecture", window `2026-10-28T22:33+05:30` → `2026-11-10T19:00+05:30`, 299 players. Field: "Your Project Proposal (PDF/PPT)", file, `pptx,pdf`, max 50 (MB), mandatory. Content: title and problem, solution and features, "Selected Agentic AI framework (LangChain, CrewAI, Haystack, LangGraph, etc.)", Db2 connector, architecture and workflow, impact. "Evaluation: Innovation, feasibility, Db2 integration approach and architecture."
- Round 2 "Build & Final Submission", window `2026-10-28T22:37+05:30` → `2026-11-10T19:00+05:30`, 297 players. Fields (all `is_mandatory: 1`): "GitHub PR UR" (text), "Demo video link" (text), "Project screenshots" (file: doc, pdf, jpg, jpeg, png, pptx, zip; max 50).
- Unstop `registerCount: 5186`; status LIVE; `allow_multiple_submissions: 1`.

### 4.8 GitHub repo mechanics (from repo + event site)
- Fork, then: `git remote add upstream https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission.git`; `git fetch upstream main`; `git checkout -b submission/<project-slug> upstream/main`; `cp -r submissions/_template submissions/<project-slug>`.
- Required files: `README.md`, `architecture.md`, `submission.json`, `.env.example` (plus `src/`, `docs/screenshots/`, optional `tests/`).
- Validate: `python scripts/validate_submission.py submissions/<project-slug>`.
- Commit: `feat(<project-slug>): add hackathon submission`. PR base `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` · `main`. PR title `[Submission] <project-slug>: <Short Project Title>`. Complete every checklist item in the PR template.
- Event site: "A PR alone does not complete your submission."

---

## 5. Judging criteria

### 5.1 Devpost overview "Judging Criteria" (verbatim, complete)
> **Evaluation Criteria**
> Selected projects with strong potential may receive an opportunity to contribute their use cases to the IBM Db2 GitHub Organisation.

No weights appear on the overview.

### 5.2 Devpost /rules "Evaluation Criteria" (verbatim)
> Projects will be evaluated based on the following criteria:
> - IBM Db2 Integration & Depth (30%): Meaningful use of IBM Db2, including database connectivity, data operations, and relevant capabilities.
> - Innovation & Impact (25%): Originality, problem relevance, practical usefulness, and potential impact.
> - Technical Architecture & AI Integration (20%): Quality of system architecture and effective use of the selected AI framework.
> - Reproducibility & Code Quality (15%): Code organisation, implementation quality, and ease of setup and execution.
> - Documentation & Presentation (10%): Clarity of project documentation and demonstration.

Same five lines, same weights: Unstop details; repo `README.md`; repo `docs/judging-criteria.md` (which adds bullets: "Substantive, non-trivial use of IBM Db2 (storage, querying, indexing, stored procedures, vector/JSON capabilities, or specialized engines)", "Clarity and completeness of `architecture.md`", "Presence of automated tests, input validation, and clean error handling", "Adherence to submission rules, naming conventions, and security hygiene (zero secrets committed)").

### 5.3 Event website rubric (bundle array `tx`, verbatim names and weights)
| Criterion | Weight | Points |
|---|---|---|
| IBM Db2 integration & depth | 25 | Substantive use of Db2: storage, querying, indexing, stored procedures, vector / JSON · Correct drivers, connectors or framework integrations · Clean schema design, efficient queries, reliable data |
| Innovation & real-world impact | 20 | Original solution to a real problem · Practical for enterprise, developer tooling, analytics or AI automation · Clear value for the end user |
| Technical architecture & AI | 15 | Modular, clean engineering · Well-designed RAG / agents / embeddings / prompts, if used · Clear, complete architecture.md |
| Security | 15 | No secrets in code — credentials via .env, with .env in .gitignore · Parameterised SQL (no string-built queries), input validation, least-privilege Db2 users · Safe handling of user data, prompts and LLM output (no prompt-injection shortcuts) |
| Reproducibility & code quality | 15 | Easy setup by following README.md · Working .env.example with prerequisites · Tests, input validation and error handling |
| Documentation & presentation | 10 | Templates filled — no placeholders left · Screenshots, demo URL or video walkthrough · Naming rules followed, clean commit history |

SKILL.md repeats it: "**Judging (100 points):** Db2 integration & depth 25 · Innovation & impact 20 · Architecture & AI 15 · Security 15 · Reproducibility & code quality 15 · Documentation & presentation 10."

Event site FAQ: "IBM experts score every submission with the 100-point rubric on the Submit page. To keep it transparent, we share the judging sheet and feedback explaining why a submission was not selected for the Top 10."

### 5.4 Disqualifiers (event site array `nx`; repo `docs/judging-criteria.md` has the same four)
- "Zero Db2 integration — Db2 mentioned in text but never used in code."
- "Committed secrets — Real passwords, API keys or tokens pushed to GitHub."
- "Plagiarism — Copying uncredited third-party repos without real innovation."
- "Tampering — Changing repo root config, scripts or another participant's folder."

---

## 6. Judges

**Devpost overview "Judges" (verbatim):**
| Name | Title on Devpost |
|---|---|
| Daya Nand | Senior Developer @IBM |
| Dhruv Chaturvedi | Developer @ IBM |
| Kunal Gola | Developer @ IBM |
| Pawan Thakur | Developer @ IBM |
| Keshav Maheshwari | Developer @ IBM |
| Shaik Sadiq | Developer @ IBM |

**Other titles for the same people:**
- Event site speakers (all "IBM Lucknow"): Gaurav Saxena — "Program Director, IBM Db2" (not a Devpost judge); Daya Nand — "Senior Db2 Development Manager"; Dhruv Chaturvedi — "Db2 Software Engineer", tag "Event SPOC"; Keshav Maheshwari, Kunal Gola, Pawan Thakur, Shaik Sadiq — "Db2 Software Engineer".
- Devpost update: Dhruv Chaturvedi "(Software & AI Engineer, IBM | Event Lead & Speaker)"; Kunal Gola "(Software & AI Engineer, IBM | Speaker)".
- Repo README: "Event Lead & SPOC: Dhruv Chaturvedi, Db2 Software Engineer, IBM Lucknow · Kunal Gola, IBM". CODEOWNERS: `* @KunalGolaIBM`.
- Repo `docs/judging-criteria.md`: "evaluated by a panel of IBM engineers, subject matter experts, and academic mentors".
- LinkedIn URLs on event site: linkedin.com/in/2mrdaya, /dhruvinsights, /keshav-maheshwari-666738186, /kunal-gola-459030203, /pawanthakurindia, /shaik-sadiq-068a39242, /gaurav-saxena-95044594.

---

## 7. Prizes

**Devpost overview (verbatim):** "1 non-cash prize". One prize entry titled "Trophy", "3 winners", description:
> Top 3 Participants
> Trophy
> IBM Db2 Kit
> Certificate of Excellence
> Top 10 Participants
> IBM Db2 Goodies
> Certificate of Merit

Devpost API: `prize_amount: ₹ 0`. Devpost /prizes: 404.

Unstop: "Top 3 Winners — Trophy, IBM Db2 Kit and Certificate of Excellence."; "Top 10 Participants — IBM Db2 Goodies and Certificate of Merit."; "High-Potential Projects — Opportunity to contribute the project use case to the IBM Db2 GitHub Organisation." Event site and Luma say the same.

---

## 8. Schedule

**Devpost /details/dates (verbatim):**
| Period | Begins | Ends |
|---|---|---|
| Submissions | November 06 at 12:45am IST (`2026-11-05T14:15:00-05:00`) | November 10 at 7:00pm IST (`2026-11-10T08:30:00-05:00`) |
| Judging | (blank) | (blank) |
| Winners Announced | (blank) | November 11 at 9:00am IST (`2026-11-10T22:30:00-05:00` = 9:30 PM CST Nov 10) |

**Event site timeline:** Wed 28 Oct "Db2Hack begins — Submissions open at 7:00 PM IST"; Thu 29 Oct "Submissions are not strict and do not close tonight"; Fri 30 Oct Summit at GL Bajaj, Mathura (9:00 AM – 5:00 PM IST); Tue 10 Nov "Final submissions … before 5:00 PM IST"; Wed 11 Nov "Winners announced".
**Unstop timeline:** Hackathon Begins 28 Oct; On-campus Summit 30 Oct; Luma Registration Deadline 8 Nov; Final Project Submission 10 Nov 5:00 PM IST; Results 11 Nov.
**Devpost overview tags:** "Online", "Public", organization "IBM", theme "Databases".

---

## 9. Updates (Devpost /updates — all posts)

1. **"Final call for submissions"** — `/updates/47518-final-call-for-submissions` — shown "2 days ago" (≈ Nov 7; exact timestamp not in HTML). Full text: "There are only 3 days left to complete your submission for IBM Db2Hack 2026."
2. **"📢 IBM Db2 Live Webinar & Hands-on Project Development Workshop"** — `/updates/47544-…` — shown "3 days ago" (≈ Nov 6). Full text:
   > Hello everyone! We are excited to announce a hands-on project development session with the IBM Db2 Engineering Team. Learn to build a project from scratch and explore real-world implementation.
   > 🎤 Presenters 1. Dhruv Chaturvedi (Software & AI Engineer, IBM | Event Lead & Speaker) 2. Kunal Gola (Software & AI Engineer, IBM | Speaker)
   > 📅 Date: 7 November 2026 ⏰ Time: 3:00 PM – 5:00 PM IST 💻 Platform: Microsoft Teams
   > 🔗 Registration & Joining Link: https://events.teams.microsoft.com/event/87644e87-0a6f-4e12-a974-a0276cbdb435@fcf67057-50c9-4ad4-98f3-ffca64add9e9
   > What to expect? * Building a project from scratch * Practical Db2 demonstrations * Q&A with IBM engineers
   > Important: Please install Teams beforehand. All hackathon participants are strongly encouraged to attend! See you all at the session! Team IBM Db2 TechX

   The webinar is past. A recording: UNKNOWN (not linked anywhere read).

No update mentions a deadline change, teams, the rubric, the Google Form, LinkedIn or video rules.

## 10. Discussions (Devpost /forum_topics)
"No topics have been created yet." Nothing to read.

## 11. Project gallery
"The hackathon managers haven't published this gallery yet, but hang tight!"

## 12. Participants / counts
- Devpost (logged out, this fetch): "Participants (62)"; API `registrations_count: 62`. Brief reported 52 earlier.
- Unstop: `registerCount 5186`; Round 1 players 299; Round 2 players 297.
- Luma: `guest_count 442`.
- GitHub PRs (at fetch): 50 total — 43 open, 3 merged, 4 closed. Merged #1–#3 are IBM-staff examples (PawanThakurIBM, keshav-23). PRs opened per day: Oct 28: 3, Oct 29: 6, Oct 30: 4, Oct 31: 8, Nov 1: 2, Nov 3: 1, Nov 5: 2, Nov 6: 4, Nov 7: 5, Nov 8: 2, Nov 9: 13. Repo: 88 forks, 39 stars; created 2026-10-28; last push to main 2026-10-29. Open PRs are not being merged.

## 13. Contacts
- Devpost "Questions? Email the hackathon manager" — Cloudflare-obfuscated; decodes to `tushar.goswami2025@glbajajgroup.org`.
- Luma lists phone contacts for Yagnik Sharma and Vikas Kumar Sharma (numbers on https://luma.com/68jmineh). Luma hosts: Yagnik Sharma, Dhruv Chaturvedi, Vikas Kumar Sharma.
- Repo: "Submission Help Issue" via https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/issues/new/choose.

---

## 14. Resources tab — every link, followed one level

Devpost /resources body (verbatim, complete):
> Official Resources
> Event Website: https://ibmdb2techxsummit.glbajajgroup.ac.in/
> Unstop Registration: Available through the official event listing.
> Luma Registration: https://luma.com/68jmineh
> WhatsApp Community: https://chat.whatsapp.com/L5EwLpFMmqa179MsOgi9fu
> GitHub Submission Repository: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
> Final Submission Google Form: https://forms.gle/n8GQL4tg7Yzftwu39
> Learning Resources and Tutorials: Available on the official event website.

There are exactly **5 hyperlinks** plus 2 text-only items (Unstop, Learning Resources).

### 14.1 Event website — https://ibmdb2techxsummit.glbajajgroup.ac.in/
Title "Db2Hack is live · IBM Db2 TechX 2026". React SPA; content from `/assets/index-D2dDR6AR.js`. Contains the learning resources referenced by the Devpost tab. Never mentions Devpost.

**Setup (Get Db2 free):**
- VS Code extension `IBM.db2-for-luw`: `code --install-extension IBM.db2-for-luw`. "Needs VS Code 1.103+, Java 17+, Docker (Colima on macOS, Docker Desktop + WSL 2 on Windows) and 4 GB free RAM." Click "Create Db2 instance"; form: host localhost, port 50000, user e.g. `db2inst1`, password, database `testdb`. Creates `testdb` + `SAMPLE`.
- Docker alternative: `docker pull icr.io/db2_community/db2`, run on port 50000.
- Installer: https://www.ibm.com/db2/get-started (Db2 12.1 Community Edition). "Free · no credit card · Full Db2 features · Up to 4 cores · 16 GB RAM · Community support".
- Docs: https://ibm.github.io/db2developerextension-about/ (+ getting-started, creating-db2-instance, docker-colima-troubleshooting pages); https://github.com/ibmdb/vscode-extension/wiki; https://github.com/IBM/db2developerextension-about; https://www.ibm.com/docs/en/db2/12.1.x; VECTOR_DISTANCE: https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector-distance.

**Connector packages (event site) with current PyPI versions (checked 2026-11-09 via pypi.org JSON):**
| Framework | Install (event site) | Gives | PyPI latest | requires_python |
|---|---|---|---|---|
| LangChain | `pip install -U langchain-db2` | "DB2VS vector store" | 1.0.0 (2025-10-30) | >=3.10,<4.0 |
| LlamaIndex | `pip install llama-index-vector-stores-db2` | Db2 vector store | 0.1.0 (2025-06-25) | >=3.9,**<3.13** |
| Haystack | `pip install ibm-db-haystack` | Db2 document store | 1.0.0 (2026-10-19) | >=3.11 |
| CrewAI | `pip install crewai-tools ibm_db` | "Db2 vector search tool for agents" | crewai-tools 1.15.39 (2026-11-09) | >=3.10,<3.14 |
| Langflow | `pip install lfx-ibm` | "IBM bundle with a Db2 vector store component" | 0.4.0 (2026-11-04) | >=3.10,<3.16 |
| Driver | `pip install ibm_db` | `ibm_db`, `ibm_db_dbi` | 3.3.0 (2026-08-11) | not declared |
| dbt | `pip install ibm-dbt-db2` | transformations | 1.0.0 | >=3.10,<3.13 |
| SQLGlot | `pip install db2-sqlglot-dialect` | Db2 dialect | 1.1.0 | >=3.10 |
Connector docs: docs.langchain.com/oss/python/integrations/vectorstores/db2; developers.llamaindex.ai/.../db2llamavs/; docs.crewai.com/edge/en/tools/database-data/db2searchtool; docs.langflow.org/bundles-ibm; pypi.org/project/ibm-db-haystack; docs.getdbt.com/.../ibm-db2-setup; github.com/IBM/db2-sqlglot-plugin; airflow.apache.org/docs/apache-airflow-providers-ibm-db2.

**Example project on the site:** "Ask my notes — RAG with LangChain + Db2". Install `pip install -U langchain-db2 langchain-community sentence-transformers`. API: `ibm_db_dbi.connect("DATABASE=testdb;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=…;", "", "")`, `from langchain_db2.db2vs import DB2VS`, `DB2VS.from_documents(notes, embeddings, client=conn, table_name="MY_NOTES", distance_strategy=DistanceStrategy.COSINE)`, `store.similarity_search("…", k=2)`; embeddings `sentence-transformers/all-mpnet-base-v2`.

**Tutorial videos (YouTube, via yt-dlp):**
| ID | Title | Channel | Uploaded | Length | Chapters / description |
|---|---|---|---|---|---|
| NRo4ePT2MEE | Build Enterprise AI Agents in Minutes with Langflow & IBM Db2 Vector Store | IBM Product Hub | 2026-07-30 | 12:23 | 0:00 Introduction · 0:33 Roadmap and problem statement · 1:05 Problem and solution overview · 1:33 Langflow and RAG concepts · 2:38 IBM DB2 bundle installation · 3:21 Ingestion and retrieval process · 4:57 HR policy agent demo · 9:43 Runbook assistant demo · 12:13 Conclusion. "…build enterprise AI agents in minutes using Langflow and the IBM Db2 Vector Store with low-code workflows…" |
| T3it5_2JwIw | Building AI Search & RAG with the New IBM Db2 Vector Store for Haystack | IBM Product Hub | 2026-07-30 | 9:11 | No chapters. "…build a banking AI assistant using the new IBM Db2 Vector Store for Haystack, showcasing enterprise RAG from document ingestion to intelligent, context-aware responses." |
| qZnhCnwGttg | Build Intelligent CrewAI Agents with IBM Db2 Vector Search | IBM Product Hub | 2026-08-17 | 9:52 | No chapters. "…CrewAI agents use IBM Db2 Vector Search to retrieve enterprise knowledge… using an Airline Delay Assistant as an example." |
| 9GDvvZPPitI | Python in One Shot 🔥 \| Full Python Course with Live Coding \| Theory + Development Covered | Dhruv Insights | 2025-12-31 | 7:04:24 | No chapters. Beginner Python course. |
| LK_Wz39TbnQ | Agentic AI Explained from Beginner to Advanced \| Complete Agentic AI Series Episode 01 | Dhruv Insights | 2025-12-22 | 16:55 | No chapters. Agentic AI basics. |
| tgiKX3nB-ok | How Agentic AI Really Works \| A Clear System-Level Breakdown | Dhruv Insights | 2025-12-23 | 29:47 | 16 chapters: 0:14 Overview · 0:46 Recap · 2:30 Big picture · 5:37 What a tech stack really means · 8:13 Layer 1 agent thinking · 9:50 Layer 2 workflow/orchestration · 12:43 Layer 3 tool · 13:40 Layer 4 code · 14:56 Layer 5 intelligence · 15:28 Where frameworks fit · 17:50 Single vs multi agent · 21:40 Rules, limits, safety · 23:30 What are MCPs · 25:10 How Python and this playlist connect · 26:40 What we will do next |
Channels: https://www.youtube.com/@IBMProductHub, https://www.youtube.com/@dhruv_insights.

**Blogs/announcements listed:** IBM announcements (Db2 LangChain connector; Db2 vector store for LlamaIndex; Db2 Developer Extension for VS Code; Db2 Community Edition); Langflow 1.10 blog; IBM Community blogs (Db2 Langflow component; "Langflow just added IBM Db2 — 16 questions I asked"; Db2 dbt integration; Airflow orchestration; "Vector indexes in Db2: an early preview" (2025-10-04); Db2 LUW Pulse 30 June 2026).

**IBM Bob:** trial https://bob.ibm.com/trial, download https://bob.ibm.com/download — "50 Bobcoins for 30 days".

**AI skill:** `/skill/ibm-db2-builder.zip` and `/skill/ibm-db2-builder/SKILL.md` (read). Key builder facts in SKILL.md: Python **3.11 or 3.12** ("Avoid 3.13+ for now; `ibm_db` wheels may be missing"); VS Code 1.103+; Java 17+; Docker run `docker run -itd --name mydb2 --privileged=true -p 50000:50000 -e LICENSE=accept -e DB2INST1_PASSWORD=<…> -e DBNAME=testdb -v ~/db2data:/database icr.io/db2_community/db2`; connectivity check `SELECT CURRENT SERVER, CURRENT TIMESTAMP FROM sysibm.sysdummy1`; LangChain pattern "tested on Db2 12.1.5, langchain-db2 1.0.0" with Ollama `nomic-embed-text:v1.5` and `granite4.2:3b`; pitfalls: `filter` values must be lists, and filter is applied after top-k (use larger k); always parameterised SQL (`ibm_db.prepare` + `ibm_db.execute`); error `SQL30081N` = container down or wrong port. SKILL.md contains instructions addressed to AI assistants; they were read as data only.

**Event site FAQ highlights (verbatim fragments):** "Db2Hack is solo only: no teams"; "Every project must use at least one of LangChain, Haystack, CrewAI, LlamaIndex or the no-code Langflow"; "Two steps, both mandatory: open a pull request … then paste the PR link into the submission form"; "Db2 Community Edition … You can also use the Docker image (icr.io/db2_community/db2)".
Also linked: WhatsApp channel https://whatsapp.com/channel/0029VbDix2896H4VUqPLde3C; Unstop short link https://unstop.com/o/5GAmOMJ.

### 14.2 Unstop registration (no hyperlink on Devpost)
Listing found via Luma: https://unstop.com/hackathons/db2hack-2026-build-ai-applications-on-ibm-db2-gl-bajaj-group-of-institutions-mathura-uttar-pradesh-1795047. See §3, §4.7. Gives: two rounds (proposal PDF/PPT; PR URL + demo video link + screenshots), solo only, open to professionals, same 30/25/20/15/10 rubric as Devpost /rules.

### 14.3 Luma — https://luma.com/68jmineh
"Db2Hack 2026 – Build AI Applications on IBM Db2", calendar "IBM Db2 Calendar", 442 guests, hosts Yagnik Sharma, Dhruv Chaturvedi, Vikas Kumar Sharma. Gives: package list (`langchain-db2`, `ibm-db-haystack`, `llama-index-vector-stores-db2`, `crewai-tools`, `lfx-ibm`, `ibm_db`), the six participation steps, "Participation is strictly individual", the four required files, the Goodies Challenge, and the conflicting form links (§4.6).

### 14.4 WhatsApp Community — https://chat.whatsapp.com/L5EwLpFMmqa179MsOgi9fu
Not opened (would require joining). Stated as mandatory by event site, Unstop and Luma; "all live updates and any timing changes are shared there first." Content: UNKNOWN. Any deadline change announced only there would not be visible to this research.

### 14.5 GitHub Submission Repository — https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
Description: "Official hackathon submission repository for IBM Db2 TechX Summit at GL Bajaj, Mathura…". No license. Key files:
- `README.md` — process, naming table, rubric 30/25/20/15/10; stale dates (deadline 29 Oct 7 PM IST); placeholders `[GOOGLE_FORM_LINK_TO_BE_ADDED]`, `https://chat.whatsapp.com/COMMUNITY_LINK_PLACEHOLDER`; site link `https://ibmdb2techx.com` (differs from the live site).
- `.github/PULL_REQUEST_TEMPLATE.md` — sections: 1 Project Overview; 2 Team Information; 3 IBM Db2 Integration Summary (edition, how used, connector, schema, "Steps to Verify Db2 Integration"); 4 Tech Stack & AI/LLM Usage; 5 Demonstration & Links (live demo, demo video, external repo, slides); 6 Checklist (10 boxes: folder, naming, docs without placeholders, valid submission.json, no secrets, tested setup from fresh env, license declared, Code of Conduct, scope isolation, Google Form); 7 Notes.
- `.github/workflows/validate-submission.yml` — on PR to main touching `submissions/**`; Python 3.11; runs `python scripts/validate_submission.py` (validates **all** submission folders).
- `scripts/validate_submission.py` — slug regex `^[a-z0-9]+(-[a-z0-9]+)*$`; required files ≥ 20 bytes; forbids `.env`, `.env.local`, `.env.development`, `.env.production`, `id_rsa`, `id_ed25519`, `*.pem/.pfx/.p12/.key`; `submission.json` must have `project.title` ≠ "Project Title Here", `project.slug` = folder name, `team.name` ≠ "Team Name Here", ≥ 1 `team.members`, `ibm_db2.edition`, `ibm_db2.connector`.
- `submissions/_template/` — `README.md` (Problem Statement, Solution Overview, IBM Db2 Integration, AI/LLM Architecture, Tech Stack, Prerequisites, Setup & Installation, Configuration, Running, Testing & Verification, Screenshots & Demo, Known Limitations, Team Members & Credits), `architecture.md` (Overview, Architecture Diagram, Component Breakdown, Data Flow, IBM Db2 Schema & Storage Design, Security & Secrets Management), `submission.json` (project{title, slug, short_description, category, demo_url, video_url, repo_url}, team{name, members[{name, github, email, role}]}, ibm_db2{edition, connector, features_used[]}, tech_stack{languages, frameworks, ai_models}), `.env.example` (DB2_HOST=localhost, DB2_PORT=50000, DB2_DATABASE=testdb, DB2_USER=db2inst1, DB2_PASSWORD, DB2_SECURITY, WATSONX_*, OPENAI_API_KEY, APP_ENV, APP_PORT).
- `docs/judging-criteria.md`, `docs/submission-guide.md`, `docs/faq.md` (teams allowed; AI optional), `docs/db2-setup-guide.md`, `CONTRIBUTING.md`, `CODEOWNERS` (`* @KunalGolaIBM`).
- Reference submissions on main (IBM staff): `submissions/crewai` (CV-to-job matching, CrewAI + Haystack ingestion + Db2 vector search, tests), `submissions/db2-governed-rag` (clearance-aware vector search), `submissions/db2-multilingual-voice-rag` (Hindi/English audio RAG).

### 14.6 Final Submission Google Form — https://forms.gle/n8GQL4tg7Yzftwu39
Redirects to `docs.google.com/forms/d/e/1FAIpQLSeI29AdGMZlhPkS4xDU_0_kVVhpf2U5nTRfyuWQRPgj6TulWw/viewform`; 401 "Sign in to your Google Account — You must sign in to access this content". Questions: UNKNOWN. Repo submission-guide says: "Fill out the team details and paste your PR URL into the submission form."

### 14.7 Learning Resources and Tutorials
Text only: "Available on the official event website." Covered in §14.1.

---

## 15. Prior findings — verification

| Prior finding | Status | Evidence |
|---|---|---|
| Devpost rubric 30 Db2 / 25 Innovation / 20 Architecture&AI / 15 Reproducibility / 10 Docs | **Confirmed**, with a correction: it is on **/rules**, not on the overview. The overview "Judging Criteria" has only the "Evaluation Criteria … IBM Db2 GitHub Organisation" sentence. Also on Unstop and in the repo. | §5.1, §5.2 |
| Event website rubric 25/20/15/15 (Security)/15/10 | **Confirmed** (bundle `tx` and SKILL.md). | §5.3 |
| Rules text 5:00 PM IST Nov 10 vs header 7:00 PM IST | **Confirmed.** Header instant = 7:30 AM CST (matches the user's view). | §2 |
| Judges: Daya Nand, Dhruv Chaturvedi, Kunal Gola, Pawan Thakur, Keshav Maheshwari, Shaik Sadiq | **Confirmed**, same order. Titles: Daya Nand "Senior Developer @IBM", others "Developer @ IBM". Event site uses different titles and adds Gaurav Saxena as a speaker (not a judge). | §6 |
| Submission = fork + PR + Google Form + LinkedIn | **Confirmed** on Devpost /rules (LinkedIn only in /rules; overview names PR + Form as mandatory). **New:** Luma names a different "main" form; Unstop has its own 2 rounds with mandatory proposal PDF/PPT, PR URL, demo video link and screenshots; WhatsApp join "mandatory". | §4 |

---

## 16. Conflicts (all channels)

1. **Deadline:** Devpost platform 7:00 PM IST (7:30 AM CST) vs Devpost /rules, Unstop, Luma, event site 5:00 PM IST (5:30 AM CST). Unstop rounds also end 19:00 IST. Repo README: 29 Oct (stale).
2. **Submission opening:** Devpost Nov 06 12:45 AM IST vs all others 28 Oct (event site 7:00 PM IST; Luma 12:00 IST).
3. **Eligibility:** Devpost "Students only", companies excluded vs Unstop "Working professionals" eligible, event site "Everyone can participate", Luma "from anywhere in the world".
4. **Team size:** Devpost silent; Unstop (max 1), Luma, event site = solo; repo FAQ = teams allowed; repo templates have team fields.
5. **Rubric:** Devpost /rules, Unstop, repo = 5 criteria 30/25/20/15/10; event site + SKILL.md = 6 criteria 25/20/15/15 Security/15/10.
6. **Google Form:** see §4.6 — Luma's "main" form `ZjsLaFU5…` ≠ `n8GQL…`; Luma calls `n8GQL…`'s target the Goodies form.
7. **Demo video:** Devpost "must include"; Unstop text "optional" but field mandatory; SKILL.md "optionally".
8. **Registration deadline:** event site "Unstop open until Sun 8 Nov"; Unstop text "Luma … by 8 November"; Unstop API registration end 10 Nov 17:00 IST.
9. **Framework requirement:** event site/Unstop/Luma mandatory (one of five); repo FAQ "AI integration is optional"; Unstop Round 1 also lists LangGraph.
10. **Results time:** Devpost Nov 11 9:00 AM IST; others "11 November" (no time). Luma event ends Nov 11 5:00 PM IST.
11. **Judge titles** differ across Devpost, event site and the Devpost update (§6).
12. **Participant count:** user saw 52; logged-out fetch shows 62.

## 17. UNKNOWN items
- Devpost submission form fields, video length limit, "Built with"/try-it requirements — login wall.
- Google Form questions and titles (both forms) — Google sign-in required.
- WhatsApp community announcements (possible deadline changes) — not joined.
- LinkedIn tag handles or hashtags — not stated.
- Exact timestamps of the two Devpost updates — only relative ("2 days ago", "3 days ago").
- Whether a Devpost project entry is judged at all — not stated.
- Unit of Unstop `grace_period: 15` — not stated.
- Webinar recording — not linked.
