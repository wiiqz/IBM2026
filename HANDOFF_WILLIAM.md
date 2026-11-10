# NEEDLE — handoff to William (UI + final submission)

Written 2026-11-09 ~21:30 CST by Kartikeya's Claude Code session. Read top to bottom once; paste section 9 into your Claude Code.

**Status:** the backend, the Db2 research result, tests, docs and submission drafts are DONE and VERIFIED. **Nothing is submitted yet.** Your job: the UI (and anything else you and Kartikeya agree), then the final submission together.

**Deadline:** organizer rules say **Tue 10 Nov, 5:00 PM IST = 05:30 CST** (Devpost shows 07:30 CST; treat 05:30 CST as real). Aim to have the PR open by ~03:30 CST.

**Team:** name **Needlepoint**. Kartikeya (GitHub `KnigguKniggu-droid`) and William (GitHub `wiiqz`). Already in `needle/submission.json` and the README.

---

## 0. DO THIS FIRST: your own database (≈5–10 minutes)

The Db2 that ran tonight lives in Kartikeya's Codespace; **only his GitHub login can reach it**. You need your own copy. Your Codespace uses **your** free hours (4-core = 4 core-hours per hour; free plan = 120/month).

```bash
# on your Mac (once): allow codespaces for gh
gh auth refresh -h github.com -s codespace
gh codespace create -R wiiqz/IBM2026 -b needle -m standardLinux32gb --idle-timeout 240m --display-name needle-db2
gh codespace ssh -c <name printed above>
# inside the codespace:
cd /workspaces/IBM2026/needle
bash scripts/bootstrap_codespace.sh            # sample mode: 2,000 advisories, no Ollama, ~5 min
bash scripts/bootstrap_codespace.sh --full     # full corpus (26,210) from release needle-data-2026-11-09, ~10 min
```
The bootstrap creates `.env` with random passwords, starts Db2 12.1.5, creates the database, users, tables, procedures and RCAC, loads data, activates the DB, runs a smoke check, and prints the two commands you run next **on your Mac**: copy `.env` down (`gh codespace cp ...`) and open the SSH tunnel (`gh codespace ssh -c <name> -- -N -L 50000:127.0.0.1:50000`). Do not use `gh codespace ports forward` (it went stale tonight). Then follow section 5 steps 5–6 to run the app on your Mac. Test log of the bootstrap: `needle/docs/evidence/bootstrap_test.md`.

---

## 1. Where everything is

- Repo: `https://github.com/wiiqz/IBM2026` (private), **branch `needle`**. `main` only has the old README.
- `needle/` = the exact folder that becomes `submissions/needle/` in the official PR.
- `needle/docs/PLAN.md` = full PRD-level plan + decision log. **INTERNAL — never copy into the PR** (has judge analysis).
- `needle/CONTRACT.md` = rules the build agents followed (schema, layout, safety). **INTERNAL.**
- `needle/docs/evidence/` = every measured result (raw outputs). `needle/eval/results/` = eval JSON + charts.
- `research/` = all research: Devpost/rules/competition/organizers/env reports, red team, ChatGPT and Claude.ai consults.
- `submission_copy/` = ready-to-paste texts: `PR_BODY.md`, `DEVPOST.md`, `LINKEDIN.md`, `FORMS.md`, `SCREENSHOTS.md`.
- `video/` = automated demo-video pipeline (`make_video.py`, `scenes.py`, `DEMO_SCRIPT.md`). Draft render exists only on Kartikeya's PC (`video/out/`, not in git).
- `make_submission.sh` (Mac/Linux) / `make_submission.ps1` (Windows) = the ONLY allowed way to build the PR folder. They exclude internal files and abort on any secret or judge-name text.
- Full-corpus data (too big for git) = GitHub Release **`needle-data-2026-11-09`** on the same repo (see section 5).

## 2. What NEEDLE is (plain words)

