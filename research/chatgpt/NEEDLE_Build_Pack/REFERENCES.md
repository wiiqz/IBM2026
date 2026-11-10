# NEEDLE — Verified Source URLs, Connector References, and UI Inspiration

Source review date: 2026-11-09. Link descriptions below are factually grounded in retrievable primary-source material where noted; claims about the user's local environment, competition changes and the availability of individual registry images still need live confirmation by the build agent.

## A. Official contest and workflow
1. Event homepage: https://ibmdb2techxsummit.glbajajgroup.ac.in/
2. Organizer submit page: https://ibmdb2techxsummit.glbajajgroup.ac.in/submit
3. Organizer resources and curated connector list: https://ibmdb2techxsummit.glbajajgroup.ac.in/resources
4. Organizer public FAQ, currently saying SOLO only: https://ibmdb2techxsummit.glbajajgroup.ac.in/subm (possible site alias; use homepage FAQ if unavailable)
5. Unstop page with Nov 10 5PM IST deadline and SOLO instruction: https://api.unstop.com/hackathons/db2hack-2026-build-ai-applications-on-ibm-db2-gl-bajaj-group-of-institutions-mathura-uttar-pradesh-1795047
6. Devpost overview and project workflow: https://ibm-db2hack-2026.devpost.com/
7. Devpost Resources: https://ibm-db2hack-2026.devpost.com/resources
8. Devpost rules (MUST check at submission): https://ibm-db2hack-2026.devpost.com/rules
9. Official submission GitHub repo: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
10. Official repository FAQ (teams subject to official rules; **not unconditional permission**): https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/docs/faq.md
11. Repo judging criteria (30/25/20/15/10): https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/docs/judging-criteria.md
12. Repo submission guide: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/docs/submission-guide.md
13. Official PR template: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/blob/main/.github/PULL_REQUEST_TEMPLATE.md
14. Actual Google Form URL from Devpost resources: https://forms.gle/n8GQL4tg7Yzftwu39

**Eligibility discrepancy:** repo FAQ allows individual/team only *subject to official rules*, but the organizer site and Unstop say solo. Treat as unresolved, not a green light for two-person participation.

## B. Official IBM Db2 12.1.5 engineering sources
1. Version 12.1.5 highlights: https://www.ibm.com/docs/en/db2/12.1.x?topic=1215-highlights-db2
2. Vector data type + restrictions: https://www.ibm.com/docs/en/db2/12.1.x?topic=list-vector-values
3. CREATE TABLE syntax: https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-table
4. VECTOR constructor: https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector
5. VECTOR_DISTANCE and six metrics: https://www.ibm.com/docs/en/db2/12.1.x?topic=functions-vector-distance
6. Native vector index overview (12.1.5+): https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-vector
7. ANN implementation: https://www.ibm.com/docs/en/db2/12.1.x?topic=indexes-ann-index-implementation
8. CREATE VECTOR INDEX (syntax, page-size matrix; exact English URL may return 403 to crawlers): https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-vector-index
9. Equivalent IBM docs German localized page confirming examples and 4K/8K/16K/32K limit: https://www.ibm.com/docs/de/db2/12.1.x?topic=statements-create-vector-index
10. FETCH APPROX / FETCH EXACT and optimizer caveats: https://www.ibm.com/docs/en/db2/12.1.x?topic=subselect-fetch-clause
11. SQL ROW_NUMBER / RANK specification: https://www.ibm.com/docs/en/db2/12.1.x?topic=expressions-olap-specification
12. CREATE BUFFERPOOL: https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-bufferpool
13. CREATE TABLESPACE: https://www.ibm.com/docs/en/db2/12.1.x?topic=statements-create-tablespace
14. SQL row-size and page-size limits: https://www.ibm.com/docs/en/db2/12.1.x?topic=sql-xml-limits
15. RUNSTATS actual command syntax: https://www.ibm.com/docs/en/db2/12.1.x?topic=commands-runstats
16. IBM Community CE Docker for Windows: https://www.ibm.com/docs/en/db2/12.1.x?topic=system-windows
17. CE Docker overview: https://www.ibm.com/docs/en/db2/12.1.x?topic=deployments-db2-community-edition-docker
18. IBM 12.1.5 CE image tag & restart fix, IBM engineer discussion: https://community.ibm.com/community/user/discussion/121-container-community-edition-docker-start-fails-dbi20187e
19. IBM Engineer hands-on index syntax and registry note: https://community.ibm.com/community/user/blogs/jason-perlow/2026/07/07/persistent-ai-agent-memory-on-db2-1215-vector-mnem
20. IBM vector-search early-access end-to-end SQL examples; prefer 12.1.5 GA docs for current behavior: https://community.ibm.com/community/user/blogs/christian-garcia-arellano/2025/10/04/vector-indexes-in-db2-an-early-preview

