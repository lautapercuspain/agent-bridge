"use client";

import { MapPin, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { queryRestaurants } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useCartStore } from "@/stores/cart-store";
import { WebMCPStatus } from "../webmcp/WebMCPStatus";

function BrandMark() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className="h-5 w-5 text-white"
			aria-hidden="true"
		>
			<title>AgentBridge</title>
			<path
				d="M3 16c2.5-5 5.5-7.5 9-7.5s6.5 2.5 9 7.5"
				stroke="currentColor"
				strokeWidth="2.1"
				strokeLinecap="round"
			/>
			<path
				d="M12 4.5V11"
				stroke="currentColor"
				strokeWidth="2.1"
				strokeLinecap="round"
			/>
			<path
				d="M3.5 16.5h17"
				stroke="currentColor"
				strokeWidth="2.1"
				strokeLinecap="round"
			/>
			<circle cx="6" cy="16.2" r="1.6" fill="currentColor" />
			<circle cx="18" cy="16.2" r="1.6" fill="currentColor" />
		</svg>
	);
}

export function TopBar({
	onOpenCart,
	onOpenAgent,
}: {
	onOpenCart: () => void;
	onOpenAgent: () => void;
}) {
	const count = useCartStore((s) => s.getCount());
	const total = useCartStore((s) => s.getTotals().total);
	const deliveryAddress = useAgentUIStore((s) => s.deliveryAddress);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);
	const [query, setQuery] = useState("");

	function goHome() {
		showBrowse(queryRestaurants({}), "All restaurants", null);
	}

	function onSearch(e: React.FormEvent) {
		e.preventDefault();
		const q = query.trim();
		showBrowse(
			queryRestaurants({ query: q || undefined }),
			q || "All restaurants",
		);
	}

	return (
		<header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-xl">
			<div className="flex h-16 items-center gap-3 px-4 sm:gap-5 sm:px-6">
				<button
					type="button"
					onClick={goHome}
					className="flex shrink-0 items-center gap-2.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
				>
					<span className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-brand shadow-[0_4px_14px_-4px_rgba(255,90,44,0.6)]">
						<BrandMark />
					</span>
					<span className="hidden text-[1.05rem] font-semibold tracking-tight sm:block">
						Agent<span className="text-brand">Bridge</span>
					</span>
				</button>

				<button
					type="button"
					className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink/80 transition-colors hover:border-ink/20 md:flex"
				>
					<MapPin className="h-4 w-4 text-brand" strokeWidth={2} />
					<span className="max-w-45 truncate">{deliveryAddress}</span>
				</button>

				<form onSubmit={onSearch} className="relative flex-1">
					<Search
						className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
						strokeWidth={2}
					/>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search AgentBridge for food and restaurants"
						className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-muted focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
					/>
				</form>

				<WebMCPStatus />

				<button
					type="button"
					onClick={onOpenAgent}
					className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-brand-soft lg:hidden"
				>
					<Sparkles className="h-4 w-4 text-brand" strokeWidth={2} />
				</button>

				<button
					type="button"
					onClick={onOpenCart}
					className="group flex shrink-0 items-center gap-2 rounded-full bg-ink px-3.5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand active:scale-[0.97] sm:px-4"
				>
					<span className="relative">
						<ShoppingBag className="h-4.5 w-4.5" strokeWidth={2} />
						{count > 0 && (
							<span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-ink transition-colors group-hover:bg-white group-hover:text-brand">
								{count}
							</span>
						)}
					</span>
					<span className="hidden tabular-nums sm:inline">
						${total.toFixed(2)}
					</span>
				</button>
			</div>
		</header>
	);
}
