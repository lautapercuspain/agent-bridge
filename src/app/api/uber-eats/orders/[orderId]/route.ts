import { NextResponse } from "next/server";
import { getUberEatsOrder } from "@/lib/uber-eats";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	try {
		const { orderId } = await params;
		const { searchParams } = new URL(request.url);
		const data = await getUberEatsOrder(
			orderId,
			searchParams.get("expand") ?? "carts,payment",
			request,
		);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Uber Eats order error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch Uber Eats order",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
