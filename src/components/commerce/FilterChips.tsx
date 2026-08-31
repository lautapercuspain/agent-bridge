"use client";

import { Clock, Star, Tag, Truck } from "lucide-react";
import { queryRestaurants } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";

const SORTS = [
	{ id: "recommended", label: "Recommended" },
	{ id: "rating", label: "Top rated" },
	{ id: "eta", label: "Fastest" },
	{ id: "deliveryFee", label: "Lowest fee" },
] as const;

export function FilterChips() {
	const filters = useAgentUIStore((s) => s.filters);
	const setFilters = useAgentUIStore((s) => s.setFilters);
	const selectedCategoryId = useAgentUIStore((s) => s.selectedCategoryId);
	const browseLabel = useAgentUIStore((s) => s.browseLabel);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);

	function apply(patch: Partial<typeof filters>) {
		const next = { ...filters, ...patch };
		setFilters(patch);
		showBrowse(
			queryRestaurants({
				categoryId: selectedCategoryId ?? undefined,
				sortBy: next.sortBy,
				freeDelivery: next.freeDelivery,
				offers: next.offers,
				topRated: next.topRated,
				under30: next.under30,
			}),
			browseLabel,
			selectedCategoryId,
		);
	}

	const toggles = [
		{ key: "freeDelivery", label: "Free delivery", icon: Truck },
		{ key: "offers", label: "Offers", icon: Tag },
		{ key: "topRated", label: "Top rated", icon: Star },
		{ key: "under30", label: "Under 30 min", icon: Clock },
	] as const;

	return (
		<div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5">
			<select
				value={filters.sortBy}
				onChange={(e) =>
					apply({ sortBy: e.target.value as typeof filters.sortBy })
				}
				className="shrink-0 cursor-pointer rounded-full border border-line bg-surface py-2 pl-3.5 pr-8 text-sm font-medium text-ink outline-none transition-colors hover:border-ink/20 focus:border-brand/40"
			>
				{SORTS.map((s) => (
					<option key={s.id} value={s.id}>
						Sort: {s.label}
					</option>
				))}
			</select>

			{toggles.map(({ key, label, icon: Icon }) => {
				const active = filters[key];
				return (
					<button
						key={key}
						type="button"
						onClick={() => apply({ [key]: !active })}
						className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
							active
								? "border-brand bg-brand text-white shadow-[0_6px_16px_-8px_rgba(255,90,44,0.7)]"
								: "border-line bg-surface text-ink/80 hover:border-ink/20"
						}`}
					>
						<Icon className="h-4 w-4" strokeWidth={2} />
						{label}
					</button>
				);
			})}
		</div>
	);
}
