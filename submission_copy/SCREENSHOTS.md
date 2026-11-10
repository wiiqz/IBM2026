# Screenshots to capture (8)

> **Status 2026-11-09 ~22:55 CST: all 8 captured** into `needle/docs/screenshots/` from the new web UI (React +
> FastAPI) against a fresh full-corpus Db2 in William's Codespace; the old Streamlit JPGs were removed. Differences
> from the plan below:
> - 01/02: web UI, signed in as NDL_JUNIOR through the real sign-in form. The memo model is
>   `qwen3:4b-instruct-2507-q4_K_M` (local on the Mac), not qwen3:14b; that run kept 3 sentences and removed 0.
> - 03: the Finding page's "Same query, three Db2 identities" panel (demo switcher). NDL_SENIOR got
>   GHSA-5x8w-8jj5-q52h at hybrid rank 1 and PYSEC-2026-4330 at rank 2 (both embargoed); NDL_JUNIOR and NDL_P10 got
>   neither. Live checks: `needle/docs/evidence/web_ui_acceptance.txt`.
> - 04/05/06: rendered by the web UI from `eval/results/*.json` and `docs/evidence/g1_vector_index.md` (not an editor).
> - 07: CLP catalog queries as db2inst1 in the container; the per-identity counts (26,210 / 26,183 / 2,616) come
>   from ibm_db as each analyst, so no password went on a command line. Text: `needle/docs/evidence/verify_db2.txt`.
> - 08: `-m db tests/test_rcac.py tests/test_triage_rcac.py` now reports **28 passed, 11 deselected** (this plan said
>   35); `tests/test_verify.py tests/test_api.py` 67 passed. The old logs are unchanged.

Target folder: `needle/docs/screenshots/` (the README "Screenshots & Demo" section links there). PNG, about
1600 px wide, light theme. Every screenshot must show only data that is already in the repository (no passwords,
no `.env`, no tokens in a terminal prompt or browser bar).

