# NEEDLE — primary-source research and implementation references

**Prepared:** 2026-11-09 (US Central). **Target:** IBM Db2 LUW 12.1.5 Community Edition on Linux x86_64; Python orchestration; Streamlit; DB-native RCAC and vector retrieval.

**Source status legend**
- **VERIFIED DOCUMENT** = the cited URL and its relevant content were found via web search and/or retrieved source results. This does **not** mean the SQL or feature was executed against your VECDB instance.
- **VERSION-SHARED** = official IBM documentation exists but the link belongs to another supported IBM product, Db2 11.x, or a generic `12.1.x` release family. Check Db2 12.1.5-specific behavior before relying on syntax.
- **UNVERIFIED RUNTIME** = source can explain syntax, but NEEDLE has not demonstrated that operation on VECDB.
- **EXTERNAL / RESEARCH** = third-party academic or product source; may suggest an experiment but does **not** document Db2 internals.
- **BUILDER OBSERVATION** = user-reported experiment; not independently reproduced by this document.

## A. Db2 12.1.5 vector features and optimizer

1. **IBM — Vector indexes, Db2 12.1.x** — https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-vector  
   **VERIFIED DOCUMENT.** Native Db2 vector index behavior, requirements, index usage and limits. Anchor the distinction between *index exists* and *optimizer chose it*. For the final report, supply actual `CREATE VECTOR INDEX` DDL that ran in VECDB; the precise directly linkable CREATE VECTOR INDEX SQL-statement page was **UNVERIFIED**, despite the feature itself being documented and builder-executed.

2. **IBM — ANN index implementation** — https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-ann-index-implementation  
   **VERIFIED DOCUMENT.** Graph-based index lifecycle and auxiliary structures; motivates keeping a frozen corpus, rebuilding stats and avoiding post-index DML while benchmarking. Do not assert this is exactly Microsoft DiskANN unless IBM's documented implementation supports the characterization.

3. **IBM — FETCH clause** — https://www.ibm.com/docs/en/db2/12.1.x?topic=subselect-fetch-clause  
   **VERIFIED DOCUMENT.** `FETCH APPROX` versus `FETCH EXACT`, optimizer cost rules, small tables, nullable vectors, metric equality, `RUNSTATS`, `SEARCH_LIST_SIZE` and `SEARCH_BEAM_WIDTH`. `SEARCH_LIST_SIZE`: documented default 50, range 1–200; beam width: default 2, range 2–64. **Using APPROX does not prove ANN index use.** SQL with a parameter marker for K may produce a different plan: specific failure-to-index behavior is **BUILDER OBSERVATION**, not a universal rule proved by this page.

4. **IBM — Vector values/type** — https://www.ibm.com/docs/en/db2/12.1.x?topic=list-vector-values  
   **VERIFIED DOCUMENT.** Db2 vector values, element types and dimension limitations. Your 768-dimensional FLOAT32 + 32 KB setup is **BUILDER VERIFIED**; do not imply 4 KB default tablespaces are enough.

5. **IBM — VECTOR constructor** — https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector  
   **VERIFIED DOCUMENT.** Conversion of supplied numeric data into typed vectors. For a 768-FLOAT32 dimension, validate length and representation before insert and search.

6. **IBM — VECTOR_DISTANCE scalar function** — https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector-distance  
   **VERIFIED DOCUMENT.** Metrics and consistency between indexed metric and query metric; verify the exact distance names/typing on your installation. Distances are retrieval scores, not vulnerability probabilities.

7. **IBM — VECTOR_SERIALIZE scalar function** — https://www.ibm.com/docs/en/db2/12.1.0?topic=functions-vector-serialize  
   **VERSION-SHARED (12.1.0 page).** Serialization function to inspect/export vector values. Optional in production; use only if accepted in 12.1.5.

8. **IBM — What's new in Db2 12.1.5** — https://www.ibm.com/docs/en/db2/12.1.x?topic=1215-highlights-db2  
   **VERIFIED DOCUMENT.** Version context and release availability; do not use 12.1.5-specific syntax with an older CE container by accident.

