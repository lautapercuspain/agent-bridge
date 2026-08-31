"use client";

import {
	Bike,
	Check,
	CookingPot,
	Home,
	PartyPopper,
	ReceiptText,
} from "lucide-react";
import { queryRestaurants } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { lineUnitPrice, useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import type { OrderStatus } from "@/types";

const STEPS: { id: OrderStatus; label: string; icon: typeof Check }[] = [
	{ id: "confirmed", label: "Confirmed", icon: Check },
	{ id: "preparing", label: "Preparing", icon: CookingPot },
	{ id: "on_the_way", label: "On the way", icon: Bike },
	{ id: "delivered", label: "Delivered", icon: Home },
];

export function OrderView() {
	const order = useOrderStore((s) => s.currentOrder);
	const reset = useOrderStore((s) => s.reset);
	const showBrowse = useAgentUIStore((s) => s.showBrowse);
	const clearCart = useCartStore((s) => s.clearCart);

	if (!order) {
		return (
			<div className="animate-fade-up py-20 text-center">
				<p className="font-medium">No active order.</p>
			</div>
		);
	}

	const activeIndex = STEPS.findIndex((s) => s.id === order.status);
	const delivered = order.status === "delivered";

	function orderAgain() {
		reset();
		clearCart();
		showBrowse(queryRestaurants({}), "All restaurants", null);
	}

	return (
		<div className="animate-fade-up mx-auto max-w-2xl pb-10">
			<div className="rounded-[1.75rem] border border-line bg-surface p-6 sm:p-8">
				<div className="flex items-center gap-3">
					<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_10px_24px_-10px_rgba(255,90,44,0.8)]">
						<PartyPopper className="h-6 w-6" strokeWidth={2} />
					</span>
					<div>
						<h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
							{delivered ? "Delivered — enjoy!" : "Order placed!"}
						</h1>
						<p className="text-sm text-muted">
							{order.restaurantName} · Order {order.id}
						</p>
					</div>
				</div>

				<div className="mt-6 flex items-baseline justify-between gap-4 rounded-2xl bg-cream px-5 py-4">
					<div>
						<p className="text-xs uppercase tracking-wide text-muted">
							{delivered ? "Status" : "Estimated arrival"}
						</p>
						<p className="text-lg font-semibold">
							{delivered ? "Delivered" : `~${order.etaMinutes} min`}
						</p>
					</div>
					<div className="text-right">
						<p className="text-xs uppercase tracking-wide text-muted">
							Courier
						</p>
						<p className="text-lg font-semibold">{order.courierName}</p>
					</div>
				</div>

				{/* Status tracker */}
				<div className="mt-7">
					<div className="flex items-center justify-between">
						{STEPS.map((step, i) => {
							const done = i <= activeIndex;
							const current = i === activeIndex && !delivered;
							const Icon = step.icon;
							return (
								<div
									key={step.id}
									className="flex flex-1 flex-col items-center"
								>
									<div className="flex w-full items-center">
										<span
											className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-brand" : "bg-line"}`}
										/>
										<span
											className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
												done
													? "bg-brand text-white"
													: "bg-cream text-muted ring-1 ring-line"
											} ${current ? "ring-4 ring-brand/20" : ""}`}
										>
											<Icon
												className={`h-4.5 w-4.5 ${current ? "animate-pulse" : ""}`}
												strokeWidth={2}
											/>
										</span>
										<span
											className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < activeIndex ? "bg-brand" : "bg-line"}`}
										/>
									</div>
									<span
										className={`mt-2 text-center text-xs font-medium ${done ? "text-ink" : "text-muted"}`}
									>
										{step.label}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Summary */}
				<div className="mt-7 rounded-2xl border border-line p-4">
					<div className="mb-2 flex items-center gap-2 text-sm font-semibold">
						<ReceiptText className="h-4 w-4 text-brand" strokeWidth={2} />
						Order summary
					</div>
					<div className="space-y-1.5 border-b border-line pb-3">
						{order.items.map((ci) => (
							<div
								key={ci.lineId}
								className="flex justify-between gap-3 text-sm"
							>
								<span className="min-w-0 truncate">
									<span className="font-medium">{ci.quantity}×</span>{" "}
									{ci.menuItem.name}
								</span>
								<span className="shrink-0 tabular-nums text-muted">
									${(lineUnitPrice(ci) * ci.quantity).toFixed(2)}
								</span>
							</div>
						))}
					</div>
					<div className="mt-3 flex justify-between font-semibold">
						<span>Total</span>
						<span className="tabular-nums">
							${order.totals.total.toFixed(2)}
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={orderAgain}
					className="mt-6 w-full rounded-full border border-line bg-surface py-3 font-semibold transition-colors hover:bg-cream"
				>
					Order something else
				</button>
			</div>
		</div>
	);
}
