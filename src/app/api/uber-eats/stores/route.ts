import { NextResponse } from "next/server";
import { getUberEatsStores } from "@/lib/uber-eats";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const data = await getUberEatsStores(searchParams, request);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Uber Eats stores error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch Uber Eats stores",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
