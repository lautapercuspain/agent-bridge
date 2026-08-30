import { NextResponse } from "next/server";
import type { Order } from "@/types";

const orders: Order[] = [];

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const order: Order = {
			id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			items: body.items,
			restaurantId: body.restaurantId,
			restaurantName: body.restaurantName,
			subtotal: body.subtotal,
			tax: body.tax,
			deliveryFee: body.deliveryFee,
			total: body.total,
			status: "confirmed",
			createdAt: new Date().toISOString(),
			deliveryAddress: body.deliveryAddress ?? "123 Main St, San Francisco, CA",
			estimatedDelivery: `${30 + Math.floor(Math.random() * 20)} minutes`,
		};

		orders.push(order);

		return NextResponse.json({ order });
	} catch (error) {
		console.error("Order creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	return NextResponse.json({ orders });
}
