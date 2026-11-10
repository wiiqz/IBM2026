"""NEEDLE demo video pipeline (end to end, re-runnable).

Run with the VIDEO venv (not needle/.venv):
    .venv\\Scripts\\python.exe make_video.py                               # all scenes -> out/needle_demo.mp4
    .venv\\Scripts\\python.exe make_video.py --scenes s1,s2 --out out/test_clip.mp4
    .venv\\Scripts\\python.exe make_video.py --script-only                 # TTS + DEMO_SCRIPT.md timing only

Steps: edge-tts narration per beat (cached) -> DEMO_SCRIPT.md (measured timing) -> HTML slides rendered by
Playwright -> live app capture (Playwright record_video, actions timed to the narration) -> one H.264/AAC
segment per scene -> concat -> loudnorm -> verification frames.
The script starts the NEEDLE Streamlit app itself (NEEDLE_DEMO_SWITCHER=1) unless one is already running on the
port, and stops the server it started. It never prints credentials (the app reads needle/.env itself).
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import scenes as S
import slides

ROOT = Path(__file__).resolve().parent
NEEDLE = ROOT.parent / "needle"
BUILD = ROOT / "build"
OUT = ROOT / "out"
FPS = 30
W, H = 1920, 1080
REC_W, REC_H = 1440, 810                   # app capture size (CSS px), upscaled x4/3
LEAD, GAP, TAIL = 0.5, 0.4, 0.7          # seconds: before first beat, between beats, after last beat
MAX_TOTAL_S = 178.0                        # hard stop (external limit: under 3 minutes)
TARGET_S = 170.0                           # our own target: warn above it, do not stop
WPM_NOTE = 150


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def run(cmd: list[str], logfile: Path | None = None) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if logfile:
        logfile.parent.mkdir(parents=True, exist_ok=True)
        with logfile.open("a", encoding="utf-8") as f:
            f.write("$ " + " ".join(cmd) + "\n" + r.stderr[-6000:] + "\n")
    if r.returncode != 0:
        raise RuntimeError(f"command failed ({r.returncode}): {' '.join(cmd[:6])} ...\n{r.stderr[-1500:]}")


def probe_duration(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


# ------------------------------------------------------------------------------------------------ TTS
async def _tts(text: str, voice: str, rate: str, path: Path) -> None:
    import edge_tts
    await edge_tts.Communicate(text, voice, rate=rate).save(str(path))


def tts_all(voice: str, rate: str) -> dict:
    """One MP3 per beat, cached by (voice, rate, text). Returns {scene_id: [(mp3, seconds), ...]}."""
    adir = BUILD / "audio"
    adir.mkdir(parents=True, exist_ok=True)
    plan, todo = {}, []
    for sc in S.SCENES:
        plan[sc["id"]] = []
        for i, b in enumerate(sc["beats"]):
            say = S.say(b["text"])
            h = hashlib.sha1(f"{voice}|{rate}|{say}".encode()).hexdigest()[:10]
            p = adir / f"{sc['id']}_b{i + 1}_{h}.mp3"
            plan[sc["id"]].append(p)
            if not p.exists() or p.stat().st_size < 1000:
                todo.append((say, p))

    async def one(say: str, p: Path) -> None:
        for attempt in range(3):
            try:
                await _tts(say, voice, rate, p)
                return
            except Exception as e:  # network hiccup
                log(f"edge-tts retry {attempt + 1} for {p.name}: {e}")
                await asyncio.sleep(2)
        raise RuntimeError(f"edge-tts failed for {p.name}")

    async def all_missing() -> None:  # the service is slow per request; run the clips concurrently
        await asyncio.gather(*(one(s, p) for s, p in todo))

    if todo:
        log(f"edge-tts: {len(todo)} new clips")
        asyncio.run(all_missing())
    return {sid: [(p, probe_duration(p)) for p in ps] for sid, ps in plan.items()}


def planned_seconds(clips) -> float:
    return LEAD + sum(d for _, d in clips) + GAP * (len(clips) - 1) + TAIL


# ------------------------------------------------------------------------------------------------ script doc
def write_script_md(audio: dict, voice: str, rate: str, timing: dict) -> float:
    rows, total, words = [], 0.0, 0
    for sc in S.SCENES:
        clips = audio[sc["id"]]
        plan = planned_seconds(clips)
        actual = timing.get(sc["id"])
        sec = actual if actual else plan
        total += sec
        for i, (b, (_, d)) in enumerate(zip(sc["beats"], clips)):
            words += len(b["text"].split())
            head = f"**{sc['id']} {sc['title']}** ({sec:.1f} s{' measured' if actual else ' planned'})" if i == 0 else ""
            ev = "<br>".join(b["evidence"])
            rows.append(f"| {head} | {sc['id']}.{i + 1} | {d:.1f} | {b['action']} | {b['text']} | {ev} |")
    talk = sum(d for c in audio.values() for _, d in c)
    md = f"""# NEEDLE demo video: script and shot table

