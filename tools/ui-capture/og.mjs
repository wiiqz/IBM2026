// Poster capture of the live landing hero (real cloud, real readout). usage: node og.mjs <base> <out.png> <w> <h>
import { chromium } from "playwright-core";
const CHROME = process.env.CHROME || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
const [base, out, w = "1200", h = "630"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
await p.goto(base + "/#/home"); await p.waitForTimeout(2000);
const c = p.getByTestId("hero-controls");
await c.getByRole("radio", { name: "10% analyst" }).click();
await p.waitForTimeout(1600);
const got = (await c.locator("p").first().innerText()).split(" of ")[0].trim();
const mark = await p.evaluate(() => document.querySelector("header svg").outerHTML);
await p.evaluate(({ got, mark, h }) => {
  document.querySelector("header").style.display = "none";
  const hero = document.querySelector("[data-testid=hero]");
  const stage = hero.lastElementChild;
  Object.assign(stage.style, { height: h + "px", maxHeight: "none", minHeight: "0" });
  for (const sel of ["[data-testid=hero-controls]", "[data-testid=hero-cta]"]) hero.querySelector(sel).parentElement.style.display = sel.includes("cta") ? "none" : "";
  hero.querySelector("[data-testid=hero-controls]").style.display = "none";
  hero.querySelector("h1 + p").style.display = "none";
  hero.querySelectorAll("p.font-mono, [data-testid=pause-motion]").forEach((e) => (e.style.display = "none"));
  const h1 = hero.querySelector("h1");
  h1.style.fontSize = Math.round(h * 0.2) + "px";
  const sub = document.createElement("p");
  sub.textContent = "Hybrid search and row access control, inside IBM Db2.";
  Object.assign(sub.style, { marginTop: "18px", fontSize: Math.round(h * 0.044) + "px", color: "#c9d2d5", lineHeight: "1.25" });
  h1.after(sub);
  const top = document.createElement("div");
  top.innerHTML = mark.replace('width="24" height="24"', 'width="34" height="34"') + '<span>NEEDLE</span>';
  Object.assign(top.style, { position: "absolute", top: "34px", left: "40px", display: "flex", gap: "12px", alignItems: "center",
    font: "600 20px 'Red Hat Mono Variable', monospace", letterSpacing: "0.1em", color: "#f3f7f9", zIndex: 20 });
  stage.appendChild(top);
  const rd = document.createElement("div");
  rd.innerHTML = `a 10% analyst asks Db2 for 10<br>and gets <b style="color:#ff5b4f;font-size:1.5em">${got}</b>`;
  Object.assign(rd.style, { position: "absolute", right: "44px", bottom: "40px", textAlign: "right", zIndex: 20,
    font: "500 " + Math.round(h * 0.034) + "px/1.35 'Red Hat Mono Variable', monospace", color: "#c9d2d5" });
  stage.appendChild(rd);
  window.scrollTo(0, 0);
}, { got, mark, h: +h });
await p.waitForTimeout(900);
await p.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } });
await b.close();
console.log("saved", out, "readout", got);
