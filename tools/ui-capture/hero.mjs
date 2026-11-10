import { chromium } from "playwright-core";
const CHROME = process.env.CHROME || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
const [base, out, w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: CHROME, args: ["--use-angle=metal", "--enable-gpu"] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(base + "/#/home"); await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}-a.png` });
const c = p.getByTestId("hero-controls");
if (await c.count()) {
  await c.getByRole("radio", { name: "10% analyst" }).click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}-b.png` });
  await c.getByRole("radio", { name: "NEEDLE router" }).click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}-c.png` });
}
await p.screenshot({ path: `${out}-full.png`, fullPage: true });
console.log("errors:", JSON.stringify(errs));
await b.close();
