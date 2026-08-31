#!/usr/bin/env node
// Automated, annotated, NARRATED demo recording of AgentBridge.
//
// Drives the site's REAL WebMCP tools via navigator.modelContext.executeTool
// (the exact path an external agent uses) with on-screen captions, records the
// run to video, generates a TTS voiceover (OpenAI) timed to the visuals, and
// muxes it into a single narrated MP4.
//
// Usage:
//   node scripts/record-demo.mjs [url] [--headed] [--no-audio]
//   DEMO_URL=http://localhost:3000 node scripts/record-demo.mjs
//
// Output:
//   demo-recording/agentbridge-demo.mp4           (silent)
//   demo-recording/agentbridge-demo-narrated.mp4  (with voiceover, if a key is set)

import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const URL =
	process.argv.find((a) => a.startsWith("http")) ??
	process.env.DEMO_URL ??
	"https://agentbridge-delta.vercel.app";
const HEADED = process.argv.includes("--headed");
const NO_AUDIO = process.argv.includes("--no-audio");
const OUT_DIR = "demo-recording";
const AUDIO_DIR = join(OUT_DIR, "audio");
const W = 1440;
const H = 900;
const PAD = 0.7; // trailing silence after each narration line (s)
const MIN_BEAT = 1.8; // minimum on-screen time per beat (s)

// Each beat: an optional title card OR caption chip, an optional action
// (type into the dock, or call a WebMCP tool), and the narration line.
const BEATS = [
	{
		title: ["Agent<b>Bridge</b>", "A food marketplace built for AI agents"],
		say: "This looks like a normal food delivery app. But it was built for AI agents.",
	},
	{
		cap: ["You", "\u201cOrder two double smash burgers and check out.\u201d"],
		fill: "Order two double smash burgers and check out.",
		say: "I ask the agent to order two double smash burgers and check out.",
	},
	{
		cap: ["Agent calls", "Searching restaurants", "search-restaurants"],
		tool: ["search-restaurants", { category: "burgers" }],
		say: "The agent calls the site's Web M C P tools. First, it searches for burgers.",
	},
	{
		cap: ["Agent calls", "Opening the menu", "get-restaurant-menu"],
		tool: ["get-restaurant-menu", { restaurantId: "char-and-cheese" }],
		say: "It opens the top-rated burger spot and pulls up the menu.",
	},
	{
		cap: ["Agent calls", "Adding 2 to cart", "add-to-cart"],
		tool: ["add-to-cart", { itemId: "char-and-cheese-0", quantity: 2 }],
		say: "It adds two double smash burgers to the cart.",
	},
	{
		cap: ["Agent calls", "Starting checkout", "start-checkout"],
		tool: ["start-checkout", {}],
		say: "Then it starts checkout. Every step is a structured tool call — no scraping.",
	},
	{
		cap: ["You approve \u2192", "Placing the order", "place-order"],
		tool: ["place-order", {}],
		say: "I give the go-ahead, and the agent places the order.",
	},
	{
		cap: ["Done", "The agent completed checkout \u2014 end to end."],
		extra: 2500,
		say: "Done. The agent completed the entire order — checkout included — on AgentBridge itself.",
	},
	{
		title: ["Built on <b>WebMCP</b>", "Agents and people, on the same page."],
		say: "This is commerce built for agents and people, on the same page. Built on Web M C P.",
	},
];

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

function apiKey() {
	if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
	try {
		for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
			const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/);
			if (m) return m[1];
		}
	} catch {}
	return null;
}

const ff = (args) => execFileSync("ffmpeg", ["-y", ...args], { stdio: "ignore" });
function probeDuration(file) {
	const out = execFileSync("ffprobe", [
		"-v", "error", "-show_entries", "format=duration",
		"-of", "default=nw=1:nk=1", file,
	]).toString().trim();
	return Number.parseFloat(out) || 0;
}

async function synthesize(key) {
	mkdirSync(AUDIO_DIR, { recursive: true });
	const clips = [];
	for (let i = 0; i < BEATS.length; i++) {
		const text = BEATS[i].say;
		const mp3 = join(AUDIO_DIR, `line_${i}.mp3`);
		const wav = join(AUDIO_DIR, `line_${i}.wav`);
		const attempts = [
			{ model: "gpt-4o-mini-tts", voice: "ash", instructions: "Warm, confident, concise product-demo narration." },
			{ model: "tts-1", voice: "alloy" },
		];
		let ok = false;
		for (const a of attempts) {
			const res = await fetch("https://api.openai.com/v1/audio/speech", {
				method: "POST",
				headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
				body: JSON.stringify({ ...a, input: text, response_format: "mp3" }),
			});
			if (res.ok) {
				writeFileSync(mp3, Buffer.from(await res.arrayBuffer()));
				ok = true;
				break;
			}
		}
		if (!ok) throw new Error(`TTS failed for line ${i}`);
		ff(["-i", mp3, "-ar", "24000", "-ac", "1", wav]);
		clips.push({ wav, dur: probeDuration(wav) });
		console.log(`  narration ${i + 1}/${BEATS.length} (${clips[i].dur.toFixed(1)}s)`);
	}
	return clips;
}

