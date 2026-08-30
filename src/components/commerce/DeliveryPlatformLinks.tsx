"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { generateDeliveryLinks } from "@/lib/delivery-links";
import { useLocationStore } from "@/stores/location-store";

interface HandoffItem {
	name: string;
	quantity: number;
}

interface DeliveryPlatformLinksProps {
	restaurantName: string;
	layout?: "row" | "stack";
	items?: HandoffItem[];
}

// Renders the real "order on" handoff buttons for the delivery marketplaces
// available in the user's country. Each button opens the platform's search for
// this restaurant in a new tab, where the user completes the actual order.
export function DeliveryPlatformLinks({
	restaurantName,
	layout = "row",
	items = [],
}: DeliveryPlatformLinksProps) {
	const countryCode = useLocationStore((s) => s.countryCode);
	const [copied, setCopied] = useState(false);
	const links = generateDeliveryLinks(restaurantName, countryCode);
	const hasItems = items.length > 0;

	if (links.length === 0) return null;

	async function copyShortlist() {
		const text = [
			`Restaurant: ${restaurantName}`,
			"Items:",
			...items.map((item) => `${item.quantity}x ${item.name}`),
		].join("\n");
		await navigator.clipboard.writeText(text);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	}

	return (
		<div className="space-y-3">
			{hasItems && layout === "stack" && (
				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Shortlist to add in app
						</p>
						<button
							type="button"
							onClick={copyShortlist}
							className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
						>
							{copied ? (
								<Check className="h-3.5 w-3.5" />
							) : (
								<Copy className="h-3.5 w-3.5" />
							)}
							{copied ? "Copied" : "Copy"}
						</button>
					</div>
					<ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
						{items.map((item) => (
							<li key={item.name} className="flex justify-between gap-3">
								<span className="truncate">{item.name}</span>
								<span className="shrink-0">x{item.quantity}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<div
				className={
					layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"
				}
			>
				{links.map((link) => (
					<a
						key={link.platform}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						style={{ backgroundColor: link.color, color: link.textColor }}
						className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${
							layout === "stack" ? "w-full" : ""
						}`}
					>
						<span>Find on {link.label}</span>
						<ExternalLink className="h-3.5 w-3.5" />
					</a>
				))}
			</div>
		</div>
	);
}
