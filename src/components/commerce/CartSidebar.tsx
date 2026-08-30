"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { DeliveryPlatformLinks } from "./DeliveryPlatformLinks";

interface CartSidebarProps {
	open: boolean;
	onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
	const items = useCartStore((s) => s.items);
	const restaurantName = useCartStore((s) => s.restaurantName);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);
	const subtotal = useCartStore((s) => s.getSubtotal());

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<button
				type="button"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
				aria-label="Close shortlist"
			/>

			<div className="relative w-full max-w-md bg-white shadow-xl dark:bg-zinc-900">
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
						<div className="flex items-center gap-2">
							<ShoppingBag className="h-5 w-5" />
							<h2 className="font-semibold text-lg">Your Shortlist</h2>
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
						<div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-zinc-400">
							<ShoppingBag className="h-12 w-12" />
							<p>Your shortlist is empty</p>
							<p className="text-sm">
								Ask the agent to help you find something to eat, then order it
								in your delivery app.
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
								<div className="flex justify-between text-sm">
									<span className="text-zinc-500">Estimated subtotal</span>
									<span className="font-medium">${subtotal.toFixed(2)}</span>
								</div>

								{restaurantName && (
									<div className="mt-4">
										<p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
											Complete your order
										</p>
										<DeliveryPlatformLinks
											restaurantName={restaurantName}
											layout="stack"
											items={items.map((ci) => ({
												name: ci.menuItem.name,
												quantity: ci.quantity,
											}))}
										/>
									</div>
								)}

								<p className="mt-3 text-center text-xs text-zinc-400">
									Prices are estimates. Use the shortlist as a guide while you
									add items, then confirm the live total, pay, and arrange
									delivery in your chosen app.
								</p>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
