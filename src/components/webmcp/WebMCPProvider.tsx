"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { createToolDefinitions } from "@/lib/webmcp-tools";
import { useWebMCPActivity } from "@/stores/webmcp-activity";

export function WebMCPProvider({ children }: { children: ReactNode }) {
	const initialized = useRef(false);
	const controllersRef = useRef<AbortController[]>([]);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		async function init() {
			// Defer to a native WebMCP implementation when present (e.g. an
			// agentic browser); otherwise install the polyfill so any WebMCP
			// client — or our own in-page agent — can discover the tools.
			// A usable context must expose registerTool; a bare/stub
			// document.modelContext (no registerTool) falls back to the polyfill.
			const native = Boolean(document.modelContext?.registerTool);
			if (!native) {
				const { initializeWebMCPPolyfill } = await import(
					"@mcp-b/webmcp-polyfill"
				);
				initializeWebMCPPolyfill();
			}

			const ctx = document.modelContext;
			if (!ctx) {
				console.warn("[AgentBridge] WebMCP modelContext not available");
				return;
			}

			const tools = createToolDefinitions();
			const activity = useWebMCPActivity.getState();

			for (const tool of Object.values(tools)) {
				const controller = new AbortController();
				controllersRef.current.push(controller);

				// Wrap execute so every call (from any client) is reported live.
				const exec = tool.execute as (args: unknown) => Promise<unknown>;
				const instrumentedExecute = (async (args: unknown) => {
					const callId = useWebMCPActivity.getState().startCall(tool.name);
					try {
						const result = await exec(args);
						useWebMCPActivity.getState().endCall(callId, true);
						return result;
					} catch (err) {
						useWebMCPActivity.getState().endCall(callId, false);
						throw err;
					}
				}) as WebMCP.ToolExecuteCallback;

				try {
					await ctx.registerTool(
						{
							name: tool.name,
							title: tool.title,
							description: tool.description,
							inputSchema: tool.inputSchema,
							annotations: tool.annotations,
							execute: instrumentedExecute,
						},
						{ signal: controller.signal },
					);
				} catch (err) {
					console.error(`Failed to register tool ${tool.name}:`, err);
				}
			}

			activity.markReady(
				Object.keys(tools).length,
				native ? "native" : "polyfill",
			);

			console.log(
				`[AgentBridge] Registered ${Object.keys(tools).length} WebMCP tools`,
			);
		}

		init();

		return () => {
			for (const c of controllersRef.current) c.abort();
			controllersRef.current = [];
		};
	}, []);

	return <>{children}</>;
}
