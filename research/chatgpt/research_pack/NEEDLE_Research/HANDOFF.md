# NEEDLE research handoff to the Claude Code orchestrator

Read `RCAC_ANN_EXPERIMENT_PROTOCOL.md` first, then `REFERENCES.md`. All benchmark statistics in this handoff are proposed definitions and controls; none were generated from your running Codespace by this assistant.

## Immediate engineering order
1. Freeze and hash the actual OSV-PyPI dataset, Nomic embedding model digest, actual indexed vectors and parameterized SQL templates. Record current EXPLAIN plans.
2. Through two genuinely separate, least-privileged Db2 identities, prove user-scoped exact top-10 and approximate top-10 with actual native RCAC. Save real Db2 account name, counts and EXPLAIN plan.
3. Only when a native vector-index access path is observed for relevant guarded queries, run the five-visibility, multiple-seed, multiple-correlation benchmark. If all plans are scans, rename the core result **RCAC-related access-path behavior**, not ANN recall collapse.
4. Separate keyword+semantic hybrid retrieval, OSV/PyPI exact-version matching, and application-valid-time exposure from the RCAC/ANN research. They are distinct metrics and should not reuse each other's unverifiable claims.
5. If time is short, prioritize two identities, documented security, one exact/approx comparison, a working Streamlit demo and final submission over 100-query sweeps or a complex SQL PL optimizer.

## Required source and evidence disclosures
- Mark each cited item **VERIFIED DOCUMENT**, **VERSION-SHARED**, **UNVERIFIED RUNTIME**, or **EXTERNAL / RESEARCH** as in REFERENCES.
- Show actual plan evidence for any DiskANN selection claim. Record SQLCODE/SQLSTATE and unexpected token for JSON_TABLE errors; do not diagnose from SQL0104N alone.
- Prevent unauthorized data from entering the app/LLM/cache/temporary tables; no Python-only `viewer_id` filter is a native RCAC test.
- Cross-check the official IBM hybrid-search cookbook for prior art; do not claim hybrid RRF is new.
- Treat application-period `BUSINESS_TIME` as valid time, not the system's first discovery time.
- Do not display fabricated recall/latency or assert the router improves accuracy until held-out results support it.
