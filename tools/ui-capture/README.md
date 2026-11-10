# UI capture tools (not part of the submission)

Scripts William's session used to capture `needle/docs/screenshots/`, the share image and the accuracy crawl. They drive
your installed Google Chrome through `playwright-core` (set `CHROME=` if Chrome is not at the default path).

```bash
cd tools/ui-capture && npm i
# the API must be running: login mode on :8600, demo switcher on :8602 (see needle/README.md "Running the Project")
node shots_real.mjs http://127.0.0.1:8600 ../../needle/docs/screenshots login triage    # 01, 02, 05 (signs in as NDL_JUNIOR from needle/.env)
node shots_real.mjs http://127.0.0.1:8600 ../../needle/docs/screenshots login finding   # 04, 06
node shots_real.mjs http://127.0.0.1:8602 ../../needle/docs/screenshots demo compare    # 03 (needs NEEDLE_DEMO_SWITCHER=1)
node hero.mjs http://127.0.0.1:8600 out/hero 1600 1000      # hero frames: -a full visibility, -b 10% analyst (00 = -b)
node og.mjs http://127.0.0.1:8600 out/og.png 1200 630       # share image (convert to needle/web/public/og.jpg)
node audit.mjs http://127.0.0.1:8602                        # every page: links, console errors, the word "safe" (writes audit/*.txt)
node story.mjs http://127.0.0.1:8600                        # the four scroll-story chapters
```
`07_verify_db2_clp.png` and `08_tests_passing.png` are real terminal output rendered as images; their text is in
`needle/docs/evidence/verify_db2.txt` and `needle/docs/evidence/pytest.txt`.
