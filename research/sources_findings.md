# Sources findings

Written by the SOURCES agent, 2026-11-09 (about 20:35 CST). Full citations: `C:\Users\ganes\IBM26\needle\docs\REFERENCES.md`.
Labels: **OBSERVED** = read on a page fetched this session. **UNVERIFIED** = not tested on our Db2 instance.

---

## F1. JSON_TABLE in Db2 12.1 LUW: correct syntax and why our attempt failed

### Documented form (OBSERVED, IBM docs 12.1 and 11.5, `topic=functions-json-table`)

```
JSON_TABLE( json-expression [FORMAT JSON | FORMAT BSON],
            'strict $'
            COLUMNS ( column-name data-type [PATH 'column-path'] [... ON EMPTY] [... ON ERROR], ... )
            [ERROR ON ERROR] ) AS correlation-name
```

- The row path appears in the syntax diagram only as the literal `'strict $'`. There is no `NESTED PATH` and no ordinality column.
- If `PATH` is omitted, the column path is `'$.'` + column name.
- Untyped parameter markers fail with SQLSTATE 42815; cast them.
- IBM example (the page omits a comma between `E` and `JSON_TABLE`):
  `SELECT U."id" ... FROM EMPLOYEE_TABLE E JSON_TABLE(E.jsondoc, 'strict $' COLUMNS("id" INTEGER, "firstname" VARCHAR(20), ...) ERROR ON ERROR) AS U`

### Form to use for one row per document (UNVERIFIED on our instance; test both comma variants)

```sql
SELECT U.P
FROM   MYTAB E,
       JSON_TABLE(E.DOC, 'strict $'
                  COLUMNS (P VARCHAR(40) PATH '$.p')
                  ERROR ON ERROR) AS U;
-- parameter form:
SELECT U.P
FROM   JSON_TABLE(CAST(? AS VARCHAR(4000)), 'strict $'
                  COLUMNS (P VARCHAR(40) PATH '$.p')
                  ERROR ON ERROR) AS U;
```

### Why `JSON_TABLE(doc, 'strict $.a[*]' COLUMNS (P VARCHAR(40) PATH '$.p') ERROR ON ERROR)` failed with SQL0104N
1. The row path `'strict $.a[*]'` is outside the documented grammar. Only `'strict $'` is shown. (OBSERVED in the diagram.)
2. The statement had no correlation name (`AS U`). The IBM example always has one. (Possible second cause; UNVERIFIED.)
3. A 2023 community thread shows the same class of error: `nested path 'strict $.array[*]'` → `SQL0104N An unexpected token ... was found`. An IBM Champion (Mark Barinstein) states that Db2 LUW "doesn't support the `nested path` json expression" and that he has "never seen any example" of `SYSIBM.JSON_TABLE` returning multiple rows. He calls the doc sentence "represents one or more rows" "a mistake in the documentation". (OBSERVED; community source, not IBM docs.)

**Conclusion:** `SYSIBM.JSON_TABLE` in Db2 LUW cannot expand a JSON array into rows. The plan "pass the query terms as one JSON array parameter and expand it with JSON_TABLE" (redteam A2) will not work as written.

### Options to expand a term list without string-built SQL (all UNVERIFIED on our instance; pick one and test in 5 minutes)
- **A. DGTT (recommended, fully documented).** `DECLARE GLOBAL TEMPORARY TABLE SESSION.QTERMS (TERM VARCHAR(128) NOT NULL) ON COMMIT PRESERVE ROWS NOT LOGGED WITH REPLACE;` then `executemany` insert, then join `POSTINGS` to `SESSION.QTERMS`. Prerequisite: a USER TEMPORARY tablespace must exist (else SQLSTATE 42727). The statement text stays fixed.
- **B. XMLTABLE over one XML parameter.** XMLTABLE is documented to return one row per repeating element: `XMLTABLE('$d/q/t' PASSING XMLPARSE(DOCUMENT CAST(? AS VARCHAR(32000))) AS "d" COLUMNS TERM VARCHAR(128) PATH '.') AS QT`. Escape `&`, `<`, `>` in terms before building the XML value.
- **C. Fixed-arity markers.** `WHERE TERM IN (?, ?, ..., ?)` with a fixed 32 markers, padded with NULL. The SQL text never changes. Simple, but caps the term count.
- **D. Recursive CTE with `JSON_VALUE(?, 'strict $[' || VARCHAR(n) || ']')`.** The JSON_VALUE path is documented as "an expression", but array subscripts are not documented on the 12.1 page. Highest risk.

---

## F2. Vector index plus filters, predicates and RCAC

