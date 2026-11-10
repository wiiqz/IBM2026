# Form answers (drafts)

Both Google Forms need a Google sign-in, so their exact fields are UNKNOWN. The answers below cover the fields
these forms usually ask for; copy the matching block into each field. Placeholders: [TEAM NAMES], [EMAIL],
[PR_URL], [VIDEO_URL], [REPO_URL], [LINKEDIN_POST_URL].

- Form A: https://forms.gle/n8GQL4tg7Yzftwu39 (linked from the event site, Devpost Resources, Unstop and SKILL.md).
- Form B: https://forms.gle/ZjsLaFU5zAYJonwk9 (labelled "Main Project Submission Form" on Luma; a different form).
- Fill both with the same answers.

---

## Common fields (both Google Forms)

**Full name:** [TEAM NAMES]

**Email:** [EMAIL]

**GitHub username:** KnigguKniggu-droid

**Team name:** NEEDLE

**Project title:** NEEDLE — permission-aware hybrid retrieval in Db2

**Project slug / folder:** `submissions/needle/`

**One-paragraph description:**

NEEDLE is a vulnerability-triage tool that finds which of your services a vague security advisory hits, with all of the retrieval done inside IBM Db2 12.1.5. One SQL PL call runs BM25 keyword ranking in plain SQL and a `FETCH APPROX` search on a DiskANN vector index over 26,210 real OSV PyPI advisories, and fuses both rankings with reciprocal rank fusion in a single statement. Db2 row and column access control applies to both legs, and each analyst signs in as their own Db2 user, so embargoed advisories stay hidden without any filtering in the application. An exact version join and a `BUSINESS_TIME` temporal table then say which services are affected and since when, and a local model writes a short memo that a verifier checks against the SQL results. We also measured what row permissions do to approximate search: a user who sees 10% of the rows got 2.05 of 10 rows on average from `FETCH APPROX FIRST 10`, because all users share one plan with one candidate estimate. NEEDLE routes each user to a deeper approximate search or an exact scan, which restored recall@10 to 1.000 for that user on 89 held-out queries, with 0 permission leaks.

**Short description (if the form limits it to 1–2 sentences):**

NEEDLE is a vulnerability-triage tool that fuses BM25 keyword search and DiskANN vector search in one IBM Db2 SQL statement under row-level permissions, then joins a temporal SBOM to show which services are affected and since when. We measured that row permissions cut approximate-search results to about 2 of 10 rows for a low-visibility user, and NEEDLE's per-user routing restores full recall on held-out queries.

**GitHub PR URL:** [PR_URL]

**Demo video URL:** [VIDEO_URL]

**Source repository URL (if asked):** [REPO_URL]

**Live demo URL (if asked):** None. NEEDLE runs locally against your own Db2 (instructions in the README).

**Technologies used:**

We built NEEDLE in Python and SQL / SQL PL on IBM Db2 Community Edition 12.1.5.0 in Docker, run in a GitHub Codespace. We connect with `ibm_db` 3.3.0 using parameterised SQL, wrap the Db2 procedure as a LangChain `BaseRetriever` and as a Haystack component, and use `langchain-db2` as a measured baseline. Models run locally with Ollama: `nomic-embed-text` for 768-dimension embeddings and `qwen3:14b` for the cited memo. The UI is Streamlit, and the tests and evaluation use pytest, `rank-bm25` and matplotlib.

**AI framework used (if it is a single choice):** LangChain

**Model provider / model:** Ollama (local): nomic-embed-text, qwen3:14b

**IBM Db2 features used:**