You paste a security report, even a vague chat message with no CVE ("the yaml loader everyone uses can run code from a config file, are we exposed?"). NEEDLE searches 26,210 real Python security advisories (OSV PyPI) inside IBM Db2 two ways at once — keyword (BM25, written in plain SQL) and meaning (Db2 12.1.5's new DiskANN vector index, `FETCH APPROX`) — and fuses them in ONE SQL PL procedure (`NEEDLE.TRIAGE`, reciprocal rank fusion). Db2 row and column access control (RCAC) decides what each analyst may see (embargoed advisories are hidden from juniors by Db2 itself). A temporal SBOM join says which services are affected and since when. A local LLM (Ollama, via LangChain) writes a short memo; a verifier deletes any sentence whose IDs, services or status claims are not in the SQL results.

**The headline finding (what the judges must understand):**
- Db2's fast vector search first grabs a small batch of likely matches. Under RCAC, all users share one plan, and that plan sizes the batch **as if every user can see about half the rows** (one fixed optimizer estimate: filter factor 0.495 → 21 candidates for k = 10). Then the permission drops the rows this user can't see.
- So an analyst who may see 10% of the rows asks for 10 results and gets **about 2** (recall 0.205). When the 10% is whole topic clusters (realistic), **130 of 170 queries return nothing**.
- Control experiment: same RCAC, same 10% set, permission written with a literal → recall 0.205 → 0.765. So the predicate's visibility to the optimizer causes it — "a selectivity-estimation and filtered top-K interaction, not an RCAC defect; RCAC makes it unavoidable and invisible to the application".
- NEEDLE's **router** counts what the user can see and picks a bigger batch or an exact scan: held-out recall **1.000 / 1.000 / 1.000 / 0.988 / 0.987** (10/25/50/75/100% visibility), 10 of 10 rows every time, **0 leaks**.
- Retrieval quality (canonical run `20261110T024304Z`, NDL_SENIOR, RCAC on): realistic paraphrase queries, hybrid recall@10 **0.453** vs vector 0.360 vs BM25 0.340. TRIAGE p50 53.5 ms.
- We also found and fixed a 9x RCAC slowdown in the keyword leg (Db2 scanned all 1.94M posting entries under the permission; a `LATERAL` per-term rewrite fixed it: 244.8 → 27.2 ms).

Every number has a file: README "What we found" + `docs/evidence/rcac_real.md`, `eval_final.md`, `rcac_posting_overhead.md`.

## 3. What is done and verified

- Db2 12.1.5.0 CE, database VECDB (32K pages), 26,210 advisories, 1.42M exact (package, version) rows, 1.94M BM25 postings, vector index `NEEDLE.ADV_DOC_VIX` (used: IXSCAN, ~3 ms vs ~72 ms exact).
- `NEEDLE.TRIAGE` / `TRIAGE_MODE` (HYBRID|KW|VEC) / `BM25_SEARCH`; BM25 parity with `rank_bm25` 30/30.
- RCAC on ADV_DOC, POSTING, ADV_ALIAS, ADV_AFFECTED; mask on SUMMARY; users NDL_SENIOR, NDL_JUNIOR, NDL_P10/P25/P50/P75 (passwords only in `.env`).
- Router (per-user depth) in `src/needle/rcac.py` + `src/needle/triage.py` (`depth=None` → router).
- App: Streamlit `src/needle/app.py` (sign-in with real Db2 identity; demo switcher only with `NEEDLE_DEMO_SWITCHER=1`; bound to 127.0.0.1), LangChain retriever `retriever.py`, Haystack component `haystack_component.py`, LLM memo `llm_summary.py`, verifier `verify.py`, SBOM temporal exposure `sbom.py` (AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE — never "safe").
- **175 tests pass** (`docs/evidence/pytest.txt`). Clean-host reproduction from the README passes in 197 s (`docs/evidence/clean_host_run.md`). Official validator passes on the guarded copy.
- Two independent code reviews (Claude + Codex) — all CRITICAL/HIGH findings fixed and re-tested (embargo side channel via BM25 stats, verifier bypasses, sign-in).
- Docs: README (judge-first), architecture.md, submission.json, REFERENCES.md (75 verified sources), CONNECTOR_NOTES.md (neutral notes for connector maintainers — keep it out of the pitch), Round 1 proposal PDF (`docs/NEEDLE_Proposal.pdf`).
- Video: pipeline ready, draft 167.6 s (scenes: hook → app ranking + exposure → RCAC senior vs junior → the finding chart → router live as NDL_P10 → verifier → close).

## 4. Your job: the UI

Current UI = one Streamlit page (`src/needle/app.py`). It works and is tested, but it's dense. Make it look and feel like a winning product **without breaking the backend contract or the security behaviour**.

**Backend contract (do not change these semantics):**
- `app.do_run(user, query, k, depth=None, password=None) -> dict` is the one call. Keys: `user, query, k, depth, ts`; `fatal = (kind, message)` on failure (`kind` in login|db|ollama|sql); `run` (a `TriageRun`: `run.ranked(mode)` for mode in HYBRID|KW|VEC → list of dicts with `ADV_ID`, ranks, scores; `run.timings_ms`; depth choice for `depth_line(run)`); `exposure` (rows: service, package, version, status AFFECTED/NOT_CONFIRMED/UNKNOWN_COVERAGE, exposed since, days); `exposure_error`; `visible_docs`; `exposure_ids`.
- Memo: `llm_summary.py` (LangChain ChatOllama) → `verify.py` `verify_memo(...)` returns kept text + removed sentences with reasons. Show removed sentences; label any raw model text "unverified".
- If you build a new front end (e.g. React/Vite or Next.js), add a thin local API (FastAPI) that calls the same functions — never move SQL into the front end, never build SQL from user text.

**Must keep (security + honesty):**
1. Default: user signs in with their own Db2 user ID + password (RCAC binds to that identity). One-click switcher ONLY when `NEEDLE_DEMO_SWITCHER=1`, visibly labelled "demo identity switcher — not authentication". Never store passwords beyond the session; never write them to files/logs.
2. Bind to `127.0.0.1` only (`.streamlit/config.toml` `[server] address`); same for any API server.
3. Wording: AFFECTED only by exact package+version match; otherwise NOT_CONFIRMED or UNKNOWN_COVERAGE. Never "safe". Fleet is SYNTHETIC — label it.
4. NDL_JUNIOR must never see an embargoed advisory anywhere (ranking, exposure, SQL panel, memo).
5. Keep the router line visible: "Search depth N chosen for your visibility (V of T advisories visible): approx via vector index | exact scan".
6. Tests stay green: `python -m pytest -q -m "not db"` (+ `-m db` with a database). Update `tests/test_app_ui.py` if you change the UI.

**Ideas that would score (pick by time):**
- A clear landing/hero: one-line pitch + the three-step story (search → who can see → who is affected).
- A "Finding" tab: the chart `eval/results/rcac_recall_vs_selectivity.png` (or a live re-plot from `rcac_recall_vs_selectivity.json`), plain-words explanation (batch sized for "half the rows"), and a live side-by-side: same query as NDL_SENIOR / NDL_JUNIOR / NDL_P10 (rows returned, router choice).
- Show the actual SQL (`CALL NEEDLE.TRIAGE_MODE(...)`, bound parameters) and an EXPLAIN snippet (IXSCAN on VECIDX) — Db2 engineers love seeing the plan.
- Fix: vector "Cos dist" column is clipped in the ranking table.
- Clean typography/colors (IBM Carbon-like: IBM Plex Sans, gray layers, one blue accent), good empty/error states ("Db2 unavailable", "Ollama unavailable", "Sign-in failed").
- After UI changes: fresh screenshots (`submission_copy/SCREENSHOTS.md` lists 6–8 shots) into `needle/docs/screenshots/`, and re-render the video (section 7).

## 5. Your environment (Mac)

Db2's vector index is **Linux x86-64 only**; on Apple Silicon the Db2 container runs under emulation (slow, untested for the index). Recommended setup = **Db2 in your own GitHub Codespace + app and Ollama on your Mac**, connected by an SSH tunnel (this is exactly how Kartikeya ran it).

1. Codespace (4-core) on `wiiqz/IBM2026`, branch `needle`:
   `gh codespace create -R wiiqz/IBM2026 -b needle -m standardLinux32gb --idle-timeout 240m`
   (needs `gh auth refresh -h github.com -s codespace` once). Watch free hours: 4 core-hours per hour.
2. In the codespace (`gh codespace ssh -c <name>`), from `needle/`: copy `.env.example` → `.env`, set `DB2_PASSWORD` and the `NDL_*_PASSWORD` values (any strong local passwords; never commit), then follow README "Setup & Installation" steps 2–4 (`docker compose up -d`, `bash scripts/setup_db.sh --with-users`, venv + `pip install -r requirements.txt`).
3. Data:
   - Fast UI work: **sample mode** (2,000 advisories, no Ollama needed for loading): README block with `--sample` (load_in_codespace.py, load_postings_in_codespace.py, `python -m needle.sbom --load`, `setup_db.sh --phase post`). Note: at 2,000 rows Db2 does not choose the vector index (by design of its cost model); the router will show "exact scan".
   - Full corpus (for screenshots/video): download the release assets into the codespace and load them (≈5 min):
     ```
     mkdir -p data/load && cd data/load
     gh release download needle-data-2026-11-09 -R wiiqz/IBM2026
     cp ../../sql/01_schema.sql ../../sql/02_bm25.sql . && cd ../..
     set -a; . ./.env; set +a
     python scripts/load_in_codespace.py --dir data/load
     python scripts/load_postings_in_codespace.py --dir data/load
     python -m needle.sbom --load
     bash scripts/setup_db.sh --phase post
     ```
4. Run `docker exec <db2-container> su - db2inst1 -c "db2 activate database VECDB"` once (keeps the DB active; avoids slow re-activation).
5. On your Mac: tunnel Db2 → `gh codespace ssh -c <name> -- -N -L 50000:127.0.0.1:50000` (keep it running; do NOT use `gh codespace ports forward` — it went stale tonight). Ollama: `ollama pull nomic-embed-text` (+ `qwen3:4b-instruct-2507-q4_K_M` or `qwen3:14b` for the memo; set `LLM_MODEL` in `.env`). Python venv on the Mac in `needle/` (`pip install -r requirements.txt`; ibm_db has native macOS arm64 wheels). Your Mac `.env`: `DB2_HOST=localhost`, `DB2_PORT=50000`, same passwords as the codespace.
6. Run the app from `needle/`: `python -m streamlit run src/needle/app.py` (demo switcher: `NEEDLE_DEMO_SWITCHER=1 python -m streamlit run src/needle/app.py`).

## 6. Hard-won lessons (avoid repeating tonight's incidents)

- `FETCH APPROX FIRST ? ROWS` with a parameter marker never uses the vector index — k must be a literal (validated int). The vector itself can be a bound parameter.
- The vector index is only chosen above ~20k rows; vector column must be NOT NULL; index needs ≥16K pages for 768 dims (we use 32K).
- Bulk inserts through a tunnel are very slow — run loaders inside the codespace.
- Commit after every bulk statement. One uncommitted 26k-row copy filled the transaction log (we raised LOGSECOND to 200). Never hold a transaction open while doing Python/Ollama work.
- The codespace root disk had ~7.8 GB free; an un-committed langchain-db2 search loop filled TEMPSPACE once. Keep `df -h /` above 5 GB.
- Never run `db2stop`, `FORCE APPLICATIONS`, or deactivate while others use the DB.
- SQL0901N "Fetched nodes unexpectedly unsorted" appears for some query vectors at some APPROX depths (99/100, 50/64); `needle.triage` retries at another depth and logs it.
- Db2 Text Search can't start in the CE container (CIE0774E) → BM25 is plain SQL by design. JSON_TABLE in LUW only takes row path `'strict $'` (cannot expand arrays).
- Analysts cannot SELECT `TERM_DF`/`CORPUS_STATS` (closes an embargo side channel) — call `TRIAGE`/`BM25_SEARCH` instead.
- Windows only: run the validator as `python -X utf8 -I scripts/validate_submission.py`.

## 7. Final submission — NOT DONE (do it together, after the UI is final)

1. Code freeze → full tests (`python -m pytest -q`) → save to `needle/docs/evidence/pytest.txt`.
2. Fresh screenshots (full corpus) → `needle/docs/screenshots/` (list in `submission_copy/SCREENSHOTS.md`).
3. Fork `KunalGolaIBM/IBM_Db2_TechX_Project_Submission` (one of you), clone, `git checkout -b submission/needle`.
4. Build the folder ONLY with `./make_submission.sh <fork>/submissions/needle` (Mac) or `make_submission.ps1` (Windows). Run the official validator in the fork: `python scripts/validate_submission.py`. Confirm `git diff --stat` touches only `submissions/needle/`.
5. Commit `feat(needle): NEEDLE — permission-aware hybrid retrieval in Db2`, push, open PR titled **`[Submission] needle: NEEDLE — permission-aware hybrid retrieval in Db2`** with body from `submission_copy/PR_BODY.md` (fill [TEAM NAMES]/[VIDEO_URL]/[PR_URL]/[REPO_URL]; all 10 checklist boxes).
6. Video: re-render with the final UI (`video/make_video.py --repo-url <PR URL>`; ~4 min; needs Db2 + Ollama + the app's demo switcher — the pipeline currently runs on Kartikeya's Windows PC). Upload unlisted to YouTube (viewable signed out), ≤ 3 min.
7. Put the video URL into `needle/README.md` (Screenshots & Demo), `needle/submission.json` (`video_url`, `repo_url`), the PR body; push to the same PR (never open a second PR).
8. **Both** Google Forms: `forms.gle/n8GQL4tg7Yzftwu39` and `forms.gle/ZjsLaFU5zAYJonwk9` (answers in `submission_copy/FORMS.md`).
9. Unstop Round 2: PR URL + demo video + screenshots (check whether Round 1 still needs `docs/NEEDLE_Proposal.pdf`).
10. Devpost project (story in `submission_copy/DEVPOST.md`), LinkedIn post (`submission_copy/LINKEDIN.md`, tag the organizers listed there).

## 8. Who to ask / where decisions live

- Decisions + reasons: `needle/docs/PLAN.md` section 11 (Decision log). Evidence for every claim: `needle/docs/evidence/`.
- If a number changes, re-run the script that produced it and update README + `submission_copy/` from the new file. Never type numbers by hand.

## 9. Paste this into your Claude Code (from the repo root, branch `needle`)

```
You are continuing NEEDLE, our IBM Db2Hack 2026 entry. Read HANDOFF_WILLIAM.md fully, then needle/README.md,
needle/CONTRACT.md (rules), and skim needle/docs/PLAN.md section 11. The backend, research result, tests and docs
are done and verified (175 tests pass). Nothing is submitted. Deadline: 05:30 CST Nov 10; aim for PR by 03:30.

My task for you: make the UI (needle/src/needle/app.py, Streamlit; or a new front end over a thin local FastAPI
that calls app.do_run / llm_summary / verify) look and feel like a winning product for IBM Db2 engineers, following
HANDOFF section 4 exactly: keep the backend contract and every "Must keep" rule (real Db2 sign-in by default, demo
switcher only with NEEDLE_DEMO_SWITCHER=1, bind 127.0.0.1, AFFECTED/NOT_CONFIRMED/UNKNOWN_COVERAGE wording, never
"safe", juniors never see embargoed advisories, router depth line visible, synthetic fleet labelled). Add a Finding
view that explains the RCAC x vector-index result in plain words with the chart and a live senior/junior/P10
comparison. Show the SQL and an EXPLAIN snippet. Fix the clipped vector-distance column.

Set up the environment per HANDOFF section 5 (Db2 in my Codespace, app + Ollama on my Mac via SSH tunnel).
Start with sample mode for speed, then load the full corpus from release needle-data-2026-11-09 for screenshots.
Work in small verified steps; run `python -m pytest -q -m "not db"` after each UI change and the db tests when
connected. Do not commit secrets; do not edit CONTRACT.md or PLAN.md except the decision log; do not fork, open
PRs, upload, or submit anything — ask me first. When the UI is done: capture the screenshots listed in
submission_copy/SCREENSHOTS.md into needle/docs/screenshots/, run ./make_submission.sh to a temp folder and the
official validator on it, and report what changed with evidence.
```