9. **IBM Engineering — Vector index search accuracy controls** — https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2026/02/09/vector-indexes-in-db2-understanding-the-search-acc  
   **VERIFIED DOCUMENT (IBM community engineer).** Useful explanation for search-list and beam width tradeoffs; blog may discuss pre-GA behavior, so defer to your installed release and its official documentation.

10. **IBM Engineering — Vector index performance** — https://community.ibm.com/community/user/blogs/zach-hoggard/2026/06/19/vector-indexes-in-db2-mastering-vector-index-perfo  
    **VERIFIED DOCUMENT (IBM community engineer).** Index build, graph tuning/performance; record any settings actually applied and don't invent speed gains.

11. **IBM Engineering — Vector indexes early preview** — https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2025/10/04/vector-indexes-in-db2-an-early-preview  
    **VERIFIED DOCUMENT, PRE-RELEASE / NOT AUTHORITATIVE FOR 12.1.5.** Useful for why the feature exists, not as a specification of GA syntax.

12. **IBM — EXPLAIN facility** — https://www.ibm.com/docs/en/db2/12.1.x?topic=optimization-explain-facility  
    **VERIFIED DOCUMENT.** How to capture access paths. Save SQL text, identity, plan ID, index object/operator type, estimated cardinality, and plan artifact SHA-256.

13. **IBM — db2exfmt explain formatter** — https://www.ibm.com/docs/en/db2/12.1.x?topic=commands-db2exfmt-explain-table-format  
    **VERIFIED DOCUMENT.** CLI plan formatting. Test the exact command, schema permissions and invocation from Codespace. Never infer index selection from fast latency alone.

14. **IBM — Section EXPLAIN vs statement EXPLAIN** — https://www.ibm.com/docs/en/db2/12.1.x?topic=information-differences-between-section-explain-explain-statement-output  
    **VERIFIED DOCUMENT.** Explain/section-cache discrepancies; plan captured from a differently parameterized statement or authorization identity may not reflect the executed plan.

## B. Db2 RCAC and authorization

15. **IBM — Row and column access control overview** — https://www.ibm.com/docs/en/db2/12.1.x?topic=security-row-column-access-control-rcac  
    **VERIFIED DOCUMENT.** Native RCAC operates in the database engine. A Python `WHERE viewer_id=?` filter alone is *not* an RCAC experiment. Explicitly test the procedure under each caller's actual database authorization.

16. **IBM — CREATE PERMISSION statement** — https://www.ibm.com/docs/en/db2-warehouse?topic=statements-create-permission  
    **VERSION-SHARED (Db2 Warehouse documentation).** Row permission predicates and enablement. The specific Db2 12.1.x LUW CREATE PERMISSION deep link was **UNVERIFIED**. Obtain final DDL from the working VECDB instance or 12.1 SQL reference; verify SECADM and `SESSION_USER` semantics before demonstration.

17. **IBM — CREATE MASK statement** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-mask  
    **VERIFIED DOCUMENT.** Column masking; `AT READ`/`AT RESULT` behavior may affect expressions. Do not mix the mask ablation into the row-permission RCAC experiment; treat it as separate work.

18. **IBM — ALTER TABLE statement** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-alter-table  
    **VERIFIED DOCUMENT.** `ACTIVATE ROW ACCESS CONTROL` and `ACTIVATE COLUMN ACCESS CONTROL` DDL. Confirm a permission exists, is enabled, and applies to the actual base table before benchmarking.

19. **IBM — GRANT database authorities** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-grant-database-authorities  
    **VERIFIED DOCUMENT.** SECADM / security administrator setup. **SECADM is used to administer RCAC; it is not an automatic all-row bypass for benchmark queries.** Restrict researchers from accidentally testing with another effective identity.

20. **IBM — RCAC concepts and rule creation** — https://www.ibm.com/docs/en/db2-as-a-service?topic=rcac-row-column-access-control-rules  
    **VERSION-SHARED (Db2-as-a-service).** Useful conceptual walkthrough of row permissions versus masks; not a substitute for LUW 12.1.5 syntax verification.

