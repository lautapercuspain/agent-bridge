#!/usr/bin/env node
// Local demo harness for the Uber Eats merchant order pipeline.
//
// Uber has no consumer-ordering API: discovery, cart, and checkout all happen
// on Uber's surface, and a merchant integration only begins AFTER checkout,
// when Uber sends an `orders.notification` webhook. This script sends a
// representative sandbox notification to the local webhook (with ?mode=simulate)
// so the receive -> auto-accept -> feed pipeline can be demonstrated without a
// manually-placed sandbox order. Events are labeled source: "simulated".
//
// Usage:
//   node scripts/simulate-uber-order.mjs [baseUrl]
//   BASE_URL=http://127.0.0.1:3000 node scripts/simulate-uber-order.mjs

import { randomUUID } from "node:crypto";

const baseUrl = (
	process.argv[2] ??
	process.env.BASE_URL ??
	"http://127.0.0.1:3000"
).replace(/\/$/, "");

const orderId = `sandbox-order-${Date.now()}`;
const resourceHref = `https://test-api.uber.com/v2/eats/order/${orderId}`;

const payload = {
	event_id: randomUUID(),
	event_time: Date.now(),
	event_type: "orders.notification",
	meta: {
		resource_id: orderId,
		status: "pos",
		resource_href: resourceHref,
	},
	resource_href: resourceHref,
};

async function main() {
	console.log(`Target: ${baseUrl}`);
	console.log(`Simulating Uber order webhook for ${orderId}...\n`);

	const webhookRes = await fetch(
		`${baseUrl}/api/uber-eats/webhooks/orders?mode=simulate`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		},
	);

	if (!webhookRes.ok) {
		console.error(`Webhook responded HTTP ${webhookRes.status}`);
		console.error(await webhookRes.text());
		process.exitCode = 1;
		return;
	}

	const webhookBody = await webhookRes.json();
	console.log("Webhook response:");
	console.log(JSON.stringify(webhookBody, null, 2));

	const feedRes = await fetch(`${baseUrl}/api/uber-eats/orders`);
	const feed = await feedRes.json();
	console.log("\nRecent order feed:");
	console.log(JSON.stringify(feed, null, 2));
}

main().catch((error) => {
	console.error(
		`\nCould not reach ${baseUrl}. Is the dev server running? (npm run dev)`,
	);
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
