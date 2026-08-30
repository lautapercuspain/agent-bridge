"use client";

import { Loader2, MapPin, Navigation } from "lucide-react";
import { useRef, useState } from "react";
import { useLocationStore } from "@/stores/location-store";

export function LocationIndicator() {
	const status = useLocationStore((s) => s.status);
	const cityName = useLocationStore((s) => s.cityName);
	const setManualLocation = useLocationStore((s) => s.setManualLocation);

	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	function startEditing() {
		setDraft(cityName ?? "");
		setEditing(true);
		requestAnimationFrame(() => inputRef.current?.focus());
	}

	function commitEdit() {
		const trimmed = draft.trim();
		if (trimmed) {
			setManualLocation(trimmed);
		}
		setEditing(false);
	}

	if (editing) {
		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					commitEdit();
				}}
				className="flex items-center gap-1.5"
			>
				<MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
				<input
					ref={inputRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={commitEdit}
					placeholder="City or address"
					className="w-32 border-b border-zinc-300 bg-transparent text-xs outline-none dark:border-zinc-600"
				/>
			</form>
		);
	}

	if (status === "loading") {
		return (
			<div className="flex items-center gap-1.5 text-xs text-zinc-400">
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
				<span>Locating...</span>
			</div>
		);
	}

	if (status === "granted" && cityName) {
		return (
			<button
				type="button"
				onClick={startEditing}
				className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
			>
				<MapPin className="h-3.5 w-3.5 text-blue-600" />
				<span className="max-w-35 truncate">{cityName}</span>
			</button>
		);
	}

	if (status === "denied" || status === "error") {
		return (
			<button
				type="button"
				onClick={startEditing}
				className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
			>
				<Navigation className="h-3.5 w-3.5" />
				<span>Set location</span>
			</button>
		);
	}

	// idle — location not yet requested (shouldn't normally show since we auto-trigger)
	return null;
}
