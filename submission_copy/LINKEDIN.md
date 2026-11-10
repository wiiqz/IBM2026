# LinkedIn post (draft)

Paste the text between the two lines. Replace [VIDEO_URL] and [PR_URL]. Character count of the post body
(including hashtags, with the placeholders as written): see the line under the post.

---

Under Db2 row permissions, an analyst cleared for 10% of our advisories asked the vector index for 10 results and got 2 back on average. 36 of 170 queries got none, and when those 10% were whole topics instead of random rows, 130 did.

We found this building NEEDLE for IBM Db2Hack 2026. NEEDLE takes a vague security message, even one with no CVE yet, and finds which of your services it hits. Keyword (BM25) and vector (DiskANN) search run inside IBM Db2 under row and column access control, fused in one SQL statement. A temporal SBOM join shows which services are affected and since when.

Why? All users share one plan, and it sizes the index's first batch as if everyone sees about half the rows: 21 candidates, then each user's permission drops what they can't see. Not a bug, just a shared plan. So NEEDLE picks a depth per user: a bigger batch or an exact scan.

Result on 89 held-out queries, in both setups: 10 of 10 rows for every user, recall@10 1.000 for the 10% user, 0 permission leaks.

Demo: [VIDEO_URL]
Code: [PR_URL]

Thank you to the IBM Db2 team and the Db2Hack organizers for the workshop and the vector features we built on.

#IBMDb2TechXSummit2026 #Db2Hack #IBMDb2 #Db2 #VectorSearch

---

Character count: 1,214 with the placeholders; 1,296 with a youtu.be link and a full submission-repo PR link
(measured with Python len()). If the real links are longer, drop "#VectorSearch" first.

Tag: Gaurav Saxena (linkedin.com/in/gaurav-saxena-95044594/), Daya Nand (linkedin.com/in/2mrdaya/), Dhruv Chaturvedi (linkedin.com/in/dhruvinsights/), Keshav Maheshwari (linkedin.com/in/keshav-maheshwari-666738186/), Kunal Gola (linkedin.com/in/kunal-gola-459030203/), Pawan Thakur (linkedin.com/in/pawanthakurindia/), Shaik Sadiq (linkedin.com/in/shaik-sadiq-068a39242/); pages: IBM, GL Bajaj Group of Institutions (Mathura), Institution's Innovation Council (IIC), NexaSphere. The IBM company-page handle is UNKNOWN; pick it from LinkedIn's @ menu.

Organizer hashtags (the post uses 5 of them to stay short): #IBMDb2TechXSummit2026 #Db2TechXSummit2026 #IBM #IBMDb2 #Db2 #Db2Hack #Db2Hackathon #LangChain #Haystack #VectorSearch #AgenticAI #GenerativeAI #OpenSource #GLBajajMathura #IIC #NexaSphere

How to tag without adding text to the body: post first, then add the tags in the first comment ("Thank you @... @..."), or add them as photo tags on the attached screenshot. Both keep the body under the limit.

Evidence for each number: 10% user 2.05 rows mean, 36 of 170 zero rows, 21 candidates, held-out 1.000 vs 0.208, 10 of 10 rows, 0 leaks: `needle/docs/evidence/rcac_real.md` (findings 3 and 7, router table). "Not a bug": `rcac_real.md` finding 4 ("not an RCAC defect"). Topic-clustered visibility (130 of 170 with no rows; router 10 of 10 rows, recall 1.000 for NDL_P10, 0 leaks on held-out queries): `rcac_real.md` "Correlated visibility", `eval/results/rcac_correlated.json`.