21. **IBM — Verify group or user in row-permission rules** — https://www.ibm.com/docs/en/db2/11.1?topic=masks-verify-group-user  
    **VERSION-SHARED (11.1).** Historical examples of identity/context checks; avoid copying them without running on 12.1.5. Prefer independent login identities verified by `SESSION_USER` and the result set returned by a test query.

22. **IBM — DECLARE GLOBAL TEMPORARY TABLE statement** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-declare-global-temporary-table  
    **VERIFIED DOCUMENT.** `SESSION` temporary tables, `ON COMMIT PRESERVE ROWS`, and session-specific scope. **Critical security warning:** An intermediate table populated from a protected table does not itself automatically inherit the original RCAC. Materialize *only authorized results*, never global candidates subsequently filtered in Python. Test security again through stored procedures and temp-table results.

## C. Db2 valid-time / application-period temporal history

23. **IBM — BUSINESS_TIME period** — https://www.ibm.com/docs/en/db2/12.1.x?topic=tables-business-time-period  
    **VERIFIED DOCUMENT.** App-defined valid-time start/end, inclusion/exclusion, `WITHOUT OVERLAPS`. Model when a package version is known to be in an SBOM, not when an advisory was publicly discovered.

24. **IBM — Application-period temporal tables** — https://www.ibm.com/docs/en/db2/12.1.x?topic=tables-application-period-temporal  
    **VERIFIED DOCUMENT.** `PERIOD BUSINESS_TIME`, temporal queries and validity semantics. Distinguish from system-period/transaction-time history. An `exposed since` claim requires intersecting possession intervals with an accurate affected-version determination.

25. **IBM — CREATE TABLE syntax** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-table  
    **VERIFIED DOCUMENT.** Validate temporal table DDL, period columns, constraints and period-qualified unique keys.

26. **IBM — UPDATE syntax including FOR PORTION OF BUSINESS_TIME** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-update  
    **VERIFIED DOCUMENT.** Valid-time updates that split/adjust temporal intervals. Audit adjacent intervals, overlaps and repeated imports with regression fixtures.

27. **IBM — Querying application-period temporal tables** — https://www.ibm.com/docs/en/db2-warehouse?topic=aptt-querying  
    **VERSION-SHARED (Db2 Warehouse).** `FOR BUSINESS_TIME AS OF`, temporal interval query patterns. Test before using in presentation.

28. **IBM — Creating application-period temporal tables** — https://www.ibm.com/docs/en/db2/11.5.x?topic=aptt-creating  
    **VERSION-SHARED (11.5).** Working design examples; revalidate 12.1.5 SQL and limitations.

29. **IBM — Setting application time** — https://www.ibm.com/docs/en/db2/12.1.0?topic=tables-setting-application-time  
    **VERSION-SHARED (12.1.0).** `CURRENT TEMPORAL BUSINESS_TIME` session context; don't introduce unless it helps the supported demo.

## D. JSON parsing / SQL0104N diagnosis

30. **IBM — JSON_TABLE table function (Db2 LUW 11.1)** — https://www.ibm.com/docs/en/db2/11.1.0?topic=functions-json-table  
    **VERSION-SHARED (11.1).** Confirms IBM LUW form `JSON_TABLE(json-expression [FORMAT JSON], 'strict $' COLUMNS (...) ERROR ON ERROR)` and column PATH behavior. A minimal, scalar projection example appears below. It is a *documented pattern*, **UNVERIFIED RUNTIME on VECDB**.

31. **IBM — JSON_TABLE (Db2 as a service)** — https://www.ibm.com/docs/en/db2-as-a-service?topic=functions-json-table  
    **VERSION-SHARED.** IBM example uses `JSON_TABLE(E.jsondoc, 'strict $' COLUMNS (...) ERROR ON ERROR) AS U`. This is safer to replicate for scalar object fields than complex array expansion without a smoke test.

32. **IBM — JSON_VALUE (12.1.x)** — https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-json-value  
    **VERIFIED DOCUMENT.** Simpler scalar JSON attribute extraction when the application only needs one field and not row expansion.

