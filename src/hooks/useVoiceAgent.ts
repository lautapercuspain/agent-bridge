"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceState } from "@/types";

type ExecutableModelContext = {
	getTools: NonNullable<typeof document.modelContext>["getTools"];
	executeTool?: (
		tool: WebMCP.RegisteredTool,
		inputArguments: string,
	) => Promise<string | null>;
};

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

	const pcRef = useRef<RTCPeerConnection | null>(null);
	const dcRef = useRef<RTCDataChannel | null>(null);
	const audioElRef = useRef<HTMLAudioElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const toolsRef = useRef<WebMCP.RegisteredTool[]>([]);

	const sendEvent = useCallback((event: Record<string, unknown>) => {
		const dc = dcRef.current;
		if (dc?.readyState === "open") {
			dc.send(JSON.stringify(event));
		}
	}, []);

	const createAudioResponse = useCallback(
		(instructions?: string) => {
			sendEvent({
				type: "response.create",
				response: {
					output_modalities: ["audio"],
					...(instructions ? { instructions } : {}),
				},
			});
		},
		[sendEvent],
	);

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

			sendEvent({
				type: "conversation.item.create",
				item: { type: "function_call_output", call_id: callId, output },
			});
			createAudioResponse();
		},
		[createAudioResponse, sendEvent],
	);

	const handleServerEvent = useCallback(
		(event: Record<string, unknown>) => {
			switch (event.type) {
				case "response.output_audio_transcript.delta":
					setState((s) => ({
						...s,
						isSpeaking: true,
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
				case "response.done":
					setState((s) => ({ ...s, isSpeaking: false }));
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
		[executeToolCall],
	);

	// Stable ref so the data channel callback always calls the latest handler.
	const handleServerEventRef = useRef(handleServerEvent);
	useEffect(() => {
		handleServerEventRef.current = handleServerEvent;
	}, [handleServerEvent]);

	const cleanup = useCallback(() => {
		dcRef.current?.close();
		dcRef.current = null;
		pcRef.current?.close();
		pcRef.current = null;
		for (const track of streamRef.current?.getTracks() ?? []) {
			track.stop();
		}
		streamRef.current = null;
		if (audioElRef.current) {
			audioElRef.current.srcObject = null;
			audioElRef.current.remove();
			audioElRef.current = null;
		}
	}, []);

	const connect = useCallback(async () => {
		try {
			setError(null);

			const ctx = document.modelContext as ExecutableModelContext | undefined;
			toolsRef.current = ctx ? await ctx.getTools() : [];

			const pc = new RTCPeerConnection();
			pcRef.current = pc;

			// Appended to DOM so browsers allow autoplay.
			const audio = document.createElement("audio");
			audio.autoplay = true;
			audio.style.display = "none";
			document.body.appendChild(audio);
			audioElRef.current = audio;
			pc.ontrack = (e) => {
				audio.srcObject = e.streams[0];
				audio.play().catch((err) => {
					console.warn("Voice audio autoplay failed:", err);
				});
			};

			// Capture mic and send to the peer connection.
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
				},
			});
			streamRef.current = stream;
			pc.addTrack(stream.getTracks()[0]);

			// Data channel for Realtime API events.
			const dc = pc.createDataChannel("oai-events");
			dcRef.current = dc;

			dc.onopen = () => {
				setState((s) => ({ ...s, isConnected: true }));
				if (toolsRef.current.length > 0) {
					dc.send(
						JSON.stringify({
							type: "session.update",
							session: {
								type: "realtime",
								output_modalities: ["audio"],
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
				createAudioResponse(
					"Greet the user warmly and briefly. Tell them you can help them find food and place an order. Keep it to one or two short sentences.",
				);
			};

			dc.onmessage = (e) => {
				handleServerEventRef.current(JSON.parse(e.data));
			};

			dc.onclose = () => {
				setState({
					isConnected: false,
					isListening: false,
					isSpeaking: false,
					transcript: "",
				});
			};

			pc.oniceconnectionstatechange = () => {
				if (
					pc.iceConnectionState === "failed" ||
					pc.iceConnectionState === "disconnected"
				) {
					setError("Voice connection lost");
					cleanup();
					setState({
						isConnected: false,
						isListening: false,
						isSpeaking: false,
						transcript: "",
					});
				}
			};

			// SDP offer/answer exchange via our server proxy.
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			const sdpRes = await fetch("/api/voice", {
				method: "POST",
				body: offer.sdp,
				headers: { "Content-Type": "application/sdp" },
			});

			if (!sdpRes.ok) {
				let detail = "Failed to create voice session";
				try {
					const err = await sdpRes.json();
					detail = err.detail || err.error || detail;
				} catch {
					// response wasn't JSON
				}
				throw new Error(detail);
			}

			const answerSdp = await sdpRes.text();
			await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
		} catch (err) {
			cleanup();
			setError(err instanceof Error ? err.message : "Failed to connect voice");
		}
	}, [cleanup, createAudioResponse]);

	const disconnect = useCallback(() => {
		cleanup();
		setState({
			isConnected: false,
			isListening: false,
			isSpeaking: false,
			transcript: "",
		});
	}, [cleanup]);

	const sendTextMessage = useCallback(
		(text: string) => {
			sendEvent({
				type: "conversation.item.create",
				item: {
					type: "message",
					role: "user",
					content: [{ type: "input_text", text }],
				},
			});
			createAudioResponse();
			setMessages((prev) => [...prev, { role: "user", content: text }]);
		},
		[createAudioResponse, sendEvent],
	);

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, [cleanup]);

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
