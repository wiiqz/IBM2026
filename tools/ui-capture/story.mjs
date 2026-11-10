import { chromium } from "playwright-core";
const CHROME = process.env.CHROME || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(process.argv[2] + "/#/home"); await p.waitForTimeout(2200);
const total = await p.evaluate(() => { const s = document.querySelector("[data-testid=hero]"); return s.getBoundingClientRect().height - innerHeight; });
console.log("story scroll span", Math.round(total));
for (const [i, f] of [[1, 0.2], [2, 0.42], [3, 0.66], [4, 0.9]]) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `story-${i}.png` });
}
await p.evaluate(() => window.scrollTo(0, document.querySelector("[data-testid=hero]").getBoundingClientRect().height + scrollY));
await p.waitForTimeout(600); await p.screenshot({ path: "story-after.png" });
console.log("errors", JSON.stringify(errs));
await b.close();
