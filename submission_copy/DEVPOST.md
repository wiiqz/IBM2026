# Devpost project page (draft)

Placeholders: [VIDEO_URL], [PR_URL], [REPO_URL]. Source file for each claim: see the
"Evidence map" at the end (do not paste the map).

---

## Project name

NEEDLE

## Tagline (48 characters)

Permission-aware hybrid retrieval inside IBM Db2

## Links (Devpost "Try it out" / video fields)

- Video: [VIDEO_URL]
- Submission PR: [PR_URL]
- Code: [REPO_URL]

---

## Inspiration

NEEDLE is a vulnerability-triage tool that finds which of your services a vague security advisory hits, with all of the retrieval done inside IBM Db2. We started from a situation every on-call security person knows: a message arrives in chat saying "the yaml loader we use can run code from a crafted file, no CVE yet", and someone has to answer "are we exposed?" before there is a package name, an advisory ID or a version range. Keyword search misses the paraphrase, and vector search misses exact identifiers like `CVE-2020-1747`, so we wanted both at once. Some advisories are also under embargo, and the usual way to hide them, filtering after the vector search, quietly returns fewer results than you asked for. We wanted to know how big that effect is inside Db2 itself, per user, and whether we could fix it without the application ever filtering rows on its own.

## What it does

NEEDLE takes a vague advisory or a chat message and returns the advisories that match it, the services that run an affected version, and how long each service has been exposed. One Db2 SQL PL call, `NEEDLE.TRIAGE`, runs BM25 keyword ranking in plain SQL and a `FETCH APPROX` search on a DiskANN vector index, and fuses both rankings with reciprocal rank fusion in a single statement. Db2 row and column access control applies to both legs, and each analyst signs in as their own Db2 user, so an analyst without clearance never sees an embargoed advisory: in our demo case the senior analyst gets the embargoed Pillow advisory at rank 1, and the junior analyst does not get it at all. An exact SQL join of package versions against the OSV affected-version lists marks each service as AFFECTED, NOT_CONFIRMED or UNKNOWN_COVERAGE (never "safe"), and a temporal table with `BUSINESS_TIME` deploy history says since when. A local model writes a short cited memo, and a verifier removes any sentence that names an ID the SQL did not return. Because row permissions change how many candidates the vector index hands back, NEEDLE also picks a search depth per user (a deeper approximate search or an exact scan) so that low-visibility users still get a full result list.

## How we built it

We built NEEDLE on Db2 Community Edition 12.1.5.0 in Docker inside a GitHub Codespace, with a database that uses 32K pages because a 768-dimension vector index key needs them. The data is the real OSV PyPI export, 26,842 records, of which 26,210 non-withdrawn advisories are searchable; we embedded them locally with Ollama `nomic-embed-text` into a `VECTOR(768, FLOAT32) NOT NULL` column and built a DiskANN index with `CREATE VECTOR INDEX ... WITH DISTANCE COSINE`. Db2 Text Search is not configured in the Community Edition image (`CIE0774E`), so we wrote BM25 in plain SQL over a postings table of 1,944,102 rows and checked it against the `rank_bm25` Python library until the top-10 matched exactly on 30 of 30 queries. The fusion, the permission model (`CREATE PERMISSION` with a `SESSION_USER` lookup in an entitlement table, plus a column mask), the exact version join and the `PERIOD BUSINESS_TIME` exposure history are all SQL. On top of that we put a LangChain `BaseRetriever`, a Haystack component, a React + TypeScript web UI over a local FastAPI (the Streamlit page is kept) with sign-in, and a local memo model with a verifier, all running locally. The evidence runs used `qwen3:14b` for the memo; `LLM_MODEL` selects it, and the screenshots used `qwen3:4b-instruct`. To prove what Db2 actually did, we used `EXPLAIN` and `db2exfmt`, read the package cache with `MON_GET_PKG_CACHE_STMT`, formatted the executed sections with `EXPLAIN_FROM_SECTION`, and captured section actuals with an activity event monitor. The evaluation uses real, separate Db2 users who see 10, 25, 50, 75 and 100 percent of the rows, a frozen query set split into dev and held-out halves, and each user's own exact search as ground truth.

