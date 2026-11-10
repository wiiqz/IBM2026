# IBM26 / NEEDLE — agent memory index

Start here after a reset. Read in this order:
1. `CURRENT_STATE.md` — what is done, in progress, blocked, next (as of 2026-11-10 03:00 CST: everything submitted).
2. `SESSION_HANDOFF.md` — nine-point handoffs, newest first (William's UI session, then Kartikeya's build session).
3. `DECISIONS.md` — decisions with reasons (detailed log: `needle/docs/PLAN.md` section 11).
4. `LESSONS.md` — verified, reusable lessons from this build.

Other key files (do not duplicate their content here):
- `README.md` (repo root) — index for humans.
- `HANDOFF_WILLIAM.md` — full handoff to William (UI + final submission), section 10 = paste-ready UI prompt.
- `needle/web/` — the React UI (`DESIGN.md` = its design spec); `needle/src/needle/api.py` — its local API.
- `tools/ui-capture/` — screenshot / share-image / audit scripts (not in the PR).
- `needle/README.md` — project README; `needle/docs/evidence/` — every measured result; `needle/CONTRACT.md`, `needle/docs/PLAN.md` — INTERNAL (never in the public PR).
- `submission_copy/` — PR body, Devpost, LinkedIn, forms drafts.
- `make_submission.sh` / `.ps1` — the only allowed way to build the public PR folder.

External locations:
- GitHub `wiiqz/IBM2026` (PUBLIC): `main` = `needle` = latest. Release `needle-data-2026-11-09` (full-corpus data, published).
- Google Doc "Hackathon Maxxing" → tab IBM26 → "copy and paste 2": the William handoff + UI prompt.
- Codespace `db2hack-needle-jj7gxr4xqg4vhw95` (Kartikeya's account): Db2 12.1.5, container `db2`, DB `VECDB`. Delete after submission.
- Codespace `needle-db2-jrq7grpgjr7qcp9qr` (William's account): Db2 12.1.5 full corpus, container `needle-db2`, DB `VECDB`. Delete after submission.
- William's local working copy: `~/IBM26` on macOS (secrets only in `needle/.env`, gitignored).
- Local working copy: `C:\Users\ganes\IBM26` (secrets only in `needle/.env`, gitignored).
