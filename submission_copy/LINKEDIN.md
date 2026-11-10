# LinkedIn post (paste-ready)

Author: Kartikeya Lathi (first person). Replace [VIDEO_URL] and [PR_URL] before posting. Nothing has been posted.
Post text below is 1273 characters with the placeholders as written and 1355 with a youtu.be link and a full submission-repo PR link (Python len()). Keep it under 1,400.

## Post (copy everything between the lines)

---

I asked Db2 for 10 vector search results and got 2.

An analyst who may see 10% of our security advisories got 2.05 of 10 rows on average (recall 0.205). 36 of 170 queries came back empty. Db2 row permissions share one query plan, and that plan sizes the vector index's initial batch as if each user sees about half the rows: 21 candidates for 10. The permission then removes what the user cannot see.

William Lu and I built NEEDLE for IBM Db2Hack 2026. You paste a vague security message, even one with no CVE yet, and it returns the matching advisories, the services that run an affected version, and since when. Keyword (BM25) and vector (DiskANN) search run inside Db2 under row and column access control, fused in one SQL statement. NEEDLE also picks a search depth for each user.

On 89 held-out queries, every user got 10 of 10 rows, recall@10 was 0.987 to 1.000, and there were 0 permission leaks. William Lu built the web UI.

Demo: [VIDEO_URL]
PR: [PR_URL]
Code: https://github.com/wiiqz/IBM2026

Thanks to the organising team: Gaurav Saxena, Daya Nand, Dhruv Chaturvedi, Keshav Maheshwari, Kunal Gola, Pawan Thakur, Shaik Sadiq, IBM Db2, GL Bajaj Group of Institutions (Mathura), IIC, NexaSphere.

#IBMDb2 #Db2Hack #IBMDb2TechXSummit2026 #VectorSearch #GLBajajMathura

---

## Tags (type each as @name in LinkedIn and pick the match from the menu)

The tag line is inside the post text above. LinkedIn turns each name into a tag only when you pick it from the @ menu.
If a tag does not resolve, post first and add it in the first comment.

| Tag | Type | Source line (research/organizers.md at git fc3356e, section 4 "LinkedIn requirement") |
|---|---|---|
| Gaurav Saxena (Program Director, IBM Db2) | person | "Organising team LinkedIn profiles (VERIFIED, site SPEAKERS)": linkedin.com/in/gaurav-saxena-95044594/ |
| Daya Nand (Senior Db2 Development Manager) | person | same line: linkedin.com/in/2mrdaya/ |
| Dhruv Chaturvedi (Event SPOC) | person | same line: linkedin.com/in/dhruvinsights/ |
| Keshav Maheshwari | person | same line: linkedin.com/in/keshav-maheshwari-666738186/ |
| Kunal Gola | person | same line: linkedin.com/in/kunal-gola-459030203/ |
| Pawan Thakur | person | same line: linkedin.com/in/pawanthakurindia/ |
| Shaik Sadiq | person | same line: linkedin.com/in/shaik-sadiq-068a39242/ |
| IBM Db2 (page) | page | "Organiser bodies: IBM, GL Bajaj Group of Institutions (Mathura), Institution's Innovation Council (IIC), NexaSphere." The IBM company-page handle is UNKNOWN: pick the IBM Db2 page (or IBM) from the @ menu. |
| GL Bajaj Group of Institutions, Mathura (page) | page | same "Organiser bodies" line |
| Institution's Innovation Council (IIC) (page) | page | same "Organiser bodies" line |
| NexaSphere (page) | page | same "Organiser bodies" line |

Not tagged: Yagnik Sharma and Vikas Kumar Sharma (student coordinators on Luma; no LinkedIn URLs found), and any judge not listed on the official event pages.
Rule being met: Devpost /rules and Luma: "Share the project use case on LinkedIn and tag the organising team." No exact handles or hashtags are published (research/rules.md line 165, research/devpost.md section 4.5).

## Hashtags in the post

#IBMDb2 #Db2Hack #IBMDb2TechXSummit2026 #VectorSearch #GLBajajMathura
Source: hashtags the organisers use in their YouTube descriptions (organizers.md, "Hashtags the organisers themselves use"). Optional swaps if space allows: #Db2 #IBM #Db2Hackathon.

## Short variant (2 lines, for a repost or comment)

Ask Db2 for 10 vector results under a 10% row permission and you get 2.05 on average (recall 0.205). William Lu and I built NEEDLE for IBM Db2Hack 2026: 10 of 10 rows, recall 0.987-1.000 on 89 held-out queries, 0 leaks.
Demo: [VIDEO_URL]  Code: https://github.com/wiiqz/IBM2026  #IBMDb2 #Db2Hack

## Evidence for each number

- 2.05 of 10 rows, recall 0.205, 36 of 170 empty, 21 candidates: needle/README.md "What we found" items 3 and 4; needle/docs/evidence/rcac_real.md.
- Router 10 of 10 rows, recall 0.987 to 1.000 (1.000 / 1.000 / 1.000 / 0.988 / 0.987), 0 leaks, 89 held-out queries: needle/README.md item 7; rcac_real.md held-out table.
- Cause wording ("one query plan", "21 candidates for 10"): README items 1 to 3. The post does not say "not a bug"; README item 6 says "not an RCAC defect" if you want to add it in a comment.
- William Lu built the web UI: needle/README.md team table (William, github.com/wiiqz, "User interface, demo and presentation").
- Wording checks: the post has none of first, only, unique, novel, guaranteed or safe; no emoji.

## Open points

- Team size: research/organizers.md section 0 says the event is "Solo only" (event site, Luma, Unstop) while this entry names two people. Confirm before posting that the post's "William and I" wording matches what the Unstop and Google Form entries declare.
- [VIDEO_URL] and [PR_URL] are not final until the video and PR exist.