33. **IBM Community — Problems using JSON_TABLE on Db2 11.5** — https://community.ibm.com/community/user/discussion/problems-using-json-table-on-db2-v115  
    **VERSION-SHARED, community discussion.** Reported array-expansion parsing errors in older LUW Db2. Does **not** prove the same restriction exists in 12.1.5.

34. **IBM support — JSON_TABLE join to column-organized table issue in Db2 12.1** — https://www.ibm.com/mysupport/s/defect/aCIgJ000000LH2fWAG/dt505376?language=en_US  
    **VERIFIED DOCUMENT (2026-10-26).** Known SQL0901N bug for VARCHAR JSON_TABLE output joined against a column-organized table, not necessarily the user's SQL0104N issue; don't conflate them. Avoid this join form in the deadline build.

35. **IBM — Built-in SQL functions (12.1.x)** — https://www.ibm.com/docs/en/db2/12.1.x?topic=sql-built-in-functions  
    **VERIFIED DOCUMENT.** Function index. 12.1.5 `JSON_TABLE` array-wildcard grammar on *your* instance remains **UNVERIFIED RUNTIME**.

**Db2 12.1 LUW syntax: IBM support-derived scalar smoke test (run independently and capture SQLCODE + SQLSTATE):**

```sql
SELECT J.NAME
FROM JSON_TABLE(
  '{"NAME":"Mozart"}' FORMAT JSON,
  'strict $'
  COLUMNS (
    NAME VARCHAR(255) PATH '$.NAME'
  )
  ERROR ON ERROR
) AS J;
```

This is the `JSON_TABLE` expression in IBM's [Db2 12.1 LUW known-issue reproduction](https://www.ibm.com/mysupport/s/defect/aCIgJ000000LH2fWAG/dt505376?language=en_US), **without** its separate column-organized-table JOIN (the JOIN triggers a different SQL0901N defect). **Expected only if executed successfully:** one row `NAME='Mozart'`. This is a **documented 12.1 expression, UNVERIFIED RUNTIME on VECDB**. The user's `SQL0104N` against `'strict $.a[*]'` could be due to the parser grammar, scope/context, data type, or a different unexpected token; a bare SQLCODE without offset does not identify the cause. If even scalar test fails, skip `JSON_TABLE` for ingestion, normalize nested OSV JSON arrays in Python and insert into relational tables. This is a legitimate scope reduction.

## E. SQL PL, dynamic statements, procedures and temp tables

36. **IBM — CREATE PROCEDURE (SQL)** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-procedure-sql  
    **VERIFIED DOCUMENT.** `LANGUAGE SQL`, `DYNAMIC RESULT SETS n`, routine attributes, and procedure scope; required if RRF is actually implemented in one stored SQL procedure.

37. **IBM — Procedure result sets** — https://www.ibm.com/docs/en/db2/12.1.x?topic=procedures-procedure-result-sets  
    **VERIFIED DOCUMENT.** Result-set cursors stay open when procedure returns (`WITH RETURN TO CALLER`/`TO CLIENT` as applicable). Ensure the client API fetches returned result sets properly.

38. **IBM — OPEN cursor** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-open  
    **VERIFIED DOCUMENT.** `OPEN cursor USING ...` dynamic prepared statement parameter values. Confirm SQL PL routine declaration order and exact syntax via a throwaway smoke procedure before writing the whole retriever.

39. **IBM — EXECUTE statement** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-execute  
    **VERIFIED DOCUMENT.** Executing prepared SQL statements. For a result-producing SELECT, typically use a declared cursor over the prepared statement and OPEN rather than expect `EXECUTE` itself to stream a result set.

40. **IBM — PREPARE statement** — https://www.ibm.com/docs/en/db2-as-a-service?topic=statements-prepare  
    **VERSION-SHARED (Db2 as a service).** SQL PL dynamic statement binding; SQL identifier names are not bound like values. For NEEDLE, prefer static SQL and bound vector/query values, with finite whitelisted templates for `FETCH` literal K.

