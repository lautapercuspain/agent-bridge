import type { Restaurant, SearchRestaurantsParams } from "@/types";

const YELP_API_BASE = "https://api.yelp.com/v3";

function getApiKey(): string {
	const key = process.env.YELP_API_KEY;
	if (!key) throw new Error("YELP_API_KEY environment variable is required");
	return key;
}

function headers(): HeadersInit {
	return {
		Authorization: `Bearer ${getApiKey()}`,
		Accept: "application/json",
	};
}

function mapPriceLevel(price?: string): Restaurant["priceLevel"] {
	switch (price) {
		case "$":
			return "$";
		case "$$":
			return "$$";
		case "$$$":
			return "$$$";
		case "$$$$":
			return "$$$$";
		default:
			return "$$";
	}
}

interface YelpBusiness {
	id: string;
	name: string;
	rating: number;
	review_count: number;
	price?: string;
	location: {
		display_address: string[];
	};
	distance?: number;
	image_url: string;
	phone: string;
	categories: { alias: string; title: string }[];
	is_closed: boolean;
}

function mapBusiness(biz: YelpBusiness): Restaurant {
	return {
		id: biz.id,
		name: biz.name,
		cuisine: biz.categories[0]?.title ?? "Restaurant",
		rating: biz.rating,
		reviewCount: biz.review_count,
		priceLevel: mapPriceLevel(biz.price),
		address: biz.location.display_address.join(", "),
		distance: biz.distance
			? `${(biz.distance / 1609.34).toFixed(1)} mi`
			: "Nearby",
		imageUrl: biz.image_url,
		phone: biz.phone,
		categories: biz.categories.map((c) => c.title),
		isOpen: !biz.is_closed,
	};
}

export async function searchRestaurants(
	params: SearchRestaurantsParams,
): Promise<Restaurant[]> {
	const url = new URL(`${YELP_API_BASE}/businesses/search`);
	url.searchParams.set("term", params.cuisine ?? "restaurants");
	url.searchParams.set("location", params.location ?? "San Francisco, CA");
	url.searchParams.set("limit", String(params.limit ?? 10));
	url.searchParams.set("categories", "food,restaurants");

	if (params.priceLevel) {
		const level = params.priceLevel.length;
		url.searchParams.set("price", String(level));
	}

	if (params.sortBy === "rating") {
		url.searchParams.set("sort_by", "rating");
	} else if (params.sortBy === "distance") {
		url.searchParams.set("sort_by", "distance");
	}

	const res = await fetch(url.toString(), { headers: headers() });
	if (!res.ok) {
		throw new Error(`Yelp API error: ${res.status} ${res.statusText}`);
	}

	const data = await res.json();
	return (data.businesses as YelpBusiness[]).map(mapBusiness);
}

export async function getRestaurantDetails(
	id: string,
): Promise<Restaurant | null> {
	const res = await fetch(
		`${YELP_API_BASE}/businesses/${encodeURIComponent(id)}`,
		{
			headers: headers(),
		},
	);
	if (!res.ok) return null;
	const biz: YelpBusiness = await res.json();
	return mapBusiness(biz);
}
