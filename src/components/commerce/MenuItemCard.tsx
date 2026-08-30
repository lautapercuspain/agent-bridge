"use client";

import { Flame, Leaf, Plus, Wheat } from "lucide-react";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
	item: MenuItem;
	onAdd: (item: MenuItem) => void;
}

const TAG_ICONS: Record<string, typeof Leaf> = {
	vegetarian: Leaf,
	vegan: Leaf,
	"gluten-free": Wheat,
	spicy: Flame,
};

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
	return (
		<div className="group flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<h4 className="font-medium text-zinc-900 dark:text-zinc-100">
						{item.name}
					</h4>
					{item.popular && (
						<span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 uppercase dark:bg-amber-900/40 dark:text-amber-400">
							Popular
						</span>
					)}
				</div>

				<p className="mt-0.5 text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400">
					{item.description}
				</p>

				<div className="mt-1.5 flex items-center gap-2">
					<span className="font-medium text-zinc-900 dark:text-zinc-100">
						${item.price.toFixed(2)}
					</span>
					{item.dietaryTags.map((tag) => {
						const Icon = TAG_ICONS[tag];
						return (
							<span
								key={tag}
								className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
							>
								{Icon && <Icon className="h-2.5 w-2.5" />}
								{tag}
							</span>
						);
					})}
				</div>
			</div>

			<button
				type="button"
				onClick={() => onAdd(item)}
				className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
				aria-label={`Add ${item.name} to shortlist`}
			>
				<Plus className="h-4 w-4" />
			</button>
		</div>
	);
}