async function main() {
	if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
	mkdirSync(OUT_DIR, { recursive: true });

	const key = NO_AUDIO ? null : apiKey();
	let clips = null;
	if (key) {
		console.log("Generating narration (OpenAI TTS)…");
		try {
			clips = await synthesize(key);
		} catch (e) {
			console.warn(`Narration failed (${e.message}) — recording silent.`);
			clips = null;
		}
	} else {
		console.log("No OPENAI_API_KEY / --no-audio → recording without narration.");
	}

	// Per-beat on-screen duration (seconds).
	const beatSecs = BEATS.map((b, i) => {
		const base = clips ? Math.max(clips[i].dur, MIN_BEAT) : 2.9;
		return base + PAD + (b.extra ?? 0) / 1000;
	});

	const browser = await chromium.launch({ headless: !HEADED });
	const context = await browser.newContext({
		viewport: { width: W, height: H },
		deviceScaleFactor: 2,
		recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
	});
	const page = await context.newPage();
	const recStart = Date.now();

	console.log(`Recording ${URL} …`);
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
	await page.waitForTimeout(2500);
	await page.addScriptTag({ content: ANNOTATION_JS });

	const wait = (ms) => page.waitForTimeout(ms);
	const caption = (lbl, sub, tool) =>
		page.evaluate((a) => window.__demo.caption(a.lbl, a.sub, a.tool), { lbl, sub, tool });
	const title = (t, sub) =>
		page.evaluate((a) => window.__demo.title(a.t, a.sub), { t, sub });
	const runTool = (name, args) =>
		page.evaluate(
			async (a) => {
				const mc = navigator.modelContext;
				const tools = await mc.getTools();
				const t = tools.find((x) => x.name === a.name);
				if (t) await mc.executeTool(t, JSON.stringify(a.args));
			},
			{ name, args },
		);

	const beatStart = [];
	await wait(300);
	for (let i = 0; i < BEATS.length; i++) {
		const b = BEATS[i];
		beatStart[i] = (Date.now() - recStart) / 1000;
		if (b.title) await title(b.title[0], b.title[1]);
		else if (b.cap) await caption(b.cap[0], b.cap[1], b.cap[2]);
		if (b.fill)
			await page.fill('input[placeholder*="Ask for food"]', b.fill).catch(() => {});
		if (b.tool) await runTool(b.tool[0], b.tool[1]);
		await wait(beatSecs[i] * 1000);
	}
	const videoLen = (Date.now() - recStart) / 1000;

	const video = page.video();
	await context.close();
	await browser.close();

	const rawWebm = video ? await video.path() : null;
	const webm = join(OUT_DIR, "agentbridge-demo.webm");
	if (rawWebm) renameSync(rawWebm, webm);

	const silentMp4 = join(OUT_DIR, "agentbridge-demo.mp4");
	ff(["-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silentMp4]);
	console.log(`Saved ${silentMp4}`);

	if (clips) {
		// Place each narration line at the exact time its beat appeared, then
		// pad to the video length — so audio and visuals stay in sync.
		const narration = join(AUDIO_DIR, "narration.wav");
		const args = [];
		for (const c of clips) args.push("-i", c.wav);
		const chains = clips
			.map((_, i) => {
				const d = Math.round(beatStart[i] * 1000);
				return `[${i}:a]adelay=${d}|${d}[a${i}]`;
			})
			.join(";");
		const mix = `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0[m];[m]apad[a]`;
		args.push(
			"-filter_complex", `${chains};${mix}`,
			"-map", "[a]", "-t", videoLen.toFixed(3), narration,
		);
		ff(args);

		const narratedMp4 = join(OUT_DIR, "agentbridge-demo-narrated.mp4");
		ff([
			"-i", webm, "-i", narration,
			"-c:v", "libx264", "-pix_fmt", "yuv420p",
			"-c:a", "aac", "-b:a", "160k",
			"-movflags", "+faststart", "-shortest", narratedMp4,
		]);
		console.log(`Saved ${narratedMp4}  ← narrated, ready to upload`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
