# NEEDLE — Adversarial Risk Register and Fallback Tree

Risk ranking reflects nine remaining build hours, *not* generic enterprise risk.

| Priority | Risk | Why it can destroy the entry | First evidence / trigger | Action / hard stop |
|---|---|---|---|---|
| CRITICAL | Docker/WSL absent on Windows | Real Db2 is compulsory; large image and reboot may consume multiple hours | `docker info`, `wsl --status`, actual `db2level` | Start immediately; after 1h45 of build time, eliminate all nonessential features. No SQLite substitute masquerading as Db2. |
| CRITICAL | Eligibility conflict for two developers | Organizer public rules say solo; FAQ defers to official rules | Written organizer clarification absent | Get organizer reply, preserve attribution, don't claim team eligibility based on GitHub template. |
| HIGH | 12.1.5 vector index requires exact prerequisites | No native ANN would weaken headline differentiation | SQLSTATE on create, catalog, EXPLAIN | After 60m limit, ship exact vector + lexical RRF and disclose ANN unverified. |
| HIGH | Native index omitted by optimizer despite APPROX | Judges are Db2 engineers and will see through a false DiskANN claim | EXPLAIN plan lacks vector index | Show index exists vs plan used as two separate statuses; use measured exact-vs-approx without speedup claim. |
| HIGH | 768D constructor/driver CLOB binding fails | Native VECTOR queries cannot execute | SQLSTATE on `VECTOR(CAST(? AS CLOB(32K)),768,FLOAT32)` | Test on first single-row insert and query; verify IBM driver parameter types. Use verified alternative, not string concatenation or truncation. |
| HIGH | Missing Haystack framework integration | Event site requires at least one approved framework | No functioning Pipeline test | Implement trivial but genuine `@component` Pipeline early. No cosmetic import. |
| HIGH | Scope overwhelm from RRF + frontend + LLM + benchmark | Deadline is absolute | G3/G4 delayed | Drop LLM summary, multi-page UI, OSV ingestion, analytics polish before dropping core SQL. |
| HIGH | Advisories labeled synthetic but sold as real CVE scanner | Trust and ethical credibility issue | fabricated CVE, real severity unsupported | Use `DEMO-...` ids and banner. Only real sourced external records can claim actual CVE. |
| MEDIUM | Semantic retrieval shows no advantage on 80-row corpus | Demo misses killer moment | predeclared query test no improvement | Show truthful comparison; use a *predeclared* query that has real ranking differences, report all held-out query failures. |
| MEDIUM | Exact release join misinterpreted | Missing range coverage misreported as safe | `NOT_CONFIRMED` rendered safe | Explicit `UNKNOWN_COVERAGE` / `NOT_CONFIRMED`, never SAFE. |
| MEDIUM | Benchmark conflates ANN recall and relevance | Scientifically invalid claims | same metric label on two methods | Maintain separate `ann_recall@10` exact-nearest baseline and annotated relevance recall. |
| MEDIUM | Small corpus makes optimizer choose exact | Index may be valid but too costly | EXPLAIN | Report `index_not_selected`; no forced benchmark manipulation. |
| MEDIUM | Package names/license issues | IP or repo validation failure | no license, imported dependencies | Use original code, cite dependencies, valid software license; no copying competitor code. |
| MEDIUM | SQL RRF CTE syntax incompatibility | Entire single SQL query fails | SQL0104N / SQLSTATE | Minimal lexical and exact vector in separate Db2 queries, aggregate RRF in SQL second stage; label implementation honestly. |
| MEDIUM | Python 3.13 package incompatibility | Wheels break startup | import errors | `ibm_db` project advertises 3.13 wheels; verify. Use Python 3.12 only if needed and log exact versions. |
| MEDIUM | Secret leakage | Disqualification | tracked .env or config | .gitignore, `.env.example`, staged-file audit, secret scan. |
| MEDIUM | Missing mandatory submission surface | Valid technical project not judged | PR exists but no form confirmation | Freeze coding by G8; submit PR + Google Form first, Devpost project/video per rules, LinkedIn optional unless confirmed mandatory. |

## Stop/go ladder
1. **No live Db2** -> cannot claim compliant project; fix first.
2. **Db2 but no vector type** -> wrong version; correct runtime, not model artifacts.
3. **Vector exact works, index fails** -> ship exact+keyword+DB2 provenance with explicit limitation; reconsider pitch without DiskANN claim.
4. **Index created, EXPLAIN no index** -> document and show true result; never "3x faster" based on IBM marketing.
5. **Search works, RRF single query fails** -> two Db2 queries and deterministic RRF with metadata; no fake SQL fusion claim.
6. **Backend works, frontend unfinished** -> prioritize one clean working browser screen with actual requests.
7. **Build works, deadline near** -> stop coding and submit all mandatory surfaces.

## Reviewer attack questions
- "Why not just Snyk/Socket?" Not a replacement: a demonstration of retrieval systems engineering in IBM Db2 with measurable ranking and applicability.
- "How large is the benchmark?" State true corpus and queries; small synthetic workload does not predict production quality.
- "Is the native index really used?" Show recorded EXPLAIN, not a code comment.
- "Is it a true hybrid SQL query?" Show SQL, query plan and results; otherwise describe separate steps accurately.
- "Does the model decide whether package vulnerable?" No, only exact relational release matching, with unknown as unknown.
- "What is the trust boundary?" Public visibility predicate in all retrieval and detail paths; untrusted SBOM text never executes commands.
- "Two authors?" Show written eligibility confirmation or state unresolved; do not substitute your interpretation of FAQ.

## Explicit UNVERIFIED claims
- Actual WSL/Docker installation status on builder's machine at execution time.
- Actual `icr.io/db2_community/db2:12.1.5.0` image pull and runtime success in this specific host.
- Db2 exact acceptance of the provided long `VECTOR(CAST(? AS CLOB(32K)),768,FLOAT32)` Python bound param on this driver.
- Single SQL CTE query eligibility for ANN index selection.
- Any project-specific benchmark result, latency, recall, test pass or audience impact.
- Whether the organizer grants written exception to solo rule.
- Whether LinkedIn is obligatory for this Devpost challenge; verify current Updates/Rules page.
