"use client";

import { Sparkles } from "lucide-react";
import type { AgentIntent } from "@/lib/webmcp-tools";

export function IntentBar({
	intent,
	count,
}: {
	intent: AgentIntent;
	count: number;
}) {
	return (
		<div className="animate-fade-up flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-brand/15 bg-brand-soft px-4 py-3">
			<span className="flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
				<Sparkles className="h-4 w-4" strokeWidth={2} />
				{intent.title}
			</span>
			<span className="text-sm text-muted">
				{count} {count === 1 ? "match" : "matches"}
			</span>
			{intent.chips.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{intent.chips.map((chip) => (
						<span
							key={chip}
							className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink ring-1 ring-line"
						>
							{chip}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
