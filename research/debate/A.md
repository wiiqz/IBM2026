# Advocate A: TraceForge, regression CI for AI agents, run inside Db2

**Pitch:** Record every agent run in Db2, replay your real production history against a prompt or model change, and let a Db2 stored procedure say SHIP or BLOCK.

## Problem
Teams change agent prompts and models weekly and test against a few hand-written evals. Regressions hide in the long tail of real traffic, like a "friendlier" prompt that skips the policy check before refunding. Db2 shops' agent traces sit in LangSmith or Langfuse, outside database governance, and never become a deploy gate.

## Core mechanic
1. **Recorder:** a LangChain callback writes each LLM, tool and retriever event as JSON into `TF.EVENTS`, hash-chained (SHA-256 computed in Python).
2. **Temporal configs:** `TF.AGENT_CONFIG` is system-period temporal, so we know which prompt and model were live for any run.
3. **Deterministic replay:** the candidate config re-runs recorded inputs. The LLM is called live (temperature 0); tool outputs come from the recording, and unrecorded calls run read-only `FOR SYSTEM_TIME AS OF` the original run time, so replay has no side effects.
4. **SQL oracles:** rules such as "refund over $500 needs `policy_lookup` first" are checked in Db2 with `JSON_TABLE`. `TF.GATE` compares baseline and candidate and returns SHIP or BLOCK.
5. **Failure memory:** failed runs are embedded (granite-embedding, 384 dimensions). One statement finds the most similar past failures and the config change that fixed them.

## Db2 features and key SQL
Verified: VECTOR, VECTOR_DISTANCE, JSON_TABLE/JSON_VALUE, system-period temporal, SQL PL, OLAP LAG, and least-privilege accounts. **Stretch** (untested under emulation): CREATE VECTOR INDEX plus FETCH APPROX, with EXPLAIN and recall@10 compared against EXACT.

```sql
-- (1) oracle violations per run (baseline vs candidate batches)
SELECT r.replay_of, r.batch_id, COUNT(*) violations
FROM TF.RUNS r JOIN TF.EVENTS e ON e.run_id=r.run_id AND e.kind='tool_start',
 JSON_TABLE(e.payload,'$' COLUMNS(tool VARCHAR(64) PATH '$.name', amt DECFLOAT PATH '$.args.amount')) j
WHERE j.tool='refund' AND j.amt>500 AND NOT EXISTS (SELECT 1 FROM TF.EVENTS p
  WHERE p.run_id=e.run_id AND p.seq<e.seq AND JSON_VALUE(p.payload,'$.name')='policy_lookup')
GROUP BY r.replay_of, r.batch_id;
-- (2) failure memory: vector + relational + config history
SELECT f.run_id, f.label, c.prompt fixing_prompt,
  VECTOR_DISTANCE(f.err_vec, VECTOR(CAST(? AS CLOB),384,FLOAT32), COSINE) d
FROM TF.FAILURES f JOIN TF.CONFIG_ALL c   -- view: base UNION ALL history
  ON c.agent=f.agent AND f.fixed_at>=c.sys_start AND f.fixed_at<c.sys_end
WHERE f.agent=? ORDER BY d FETCH FIRST 5 ROWS ONLY;
-- (3) gate
CREATE PROCEDURE TF.GATE(IN b VARCHAR(16), OUT v VARCHAR(5), OUT n INT) LANGUAGE SQL
BEGIN SELECT COUNT(*) INTO n FROM TF.VERDICTS WHERE batch_id=b AND base_pass=1 AND cand_pass=0;
 SET v = CASE WHEN n=0 THEN 'SHIP' ELSE 'BLOCK' END;
 INSERT INTO TF.GATE_LOG VALUES(b,v,n,CURRENT TIMESTAMP); END
-- (4) tamper check: prev_hash <> LAG(hash) OVER(PARTITION BY run_id ORDER BY seq)
```
Schema: RUNS, EVENTS (payload CLOB, prev_hash, hash), AGENT_CONFIG (temporal), FAILURES (err_vec VECTOR), VERDICTS, GATE_LOG.

## Framework
**LangChain/LangGraph.** Callbacks are the natural place to record a trajectory. The agent under test uses langchain-db2 `DB2VS` for policy retrieval, so the official connector is exercised. TraceForge's own queries are parameterized SQL, since the connector can't do joins, JSON or temporal.

