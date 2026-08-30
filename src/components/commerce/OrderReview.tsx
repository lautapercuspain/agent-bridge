"use client";

import { Check, Clock, MapPin, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import type { Order } from "@/types";

interface OrderReviewProps {
	open: boolean;
	onClose: () => void;
	onConfirmed: (order: Order) => void;
}

export function OrderReview({ open, onClose, onConfirmed }: OrderReviewProps) {
	const [address, setAddress] = useState("123 Main St, San Francisco, CA");
	const [submitting, setSubmitting] = useState(false);

	const items = useCartStore((s) => s.items);
	const restaurantId = useCartStore((s) => s.restaurantId);
	const restaurantName = useCartStore((s) => s.restaurantName);
	const subtotal = useCartStore((s) => s.getSubtotal());
	const tax = useCartStore((s) => s.getTax());
	const deliveryFee = useCartStore((s) => s.getDeliveryFee());
	const total = useCartStore((s) => s.getTotal());
	const clearCart = useCartStore((s) => s.clearCart);

	if (!open) return null;

	async function confirmOrder() {
		setSubmitting(true);
		try {
			const res = await fetch("/api/order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items,
					restaurantId,
					restaurantName,
					subtotal,
					tax,
					deliveryFee,
					total,
					deliveryAddress: address,
				}),
			});
			if (!res.ok) throw new Error("Failed to place order");
			const data = await res.json();
			clearCart();
			onConfirmed(data.order);
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				aria-label="Close order review"
			/>

			<div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
				<div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
					<div>
						<h2 className="font-semibold text-lg">Review Your Order</h2>
						{restaurantName && (
							<p className="text-sm text-zinc-500">{restaurantName}</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="max-h-[50vh] overflow-y-auto p-5">
					<div className="space-y-2">
						{items.map((ci) => (
							<div
								key={ci.menuItem.id}
								className="flex items-center justify-between text-sm"
							>
								<span>
									<span className="font-medium">{ci.quantity}x</span>{" "}
									{ci.menuItem.name}
								</span>
								<span className="text-zinc-500">
									${(ci.menuItem.price * ci.quantity).toFixed(2)}
								</span>
							</div>
						))}
					</div>

					<div className="my-4 space-y-1 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
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
						<div className="flex justify-between pt-1 font-semibold">
							<span>Total</span>
							<span>${total.toFixed(2)}</span>
						</div>
					</div>

					<label
						htmlFor="delivery-address"
						className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						<MapPin className="h-4 w-4" />
						Delivery Address
					</label>
					<input
						id="delivery-address"
						type="text"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
					/>

					<div className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500">
						<Clock className="h-4 w-4" />
						Estimated delivery: 30-50 minutes
					</div>
				</div>

				<div className="border-t border-zinc-200 p-5 dark:border-zinc-800">
					<button
						type="button"
						onClick={confirmOrder}
						disabled={submitting || items.length === 0}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
					>
						<Check className="h-4 w-4" />
						{submitting
							? "Placing Order..."
							: `Confirm Order - $${total.toFixed(2)}`}
					</button>
					<p className="mt-2 text-center text-xs text-zinc-400">
						You are in control. The agent prepared this order for your review.
					</p>
				</div>
			</div>
		</div>
	);
}
