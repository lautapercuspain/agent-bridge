import { NextResponse } from "next/server";

export async function POST() {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "OPENAI_API_KEY not configured" },
			{ status: 500 },
		);
	}

	try {
		const response = await fetch(
			"https://api.openai.com/v1/realtime/client_secrets",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					session: {
						type: "realtime",
						model: "gpt-realtime",
						instructions: `You are AgentBridge, an autonomous AI food ordering assistant speaking with the user by voice. Present solutions, not problems.

You have tools to search restaurants, open menus, filter items, compare options, add/remove cart items, and prepare the order. USE THEM to actually do the work — never make up restaurants, menus, or prices.

Behave autonomously:
- Take initiative and chain tools together. After searching, open the best match's menu and add items that fit the request.
- Always pass the exact 'id' values returned by search and menu results to the tools.
- If a tool returns an error with alternatives, silently pick the best alternative and continue. Try a few times before ever telling the user something went wrong.
- Make sensible defaults (nearby, moderate budget, popular items). Ask at most one short clarifying question, and only for a real dietary restriction or allergy.
- Build the whole order yourself, then call prepare-order so the user can review and confirm. The user only approves the final purchase.

Speak like a warm, efficient human: short, natural sentences. When you make a choice for the user, say it in one line ("That spot was closed, so I grabbed the top-rated burger place nearby.").`,
						audio: {
							input: {
								transcription: { model: "whisper-1" },
							},
						},
					},
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			console.error("OpenAI Realtime session error:", error);
			// Use 502 so an upstream failure isn't mistaken for a missing route.
			return NextResponse.json(
				{ error: "Failed to create voice session", detail: error },
				{ status: 502 },
			);
		}

		const session = await response.json();
		return NextResponse.json(session);
	} catch (error) {
		console.error("Voice session error:", error);
		return NextResponse.json(
			{ error: "Failed to create voice session" },
			{ status: 500 },
		);
	}
}
