# NEEDLE — Build Pack Start Here

**Status:** Specification only. No live Db2 execution, UI, benchmark or submission has been performed by the author of this pack. Builder must execute every acceptance gate.

**Decision:** Build NEEDLE, not TraceForge. Product: DB2-native hybrid vulnerability advisory retrieval and SBOM applicability triage. Use one real IBM Db2 12.1.5 Community Edition instance, Haystack as the required framework, local Ollama `nomic-embed-text` embeddings (768 dimensions), and a custom SQL hybrid retriever.

**Hard cutoff:** Target all submissions complete by **2026-11-10 05:00 CST**, earlier than both organizer's 05:30 CST equivalent and Devpost's 07:30 CST listing. Check current clock and organizer updates immediately. Do not assume a PR alone submits the project.

## Files (read in this order)
1. `MASTER_PROMPT.md` — binding agent instructions, ordered phases, no-go checks.
2. `RISKS.md` — infrastructure, scoring and eligibility stop conditions.
3. `DB2_SCHEMA.sql` — real Db2 LUW DDL; migrate in a brand-new test database; vector-index section is optional and gated.
4. `ARCHITECTURE.md` — contracts, SQL search algorithms, data flow, security boundaries.
5. `PRD.md` — functionality and acceptance tests.
6. `TEST_PLAN.md` — reproducibility and benchmark protocol.
7. `DEMO_SCRIPT.md` — under-3-minute judge demonstration.
8. `SUBMISSION_CHECKLIST.md` — official repo and other surfaces.
9. `REFERENCES.md` — real primary-source URLs, provenance, and UI references.
10. `HYBRID_QUERY_REFERENCE.sql` — illustrative single-statement SQL pattern; **UNVERIFIED until run against live 12.1.5**.

## Decision risks that matter
- **Eligibility:** Official event site/Unstop say solo; official repository FAQ permits teams **subject to official rules**. Written organizer resolution is required to claim joint eligibility. Do not quietly override that.
- **Db2 prerequisite:** Windows host currently lacks Docker and WSL. Do not start building a styled UI before a live Db2 12.1.5 instance responds to SQL.
- **Vector index:** `CREATE VECTOR INDEX` syntax is supported in 12.1.5, but feature gating, 32K page size, index build time and query-plan selection must be verified. `FETCH APPROX` does not prove index utilization.
- **No invented data:** Demo fixture advisories must be conspicuously marked `SYNTHETIC`. If ingesting actual OSV records, preserve source URLs, source timestamps, ecosystem, and clear affected-version logic.
- **No false benchmark claims:** calculate recall@10 relative to exact results, not an idealized relevance label. Report retrieval success separately from version applicability precision.

## Winning one-liner
NEEDLE is an auditable supply-chain advisory retrieval system that benchmarks hybrid keyword/semantic retrieval **inside IBM Db2**, then distinguishes semantically related advisories from demonstrably affected SBOM packages.

## Candidate comparison (planning judgment, not a judge forecast)
| Idea | Event-site rubric /100 | Repository rubric /100 | Nine-hour feasibility /10 |
|---|---:|---:|---:|
| NEEDLE | 83 | 85 | 6.5 |
| Timeron | 80 | 82 | 7.0 |
| TraceForge | 79 | 77 | 7.5 |
| NEEDLE + TraceForge | 79 | 79 | 4.0 |

Estimates assume the P0 system works; unmet Db2/index/submission gates can greatly reduce the achieved score. Event weights: Db2 25, innovation 20, architecture 15, security 15, reproducibility 15, presentation 10. Repo weights: 30/25/20/15/10.
