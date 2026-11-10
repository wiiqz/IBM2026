# Unstop Round 2 ("Build & Final Submission") text

Team Needlepoint: Kartikeya Lathi and William Lu (GitHub wiiqz). Replace https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/55 and https://youtu.be/OFGFV6zC5QE before submitting. Nothing has been submitted.
Field names follow submission_copy/FORMS.md, section "Unstop Round 2".

## Project title

NEEDLE — permission-aware hybrid retrieval in Db2

## Project description (698 characters; limit 1,000)

NEEDLE is a vulnerability-triage tool that runs entirely inside IBM Db2. Paste a vague security message, even one with no CVE yet, and it returns the matching advisories, the services that run an affected version, and since when. Keyword (BM25) and vector (DiskANN) search are fused in one SQL statement under Db2 row and column access control. We also measured a problem: under row permissions a user who may see 10% of the rows got 2.05 of 10 vector results (recall 0.205). NEEDLE's router (vector leg) picks a search depth per user and returned 10 of 10 rows, recall 0.987 to 1.000, with 0 permission leaks on 89 held-out queries. Built on Db2 Community Edition 12.1.5.0 with real OSV PyPI data.

## Links

- GitHub PR URL: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/55
- Demo video link: https://youtu.be/OFGFV6zC5QE
- Code: https://github.com/wiiqz/IBM2026

## Screenshots (upload in this order; files in needle/docs/screenshots/)

1. 00_overview_hero.png
2. 01_triage_ranking.png
3. 03_rcac_senior_vs_junior.png
4. 04_rcac_recall_chart.png
5. 02_exposure_memo.png
6. 07_verify_db2_clp.png
7. 05_explain_vector_index.png
8. 06_shared_plan_cache.png
9. 08_tests_passing.png

(thumbnail_3x2.jpg is in the same folder; it is not part of this list.)

## Highlights

- Finding: under Db2 row permissions, `FETCH APPROX FIRST 10` gave a 10%-visibility user 2.05 of 10 rows (recall@10 0.205), and 36 of 170 queries returned no rows.
- Cause measured in the plan: one shared plan for all users, optimizer estimate 0.495 for every user, so the vector index hands 21 candidates to the permission check.
- Fix: a per-user router (exact scan or deeper approximate search) gave 10 of 10 rows, recall@10 0.987 to 1.000 and 0 permission leaks on 89 held-out queries.
- Hybrid triage in one Db2 SQL PL call: BM25 in plain SQL (top-10 matches `rank_bm25` on 30 of 30 queries) plus DiskANN vector search, fused with reciprocal rank fusion, then an exact version join and a temporal table for "exposed since".
- Web UI by William Lu (React + TypeScript over FastAPI) with real per-analyst Db2 sign-in; row-permission tests pass 39 of 39 (28 of them against live Db2), and the full suite passes 206 of 206.

## Evidence

Every number above is in needle/README.md ("What we found") and in needle/docs/evidence/ (rcac_real.md, eval_final.md) or needle/eval/results/.
