"use client";

import { SearchX } from "lucide-react";
import type { Restaurant } from "@/types";
import { RestaurantCard } from "./RestaurantCard";

export function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
	if (restaurants.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
				<SearchX className="h-8 w-8 text-muted" strokeWidth={1.5} />
				<div>
					<p className="font-medium">No restaurants match those filters</p>
					<p className="mt-1 text-sm text-muted">
						Try clearing a filter or ask the agent for something else.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
			{restaurants.map((r, i) => (
				<div
					key={r.id}
					className="animate-fade-up"
					style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
				>
					<RestaurantCard restaurant={r} />
				</div>
			))}
		</div>
	);
}