## Demo (2:30)
- **0:00–0:15:** "We tweaked our refund agent's prompt. 5/5 evals pass. Ship?"
- **0:15–0:35:** One live run. Its events land in Db2, and a JSON_TABLE view shows the trajectory.
- **0:35–1:00:** Prompt v5 ("be more helpful"). Evals are green. `tf replay --last 40` runs (sped up).
- **1:00–1:30: WOW.** One SQL statement shows 3 runs that passed on v4 and fail on v5: refunds of $620 to $900 with no `policy_lookup`. `CALL TF.GATE` returns **BLOCK**.
- **1:30–1:55:** Failure memory finds the 14 Oct failure under v3, which had the same pattern, and shows the v4 fix from temporal history. "You just removed that fix."
- **1:55–2:30:** Tamper with one event; the LAG check flags it. Then architecture and test count.

## Self-score (honest)
| Criterion | Website | Devpost |
|---|---|---|
| Db2 depth | 18/25 (20 if the vector index works) | 21/30 |
| Innovation/impact: agent eval is a known category; Db2-native gating and failure memory are new here | 13/20 | 16/25 |
| Architecture/AI | 11/15 | 15/20 |
| Security: side-effect-free replay, least privilege, tamper evidence, no RCAC | 9/15 | n/a |
| Repro/code: Rosetta risk; pytest without DB plus integration tests | 10/15 | 11/15 |
| Docs | 8/10 | 8/10 |
| **Total** | **~69** | **~71** |

Custodian is likely 80+. This is a top-10 entry with top-5 upside, not a lock.

## Judge appeal
- **Dhruv:** agentic memory, and the APPROX recall study (stretch) lines up with his DiskANN PR.
- **Kunal:** he owns a CI validator, so "CI for agents" is his mental model.
- **Keshav:** vector, JSON and relational work in one statement, plus pytest without a DB.

## Differentiation
- **#30 Custodian** guards individual SQL statements at runtime and replays a *data answer* AS OF a past time. TraceForge works *pre-deploy* on *whole multi-tool trajectories*. It answers "did my change break what worked yesterday?", which Custodian cannot. Our temporal use is deterministic tool replay, not rewinding data.
- **#36 MetricGuard** keeps analytics numbers correct in one text-to-SQL domain. TraceForge evaluates agent behavior in any domain.
- **Dhruv's 20** are retrieval and crew patterns; UC18 stores incident resolutions for humans. None record, replay, evaluate or gate agents.

## Build plan (~26 hours, 2 builders)
- **H0–2:** Db2 container, schema, Ollama. In parallel, the 3-tool refund agent on temporal business tables.
- **H2–6:** recorder, hash chain, config history.
- **H6–10:** about 120-run corpus (v3/v4) and the replay engine.
- **H10–13:** oracles, VERDICTS, GATE.
- **MVP CUT (H14):** record, replay and a SQL verdict from the CLI.
- **H14–17:** failure memory.
- **H17–20:** Streamlit, 3 screens.
- **H20–22:** tests and the vector index attempt.
- **H22–26:** docs, video, PR, form, LinkedIn.

## Top risks and fallbacks
1. **Db2 under Rosetta (SQL1032N).** Start at H0; fall back to an x86 cloud VM with the same compose file.
2. **Slow or non-deterministic Ollama.** Temperature 0 and a seed, a 40-run subset, cached baselines.
3. **Vector index fails.** Use FETCH EXACT and document the limit.
4. **Candidate goes off-script.** Mark the run DIVERGED and serve the call from read-only AS OF tools.
5. **Seen as "LangSmith on Db2" or as overlapping Custodian.** Lead the README with a differentiation table and keep the decision logic in SQL.

## Steelman objection
"This is Langfuse with Db2 as a log sink. The hash chain and temporal echo Custodian, and nothing here is Db2-specific."

**Rebuttal:** Db2 makes the decisions here, not just stores the data. Oracles are JSON_TABLE SQL over trajectories, the gate is a stored procedure, and failure memory joins vector similarity with temporal config history in one statement. Langfuse's store does none of that. The objection is right that we don't show RCAC on traces, and we say so. The overlap with Custodian is in mechanism, not purpose.
