"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useCartStore } from "@/stores/cart-store";
import type { MenuOption } from "@/types";
import { FoodImage } from "./FoodImage";

export function ItemModal() {
	const item = useAgentUIStore((s) => s.activeItem);
	const setActiveItem = useAgentUIStore((s) => s.setActiveItem);
	const addItem = useCartStore((s) => s.addItem);

	const [selected, setSelected] = useState<Record<string, string>>({});
	const [qty, setQty] = useState(1);

	// Reset selections whenever a new item opens (default to first option).
	useEffect(() => {
		if (!item) return;
		const defaults: Record<string, string> = {};
		for (const group of item.optionGroups ?? []) {
			if (group.options[0]) defaults[group.id] = group.options[0].id;
		}
		setSelected(defaults);
		setQty(1);
	}, [item]);

	const chosenOptions = useMemo<MenuOption[]>(() => {
		if (!item?.optionGroups) return [];
		const out: MenuOption[] = [];
		for (const group of item.optionGroups) {
			const opt = group.options.find((o) => o.id === selected[group.id]);
			if (opt) out.push(opt);
		}
		return out;
	}, [item, selected]);

	if (!item) return null;

	const unit = item.price + chosenOptions.reduce((sum, o) => sum + o.price, 0);

	function close() {
		setActiveItem(null);
	}

	function confirm() {
		if (!item) return;
		addItem(item, chosenOptions, qty);
		close();
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
			<button
				type="button"
				aria-label="Close"
				onClick={close}
				className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
			/>
			<div className="animate-fade-up relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl">
				<div className="relative">
					<FoodImage
						src={item.imageUrl}
						alt={item.name}
						className="h-52 w-full object-cover"
					/>
					<button
						type="button"
						onClick={close}
						className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
					>
						<X className="h-[18px] w-[18px]" strokeWidth={2} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5">
					<h2 className="text-xl font-semibold tracking-tight">{item.name}</h2>
					<p className="mt-1.5 text-sm text-muted">{item.description}</p>

					{item.optionGroups?.map((group) => (
						<div key={group.id} className="mt-5">
							<p className="text-sm font-semibold">{group.name}</p>
							<div className="mt-2 space-y-2">
								{group.options.map((opt) => {
									const active = selected[group.id] === opt.id;
									return (
										<button
											key={opt.id}
											type="button"
											onClick={() =>
												setSelected((s) => ({ ...s, [group.id]: opt.id }))
											}
											className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
												active
													? "border-brand bg-brand-soft"
													: "border-line hover:border-ink/20"
											}`}
										>
											<span className="flex items-center gap-2.5">
												<span
													className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? "border-brand" : "border-ink/25"}`}
												>
													{active && (
														<span className="h-2 w-2 rounded-full bg-brand" />
													)}
												</span>
												{opt.name}
											</span>
											{opt.price > 0 && (
												<span className="tabular-nums text-muted">
													+${opt.price.toFixed(2)}
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>

				<div className="flex items-center gap-3 border-t border-line p-4">
					<div className="flex items-center gap-3 rounded-full border border-line px-2 py-1.5">
						<button
							type="button"
							aria-label="Decrease quantity"
							onClick={() => setQty((q) => Math.max(1, q - 1))}
							className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/[0.06]"
						>
							<Minus className="h-4 w-4" strokeWidth={2} />
						</button>
						<span className="w-4 text-center font-semibold tabular-nums">
							{qty}
						</span>
						<button
							type="button"
							aria-label="Increase quantity"
							onClick={() => setQty((q) => q + 1)}
							className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/[0.06]"
						>
							<Plus className="h-4 w-4" strokeWidth={2} />
						</button>
					</div>
					<button
						type="button"
						onClick={confirm}
						className="flex flex-1 items-center justify-between rounded-full bg-brand px-5 py-3 font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-strong active:scale-[0.98]"
					>
						<span>Add to cart</span>
						<span className="tabular-nums">${(unit * qty).toFixed(2)}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
