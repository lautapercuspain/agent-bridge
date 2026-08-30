import { NextResponse } from "next/server";
import { createUberEatsAuthorizationUrl } from "@/lib/uber-eats";

export async function GET(request: Request) {
	try {
		const state = crypto.randomUUID();
		const url = createUberEatsAuthorizationUrl(request, state);
		const response = NextResponse.redirect(url);
		response.cookies.set("uber_eats_oauth_state", state, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 10 * 60,
			path: "/api/uber-eats/oauth",
		});
		return response;
	} catch (error) {
		console.error("Uber Eats OAuth start error:", error);
		return NextResponse.json(
			{
				error: "Failed to start Uber Eats OAuth",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
