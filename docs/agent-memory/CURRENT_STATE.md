# CURRENT STATE — as of 2026-11-10 00:35 CST (updated by William's Claude Code session)

Deadline: organizer rules **10 Nov 5:00 PM IST = 05:30 CST** (Devpost shows 07:30 CST; use 05:30). PR target ~03:30 CST.
Team **Needlepoint**: Kartikeya (`KnigguKniggu-droid`), William (`wiiqz`).

## Completed (verified)
- **Backend + research result** (Kartikeya's session, unchanged): Db2 12.1.5 schema, 26,210 OSV advisories, vector
  index (IXSCAN ~3 ms vs ~72 ms exact), BM25 in SQL (parity 30/30), `NEEDLE.TRIAGE` fusion, RCAC on 4 tables, router,
  SBOM temporal exposure, LangChain retriever, Haystack component, memo + verifier, Streamlit page. Headline numbers in
  `needle/docs/evidence/rcac_real.md`; canonical eval run `20261110T024304Z`. Release `needle-data-2026-11-09` published.
- **Web UI DONE** (William's session): React 19 + Vite + TypeScript + Tailwind in `needle/web/`, over a loopback-only
  FastAPI `needle/src/needle/api.py` that calls the same `service.do_run` as the Streamlit page (still works).
  Views: Overview (WebGL hero of the real corpus + 4-chapter scroll story), Triage console (verdict slab, rank-flow
  chart, three ranked columns, SQL + captured access plans, exposure timeline + table, verified memo, onboarding),
  The finding (charts re-plotted from `eval/results/*.json`, plan-cache proof, router table, live 3-identity compare),
  How it works (architecture, Db2 features, evidence-linked Measured table). Design spec: `needle/web/DESIGN.md`.
- **Verified on William's own full-corpus Db2** (Codespace `needle-db2-jrq7grpgjr7qcp9qr`, bootstrap `--full` in 684 s):
  - full suite **192 passed, 3 skipped** (`needle/docs/evidence/pytest.txt`);
  - live acceptance ALL PASS (`needle/docs/evidence/web_ui_acceptance.txt`): senior sees GHSA-5x8w-8jj5-q52h at
    hybrid rank 1, junior never (rankings, docs, exposure, SQL params, memo); legacy-reporting AFFECTED; NDL_P10 exact
    scan 10/10; wrong password 401;
  - the landing page's "Ask for 10. Get 2." checked against Db2 itself (`needle/docs/evidence/hero_shared_plan_check.txt`);
  - accuracy pass over every on-screen claim vs evidence (fixed: literal control 0.762 vs plain WHERE 0.683, exposure
    is a second statement, softened overclaims); 53 links OK, no "safe", no console errors, no horizontal scroll
    at 390/768/1024/1280/1920 px;
  - official validator passes on a `make_submission.sh` copy (which now also skips `web/node_modules`, `web/dist`,
    `*.tsbuildinfo`).
- **Screenshots** `needle/docs/screenshots/00`–`08` (full corpus) + `thumbnail_3x2.jpg` (Devpost) + `web/public/og.jpg`.
- **Video pipeline** updated: `video/make_video.py --ui web` (now the default) drives the React UI; all 26 scene
  actions pass against the live UI. `--ui streamlit` keeps the old page.
- Pushed: `needle` and `main` (main fast-forwarded to needle).

## In progress
- Nothing running in William's session except: two local API servers + the SSH tunnel on William's Mac (stop after
  submission).

## Blockers / risks
- **Video** must be re-rendered against the new UI (Kartikeya's Windows pipeline): needs `needle/web/dist` built,
  Db2 tunnel, Ollama. Memo model differs per machine (William: `qwen3:4b-instruct-2507-q4_K_M`; `.env` `LLM_MODEL`).
- Memo verifier checks IDs / services / statuses, **not day counts**: one qwen3:4b draft said "over 900 days" when the
  real exposure was 2,448 days. Backend owner's call whether to add a numeric check; the UI labels raw output unverified.
- Unstop Round 1 status and Codespaces free hours (two Codespaces now running: Kartikeya's and William's) UNKNOWN.

## Next actions (in order, owner)
1. Kartikeya: `git pull` on `needle`; `cd needle/web && npm ci && npm run build`; from `needle/`:
   `NEEDLE_DEMO_SWITCHER=1 PYTHONPATH=src python -m needle.api` → http://127.0.0.1:8600; record with
   `video/make_video.py --ui web --repo-url <PR URL>`; upload unlisted (≤ 3 min), viewable signed out.
2. Together (user approval required): fork `KunalGolaIBM/IBM_Db2_TechX_Project_Submission`, branch
   `submission/needle`, `./make_submission.sh <fork>/submissions/needle`, validator, commit
   `feat(needle): NEEDLE — permission-aware hybrid retrieval in Db2`, PR titled
   `[Submission] needle: NEEDLE — permission-aware hybrid retrieval in Db2` (body `submission_copy/PR_BODY.md`).
3. Fill `video_url` / `repo_url` in `needle/README.md`, `needle/submission.json`, PR body; push to the same PR.
4. Both Google Forms, Unstop Round 2, Devpost (thumbnail `needle/docs/screenshots/thumbnail_3x2.jpg`), LinkedIn.
5. After submission: delete both Codespaces.
