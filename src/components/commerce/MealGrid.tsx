"use client";

import { Plus, SearchX, Star } from "lucide-react";
import { getMenuForRestaurant, type MealMatch } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useCartStore } from "@/stores/cart-store";
import { FoodImage } from "./FoodImage";

export function MealGrid({ meals }: { meals: MealMatch[] }) {
	const addItem = useCartStore((s) => s.addItem);
	const setActiveItem = useAgentUIStore((s) => s.setActiveItem);
	const showRestaurant = useAgentUIStore((s) => s.showRestaurant);

	if (meals.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
				<SearchX className="h-8 w-8 text-muted" strokeWidth={1.5} />
				<div>
					<p className="font-medium">No dishes match that request</p>
					<p className="mt-1 text-sm text-muted">
						Try a higher budget or a broader craving.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
			{meals.map(({ item, restaurant }, i) => {
				const hasOptions = Boolean(item.optionGroups?.length);
				return (
					<div
						key={item.id}
						className="animate-fade-up group relative flex flex-col"
						style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
					>
						<button
							type="button"
							onClick={() =>
								showRestaurant(restaurant, getMenuForRestaurant(restaurant.id))
							}
							className="flex flex-col text-left"
						>
							<div className="relative overflow-hidden rounded-[1.25rem] ring-1 ring-line">
								<FoodImage
									src={item.imageUrl}
									alt={item.name}
									className="aspect-16/10 w-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
								/>
								<span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur">
									${item.price.toFixed(2)}
								</span>
							</div>

							<div className="mt-3 flex items-start justify-between gap-2">
								<h3 className="font-semibold leading-tight tracking-tight">
									{item.name}
								</h3>
								<span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-ink/6 px-2 py-0.5 text-xs font-semibold">
									<Star className="h-3 w-3 fill-brand text-brand" />
									{restaurant.rating.toFixed(1)}
								</span>
							</div>

							<div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
								<span className="truncate">{restaurant.name}</span>
								<span aria-hidden>·</span>
								<span className="shrink-0">{restaurant.etaMinutes} min</span>
							</div>

							{item.dietaryTags.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1.5">
									{item.dietaryTags.slice(0, 3).map((t) => (
										<span
											key={t}
											className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium capitalize text-brand-strong"
										>
											{t}
										</span>
									))}
								</div>
							)}
						</button>

						<button
							type="button"
							onClick={() =>
								hasOptions ? setActiveItem(item) : addItem(item, [], 1)
							}
							aria-label={`Add ${item.name}`}
							className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-[0_6px_16px_-6px_rgba(23,20,15,0.5)] ring-1 ring-line transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand hover:text-white active:scale-90"
						>
							<Plus className="h-4 w-4" strokeWidth={2.5} />
						</button>
					</div>
				);
			})}
		</div>
	);
}
