#!/usr/bin/env node

import { chromium } from "playwright";

const targetUrl =
	process.argv.find((argument) => argument.startsWith("http")) ??
	"http://localhost:3000";
const budget = 20;

function parseToolResult(value) {
	const result = typeof value === "string" ? JSON.parse(value) : value;
	const text = result?.content?.find((entry) => entry.type === "text")?.text;
	if (!text) throw new Error("Tool returned no text content");
	return JSON.parse(text);
}

async function main() {
	const browser = await chromium.launch({ headless: true });
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto(targetUrl, { waitUntil: "networkidle" });
		await page.waitForFunction(
			async () =>
				Boolean(document.modelContext) &&
				(await document.modelContext.getTools()).length >= 11,
			undefined,
			{ timeout: 20_000 },
		);

		const tools = await page.evaluate(async () => {
			const modelContext = document.modelContext;
			if (!modelContext) return [];
			return (await modelContext.getTools()).map((tool) => ({
				name: tool.name,
				title: tool.title,
				description: tool.description,
			}));
		});
		if (tools.length !== 11) {
			throw new Error(`Expected 11 WebMCP tools, found ${tools.length}`);
		}
		if (tools.some((tool) => !tool.title || !tool.description)) {
			throw new Error("Every WebMCP tool must expose a title and description");
		}
		console.log(`PASS discovered ${tools.length} titled WebMCP tools`);

		const execute = (name, input = {}) =>
			page.evaluate(
				async ({ toolName, toolInput }) => {
					const modelContext = document.modelContext;
					if (!modelContext) throw new Error("WebMCP is unavailable");
					const tool = (await modelContext.getTools()).find(
						(candidate) => candidate.name === toolName,
					);
					if (!tool) throw new Error(`Tool not found: ${toolName}`);
					return modelContext.executeTool(tool, JSON.stringify(toolInput));
				},
				{ toolName: name, toolInput: input },
			);

		const search = parseToolResult(
			await execute("search-restaurants", { category: "burgers" }),
		);
		const restaurant = search.restaurants.find(
			(candidate) => candidate.id === "char-and-cheese",
		);
		if (!restaurant) throw new Error("Burger restaurant was not returned");
		console.log(`PASS found ${restaurant.name}`);

		const menu = parseToolResult(
			await execute("get-restaurant-menu", {
				restaurantId: restaurant.id,
			}),
		);
		const burger = menu.items.find((item) => item.id === "char-and-cheese-0");
		if (!burger)
			throw new Error("Expected burger was not returned by the menu");
		console.log(`PASS selected ${burger.name} at $${burger.price.toFixed(2)}`);

		const cart = parseToolResult(
			await execute("add-to-cart", { itemId: burger.id, quantity: 1 }),
		);
		if (cart.totals.total > budget) {
			throw new Error(
				`Cart total $${cart.totals.total.toFixed(2)} exceeds $${budget.toFixed(2)}`,
			);
		}
		console.log(
			`PASS final total $${cart.totals.total.toFixed(2)} is within $${budget.toFixed(2)}`,
		);

		const checkout = parseToolResult(await execute("start-checkout"));
		if (!checkout.checkoutUrl?.startsWith(new URL(targetUrl).origin)) {
			throw new Error(
				"start-checkout did not return an absolute same-origin URL",
			);
		}
		console.log(`PASS received checkout URL ${checkout.checkoutUrl}`);

		const reviewContext = await browser.newContext();
		const reviewPage = await reviewContext.newPage();
		await reviewPage.goto(checkout.checkoutUrl, { waitUntil: "networkidle" });
		await reviewPage.getByRole("heading", { name: "Checkout" }).waitFor();
		await reviewPage.getByText(burger.name, { exact: true }).waitFor();
		await reviewPage
			.getByRole("button", {
				name: `Place order · $${cart.totals.total.toFixed(2)}`,
			})
			.waitFor();
		console.log(
			"PASS fresh browser page restored the checkout for human review",
		);
		await reviewContext.close();
		await context.close();
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(
		`FAIL ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exitCode = 1;
});
