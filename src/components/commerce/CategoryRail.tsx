"use client";

import { CATEGORIES, queryRestaurants } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { FoodImage } from "./FoodImage";

export function CategoryRail() {
	const selectedCategoryId = useAgentUIStore((s) => s.selectedCategoryId);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);

	function pick(id: string, name: string) {
		const next = selectedCategoryId === id ? null : id;
		showBrowse(
			queryRestaurants({ categoryId: next ?? undefined }),
			next ? name : "All restaurants",
			next,
		);
	}

	return (
		<div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
			{CATEGORIES.map((c) => {
				const active = selectedCategoryId === c.id;
				return (
					<button
						key={c.id}
						type="button"
						onClick={() => pick(c.id, c.name)}
						className={`group flex shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
							active ? "bg-brand-soft" : "hover:bg-surface"
						}`}
					>
						<span
							className={`h-16 w-16 overflow-hidden rounded-2xl ring-1 transition-all duration-300 ${
								active
									? "ring-brand shadow-[0_8px_20px_-8px_rgba(255,90,44,0.5)]"
									: "ring-line group-hover:ring-ink/15"
							}`}
						>
							<FoodImage
								src={c.imageUrl}
								alt={c.name}
								className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
							/>
						</span>
						<span
							className={`text-xs font-medium ${active ? "text-brand" : "text-ink/70"}`}
						>
							{c.name}
						</span>
					</button>
				);
			})}
		</div>
	);
}
