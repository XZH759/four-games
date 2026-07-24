import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.LOGIN_BASE || "http://localhost:4173";
mkdirSync("qa-shots/01-initial-avatar", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const bad = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.url().includes("localhost") && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});

await page.goto(`${BASE}/nuannuan/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const layers = await page.locator("#doll .avatar-layer").count();
await page.getByRole("radio", { name: /男性/ }).click();
await page.waitForTimeout(600);
await page.getByRole("option", { name: /程序员/ }).click();
await page.waitForTimeout(700);
await page.locator(".part-row").nth(2).locator('button[data-dir="1"]').click();
await page.waitForTimeout(500);
await page.locator("#name").fill("星澜");
await page.screenshot({
  path: "qa-shots/01-initial-avatar/login-redesign-1440.png",
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({
  path: "qa-shots/01-initial-avatar/login-redesign-390.png",
  fullPage: true,
});

const summary = {
  layers,
  errors,
  bad: bad.slice(0, 15),
  role: await page.locator("#stage-role").textContent(),
  gender: await page.locator("#stage-gender").textContent(),
  parts: await page.locator(".part-row").count(),
  roles: await page.locator(".role-card").count(),
};
console.log(JSON.stringify(summary, null, 2));
await browser.close();
if (errors.length || layers < 3) process.exit(1);
