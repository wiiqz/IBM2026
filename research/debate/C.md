# ADVOCATE C — **Timeron**

**Pitch:** A Db2 tuning agent that doesn't guess. The LLM proposes indexes, and the Db2 optimizer decides by costing them as *virtual* indexes before anything is built. Every claim is then backed by measured before/after metrics.

## Problem and who has it
DBAs and developers have slow queries, stale statistics and bad indexing. Their options are `db2advis` (raw DDL, no reasoning or verification) or an LLM chatbot whose index suggestions are never tested.

## Core mechanic: closed loop
1. **Find**: rank the workload from the package cache.
2. **Diagnose**: EXPLAIN the plan, then check stats health (CARD = -1, stale STATS_TIME).
3. **Propose**: candidates come from two sources, the LLM as typed JSON `{table, columns[]}` and Db2's own RECOMMEND INDEXES. Every identifier is checked against SYSCAT.COLUMNS. The LLM never writes SQL.
4. **Evaluate virtually**: insert the candidates into ADVISE_INDEX and run under `EVALUATE INDEXES`. The optimizer costs the plan with fabricated stats and nothing gets built. Candidates the optimizer won't use are rejected.
5. **Apply**: the winner is built only after human approval (LangGraph interrupt). It runs as a separate DDL auth ID. DROP is the rollback.
6. **Measure**: deterministic metrics (ROWS_READ, logical reads, timerons) plus wall-clock (median of 7, with a noise band). Results are written to a Db2 journal.

**Emulation noise:** the headline numbers are deterministic (timerons, rows read, logical reads), so Rosetta doesn't affect them. Wall-clock is secondary, and we claim a speedup only when it is larger than the measured baseline variance.

## Db2 features (all verified for 12.1 docs unless marked)
EXPLAIN tables; CURRENT EXPLAIN MODE `RECOMMEND INDEXES` / `EVALUATE INDEXES` + ADVISE_INDEX (verified in the 12.1 docs); MON_GET_PKG_CACHE_STMT; SYSCAT.TABLES/INDEXES/COLUMNS; ADMIN_CMD RUNSTATS; journal tables; separate auth IDs and GRANTs. *Stretch:* tuning a vector query with CREATE VECTOR INDEX + FETCH APPROX, measuring recall@10 against exact. This is untested under emulation.

```sql
CALL SYSPROC.SYSINSTALLOBJECTS('EXPLAIN','C',NULL,CURRENT SCHEMA);

SELECT EXECUTABLE_ID, NUM_EXECUTIONS, ROWS_READ,
       POOL_DATA_L_READS+POOL_INDEX_L_READS AS LREADS, TOTAL_CPU_TIME, STMT_TEXT
FROM TABLE(MON_GET_PKG_CACHE_STMT('D',NULL,NULL,-2))
ORDER BY ROWS_READ DESC FETCH FIRST 10 ROWS ONLY;

SELECT o.OPERATOR_ID, o.OPERATOR_TYPE, o.TOTAL_COST, s.STREAM_COUNT, s.OBJECT_NAME
FROM EXPLAIN_OPERATOR o LEFT JOIN EXPLAIN_STREAM s
  ON s.TARGET_ID=o.OPERATOR_ID AND s.EXPLAIN_TIME=o.EXPLAIN_TIME
WHERE o.EXPLAIN_TIME=(SELECT MAX(EXPLAIN_TIME) FROM EXPLAIN_OPERATOR);

INSERT INTO ADVISE_INDEX(NAME,CREATOR,TBNAME,TBCREATOR,COLNAMES,COLCOUNT,USE_INDEX,EXISTS,...)
  VALUES('TMR_C1',?, 'GPU_SAMPLES','TELEM','+NODE_ID+TS',2,'Y','N',...);
SET CURRENT EXPLAIN MODE EVALUATE INDEXES;  -- then issue the target statement

SELECT TABNAME, CARD, NPAGES, STATS_TIME FROM SYSCAT.TABLES WHERE TABSCHEMA='TELEM';
CALL SYSPROC.ADMIN_CMD('RUNSTATS ON TABLE TELEM.GPU_SAMPLES WITH DISTRIBUTION AND DETAILED INDEXES ALL');
```

## Framework
**LangGraph/LangChain**: a stateful graph whose `interrupt()` is the approval gate, running with `ChatOllama` (granite4 micro). The same six tools are also exposed as an **MCP server** (FastMCP, stdio) for Claude Code or IBM Bob.

