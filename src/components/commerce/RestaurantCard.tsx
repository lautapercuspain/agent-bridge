"use client";

import { Star } from "lucide-react";
import { getMenuForRestaurant } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import type { Restaurant } from "@/types";
import { FoodImage } from "./FoodImage";

function formatReviews(n: number): string {
	return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
	const showRestaurant = useAgentUIStore((s) => s.showRestaurant);

	return (
		<button
			type="button"
			onClick={() =>
				showRestaurant(restaurant, getMenuForRestaurant(restaurant.id))
			}
			className="group flex flex-col text-left"
		>
			<div className="relative overflow-hidden rounded-[1.25rem] ring-1 ring-line">
				<FoodImage
					src={restaurant.imageUrl}
					alt={restaurant.name}
					className="aspect-[16/10] w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
				/>
				{restaurant.promo && (
					<span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(255,90,44,0.8)]">
						{restaurant.promo}
					</span>
				)}
				<span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur">
					{restaurant.deliveryFee === 0
						? "Free delivery"
						: `$${restaurant.deliveryFee.toFixed(2)} fee`}
				</span>
			</div>

			<div className="mt-3 flex items-start justify-between gap-2">
				<h3 className="font-semibold leading-tight tracking-tight">
					{restaurant.name}
				</h3>
				<span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-semibold">
					<Star className="h-3 w-3 fill-brand text-brand" />
					{restaurant.rating.toFixed(1)}
				</span>
			</div>

			<div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
				<span>{restaurant.cuisine}</span>
				<span aria-hidden>·</span>
				<span>{restaurant.etaMinutes} min</span>
				<span aria-hidden>·</span>
				<span>({formatReviews(restaurant.reviewCount)})</span>
			</div>

			{restaurant.tags.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1.5">
					{restaurant.tags.map((t) => (
						<span
							key={t}
							className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-strong"
						>
							{t}
						</span>
					))}
				</div>
			)}
		</button>
	);
}
