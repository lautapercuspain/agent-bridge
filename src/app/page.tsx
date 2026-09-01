"use client";

import { Suspense, useState } from "react";
import { AgentDock } from "@/components/agent/AgentDock";
import { CartSidebar } from "@/components/commerce/CartSidebar";
import { ItemModal } from "@/components/commerce/ItemModal";
import { Storefront } from "@/components/commerce/Storefront";
import { TopBar } from "@/components/commerce/TopBar";
import { useAgentUIStore } from "@/lib/webmcp-tools";

export default function Home() {
	const [cartOpen, setCartOpen] = useState(false);
	const [agentOpen, setAgentOpen] = useState(false);
	const activeItem = useAgentUIStore((s) => s.activeItem);

	return (
		<div className="flex h-dvh flex-col overflow-hidden">
			<TopBar
				onOpenCart={() => setCartOpen(true)}
				onOpenAgent={() => setAgentOpen(true)}
			/>

			<div className="relative flex flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-6xl">
						<Suspense fallback={null}>
							<Storefront />
						</Suspense>
					</div>
				</main>

				<button
					type="button"
					aria-label="Close assistant"
					onClick={() => setAgentOpen(false)}
					className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
						agentOpen ? "opacity-100" : "pointer-events-none opacity-0"
					}`}
				/>

				<aside
					className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] lg:static lg:z-auto lg:w-95 lg:max-w-none lg:translate-x-0 lg:border-l lg:border-line lg:shadow-none ${
						agentOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
					}`}
				>
					<AgentDock onClose={() => setAgentOpen(false)} />
				</aside>
			</div>

			<CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
			{activeItem && <ItemModal />}
		</div>
	);
}
