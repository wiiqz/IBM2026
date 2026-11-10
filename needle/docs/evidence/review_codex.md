## Findings

### HIGH

1. `TERM_DF` exposes embargoed advisory IDs through an RCAC side channel.  
   Evidence: `src/needle/tokenize.py:50-59` includes each advisory ID and alias as indexed terms. `sql/02_bm25.sql:52-53` copies those terms into global `TERM_DF`. `sql/04_rcac.sql:139-140` grants `NDL_JUNIOR` direct access to `TERM_DF`, which has no row permission.  
   Failure scenario: `NDL_JUNIOR` compares each global DF with the visible count in RCAC-protected `POSTING`. Terms such as `ghsa-...` where `DF > visible_count` disclose exact identifiers from hidden rows. This contradicts `sql/04_rcac.sql:156-158`, which claims that the tables never leak advisory IDs.

2. The UI lets any browser visitor assume `NDL_SENIOR`.  
   Evidence: `src/needle/app.py:37` always offers both users. `src/needle/app.py:353` renders an unauthenticated selector. `src/needle/app.py:372-373` connects as the selected identity. `src/needle/sbom.py:393-418` retrieves that identity’s password from the server-side `.env`.  
   Failure scenario: a junior analyst selects `NDL_SENIOR` and receives embargoed advisories, exposure rows, and LLM input. The UI has no authentication or binding between the browser user and the selected Db2 user.

3. `g1_explain.py` inserts untrusted JSON content directly into SQL text under the admin connection.  
   Evidence: `scripts/g1_explain.py:32-33` wraps `json.dumps(v)` inside a single-quoted SQL literal without escaping or numeric validation. `scripts/g1_explain.py:133-135` reads vectors from a caller-selected file and opens the Db2 connection. `scripts/g1_explain.py:151-152` builds SQL from the literal. `scripts/g1_explain.py:49-50` executes that SQL through `exec_immediate`.  
   Failure scenario: a vector element containing a single quote terminates the SQL string and changes the statement executed as `db2inst1`. Binding the vector, as the other variants already do, is required.

4. The memo verifier accepts lexical and Unicode prompt-injection bypasses.  
   Evidence: `src/needle/verify.py:26-31` recognizes only ASCII identifier forms. `src/needle/verify.py:112-119` recognizes only ASCII tokens that already exist in a finite known-name universe. `src/needle/verify.py:125-145` accepts all other text.  
   Failure scenario: injected output such as `payments-prod is exposed by GHSA‑ffff‑ffff‑ffff through evilpkg` uses non-ASCII hyphens and previously unknown names. No identifier, service, package, safety, or affected-claim rule matches, so `verify_memo` keeps the sentence. Format variants such as `GHSA ffff ffff ffff` and one-character suffix IDs also evade `ADV_ID_RE`.

### MEDIUM

5. The verifier does not validate advisory-to-service or package-to-service relationships.  
   Evidence: `src/needle/verify.py:97-108` reduces evidence to global ID/package sets and `service -> statuses`. `src/needle/verify.py:140-144` accepts an affected claim when the service has any `AFFECTED` row.  
   Failure scenario: if `SVC-01` is affected by advisory A but `NOT_CONFIRMED` for advisory B, the sentence “SVC-01 is affected by B” passes because B is globally allowed and `SVC-01` has an unrelated `AFFECTED` status. Synonyms such as “vulnerable,” “exposed,” and “impacted” bypass the affected-claim check entirely.

6. Range-only advisories disappear instead of producing the documented `UNKNOWN_COVERAGE` result.  
   Evidence: `README.md:55-56` promises `UNKNOWN_COVERAGE`. `src/needle/sbom.py:237-242` builds `AFF` only from enumerated `ADV_AFFECTED` versions. `src/needle/sbom.py:288-297` derives `NOT_CONFIRMED` only from packages already present in `AFF`.  
   Failure scenario: an advisory has a PyPI package and an affected range but no `affected[].versions`. It creates no `AFF` row, so the exposure query returns no service rows. The UI cannot distinguish unknown coverage from an advisory unrelated to the fleet.

7. **PLAUSIBLE:** the clean-host quickstart repeats post-load DDL and can fail on duplicate indexes.  
   Evidence: `README.md:157-160` runs both loaders with their defaults and then runs `setup_db.sh --phase post`. The defaults already include `post` at `scripts/load_in_codespace.py:14` and `scripts/load_postings_in_codespace.py:10`. `scripts/setup_db.sh:173-175` then extracts and reruns every post-load section. Its accepted error list at `scripts/setup_db.sh:39` omits `SQL20393N`, although the loader explicitly treats that code as a duplicate-index condition at `scripts/load_in_codespace.py:30`.  
   Failure scenario: `ADV_DOC_VIX` is created by the loader. The final quickstart command attempts to create it again, records `SQL20393N` as an error, and exits nonzero.

### LOW

8. `knn_sql` exposes an unparameterized SQL predicate interface.  
   Evidence: `src/needle/rcac.py:93-100` accepts `where: str`. `src/needle/rcac.py:110-117` inserts it directly into SQL.  
   Failure scenario: a future caller passes request-derived filter text and executes the returned statement through `Router._run`. The current repository calls this function with an empty predicate, so this is a latent injection surface rather than a current UI path.

## 5-line summary

1. The review found 3 direct data-protection defects: `TERM_DF` leakage, unauthenticated senior selection, and incomplete memo verification.
2. The review found 2 SQL-construction defects: one executable admin-script injection and one latent raw-predicate interface.
3. The temporal day arithmetic, PEP 503 normalization, BM25 formula, and RRF formula showed no verified defect.
4. No plaintext secret or verified unclosed-connection defect was found in the reviewed scope.
5. The clean Linux quickstart has one PLAUSIBLE duplicate-DDL failure, and range-only advisories produce incorrect coverage output.