NEEDLE uses Db2 for the retrieval, the permissions and the impact analysis, not as a blob store. The features are:
- `VECTOR(768, FLOAT32) NOT NULL` and `VECTOR_DISTANCE(..., COSINE)`
- `CREATE VECTOR INDEX ... WITH DISTANCE COSINE` (DiskANN) with `FETCH APPROX` and `FETCH EXACT`
- BM25 keyword ranking in plain SQL (a SQL table function over a postings table)
- A SQL PL procedure that fuses both rankings with reciprocal rank fusion (`RANK() OVER`, `FULL OUTER JOIN`)
- Row and column access control (`CREATE PERMISSION` with a `SESSION_USER` lookup, `CREATE MASK`)
- An application-period temporal table (`PERIOD BUSINESS_TIME`, `FOR BUSINESS_TIME AS OF`)
- Least-privilege analyst users (SELECT and EXECUTE only) and `REVOKE` on internal statistics tables
- JSON in Db2: raw OSV JSON in a CLOB with SHA-256, query terms passed as one bound JSON array and expanded with `JSON_VALUE` in a recursive CTE
- `EXPLAIN`, `db2exfmt`, `MON_GET_PKG_CACHE_STMT`, `EXPLAIN_FROM_SECTION` and section actuals to prove the access path per user

**Db2 edition / environment:** Db2 Community Edition 12.1.5.0 on Docker (`icr.io/db2_community/db2:12.1.5.0`), GitHub Codespace, Linux x86-64.

**Db2 connector / driver:** `ibm_db` 3.3.0 (parameter markers for every value) + LangChain retriever over a Db2 SQL PL procedure.

**Key result (if the form asks for impact or results):**

NEEDLE's headline result is a measurement of vector search under Db2 row permissions. With `FETCH APPROX FIRST 10`, a user who may see 10% of the rows got 2.05 rows on average (recall@10 0.205), and 36 of 170 queries returned no rows. Our per-user router, fitted on dev queries only, restored recall@10 to 1.000, 1.000, 1.000, 0.988 and 0.987 at 10, 25, 50, 75 and 100% visibility on 89 held-out queries, with 10 of 10 rows for every query and 0 permission leaks. For retrieval quality, the realistic test is our paraphrase slice of 150 synthetic chat-style queries: there, hybrid search reached recall@10 0.453, against 0.360 for vector search alone and 0.340 for BM25 alone, measured as a real analyst user with row access control active. On the named and masked slices, which copy text from a correct advisory and are upper bounds, hybrid recall@10 was 0.993 and 1.000. Hybrid triage answers in 53.5 ms median per query inside Db2 with row permissions active, after we fixed a keyword-search plan that scanned the whole posting index under the permission (BM25 244.8 → 27.2 ms on 30 queries, identical results).

**Did you share on LinkedIn? (if asked):** Yes: [LINKEDIN_POST_URL]

**Anything else (optional):**

NEEDLE's README has copy-paste SQL that shows what exists in Db2, and every number links to a run file in `docs/evidence/` or `eval/results/`. We also wrote short notes on Db2 behaviours we observed while building on the vector features (`docs/CONNECTOR_NOTES.md`), each with a repro script.

---

## Unstop Round 2 ("Build & Final Submission")

**Project title:** NEEDLE — permission-aware hybrid retrieval in Db2

**GitHub PR URL:** [PR_URL]

**Demo video link:** [VIDEO_URL]

**Project description (if a text field is shown):** use the one-paragraph description above.

**Screenshots (upload in this order; file names from SCREENSHOTS.md):**
1. `01_triage_ranking.png`: the app's main view with keyword, vector and hybrid rankings and the "services affected now" banner.
2. `02_exposure_memo.png`: affected services with "exposed since" dates and the verified memo.
3. `03_rcac_senior_vs_junior.png`: the same query as NDL_SENIOR and NDL_JUNIOR; the embargoed advisory appears only for the senior analyst.
4. `04_rcac_recall_chart.png`: recall@10 and rows returned vs the visible share of rows, with and without the router.
5. `05_explain_vector_index.png`: the db2exfmt plan with `IXSCAN` on `VECIDX: NEEDLE.ADV_DOC_VIX`.
6. `06_shared_plan_cache.png`: one package-cache entry for five users.
7. `07_verify_db2_clp.png`: the catalog and row-permission checks from "Steps to verify Db2 integration".
8. `08_tests_passing.png`: the RCAC and verifier test runs.

**Round 1 PPT (if Unstop still asks for it):** status UNKNOWN; not drafted here.
