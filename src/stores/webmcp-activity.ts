import { create } from "zustand";

// Tracks WebMCP registration + live tool-call activity so the UI can show, in
// real time, which tool any client (external WebMCP agent, the in-page
// assistant, or voice) is executing right now.
export type WebMCPConnState = "connecting" | "ready";
export type WebMCPTransport = "native" | "polyfill";

export interface ToolCall {
	id: number;
	name: string;
	startedAt: number;
	endedAt?: number;
	ok?: boolean;
}

interface WebMCPActivityState {
	status: WebMCPConnState;
	transport: WebMCPTransport | null;
	toolCount: number;
	running: ToolCall | null;
	last: ToolCall | null;
	history: ToolCall[];

	markReady: (toolCount: number, transport: WebMCPTransport) => void;
	startCall: (name: string) => number;
	endCall: (id: number, ok: boolean) => void;
}

let seq = 0;

export const useWebMCPActivity = create<WebMCPActivityState>((set) => ({
	status: "connecting",
	transport: null,
	toolCount: 0,
	running: null,
	last: null,
	history: [],

	markReady: (toolCount, transport) =>
		set({ status: "ready", toolCount, transport }),

	startCall: (name) => {
		const id = ++seq;
		set({ running: { id, name, startedAt: Date.now() } });
		return id;
	},

	endCall: (id, ok) =>
		set((s) => {
			const base =
				s.running?.id === id
					? s.running
					: { id, name: "", startedAt: Date.now() };
			const done: ToolCall = { ...base, endedAt: Date.now(), ok };
			return {
				running: s.running?.id === id ? null : s.running,
				last: done,
				history: [done, ...s.history].slice(0, 20),
			};
		}),
}));
