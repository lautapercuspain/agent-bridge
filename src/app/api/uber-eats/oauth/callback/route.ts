import { NextResponse } from "next/server";
import { exchangeUberEatsAuthorizationCode } from "@/lib/uber-eats";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieState = request.headers
		.get("cookie")
		?.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith("uber_eats_oauth_state="))
		?.split("=")[1];

	if (!code) {
		return NextResponse.json(
			{ error: "Missing Uber Eats authorization code" },
			{ status: 400 },
		);
	}

	if (!state || !cookieState || state !== decodeURIComponent(cookieState)) {
		return NextResponse.json(
			{ error: "Invalid Uber Eats OAuth state" },
			{ status: 400 },
		);
	}

	try {
		const token = await exchangeUberEatsAuthorizationCode(request, code);
		const response = new NextResponse(
			`<!doctype html><html><body><h1>Uber Eats connected</h1><p>You can close this tab and return to AgentBridge.</p></body></html>`,
			{ headers: { "Content-Type": "text/html; charset=utf-8" } },
		);
		const secure = process.env.NODE_ENV === "production";
		response.cookies.delete("uber_eats_oauth_state");
		response.cookies.set("uber_eats_user_access_token", token.access_token, {
			httpOnly: true,
			sameSite: "lax",
			secure,
			maxAge: token.expires_in,
			path: "/api/uber-eats",
		});
		if (token.refresh_token) {
			response.cookies.set(
				"uber_eats_user_refresh_token",
				token.refresh_token,
				{
					httpOnly: true,
					sameSite: "lax",
					secure,
					maxAge: 60 * 60 * 24 * 30,
					path: "/api/uber-eats",
				},
			);
		}
		response.cookies.set("uber_eats_user_scope", token.scope, {
			httpOnly: true,
			sameSite: "lax",
			secure,
			maxAge: token.expires_in,
			path: "/api/uber-eats",
		});
		return response;
	} catch (error) {
		console.error("Uber Eats OAuth callback error:", error);
		return NextResponse.json(
			{
				error: "Failed to exchange Uber Eats authorization code",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
