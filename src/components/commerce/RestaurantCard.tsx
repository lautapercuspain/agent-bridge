"use client";

import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import type { Restaurant } from "@/types";
import { DeliveryPlatformLinks } from "./DeliveryPlatformLinks";

interface RestaurantCardProps {
	restaurant: Restaurant;
	onSelect: (restaurant: Restaurant) => void;
	selected?: boolean;
}

export function RestaurantCard({
	restaurant,
	onSelect,
	selected,
}: RestaurantCardProps) {
	return (
		<div
			className={`rounded-xl border p-4 transition-all hover:shadow-md ${
				selected
					? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30"
					: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
			}`}
		>
			<button
				type="button"
				onClick={() => onSelect(restaurant)}
				className="w-full text-left"
			>
				<div className="flex gap-4">
					{restaurant.imageUrl ? (
						<Image
							src={restaurant.imageUrl}
							alt={restaurant.name}
							width={80}
							height={80}
							unoptimized
							className="h-20 w-20 rounded-lg object-cover"
						/>
					) : (
						<div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
							<MapPin className="h-8 w-8 text-zinc-400" />
						</div>
					)}

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<h3 className="font-semibold text-zinc-900 truncate dark:text-zinc-100">
								{restaurant.name}
							</h3>
							<span className="shrink-0 text-sm font-medium text-zinc-500">
								{restaurant.priceLevel}
							</span>
						</div>

						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							{restaurant.cuisine}
						</p>

						<div className="mt-2 flex items-center gap-3 text-sm">
							<span className="flex items-center gap-1 text-amber-600">
								<Star className="h-3.5 w-3.5 fill-current" />
								{restaurant.rating}
								<span className="text-zinc-400">
									({restaurant.reviewCount})
								</span>
							</span>
							<span className="text-zinc-400">{restaurant.distance}</span>
							{restaurant.isOpen ? (
								<span className="text-green-600 dark:text-green-400">Open</span>
							) : (
								<span className="text-red-500">Closed</span>
							)}
						</div>
					</div>
				</div>
			</button>

			<div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
				<DeliveryPlatformLinks restaurantName={restaurant.name} />
			</div>
		</div>
	);
}