Generated by `make_video.py` from `scenes.py` (single source; edit `scenes.py`, then re-run). Voice: {voice}, rate {rate}.
Narration: {words} words, {talk:.1f} s of speech ({words / talk * 60:.0f} wpm). Planned video length: **{total:.1f} s**
(target {TARGET_S:.0f} s = 2:50, warning only; hard stop {MAX_TOTAL_S:.0f} s; external limit under 3 min). Scene seconds = LEAD {LEAD} s + clips + GAP {GAP} s between beats + TAIL {TAIL} s;
app scenes are measured from the last capture when one exists (actions can run longer than the narration).

Audience: IBM engineers. Voice: first person "we", short sentences. Every number in the narration and on the slides
comes from the evidence file in the last column (paths relative to `C:\\Users\\ganes\\IBM26\\needle\\`). Slides parse
their numbers from those files at render time.

| Scene | Beat | Narration s | On-screen action | Narration text | Evidence |
|---|---|---|---|---|---|
""" + "\n".join(rows) + f"""

## Run

```
cd C:\\Users\\ganes\\IBM26\\video
.venv\\Scripts\\python.exe make_video.py                                  # full render -> out\\needle_demo.mp4
.venv\\Scripts\\python.exe make_video.py --scenes s1,s2 --out out\\test_clip.mp4
.venv\\Scripts\\python.exe make_video.py --repo-url https://github.com/...  # closing-card link
```

Prerequisites: Db2 port forward on localhost:50000, Ollama on localhost:11434, `needle/.env`. The script starts the
app with `NEEDLE_DEMO_SWITCHER=1` on port 8599 (or reuses a running one) and stops what it started.

## Open items before the final render

- s3 is backed by `docs/evidence/rcac_demo_case.txt` (NDL_SENIOR rank 1, NDL_JUNIOR not returned). The render
  stops if that file is missing.
- s4c asserts the on-screen router text at capture time ('2,616 of 26,210', 'exact scan', 'top 10'); a mismatch stops
  the render instead of narrating a wrong number.
- s5 uses the recorded offline memo test (`docs/evidence/app_llm_memo_offline.txt`); the live database holds no
  planted injection.
