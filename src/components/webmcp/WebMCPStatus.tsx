"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toolLabel } from "@/lib/tool-labels";
import { useWebMCPActivity } from "@/stores/webmcp-activity";

// Live WebMCP indicator: shows registration state and, in real time, which
// tool any client is executing right now — so an audience can watch the agent
// drive the app tool-by-tool.
export function WebMCPStatus() {
	const status = useWebMCPActivity((s) => s.status);
	const toolCount = useWebMCPActivity((s) => s.toolCount);
	const running = useWebMCPActivity((s) => s.running);
	const last = useWebMCPActivity((s) => s.last);
	const [flashing, setFlashing] = useState(false);

	useEffect(() => {
		if (!last) return;
		setFlashing(true);
		const t = setTimeout(() => setFlashing(false), 2200);
		return () => clearTimeout(t);
	}, [last]);

	if (running) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_6px_16px_-8px_rgba(255,90,44,0.85)]">
				<Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
				{toolLabel(running.name)}…
			</span>
		);
	}

	if (flashing && last) {
		const ok = last.ok !== false;
		return (
			<span
				className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ${
					ok
						? "bg-emerald-50 text-emerald-700 ring-emerald-500/25"
						: "bg-red-50 text-red-700 ring-red-500/25"
				}`}
			>
				<Check className="h-3.5 w-3.5" strokeWidth={2.5} />
				{toolLabel(last.name)}
			</span>
		);
	}

	const ready = status === "ready";
	return (
		<span
			className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink/70"
			title={
				ready
					? `${toolCount} WebMCP tools registered and ready`
					: "Registering WebMCP tools…"
			}
		>
			<span className="relative flex h-2 w-2">
				{ready && (
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
				)}
				<span
					className={`relative inline-flex h-2 w-2 rounded-full ${
						ready ? "bg-emerald-500" : "animate-pulse bg-amber-400"
					}`}
				/>
			</span>
			<span className="font-semibold text-ink">WebMCP</span>
			<span aria-hidden className="text-ink/30">
				·
			</span>
			{ready ? `${toolCount} tools` : "connecting…"}
		</span>
	);
}
