import { NextResponse } from "next/server";
import { getUberEatsConfig } from "@/lib/uber-eats";

export async function GET(request: Request) {
	return NextResponse.json({
		...getUberEatsConfig(),
		hasUserAccessToken:
			request.headers.get("cookie")?.includes("uber_eats_user_access_token=") ??
			false,
	});
}