41. **IBM — DECLARE CURSOR (11.5.x LUW)** — https://www.ibm.com/docs/en/db2/11.5.x?topic=statements-declare-cursor  
    **VERSION-SHARED.** Declaring a cursor `WITH RETURN TO CALLER FOR <statement_name>`; verify against 12.1.5. Do not copy Db2 for z/OS procedure snippets verbatim and claim they are Db2 LUW-compatible.

42. **IBM — DECLARE GLOBAL TEMPORARY TABLE (12.1.x)** — https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-declare-global-temporary-table  
    **VERIFIED DOCUMENT.** Scope/commit behavior. Never create a permissive global session cache of embargoed candidates and claim RCAC guards it. Note that an SQL PL procedure using an unscoped elevated-definer context can invalidate the entire security demonstration.

**Dynamic SQL PL pattern — NOT EXECUTED, use only after a one-minute Codespace smoke test:**

```sql
CREATE PROCEDURE NEEDLE.PING_RESULTS(IN P_LIMIT INTEGER)
  LANGUAGE SQL
  DYNAMIC RESULT SETS 1
BEGIN
  DECLARE STMT STATEMENT;
  DECLARE C1 CURSOR WITH RETURN TO CALLER FOR STMT;
  PREPARE STMT FROM 'SELECT ADVISORY_ID FROM NEEDLE.ADVISORIES ORDER BY ADVISORY_ID FETCH FIRST 10 ROWS ONLY';
  OPEN C1;
END
```

This illustrates returning an open result-set cursor without dynamic parameter interpolation. It is **UNVERIFIED RUNTIME** and intentionally leaves `P_LIMIT` unused; before implementing parameter-dependent results, design safe static branches for literal K, or verify `OPEN C1 USING ...` with an independent smoke test. One deliberately fixed `K=10` can be completely sufficient for the final hackathon demo.

## F. Filtered ANN research (not equivalent to IBM Db2 implementation)

43. **Gollapudi et al. — Filtered-DiskANN** — https://harsha-simhadri.org/pubs/Filtered-DiskANN23.pdf  
    **EXTERNAL / RESEARCH.** Predicate-aware graph search for approximate neighbors; use to formulate prefilter/postfilter tradeoffs. **Do not say Db2 uses this implementation.**

44. **Patel et al. — ACORN** — https://arxiv.org/abs/2403.04871  
    **EXTERNAL / RESEARCH.** Predicate-agnostic filtered graph ANN with correlated and uncorrelated filters; motivates your three authorization distributions. **Do not imply Db2 implements ACORN.**

45. **Qdrant — Vector search filtering design** — https://qdrant.tech/documentation/search-design/vector-search-filtering/  
    **EXTERNAL / RESEARCH.** Filtering strategies and cardinality intuition; good discussion reference for why authorization fractions alone do not capture selectivity and neighbor correlation.

46. **Qdrant — Indexing and payload filters** — https://qdrant.tech/documentation/manage-data/indexing/  
    **EXTERNAL / RESEARCH.** Graph links, payload indexes and predicate handling; comparison to a vector DB with explicit filter-aware design.

47. **Weaviate — Filtering concepts / ACORN** — https://docs.weaviate.io/weaviate/concepts/filtering  
    **EXTERNAL / RESEARCH.** Pre-filtered ANN and ACORN strategy. Useful as an architectural comparator; do not assert the same plan behavior in IBM Db2.

48. **Microsoft — DiskANN project** — https://github.com/microsoft/DiskANN  
    **EXTERNAL / RESEARCH.** Foundational implementations and academic references; different codebase than IBM Db2 internal vector index unless independently documented.

49. **Microsoft Garnet — Filtered search design** — https://microsoft.github.io/garnet/docs/dev/filtered-search-design  
    **EXTERNAL / RESEARCH.** Adaptive filtered candidate-depth controls in another engine; inspiration for an experimental router, not a Db2 API reference.

## G. Scoring, RRF and prior-art check

