"use client";

import { Bot, Loader2, Mic, MicOff, Send, User, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAgent } from "@/hooks/useAgent";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";

const TOOL_LABELS: Record<string, string> = {
	"search-restaurants": "Searching restaurants",
	"get-restaurant-menu": "Fetching menu",
	"filter-menu-items": "Filtering items",
	"compare-options": "Comparing options",
	"add-to-cart": "Adding to cart",
	"remove-from-cart": "Removing from cart",
	"get-cart-summary": "Checking your cart",
	"prepare-order": "Preparing your order",
};

export function ConversationPanel() {
	const { messages, isThinking, activeTool, error, sendMessage } = useAgent();
	const voice = useVoiceAgent();
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, []);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text || isThinking) return;
		setInput("");
		sendMessage(text);
	}

	function toggleVoice() {
		if (voice.state.isConnected) {
			voice.disconnect();
		} else {
			voice.connect();
		}
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-zinc-950">
			<header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
						<Bot className="h-5 w-5" />
					</div>
					<div>
						<h1 className="font-semibold leading-tight">AgentBridge</h1>
						<p className="text-xs text-zinc-500">
							Your food ordering assistant
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={toggleVoice}
					className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
						voice.state.isConnected
							? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400"
							: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
					}`}
				>
					{voice.state.isConnected ? (
						<>
							<MicOff className="h-4 w-4" />
							Stop voice
						</>
					) : (
						<>
							<Mic className="h-4 w-4" />
							Voice
						</>
					)}
				</button>
			</header>

			<div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
				{messages.length === 0 && voice.messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
							<Bot className="h-7 w-7 text-blue-600" />
						</div>
						<div>
							<p className="font-medium">Hey, I'm your food agent</p>
							<p className="mt-1 max-w-xs text-sm text-zinc-500">
								Try saying{" "}
								<span className="font-medium text-zinc-700 dark:text-zinc-300">
									"Get me lunch"
								</span>{" "}
								and I'll handle the rest.
							</p>
						</div>
					</div>
				)}

				{messages.map((msg) => (
					<Message key={msg.id} from={msg.role} content={msg.content} />
				))}

				{voice.messages.map((msg) => (
					<Message
						key={`voice-${msg.role}-${msg.content.slice(0, 24)}-${msg.content.length}`}
						from={msg.role}
						content={msg.content}
					/>
				))}

				{voice.state.transcript && (
					<Message from="assistant" content={voice.state.transcript} />
				)}

				{(activeTool || voice.activeTool) && (
					<div className="flex items-center gap-2 text-sm text-zinc-500">
						<Wrench className="h-4 w-4 animate-pulse" />
						{(() => {
							const t = activeTool ?? voice.activeTool ?? "";
							return TOOL_LABELS[t] ?? t;
						})()}
						...
					</div>
				)}

				{isThinking && !activeTool && (
					<div className="flex items-center gap-2 text-sm text-zinc-500">
						<Loader2 className="h-4 w-4 animate-spin" />
						Thinking...
					</div>
				)}

				{(error || voice.error) && (
					<div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
						{error || voice.error}
					</div>
				)}
			</div>

			{voice.state.isConnected && (
				<div className="flex items-center justify-center gap-2 border-t border-zinc-200 py-2 text-sm text-zinc-500 dark:border-zinc-800">
					<span
						className={`h-2 w-2 rounded-full ${
							voice.state.isListening
								? "animate-pulse bg-green-500"
								: voice.state.isSpeaking
									? "animate-pulse bg-blue-500"
									: "bg-zinc-300"
						}`}
					/>
					{voice.state.isListening
						? "Listening..."
						: voice.state.isSpeaking
							? "Speaking..."
							: "Voice connected"}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="flex items-center gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800"
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask for food, e.g. 'Find me cheap tacos'"
					className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
				/>
				<button
					type="submit"
					disabled={!input.trim() || isThinking}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
				>
					<Send className="h-4 w-4" />
				</button>
			</form>
		</div>
	);
}

function Message({
	from,
	content,
}: {
	from: "user" | "assistant" | "system";
	content: string;
}) {
	const isUser = from === "user";
	return (
		<div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
			<div
				className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
					isUser ? "bg-zinc-200 dark:bg-zinc-700" : "bg-blue-600 text-white"
				}`}
			>
				{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
			</div>
			<div
				className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
					isUser
						? "bg-blue-600 text-white"
						: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
				}`}
			>
				{content}
			</div>
		</div>
	);
}
