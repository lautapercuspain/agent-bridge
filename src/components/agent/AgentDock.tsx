"use client";

import {
	ArrowUp,
	Bot,
	Loader2,
	Mic,
	Sparkles,
	User,
	Wrench,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAgent } from "@/hooks/useAgent";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";

const TOOL_LABELS: Record<string, string> = {
	"list-categories": "Browsing categories",
	"search-restaurants": "Searching restaurants",
	"get-restaurant-menu": "Opening the menu",
	"filter-menu-items": "Filtering the menu",
	"add-to-cart": "Adding to cart",
	"remove-from-cart": "Removing from cart",
	"update-cart-item": "Updating your cart",
	"get-cart": "Reviewing your cart",
	"start-checkout": "Opening checkout",
	"place-order": "Placing your order",
	"get-order-status": "Checking your order",
};

const SUGGESTIONS = [
	"Find me a healthy lunch under $15",
	"I'm craving spicy ramen",
	"Order two double smash burgers and check out",
];

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
			<span
				className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
					isUser ? "bg-ink text-white" : "bg-brand-soft text-brand"
				}`}
			>
				{isUser ? (
					<User className="h-3.5 w-3.5" strokeWidth={2} />
				) : (
					<Bot className="h-3.5 w-3.5" strokeWidth={2} />
				)}
			</span>
			<div
				className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
					isUser
						? "bg-ink text-white"
						: "border border-line bg-surface text-ink"
				}`}
			>
				{content}
			</div>
		</div>
	);
}

export function AgentDock({ onClose }: { onClose?: () => void }) {
	const { messages, isThinking, activeTool, sendMessage } = useAgent();
	const voice = useVoiceAgent();
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, voice.messages, activeTool, voice.activeTool]);

	function submit(text: string) {
		const value = text.trim();
		if (!value || isThinking) return;
		setInput("");
		if (voice.state.isConnected) voice.sendTextMessage(value);
		else sendMessage(value);
	}

	const empty = messages.length === 0 && voice.messages.length === 0;

	return (
		<div className="flex h-full flex-col bg-surface">
			<header className="flex items-center justify-between border-b border-line px-4 py-3.5">
				<div className="flex items-center gap-2.5">
					<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
						<Sparkles
							className="h-[18px] w-[18px] text-brand"
							strokeWidth={2}
						/>
					</span>
					<div>
						<div className="flex items-center gap-1.5">
							<h2 className="text-sm font-semibold leading-tight">
								AgentBridge Assistant
							</h2>
							<span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-strong">
								WebMCP
							</span>
						</div>
						<p className="text-[11px] text-muted">Orders for you, end to end</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() =>
							voice.state.isConnected ? voice.disconnect() : voice.connect()
						}
						aria-label="Toggle voice"
						className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
							voice.state.isConnected
								? "bg-brand text-white"
								: "text-ink hover:bg-brand-soft"
						}`}
					>
						<Mic className="h-[18px] w-[18px]" strokeWidth={2} />
					</button>
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Close assistant"
							className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-ink/[0.06] lg:hidden"
						>
							<X className="h-5 w-5" strokeWidth={2} />
						</button>
					)}
				</div>
			</header>

			<div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
				{empty && (
					<div className="flex flex-col items-center gap-3 pt-6 text-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft">
							<Bot className="h-6 w-6 text-brand" strokeWidth={1.75} />
						</span>
						<p className="max-w-[15rem] text-sm text-muted">
							Tell me what you're hungry for and I'll find it, build your cart,
							and check out — all on AgentBridge.
						</p>
						<div className="mt-1 flex w-full flex-col gap-2">
							{SUGGESTIONS.map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => submit(s)}
									className="rounded-xl border border-line bg-cream px-3 py-2 text-left text-sm transition-colors hover:border-brand/40 hover:bg-brand-soft"
								>
									{s}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((m) => (
					<Message key={m.id} from={m.role} content={m.content} />
				))}
				{voice.messages.map((m) => (
					<Message
						key={`voice-${m.role}-${m.content.slice(0, 16)}-${m.content.length}`}
						from={m.role}
						content={m.content}
					/>
				))}
				{voice.state.transcript && (
					<Message from="assistant" content={voice.state.transcript} />
				)}

				{(activeTool || voice.activeTool) && (
					<div className="flex items-center gap-2 pl-1 text-sm text-brand">
						<Wrench className="h-4 w-4 animate-pulse" strokeWidth={2} />
						{TOOL_LABELS[activeTool ?? voice.activeTool ?? ""] ??
							activeTool ??
							voice.activeTool}
						…
					</div>
				)}
				{isThinking && !activeTool && (
					<div className="flex items-center gap-2 pl-1 text-sm text-muted">
						<Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
						Thinking…
					</div>
				)}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					submit(input);
				}}
				className="border-t border-line p-3"
			>
				<div className="flex items-center gap-2 rounded-full border border-line bg-cream py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-brand/40">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={
							voice.state.isConnected ? "Listening… or type" : "Ask for food…"
						}
						className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted"
					/>
					<button
						type="submit"
						disabled={!input.trim() || isThinking}
						aria-label="Send"
						className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] enabled:hover:bg-brand-strong enabled:active:scale-90 disabled:opacity-40"
					>
						<ArrowUp className="h-4 w-4" strokeWidth={2.5} />
					</button>
				</div>
			</form>
		</div>
	);
}