| # | File name | What it shows | What it proves | Evidence file it matches | Source |
|---|---|---|---|---|---|
| 1 | `01_triage_ranking.png` | Streamlit main view after "Run triage" as NDL_JUNIOR: the query box, the user chip, "Readable advisories", the "services affected now" banner, and the keyword / vector / hybrid rank columns | Hybrid retrieval runs in one Db2 call (`CALL NEEDLE.TRIAGE_MODE(..., 'HYBRID')`) on the user's own connection | `docs/evidence/app_e2e_NDL_JUNIOR.txt` | **Recapture.** Existing `app_ndl_junior_ranking.jpg` (19:53) shows the old user drop-down and "Readable advisories 26,185"; the app now has a sign-in and NDL_JUNIOR now reads 26,183 rows (27 embargoed). Use the same query: "heads up from #platform-sec: someone says the yaml loader we use in a few python services can run arbitrary code when it parses an untrusted config file. no CVE number in the thread. are we exposed?" If there is no time, reuse the existing JPG. |
| 2 | `02_exposure_memo.png` | Affected-services panel (`FOR BUSINESS_TIME AS OF CURRENT DATE`): legacy-reporting, pyyaml 5.1, exposed since 2020-02-27, four advisories; the NOT_CONFIRMED and PREVIOUSLY_AFFECTED tabs; the qwen3:14b memo with "Kept sentences" and "Removed by verifier" | Deterministic exposure from an exact SQL join and valid-time history; the memo is checked against the SQL rows | `docs/evidence/app_e2e_NDL_JUNIOR.txt` (4 AFFECTED rows), `docs/evidence/app_llm_memo_offline.txt` | **Recapture** with screenshot 1 (same run). Fallback: existing `app_ndl_junior_exposure_memo.jpg`. The "days exposed" value grows by one per day; that is expected. |
| 3 | `03_rcac_senior_vs_junior.png` | Two app windows side by side, same query, signed in as NDL_SENIOR (left) and NDL_JUNIOR (right). Query: "heap overflow in the image library's FlashPix JPEG decoder can lead to code execution, no CVE yet". Senior: GHSA-5x8w-8jj5-q52h at hybrid rank 1, PYSEC-2026-4330 at rank 2. Junior: neither ID appears | Row permissions inside the query hide the embargoed advisory from the junior analyst; the app does no filtering | `docs/evidence/rcac_demo_case.txt` | **Capture new.** The evidence run used depth 100; the app's router now gives NDL_SENIOR depth 50, so the senior ranks may differ (UNKNOWN). The junior side must still show neither ID. If the senior rank differs, say so in the caption. |
| 4 | `04_rcac_recall_chart.png` | Two panels: recall@10 and mean rows returned vs the share of rows the user may see (10–100%), for plain literal `WHERE`, the RCAC user with `FETCH APPROX FIRST 10`, and the router | The headline finding: 0.21 recall / 2.1 rows at 10% without the router, about 1.0 / 10 rows with it (89 held-out queries) | `docs/evidence/rcac_real.md`, `eval/results/rcac_recall_vs_selectivity.json` | **Exists:** copy `eval/results/rcac_recall_vs_selectivity.png`. |
| 5 | `05_explain_vector_index.png` | Two db2exfmt access plans side by side: `FETCH APPROX FIRST 10` (bound vector) with `IXSCAN` on `VECIDX: NEEDLE.ADV_DOC_VIX`, cost 501.797; and `FETCH APPROX FIRST ? ROWS` with a table scan, cost 3401.55 | Db2 uses the DiskANN index for a literal k and not for a parameter-marker k, which is why NEEDLE writes k as a validated literal | `docs/evidence/g1_vector_index.md` (sections "APPROX_bound" and "APPROX_k_param") | **Capture** from the evidence file in an editor (no live run needed). |
| 6 | `06_shared_plan_cache.png` | The package-cache table after each user: one cache entry, one executable id, executions +10 per user, rows read +35,226 per user, rows returned 28 / 53 / 90 / 100 / 100 | All RCAC users share one plan with one candidate estimate; this is the mechanism behind the under-fill | `docs/evidence/rcac_real.md` ("Package cache after each user"), `docs/evidence/rcac_raw/plancache.log` | **Capture** from the evidence file in an editor. |
| 7 | `07_verify_db2_clp.png` | Db2 CLP in the container running "Steps to verify Db2 integration" blocks 2 and 6: `SYSCAT.INDEXES` showing `ADV_DOC_VIX` with `INDEXTYPE = VANN`, `SYSCAT.CONTROLS` showing the permission, and `SELECT COUNT(*)` as NDL_SENIOR (26210), NDL_JUNIOR (26183) and NDL_P10 (2616) | What exists in Db2, checked with SQL; the permission changes what each user sees | `docs/evidence/rcac_real.md` (visible rows per user), `docs/evidence/triage_router_explain.md` (NDL_JUNIOR 26183) | **Capture new.** Save the same CLP output as `docs/evidence/verify_db2.txt` (README TODO). Type passwords at the CLP prompt; never put them on the command line. |
| 8 | `08_tests_passing.png` | Terminal with `python -m pytest -q -m db tests/test_rcac.py tests/test_triage_rcac.py` (35 passed) and `python -m pytest -q tests/test_verify.py` (48 passed) | Leak tests (crafted SQL, embargoed embedding, BM25 statistics difference attack) and the memo verifier pass | `docs/evidence/rcac_raw/pytest_all_after_demo_embargo.log`, `docs/evidence/fix_c1_h2.txt`, `docs/evidence/fix_h1.txt` | **Capture new** (re-run). If a count differs from the evidence files, report the new count; do not edit the old logs. |

## Optional (only after the final evaluation)

| File name | What it shows | Status |
|---|---|---|
| `09_recall_by_slice.png` | Recall@10 per retriever on the named / masked / paraphrase slices; paraphrase: hybrid 0.453, vector APPROX 0.360, BM25 0.340 | **Exists:** copy `eval/results/recall_by_slice.png`, rendered from the canonical run `20261110T024304Z` (NDL_SENIOR, RCAC active; `docs/evidence/eval_final.md`). Check that the chart footer names that run before use. |
| `10_router_depth_line.png` | The app's "search depth chosen for your visibility" line for NDL_P10 (depth 128, exact scan) vs NDL_SENIOR (depth 50, vector index) | Capture only if the UI line is present; evidence `docs/evidence/triage_router_explain.md`. |

## Video stills

Screenshots 1, 3 and 4 are also the three key frames for the demo video ([VIDEO_URL]).
