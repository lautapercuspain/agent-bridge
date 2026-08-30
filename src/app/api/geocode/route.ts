import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");

	if (!lat || !lng) {
		return NextResponse.json(
			{ error: "lat and lng are required" },
			{ status: 400 },
		);
	}

	try {
		const res = await fetch(
			`https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&zoom=10`,
			{
				headers: { "User-Agent": "AgentBridge/1.0" },
				next: { revalidate: 86400 },
			},
		);

		if (!res.ok) {
			return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
		}

		const data = await res.json();
		const addr = data.address ?? {};
		const city =
			addr.city ??
			addr.town ??
			addr.village ??
			addr.suburb ??
			addr.county ??
			"Unknown";
		const state = addr.state ?? "";
		const countryCode =
			typeof addr.country_code === "string" ? addr.country_code : null;

		return NextResponse.json({
			city: state ? `${city}, ${state}` : city,
			countryCode,
		});
	} catch {
		return NextResponse.json(
			{ error: "Geocoding request failed" },
			{ status: 502 },
		);
	}
}
