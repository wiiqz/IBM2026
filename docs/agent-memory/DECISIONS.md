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
