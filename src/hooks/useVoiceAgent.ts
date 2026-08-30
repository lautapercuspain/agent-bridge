"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceState } from "@/types";

// executeTool() is a Chromium extension not present in the standard
// document.modelContext type, so we narrow to the members we use.
type ExecutableModelContext = {
	getTools: NonNullable<typeof document.modelContext>["getTools"];
	executeTool?: (
		tool: WebMCP.RegisteredTool,
		inputArguments: string,
	) => Promise<string | null>;
};

function float32ToPcm16(float32: Float32Array): Int16Array {
	const pcm16 = new Int16Array(float32.length);
	for (let i = 0; i < float32.length; i++) {
		const s = Math.max(-1, Math.min(1, float32[i]));
		pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
	}
	return pcm16;
}

function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
	const float32 = new Float32Array(pcm16.length);
	for (let i = 0; i < pcm16.length; i++) {
		float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
	}
	return float32;
}

function arrayBufferToBase64(buffer: ArrayBufferLike): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

export function useVoiceAgent() {
	const [state, setState] = useState<VoiceState>({
		isConnected: false,
		isListening: false,
		isSpeaking: false,
		transcript: "",
	});
	const [messages, setMessages] = useState<
		{ role: "user" | "assistant"; content: string }[]
	>([]);
	const [error, setError] = useState<string | null>(null);
	const [activeTool, setActiveTool] = useState<string | null>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const processorRef = useRef<ScriptProcessorNode | null>(null);
	const toolsRef = useRef<WebMCP.RegisteredTool[]>([]);

	const playAudioDelta = useCallback((base64Audio: string) => {
		if (!audioContextRef.current) return;
		const pcm16 = base64ToArrayBuffer(base64Audio);
		const float32 = pcm16ToFloat32(new Int16Array(pcm16));
		const buffer = audioContextRef.current.createBuffer(
			1,
			float32.length,
			24000,
		);
		buffer.copyToChannel(new Float32Array(float32), 0);
		const source = audioContextRef.current.createBufferSource();
		source.buffer = buffer;
		source.connect(audioContextRef.current.destination);
		source.start();
	}, []);

	// Run a WebMCP tool the voice model requested, then hand the result back so
	// the model can speak a natural response.
	const executeToolCall = useCallback(
		async (callId: string, name: string, argsJson: string) => {
			const ctx = document.modelContext as ExecutableModelContext | undefined;
			const tool = toolsRef.current.find((t) => t.name === name);
			let output = JSON.stringify({ error: "Tool unavailable" });

			if (tool && ctx?.executeTool) {
				setActiveTool(name);
				try {
					const result = await ctx.executeTool(tool, argsJson || "{}");
					output = result ?? "";
				} catch (err) {
					output = JSON.stringify({
						error: err instanceof Error ? err.message : String(err),
					});
				} finally {
					setActiveTool(null);
				}
			}

			const ws = wsRef.current;
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(
					JSON.stringify({
						type: "conversation.item.create",
						item: { type: "function_call_output", call_id: callId, output },
					}),
				);
				ws.send(JSON.stringify({ type: "response.create" }));
			}
		},
		[],
	);

	const handleServerEvent = useCallback(
		(event: Record<string, unknown>) => {
			switch (event.type) {
				case "response.output_audio_transcript.delta":
					setState((s) => ({
						...s,
						transcript: s.transcript + (event.delta as string),
					}));
					break;
				case "response.output_audio_transcript.done":
					setMessages((prev) => [
						...prev,
						{ role: "assistant", content: event.transcript as string },
					]);
					setState((s) => ({ ...s, transcript: "", isSpeaking: false }));
					break;
				case "response.output_audio.delta":
					setState((s) => ({ ...s, isSpeaking: true }));
					playAudioDelta(event.delta as string);
					break;
				case "response.function_call_arguments.done":
					executeToolCall(
						event.call_id as string,
						event.name as string,
						event.arguments as string,
					);
					break;
				case "input_audio_buffer.speech_started":
					setState((s) => ({ ...s, isListening: true }));
					break;
				case "input_audio_buffer.speech_stopped":
					setState((s) => ({ ...s, isListening: false }));
					break;
				case "conversation.item.input_audio_transcription.completed":
					setMessages((prev) => [
						...prev,
						{ role: "user", content: event.transcript as string },
					]);
					break;
				case "error":
					console.error("Realtime API error:", event.error);
					break;
			}
		},
		[playAudioDelta, executeToolCall],
	);

	const stopAudioCapture = useCallback(() => {
		processorRef.current?.disconnect();
		processorRef.current = null;
		for (const track of streamRef.current?.getTracks() ?? []) {
			track.stop();
		}
		streamRef.current = null;
		audioContextRef.current?.close();
		audioContextRef.current = null;
	}, []);

	const startAudioCapture = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: 24000,
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
				},
			});
			streamRef.current = stream;
			const audioContext = new AudioContext({ sampleRate: 24000 });
			audioContextRef.current = audioContext;
			const source = audioContext.createMediaStreamSource(stream);
			const processor = audioContext.createScriptProcessor(4096, 1, 1);
			processorRef.current = processor;

			processor.onaudioprocess = (e) => {
				if (wsRef.current?.readyState !== WebSocket.OPEN) return;
				const inputData = e.inputBuffer.getChannelData(0);
				const pcm16 = float32ToPcm16(inputData);
				const base64 = arrayBufferToBase64(pcm16.buffer);
				wsRef.current.send(
					JSON.stringify({ type: "input_audio_buffer.append", audio: base64 }),
				);
			};

			source.connect(processor);
			processor.connect(audioContext.destination);
		} catch (err) {
			console.error("Microphone access failed:", err);
			setError("Microphone access required for voice mode");
		}
	}, []);

	const connect = useCallback(async () => {
		try {
			setError(null);
			const tokenRes = await fetch("/api/voice", { method: "POST" });
			if (!tokenRes.ok) {
				const err = await tokenRes.json();
				throw new Error(
					err.detail || err.error || "Failed to create voice session",
				);
			}
			const session = await tokenRes.json();
			// GA client_secrets returns the ephemeral key at `.value`.
			const token = session.value ?? session.client_secret?.value;
			if (!token) throw new Error("No session token received");

			// Discover the WebMCP tools registered on the page so the voice model
			// can call them.
			const ctx = document.modelContext as ExecutableModelContext | undefined;
			toolsRef.current = ctx ? await ctx.getTools() : [];

			const ws = new WebSocket(
				"wss://api.openai.com/v1/realtime?model=gpt-realtime",
				["realtime", `openai-insecure-api-key.${token}`],
			);
			wsRef.current = ws;

			ws.onopen = () => {
				setState((s) => ({ ...s, isConnected: true }));
				// Register the WebMCP tools with the realtime session so the model
				// can search, browse, and order by voice.
				if (toolsRef.current.length > 0) {
					ws.send(
						JSON.stringify({
							type: "session.update",
							session: {
								type: "realtime",
								tools: toolsRef.current.map((t) => ({
									type: "function",
									name: t.name,
									description: t.description,
									parameters: t.inputSchema ?? {
										type: "object",
										properties: {},
									},
								})),
								tool_choice: "auto",
							},
						}),
					);
				}
				startAudioCapture();
			};
			ws.onmessage = (event) => {
				handleServerEvent(JSON.parse(event.data));
			};
			ws.onerror = () => {
				setError("Voice connection error");
				setState((s) => ({ ...s, isConnected: false }));
			};
			ws.onclose = () => {
				setState((s) => ({
					...s,
					isConnected: false,
					isListening: false,
					isSpeaking: false,
				}));
				stopAudioCapture();
			};
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to connect voice");
		}
	}, [handleServerEvent, startAudioCapture, stopAudioCapture]);

	const disconnect = useCallback(() => {
		wsRef.current?.close();
		wsRef.current = null;
		stopAudioCapture();
		setState({
			isConnected: false,
			isListening: false,
			isSpeaking: false,
			transcript: "",
		});
	}, [stopAudioCapture]);

	const sendTextMessage = useCallback((text: string) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
		wsRef.current.send(
			JSON.stringify({
				type: "conversation.item.create",
				item: {
					type: "message",
					role: "user",
					content: [{ type: "input_text", text }],
				},
			}),
		);
		wsRef.current.send(JSON.stringify({ type: "response.create" }));
		setMessages((prev) => [...prev, { role: "user", content: text }]);
	}, []);

	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	return {
		state,
		messages,
		error,
		activeTool,
		connect,
		disconnect,
		sendTextMessage,
	};
}