## Demo (2:30)
- **0:00** "Your GPU-fleet dashboard is slow." 2M rows of synthetic GPU telemetry, generated in-DB. The query takes 1.9s.
- **0:15** Timeron ranks the package cache. Top offender: 2.0M rows read per run.
- **0:30** Plan tree: TBSCAN at 48k timerons. *Finding #1 isn't an index:* "TELEM.GPU_SAMPLES has CARD = -1, no stats." It runs RUNSTATS and the plan changes.
- **0:55** The LLM proposes three indexes and Db2 recommends a fourth. **Wow:** all four are costed as virtual indexes in under a second, with nothing built. One LLM pick is **rejected because the optimizer won't use it**: "the LLM proposes, the optimizer disposes."
- **1:30** Approval prompt, then the build. Rows read go from 2,000,000 to 1,140, logical reads from 31k to 9, and wall time from 1.9s to 0.03s (noise band shown).
- **1:55** Trade-off check: insert throughput drops by x%, and the journal records it.
- **2:10** Claude Code calls `timeron.evaluate_index` over MCP.
- **2:25** Journal table + tests.

## Self-scores (honest)
| Website rubric | Score | Why |
|---|---|---|
| Db2 depth (25) | 21 | Optimizer, monitor and catalog internals go far beyond the connectors. No vectors in the MVP. |
| Innovation (20) | 15 | Uncontested and real pain, but index advisors exist. |
| Arch & AI (15) | 11 | Clean verify loop. The LLM's role is modest, and the small model is a limit. |
| Security (15) | 11 | Typed proposals, identifier allow-list, split auth IDs, approval gate. |
| Repro (15) | 10 | Colima setup is painful. Pytest fixtures run without a DB. |
| Docs (10) | 8 | |
| **Total** | **76** | |

Devpost rubric: Db2 24/30, Innovation 18/25, Arch 15/20, Repro 10/15, Docs 8/10, total **75**.

## Judge appeal
- **All six are Db2 engineers**, and EXPLAIN and the optimizer are their home turf.
- **Kunal:** MCP. **Dhruv:** the vector-index stretch mirrors his DiskANN PR. **Managers:** DBA hours saved.
- **Weak spot:** Pawan and Keshav lean RAG/vector.

## Differentiation
- No PR does tuning, workload analysis or MCP.
- #30 uses EXPLAIN only for blast-radius estimates, while we use the optimizer to *verify AI output*.
- #36 compiles LLM plans to SELECTs, and we compile them to validated DDL.

## Build plan (2 builders: A = Db2, B = agent/UI)
- **H0–2:** A gets Colima/Db2 up, explain tables, schema, recursive-CTE data gen and 6 workload queries. B does the repo skeleton, submission.json and validator, and the LangGraph stub.
- **H2–6:** A builds workload, explain→plan-tree and stats-health tools. B builds the candidate schema/validator and virtual eval (the ADVISE_INDEX required columns get verified here).
- **H6–10:** apply/measure/rollback, the journal tables, and the graph with interrupt.
- **H10–12:** end-to-end on the demo query.
- **— MVP CUT (H12): CLI finds the top query → stats fix → ≥3 virtual evals → approved build → deterministic before/after → journaled; pytest green. —**
- **H12–16:** Streamlit plan-diff UI and the MCP server.
- **H16–19:** write-cost benchmark, red-team (malicious column names).
- **H19–21:** *stretch* vector-index tuning.
- **H21–26:** docs, architecture.md, screenshots, video, PR, LinkedIn.

## Top risks → fallbacks
1. **Db2 under Rosetta is slow or hits SQL1032N.** Settle it in H0. Fallback: GitHub Codespace (amd64) running the same container.
2. **EVALUATE INDEXES quirks** (ADVISE_INDEX NOT NULL columns, SQL0217W through ibm_db). Fallback: RECOMMEND INDEXES, or `db2advis` via `docker exec`.
3. **granite4 micro tool-calling flakiness.** The graph is a deterministic state machine and the LLM only emits JSON and explanations. Fallback: an OpenRouter free model.
4. **Timing noise.** Lead with deterministic metrics, and show the variance band.
5. **Seen as niche.** Frame it in latency and DBA hours, on a vivid GPU dataset.

## Steelman objection
"This is db2advis with a chatbot skin. Db2 already recommends indexes, so the LLM adds nothing, and there's no vector/RAG, which is what these judges built connectors for."

**Rebuttal:**
- db2advis outputs DDL. It doesn't explain, check stats, measure before/after, weigh write cost, roll back, or expose an agent interface.
- We *include* RECOMMEND INDEXES as a source. The novelty is the verify loop: the Db2 optimizer holds the LLM accountable.
- The vector stretch fills the untouched CREATE VECTOR INDEX + APPROX gap.
- Honest risk: if judges weight "AI-ness" heavily, we could score below a polished RAG entry.

## Rejected candidates
- **MCP server alone:** a thin wrapper, so it's folded in as Timeron's interface.
- **Oracle/Postgres→Db2 migrator:** large scope, and correctness is hard to demo.
- **SiliconPulse:** a generic analytics/RAG mechanic with little Db2 novelty. Its GPU flavor survives as our dataset.