50. **Robertson & Zaragoza — The Probabilistic Relevance Framework: BM25 and Beyond** — https://doi.org/10.1561/1500000019  
    **EXTERNAL / RESEARCH (Foundations and Trends in Information Retrieval, 2009).** BM25 term-frequency/length-normalization/IDF derivation and parameters. Build a conventional lexical baseline, test tie-breaking and token normalization, and disclose whether statistics reflect *all documents* or only **caller-visible** documents.

51. **Cormack, Clarke & Büttcher — Reciprocal Rank Fusion** — https://doi.org/10.1145/1571941.1572114  
    **EXTERNAL / RESEARCH (SIGIR 2009).** `RRF(d)=sum_i 1/(k+rank_i(d))`; fixed k such as 60 is a heuristic to register and not tweak after viewing evaluation results. Combine only results that are already authorized under the caller's security context.

52. **IBM Db2 AI Cookbook** — https://github.com/IBM/db2-ai-cookbook  
    **VERIFIED REPO.** Includes Db2 hybrid-search examples and retrieval evaluation patterns (e.g., `03-hybrid-search`). **Crucial prior art:** hybrid keyword+vector+RRF alone is not novel in Db2. NEEDLE's differentiator must be RCAC-index experiment, access-path evidence, authorized recall control, accurate version applicability and temporal exposure history.

## H. OSV, Python package identity and Nomic embeddings

53. **Open Source Vulnerabilities — OSV Schema** — https://ossf.github.io/osv-schema/  
    **VERIFIED DOCUMENT.** `affected[].package`, `affected[].versions`, `affected[].ranges`/events, IDs, aliases, ecosystem and modified/published fields. A MAL malicious-package report is not automatically equivalent to a conventional CVE exposure.

54. **Google / OSV.dev codebase and API** — https://github.com/google/osv.dev  
    **VERIFIED REPO.** Data sources and OSV service implementation. Archive the exact download URL, timestamp, SHA-256 and filter logic for the reported 26,842 PyPI documents; do not claim the builder's counts were independently reproduced.

55. **OSV public search and catalog** — https://osv.dev/list  
    **VERIFIED WEBSITE.** Search/ID details and official example advisory pages, with source links and versions. Useful for user-facing citations and source provenance.

56. **PEP 503 — Simple Repository API name normalization** — https://peps.python.org/pep-0503/  
    **VERIFIED STANDARD.** `re.sub(r'[-_.]+', '-', name).lower()` for normalized Python package names; use the same representation for SBOM and OSV advisory matching. PEP 503 is superseded for API format details by newer specifications but package-name normalization remains relevant.

57. **PEP 440 — Version identifiers / ordering** — https://peps.python.org/pep-0440/  
    **VERIFIED STANDARD.** Pre-/post-/dev releases, local versions and comparisons. Use Python `packaging.version.Version` and `packaging.specifiers` rather than lexicographical SQL comparisons or LLM inference.

58. **Python Packaging — Version Specifiers** — https://packaging.python.org/en/latest/specifications/version-specifiers/  
    **VERIFIED STANDARD.** Current packaging specification governing comparisons and specifier syntax. Be careful: OSV `affected[].versions` is an enumerated set; do not treat it as a universal statement that *only* those versions are affected when ranges exist.

59. **Nomic — nomic-embed-text-v1.5 model card** — https://huggingface.co/nomic-ai/nomic-embed-text-v1.5  
    **VERIFIED MODEL CARD.** `search_document:` vs `search_query:` task prefixes and dimensional variants. The installed Ollama model is named `nomic-embed-text`; its exact variant, digest and embedding-prefix handling are **UNVERIFIED** until inspected via `ollama show nomic-embed-text` and test vectors. Never silently mix embeddings from different model variants.

60. **LangChain BaseRetriever API** — https://reference.langchain.com/python/langchain-core/retrievers/BaseRetriever  
    **VERIFIED DOCUMENT.** Implement `_get_relevant_documents(...)` and use `invoke`; the retriever must query using the **caller's own Db2 connection** (or a verified secure identity propagation design), not a pooled privileged connection.

61. **LangChain IBM integration repository** — https://github.com/langchain-ai/langchain-ibm  
    **VERIFIED REPO.** IBM integrations, including Db2 connector code; see repository's exact package path/version rather than assuming native DiskANN index or hybrid RRF support.