### What IBM documents (OBSERVED)
- fetch-clause page: a nullable vector column forces EXACT "even when the query includes the APPROX clause"; "A VECTOR index can still be used if a NOT NULL predicate is included in the query for the vector column." Without RUNSTATS statistics, Db2 "resorts to EXACT search, even when a valid index is present." The metric must match the index `WITH DISTANCE`.
- With neither APPROX nor EXACT, the optimizer costs the index and uses it if cheaper.
- ANN implementation page: lists "You can filter the search space significantly with other predicates" as a case where an index may not be needed.
- Early-preview blog (Oct 2025): for selective filters, use ordinary indexes on the filter columns and brute-force distance over the reduced set.
- **No IBM page or blog found says whether WHERE predicates or row permissions are applied during graph traversal or after it, or whether APPROX can return fewer than k rows.** Checked: fetch-clause, CREATE VECTOR INDEX, vector index overview, ANN implementation, 12.1.5 highlights, and the Oct 2025, Feb 2026 and Jun 2026 IBM blogs, plus two web searches. The RCAC pages (CREATE PERMISSION, ALTER TABLE, row permissions scenario) say nothing about vector indexes.
- Consequence: NEEDLE's "recall and rows returned vs permission selectivity under RCAC" measurement has no prior IBM source. State it as a measurement, not as documented behavior.

### RCAC facts that matter for the measurement (OBSERVED)
- `ALTER TABLE ... ACTIVATE ROW ACCESS CONTROL` creates a default permission that "allows no access to any rows" unless an explicit SECADM-created permission allows them.
- Permissions are inert until activation. CREATE PERMISSION / CREATE MASK / ACTIVATE all need SECADM.
- Example predicate form: `VERIFY_ROLE_FOR_USER(SESSION_USER,'CSR') = 1`. SESSION_USER can be changed with SET SESSION AUTHORIZATION (useful to switch personas on one connection).

### Analogous behavior in other engines (OBSERVED; not Db2)
- SQL Server `VECTOR_SEARCH`, earlier DiskANN index versions: "Post-filtering only ... If none of the 10 rows ... have the `accepted` column equal to 1, the result is empty." Latest version applies WHERE predicates during the search ("iterative filtering").
- pgvector: "With approximate indexes, filtering is applied after the index is scanned." With `hnsw.ef_search` 40 and a 10%-selective condition, "only 4 rows will match on average." Fix: iterative index scans (0.8.0+).
- Qdrant: post-filtering gives "fewer results than you asked for"; combined filters can disconnect the graph and recall drops. Weaviate: post-filter search may "not contain any match at all"; ACORN ignores non-matching objects in distance calculations.
- Research: Filtered-DiskANN (WWW 2023, DOI 10.1145/3543507.3583552) builds label-aware graph edges; ACORN (PACMMOD 2(3) 2024 / SIGMOD '24, arXiv 2403.04871) is predicate-agnostic.

### Tuning knob, with a conflict to test
- Feb 2026 IBM blog: `/* <OPTGUIDELINES> <IXSCAN TABLE='VD1' SEARCH_LIST_SIZE='100'/> </OPTGUIDELINES> */`, L default 50, W default 2. 10M × 768: L=10 ≈ 68% recall, L=50 ≈ 90%, L=100 ≈ 97%.
- Perlow (Jul 2026, practitioner) reports that SEARCH_LIST_SIZE knobs returned SQL0104N on his 12.1.5 build (exact form not shown). Test the OPTGUIDELINES comment form first and check db2exfmt output for the guideline. No IBM docs page for this guideline was found.

### Other GA facts that change the plan (OBSERVED)
- 768-dim FLOAT32 needs a page size of at least **16K** for the index key (16K → max 1024 FLOAT32 dims). 32K is not required by the index.
- The early-preview "table becomes read-only" restriction is not in the GA CREATE VECTOR INDEX page. The GA overview describes an insert journal and periodic recreation instead. Still, on an indexed table: LOAD fails (SQL6104N), REORG of any index fails (SQL0270N rc 137), TRUNCATE makes the table inaccessible (SQL1477N). Load data first, then create the index, then RUNSTATS.
- Connector PRs: langchain-ibm #342 says "no existing search, ingestion, or retrieval logic is modified" and its page never mentions NOT NULL or APPROX. Haystack #4086 sets NOT NULL only with `create_vector_index=True` and does not mention APPROX or `FETCH FIRST ? ROWS`. Index use by either connector remains UNVERIFIED until an EXPLAIN.

### Data and model notes (OBSERVED)
- OSV has no single license. In `PyPI/all.zip`: GHSA, PYSEC (pypa/advisory-database) and PSF records are CC-BY 4.0 (attribution required); MAL-* records (OpenSSF malicious-packages) are Apache 2.0. `all.zip` includes withdrawn records; filter on `withdrawn`.
- OSV rule: "A version is considered affected if it lies within any one of the ranges or is listed in the versions list." PyPI names are PEP 503-normalized.
- nomic-embed-text: HF card says 8192-token sequence length, 768 dims, prefixes `search_query:` / `search_document:`. The Ollama library page lists a "2K context window", and `/api/embed` has `truncate` default true. Long advisory texts may be silently truncated; chunk or check token counts.
