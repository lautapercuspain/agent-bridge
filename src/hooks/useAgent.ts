"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types";

interface ToolCall {
	toolCallId: string;
	toolName: string;
	input: unknown;
}

// A model message as returned/consumed by the AI SDK.
type ModelMessage = {
	role: "system" | "user" | "assistant" | "tool";
	content: unknown;
};

// executeTool() is a Chromium extension not present in the standard
// document.modelContext type, so we narrow to the members we use.
type ExecutableModelContext = {
	getTools: NonNullable<typeof document.modelContext>["getTools"];
	executeTool?: (
		tool: WebMCP.RegisteredTool,
		inputArguments: string,
	) => Promise<string | null>;
};

const MAX_TURNS = 12;

/**
 * In-page WebMCP agent. Discovers tools registered on document.modelContext,
 * sends them to the server LLM, and executes returned tool calls locally via
 * document.modelContext.executeTool() — the human-in-the-loop WebMCP pattern.
 */
export function useAgent() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const [activeTool, setActiveTool] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const modelMessagesRef = useRef<ModelMessage[]>([]);

	const runAgentLoop = useCallback(async () => {
		const ctx = document.modelContext as ExecutableModelContext | undefined;
		const registered = ctx ? await ctx.getTools() : [];
		const toolDefs = registered.map((t) => ({
			name: t.name,
			description: t.description,
			inputSchema: t.inputSchema,
		}));

		for (let turn = 0; turn < MAX_TURNS; turn++) {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: modelMessagesRef.current,
					tools: toolDefs,
				}),
			});

			if (!res.ok) throw new Error("Agent request failed");
			const data = await res.json();

			const responseMessages: ModelMessage[] = data.responseMessages ?? [];
			modelMessagesRef.current.push(...responseMessages);

			if (data.text) {
				setMessages((prev) => [
					...prev,
					{
						id: `assistant-${Date.now()}-${turn}`,
						role: "assistant",
						content: data.text,
						timestamp: Date.now(),
					},
				]);
			}

			const toolCalls: ToolCall[] = data.toolCalls ?? [];
			if (toolCalls.length === 0) return;

			const toolResults = [];
			for (const call of toolCalls) {
				setActiveTool(call.toolName);
				const registeredTool = registered.find((t) => t.name === call.toolName);
				let output = "Tool not found";
				if (registeredTool && ctx?.executeTool) {
					try {
						const result = await ctx.executeTool(
							registeredTool,
							JSON.stringify(call.input ?? {}),
						);
						output = result ?? "";
					} catch (err) {
						output = `Tool error: ${
							err instanceof Error ? err.message : String(err)
						}`;
					}
				}
				toolResults.push({
					type: "tool-result" as const,
					toolCallId: call.toolCallId,
					toolName: call.toolName,
					output: { type: "text" as const, value: output },
				});
			}
			setActiveTool(null);

			modelMessagesRef.current.push({ role: "tool", content: toolResults });
		}
	}, []);

	const sendMessage = useCallback(
		async (text: string) => {
			setError(null);
			setMessages((prev) => [
				...prev,
				{
					id: `user-${Date.now()}`,
					role: "user",
					content: text,
					timestamp: Date.now(),
				},
			]);
			modelMessagesRef.current.push({ role: "user", content: text });

			setIsThinking(true);
			try {
				await runAgentLoop();
			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong");
			} finally {
				setIsThinking(false);
				setActiveTool(null);
			}
		},
		[runAgentLoop],
	);

	return { messages, isThinking, activeTool, error, sendMessage };
}