62. **LangChain Db2 vector-store integration** — https://docs.langchain.com/oss/python/integrations/vectorstores/db2  
    **VERIFIED DOCUMENT.** Connector usage patterns. A custom `BaseRetriever` can combine direct Db2 SQL with LangChain execution while keeping all document retrieval in Db2.

63. **Haystack integration: IBM Db2 document store** — https://github.com/deepset-ai/haystack-integrations/blob/main/integrations/ibm-db-document-store.md  
    **VERIFIED REPO.** Official integration registration and package details. Including this reference satisfies comparative research; **if the implementation has pivoted to LangChain, do not add Haystack merely for checklist optics.**

## I. Visual design references: copy patterns, not artwork or proprietary UI

64. **OSV.dev advisory catalog** — https://osv.dev/list  
    **VERIFIED WEBSITE.** Copy the **information hierarchy**: searchable advisory IDs, package + ecosystem labels, clear source links, affected versions. For NEEDLE, advisory ID is always visible and copyable, with an OSV source link.

65. **GitHub Advisory Database** — https://github.com/advisories  
    **VERIFIED WEBSITE.** Copy filtered search interactions (severity, ecosystem, malware) and the transition from dense list to detailed advisory. Use Streamlit sidebar facets and a selected-result detail pane; do not copy GitHub branding.

66. **Snyk Vulnerability Database** — https://security.snyk.io/vuln  
    **VERIFIED WEBSITE.** Copy package/version applicability legibility: a compact risk header, affected-version evidence and references. Distinguish confirmed affected from unknown rather than assuming a match.

67. **Socket security alerts** — https://socket.dev/alerts  
    **VERIFIED WEBSITE.** Copy clear severity/badge design, concise issue signals, source attribution and time-aware triage order. Avoid making MAL reports appear to be unverified news without disclosure.

68. **Socket package details documentation** — https://docs.socket.dev/docs/socket-package  
    **VERIFIED DOCUMENT.** Copy the split between package facts, findings, evidence and dependencies; not its typography/images or code. Useful as a design reference for OSV evidence panels.

69. **IBM Carbon — Data table guidance** — https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines  
    **VERIFIED DOCUMENT.** Dense, consistent column widths, one clear primary action, sort/filter states, selection and pagination. Streamlit can approximate these principles without cloning Carbon components.

70. **IBM Carbon — Notifications** — https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines  
    **VERIFIED DOCUMENT.** Differentiate irreversible security failures, low-recall warnings, and benign informational messages. Do not turn all low recall into red vulnerability alerts.

71. **Snyk — Vulnerability detail report design article** — https://updates.snyk.io/vulnerabilities-detail-report-format-299625/  
    **VERIFIED WEBSITE.** A model for clean detail cards and evidence grouping. Pair affected package/version interval, detection rationale, advisory references, and severity without overloading the main results table.

## J. Recommended additional reading and anti-overclaim checklist

72. **IBM Db2 Developer Extension** — https://ibm.github.io/db2developerextension-about/  
    **VERIFIED DOCUMENT.** Optional GUI for inspecting live Db2 object metadata and query results; the actual backend already runs in Codespace and need not move to local Docker.

73. **IBM Db2Hack official submission repo** — https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission  
    **VERIFIED REPO.** Final authoritative file structure and validator (`scripts/validate_submission.py`). Re-check official README and FAQ at submission. **Not a technical performance source.**

74. **Organizer resources** — https://ibmdb2techxsummit.glbajajgroup.ac.in/resources  
    **VERIFIED WEBSITE.** Links to IBM community tutorials and connectors. Cite original IBM pages in the technical write-up rather than treating the organizer's resource index as feature documentation.

**Final engineer-level warning:** A statistically significant recall difference may still be caused by different optimizer plans, non-constant query templates, authorization-related cardinality misestimates, or candidate filtering order. Your measured result must label each cohort by the physical plan and count actual caller-visible rows. **No direct evidence is presented here that Db2 12.1.5 experiences an RCAC-specific ANN recall collapse.**
