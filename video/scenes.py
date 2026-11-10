"""NEEDLE demo video: scene definitions (single source for narration, on-screen action and evidence).

Each scene has beats. A beat = one narration clip (edge-tts) + one on-screen action that starts with it.
`text` is the canonical wording (shown in DEMO_SCRIPT.md). The TTS input is `text` passed through SAY_MAP
(pronunciation only, same words). Every factual claim names its evidence file (paths relative to needle/).
"""

# The app's default sample message (needle/src/needle/app.py SAMPLE). docs/evidence/app_e2e_NDL_SENIOR.txt was
# produced with it; the short "RCE in that YAML loader" variant does NOT put PyYAML first in hybrid (tested).
HOOK_MSG = ("heads up from #platform-sec: someone says the yaml loader we use in a few python services can run "
            "arbitrary code when it parses an untrusted config file. no CVE number in the thread. are we exposed?")
PILLOW_MSG = ("heap overflow in the image library's FlashPix JPEG decoder can lead to code execution, "
              "no CVE yet")

# Pronunciation map for edge-tts (applied in order). Display text keeps the exact identifiers.
SAY_MAP = [
    ("NEEDLE.TRIAGE", "Needle dot Triage"),
    ("NEEDLE", "Needle"),
    ("NOT_CONFIRMED", "not confirmed"),
    ("NDL_SENIOR", "N D L senior"),
    ("NDL_JUNIOR", "N D L junior"),
    ("NDL_P10", "N D L P 10"),
    ("legacy-reporting", "legacy reporting"),
    ("PyYAML", "Pie YAML"),
    ("DiskANN", "Disk A N N"),
    ("BM25", "B M 25"),
    ("SQL PL", "S Q L P L"),
    ("JSON_TABLE", "Jason table"),
    ("FETCH APPROX", "fetch approx"),
    ("MERGE", "merge"),
    ("Db2", "D B 2"),
    ("FlashPix", "Flash Pix"),
    ("can't", "cannot"),
    ("Ollama", "Oh llama"),
    ("RCE", "R C E"),
]

