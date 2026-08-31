"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { createToolDefinitions } from "@/lib/webmcp-tools";

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
			const nav = navigator as Navigator & {
				modelContext?: typeof document.modelContext;
			};
			if (!nav.modelContext) {
				const { initializeWebMCPPolyfill } = await import(
					"@mcp-b/webmcp-polyfill"
				);
				initializeWebMCPPolyfill();
			}

			const ctx = nav.modelContext ?? document.modelContext;
			if (!ctx) {
				console.warn("[AgentBridge] WebMCP modelContext not available");
				return;
			}

			const tools = createToolDefinitions();

			for (const tool of Object.values(tools)) {
				const controller = new AbortController();
				controllersRef.current.push(controller);

				try {
					await ctx.registerTool(
						{
							name: tool.name,
							description: tool.description,
							inputSchema: tool.inputSchema,
							annotations: tool.annotations,
							execute: tool.execute as WebMCP.ToolExecuteCallback,
						},
						{ signal: controller.signal },
					);
				} catch (err) {
					console.error(`Failed to register tool ${tool.name}:`, err);
				}
			}

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
