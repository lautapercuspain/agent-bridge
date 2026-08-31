#!/usr/bin/env node
// Automated, annotated demo recording of AgentBridge.
//
// Drives the site's REAL WebMCP tools via navigator.modelContext.executeTool
// (the exact path an external agent uses) while overlaying captions, and
// records the whole thing to a video with Playwright.
//
// Usage:
//   node scripts/record-demo.mjs [url] [--headed]
//   DEMO_URL=http://localhost:3000 node scripts/record-demo.mjs
//
// Output: demo-recording/agentbridge-demo.webm (+ .mp4 if ffmpeg is available)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const URL =
	process.argv.find((a) => a.startsWith("http")) ??
	process.env.DEMO_URL ??
	"https://agentbridge-delta.vercel.app";
const HEADED = process.argv.includes("--headed");
const OUT_DIR = "demo-recording";
const W = 1440;
const H = 900;

const ANNOTATION_JS = `
(() => {
  if (window.__demo) return;
  const s = document.createElement('style');
  s.textContent = \`
    #demo-anno{position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:Geist,system-ui,sans-serif}
    #demo-cap{position:absolute;left:50%;bottom:44px;transform:translate(-50%,14px);opacity:0;transition:all .5s cubic-bezier(.32,.72,0,1);display:flex;align-items:center;gap:14px;background:rgba(23,20,15,.92);color:#fff;padding:15px 22px;border-radius:9999px;box-shadow:0 24px 60px -22px rgba(0,0,0,.7);max-width:92vw}
    #demo-cap.show{opacity:1;transform:translate(-50%,0)}
    #demo-cap .lbl{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ff7a54;white-space:nowrap}
    #demo-cap .sub{font-size:19px;font-weight:600;white-space:nowrap}
    #demo-cap .chip{font-size:13px;font-weight:700;background:#ff5a2c;color:#fff;padding:5px 12px;border-radius:9999px;white-space:nowrap;font-family:ui-monospace,monospace}
    #demo-title{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(251,250,248,.9);opacity:0;transition:opacity .6s ease}
    #demo-title.show{opacity:1}
    #demo-title .badge{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#e2440f;background:#fff1ec;padding:7px 16px;border-radius:9999px}
    #demo-title .t{font-size:66px;font-weight:800;letter-spacing:-.03em;color:#17140f;text-align:center}
    #demo-title .t b{color:#ff5a2c}
    #demo-title .s{font-size:22px;font-weight:500;color:#6b6560;text-align:center;max-width:70%}
  \`;
  document.head.appendChild(s);
  const root = document.createElement('div');
  root.id = 'demo-anno';
  root.innerHTML =
    '<div id="demo-title"><div class="badge">WebMCP</div><div class="t"></div><div class="s"></div></div>' +
    '<div id="demo-cap"><span class="lbl"></span><span class="sub"></span></div>';
  document.body.appendChild(root);
  const cap = root.querySelector('#demo-cap');
  const title = root.querySelector('#demo-title');
  window.__demo = {
    caption(lbl, sub, tool) {
      title.classList.remove('show');
      cap.querySelector('.lbl').textContent = lbl || '';
      cap.querySelector('.sub').textContent = sub || '';
      const old = cap.querySelector('.chip'); if (old) old.remove();
      if (tool) { const c = document.createElement('span'); c.className = 'chip'; c.textContent = tool; cap.appendChild(c); }
      cap.classList.add('show');
    },
    title(t, sub) {
      cap.classList.remove('show');
      title.querySelector('.t').innerHTML = t;
      title.querySelector('.s').textContent = sub || '';
      title.classList.add('show');
    },
    clear() { cap.classList.remove('show'); title.classList.remove('show'); },
  };
})();
`;

async function main() {
	if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
	mkdirSync(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: !HEADED });
	const context = await browser.newContext({
		viewport: { width: W, height: H },
		deviceScaleFactor: 2,
		recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
	});
	const page = await context.newPage();

	console.log(`Recording ${URL} …`);
	await page.goto(URL, { waitUntil: "load" });

	// Wait until WebMCP tools are registered and the storefront has painted.
	await page
		.waitForFunction(
			async () => {
				const mc = navigator.modelContext;
				return Boolean(mc) && (await mc.getTools()).length >= 11;
			},
			{ timeout: 20000 },
		)
		.catch(() => {});
	await page.waitForTimeout(2500);
	await page.addScriptTag({ content: ANNOTATION_JS });

	const wait = (ms) => page.waitForTimeout(ms);
	const caption = (lbl, sub, tool) =>
		page.evaluate((a) => window.__demo.caption(a.lbl, a.sub, a.tool), {
			lbl,
			sub,
			tool,
		});
	const title = (t, sub) =>
		page.evaluate((a) => window.__demo.title(a.t, a.sub), { t, sub });
	const clear = () => page.evaluate(() => window.__demo.clear());
	const runTool = (name, args = {}) =>
		page.evaluate(
			async (a) => {
				const mc = navigator.modelContext;
				const tools = await mc.getTools();
				const t = tools.find((x) => x.name === a.name);
				if (t) await mc.executeTool(t, JSON.stringify(a.args));
			},
			{ name, args },
		);

	// --- Sequence -----------------------------------------------------------
	await title("Agent<b>Bridge</b>", "A food marketplace built for AI agents");
	await wait(3000);
	await clear();
	await wait(500);

	await caption("You", "“Order two double smash burgers and check out.”");
	await page
		.fill(
			'input[placeholder*="Ask for food"]',
			"Order two double smash burgers and check out.",
		)
		.catch(() => {});
	await wait(2800);

	await caption("Agent calls", "Searching restaurants", "search-restaurants");
	await runTool("search-restaurants", { category: "burgers" });
	await wait(2700);

	await caption("Agent calls", "Opening the menu", "get-restaurant-menu");
	await runTool("get-restaurant-menu", { restaurantId: "char-and-cheese" });
	await wait(2700);

	await caption("Agent calls", "Adding 2 to cart", "add-to-cart");
	await runTool("add-to-cart", { itemId: "char-and-cheese-0", quantity: 2 });
	await wait(2500);

	await caption("Agent calls", "Starting checkout", "start-checkout");
	await runTool("start-checkout", {});
	await wait(2700);

	await caption("You approve →", "Placing the order", "place-order");
	await runTool("place-order", {});
	await wait(3200);

	await caption(
		"Done",
		"The agent completed checkout — no scraping, no handoff.",
	);
	await wait(5200);

	await title("Built on <b>WebMCP</b>", "Agents and people, on the same page.");
	await wait(3500);
	// -----------------------------------------------------------------------

	const video = page.video();
	await context.close();
	await browser.close();

	if (!video) {
		console.error("No video captured.");
		return;
	}
	const raw = await video.path();
	const webm = join(OUT_DIR, "agentbridge-demo.webm");
	renameSync(raw, webm);
	console.log(`Saved ${webm}`);

	// Best-effort convert to mp4 for easy sharing/upload.
	try {
		const mp4 = join(OUT_DIR, "agentbridge-demo.mp4");
		execFileSync(
			"ffmpeg",
			["-y", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4],
			{ stdio: "ignore" },
		);
		console.log(`Saved ${mp4}`);
	} catch {
		console.log("ffmpeg not available — keeping .webm only.");
	}

	// Clean up any stray video files Playwright may have left.
	for (const f of readdirSync(OUT_DIR)) {
		if (f.endsWith(".webm") && f !== "agentbridge-demo.webm") {
			rmSync(join(OUT_DIR, f), { force: true });
		}
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
