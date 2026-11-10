# Screenshots (9)

> **Status 2026-11-09 ~22:55 CST: all 8 captured** into `needle/docs/screenshots/` from the new web UI (React +
> FastAPI) against a fresh full-corpus Db2 in William's Codespace; the old Streamlit JPGs were removed. Differences
> from the plan below:
> - 01/02: web UI as NDL_JUNIOR. The memo model is `qwen3:14b`; that run kept 6 sentences and removed 0.
> - 01 shows "triage SQL 696 ms": that UI timer is the wall clock in the local Python service, including the router's
>   visibility count and the round trips through the SSH tunnel to the Codespace Db2. The README p50 of 53.5 ms is one
>   `TRIAGE` call measured inside the Codespace.
> - 2026-11-10: 00-06 and `thumbnail_3x2.jpg` were re-captured against the fixed web UI (local API on :8600 with the
>   demo identity switcher on, live Db2 and Ollama), so the amber "DEMO IDENTITY SWITCHER" strip shows under the
>   header in 00, 01 and 04.
> - 03: the Finding page's "Same query, three Db2 identities" panel (demo switcher). NDL_SENIOR got
>   GHSA-5x8w-8jj5-q52h at hybrid rank 1 and PYSEC-2026-4330 at rank 2 (both embargoed); NDL_JUNIOR and NDL_P10 got
>   neither. Live checks: `needle/docs/evidence/web_ui_acceptance.txt`.
> - 04/05/06: rendered by the web UI from `eval/results/*.json` and `docs/evidence/g1_vector_index.md` (not an editor).
> - 07: CLP catalog queries as db2inst1 in the container; the per-identity counts (26,210 / 26,183 / 2,616) come
>   from ibm_db as each analyst, so no password went on a command line. Text: `needle/docs/evidence/verify_db2.txt`.
> - 08: `-m db tests/test_rcac.py tests/test_triage_rcac.py` now reports **28 passed, 11 deselected** (this plan said
>   35); `tests/test_verify.py tests/test_api.py` 67 passed. The old logs are unchanged.
> - 00 (the landing page) was added after this status line; 01, 02 and 05 were re-captured later with the rank-flow
>   chart and the exposure timeline. The table below describes the captured React views.

Target folder: `needle/docs/screenshots/` (the README "Screenshots & Demo" section links there). PNG, about
1600 px wide, light theme. Every screenshot must show only data that is already in the repository (no passwords,
no `.env`, no tokens in a terminal prompt or browser bar).

