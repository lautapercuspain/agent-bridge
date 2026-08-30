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
			const { initializeWebMCPPolyfill } = await import(
				"@mcp-b/webmcp-polyfill"
			);
			initializeWebMCPPolyfill();

			const tools = createToolDefinitions();

			const ctx = document.modelContext;
			if (!ctx) {
				console.warn("[AgentBridge] document.modelContext not available");
				return;
			}

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
