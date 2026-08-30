"use client";

import { ArrowLeft, ShoppingBag, Store, UtensilsCrossed } from "lucide-react";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem, Restaurant } from "@/types";
import { DeliveryPlatformLinks } from "./DeliveryPlatformLinks";
import { LocationIndicator } from "./LocationIndicator";
import { MenuItemCard } from "./MenuItemCard";
import { RestaurantCard } from "./RestaurantCard";

interface CommercePanelProps {
	onOpenCart: () => void;
}

export function CommercePanel({ onOpenCart }: CommercePanelProps) {
	const restaurants = useAgentUIStore((s) => s.restaurants);
	const currentMenu = useAgentUIStore((s) => s.currentMenu);
	const currentRestaurant = useAgentUIStore((s) => s.currentRestaurant);
	const setMenu = useAgentUIStore((s) => s.setMenu);

	const cartCount = useCartStore((s) =>
		s.items.reduce((n, ci) => n + ci.quantity, 0),
	);
	const addItem = useCartStore((s) => s.addItem);

	const showMenu = currentRestaurant && currentMenu.length > 0;

	async function selectRestaurant(restaurant: Restaurant) {
		const res = await fetch(`/api/menu/${restaurant.id}`);
		if (!res.ok) return;
		const data = await res.json();
		setMenu(data.restaurant, data.menu);
	}

	function addMenuItem(item: MenuItem) {
		if (!currentRestaurant) return;
		addItem(item, currentRestaurant.id, currentRestaurant.name);
	}

	return (
		<div className="flex h-full flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
				<div className="flex items-center gap-2">
					{showMenu ? (
						<button
							type="button"
							onClick={() =>
								currentRestaurant && setMenu(currentRestaurant, [])
							}
							className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
						>
							<ArrowLeft className="h-4 w-4" />
							Restaurants
						</button>
					) : (
						<div className="flex items-center gap-2">
							<Store className="h-5 w-5 text-zinc-500" />
							<h2 className="font-semibold">Discover</h2>{" "}
							<span className="mx-1 text-zinc-300 dark:text-zinc-700">|</span>
							<LocationIndicator />{" "}
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={onOpenCart}
					className="relative flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800"
				>
					<ShoppingBag className="h-4 w-4" />
					Shortlist
					{cartCount > 0 && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
							{cartCount}
						</span>
					)}
				</button>
			</header>

			<div className="flex-1 overflow-y-auto p-5">
				{!showMenu && restaurants.length === 0 && <EmptyState />}

				{!showMenu && restaurants.length > 0 && (
					<div className="space-y-3">
						<p className="text-sm text-zinc-500">
							{restaurants.length} restaurants found
						</p>
						{restaurants.map((r) => (
							<RestaurantCard
								key={r.id}
								restaurant={r}
								onSelect={selectRestaurant}
								selected={currentRestaurant?.id === r.id}
							/>
						))}
					</div>
				)}

				{showMenu && currentRestaurant && (
					<div>
						<div className="mb-4">
							<h3 className="text-lg font-semibold">
								{currentRestaurant.name}
							</h3>
							<p className="text-sm text-zinc-500">
								{currentRestaurant.cuisine} · {currentRestaurant.priceLevel} ·{" "}
								{currentRestaurant.rating} stars
							</p>
						</div>

						<div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
							<p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Order from {currentRestaurant.name} in your delivery app
							</p>
							<DeliveryPlatformLinks restaurantName={currentRestaurant.name} />
							<p className="mt-3 text-xs text-zinc-400">
								Live prices, availability, payment, and delivery are handled in
								the app you choose. The items below are estimates to help you
								plan.
							</p>
						</div>

						<div className="space-y-2">
							{currentMenu.map((item) => (
								<MenuItemCard key={item.id} item={item} onAdd={addMenuItem} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<UtensilsCrossed className="h-7 w-7 text-zinc-400" />
			</div>
			<div>
				<p className="font-medium">No results yet</p>
				<p className="mt-1 max-w-xs text-sm text-zinc-500">
					Ask the agent to find food. Results the agent discovers will show up
					here in real time.
				</p>
			</div>
		</div>
	);
}