- Closing card repo link: placeholder until `--repo-url` is given.
- s4 numbers re-checked against the final `docs/evidence/rcac_real.md` (findings 2-4, 7) and its wording rules.
- FINAL render only after the orchestrator says "render" (UI frozen after code freeze).
- App scenes need Db2 (localhost:50000) and Ollama (localhost:11434) up; one capture of all app scenes takes ~3 min.
"""
    (ROOT / "DEMO_SCRIPT.md").write_text(md, encoding="utf-8")
    return total


# ------------------------------------------------------------------------------------------------ slides
def render_slides(names: set[str], repo_url: str) -> dict:
    from playwright.sync_api import sync_playwright
    sdir = BUILD / "slides"
    sdir.mkdir(parents=True, exist_ok=True)
    build = {
        "hook": lambda: slides.hook(S.HOOK_MSG),
        "plan": lambda: slides.plan((NEEDLE / "docs/evidence/rcac_real_tables.md").read_text(encoding="utf-8")),
        "chart": lambda: slides.chart(NEEDLE / "eval/results/rcac_recall_vs_selectivity.png",
                                      json.loads((NEEDLE / "eval/results/rcac_recall_vs_selectivity.json")
                                                 .read_text(encoding="utf-8"))),
        "verifier": lambda: slides.verifier((NEEDLE / "docs/evidence/app_llm_memo_offline.txt")
                                            .read_text(encoding="utf-8")),
        "close": lambda: slides.close(repo_url),
    }
    out = {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
        for n in sorted(names):
            html_doc = build[n]()
            (sdir / f"{n}.html").write_text(html_doc, encoding="utf-8")
            pg.set_content(html_doc, wait_until="networkidle", timeout=30000)
            pg.evaluate("() => document.fonts.ready")
            pg.wait_for_timeout(300)
            png = sdir / f"{n}.png"
            pg.screenshot(path=str(png))
            out[n] = png
            log(f"slide {n} -> {png.name}")
        br.close()
    return out


# ------------------------------------------------------------------------------------------------ app server
def app_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url + "/_stcore/health", timeout=2) as r:
            return r.status == 200
    except Exception:
        return False


def start_app(url: str, port: int) -> subprocess.Popen | None:
    if app_up(url):
        log(f"app already running at {url} (reused; it must have been started with NEEDLE_DEMO_SWITCHER=1)")
        return None
    env = dict(os.environ, NEEDLE_DEMO_SWITCHER="1", PYTHONIOENCODING="utf-8")
    logf = (BUILD / "streamlit_run.log").open("w", encoding="utf-8")
    py = NEEDLE / ".venv/Scripts/python.exe"
    proc = subprocess.Popen([str(py), "-m", "streamlit", "run", "src/needle/app.py", "--server.headless", "true", "--server.fileWatcherType", "none",
                             "--server.port", str(port)], cwd=NEEDLE, env=env, stdout=logf, stderr=subprocess.STDOUT)
    for _ in range(120):
        if app_up(url):
            log(f"app started at {url} (pid {proc.pid}, NEEDLE_DEMO_SWITCHER=1)")
            return proc
        if proc.poll() is not None:
            raise RuntimeError("streamlit exited early; see build/streamlit_run.log")
        time.sleep(0.5)
    proc.terminate()
    raise RuntimeError("streamlit did not become healthy in 60 s")


def stop_app(proc) -> None:
    if proc and proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(10)
        except subprocess.TimeoutExpired:
            proc.kill()
        log("app stopped")


# ------------------------------------------------------------------------------------------------ capture
OVERLAY_CSS = """
#vid-cap { position: fixed; right: 28px; bottom: 28px; max-width: 820px; z-index: 2147483000;
  background: rgba(22,22,22,.94); color: #fff; font: 500 19px/1.35 'IBM Plex Sans','Segoe UI',sans-serif;
  padding: 12px 18px; border-left: 4px solid #0f62fe; opacity: 0; transition: opacity .35s; pointer-events: none; }
#vid-cur { position: fixed; left: 900px; top: 500px; width: 26px; height: 26px; margin: -13px 0 0 -13px;
  border-radius: 50%; background: rgba(15,98,254,.22); border: 2px solid #0f62fe; z-index: 2147483001;
  pointer-events: none; opacity: 0; transition: left .5s ease, top .5s ease, transform .15s, opacity .3s; }
