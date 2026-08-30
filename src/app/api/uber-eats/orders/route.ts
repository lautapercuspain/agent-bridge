import { NextResponse } from "next/server";
import { getRecentOrderEvents } from "@/lib/uber-eats";

// Recent order webhook events processed by this server instance (in-memory).
export async function GET() {
	return NextResponse.json({ events: getRecentOrderEvents() });
}
