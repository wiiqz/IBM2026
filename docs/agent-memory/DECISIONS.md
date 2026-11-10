# DECISIONS (summary; full log with times and sources: `needle/docs/PLAN.md` section 11)

- Idea: **NEEDLE** (permission-aware hybrid retrieval in Db2 for vuln triage) over TraceForge/Timeron/QueryShield/MemoryWeave — open niche; William's debate, Claude.ai and ChatGPT all converged on it.
- Headline = measured RCAC × DiskANN behaviour + router (not APPROX-vs-EXACT, already published by competitor #49 AsOf; not hybrid RRF, prior art in IBM db2-ai-cookbook).
- Real OSV PyPI corpus (26,210 incl. MAL) — needed for the optimizer to choose the vector index (>~20k rows).
- Db2 in a GitHub Codespace (no Docker/WSL on Windows PC); reached by SSH tunnel; bulk loads inside the codespace.
- LangChain primary, Haystack component optional; Streamlit UI (William may replace with React+FastAPI per handoff).
- Connector findings published neutrally as `needle/docs/CONNECTOR_NOTES.md`, no names, not in the pitch; no upstream issues/PRs without user approval.
- Internal files (CONTRACT.md, PLAN.md, reviews) excluded from the public PR via `make_submission.*` guards.
- Team name **Needlepoint**; members Kartikeya + William; emails omitted from the public repo.
- Nothing submitted until the user says so; user decided teams are allowed (do not re-raise solo rule).

## William's session (2026-11-09 21:40 – 2026-11-10 00:35 CST)
- UI = React/Vite/TS/Tailwind over FastAPI (user override of the handoff's Streamlit fallback); designed with
  William's studio-web skill; **no IBM Carbon** look (user override). Fonts: Red Hat Text/Mono/Display (IBM family,
  not Plex). Palette solved with the skill's palette.mjs (petrol hue 205; no green so nothing reads as "safe").
- Security model kept: own Db2 sign-in by default; demo switcher only with NEEDLE_DEMO_SWITCHER=1 and labelled; API
  binds 127.0.0.1 and refuses other hosts; Host-header check; password only in process memory; 422 errors never echo
  the body; memo evidence comes only from the server's own SQL result.
- Landing hero shows the **real corpus** (26,183 public advisories; the 27 embargoed rows are excluded from the public
  page); the "2 of 10" readout is computed from data and confirmed against Db2.
- Memo model on William's Mac: qwen3:4b-instruct (14b not pulled); num_predict raised to 800 because 450 truncated.
- Stats added only where an evidence file backs them (How it works → Measured), nothing padded on the landing page.
- `main` is kept equal to `needle` (fast-forward), as Kartikeya did.
- 2026-11-10 ~00:45 CST, user decision: `research/competition.md` (grades other teams' PRs) and `research/organizers.md`
  (profiles organizers and judges) are **deleted from the repo** so a judge browsing it cannot find them; do not
  restore or recreate them. They remain in git history only. Consults, CONTRACT.md, PLAN.md and reviews may stay.
  Same decision for `research/RESEARCH_BRIEF.md`, `research/debate/` and `research/william_session1/` (judge
  profiles / simulated judge panel): removed from the repo, kept local on William's Mac, listed in `.gitignore`.
