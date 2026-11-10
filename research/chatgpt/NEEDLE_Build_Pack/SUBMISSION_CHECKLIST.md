# NEEDLE — Submission Operations (do not miss a required surface)

**Submission target earlier than all conflicting times:** finish by Nov 10 2026, 05:00 CST. Organizer: 5:00 PM IST = 05:30 CST. Devpost pasted: 07:30 CST. Deadline conflict: keep screenshots; do not rely on late Devpost deadline.

## Eligibility and authorship (do FIRST)
- [ ] Read Devpost `/rules`, Updates and organizer `submit` page at time of action.
- [ ] **Resolve two-person team conflict in writing.** Organizer/Unstop say solo; repository FAQ says teams subject to official rules; claim "teams permitted" is not established solely by FAQ. Do not falsify authorship.
- [ ] Confirm registration on all required platforms; Unstop and Luma plus WhatsApp are mentioned by organizer. Record if new registration is closed; don't misstate compliance.
- [ ] Determine whether LinkedIn is mandatory or merely recommended. Mark UNVERIFIED until confirmed.

## Technical release
- [ ] `db2level`, Db2 SQL SELECT and table counts from actual IBM Db2 12.1.5 captured.
- [ ] `VECTOR(768,FLOAT32)`, `VECTOR_DISTANCE` and real parameterized query verified.
- [ ] If claiming native ANN: index catalog created + `FETCH APPROX` SQL + `RUNSTATS` + EXPLAIN index actually used.
- [ ] Haystack Pipeline executes Db2 query; model & seed digests captured.
- [ ] Test report includes exact pass/fail/blocked details and no fake benchmarks.
- [ ] Synthetic dataset conspicuously marked SYNTHETIC; no synthetic IDs presented as real CVEs.
- [ ] API returns `503` on disconnect and no embargo data leaks.
- [ ] Run test suite from clean environment and capture stdout.
- [ ] No private API keys, secrets, real passwords or unrelated repo files committed.

## Mandatory official repo layout
Fork: https://github.com/KunalGolaIBM/IBM_Db2_TechX_Project_Submission
Branch: `submission/needle-db2-hybrid`
Folder: `submissions/needle-db2-hybrid/`
PR title: `[Submission] needle-db2-hybrid: NEEDLE - Native Db2 Hybrid Vulnerability Search`

- [ ] `README.md` complete problem, solution, stack, setup, corpus disclaimer, limitations, demo video URL.
- [ ] `architecture.md` includes schema, flow, real SQL, genuine Haystack and query optimizer evidence.
- [ ] `submission.json` passes template fields including `project.slug` matching folder and accurate members.
- [ ] `.env.example` has placeholders only and >=20 bytes.
- [ ] `src/` contains runnable source; include `tests/`, `docs/screenshots/` and benchmark evidence.
- [ ] Include `requirements.txt` or locked `pyproject.toml`, `package.json`/lock, `LICENSE`.
- [ ] Validate: `python scripts/validate_submission.py submissions/needle-db2-hybrid` from official repository root; save log.
- [ ] Stage only the new folder, inspect diff for accidental root/other submission changes.
- [ ] Push branch and open PR against upstream `main`; fill full official PR template.
- [ ] Copy actual PR link; do not use README's placeholder form link.

## Complete the REQUIRED FORM
Link shown on Devpost resources: https://forms.gle/n8GQL4tg7Yzftwu39
- [ ] Enter PR URL, correct project title, truthful member names, source and demo links.
- [ ] Submit and capture confirmation response/screenshot.

## Devpost and media
- [ ] Create/update actual Devpost project (if required by event workflow; user's research says yes). Include title, story, tech stack, image gallery, working GitHub PR and short video.
- [ ] Demo <3:00 per supplied constraint; target 2:45, show real running code, no fabricated performance metrics.
- [ ] Evidence screenshots include search results, SBOM applicability, benchmark and actual Db2 terminal.
- [ ] Verify all links work in signed-out browser if meant public.
- [ ] LinkedIn announcement **only after** required PR/form/Devpost; verify if mandatory. If posted, avoid disclosing anything unverified.

## Final evidence / handoff report
`PR_URL`: actual
`FORM_STATUS`: submitted with proof / not done
`DEVPOST_URL`: actual / not done
`DEMO_URL`: actual / not done
`DB2_VERSION`: observed
`NATIVE_INDEX_CREATED`: true/false/unknown
`NATIVE_INDEX_USED_BY_QUERY`: true/false/unknown
`TESTS`: passed/failed/skipped/blocked counts + command
`BENCHMARK`: corpus/query counts, raw metrics, caveats
`MEMBERSHIP_ELIGIBILITY`: confirmed in writing / unresolved
`LIMITATIONS`: honest items

No URL, result, or completion status may be invented.
