"use client";

import { ArrowLeft, Clock, Star, Truck } from "lucide-react";
import { useMemo } from "react";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import type { MenuItem } from "@/types";
import { FoodImage } from "./FoodImage";
import { MenuItemCard } from "./MenuItemCard";

export function RestaurantView() {
	const restaurant = useAgentUIStore((s) => s.currentRestaurant);
	const menu = useAgentUIStore((s) => s.currentMenu);
	const restaurants = useAgentUIStore((s) => s.restaurants);
	const browseLabel = useAgentUIStore((s) => s.browseLabel);
	const selectedCategoryId = useAgentUIStore((s) => s.selectedCategoryId);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);

	const sections = useMemo(() => {
		const grouped: Record<string, MenuItem[]> = {};
		for (const it of menu) {
			const bucket = grouped[it.category];
			if (bucket) bucket.push(it);
			else grouped[it.category] = [it];
		}
		const keys = Object.keys(grouped).sort((a, b) =>
			a === "Popular" ? -1 : b === "Popular" ? 1 : 0,
		);
		return keys.map((k) => ({ name: k, items: grouped[k] ?? [] }));
	}, [menu]);

	if (!restaurant) return null;

	return (
		<div className="animate-fade-up pb-10">
			<button
				type="button"
				onClick={() => showBrowse(restaurants, browseLabel, selectedCategoryId)}
				className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
			>
				<ArrowLeft className="h-4 w-4" strokeWidth={2} />
				Back to restaurants
			</button>

			<div className="overflow-hidden rounded-3xl ring-1 ring-line">
				<FoodImage
					src={restaurant.imageUrl}
					alt={restaurant.name}
					className="h-44 w-full object-cover sm:h-60"
				/>
			</div>

			<div className="mt-4">
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						{restaurant.name}
					</h1>
					{restaurant.promo && (
						<span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
							{restaurant.promo}
						</span>
					)}
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
					<span className="flex items-center gap-1 font-medium text-ink">
						<Star className="h-4 w-4 fill-brand text-brand" />
						{restaurant.rating.toFixed(1)}
						<span className="font-normal text-muted">
							({restaurant.reviewCount.toLocaleString()})
						</span>
					</span>
					<span className="flex items-center gap-1">
						<Clock className="h-4 w-4" strokeWidth={2} />
						{restaurant.etaMinutes} min
					</span>
					<span className="flex items-center gap-1">
						<Truck className="h-4 w-4" strokeWidth={2} />
						{restaurant.deliveryFee === 0
							? "Free delivery"
							: `$${restaurant.deliveryFee.toFixed(2)} delivery`}
					</span>
					<span>{restaurant.priceLevel}</span>
				</div>
			</div>

			<div className="mt-8 space-y-10">
				{sections.map((section) => (
					<section key={section.name}>
						<h2 className="mb-3 text-lg font-semibold tracking-tight">
							{section.name}
						</h2>
						<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
							{section.items.map((item) => (
								<MenuItemCard key={item.id} item={item} />
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
