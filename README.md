# AgentBridge

**Making online commerce ready for AI agents.**

AgentBridge is an agent-native commerce platform that lets AI agents shop on your behalf — no screen scraping, no brittle browser automation, just natural conversation.

AgentBridge was created specifically for the [OpenAI WebMCP Challenge](https://openai.com/es-419/webmcp-challenge/). It demonstrates how a website can expose meaningful commerce capabilities directly to AI agents while keeping the complete experience visible and controllable for the user.

## The Problem

Online shopping was designed for humans. When AI agents try to shop for you today, they rely on fragile workarounds: automating clicks, reading pixels off a screen, and breaking every time a website changes its layout. It's slow, unreliable, and not how agent-powered commerce should work.

## How AgentBridge Works

Instead of forcing AI agents to pretend to be humans on websites, AgentBridge gives them a structured layer of semantic actions — things like *search restaurants*, *compare prices*, *add to cart*, and *place order*. Agents understand these actions natively, so the entire shopping experience becomes a simple conversation.

Here's what it looks like in practice:

1. **You say what you want** — "Find me a spicy dinner under $12."
2. **The agent understands the intent** — It separates the request into meal type, flavor, dietary preferences, and budget instead of relying on a literal keyword match.
3. **The agent discovers options** — It searches dishes across every open restaurant, ranks the strongest matches, and can build the cart for you.
4. **You approve** — The complete order and price breakdown remain visible before checkout or purchase.

No apps to open. No menus to scroll through. No friction.

## What Makes It Different

- **Voice-first interaction** — Talk to the agent like you'd talk to a friend. It understands context, preferences, and budget.
- **Structured commerce layer** — Agents interact through clean, reliable capabilities (powered by [WebMCP](https://webmcp.org)) instead of scraping websites.
- **Intent-aware meal discovery** — Requests such as "healthy lunch under $15" or "spicy dinner under $12" become structured constraints. AgentBridge searches across restaurants using meal type, price, dietary tags, and intent facets, then ranks products by relevance, popularity, restaurant quality, and price.
- **More than restaurant search** — The agent can discover individual dishes globally, resolve products reliably by ID, manage options and quantities, inspect totals, create checkout links, place orders, and follow order status through 12 purpose-built WebMCP tools.
- **Human in the loop** — The agent handles the legwork, but you always make the final call before anything is purchased.
- **First-party marketplace data** — A deterministic catalog keeps restaurant, menu, product, image, cart, and checkout state consistent throughout the full demonstration.

## Intelligence You Can See

AgentBridge does not hide agent activity behind a chat transcript. The storefront responds alongside the conversation so users can understand what the system interpreted and what it changed:

- The search bar mirrors the agent's interpreted query, including constraints such as `spicy dinner under $12`.
- Intent chips expose the active meal type, keywords, dietary requirements, and budget.
- Cross-restaurant meal cards make ranked results, prices, ratings, tags, and availability easy to compare.
- Live WebMCP indicators show when a tool is running and whether it completed successfully.
- Agent-created checkout URLs restore the exact cart, selected options, quantities, delivery details, and meal thumbnails for human review.
- Resilient image fallbacks keep products recognizable even when a primary image source is unavailable.

This shared interface improves trust: the agent gets structured actions and machine-readable results, while the user gets immediate visual feedback, transparent constraints, and a clear approval point.

## The Vision

We started with food ordering, but the concept applies everywhere: groceries, retail, travel, services. AgentBridge is infrastructure for a future where humans describe what they want and AI agents handle the rest — reliably, across any store and any category.

## Built With

AgentBridge is built with Next.js, TypeScript, OpenAI models, and [WebMCP](https://webmcp.org), an emerging standard that makes the web agent-friendly by giving AI models structured access to website capabilities.

## Testing WebMCP

AgentBridge implements the W3C WebMCP browser API through `document.modelContext`. This is different from products named "Web MCP" that expose generic browser automation, scraping, screenshots, or clicking through a backend MCP server.

Start AgentBridge, then run the end-to-end WebMCP test in another terminal:

```bash
npm run dev
npm run test:webmcp
```

The test reproduces "Find me a burger for one person, with a total budget of up to USD $20." It discovers all registered tools, searches burger restaurants, selects an item, verifies the final total including fees and tax, requests a checkout URL, and confirms that a fresh browser page restores the order for human review.

To test a deployment instead of localhost:

```bash
npm run test:webmcp -- https://agentbridge-delta.vercel.app
```

This automated test validates the website's WebMCP implementation using the included polyfill. To validate native agent integration, use a current client listed in the WebMCP [implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md), open the deployed AgentBridge page in that client's browser context, and make the same request. ChatGPT Desktop is listed as supported; the standard chatgpt.com browser session is not listed separately.

---

*Created for the [OpenAI WebMCP Challenge](https://openai.com/es-419/webmcp-challenge/).*
