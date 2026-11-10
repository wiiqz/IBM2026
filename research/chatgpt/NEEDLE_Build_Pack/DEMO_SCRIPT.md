# NEEDLE — Judge Demo (2 minutes 45 seconds, hard maximum <3 minutes)

**RULE:** Film an actual running application and actual Db2 terminal commands. No fake dashboard data. The figures and result IDs in this script are placeholders; replace with observed ones before recording. Mark dataset SYNTHETIC prominently. Avoid speedup claims unless evidenced.

| Time | Shot | Script / proof |
|---|---|---|
| 0:00–0:13 | Start on result with dependency flagged and database status visible | "A dependency advisory can describe the same weakness using different language. Keyword search can miss it, while embeddings alone can flag unrelated versions. NEEDLE combines both in IBM Db2." |
| 0:13–0:30 | Enter prevalidated query, show keyword results | "Here is the keyword-only ranking, calculated from indexed Db2 term rows." Show actual top IDs, no fabricated miss. |
| 0:30–0:49 | Switch to semantic/vector | "The same query uses Db2's VECTOR type and VECTOR_DISTANCE. It can retrieve related terms without exact wording." Show source record IDs and distances. |
| 0:49–1:12 | Hybrid comparison side-by-side | "NEEDLE fuses the ranks through reciprocal rank fusion and shows each component score. If one method misses an item, the other may bring it back." Show actual results from one statement if verified; otherwise explain SQL-plus-fusion implementation honestly. |
| 1:12–1:32 | SBOM Impact table | "Relevance is not exposure. The installed release must exactly match an affected release in Db2. A different version remains unconfirmed, not safe." Highlight positive and nonmatch. |
| 1:32–1:55 | Native Db2 / SQL / index lab | "This is a live Db2 12.1.5 database. Here is the table, the VECTOR column, and our exact/approximate search statements. The query plan [did/did not] choose the native vector index." Show actual db2level, catalog and explain evidence, or openly note no confirmed use. |
| 1:55–2:15 | Benchmark Lab | "These are measured exact-versus-approx and keyword-versus-vector results on a frozen, labeled synthetic corpus. [State actual p50 and recall numbers only if measured.]" Show corpus size, timing units, and benchmark method. |
| 2:15–2:33 | Architecture / Haystack pipeline and test terminal | "Haystack orchestrates a custom Db2 retriever. Db2 owns advisory retrieval, evidence and applicability. The LLM only explains cited findings, never chooses the exposure verdict." Show real tests. |
| 2:33–2:45 | End frame | "NEEDLE demonstrates auditable AI search where data, evidence and retrieval engineering stay in IBM Db2." Show repo, screenshot and limitation label. |

## Cinematic structure without bluffing
- Main capture at 1920x1080 or 1600x900, browser zoom chosen for clear type; no tiny 10px SQL.
- Cursor movement deliberate, labels legible, avoid more than two rapid transitions.
- Prepare exact query and SBOM once before capture. If testing reveals no hybrid improvement on this query, show comparison and admit tradeoff rather than manufacturing one.
- Use OBS/Windows capture; record voiceover separately if it improves clarity. No copyrighted background music.
- Do not cut out failed SQL while claiming a live run. A pre-recorded, confirmed real demo is acceptable; describe it as recorded.

## Judge Q&A
**Why Db2 instead of a separate vector database?** All normalized package/version, advisory term matches, native vectors and evidence reside in the same transactional database; the query can fuse ranks and join exposure relationally.

**Did DiskANN actually run?** Show EXPLAIN and say yes only if documented. If no, `FETCH APPROX` compiled but optimizer chose an exact plan, often because corpus small. Record as a limitation.

**Is AI deciding vulnerability status?** No. Semantic search is advisory candidate discovery, then exact affected-version join decides demonstrable applicability; unknown coverage remains unknown.

**Is this a real CVE scanner?** Not in this MVP. Synthetic sample is deliberately marked, with external OSV ingestion and version-range semantics out of scope.

**Is keyword-vs-hybrid recall proven?** Only to extent the curated query fixture labels and raw benchmark artifacts support; no generalization to real-world corpora.
