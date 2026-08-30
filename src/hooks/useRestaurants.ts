"use client";

import { useQuery } from "@tanstack/react-query";
import type { MenuItem, Restaurant } from "@/types";

export function useRestaurantSearch(params: {
	cuisine?: string;
	location?: string;
	priceLevel?: string;
	sortBy?: string;
	enabled?: boolean;
}) {
	return useQuery<Restaurant[]>({
		queryKey: ["restaurants", params],
		queryFn: async () => {
			const sp = new URLSearchParams();
			if (params.cuisine) sp.set("cuisine", params.cuisine);
			if (params.location) sp.set("location", params.location);
			if (params.priceLevel) sp.set("priceLevel", params.priceLevel);
			if (params.sortBy) sp.set("sortBy", params.sortBy);

			const res = await fetch(`/api/restaurants?${sp.toString()}`);
			if (!res.ok) throw new Error("Failed to search restaurants");
			const data = await res.json();
			return data.restaurants;
		},
		enabled: params.enabled ?? true,
	});
}

export function useRestaurantMenu(restaurantId: string | null) {
	return useQuery<{ restaurant: Restaurant; menu: MenuItem[] }>({
		queryKey: ["menu", restaurantId],
		queryFn: async () => {
			const res = await fetch(`/api/menu/${restaurantId}`);
			if (!res.ok) throw new Error("Failed to fetch menu");
			return res.json();
		},
		enabled: !!restaurantId,
	});
}
