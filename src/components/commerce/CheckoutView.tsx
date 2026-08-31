"use client";

import { ArrowLeft, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { getMenuForRestaurant, getRestaurantById } from "@/lib/catalog";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { lineUnitPrice, useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";

export function CheckoutView() {
	const items = useCartStore((s) => s.items);
	const restaurantId = useCartStore((s) => s.restaurantId);
	const restaurantName = useCartStore((s) => s.restaurantName);
	const totals = useCartStore(useShallow((s) => s.getTotals()));
	const clearCart = useCartStore((s) => s.clearCart);

	const deliveryAddress = useAgentUIStore((s) => s.deliveryAddress);
	const setDeliveryAddress = useAgentUIStore((s) => s.setDeliveryAddress);
	const currentRestaurant = useAgentUIStore((s) => s.currentRestaurant);
	const showRestaurant = useAgentUIStore((s) => s.showRestaurant);
	const showOrder = useAgentUIStore((s) => s.showOrder);
	const placeOrder = useOrderStore((s) => s.placeOrder);

	function back() {
		if (currentRestaurant) {
			showRestaurant(
				currentRestaurant,
				getMenuForRestaurant(currentRestaurant.id),
			);
		}
	}

	function place() {
		if (!restaurantId || items.length === 0) return;
		const restaurant = getRestaurantById(restaurantId);
		placeOrder({
			restaurantId,
			restaurantName: restaurantName ?? restaurant?.name ?? "",
			items,
			totals,
			address: deliveryAddress,
			etaMinutes: restaurant?.etaMinutes ?? 30,
		});
		clearCart();
		showOrder();
	}

	if (items.length === 0) {
		return (
			<div className="animate-fade-up py-20 text-center">
				<p className="font-medium">Your cart is empty.</p>
				<p className="mt-1 text-sm text-muted">
					Add items before checking out.
				</p>
			</div>
		);
	}

	return (
		<div className="animate-fade-up mx-auto max-w-4xl pb-10">
			<button
				type="button"
				onClick={back}
				className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
			>
				<ArrowLeft className="h-4 w-4" strokeWidth={2} />
				Back to menu
			</button>

			<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
				Checkout
			</h1>

			<div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
				<div className="space-y-4">
					<section className="rounded-2xl border border-line bg-surface p-5">
						<div className="flex items-center gap-2 font-semibold">
							<MapPin
								className="h-[18px] w-[18px] text-brand"
								strokeWidth={2}
							/>
							Delivery address
						</div>
						<input
							value={deliveryAddress}
							onChange={(e) => setDeliveryAddress(e.target.value)}
							className="mt-3 w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand/40"
						/>
					</section>

					<section className="rounded-2xl border border-line bg-surface p-5">
						<div className="flex items-center gap-2 font-semibold">
							<CreditCard
								className="h-[18px] w-[18px] text-brand"
								strokeWidth={2}
							/>
							Payment
						</div>
						<div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-3">
							<span className="flex items-center gap-2 text-sm font-medium">
								<span className="flex h-6 w-9 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
									VISA
								</span>
								•••• •••• •••• 4242
							</span>
							<span className="text-xs text-muted">Exp 09/29</span>
						</div>
						<p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
							<ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
							Simulated checkout — no real payment is taken.
						</p>
					</section>
				</div>

				<section className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
					<h2 className="font-semibold">{restaurantName ?? "Order"}</h2>
					<div className="mt-3 space-y-2 border-b border-line pb-3">
						{items.map((ci) => (
							<div
								key={ci.lineId}
								className="flex justify-between gap-3 text-sm"
							>
								<span className="min-w-0 truncate">
									<span className="font-medium">{ci.quantity}×</span>{" "}
									{ci.menuItem.name}
								</span>
								<span className="shrink-0 tabular-nums">
									${(lineUnitPrice(ci) * ci.quantity).toFixed(2)}
								</span>
							</div>
						))}
					</div>
					<div className="mt-3 space-y-1.5 text-sm">
						<div className="flex justify-between text-muted">
							<span>Subtotal</span>
							<span className="tabular-nums">
								${totals.subtotal.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between text-muted">
							<span>Delivery</span>
							<span className="tabular-nums">
								{totals.deliveryFee === 0
									? "Free"
									: `$${totals.deliveryFee.toFixed(2)}`}
							</span>
						</div>
						<div className="flex justify-between text-muted">
							<span>Service fee</span>
							<span className="tabular-nums">
								${totals.serviceFee.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between text-muted">
							<span>Tax</span>
							<span className="tabular-nums">${totals.tax.toFixed(2)}</span>
						</div>
					</div>
					<div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
						<span>Total</span>
						<span className="tabular-nums">${totals.total.toFixed(2)}</span>
					</div>
					<button
						type="button"
						onClick={place}
						className="mt-4 w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-strong active:scale-[0.98]"
					>
						Place order · ${totals.total.toFixed(2)}
					</button>
				</section>
			</div>
		</div>
	);
}
