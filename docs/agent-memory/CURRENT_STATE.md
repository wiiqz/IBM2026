# CURRENT STATE — as of 2026-11-10 00:55 CST (Kartikeya's PC, Claude Code orchestrator)

Deadline: organizer rules **10 Nov 5:00 PM IST = 05:30 CST** (Devpost shows 07:30 CST; use 05:30). PR target ~03:30 CST.
Team **Needlepoint**: Kartikeya (`KnigguKniggu-droid`), William (`wiiqz`).
Nothing is submitted yet. Every submission step below needs the user's approval before it runs.

## Completed (verified)
- **Backend and research result**: Db2 12.1.5, 26,210 OSV advisories, vector index, BM25 in SQL, `NEEDLE.TRIAGE`
  fusion, RCAC on 4 tables, router, SBOM temporal exposure, LangChain retriever, Haystack component, memo + verifier.
  Headline numbers: `needle/docs/evidence/rcac_real.md`. Release `needle-data-2026-11-09` is published.
- **Web UI merged**: William's React + FastAPI UI (`needle/web/`, `needle/src/needle/api.py`) is merged into the local
  branch `needle` (merge `8e02dad`).
- **Repo is PUBLIC**: `wiiqz/IBM2026`. William removed `research/competition.md` and `research/organizers.md`
  (commit `3449a08`). Do not restore them.
- **Verified today on Kartikeya's PC** against the Codespace Db2 (SSH tunnel `localhost:50000`):
  - web build PASS;
  - full live pytest: **206 passed, 0 failed, 0 skipped**;
  - `web_acceptance` ALL PASS (11 checks);
  - memo day counts match exposure (2448, 919, 502).
- **Memo verifier rule 6** (durations must match `DAYS_EXPOSED`; 11 tests): local commit `dee81d7`.
- **Draft video**: `video/out/needle_demo.mp4`, 168.87 s.
- **API demo server** runs on http://127.0.0.1:8600 (`NEEDLE_DEMO_SWITCHER=1`, `PYTHONPATH=src`, `python -m needle.api`).
- **Reviews done**: audit (validator PASSED on a `make_submission` copy; no secrets; every README number traces to
  evidence), judge review (about 78/100 now, about 83 with fixes; top 3-5 of about 44 if the video lands), UI review,
  fresh-clone check.
- **UI fixes applied** (main session): RecallChart label moved off the red line; Landing notes 27 embargoed rows; memo
  badge "CHECKED AGAINST SQL"; Ctrl/Cmd+Enter hint; "Ranking for services and memo"; SqlPanel wording; Finding
  plan-cache footnote. `dist` rebuilt 00:50.
- **Fork created**: `KnigguKniggu-droid/IBM_Db2_TechX_Project_Submission`, cloned at `C:\Users\ganes\IBM26_pr`,
  branch `submission/needle` from `upstream/main`.
- **Devpost draft created**: submission 1292931 (name NEEDLE, pitch saved). Team invite link for William:
  (secret invite link: on the Devpost team page; shared privately, never in the repo)

## In progress
- **Doc-fix batch** from the audit, judge review, UI review and fresh-clone check is being applied (not yet reviewed
  or committed): gitignore negation for evidence `.log` files; `.gitattributes` for eval hashes on Windows; Python
  3.12+; model names; Streamlit to React copy; `hit@10` vs `recall@10` naming; router exact-scan note; team
  Needlepoint; William in the member tables.
- **Final video** is rendering in Claude.ai chat "Startup onboarding video"
  (https://claude.ai/chat/709b02e9-af00-4e71-becd-9e11070e2495). Inputs sent at about 00:50: `CONTEXT_DUMP.md`,
  `narration.txt`, footage, screenshots (`video/out/claude_ai/`, footage in `video/out/footage/`). Target
  `NEEDLE_demo_1080p.mp4`, v4 recipe, voice en-GB-Ryan, at most 2:58. Extra footage x1-x4 is being re-recorded.
- **Google Form A** (forms.gle/n8GQL4tg7Yzftwu39), page 1 partly filled in Chrome: name Kartikeya Lathi, Unstop email,
  Student, institute N/A, referral N/A, extension checkboxes. Page 2 needs the PR URL.
- **Local branch `needle`** is ahead of origin (merge `8e02dad`, `dee81d7`, plus the uncommitted doc fixes). Not pushed.

## Blockers / risks
- **User actions only**: add WhatsApp number and course/branch/year on Form A; upload
  `video/out/db2_extension_installed.png` (IBM Db2 Developer Extension `ibm.db2-for-luw` v1.2.1 installed in VS Code)
  by clicking Browse (the Chrome file_upload tool cannot reach the Drive picker); join the WhatsApp community
  (mandatory).
- Final video quality depends on the Claude.ai render. If it fails, fall back to the draft `needle_demo.mp4`.
- YouTube channel for the upload is UNKNOWN (confirm with the user). Upload script: `video/yt_upload_needle.py`
  (KaiClip token, unlisted).
- Form B (forms.gle/ZjsLaFU5zAYJonwk9) not opened yet. Unstop Round 1 status UNKNOWN.
- Codespaces free hours UNKNOWN (two Codespaces exist).
- The API demo server on port 8600 must stay up for recording. Do not kill it by port (see LESSONS).

## Next actions (in order)
1. Review and commit the doc fixes. Push `needle` and `main` to `wiiqz/IBM2026`.
2. `make_submission` into the fork (`C:\Users\ganes\IBM26_pr\submissions\needle`), run the validator
   (`python -X utf8 -I`), commit `feat(needle): NEEDLE — permission-aware hybrid retrieval in Db2`, push, open the PR
   titled `[Submission] needle: NEEDLE — permission-aware hybrid retrieval in Db2` (body `submission_copy/PR_BODY.md`).
3. Send the extra footage to Claude.ai. Download the final video, QC it, upload to YouTube unlisted (at most 3 min,
   viewable signed out).
4. Fill `video_url` and `repo_url` (`https://github.com/wiiqz/IBM2026`) in `needle/README.md`,
   `needle/submission.json` and the PR body. Push to the same PR.
5. Google Forms A and B, Unstop Round 2, Devpost details page (description, tags, gallery, video URL) and submit,
   LinkedIn post. Thumbnail: `needle/docs/screenshots/thumbnail_3x2.jpg`.
6. After submission: delete both Codespaces and stop local servers and tunnels.
