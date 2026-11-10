import { chromium } from "playwright-core";
const CHROME = process.env.CHROME || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
import { writeFileSync } from "node:fs";
const base = process.argv[2];
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const links = new Set();
async function grab(name) {
  const t = await p.evaluate(() => document.body.innerText);
  writeFileSync(`audit/${name}.txt`, t);
  for (const h of await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) links.add(h);
  if (/\bsafe\b/i.test(t)) console.log("WORD 'safe' on", name, t.match(/.{40}\bsafe\b.{40}/i)?.[0]);
}
await p.goto(base + "/#/home"); await p.waitForTimeout(2500); await grab("home");
await p.goto(base + "/#/finding"); await p.waitForTimeout(1500); await grab("finding");
await p.goto(base + "/#/how"); await p.waitForTimeout(1500); await grab("how");
await p.goto(base + "/#/triage"); await p.waitForTimeout(800); await grab("signin");
for (const u of ["NDL_JUNIOR", "NDL_SENIOR"]) {
  if (u === "NDL_JUNIOR") await p.getByRole("button", { name: /NDL_JUNIOR/ }).click();
  else { await p.locator("[data-testid=demo-identity]").selectOption(u); await p.waitForTimeout(800); }
  await p.getByTestId("run-triage").waitFor();
  await p.getByRole("button", { name: u === "NDL_SENIOR" ? "Pillow FlashPix, no CVE yet" : "PyYAML, a chat message" }).click();
  await p.getByTestId("run-triage").click(); await p.getByTestId("router-line").waitFor({ timeout: 120000 });
  await p.getByRole("button", { name: /The SQL Db2 ran/ }).click(); await p.waitForTimeout(400);
  await grab("triage-" + u);
}
const bad = [];
for (const h of links) {
  if (h.startsWith("/api/evidence/")) { const r = await p.request.get(base + h); if (r.status() !== 200) bad.push(`${h} -> ${r.status()}`); }
  else if (h.startsWith("#/")) { if (!["#/home", "#/triage", "#/finding", "#/how"].includes(h)) bad.push("route " + h); }
}
console.log("links checked", links.size, "bad", JSON.stringify(bad));
console.log("errors", JSON.stringify(errs));
await b.close();
