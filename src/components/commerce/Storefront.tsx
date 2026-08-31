"use client";

import { useEffect } from "react";
import { queryRestaurants } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { CategoryRail } from "./CategoryRail";
import { CheckoutView } from "./CheckoutView";
import { FilterChips } from "./FilterChips";
import { OrderView } from "./OrderView";
import { RestaurantGrid } from "./RestaurantGrid";
import { RestaurantView } from "./RestaurantView";

export function Storefront() {
	const view = useAgentUIStore((s) => s.view);
	const restaurants = useAgentUIStore((s) => s.restaurants);
	const browseLabel = useAgentUIStore((s) => s.browseLabel);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);

	// Seed the storefront so it looks populated on first load.
	useEffect(() => {
		if (useAgentUIStore.getState().restaurants.length === 0) {
			showBrowse(queryRestaurants({}), "All restaurants", null);
		}
	}, [showBrowse]);

	if (view === "restaurant") return <RestaurantView />;
	if (view === "checkout") return <CheckoutView />;
	if (view === "order") return <OrderView />;

	return (
		<div className="space-y-6">
			<CategoryRail />
			<FilterChips />
			<div>
				<div className="mb-4 flex items-baseline justify-between">
					<h1 className="text-xl font-semibold tracking-tight capitalize sm:text-2xl">
						{browseLabel || "All restaurants"}
					</h1>
					<span className="text-sm text-muted">
						{restaurants.length} place{restaurants.length === 1 ? "" : "s"}
					</span>
				</div>
				<RestaurantGrid restaurants={restaurants} />
			</div>
		</div>
	);
}
