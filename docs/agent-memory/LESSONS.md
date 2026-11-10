# LESSONS (verified tonight; reusable)

Db2 12.1.5 vector search
- `FETCH APPROX FIRST ? ROWS` (parameter marker) never uses the vector index; use a validated literal k. The query vector may be bound.
- The optimizer chooses the DiskANN index only above ~20k rows; the column must be NOT NULL; 768-dim FLOAT32 needs ≥16K pages.
- Under RCAC (or any non-literal predicate) the plan is shared across users and sized by one filter factor (0.495) → low-visibility users get under-filled APPROX results; SEARCH_LIST_SIZE does not fix row count, only FETCH depth does.
- SQL0901N "Fetched nodes unexpectedly unsorted" can occur for specific vectors at specific APPROX depths; retry at another depth.
- JSON_TABLE on LUW accepts only row path `'strict $'` (no array expansion). Db2 Text Search does not start in the CE container (CIE0774E).
- A row permission on a large postings table can flip join order to a full index scan; a per-term `LATERAL` lookup restores probes (9x).
- RCAC does not cascade into declared temp tables; global stats tables can leak embargoed vocabulary — revoke and compute over public rows.

Operations
- Commit every bulk statement; an uncommitted 26k-row copy filled the transaction log; raise LOGSECOND online if needed.
- `gh codespace ports forward` can go stale silently; `gh codespace ssh -c <name> -- -N -L 50000:127.0.0.1:50000` is reliable.
- Explicitly `ACTIVATE DATABASE` so Db2 does not deactivate/reactivate between agent connections.
- Windows: run the organizer validator with `python -X utf8 -I`; in Git Bash use `/c/Users/...` paths, not backslashes.
- New git clone on this PC has no author: set repo-local `user.name` + GitHub noreply email before committing.
- Codex CLI read-only sandbox on Windows cannot read files; use `workspace-write` with a strict no-edit prompt and a before/after hash check.
- PowerShell 5.1 `Set-Clipboard -AsHtml` mangles non-ASCII (dashes/arrows) when pasting into Google Docs; prefer ASCII or another clipboard path.

William's session (macOS arm64 app host, Db2 in a Codespace)
- `bootstrap_codespace.sh --full` on a fresh 4-core Codespace: 684 s end to end (image pull included); smoke counts
  26,210 / 26,183 / 2,616 match the evidence.
- ibm_db 3.3.0 + Python 3.14 venv works on Apple Silicon against Db2 through `gh codespace ssh -- -N -L 50000:...`.
- `gh auth refresh -s codespace` needs a browser device code; codes expire after ~15 min.
- FastAPI validation errors echo the request body by default: override the RequestValidationError handler so a
  password can never come back in a 422.
- Lenis (smooth scroll) + a pinned section: invisible scroll spacers above a sticky stage swallow clicks unless they
  are `pointer-events: none`; `overflow: hidden` on the sticky's ancestor breaks `position: sticky`.
- A grid item holding an `overflow-x: auto` table needs `min-width: 0`, or the page scrolls sideways on phones.
- Do not let a test read an evidence file that the same pytest run is redirecting into (race → false failure).
- Never commit build caches (`tsconfig.tsbuildinfo`): one committed-then-deleted cache blocked a later rebase.

Kartikeya's session 2026-11-10 (submission prep)
- Never kill a process by port without checking who owns it: an agent killed the demo server on port 8600.
- Google Forms file upload uses a cross-origin Drive picker. The Chrome `file_upload` tool cannot reach it. The user
  must click Browse.
- Navigating away from a half-filled Google Form keeps the values when you go back (draft autosave). Use a new tab anyway.
- The official submission repo's root `.gitignore` has `*.log`. Add a negation in the project's own `.gitignore` for
  every cited evidence log.
