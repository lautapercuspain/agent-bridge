import { NextResponse } from "next/server";
import {
	processOrderNotification,
	type UberWebhookEvent,
} from "@/lib/uber-eats";

export async function POST(request: Request) {
	// Real Uber webhooks never carry `?mode=simulate`; the local demo harness
	// sets it to exercise the pipeline without a live order. Disabled in prod.
	const simulated =
		new URL(request.url).searchParams.get("mode") === "simulate" &&
		process.env.UBER_EATS_ENVIRONMENT !== "production";

	let event: UberWebhookEvent;
	try {
		event = (await request.json()) as UberWebhookEvent;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	// Always ack 200 so Uber does not retry, even if accepting failed.
	try {
		const processed = await processOrderNotification(event, {
			request,
			simulated,
		});
		console.log(
			"Uber Eats order webhook:",
			JSON.stringify({
				eventType: processed.eventType,
				orderId: processed.orderId,
				status: processed.status,
				source: processed.source,
			}),
		);
		return NextResponse.json({ ok: true, processed });
	} catch (error) {
		console.error("Uber Eats webhook error:", error);
		return NextResponse.json({
			ok: true,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