SCENES = [
    {
        "id": "s1", "title": "Hook", "kind": "still", "slide": "hook", "max_s": 15,
        "beats": [
            {"text": "A message lands in our security channel: the YAML loader in some of our Python services can "
                     "run arbitrary code from a config file. No CVE yet. Which services are hit? And who may know?",
             "action": "Chat-message card with the two questions; slow zoom.",
             "evidence": ["(scenario framing, no measured claim)"]},
        ],
    },
    {
        "id": "s2", "title": "NEEDLE in the app", "kind": "app",
        "beats": [
            {"text": "This is NEEDLE, inside IBM Db2, over 26,210 real Python advisories. "
                     "We paste the message as a senior analyst.",
             "action": "Clear the text area, paste the hook message, user NDL_SENIOR (demo identity switcher), click Run triage, wait for results.",
             "do": [("paste_query", HOOK_MSG), ("select_user", "NDL_SENIOR"), ("run",)],
             "caption": "Db2 user NDL_SENIOR · every statement runs as this Db2 user, so RCAC applies",
             "evidence": ["docs/evidence/g1_vector_index.md (ADV_DOC rows: 26210)",
                          "src/needle/app.py (connects as the selected user)"]},
            {"text": "Db2 ranks three ways: BM25 keywords in plain SQL, DiskANN vector search, and a hybrid fused "
                     "with reciprocal rank fusion. Keywords alone rank other projects first. Hybrid puts PyYAML on top.",
             "action": "Smooth-scroll to 'Ranked advisories': keyword / vector / hybrid columns.",
             "do": [("scroll_to", "Ranked advisories")],
             "caption": "One candidate set from NEEDLE.TRIAGE · keyword, vector, hybrid (RRF inside Db2)",
             "evidence": ["docs/evidence/app_e2e_NDL_SENIOR.txt (keyword top 4 = ms-swift, feast; "
                          "hybrid top 2 = pyyaml)", "live app frame (checked at render time)"]},
            {"text": "All of it is one SQL PL call: NEEDLE.TRIAGE.",
             "action": "Open the expander 'SQL: the one retrieval statement ...' and scroll to the CALL.",
             "do": [("open_expander", "SQL: the one retrieval"), ("scroll_to_expander", "SQL: the one retrieval")],
             "caption": "CALL NEEDLE.TRIAGE_MODE(..., 'HYBRID') · one statement, bound parameters",
             "evidence": ["docs/evidence/app_e2e_NDL_SENIOR.txt (path=CALL NEEDLE.TRIAGE_MODE(..., 'HYBRID'))",
                          "sql/03_triage_proc.sql"]},
            {"text": "Then a temporal SQL join against our services' bill of materials answers the real question: "
                     "legacy-reporting runs PyYAML 5.1, affected since February 2020.",
             "action": "Close the SQL expander; scroll to 'Affected services': KPIs + AFFECTED tab "
                       "(legacy-reporting, since 2020-02-27, days exposed).",
             "do": [("close_expander", "SQL: the one retrieval"), ("scroll_to", "Affected services")],
             "caption": "SBOM_COMPONENT FOR BUSINESS_TIME AS OF CURRENT DATE · deploy history",
             "evidence": ["docs/evidence/app_e2e_NDL_SENIOR.txt (AFFECTED legacy-reporting pyyaml==5.1 "
                          "since 2020-02-27)", "sql/05_sbom_temporal.sql"]},
            {"text": "Services on unlisted versions are NOT_CONFIRMED, never safe. The fleet is synthetic; "
                     "the advisories are real.",
             "action": "Click the NOT_CONFIRMED tab.",
             "do": [("click_tab", "NOT_CONFIRMED")],
             "caption": "NOT_CONFIRMED is never 'safe' · fleet: synthetic services, real PyPI versions",
             "evidence": ["src/needle/app.py (NOT_CONFIRMED definition, 'Fleet SYNTHETIC' chip)",
                          "docs/evidence/app_e2e_NDL_SENIOR.txt (NOT_CONFIRMED: 26 rows)"]},
        ],
    },
    {
        "id": "s3", "title": "RCAC: who may know", "kind": "app", "requires": "docs/evidence/rcac_demo_case.txt",
        "beats": [
            {"text": "Now, who may know. A second rumour: a heap overflow in the image library's FlashPix decoder.",
             "action": "Paste the Pillow FlashPix query, user NDL_SENIOR, Run triage (narration waits for results).",
             "do": [("paste_query", PILLOW_MSG), ("select_user", "NDL_SENIOR"), ("run",)],
             "caption": "NDL_SENIOR · a rumour with no CVE yet",
             "evidence": ["(scenario framing)"]},
            {"text": "The senior analyst sees the embargoed advisory and its affected services.",
             "action": "Verdict box (services affected now), then scroll to the ranking: embargoed "
                       "GHSA-5x8w-8jj5-q52h in all three columns; router line under the ranking.",
             "do": [("expect_text", "affected now"), ("pause", 2.2), ("scroll_to", "Ranked advisories")],
             "caption": "NDL_SENIOR (SEES_EMBARGO = 1) · demo-embargoed GHSA-5x8w-8jj5-q52h is visible",
             "evidence": ["docs/evidence/rcac_demo_case.txt (NDL_SENIOR: GHSA-5x8w-8jj5-q52h rank 1; synthetic demo "
                          "embargo flag on a real advisory)", "live app frame (3 services affected now)"]},
            {"text": "For the demo we switch between two real Db2 identities; in normal use each analyst signs in "
                     "with their own. The junior analyst asks the same.",
             "action": "Switch user to NDL_JUNIOR (demo identity switcher), Run triage.",
             "do": [("select_user", "NDL_JUNIOR"), ("run",)],
             "caption": "Demo identity switcher, not authentication · two real Db2 users",
             "evidence": ["src/needle/app.py (NEEDLE_DEMO_SWITCHER; default = sign in with own Db2 user)"]},
            {"text": "The advisory is gone from every ranking: Db2 row access control removed it, not our app.",
             "action": "Scroll to the ranking: the advisory is absent in all three columns; router line visible.",
             "do": [("scroll_to", "Ranked advisories")],
             "caption": "NDL_JUNIOR · same query, same SQL · the demo-embargoed advisory is not returned",
             "evidence": ["docs/evidence/rcac_demo_case.txt (NDL_JUNIOR: NOT RETURNED, 0 rows visible)",
                          "sql/04_rcac.sql (CREATE PERMISSION)",
                          "docs/evidence/rcac_real_tables.md (no result is filtered in Python; leaks 0)"]},
        ],
    },
    {
        "id": "s4a", "title": "The finding: one plan for every user", "kind": "still", "slide": "plan",
        "beats": [
            {"text": "Here is what we found. Under row access control, every user shares one plan. That plan sizes "
                     "the vector index's first batch as if each user could see about half the rows — the "
                     "optimizer's estimate is 0.495 — so it fetches 21 candidates, and then the permission drops "
                     "the rows this user can't see.",
             "action": "Table slide: plain WHERE vs RCAC user per visibility (filter factor, search list L, "
                       "rows, recall@10) + three-step card: one shared plan / first batch sized for ~half the "
                       "rows (FF 0.495 -> 21 candidates) / then the permission drops what you can't see.",
             "evidence": ["README.md 'What we found' items 2-3 (FF 0.495 for every user; IXSCAN sized at n / FF = 21)",
                          "docs/evidence/rcac_real.md findings 2-3 + section actuals (21 rows out of the vector "
                          "IXSCAN in 9 of 9 NDL_P10 executions; one shared plan)",
                          "docs/evidence/rcac_real_tables.md (package cache: 1 distinct executable id)"]},
        ],
    },
    {
        "id": "s4b", "title": "The finding: recall vs visibility", "kind": "still", "slide": "chart",
        "beats": [
            {"text": "So a user who sees 10 percent of the rows asks for 10 results and gets about 2. Recall: 0.21. "
                     "Our per-user router fixes this: on 89 held-out queries, recall is back to between 0.98 and "
                     "1.0, with zero leaks.",
             "action": "eval/results/rcac_recall_vs_selectivity.png full-screen, slow zoom.",
             "evidence": ["docs/evidence/rcac_real.md finding 7 (held-out: 0.987-1.000, 10 of 10 rows, 0 leaks)",
                          "eval/results/rcac_recall_vs_selectivity.json (held-out n=89: NDL_P10 recall 0.2079, "
                          "rows 2.08; router recall 1.0/1.0/1.0/0.9876/0.9865 -> between 0.98 and 1.0)",
                          "docs/evidence/rcac_real_tables.md (router table: leaks 0)"]},
        ],
    },
    {
        "id": "s4c", "title": "The router, live", "kind": "app",
        "beats": [
            {"text": "Here is the router, live. An analyst who sees 10 percent of the advisories asks the same "
                     "question.",
             "action": "Same hook message (already in the text area), switch to NDL_P10 (10% visibility), Run triage (narration waits).",
             "do": [("ensure_query", HOOK_MSG), ("select_user", "NDL_P10"), ("run",)],
             "caption": "NDL_P10 · 10% visibility · same question",
             "evidence": ["src/needle/app.py (DEMO_LABELS: NDL_P10 Analyst with 10% visibility)"]},
            {"text": "2,616 of 26,210 advisories are visible, so the router picks an exact scan, and all ten "
                     "results come back.",
             "action": "Router line under the ranking ('Search depth 128 chosen for your visibility (2,616 of "
                       "26,210 advisories visible): exact scan') + a full hybrid top 10; caption = that line.",
             "do": [("expect_text", "2,616 of 26,210"), ("expect_text", "exact scan"), ("expect_text", "top 10"),
                    ("scroll_to", "Ranked advisories"), ("caption_from_depth_line",)],
             "caption": "",
             "evidence": ["live app router line (asserted at capture time: '2,616 of 26,210', 'exact scan', "
                          "'top 10'; probe 20:29)", "docs/evidence/rcac_real_tables.md (NDL_P10 visible rows "
                          "2616; router choice EXACT 10 for NDL_P10)"]},
        ],
    },
    {
        "id": "s5", "title": "Trust: the verifier", "kind": "still", "slide": "verifier",
        "beats": [
            {"text": "Finally, trust. We planted a prompt injection in one advisory; the local model half-obeyed it "
                     "and wrote that no action is needed. Our verifier checks every sentence against the SQL "
                     "results and removed that claim.",
             "action": "Evidence card from the memo test: planted line, model output, removed sentence + reason.",
             "evidence": ["docs/evidence/app_llm_memo_offline.txt (REMOVED (1): safety claim)"]},
        ],
    },
    {
        "id": "s6", "title": "Close", "kind": "still", "slide": "close", "max_s": 15,
        "beats": [
            {"text": "Built on Db2 vectors, DiskANN, FETCH APPROX, row and column access control, temporal "
                     "tables, SQL PL, JSON_TABLE and MERGE. Open source.",
             "action": "Closing card: Db2 features used, stack, license, repo link placeholder.",
             "evidence": ["sql/01_schema.sql (CREATE VECTOR INDEX)", "sql/03_triage_proc.sql (JSON_TABLE, MERGE, "
                          "SQL PL)", "sql/04_rcac.sql (CREATE PERMISSION)", "sql/05_sbom_temporal.sql "
                          "(PERIOD BUSINESS_TIME)", "src/needle/retriever.py, llm_summary.py (LangChain, Ollama)",
                          "LICENSE (Apache 2.0)"]},
        ],
    },
]


def say(text: str) -> str:
    for a, b in SAY_MAP:
        text = text.replace(a, b)
    return text
