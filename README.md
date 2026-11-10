# IBM2026 — NEEDLE (IBM Db2Hack 2026, team Needlepoint)

**NEEDLE: permission-aware hybrid retrieval in IBM Db2.** Paste a vague security report; Db2 12.1.5 fuses BM25 keyword
search and its DiskANN vector index in one SQL procedure under row and column access control, and a temporal SBOM join
shows which services are affected and since when.

| Start here | What it is |
|---|---|
| [`HANDOFF_WILLIAM.md`](HANDOFF_WILLIAM.md) | Full handoff: status, environment setup (section 0), UI task, final-submission steps, ready-to-paste Claude Code prompt (section 10) |
| [`needle/README.md`](needle/README.md) | The project README (what we found, demo, setup, Db2 verification steps, results, security) |
| [`needle/`](needle/) | The submission folder: code, SQL, tests, evidence, docs |
| [`needle/web/`](needle/web/) | The web UI (React + Vite) over the local API `needle/src/needle/api.py`; design spec in `needle/web/DESIGN.md` |
| [`docs/agent-memory/`](docs/agent-memory/) | Shared state for both Claude Code sessions: current state, handoffs, decisions, lessons (start with `INDEX.md`) |
| [`tools/ui-capture/`](tools/ui-capture/) | Screenshot, share-image and audit scripts for the UI (not part of the PR) |
| [`submission_copy/`](submission_copy/) | Drafts for the PR body, Devpost, LinkedIn, forms |
| [`research/`](research/) | Event rules, competition, organizer and consult notes |
| [`video/`](video/) | Automated demo-video pipeline |
| [Release `needle-data-2026-11-09`](https://github.com/wiiqz/IBM2026/releases/tag/needle-data-2026-11-09) | Full-corpus data files (loaded by `needle/scripts/bootstrap_codespace.sh --full`) |

Run the web UI (Db2 reachable on localhost:50000, Ollama running, `needle/.env` filled):
```bash
cd needle/web && npm ci && npm run build && cd ..
PYTHONPATH=src python -m needle.api                        # http://127.0.0.1:8600, sign in with a Db2 user
NEEDLE_DEMO_SWITCHER=1 PYTHONPATH=src python -m needle.api  # recorded demos: one-click demo identities
```

Internal files (`needle/CONTRACT.md`, `needle/docs/PLAN.md`, review notes) never go into the public PR: build the PR
folder only with `make_submission.sh` / `make_submission.ps1`. Nothing is submitted yet.
