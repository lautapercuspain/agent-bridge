"use client";

import { useState } from "react";
import { ConversationPanel } from "@/components/agent/ConversationPanel";
import { CartSidebar } from "@/components/commerce/CartSidebar";
import { CommercePanel } from "@/components/commerce/CommercePanel";
import { OrderConfirmation } from "@/components/commerce/OrderConfirmation";
import { OrderReview } from "@/components/commerce/OrderReview";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import type { Order } from "@/types";

export default function Home() {
	const [cartOpen, setCartOpen] = useState(false);
	const [reviewOpen, setReviewOpen] = useState(false);
	const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

	const orderPrepared = useAgentUIStore((s) => s.orderPrepared);
	const setOrderPrepared = useAgentUIStore((s) => s.setOrderPrepared);

	// When the agent calls prepare-order, surface the review modal.
	if (orderPrepared && !reviewOpen && !confirmedOrder) {
		setReviewOpen(true);
		setOrderPrepared(false);
	}

	function openReview() {
		setCartOpen(false);
		setReviewOpen(true);
	}

	function handleConfirmed(order: Order) {
		setReviewOpen(false);
		setConfirmedOrder(order);
	}

	return (
		<div className="flex flex-1 overflow-hidden">
			<div className="hidden w-full max-w-md border-r border-zinc-200 md:block dark:border-zinc-800">
				<ConversationPanel />
			</div>

			<div className="flex-1">
				<CommercePanel onOpenCart={() => setCartOpen(true)} />
			</div>

			<CartSidebar
				open={cartOpen}
				onClose={() => setCartOpen(false)}
				onCheckout={openReview}
			/>

			<OrderReview
				open={reviewOpen}
				onClose={() => setReviewOpen(false)}
				onConfirmed={handleConfirmed}
			/>

			<OrderConfirmation
				order={confirmedOrder}
				onClose={() => setConfirmedOrder(null)}
			/>
		</div>
	);
}