## Challenges we ran into

Building NEEDLE meant running real measurements on a real Db2 instance, and several things did not go as planned.

- **The vector index was not chosen at first.** On our first 3,000-row load, `FETCH APPROX` planned as a table scan and sort. After we loaded all 26,210 rows, built the vector index and ran `RUNSTATS`, Db2 chose the index for both literal and bound query vectors. We kept this in the README: the 2,000-row sample mode shows that the pipeline runs, but it probably will not use the index, and it does not reproduce our measurements.
- **The tunnel went stale.** Our port forward to the Codespace stopped answering (`SQL30081N`, `selectForRecvTimeout`) while Db2 itself was healthy. We switched to an SSH tunnel, activated the database explicitly, and moved every bulk load inside the Codespace after a 3,000-row load through the tunnel took about ten minutes and hung.
- **We filled the transaction log.** One `INSERT ... SELECT` that copied the 26,000-row vector table in a single statement filled the transaction log. We now copy in committed 2,000-row batches, and the evaluation never copies the corpus at all.
- **We filled the disk.** About 300 baseline searches on one connection grew a temporary file to about 8 GB, and Db2 returned `SQL0968C The file system is full`. We measured the cause: selecting `SYSTOOLS.BSON2JSON(metadata)` in the same query block as a full scan holds about 26.8 MB of temporary space per search until the transaction ends, and a commit releases it. Our harness now commits after every search.
- **We hit SQL0901N.** For one query vector out of 450, `FETCH APPROX FIRST 100` (and 99) returned `SQL0901N ... "Fetched nodes unexpectedly unsorted."`, while 10, 20, 50, 200 and an exact search of 100 worked. We wrote a standalone repro, added a logged retry at a different depth, and moved TRIAGE to depths 50 and 128, which also fit the plan behaviour we measured. In our final evaluation, under row permissions, the same query also failed inside TRIAGE at depths 50 and 64; the retry answered it at depth 128, so all 450 evaluation queries returned results with 0 errors.
- **The keyword leg slowed down under row permissions, and we fixed it.** After we activated row access control on the postings table, BM25 got about 6x slower: the median over all 450 evaluation queries went from 45.3 ms to 265.3 ms, while recall did not change. The plan showed why: under the permission, Db2 scanned all 1.94 million posting-index entries and applied the permission to each one, instead of probing the index once per query term as it did before. We rewrote the keyword function to read the postings through a per-term `LATERAL` subquery, with no new index or DDL, and the per-term probe came back. On 30 test queries BM25 fell from 244.8 ms to 27.2 ms and hybrid TRIAGE from 256.4 ms to 34.4 ms, with identical top-10 results; over the full evaluation (as NDL_SENIOR, who may read every row) the medians are now 43.4 ms for BM25 and 53.5 ms for TRIAGE.
- **JSON_TABLE could not expand our term array.** We pass query terms as one bound JSON array so that no term is ever concatenated into SQL. The ISO `JSON_TABLE` in Db2 12.1.5 accepts only the row path `'strict $'`, so it cannot iterate an array, and the legacy `SYSTOOLS.JSON_TABLE` returned corrupted terms such as `letsary` for `lets`, which broke BM25 parity on 29 of 30 queries. A recursive common table expression over `JSON_VALUE(doc, 'strict $.t[i]')` fixed it, with 0 of 30 mismatches.
- **Our own security review found a side channel.** We asked for an independent review of our code, and it found that the global BM25 statistics were readable by every analyst: global document frequency minus the frequency an analyst can see reconstructs the vocabulary of embargoed advisories, including their IDs. We closed it by computing the statistics over public rows only (refreshed by a procedure that syncs the postings with the permissions), revoking SELECT on both statistics tables from every analyst, and adding a regression test for the difference attack, which now returns an empty set. The same review led us to harden the memo verifier against Unicode-dash and fullwidth ID tricks and to replace the user picker in the app with a real sign-in.

## Accomplishments that we're proud of

NEEDLE turned into both a working triage tool and a measured finding about vector search under row permissions, and we are proud of how carefully we pinned the finding down.

