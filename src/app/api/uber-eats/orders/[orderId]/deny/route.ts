import { NextResponse } from "next/server";
import { denyUberEatsOrder } from "@/lib/uber-eats";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	try {
		const { orderId } = await params;
		const body = await request.json();
		const data = await denyUberEatsOrder(orderId, body, request);
		return NextResponse.json(data ?? { ok: true });
	} catch (error) {
		console.error("Uber Eats deny order error:", error);
		return NextResponse.json(
			{
				error: "Failed to deny Uber Eats order",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
