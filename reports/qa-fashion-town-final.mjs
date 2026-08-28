/**
 * Fashion Town final QA — Playwright smoke + viewport screenshots
 * Run: npx playwright@1.49.0 install chromium && node reports/qa-fashion-town-final.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "fashion-town-qa-screenshots");
const BASE = "http://localhost:3000";
const BOUTIQUE = "dream-atelier";

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "390x844", width: 390, height: 844 },
];

const ROUTES = [
  { slug: "town", path: "/nuannuan/town" },
  { slug: "login", path: `/nuannuan/login?from=town&boutique=${BOUTIQUE}` },
  { slug: "partner", path: `/nuannuan/partner?from=town&boutique=${BOUTIQUE}` },
  { slug: "map", path: `/nuannuan/map?boutique=${BOUTIQUE}` },
  { slug: "collect", path: `/collect?level=1&boutique=${BOUTIQUE}&arm=collect` },
  { slug: "wardrobe", path: `/nuannuan/wardrobe?boutique=${BOUTIQUE}` },
];

const SEED = {
  "nn_login_avatar_v1": JSON.stringify({
    name: "QA Explorer",
    gender: "female",
    role: "programmer",
    fashionRole: "artist",
    selection: null,
  }),
  "nn_companion_v1": "fiona",
  "nn_fashion_active_boutique": BOUTIQUE,
  "nn_fashion_town_v1": JSON.stringify({
    boutiques: {
      [BOUTIQUE]: { unlocked: ["dress"], completedChallengeIds: ["q-dream-1"] },
    },
    sharedOutfit: false,
    sessionDesigned: [],
    companionBond: { fiona: { xp: 3, level: 1 } },
    savedLooks: [],
    activeLookId: null,
  }),
  "ailit_castle_wallet_v1": JSON.stringify({ points: 120, gems: 12, lifetime: 400 }),
};

const results = [];

function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
}

mkdirSync(OUT, { recursive: true });

async function seedPage(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((data) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
  }, SEED);
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const cw = document.documentElement.clientWidth;
    return { overflow: sw > cw + 2, scrollWidth: sw, clientWidth: cw };
  });
}

async function captureScreenshots(browser) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await seedPage(page);
    for (const route of ROUTES) {
      const errors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(String(err)));
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(600);
      const ov = await checkOverflow(page);
      const file = join(OUT, `${route.slug}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      record(
        `viewport ${vp.name} · ${route.slug} no horizontal overflow`,
        !ov.overflow,
        ov.overflow ? `scroll=${ov.scrollWidth} client=${ov.clientWidth}` : file,
      );
      if (errors.length) {
        record(`console ${route.slug} @ ${vp.name}`, false, errors.slice(0, 3).join(" | "));
      } else {
        record(`console ${route.slug} @ ${vp.name}`, true, "0 errors");
      }
    }
    await ctx.close();
  }
}

async function testMigration(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const legacy = {
    boutiques: {
      [BOUTIQUE]: { unlocked: ["dress", "tops"] },
    },
    sharedOutfit: true,
    sessionDesigned: [{ boutiqueId: BOUTIQUE, moduleId: "dress" }],
  };
  await page.evaluate((raw) => {
    localStorage.clear();
    localStorage.setItem("nn_fashion_town_v1", JSON.stringify(raw));
  }, legacy);
  await page.goto(`${BASE}/nuannuan/town`, { waitUntil: "networkidle" });
  const loaded = await page.evaluate((boutiqueId) => {
    const raw = JSON.parse(localStorage.getItem("nn_fashion_town_v1") || "{}");
    const b = raw.boutiques?.[boutiqueId];
    return {
      unlocked: b?.unlocked || [],
      sharedOutfit: raw.sharedOutfit,
      sessionDesignedLen: (raw.sessionDesigned || []).length,
    };
  }, BOUTIQUE);
  const pass =
    loaded.unlocked.includes("dress") &&
    loaded.unlocked.includes("tops") &&
    loaded.sharedOutfit === true;
  record("legacy nn_fashion_town_v1 migration preserves progress", pass, JSON.stringify(loaded));
}

async function testSettleRefresh(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ boutique }) => {
      localStorage.clear();
      localStorage.setItem("nn_login_avatar_v1", JSON.stringify({ name: "QA", gender: "female", role: "programmer" }));
      localStorage.setItem("nn_companion_v1", "fiona");
      localStorage.setItem("nn_fashion_active_boutique", boutique);
      localStorage.setItem(
        "nn_fashion_town_v1",
        JSON.stringify({
          boutiques: { [boutique]: { unlocked: ["dress"], completedChallengeIds: ["E-1-Q1"] } },
          sessionDesigned: [],
          companionBond: { fiona: { xp: 5, level: 1 } },
        }),
      );
      localStorage.setItem(
        `ailit_progress_collect_${boutique}`,
        JSON.stringify({
          answers: { "E-1-Q1": "A", "E-2-Q1": "B", "E-3-Q1": "C" },
          index: 3,
          arm: "collect",
          boutiqueId: boutique,
          updatedAt: Date.now(),
        }),
      );
      localStorage.setItem(
        "nn_collect_settle_pending",
        JSON.stringify({
          boutiqueId: boutique,
          designed: [{ boutiqueId: boutique, moduleId: "dress" }],
          at: Date.now(),
        }),
      );
    },
    { boutique: BOUTIQUE },
  );
  await page.goto(`${BASE}/collect?level=1&boutique=${BOUTIQUE}&arm=collect`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector("#phase-settle:not([hidden])", { timeout: 20000 });
  const before = await page.evaluate((boutiqueId) => {
    const raw = JSON.parse(localStorage.getItem("nn_fashion_town_v1") || "{}");
    return {
      unlocked: raw.boutiques?.[boutiqueId]?.unlocked?.length || 0,
      bondXp: raw.companionBond?.fiona?.xp || 0,
    };
  }, BOUTIQUE);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#phase-settle:not([hidden])", { timeout: 20000 });
  const after = await page.evaluate((boutiqueId) => {
    const raw = JSON.parse(localStorage.getItem("nn_fashion_town_v1") || "{}");
    return {
      unlocked: raw.boutiques?.[boutiqueId]?.unlocked?.length || 0,
      bondXp: raw.companionBond?.fiona?.xp || 0,
    };
  }, BOUTIQUE);
  record(
    "settle refresh does not duplicate unlock/rewards",
    before.unlocked === after.unlocked && before.bondXp === after.bondXp,
    `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`,
  );
}

async function testInvalidBoutique(page) {
  await page.goto(`${BASE}/nuannuan/town?boutique=not-a-real-shop`, { waitUntil: "networkidle" });
  const toast = await page.locator("#town-toast.is-visible").textContent().catch(() => "");
  record("invalid boutique shows notice on town", Boolean(toast && toast.length > 0), toast || "no toast");
}

async function testReducedMotion(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedPage(page);
  await page.goto(`${BASE}/nuannuan/map?boutique=${BOUTIQUE}`, { waitUntil: "networkidle" });
  const animCount = await page.evaluate(() => {
    const styles = [...document.styleSheets].flatMap((ss) => {
      try {
        return [...ss.cssRules].filter((r) => r.type === CSSRule.KEYFRAMES_RULE).map((r) => r.name);
      } catch {
        return [];
      }
    });
    const running = [...document.querySelectorAll("*")].filter((el) => {
      const a = getComputedStyle(el).animationName;
      return a && a !== "none";
    });
    return { keyframes: styles.length, runningAnimations: running.length };
  });
  record(
    "reduced-motion map has no running CSS animations",
    animCount.runningAnimations === 0,
    JSON.stringify(animCount),
  );
}

async function testI18nToggle(page) {
  await seedPage(page);
  await page.goto(`${BASE}/nuannuan/town`, { waitUntil: "networkidle" });
  const toggle = page.locator(".lang-toggle, .lang-host button, #lang-host button").first();
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(400);
    const ov = await checkOverflow(page);
    const lang = await page.evaluate(() => document.documentElement.lang);
    record("i18n toggle town no overflow", !ov.overflow, `lang=${lang}`);
  } else {
    record("i18n toggle town", false, "toggle not found");
  }
}

async function testCollectQuizFlow(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/collect?level=1&boutique=${BOUTIQUE}&arm=collect`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector("#ft-quiz-actions:not([hidden])", { timeout: 20000 });

  const opt = page.locator(".opt-btn").first();
  if (await opt.count()) {
    await opt.click();
    await page.click("#btn-submit");
    await page.waitForTimeout(900);
  }

  const wrongOpt = page.locator(".opt-btn").nth(1);
  if (await wrongOpt.count()) {
    await wrongOpt.click();
    await page.click("#btn-submit");
    await page.waitForTimeout(400);
    const fb = await page.locator("#ft-feedback:not([hidden])").count();
    record("wrong answer shows feedback, no unlock flash", fb > 0, `feedback visible=${fb > 0}`);
  }

  for (let i = 0; i < 4; i += 1) {
    const atSettle = await page.locator("#phase-settle:not([hidden])").count();
    if (atSettle > 0) break;
    const skipBtn = page.locator("#btn-skip-ft");
    if (!(await skipBtn.count())) break;
    await skipBtn.click();
    await page.waitForTimeout(700);
  }
  const atSettle = await page.locator("#phase-settle:not([hidden])").count();
  record("quiz flow reaches settle after skip", atSettle > 0, `settle visible=${atSettle > 0}`);
}

async function testWardrobeSave(page) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ boutique }) => {
      localStorage.clear();
      localStorage.setItem("nn_login_avatar_v1", JSON.stringify({ name: "QA", gender: "female", role: "programmer", fashionRole: "artist" }));
      localStorage.setItem("nn_companion_v1", "fiona");
      localStorage.setItem("nn_fashion_active_boutique", boutique);
      localStorage.setItem(
        "nn_fashion_town_v1",
        JSON.stringify({
          boutiques: {
            [boutique]: { unlocked: ["dress", "tops", "skirt"], completedChallengeIds: [] },
          },
          savedLooks: [],
        }),
      );
    },
    { boutique: BOUTIQUE },
  );
  await page.goto(`${BASE}/nuannuan/wardrobe?boutique=${BOUTIQUE}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#wr-shell:not([hidden])", { timeout: 15000 });
  await page.click('.wr-filter[data-filter="top"]');
  await page.waitForSelector(".wr-module-card", { timeout: 10000 });
  const card = page.locator(".wr-module-card").first();
  if (await card.count()) {
    await card.click();
    await page.fill("#wr-look-name", "QA Look Alpha");
    await page.click("#btn-save-look");
    await page.waitForTimeout(500);
    const count1 = await page.evaluate(() => JSON.parse(localStorage.getItem("nn_fashion_town_v1")).savedLooks.length);
    await page.fill("#wr-look-name", "QA Look Alpha");
    await page.click("#btn-save-look");
    await page.waitForTimeout(400);
    const count2 = await page.evaluate(() => JSON.parse(localStorage.getItem("nn_fashion_town_v1")).savedLooks.length);
    record("duplicate look name does not create second entry", count1 === count2 && count1 >= 1, `count=${count1}`);
  } else {
    record("wardrobe save look", false, "no module cards");
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const skipShots = process.env.SKIP_SCREENSHOTS === "1";
  try {
    if (!skipShots) await captureScreenshots(browser);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await testMigration(page);
    await testSettleRefresh(page);
    await testInvalidBoutique(page);
    await testReducedMotion(page);
    await testI18nToggle(page);
    await testCollectQuizFlow(page);
    await testWardrobeSave(page);
    await ctx.close();
  } finally {
    await browser.close();
  }

  const reportPath = join(__dir, "fashion-town-final-qa-results.json");
  writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length }, null, 2));
  if (failed.length) {
    console.log("\nFailures:");
    failed.forEach((f) => console.log(`  ✗ ${f.name}: ${f.detail}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