- We showed that under row permissions every user shares one plan (one package-cache entry across five users, in both orders), that the plan sizes the vector index scan with one estimate, and that the index hands exactly 21 candidates (10 / 0.495) to the permission check, which section actuals confirmed in all 9 captured runs.
- We measured the cost: a user who sees 10% of the rows got 2.05 of 10 rows on average (recall@10 0.205), and 36 of 170 queries returned nothing.
- We ran a causal control: with the same permission written as a literal on a copy of the table, recall at 10% rose from 0.205 to 0.765, so the predicate's visibility to the optimizer drives the effect, not row access control itself.
- Our router, fitted on dev queries only, restored recall@10 to 1.000, 1.000, 1.000, 0.988 and 0.987 on 89 held-out queries at 10 to 100% visibility (10-50 %: exact scans chosen by the router; 75-100 %: the vector index with search-list size 150), with 10 of 10 rows every time and 0 permission leaks.
- Every user's exact results matched the admin's exact results with the permission written out by hand, on 170 of 170 queries, and our row-permission test files pass 35 of 35.
- Hybrid triage now answers in 53.5 ms median per query inside Db2, row permissions included (NDL_SENIOR, who may read every row), after we found and fixed a keyword-leg plan that scanned the whole posting index under the permission (BM25 244.8 → 27.2 ms on 30 queries, identical results).
- BM25 in plain SQL matches the reference library on 30 of 30 queries, so the keyword leg sits under the same row permission as the vector leg.
- We wrote seven short notes on Db2 behaviours we met while building on the vector features, each with a repro script and a suggested one-line change.
- On the realistic paraphrase slice (150 synthetic chat-style rewrites), hybrid TRIAGE reached hit@10 0.453 (share of queries with a correct advisory in the top 10), against 0.360 for vector search alone and 0.340 for BM25 alone, measured as a real analyst user with row access control active (NDL_SENIOR, who may read every row). On the named and masked slices, which copy text from a correct advisory and are therefore upper bounds, hybrid hit@10 was 0.993 and 1.000.

## What we learned

Working on NEEDLE taught us that the interesting part of permission-aware retrieval lives in the query plan, not in the application. A shared plan has to use one estimate for every user, so the number of candidates the vector index returns is fixed at compile time, and a low-visibility user simply gets fewer rows. Raising the search list size improved the quality of the candidates but not their count; only a deeper fetch changed the count, and past a certain depth Db2 switches to an exact scan on its own. We learned to write k as a validated literal, because `FETCH APPROX FIRST ? ROWS` does not use the vector index, and to declare the vector column `NOT NULL`. We also learned that at 26,000 rows an exact scan is cheap (16 to 146 ms), so the router's value at this scale is recall and a full result list rather than speed. We also learned that random visibility is the easy case: when analysts see whole topic clusters instead of random rows, the 10%-visibility analyst got zero results for 130 of 170 queries with plain `FETCH APPROX FIRST 10`, while the router still returned 10 of 10 rows on every held-out query with zero leaks. Finally, we learned to re-measure before we claim anything: our 3,000-row result did not hold at 26,000 rows, and our first BM25 statistics were a real leak until a review caught it.

## What's next

