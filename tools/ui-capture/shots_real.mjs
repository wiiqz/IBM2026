// Real-data screenshots for needle/docs/screenshots/ (light theme, 1600 px wide).
// usage: node shots_real.mjs <baseUrl> <outDir> <mode: login|demo>
// login mode signs in through the real form (password read from needle/.env, never printed).
import { chromium } from "playwright-core";
const CHROME = process.env.CHROME || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
import { readFileSync } from "node:fs";

const [base, out, mode = "login"] = process.argv.slice(2);
const env = Object.fromEntries(readFileSync(new URL("../../needle/.env", import.meta.url), "utf8").split("\n")
  .filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]));
const PYYAML = "heads up from #platform-sec: someone says the yaml loader we use in a few python services can run arbitrary code when it parses an untrusted config file. no CVE number in the thread. are we exposed?";

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const shot = async (name, loc) => { await page.waitForTimeout(350); await (loc ?? page).screenshot({ path: `${out}/${name}`, ...(loc ? {} : { fullPage: false }) }); console.log("saved", name); };

async function signIn(user) {
  await page.goto(base + "/#/triage");
  await page.waitForTimeout(500);
  if (mode === "demo") {
    await page.getByRole("button", { name: new RegExp(user) }).click();
  } else {
    await page.getByLabel("Db2 user ID").fill(user);
    await page.getByLabel("Password").fill(env[`${user}_PASSWORD`]);
    await page.getByRole("button", { name: "Sign in" }).click();
  }
  await page.getByTestId("run-triage").waitFor({ timeout: 60000 });
}
async function triage(query) {
  await page.locator("#q").fill(query);
  await page.getByTestId("run-triage").click();
  await page.getByTestId("router-line").waitFor({ timeout: 180000 });
}

const what = process.argv[5] ?? "all";
if (what === "all" || what === "triage") {
  await signIn("NDL_JUNIOR");
  await triage(PYYAML);
  await page.setViewportSize({ width: 1600, height: 1780 });
  await shot("01_triage_ranking.png");
  // exposure + memo
  await page.getByTestId("memo-btn").click();
  await page.getByTestId("memo-text").waitFor({ timeout: 300000 }).catch(() => console.log("memo did not finish"));
  const ex = page.getByRole("region", { name: "Affected services" });
  await ex.scrollIntoViewIfNeeded();
  const [top, bottom] = await page.evaluate(() => {
    const a = document.querySelector("section[aria-label='Affected services']").getBoundingClientRect();
    const b = document.querySelector("[data-testid=memo]").getBoundingClientRect();
    return [a.top + scrollY, b.bottom + scrollY];
  });
  await page.screenshot({ path: `${out}/02_exposure_memo.png`, fullPage: true,
    clip: { x: 0, y: top - 24, width: 1600, height: bottom - top + 48 } });
  console.log("saved 02_exposure_memo.png");
  // SQL panel, access plan tab
  await page.getByRole("button", { name: /The SQL Db2 ran/ }).click();
  await page.getByRole("tab", { name: "Access plan" }).click();
  await page.waitForTimeout(800);
  const sql = page.getByRole("region", { name: "SQL and access plan" });
  await sql.screenshot({ path: `${out}/05_explain_vector_index.png` });
  console.log("saved 05_explain_vector_index.png");
}
if (what === "all" || what === "finding") {
  await page.setViewportSize({ width: 1600, height: 1000 });
  // wait for /api/health so the header shows "Db2 <database>" with live status dots, not the loading state
  const health = page.waitForResponse((r) => r.url().includes("/api/health"), { timeout: 30000 }).catch(() => console.log("health did not answer"));
  await page.goto(base + "/#/finding");
  await health;
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/04_rcac_recall_chart.png`, clip: { x: 0, y: 0, width: 1600, height: 1000 } });
  console.log("saved 04_rcac_recall_chart.png");
  const q = await page.evaluate(() => { const b = document.querySelector("[data-testid=plan-cache]").getBoundingClientRect(); return [b.left, b.top + scrollY, b.width, b.height]; });
  await page.screenshot({ path: `${out}/06_shared_plan_cache.png`, fullPage: true, clip: { x: q[0] - 24, y: q[1] - 24, width: q[2] + 48, height: q[3] + 48 } });
  console.log("saved 06_shared_plan_cache.png");
}
if (what === "compare") {
  // needs NEEDLE_DEMO_SWITCHER=1 on the API: signs in once, then the API runs the query as three identities
  await page.setViewportSize({ width: 1600, height: 1000 });
  await signIn("NDL_SENIOR");
  await page.goto(base + "/#/finding");
  await page.getByTestId("compare").scrollIntoViewIfNeeded();
  await page.getByTestId("compare-btn").click();
  // the loading state also renders .panel skeletons; compare-diff appears only when the three results are in
  await page.getByTestId("compare-diff").waitFor({ timeout: 300000 });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => { const b = document.querySelector("[data-testid=compare]").getBoundingClientRect(); return [b.top + scrollY, b.height]; });
  await page.screenshot({ path: `${out}/03_rcac_senior_vs_junior.png`, fullPage: true, clip: { x: 0, y: r[0] + 16, width: 1600, height: r[1] + 8 } });
  console.log("saved 03_rcac_senior_vs_junior.png");
}
console.log("errors:", JSON.stringify(errs));
await browser.close();
