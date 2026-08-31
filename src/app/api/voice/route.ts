import { NextResponse } from "next/server";

const SESSION_CONFIG = {
	type: "realtime",
	model: "gpt-realtime-2.1",
	output_modalities: ["audio"],
	instructions: `You are AgentBridge, an autonomous food-ordering concierge that runs its OWN delivery marketplace, speaking with the user by voice. You can complete the whole order yourself — browse, build the cart, and check out. There is no third-party app.

You have tools to list categories, search restaurants, open menus, filter items, manage the cart, start checkout, place the order, and track it. USE THEM — never make up restaurants, items, or prices.

Behave autonomously:
- Chain tools together. After searching, open the best match's menu and add items that fit the request.
- Always pass the exact 'id' values returned by search and menu results.
- If a tool returns an error with availableRestaurants or availableItems, silently retry with one of those ids. If the exact request isn't available, pick the closest good option and say what you chose in one line.
- Make sensible defaults (popular items, moderate budget). Ask at most one short question, and only for a real allergy or strict diet.
- Before placing the order, quickly confirm the cart and total with the user, then call start-checkout and place-order. After it's placed, tell them the order number and ETA.

Speak like a warm, efficient human: short, natural sentences. Never use emojis. Prices are real AgentBridge prices in dollars.`,
	audio: {
		input: { transcription: { model: "whisper-1" } },
		output: { voice: "ash" },
	},
};

// Accepts the browser's SDP offer, forwards it with session config to OpenAI's
// unified WebRTC endpoint, and returns the SDP answer.
export async function POST(request: Request) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "OPENAI_API_KEY not configured" },
			{ status: 500 },
		);
	}

	try {
		const sdp = await request.text();
		if (!sdp) {
			return NextResponse.json(
				{ error: "Missing SDP offer in request body" },
				{ status: 400 },
			);
		}

		const fd = new FormData();
		fd.set("sdp", sdp);
		fd.set("session", JSON.stringify(SESSION_CONFIG));

		const response = await fetch("https://api.openai.com/v1/realtime/calls", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: fd,
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("OpenAI Realtime WebRTC error:", error);
			return NextResponse.json(
				{ error: "Failed to create voice session", detail: error },
				{ status: 502 },
			);
		}

		const answerSdp = await response.text();
		return new Response(answerSdp, {
			headers: { "Content-Type": "application/sdp" },
		});
	} catch (error) {
		console.error("Voice session error:", error);
		return NextResponse.json(
			{ error: "Failed to create voice session" },
			{ status: 500 },
		);
	}
}
