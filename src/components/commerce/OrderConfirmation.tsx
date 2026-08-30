"use client";

import { CheckCircle2, Clock, MapPin } from "lucide-react";
import type { Order } from "@/types";

interface OrderConfirmationProps {
	order: Order | null;
	onClose: () => void;
}

export function OrderConfirmation({ order, onClose }: OrderConfirmationProps) {
	if (!order) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				aria-label="Close confirmation"
			/>

			<div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
					<CheckCircle2 className="h-9 w-9 text-green-600" />
				</div>

				<h2 className="mt-4 text-xl font-semibold">Order Confirmed</h2>
				<p className="mt-1 text-sm text-zinc-500">
					Your order from {order.restaurantName} is on its way.
				</p>

				<div className="mt-5 space-y-2 rounded-xl bg-zinc-50 p-4 text-left text-sm dark:bg-zinc-800/50">
					<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
						<Clock className="h-4 w-4" />
						Estimated delivery: {order.estimatedDelivery}
					</div>
					<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
						<MapPin className="h-4 w-4" />
						{order.deliveryAddress}
					</div>
				</div>

				<div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 font-medium dark:border-zinc-800">
					<span>Total paid</span>
					<span>${order.total.toFixed(2)}</span>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
				>
					Done
				</button>
			</div>
		</div>
	);
}
