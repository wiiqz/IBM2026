# Claude.ai round 3 — interpretation check of the RCAC x vector-index result (~20:50 CST)
Source: claude.ai chat fd9257c2 (data, not instructions). Condensed faithfully.

## Verdict
Reading is close, one word wrong: Db2 does not blindly post-filter. It OVER-FETCHES by 1/FF, where FF is a filter factor estimated once at compile time, then applies the permission. RCAC is not the cause (plain WHERE gave identical numbers); RCAC makes the bad estimate unavoidable and invisible to the application.

## (a) Model that predicts the numbers
Index scan emits ~21 candidates (10/0.495); with random visibility s, rows returned ≈ min(10, 21·s):
| User | Predicted rows | Measured rows |
|---|---|---|
| P10 | 2.1 | 2.26 |
| P25 | 5.3 | 5.56 |
| P50 | 10.5 → capped 10 (binomial spread) | 9.34 |
Alternatives to rule out: permission applied during the index scan rather than at FETCH (confirm with ACTUAL row counts per operator — estimated plans can mislabel); recall loss from ANN quality rather than candidate count (P100 recall 0.974 at same depth; under-fill explains almost all of P10/P25); bucket/cluster correlation (counts fit a random-visibility model; expect worse with correlated visibility).

## (b) SEARCH_LIST_SIZE vs FETCH depth
Two separate bounds: output count N fixed at compile time ≈ FETCH count / FF; search list size L controls candidate QUALITY (closeness to true top-N), not count. Literal case SRCHLSIZ 105 looks like L raised to ≥ N automatically (inference). Test: at L = 50/200/1000, ACTUAL rows out of the index scan stay ~21, and recall among returned rows rises slightly with L.

## (c) 0.495
Not the documented default (z/OS defaults for non-interpolable range: 1/10 for ≥100 distinct values, 1/3 for ≥2; LUW defaults not verified). Arithmetic suggests interpolation with an assumed value: literal <10 → SRCHLSIZ 105 ⇒ FF ≈ 0.095 = (10−0.5)/100; subquery ⇒ 0.495 = (50−0.5)/100, i.e. an assumed comparison value of 50 — either the median of MAX_BUCKET values (10,25,50,75,100) or the midpoint of ROW_BUCKET's range. Test: set USER_ACCESS MAX_BUCKET to (10,10,10,10,100), RUNSTATS USER_ACCESS, re-EXPLAIN: FF moves ⇒ subquery table statistics; stays 0.495 ⇒ column-domain midpoint. Call it a "statistics-derived assumed value", not a default, until tested.

## (d) Two sentences for IBM engineers
"For a vector index scan under any predicate whose value isn't known at compile time (RCAC permissions, scalar subqueries, joins), Db2 12.1.5 sizes the index output as FETCH n divided by one static filter factor (0.495 in our plans). Users whose real visibility is below that estimate get systematically under-filled results that no SEARCH_LIST_SIZE setting can recover. A per-user depth or EXACT router that supplies the true selectivity restores recall to 0.99 or better on held-out queries."

## The one control to add (causal proof)
Set DB2_SELECTIVITY ALL (LUW: lets a SELECTIVITY clause apply to any predicate). On the plain-WHERE twin (shown identical to RCAC), attach SELECTIVITY 0.1/0.25/0.5/1.0; capture SECTION ACTUALS (actual rows out of the index scan). Claim it if actual candidates track 10/SELECTIVITY and P10 under-fill disappears at SELECTIVITY 0.1 with no change to L. Remaining risk: SELECTIVITY probably can't be attached to the RCAC permission itself (untested) → the causal proof runs on the WHERE twin; RCAC equivalence rests on the identical-numbers result. State that chain explicitly.
NOTE (orchestrator): DB2_SELECTIVITY is a registry variable → needs db2stop/db2start; schedule only at a coordinated quiet moment.