| # | File name | What it shows | What it proves | Evidence file it matches | Source |
|---|---|---|---|---|---|
| 0 | `00_overview_hero.png` | Web UI landing page ("Overview"): the 26,183 public advisories as a 3D point cloud placed by their embeddings (PCA), and a panel for the PyYAML question as a 10% analyst on the shared plan: the vector index fetches a first batch of 21, the permission removes 19 and 2 of 10 rows come back; the NEEDLE router toggle | The finding in one picture, from the real corpus | `docs/evidence/rcac_real.md` (21 candidates, 10% visibility) | **Captured** (web UI, `scripts/build_hero_cloud.py` for the point cloud). |
| 1 | `01_triage_ranking.png` | Web UI "Triage" page after "Run triage" as NDL_JUNIOR (26,183 visible): the PyYAML chat message, the router line (search depth 50, approx via vector index), the "1 service affected now" slab (legacy-reporting, pyyaml==5.1, since 2020-02-27, 4 advisories) with NOT_CONFIRMED / UNKNOWN_COVERAGE / PREVIOUSLY_AFFECTED counts, the "How the fusion reorders them" rank-flow chart, and the keyword / vector / hybrid columns | Hybrid retrieval runs in one Db2 call (`CALL NEEDLE.TRIAGE_MODE(..., 'HYBRID')`) on the user's own connection | `docs/evidence/app_e2e_NDL_JUNIOR.txt` | **Captured** (web UI, demo identity switcher as NDL_JUNIOR). |
| 2 | `02_exposure_memo.png` | Web UI "Services and since when" (`SBOM_COMPONENT FOR BUSINESS_TIME AS OF CURRENT DATE`): the exposure timeline (legacy-reporting AFFECTED and still running; the ended windows of other services), the AFFECTED / NOT_CONFIRMED / UNKNOWN_COVERAGE / PREVIOUSLY_AFFECTED tabs, the AFFECTED row with its four advisories; then the "Triage memo" marked CHECKED AGAINST SQL (`qwen3:14b`, 6 kept, 0 removed), "Removed by the verifier" and the collapsed "unverified" raw model output | Deterministic exposure from an exact SQL join and valid-time history; the memo is checked against the SQL rows | `docs/evidence/app_e2e_NDL_JUNIOR.txt` (4 AFFECTED rows), `docs/evidence/app_llm_memo_offline.txt` | **Captured** with screenshot 1 (same run). The "days exposed" value grows by one per day; that is expected. |
| 3 | `03_rcac_senior_vs_junior.png` | Web UI "Same query, three Db2 identities" panel: the FlashPix query on three separate Db2 connections, NDL_SENIOR (26,210 visible), NDL_JUNIOR (26,183) and NDL_P10 (2,616). Senior: GHSA-5x8w-8jj5-q52h at rank 1 and PYSEC-2026-4330 at rank 2, both marked embargoed. Junior and P10: neither ID. Each column shows 10 of 10 hybrid rows and its router choice (approx 50, approx 50, exact) | Row permissions inside the query hide the embargoed advisories from the other identities; the app does no filtering | `docs/evidence/rcac_demo_case.txt`, `docs/evidence/web_ui_acceptance.txt` | **Captured** (demo switcher). |
| 4 | `04_rcac_recall_chart.png` | Web UI "The finding" page ("Ask Db2 for 10. Get 2."): the headline tiles (recall@10 0.208 and 2.08 rows at 10% visible, filter factor 0.495, 21 index candidates), then two panels, recall@10 and rows returned of 10 vs the share of rows the analyst may see (10-100%), for the RCAC user on the shared plan, a plain `WHERE` without RCAC, and the NEEDLE router (89 held-out queries) | The headline finding: about 0.21 recall / 2.1 rows at 10% without the router, 1.00 / 10 rows with it | `docs/evidence/rcac_real.md`, `eval/results/rcac_recall_vs_selectivity.json` | **Captured** (web UI, rendered from the JSON). |
| 5 | `05_explain_vector_index.png` | Web UI SQL panel, "Access plan" tab: two db2exfmt access plans side by side, `FETCH APPROX FIRST 10` with `IXSCAN` on `VECIDX: NEEDLE.ADV_DOC_VIX` (cost 501.8) and `FETCH APPROX FIRST ?` with a table scan (cost 3401.6) | Db2 uses the DiskANN index for a literal k and not for a parameter-marker k, which is why NEEDLE writes k as a validated literal | `docs/evidence/g1_vector_index.md` (sections "APPROX_bound" and "APPROX_k_param") | **Captured** (web UI, from the evidence file). |
| 6 | `06_shared_plan_cache.png` | Web UI "One plan for everyone" table: the package cache after each identity, one executable id, executions +10 per identity, rows read +35,226 per identity, rows returned 28 / 53 / 90 / 100 / 100 of 100; the SQL text below | All RCAC users share one plan with one candidate estimate; this is the mechanism behind the under-fill | `docs/evidence/rcac_real.md` ("Package cache after each user"), `eval/results/rcac_plancache.json`, `docs/evidence/rcac_raw/plancache.log` | **Captured** (web UI, rendered from the JSON). |
| 7 | `07_verify_db2_clp.png` | Db2 CLP in the container as db2inst1: the service level, `SYSCAT.INDEXES` with `ADV_DOC_VIX` / `VANN`, `SYSCAT.CONTROLS` (the row permissions and the `ADV_DOC_SUMMARY_MASK` mask), `SYSCAT.PERIODS` (`BUSINESS_TIME`), 26,210 advisories with 27 embargoed; then visible rows per identity through `ibm_db` (NDL_SENIOR 26,210, NDL_JUNIOR 26,183, NDL_P10 2,616) | What exists in Db2, checked with SQL; the permission changes what each user sees | `docs/evidence/verify_db2.txt`, `docs/evidence/rcac_real.md` (visible rows per user) | **Captured.** No password went on a command line. |
| 8 | `08_tests_passing.png` | Terminal: `python -m pytest -q -p no:warnings -m db tests/test_rcac.py tests/test_triage_rcac.py` (28 passed, 11 deselected) and `python -m pytest -q -p no:warnings tests/test_verify.py tests/test_api.py` (67 passed) | Leak tests (crafted SQL, embargoed embedding, BM25 statistics difference attack), the memo verifier and the API tests pass | The screenshot itself (a later run). The logged runs stay as they are: `docs/evidence/rcac_raw/pytest_db.log` (24 passed), `docs/evidence/fix_c1_h2.txt`, `docs/evidence/fix_h1.txt` | **Captured** (re-run). |

## Optional (only after the final evaluation)

| File name | What it shows | Status |
|---|---|---|
| `09_recall_by_slice.png` | Recall@10 per retriever on the named / masked / paraphrase slices; paraphrase: hybrid 0.453, vector APPROX 0.360, BM25 0.340 | **Exists:** copy `eval/results/recall_by_slice.png`, rendered from the canonical run `20261110T024304Z` (NDL_SENIOR, RCAC active; `docs/evidence/eval_final.md`). Check that the chart footer names that run before use. |
| `10_router_depth_line.png` | The app's "search depth chosen for your visibility" line for NDL_P10 (depth 128, exact scan) vs NDL_SENIOR (depth 50, vector index) | Capture only if the UI line is present; evidence `docs/evidence/triage_router_explain.md`. |

## Video stills

Screenshots 1, 3 and 4 are also the three key frames for the demo video ([VIDEO_URL]).
