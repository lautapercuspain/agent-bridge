import type { DeliveryLink, DeliveryPlatform } from "@/types";
import {
	DIDI_FOOD_URLS,
	PEDIDOSYA_DOMAINS,
	PLATFORM_META,
	PLATFORM_ORDER,
	RAPPI_DOMAINS,
	UBER_COUNTRIES,
} from "./delivery-config";

// Build the set of delivery-app handoff links available for a restaurant in the
// user's country. We deep-link to each platform's search results by restaurant
// name because the marketplaces don't expose stable public restaurant ids to
// third parties. When the country is unknown we still return a universal Uber
// Eats link so the user always has a way to complete a real order.
export function generateDeliveryLinks(
	restaurantName: string,
	countryCode?: string | null,
): DeliveryLink[] {
	const cc = countryCode?.toLowerCase() ?? null;
	const q = encodeURIComponent(restaurantName);
	const urls: Partial<Record<DeliveryPlatform, string>> = {};

	if (cc && UBER_COUNTRIES.has(cc)) {
		urls["uber-eats"] = `https://www.ubereats.com/search?q=${q}`;
	}
	if (cc && RAPPI_DOMAINS[cc]) {
		urls.rappi = `https://www.${RAPPI_DOMAINS[cc]}/search?query=${q}`;
	}
	if (cc && PEDIDOSYA_DOMAINS[cc]) {
		urls.pedidosya = `https://www.${PEDIDOSYA_DOMAINS[cc]}/search?q=${q}`;
	}
	if (cc && DIDI_FOOD_URLS[cc]) {
		urls["didi-food"] = DIDI_FOOD_URLS[cc];
	}

	// Universal fallback so there is always at least one real ordering option.
	if (Object.keys(urls).length === 0) {
		urls["uber-eats"] = `https://www.ubereats.com/search?q=${q}`;
	}

	return PLATFORM_ORDER.filter((p) => urls[p]).map((p) => ({
		platform: p,
		label: PLATFORM_META[p].label,
		url: urls[p] as string,
		color: PLATFORM_META[p].color,
		textColor: PLATFORM_META[p].textColor,
	}));
}