Important caveat from IBM docs: `FETCH APPROX` is optimizer advice and index selection depends on statistics, dataset size, nullable vectors and matching distance metric. Never claim DiskANN use solely from syntax or catalog.

## C. Real frameworks, connectors and implementation references
1. Db2 Python native driver, with Python 3.13 Windows wheel support: https://github.com/ibmdb/python-ibmdb
2. Haystack framework: https://github.com/deepset-ai/haystack
3. Haystack `@component` + `Pipeline` documentation: https://docs.haystack.deepset.ai/docs/custom-components
4. IBM Db2 Haystack official integration registry: https://github.com/deepset-ai/haystack-integrations/blob/main/integrations/ibm-db-document-store.md
5. Haystack core IBM Db2 integration code: https://github.com/deepset-ai/haystack-core-integrations/tree/main/integrations/ibm_db
6. Haystack IBM Db2 API reference: https://docs.haystack.deepset.ai/reference/integrations-ibm-db
7. `ibm-db-haystack` package: https://pypi.org/project/ibm-db-haystack/
8. Open feature request for DB2 12.1.5 native vector-index support in Haystack integration (verify status before claiming gap): https://github.com/deepset-ai/haystack-core-integrations/issues/4049
9. LangChain's IBM/Db2 connector code (secondary comparison, not needed for P0): https://github.com/langchain-ai/langchain-ibm
10. LangChain Db2 vector store docs: https://docs.langchain.com/oss/python/integrations/vectorstores/db2
11. Official IBM SQLGlot dialect plugin (P2; no arbitrary text-to-SQL in MVP): https://github.com/IBM/db2-sqlglot-plugin
12. Ollama local API reference (verify model endpoints live): https://docs.ollama.com/api
13. OSV.dev API and semantics (P2 ONLY, provenance and ranges needed): https://osv.dev/docs/

**Why custom retriever?** A Haystack custom component is a supported integration mechanism. It makes a single Db2-native hybrid SQL retrieval experiment possible without relying on a connector's default similarity path. Optional IBMDb2DocumentStore can be shown as an adapter/baseline if compatible. Don't claim an unsupported upstream feature has landed.

## D. VISUAL references — real products and what to borrow (not copy)
1. **Snyk UI (real screenshots and training):** https://learn.snyk.io/lesson/intro-to-snyk-ui/ — borrow information architecture: filterable project list, issue severity chips, focused issue details with reference links and fix context. **Do not** reuse brand marks, proprietary assets, or invent real vulnerabilities.
2. **Socket alert taxonomy and controls:** https://socket.dev/alerts and https://docs.socket.dev/docs/scans — borrow clear evidence hierarchy: category, severity, direct/transitive dependency, raw alert basis and a provenance column. Do not reproduce their threat-intel claims.
3. **Linear March 2026 refresh:** https://linear.app/changelog/2026-03-12-ui-refresh — borrow dim, quiet navigation, compact table rows, consistent header and visually emphasized working area; no brand assets or exact copy.
4. **Grafana Explore comparison:** https://grafana.com/docs/grafana/latest/visualizations/explore/get-started-with-explore/ — borrow split side-by-side experiment comparison, visible query controls, explicit time range and transparent legend. In NEEDLE use lexical/vector/hybrid columns and measured latency instead of a time-series-only dashboard.
5. **IBM's Db2 TechX resources site:** https://ibmdb2techxsummit.glbajajgroup.ac.in/resources — borrow restrained cyan IBM-ish accent and technically grounded typography; don't imply IBM endorsement.

Suggested UI design tokens (ORIGINAL implementation): background `#0B1120`, panel `#142033`, divider `#28364C`, primary text `#E7EEF8`, secondary `#9AAAC1`, accent `#4BC4E5`, amber warning `#F2B66E`, danger `#F47572`. These are proposed colors, NOT claims about the reference sites' actual pixels. Strong contrast and responsive behavior matter more than pixel imitation.

## E. Competing submissions examined (not exhaustive)
- Custodian / agent control plane: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/30
- MetricGuard / governed typed analytics: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/36
- YojanaLens / SQL PL + vector eligibility: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/28
- EnergySense / telemetry + anomaly: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission/pull/37

These are self-described PRs, not verified winning entries or proof all features are functional. Repo status and additional entries may change before deadline.

## F. Unverified at the moment of packaging
- The exact result of executing each SQL DDL in the user's own Db2 instance.
- Whether Haystack's `IBMDB2DocumentStore` works alongside the project's manual 32KB custom table, and whether it supports native indexed ANN in the current version.
- Real timing and recall numbers, including whether ANN is chosen by Db2 optimizer.
- Windows WSL/Docker state after developer setup.
- Written waiver/exception for two-person entry.