#vid-cur.down { transform: scale(.65); background: rgba(15,98,254,.55); }
.ndl-section, [data-testid="stExpander"] { scroll-margin-top: 20px; }
"""
INSTALL_JS = """(css) => {
  if (document.getElementById('vid-style')) return;
  const s = document.createElement('style'); s.id = 'vid-style'; s.textContent = css; document.head.appendChild(s);
  const c = document.createElement('div'); c.id = 'vid-cap'; document.body.appendChild(c);
  const k = document.createElement('div'); k.id = 'vid-cur'; document.body.appendChild(k);
}"""


class AppDriver:
    def __init__(self, page):
        self.page = page
        self.user = None

    def overlay(self):
        self.page.evaluate(INSTALL_JS, OVERLAY_CSS)

    def caption(self, text: str | None):
        self.overlay()
        self.page.evaluate("(t) => { const c = document.getElementById('vid-cap'); c.textContent = t || '';"
                           " c.style.opacity = t ? 1 : 0; }", text or "")

    def click(self, loc):
        loc.scroll_into_view_if_needed()
        box = loc.bounding_box()
        if box:
            self.overlay()
            self.page.evaluate("([x, y]) => { const k = document.getElementById('vid-cur'); k.style.opacity = 1;"
                               " k.style.left = x + 'px'; k.style.top = y + 'px'; }",
                               [box["x"] + box["width"] / 2, box["y"] + box["height"] / 2])
            self.page.wait_for_timeout(450)
            self.page.evaluate("() => document.getElementById('vid-cur').classList.add('down')")
        loc.click()
        self.page.wait_for_timeout(160)
        self.page.evaluate("() => { const k = document.getElementById('vid-cur'); if (!k) return;"
                           " k.classList.remove('down'); setTimeout(() => { k.style.opacity = 0; }, 700); }")

    def settle(self, ms: int = 400):
        """Wait until Streamlit is idle (no spinner, no running status)."""
        self.page.wait_for_timeout(ms)
        self.page.wait_for_function(
            "() => !document.querySelector('[data-testid=\"stSpinner\"]') &&"
            " !document.querySelector('[data-testid=\"stStatusWidget\"] [data-testid=\"stStatusWidgetRunningIcon\"]')",
            timeout=90000)

    # ---- actions
    def type_query(self, text: str):
        ta = self.page.get_by_label("Advisory or chat message")
        if ta.count() == 0:
            ta = self.page.locator("[data-testid='stSidebar'] textarea").first
        self.click(ta)
        self.page.keyboard.press("Control+A")
        self.page.keyboard.press("Delete")
        self.page.keyboard.type(text, delay=24)
        self.page.keyboard.press("Control+Enter")
        self.settle(500)

    def paste_query(self, text: str):
        ta = self.page.get_by_label("Advisory or chat message")
        if ta.count() == 0:
            ta = self.page.locator("[data-testid='stSidebar'] textarea").first
        self.click(ta)
        self.page.keyboard.press("Control+A")
        self.page.keyboard.press("Delete")
        self.page.wait_for_timeout(450)
        ta.fill(text)  # looks like a paste
        self.page.keyboard.press("Control+Enter")
        self.settle(500)

    def ensure_query(self, text: str):
        """Paste only if the text area does not already hold this text (the app's default sample)."""
        ta = self.page.locator("[data-testid='stSidebar'] textarea").first
        if ta.input_value().strip() != text.strip():
            self.paste_query(text)

    def select_user(self, user: str):
        p = self.page
        radio = p.locator("[data-testid='stRadio'] label", has_text=re.compile(rf"^\s*{user}\s*$"))
        if radio.count():
            self.click(radio.first)
        else:
            boxes = p.locator("[data-testid='stSelectbox']")
            target, cur = None, ""
            for i in range(boxes.count()):
                bx = boxes.nth(i)
                # Streamlit 1.67 keeps the selected value in an <input>, not in the element text.
                txt = bx.inner_text() + " " + bx.evaluate(
                    "e => [...e.querySelectorAll('input')].map(i => i.value + ' ' + "
                    "(i.getAttribute('aria-label') || '')).join(' ') + ' ' + e.textContent")
                if "NDL_" in txt or re.search(r"identity|Db2 user", txt, re.I):
                    target, cur = bx, txt
                    break
            if target is None:
                raise RuntimeError("no user switcher found: is NEEDLE_DEMO_SWITCHER=1 set for the app?")
            if user not in cur:
                # Streamlit 1.67: react-aria combobox (input role=combobox + button aria-label "Open").
                ctl = target.get_by_role("button", name="Open")
                if ctl.count() == 0:
                    ctl = target.get_by_role("combobox")
                self.click(ctl.first)
                # option labels may carry a description ("NDL_P10 - Analyst with 10% visibility ...")
                self.click(p.get_by_role("option", name=re.compile("^" + re.escape(user))).first)
        self.user = user
        self.settle(500)

    def run(self):
        p = self.page
        self.click(p.get_by_role("button", name="Run triage"))
        t0 = time.monotonic()
        while time.monotonic() - t0 < 120:
            chip = p.locator(".ndl-chip", has_text=f"User {self.user}")
            spin = p.locator("[data-testid='stSpinner']")
            if chip.count() and not spin.count():
                break
            err = p.locator("[data-testid='stAlert']", has_text=re.compile("unavailable|failed", re.I))
            if err.count():
                raise RuntimeError("app error: " + err.first.inner_text()[:300])
            p.wait_for_timeout(250)
        else:
            raise RuntimeError("Run triage did not finish in 120 s")
        self.settle(600)

    def scroll_to(self, title: str):
        loc = self.page.locator(".ndl-section", has_text=title).first
        loc.evaluate("el => el.scrollIntoView({behavior: 'smooth', block: 'start'})")
        self.page.wait_for_timeout(1300)

    def _expander(self, title: str):
        return self.page.locator("[data-testid='stExpander']", has_text=title).first

    def open_expander(self, title: str):
        ex = self._expander(title)
        if not ex.locator("details[open]").count():
            self.click(ex.locator("summary").first)
        self.page.wait_for_timeout(500)

    def close_expander(self, title: str):
        ex = self._expander(title)
        if ex.locator("details[open]").count():
            self.click(ex.locator("summary").first)
        self.page.wait_for_timeout(300)

    def scroll_to_expander(self, title: str):
        self._expander(title).evaluate("el => el.scrollIntoView({behavior: 'smooth', block: 'start'})")
        self.page.wait_for_timeout(1300)

    def pause(self, seconds: float):
        self.page.wait_for_timeout(int(seconds * 1000))

    def expect_text(self, text: str):
        """Fail the capture if the narrated text is not on the page (numbers must match the screen)."""
        if self.page.get_by_text(text, exact=False).count() == 0:
            raise RuntimeError(f"expected on-screen text not found: {text!r}")

    def caption_from_depth_line(self):
        """Caption = the app's own router line, so the caption can never disagree with the screen."""
        loc = self.page.locator(".ndl-note", has_text=re.compile(r"^\s*Search depth \d+")).first
        self.caption(loc.inner_text().strip() if loc.count() else None)

    def click_tab(self, prefix: str):
        self.click(self.page.get_by_role("tab", name=re.compile("^" + re.escape(prefix))).first)
        self.page.wait_for_timeout(500)


def capture_app_scene(sc: dict, clips, url: str) -> dict:
    from playwright.sync_api import sync_playwright
    cdir = BUILD / "capture"
    tmp = cdir / f"tmp_{sc['id']}"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        br = p.chromium.launch()
        # Playwright records CSS pixels (device_scale_factor is ignored by the screencast). Record 1440x810 so the
        # UI text is larger, then upscale to 1920x1080 with lanczos in build_segment.
        ctx = br.new_context(viewport={"width": REC_W, "height": REC_H}, device_scale_factor=1,
                             record_video_dir=str(tmp), record_video_size={"width": REC_W, "height": REC_H})
        page = ctx.new_page()
        t_ref = time.monotonic()
        now = lambda: time.monotonic() - t_ref  # noqa: E731
        try:
            page.goto(url, wait_until="domcontentloaded")
            page.locator("[data-testid='stSidebar']").wait_for(timeout=60000)
            page.get_by_role("button", name="Run triage").wait_for(timeout=60000)
            d = AppDriver(page)
            d.overlay()
            page.evaluate("() => document.fonts.ready")
            page.wait_for_timeout(1200)
            start = now() - LEAD
            marks = []
            for b, (_, dur) in zip(sc["beats"], clips):
                m = now()
                marks.append(m - start)
                d.caption(b.get("caption"))
                for act in b.get("do", []):
                    getattr(d, act[0])(*act[1:])
                target = m + dur + GAP
                if now() > target:
                    log(f"  {sc['id']}: actions overran the narration by {now() - target:.1f} s")
                while now() < target:
                    page.wait_for_timeout(50)
            page.wait_for_timeout(int((TAIL - GAP) * 1000) if TAIL > GAP else 0)
            end = now()
            video = Path(page.video.path())
        finally:
            ctx.close()
            br.close()
    webm = cdir / f"{sc['id']}.webm"
    shutil.move(str(video), webm)
    shutil.rmtree(tmp, ignore_errors=True)
    info = {"webm": str(webm), "ss": round(start, 3), "dur": round(end - start, 3), "marks": [round(x, 3) for x in marks]}
    (cdir / f"{sc['id']}.json").write_text(json.dumps(info, indent=1), encoding="utf-8")
    log(f"captured {sc['id']}: {info['dur']:.1f} s, beat marks {info['marks']}")
    return info


# ------------------------------------------------------------------------------------------------ segments
def build_segment(sc: dict, clips, video_in: dict, out: Path) -> float:
    if sc["kind"] == "still":
        dur = planned_seconds(clips)
        marks, t = [], LEAD
        for _, d in clips:
            marks.append(t)
            t += d + GAP
        nf = int(round(dur * FPS))
        vin = ["-i", str(video_in["png"])]
        vf = (f"[0:v]scale=3840:2160,zoompan=z='1+0.035*on/{nf}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
              f"d={nf}:s={W}x{H}:fps={FPS}")
    else:
        dur, marks = video_in["dur"], video_in["marks"]
        vin = ["-ss", f"{video_in['ss']:.3f}", "-t", f"{dur:.3f}", "-i", video_in["webm"]]
        vf = f"[0:v]fps={FPS},scale={W}:{H}:flags=lanczos,setsar=1"
    vf += f",fade=t=in:st=0:d=0.3,fade=t=out:st={dur - 0.35:.3f}:d=0.35,format=yuv420p[v]"
    cmd = ["ffmpeg", "-y", "-hide_banner", *vin, "-f", "lavfi", "-t", f"{dur:.3f}", "-i",
           "anullsrc=r=48000:cl=stereo"]
    af = []
    for i, ((mp3, _), m) in enumerate(zip(clips, marks)):
        cmd += ["-i", str(mp3)]
        ms = int(round((m + 0.15) * 1000))
        af.append(f"[{i + 2}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
                  f"adelay=delays={ms}:all=1[a{i}]")
    mix = "[1:a]" + "".join(f"[a{i}]" for i in range(len(clips)))
    af.append(f"{mix}amix=inputs={len(clips) + 1}:normalize=0:duration=first[a]")
    cmd += ["-filter_complex", vf + ";" + ";".join(af), "-map", "[v]", "-map", "[a]", "-t", f"{dur:.3f}",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS), "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out)]
    run(cmd, BUILD / "ffmpeg.log")
    return dur


def assemble(segs: list[Path], out: Path) -> None:
    lst = BUILD / "concat.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in segs), encoding="utf-8")
    joined = BUILD / "joined.mp4"
    run(["ffmpeg", "-y", "-hide_banner", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)],
        BUILD / "ffmpeg.log")
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-hide_banner", "-i", str(joined), "-c:v", "copy", "-af",
         "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", str(out)], BUILD / "ffmpeg.log")


