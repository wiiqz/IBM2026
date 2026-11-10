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
