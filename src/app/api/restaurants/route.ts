import { NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/yelp";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	try {
		const lat = searchParams.get("latitude");
		const lng = searchParams.get("longitude");

		const restaurants = await searchRestaurants({
			cuisine: searchParams.get("cuisine") ?? undefined,
			location: searchParams.get("location") ?? undefined,
			latitude: lat ? Number(lat) : undefined,
			longitude: lng ? Number(lng) : undefined,
			priceLevel: searchParams.get("priceLevel") ?? undefined,
			sortBy:
				(searchParams.get("sortBy") as "rating" | "distance" | "price") ??
				undefined,
			limit: searchParams.get("limit")
				? Number(searchParams.get("limit"))
				: undefined,
		});

		return NextResponse.json({ restaurants });
	} catch (error) {
		console.error("Restaurant search error:", error);
		return NextResponse.json(
			{ error: "Failed to search restaurants" },
			{ status: 500 },
		);
	}
}
