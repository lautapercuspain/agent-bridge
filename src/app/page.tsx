"use client";

import { useEffect, useState } from "react";
import { ConversationPanel } from "@/components/agent/ConversationPanel";
import { CartSidebar } from "@/components/commerce/CartSidebar";
import { CommercePanel } from "@/components/commerce/CommercePanel";
import { useAgentUIStore } from "@/lib/webmcp-tools";
import { useLocationStore } from "@/stores/location-store";

export default function Home() {
	const [cartOpen, setCartOpen] = useState(false);

	const requestLocation = useLocationStore((s) => s.requestLocation);

	useEffect(() => {
		requestLocation();
	}, [requestLocation]);

	const checkoutRequested = useAgentUIStore((s) => s.checkoutRequested);
	const setCheckoutRequested = useAgentUIStore((s) => s.setCheckoutRequested);

	// When the agent calls checkout-on-platform, open the shortlist so the user
	// can tap through to their delivery app.
	if (checkoutRequested && !cartOpen) {
		setCartOpen(true);
		setCheckoutRequested(false);
	}

	return (
		<div className="flex flex-1 overflow-hidden">
			<div className="hidden w-full max-w-md border-r border-zinc-200 md:block dark:border-zinc-800">
				<ConversationPanel />
			</div>

			<div className="flex-1">
				<CommercePanel onOpenCart={() => setCartOpen(true)} />
			</div>

			<CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
		</div>
	);
}
