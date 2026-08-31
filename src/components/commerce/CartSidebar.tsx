"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { lineUnitPrice, useCartStore } from "@/stores/cart-store";

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between text-sm">
			<span className="text-muted">{label}</span>
			<span className="tabular-nums">{value}</span>
		</div>
	);
}

export function CartSidebar({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const items = useCartStore((s) => s.items);
	const restaurantName = useCartStore((s) => s.restaurantName);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);
	const totals = useCartStore(useShallow((s) => s.getTotals()));
	const showCheckout = useAgentUIStore((s) => s.showCheckout);

	function goCheckout() {
		showCheckout();
		onClose();
	}

	return (
		<>
			<button
				type="button"
				aria-label="Close cart"
				onClick={onClose}
				className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
					open ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			/>
			<aside
				className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] ${
					open ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<header className="flex items-center justify-between border-b border-line px-5 py-4">
					<div>
						<h2 className="font-semibold tracking-tight">Your cart</h2>
						{restaurantName && (
							<p className="text-xs text-muted">{restaurantName}</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/6 hover:text-ink"
					>
						<X className="h-5 w-5" strokeWidth={2} />
					</button>
				</header>

				{items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
							<ShoppingBag className="h-6 w-6 text-brand" strokeWidth={1.75} />
						</div>
						<div>
							<p className="font-medium">Your cart is empty</p>
							<p className="mt-1 text-sm text-muted">
								Add items, or ask the agent to build your order.
							</p>
						</div>
					</div>
				) : (
					<div className="flex-1 space-y-3 overflow-y-auto p-5">
						{items.map((ci) => (
							<div
								key={ci.lineId}
								className="flex gap-3 rounded-2xl border border-line p-3"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">{ci.menuItem.name}</p>
									{ci.selectedOptions.length > 0 && (
										<p className="truncate text-xs text-muted">
											{ci.selectedOptions.map((o) => o.name).join(", ")}
										</p>
									)}
									<p className="mt-1 text-sm font-semibold tabular-nums">
										${(lineUnitPrice(ci) * ci.quantity).toFixed(2)}
									</p>
								</div>
								<div className="flex flex-col items-end justify-between">
									<button
										type="button"
										aria-label="Remove item"
										onClick={() => removeItem(ci.lineId)}
										className="text-muted transition-colors hover:text-brand"
									>
										<Trash2 className="h-4 w-4" strokeWidth={2} />
									</button>
									<div className="flex items-center gap-2 rounded-full border border-line px-1.5 py-1">
										<button
											type="button"
											aria-label="Decrease quantity"
											onClick={() => updateQuantity(ci.lineId, ci.quantity - 1)}
											className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-ink/6"
										>
											<Minus className="h-3.5 w-3.5" strokeWidth={2} />
										</button>
										<span className="w-4 text-center text-sm font-semibold tabular-nums">
											{ci.quantity}
										</span>
										<button
											type="button"
											aria-label="Increase quantity"
											onClick={() => updateQuantity(ci.lineId, ci.quantity + 1)}
											className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-ink/6"
										>
											<Plus className="h-3.5 w-3.5" strokeWidth={2} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{items.length > 0 && (
					<div className="space-y-3 border-t border-line p-5">
						<div className="space-y-1.5">
							<Row label="Subtotal" value={`$${totals.subtotal.toFixed(2)}`} />
							<Row
								label="Delivery"
								value={
									totals.deliveryFee === 0
										? "Free"
										: `$${totals.deliveryFee.toFixed(2)}`
								}
							/>
							<Row
								label="Service fee"
								value={`$${totals.serviceFee.toFixed(2)}`}
							/>
							<Row label="Tax" value={`$${totals.tax.toFixed(2)}`} />
						</div>
						<div className="flex items-center justify-between border-t border-line pt-3 font-semibold">
							<span>Total</span>
							<span className="tabular-nums">${totals.total.toFixed(2)}</span>
						</div>
						<button
							type="button"
							onClick={goCheckout}
							className="w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-strong active:scale-[0.98]"
						>
							Go to checkout
						</button>
					</div>
				)}
			</aside>
		</>
	);
}
