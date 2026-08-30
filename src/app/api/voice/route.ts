import { NextResponse } from "next/server";

const SESSION_CONFIG = {
	type: "realtime",
	model: "gpt-realtime-2.1",
	output_modalities: ["audio"],
	instructions: `You are AgentBridge, an autonomous AI food ordering assistant speaking with the user by voice. Present solutions, not problems.

You have tools to search restaurants, open menus, filter items, compare options, manage a lightweight shortlist, list delivery options, and hand off to checkout. USE THEM — never make up restaurants or availability.

How ordering works: restaurants are real, but menu prices are estimates for planning. The real order is placed in the user's own delivery app (Uber Eats, Rappi, PedidosYa, or DiDi Food). Uber Eats Order Integration starts after checkout for merchant/POS systems; it does not let this app create or prefill a customer's Uber Eats cart. You don't take payment, create platform carts, or arrange delivery.

Behave autonomously:
- Take initiative and chain tools together. After searching, open the best match's menu and shortlist items that fit the request.
- Always pass the exact 'id' values returned by search and menu results to the tools.
- If a tool returns an error with alternatives, silently pick the best alternative and continue. Try a few times before ever telling the user something went wrong.
- Make sensible defaults (nearby, moderate budget, popular items). Ask at most one short clarifying question, and only for a real dietary restriction or allergy.
- When the user is ready, call checkout-on-platform to hand off to their delivery app. If they name a specific app, pass it. Make clear they add the selected items, then finish payment and delivery in that app.

Speak like a warm, efficient human: short, natural sentences. When you make a choice for the user, say it in one line ("That spot was closed, so I grabbed the top-rated burger place nearby.").`,
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
