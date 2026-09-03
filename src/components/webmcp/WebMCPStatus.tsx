"use client";

import { Check, CircleX, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toolLabel } from "@/lib/tool-labels";
import { useWebMCPActivity } from "@/stores/webmcp-activity";

// Live WebMCP indicator: shows registration state and, in real time, which
// tool any client is executing right now — so an audience can watch the agent
// drive the app tool-by-tool.
export function WebMCPStatus() {
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
			<span
				role="status"
				aria-live="polite"
				className="fixed right-4 top-20 z-60 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_28px_-10px_rgba(255,90,44,0.9)] sm:right-6"
			>
				<Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
				{toolLabel(running.name)}…
			</span>
		);
	}

	if (flashing && last) {
		const ok = last.ok !== false;
		const Icon = ok ? Check : CircleX;
		return (
			<span
				role="status"
				aria-live="polite"
				className={`fixed right-4 top-20 z-60 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg ring-1 sm:right-6 ${
					ok
						? "bg-emerald-50 text-emerald-700 ring-emerald-500/25"
						: "bg-red-50 text-red-700 ring-red-500/25"
				}`}
			>
				<Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
				{toolLabel(last.name)}
			</span>
		);
	}

	return null;
}
