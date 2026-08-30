import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const event = await request.json();
		console.log("Uber Eats order webhook:", JSON.stringify(event));
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Uber Eats webhook error:", error);
		return NextResponse.json(
			{
				error: "Failed to process Uber Eats webhook",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 400 },
		);
	}
}
