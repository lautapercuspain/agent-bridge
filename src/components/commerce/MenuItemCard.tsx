"use client";

import { Plus } from "lucide-react";
import { getRestaurantById } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem } from "@/types";
import { FoodImage } from "./FoodImage";

export function MenuItemCard({ item }: { item: MenuItem }) {
	const addItem = useCartStore((s) => s.addItem);
	const setActiveItem = useAgentUIStore((s) => s.setActiveItem);

	const hasOptions = Boolean(item.optionGroups?.length);

	function onAdd(e: React.MouseEvent) {
		e.stopPropagation();
		if (hasOptions) {
			setActiveItem(item);
		} else {
			addItem(item, [], 1);
		}
	}

	return (
		<div className="group relative rounded-2xl border border-line bg-surface transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-ink/15 hover:shadow-[0_12px_30px_-18px_rgba(23,20,15,0.35)]">
			<button
				type="button"
				onClick={() => setActiveItem(item)}
				className="flex w-full items-stretch gap-4 p-3 text-left"
			>
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center gap-2">
						<h4 className="truncate font-semibold tracking-tight">
							{item.name}
						</h4>
						{item.popular && (
							<span className="shrink-0 rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-strong">
								Popular
							</span>
						)}
					</div>
					<p className="mt-1 line-clamp-2 text-sm text-muted">
						{item.description}
					</p>
					<div className="mt-auto flex items-center gap-2 pt-2">
						<span className="font-semibold tabular-nums">
							${item.price.toFixed(2)}
						</span>
						{item.dietaryTags.slice(0, 2).map((t) => (
							<span
								key={t}
								className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted"
							>
								{t}
							</span>
						))}
					</div>
				</div>

				<div className="h-24 w-24 shrink-0">
					<FoodImage
						src={item.imageUrl}
						fallbackSrc={getRestaurantById(item.restaurantId)?.imageUrl}
						alt={item.name}
						className="h-full w-full rounded-xl object-cover"
					/>
				</div>
			</button>

			<button
				type="button"
				onClick={onAdd}
				aria-label={`Add ${item.name}`}
				className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink shadow-[0_6px_16px_-6px_rgba(23,20,15,0.5)] ring-1 ring-line transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand hover:text-white active:scale-90"
			>
				<Plus className="h-4 w-4" strokeWidth={2.5} />
			</button>
		</div>
	);
}
