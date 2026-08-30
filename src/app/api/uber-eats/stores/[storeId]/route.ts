import { NextResponse } from "next/server";
import { getUberEatsStore } from "@/lib/uber-eats";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ storeId: string }> },
) {
	try {
		const { storeId } = await params;
		const { searchParams } = new URL(request.url);
		const data = await getUberEatsStore(
			storeId,
			searchParams.get("expand"),
			request,
		);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Uber Eats store error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch Uber Eats store",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
