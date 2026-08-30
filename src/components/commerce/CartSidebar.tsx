"use client";

import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

interface CartSidebarProps {
	open: boolean;
	onClose: () => void;
	onCheckout: () => void;
}

export function CartSidebar({ open, onClose, onCheckout }: CartSidebarProps) {
	const items = useCartStore((s) => s.items);
	const restaurantName = useCartStore((s) => s.restaurantName);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);
	const subtotal = useCartStore((s) => s.getSubtotal());
	const tax = useCartStore((s) => s.getTax());
	const deliveryFee = useCartStore((s) => s.getDeliveryFee());
	const total = useCartStore((s) => s.getTotal());

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<button
				type="button"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
				aria-label="Close cart"
			/>

			<div className="relative w-full max-w-md bg-white shadow-xl dark:bg-zinc-900">
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
						<div className="flex items-center gap-2">
							<ShoppingCart className="h-5 w-5" />
							<h2 className="font-semibold text-lg">Your Order</h2>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{items.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-zinc-400">
							<ShoppingCart className="h-12 w-12" />
							<p>Your cart is empty</p>
							<p className="text-sm">
								Ask the agent to help you find something to eat
							</p>
						</div>
					) : (
						<>
							{restaurantName && (
								<p className="border-b border-zinc-100 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-800">
									From {restaurantName}
								</p>
							)}

							<div className="flex-1 overflow-y-auto p-4">
								<div className="space-y-3">
									{items.map((ci) => (
										<div
											key={ci.menuItem.id}
											className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
										>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">
													{ci.menuItem.name}
												</p>
												<p className="text-sm text-zinc-500">
													${(ci.menuItem.price * ci.quantity).toFixed(2)}
												</p>
											</div>

											<div className="flex items-center gap-1.5">
												<button
													type="button"
													onClick={() =>
														updateQuantity(ci.menuItem.id, ci.quantity - 1)
													}
													className="rounded-md border border-zinc-200 p-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
												>
													<Minus className="h-3 w-3" />
												</button>
												<span className="w-6 text-center text-sm font-medium">
													{ci.quantity}
												</span>
												<button
													type="button"
													onClick={() =>
														updateQuantity(ci.menuItem.id, ci.quantity + 1)
													}
													className="rounded-md border border-zinc-200 p-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
												>
													<Plus className="h-3 w-3" />
												</button>
												<button
													type="button"
													onClick={() => removeItem(ci.menuItem.id)}
													className="ml-1 rounded-md p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span className="text-zinc-500">Subtotal</span>
										<span>${subtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-zinc-500">Tax</span>
										<span>${tax.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-zinc-500">Delivery</span>
										<span>${deliveryFee.toFixed(2)}</span>
									</div>
									<div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-zinc-700">
										<span>Total</span>
										<span>${total.toFixed(2)}</span>
									</div>
								</div>

								<button
									type="button"
									onClick={onCheckout}
									className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
								>
									Review Order
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
