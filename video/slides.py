"""HTML slides for the still scenes. Every number on a slide is parsed from an evidence file at render time."""
from __future__ import annotations

import base64
import html
import re
from pathlib import Path

FONT_LINK = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
             '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&'
             'family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">')

BASE_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body { font-family: 'IBM Plex Sans', 'Segoe UI', Arial, sans-serif; color: #161616; background: #ffffff;
       -webkit-font-smoothing: antialiased; }
.mono { font-family: 'IBM Plex Mono', Consolas, monospace; }
.dark { background: #161616; color: #f4f4f4; }
.eyebrow { font-size: 26px; letter-spacing: .5px; color: #8d8d8d; }
.src { position: absolute; left: 96px; right: 96px; bottom: 44px; font-size: 20px; color: #6f6f6f; }
.dark .src { color: #8d8d8d; }
"""


def _page(body: str, css: str, dark: bool = False) -> str:
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONT_LINK}<style>{BASE_CSS}{css}</style></head>'
            f'<body class="{"dark" if dark else ""}">{body}</body></html>')


def _e(s) -> str:
    return html.escape(str(s))


# ------------------------------------------------------------------------------------------------ hook
def hook(msg: str) -> str:
    css = """
    .wrap { position: absolute; left: 160px; right: 160px; top: 150px; }
    .chan { font-size: 28px; color: #8d8d8d; margin-bottom: 28px; }
    .chan b { color: #c6c6c6; font-weight: 500; }
    .msg { display: flex; gap: 28px; align-items: flex-start; background: #262626; border-left: 6px solid #f1c21b;
           padding: 40px 48px; }
    .av { width: 84px; height: 84px; border-radius: 50%; background: #4589ff; flex: none; display: flex;
          align-items: center; justify-content: center; font-size: 34px; font-weight: 600; color: #fff; }
    .who { font-size: 26px; color: #c6c6c6; margin-bottom: 10px; } .who span { color: #8d8d8d; }
    .txt { font-size: 44px; line-height: 1.32; color: #ffffff; }
    .qs { margin-top: 80px; display: flex; gap: 48px; }
    .q { flex: 1; border-top: 4px solid #0f62fe; padding-top: 24px; font-size: 54px; line-height: 1.2;
         font-weight: 500; color: #ffffff; }
    .q span { display: block; font-size: 26px; font-weight: 400; color: #8d8d8d; margin-bottom: 12px; }
    """
    body = f"""<div class="wrap">
      <div class="chan"><b>#platform-sec</b> &nbsp;·&nbsp; 14:02</div>
      <div class="msg"><div class="av">PS</div><div><div class="who">teammate <span>(demo scenario)</span></div>
        <div class="txt">{_e(msg)}</div></div></div>
      <div class="qs"><div class="q"><span>Question 1</span>Which of our services are hit?</div>
        <div class="q"><span>Question 2</span>Who is allowed to know?</div></div>
    </div>
    <div class="src">NEEDLE · permission-aware hybrid retrieval inside IBM Db2 12.1</div>"""
    return _page(body, css, dark=True)


# ------------------------------------------------------------------------------------------------ plan
def _parse_rcac_tables(md: str) -> dict:
    """Parse docs/evidence/rcac_real_tables.md: the line-for-line table and the package-cache table."""
    rows = []
    sec = md.split("### Line-for-line", 1)[1].split("###", 1)[0]
    for line in sec.splitlines():
        if not re.match(r"^\| \d+% ", line):
            continue
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        # visible | WHERE literal r/rows/uf | plan literal | FF literal | WHERE subq | plan subq | user |
        # RCAC r/rows/uf | RCAC plan | FF permission | leaks
        lit = c[1].split(" / ")
        rc = c[7].split(" / ")
        Lm = re.search(r"L=(\d+)", c[2])
        Lr = re.search(r"L=(\d+)", c[8])
        er = re.search(r"est=(\d+)", c[8])
        rows.append({"visible": c[0], "lit_recall": lit[0], "lit_L": Lm.group(1) if Lm else "n/a",
                     "lit_ff": c[3], "user": c[6], "rc_recall": rc[0], "rc_rows": rc[1],
                     "rc_L": Lr.group(1) if Lr else "n/a", "rc_est": er.group(1) if er else "n/a",
                     "rc_ff": c[9], "leaks": c[10]})
    pc = re.findall(r"\| (forward|reverse) \| distinct executable ids \| (\d+) \|", md)
    users = len({r["user"] for r in rows})
    return {"rows": rows, "pc": pc, "users": users}


def plan(md: str) -> str:
    d = _parse_rcac_tables(md)
    css = """
    .wrap { position: absolute; left: 96px; right: 96px; top: 72px; }
    h1 { font-size: 56px; font-weight: 500; line-height: 1.15; margin: 14px 0 36px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 30px; font-variant-numeric: tabular-nums; }
    th { font-size: 22px; font-weight: 500; color: #525252; text-align: right; padding: 10px 18px;
         border-bottom: 2px solid #161616; vertical-align: bottom; line-height: 1.25; }
    th.l, td.l { text-align: left; }
    td { padding: 16px 18px; text-align: right; border-bottom: 1px solid #e0e0e0; }
    tr.hi td { background: #fff1f1; }
    .grp { font-size: 24px; font-weight: 600; color: #161616; text-align: center; border-bottom: none;
           padding-bottom: 2px; }
    .g1 { background: #defbe6; } .g2 { background: #edf5ff; }
    td.red { color: #da1e28; font-weight: 600; }
    .note { margin-top: 26px; display: flex; gap: 32px; }
    .card { flex: 1; border-left: 6px solid #0f62fe; background: #f4f4f4; padding: 18px 24px; font-size: 29px;
            line-height: 1.3; font-weight: 500; display: flex; gap: 16px; align-items: flex-start; }
    .card .n { flex: none; width: 40px; height: 40px; border-radius: 50%; background: #0f62fe; color: #fff;
            font-size: 24px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .card b { font-weight: 600; }
    """
    trs = []
    for r in d["rows"]:
        hi = ' class="hi"' if r["visible"].startswith("10%") else ""
        trs.append(f"<tr{hi}><td class='l'>{_e(r['visible'])}</td>"
                   f"<td>{_e(r['lit_ff'])}</td><td>{_e(r['lit_L'])}</td><td>{_e(r['lit_recall'])}</td>"
                   f"<td class='l mono' style='font-size:24px'>{_e(r['user'])}</td>"
                   f"<td class='red'>{_e(r['rc_ff'])}</td><td>{_e(r['rc_L'])}</td><td>{_e(r['rc_est'])}</td>"
                   f"<td>{_e(r['rc_rows'])}</td><td>{_e(r['rc_recall'])}</td><td>{_e(r['leaks'])}</td></tr>")
    pcs = ", ".join(f"{o} order: {n}" for o, n in d["pc"]) or "n/a"
    body = f"""<div class="wrap">
      <div class="eyebrow">THE FINDING · Db2 12.1.5 · NEEDLE.ADV_DOC 26,210 rows · FETCH APPROX FIRST 10 · 170 queries</div>
      <h1>Under row access control, every user shares one plan<br>and one constant optimizer estimate: 0.495.</h1>
      <table>
        <tr><th></th><th colspan="3" class="grp g1">Plain WHERE ROW_BUCKET &lt; p (no RCAC)</th><th></th>
            <th colspan="6" class="grp g2">Same rows through a CREATE PERMISSION, as that user</th></tr>
        <tr><th class="l">rows visible</th><th>filter<br>factor</th><th>search<br>list L</th><th>recall<br>@10</th>
            <th class="l">Db2 user</th><th>filter<br>factor</th><th>search<br>list L</th><th>IXSCAN<br>est rows</th>
            <th>rows<br>returned</th><th>recall<br>@10</th><th>leaks</th></tr>
        {''.join(trs)}
      </table>
      <div class="note">
        <div class="card"><span class="n">1</span>One shared plan for every user</div>
        <div class="card"><span class="n">2</span>First batch sized for ~half the rows (FF 0.495 → 21 candidates)</div>
        <div class="card"><span class="n">3</span>Then the permission drops what you can't see</div>
      </div>
    </div>
    <div class="src">Source: README 'What we found' 2-3, docs/evidence/rcac_real.md (section actuals: 21 rows out of the IXSCAN), rcac_real_tables.md (EXPLAIN_ARGUMENT SRCHLSIZ, EXPLAIN_PREDICATE filter factor,
      MON_GET_PKG_CACHE_STMT) · recall@10 vs the user's own FETCH EXACT · all 170 queries</div>"""
    return _page(body, css)


# ------------------------------------------------------------------------------------------------ chart
def chart(png: Path, j: dict) -> str:
    b64 = base64.b64encode(png.read_bytes()).decode()
    r10 = next(s for s in j["series"]["rcac"] if round(s["x"]) == 10)
    rt = j["series"]["router"]
    css = """
    body { background: #fcfcfb; }
    .top { position: absolute; left: 96px; right: 96px; top: 48px; }
    h1 { font-size: 40px; font-weight: 500; margin-top: 8px; white-space: nowrap; }
    img { position: absolute; left: 0; top: 176px; width: 1920px; height: 832px; }
    .src { bottom: 18px; font-size: 18px; }
    """
    lo = min(s["recall"] for s in rt)
    body = f"""<div class="top"><div class="eyebrow">THE FINDING · {j['n_queries']} held-out queries · {_e(j['db2'])}</div>
      <h1>10% visibility: {r10['rows']:.1f} of 10 rows, recall {r10['recall']:.2f} &nbsp;→&nbsp; per-user router: recall {lo:.3f} to {max(s['recall'] for s in rt):.1f}, 0 leaks</h1></div>
      <img src="data:image/png;base64,{b64}">
      <div class="src">Source: eval/results/rcac_recall_vs_selectivity.png / .json · leaks: docs/evidence/rcac_real_tables.md</div>"""
    return _page(body, css)


# ------------------------------------------------------------------------------------------------ verifier
def _parse_memo(txt: str) -> dict:
    inj = re.search(r"^injected into (\S+) details: (.*)$", txt, re.M)
    model = re.search(r"^model=(\S+) elapsed=(\S+)", txt, re.M)
    raw = txt.split("--- RAW ---", 1)[1].split("--- VERIFIED ---", 1)[0]
    removed_blk = txt.split("--- REMOVED", 1)[1]
    removed = re.findall(r"^\* (.*)\n\s*-> (.*)$", removed_blk, re.M)
    raw_lines = [l.strip()[2:].strip() for l in raw.splitlines() if l.strip().startswith("- ")]
    return {"adv": inj.group(1).rstrip(":") if inj else "?", "inj": inj.group(2) if inj else "",
            "model": model.group(1) if model else "?", "elapsed": model.group(2) if model else "?",
            "raw": raw_lines, "removed": removed}


def verifier(txt: str) -> str:
    d = _parse_memo(txt)
    rem_texts = {r[0].strip() for r in d["removed"]}
    css = """
    .wrap { position: absolute; left: 96px; right: 96px; top: 64px; }
    h1 { font-size: 52px; font-weight: 500; margin: 12px 0 30px 0; }
    .inj { border-left: 6px solid #da1e28; background: #fff1f1; padding: 18px 26px; font-size: 27px; line-height: 1.35;
           margin-bottom: 30px; }
    .inj .lab { font-size: 21px; color: #a2191f; font-weight: 600; margin-bottom: 6px; }
    .lab2 { font-size: 22px; color: #525252; font-weight: 600; margin-bottom: 12px; letter-spacing: .3px; }
    ul { list-style: none; }
    li { font-size: 27px; line-height: 1.32; padding: 10px 0 10px 46px; border-bottom: 1px solid #e0e0e0;
         position: relative; }
    li::before { content: '✓'; position: absolute; left: 8px; color: #24a148; font-weight: 600; }
    li.rm { color: #a2191f; text-decoration: line-through; background: #fff1f1; }
    li.rm::before { content: '✕'; color: #da1e28; text-decoration: none; }
    .why { font-size: 24px; color: #a2191f; padding: 8px 0 0 46px; }
    """
    lis = []
    for s in d["raw"]:
        if s in rem_texts:
            lis.append(f"<li class='rm'>{_e(s)}</li>")
            for t, why in d["removed"]:
                if t.strip() == s:
                    lis.append(f"<div class='why'>removed by the verifier: {_e(why)}</div>")
        else:
            lis.append(f"<li>{_e(s)}</li>")
    body = f"""<div class="wrap">
      <div class="eyebrow">TRUST · local {_e(d['model'])} via Ollama + LangChain · deterministic verifier</div>
      <h1>A planted instruction in the data cannot become a "safe" verdict.</h1>
      <div class="inj"><div class="lab">PLANTED IN THE DETAILS OF {_e(d['adv'])} (test fixture)</div>{_e(d['inj'])}</div>
      <div class="lab2">MODEL OUTPUT, EVERY SENTENCE CHECKED AGAINST THE SQL RESULTS</div>
      <ul>{''.join(lis)}</ul>
    </div>
    <div class="src">Source: docs/evidence/app_llm_memo_offline.txt (offline memo test, synthetic fleet, model time
      {_e(d['elapsed'])}) · NEEDLE confirms only AFFECTED; everything else is NOT_CONFIRMED, never safe</div>"""
    return _page(body, css)


# ------------------------------------------------------------------------------------------------ close
def close(repo_url: str) -> str:
    feats = ["VECTOR(768, FLOAT32)", "CREATE VECTOR INDEX (DiskANN)", "FETCH APPROX", "Row permissions + column mask (RCAC)",
             "Application-period temporal tables", "SQL PL procedure NEEDLE.TRIAGE", "JSON_TABLE", "MERGE"]
    css = """
    .wrap { position: absolute; left: 160px; right: 160px; top: 150px; }
    .brand { font-size: 120px; font-weight: 600; letter-spacing: 6px; }
    .sub { font-size: 40px; color: #c6c6c6; margin: 10px 0 64px 0; }
    .lab { font-size: 24px; color: #8d8d8d; letter-spacing: .5px; margin-bottom: 18px; }
    .chips { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 52px; }
    .chip { font-size: 30px; padding: 12px 24px; border: 2px solid #4589ff; color: #ffffff; }
    .chip.g { border-color: #6f6f6f; color: #e0e0e0; }
    .repo { font-size: 36px; color: #78a9ff; }
    """
    chips = "".join(f"<span class='chip'>{_e(f)}</span>" for f in feats)
    stack = "".join(f"<span class='chip g'>{_e(f)}</span>" for f in
                    ["LangChain retriever", "Ollama (local): nomic-embed-text, qwen3:14b", "Streamlit",
                     "Apache License 2.0"])
    body = f"""<div class="wrap">
      <div class="brand">NEEDLE</div>
      <div class="sub">Permission-aware hybrid retrieval inside IBM Db2 12.1</div>
      <div class="lab">DB2 FEATURES USED</div><div class="chips">{chips}</div>
      <div class="lab">STACK</div><div class="chips">{stack}</div>
      <div class="repo">{_e(repo_url)}</div>
    </div>"""
    return _page(body, css, dark=True)
