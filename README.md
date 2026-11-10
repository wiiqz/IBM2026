# IBM2026 — NEEDLE (IBM Db2Hack 2026, team Needlepoint)

**NEEDLE: permission-aware hybrid retrieval in IBM Db2.** Paste a vague security report; Db2 12.1.5 fuses BM25 keyword
search and its DiskANN vector index in one SQL procedure under row and column access control, and a temporal SBOM join
shows which services are affected and since when.

| Start here | What it is |
|---|---|
| [`HANDOFF_WILLIAM.md`](HANDOFF_WILLIAM.md) | Full handoff: status, environment setup (section 0), UI task, final-submission steps, ready-to-paste Claude Code prompt (section 10) |
| [`needle/README.md`](needle/README.md) | The project README (what we found, demo, setup, Db2 verification steps, results, security) |
| [`needle/`](needle/) | The submission folder: code, SQL, tests, evidence, docs |
| [`submission_copy/`](submission_copy/) | Drafts for the PR body, Devpost, LinkedIn, forms |
| [`research/`](research/) | Event rules, competition, organizer and consult notes |
| [`video/`](video/) | Automated demo-video pipeline |
| [Release `needle-data-2026-11-09`](https://github.com/wiiqz/IBM2026/releases/tag/needle-data-2026-11-09) | Full-corpus data files (loaded by `needle/scripts/bootstrap_codespace.sh --full`) |

Internal files (`needle/CONTRACT.md`, `needle/docs/PLAN.md`, review notes) never go into the public PR: build the PR
folder only with `make_submission.sh` / `make_submission.ps1`. Nothing is submitted yet.