NEEDLE works today on one ecosystem and two visibility patterns, and we want to widen both. We plan to repeat the topic-clustered visibility test with more seeds, add the opposite case (where visible rows avoid the query's topic), and test Db2's `SELECTIVITY` clause as a way to give the optimizer the true selectivity under a shared permission. We want range-aware version matching (PEP 440) so that fewer advisories end up UNKNOWN_COVERAGE, CycloneDX SBOM import, and more ecosystems than PyPI. We would also be glad to share our notes with the Db2 connector projects if they are useful, for example filter pushdown into SQL, a `NOT NULL` vector column and a literal k for `FETCH APPROX`.

## Built with

ibm-db2, db2-vector-index, diskann, sql, sql-pl, python, ibm-db, langchain, langchain-db2, haystack, ollama, nomic-embed-text, qwen3, react, typescript, fastapi, vite, tailwindcss, streamlit, pytest, rank-bm25, matplotlib, docker, docker-compose, github-codespaces, osv

---

## Evidence map (do not paste)

| Claim | File |
|---|---|
| 26,842 raw records | `needle/docs/evidence/data_validation_clp.txt` (ADV_RAW 26842) |
| 26,210 searchable rows, index chosen at 26,210 not at 3,000, APPROX 4.8 ms vs EXACT 72.3 ms, overlap 0.995 | `needle/docs/evidence/g1_vector_index.md` |
| Shared plan, FF 0.495, 21 candidates, 2.05 rows / 0.205, 36 of 170 zero rows, literal control 0.765, router held-out results, 170/170 oracle, 0 leaks, 35 passed, demo embargo case, `CREATE MASK` on CLOB rejected | `needle/docs/evidence/rcac_real.md`, `rcac_demo_case.txt`, `rcac_raw/pytest_all_after_demo_embargo.log` |
| Topic-clustered visibility: NDL_P10 0 rows for 130 of 170 queries with APPROX 10; router held-out 10 of 10 rows, 0 leaks in every cell | `needle/docs/evidence/rcac_real.md` ("Correlated visibility", lines 105-135), `needle/eval/results/rcac_correlated.json` |
| EXACT 16 ms at 10%, 146 ms at 100% | `needle/docs/evidence/rcac_real.md` finding 7 |
| Postings 1,944,102; BM25 parity 30/30; JSON_TABLE `strict $`; `letsary`; 29/30 vs 0/30 | `needle/docs/evidence/triage_explain.md`, `fix_c1_h2.txt` |
| Text Search not configured (`CIE0774E`) | `needle/docs/evidence/text_search_probe.md` |
| Stale port forward (`SQL30081N`), SSH tunnel, 3k-row tunnel load hung | `needle/docs/PLAN.md` section 11 (decision log, 19:15 and 19:45) |
| Transaction log filled by one 26k-row `INSERT ... SELECT`; 2,000-row committed batches | `needle/eval/run_eval.py` line 409, `needle/docs/evidence/review_claude.md` M4, `needle/docs/CONNECTOR_NOTES.md` |
| `SQL0968C`, ~8 GB, +26.8 MB per search, commit releases it | `needle/docs/CONNECTOR_NOTES.md` note 6, `connector_f3f4_run1_disk_full.txt`, `connector_tempspace.txt` |
| `SQL0901N` at 99/100 for 1 of 450 vectors; retry; depths 50/128 | `needle/docs/evidence/eval_sql0901n_fetch_approx.md`, `triage_router_explain.md`, `needle/docs/PLAN.md` decision 20:20 |
| `SQL0901N` inside TRIAGE at depths 50 and 64, answered at 128; 0 errors in 450 queries | `needle/docs/evidence/eval_final.md` (run `20261110T024304Z`; relevance table "errors" column) |
| Paraphrase hit@10 0.453 / 0.360 / 0.340; named/masked 0.993 / 1.000 as upper bounds; pooled p50 TRIAGE 53.5 ms, BM25 43.4 ms | `needle/docs/evidence/eval_final.md` (canonical run `20261110T024304Z`, NDL_SENIOR, RCAC active) |
| Slowdown before the fix: BM25 p50 45.3 → 265.3 ms over all 450 queries (5.9x) | `needle/eval/results/20261110T014804Z.json` and `20261110T022457Z.json` (`relevance/bm25/all/latency_p50_ms`) |
| Cause (full posting-index scan, 1.94M entries) and fix (`LATERAL` per-term probe): BM25 244.8 → 27.2 ms, TRIAGE 256.4 → 34.4 ms, 30 queries, identical top-10, 60 tests passed | `needle/docs/evidence/rcac_posting_overhead.md`, `explain/kw_rcac_before.exfmt.txt`, `explain/kw_rcac_after.exfmt.txt` |
| BM25 statistics side channel and fix; difference attack test | `needle/docs/evidence/fix_c1_h2.txt`, `rcac_real.md` Limits, `review_claude.md` C1 |
| Verifier hardening, sign-in | `needle/docs/evidence/fix_h1.txt` |
| Seven connector notes | `needle/docs/CONNECTOR_NOTES.md` |
| Haystack component | `needle/src/needle/haystack_component.py`; `tests/test_haystack_component.py` 11 passed (run 2026-11-09 ~22:10 CST); `haystack-ai==3.4.1` in `requirements.txt` |
