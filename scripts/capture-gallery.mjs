#!/usr/bin/env node
// Capture gallery-ready screenshots of AgentBridge (3:2, desktop layout).
// Drives the real WebMCP tools to reach each state, no caption overlays.
//
// Usage: node scripts/capture-gallery.mjs [url]
// Output: submission/gallery/*.png  (2880x1920 = 3:2, well under Devpost's 5 MB)

import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const URL =
	process.argv.find((a) => a.startsWith("http")) ??
	"https://agentbridge-delta.vercel.app";
const DIR = "submission/gallery";
const W = 1440;
const H = 960; // 3:2

mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
	viewport: { width: W, height: H },
	deviceScaleFactor: 2,
});
const page = await context.newPage();

const run = (name, args = {}) =>
	page.evaluate(
		async (a) => {
			const mc = navigator.modelContext;
			const t = (await mc.getTools()).find((x) => x.name === a.name);
			if (t) await mc.executeTool(t, JSON.stringify(a.args));
		},
		{ name, args },
	);
const shot = (n) => page.screenshot({ path: `${DIR}/${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);

await page.goto(URL, { waitUntil: "load" });
await page
	.waitForFunction(
		async () => {
			const mc = navigator.modelContext;
			return Boolean(mc) && (await mc.getTools()).length >= 11;
		},
		{ timeout: 20000 },
	)
	.catch(() => {});
await wait(2500);
await shot("01-storefront");

await run("search-restaurants", { category: "burgers" });
await wait(1400);
await shot("02-browse-burgers");

await run("get-restaurant-menu", { restaurantId: "char-and-cheese" });
await wait(1500);
await shot("03-restaurant-menu");

await run("add-to-cart", { itemId: "char-and-cheese-0", quantity: 2 });
await run("add-to-cart", { itemId: "Loaded Fries" });
await wait(700);
await page.click('header button:has-text("$")').catch(() => {});
await wait(900);
await shot("04-cart");

await page.click('button[aria-label="Close cart"]').catch(() => {});
await wait(500);
await run("start-checkout", {});
await wait(1200);
await shot("05-checkout");

await run("place-order", {});
await wait(3200);
await shot("06-order-tracker");

await context.close();
await browser.close();
console.log(`Saved 6 gallery screenshots to ${DIR}/`);
