import { NextResponse } from "next/server";
import { acceptUberEatsOrder } from "@/lib/uber-eats";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	try {
		const { orderId } = await params;
		const body = await request.json().catch(() => ({}));
		const data = await acceptUberEatsOrder(orderId, body, request);
		return NextResponse.json(data ?? { ok: true });
	} catch (error) {
		console.error("Uber Eats accept order error:", error);
		return NextResponse.json(
			{
				error: "Failed to accept Uber Eats order",
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}
}
