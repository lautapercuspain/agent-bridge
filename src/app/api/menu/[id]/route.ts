import { NextResponse } from "next/server";
import { getMenuForRestaurant } from "@/lib/mock-menus";
import { getRestaurantDetails } from "@/lib/yelp";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		const restaurant = await getRestaurantDetails(id);
		if (!restaurant) {
			return NextResponse.json(
				{ error: "Restaurant not found" },
				{ status: 404 },
			);
		}

		const menu = getMenuForRestaurant(id, restaurant.categories);
		return NextResponse.json({ restaurant, menu });
	} catch (error) {
		console.error("Menu fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch menu" },
			{ status: 500 },
		);
	}
}