def extract_frames(video: Path, n: int, extra: list[float] | None = None) -> list[Path]:
    dur = probe_duration(video)
    fdir = OUT / "frames"
    fdir.mkdir(parents=True, exist_ok=True)
    times = extra or [dur * (i + 1) / (n + 1) for i in range(n)]
    outs = []
    for t in times:
        f = fdir / f"{video.stem}_{t:06.1f}s.png"
        run(["ffmpeg", "-y", "-hide_banner", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1", str(f)])
        outs.append(f)
    return outs


# ------------------------------------------------------------------------------------------------ main
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", default="all", help="comma list of scene ids (default all)")
    ap.add_argument("--out", default=str(OUT / "needle_demo.mp4"))
    ap.add_argument("--voice", default="en-US-AndrewNeural")
    ap.add_argument("--rate", default="+10%")
    ap.add_argument("--repo-url", default="github.com/<repo>  ·  PR <link>  (placeholder)")
    ap.add_argument("--port", type=int, default=8599)
    ap.add_argument("--script-only", action="store_true")
    ap.add_argument("--reuse-capture", action="store_true", help="reuse build/capture/<id>.webm if present")
    ap.add_argument("--allow-missing-evidence", action="store_true")
    ap.add_argument("--frames", type=int, default=3)
    a = ap.parse_args()
    url = f"http://127.0.0.1:{a.port}"
    BUILD.mkdir(exist_ok=True)
    (BUILD / "ffmpeg.log").write_text("", encoding="utf-8")

    log("TTS ...")
    audio = tts_all(a.voice, a.rate)
    tfile = BUILD / "timing.json"
    timing = json.loads(tfile.read_text()) if tfile.exists() else {}
    total = write_script_md(audio, a.voice, a.rate, timing)
    log(f"DEMO_SCRIPT.md written; planned total {total:.1f} s (target {TARGET_S:.0f} s, stop {MAX_TOTAL_S:.0f} s)")
    for sc in S.SCENES:
        if sc.get("max_s") and planned_seconds(audio[sc["id"]]) > sc["max_s"]:
            log(f"WARNING {sc['id']} planned {planned_seconds(audio[sc['id']]):.1f} s > {sc['max_s']} s")
    if a.script_only:
        return 0

    wanted = [sc for sc in S.SCENES if a.scenes == "all" or sc["id"] in a.scenes.split(",")]
    for sc in wanted:
        req = sc.get("requires")
        if req and not (NEEDLE / req).exists() and not a.allow_missing_evidence:
            log(f"STOP: {sc['id']} requires {req}, which does not exist yet (use --allow-missing-evidence to override)")
            return 2

    pngs = render_slides({sc["slide"] for sc in wanted if sc["kind"] == "still"}, a.repo_url)
    proc = None
    caps = {}
    try:
        app_scenes = [sc for sc in wanted if sc["kind"] == "app"]
        if app_scenes:
            reuse = a.reuse_capture and all((BUILD / "capture" / f"{sc['id']}.json").exists() for sc in app_scenes)
            if not reuse:
                proc = start_app(url, a.port)
            for sc in app_scenes:
                cj = BUILD / "capture" / f"{sc['id']}.json"
                if reuse:
                    caps[sc["id"]] = json.loads(cj.read_text())
                else:
                    log(f"capturing {sc['id']} ...")
                    caps[sc["id"]] = capture_app_scene(sc, audio[sc["id"]], url)
    finally:
        stop_app(proc)

    segs = []
    sdir = BUILD / "segments"
    sdir.mkdir(exist_ok=True)
    for sc in wanted:
        vin = {"png": pngs[sc["slide"]]} if sc["kind"] == "still" else caps[sc["id"]]
        seg = sdir / f"{sc['id']}.mp4"
        d = build_segment(sc, audio[sc["id"]], vin, seg)
        timing[sc["id"]] = round(d, 2)
        segs.append(seg)
        log(f"segment {sc['id']}: {d:.1f} s")
    tfile.write_text(json.dumps(timing, indent=1), encoding="utf-8")
    total = write_script_md(audio, a.voice, a.rate, timing)

    out = Path(a.out)
    assemble(segs, out)
    dur = probe_duration(out)
    log(f"OUTPUT {out} duration {dur:.2f} s; full-video estimate {total:.1f} s "
        f"(target {TARGET_S:.0f} s, stop {MAX_TOTAL_S:.0f} s)")
    if a.scenes == "all" and dur > MAX_TOTAL_S:
        log(f"ERROR: video is {dur:.1f} s > {MAX_TOTAL_S:.0f} s (hard stop)")
        return 3
    if a.scenes == "all" and dur > TARGET_S:
        log(f"WARNING: video is {dur:.1f} s > {TARGET_S:.0f} s target (still under the {MAX_TOTAL_S:.0f} s stop)")
    for f in extract_frames(out, a.frames):
        log(f"frame {f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
