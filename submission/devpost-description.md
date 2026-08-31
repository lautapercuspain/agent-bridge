# AgentBridge — Devpost Description

> Paste-ready copy. The **elevator pitch** is the tagline; everything under
> **Project Description** goes into the main description field.

---

## Elevator pitch (one line)

A food-delivery marketplace built for AI agents — an agent can search, build a cart, and **complete checkout** for you by calling the site's WebMCP tools, while you watch it happen and give the final yes.

---

## Project Description

### The problem

When an AI agent shops for you today, it has to *pretend to be a person*: driving a headless browser, guessing at selectors, and reading prices off pixels. It's slow, it breaks on every redesign, and the agent has no reliable notion of what a "restaurant," a "cart," or a "checkout" actually is.

Shopping isn't really a sequence of clicks. It's a sequence of **intentions** — *search*, *filter to my budget*, *add to cart*, *check out*. Those are exactly what a website knows how to do, and exactly what today's agents can't see.

### What AgentBridge does

AgentBridge is a food-delivery marketplace — like the apps you know — except it was **built for agents**. Instead of hiding its capabilities behind a UI that agents have to scrape, the page **publishes them as WebMCP tools** on `navigator.modelContext`. Eleven typed tools cover the entire journey:

`list-categories` · `search-restaurants` · `get-restaurant-menu` · `filter-menu-items` · `add-to-cart` · `remove-from-cart` · `update-cart-item` · `get-cart` · `start-checkout` · **`place-order`** · `get-order-status`

Any WebMCP-capable agent that opens the page — ChatGPT's in-app browser, Chrome with WebMCP, or the assistant we ship in the page — can call those tools directly. You say *"order me two double smash burgers and check out,"* and the agent searches AgentBridge's restaurants, opens the best match, adds the items, and **completes checkout** — producing a real order with a live status tracker (confirmed → preparing → on the way → delivered). The whole time, the storefront you're looking at updates live with every tool call, and you approve the order before it's placed.

Because AgentBridge is its **own** marketplace, the agent can finish the job — there's no third-party app to bounce to and no screen to scrape. This is what commerce looks like when a store is natively built for agents.

### Why WebMCP is the right fit

This isn't "we added a chatbot." WebMCP is load-bearing:

- **Commerce is semantic, so expose semantics — not a DOM.** Every step of ordering is a structured action with structured inputs. WebMCP lets the site hand the agent those actions as typed tools, so there's zero scraping and nothing to break when we restyle the page. Redesign the UI freely; the tool contract is stable.
- **The site keeps control of correctness and safety.** The tools own id resolution, sensible defaults, self-healing error recovery (they return *available alternatives* instead of hard failures), price math, and the human-approval boundary at checkout. The agent orchestrates; the website stays the source of truth. That's a far safer division of labor than letting an agent free-click through a payment form.
- **People and agents share one screen.** The same state the tools mutate is the state the UI renders — so as the agent works, *you watch it happen* and can steer or veto at any point. WebMCP turns "the agent did something somewhere on my behalf" into "the agent and I are working on the same page, together."
- **The full loop, not half of it.** Because AgentBridge is the marketplace, WebMCP carries the agent all the way through checkout and order tracking — the complete task — with the human confirming at the moment that matters.

### What people and agents can now do together

- Describe a craving once, in **text or voice** — then watch the agent find it, filter to your budget and diet, and build the cart, with the UI updating in real time.
- Give one approval and get a real, tracked order — no clicking through menus, no scraping, no brittle automation.
- Step in anytime: change an item, adjust quantity, or take over — the agent and the storefront are always in sync.

### How we built it

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4, deployed on Vercel.
- **WebMCP** via `@mcp-b/webmcp-polyfill`. We register 11 tools on `navigator.modelContext` and **defer to a native WebMCP implementation** when the browser provides one, so external agents and our in-page agent share the same tools.
- **Self-healing tools** (`src/lib/webmcp-tools.ts`): each `execute` reads fresh store state and resolves restaurants/items by id *or* name, returning actionable alternatives on a miss so the agent recovers on its own.
- **First-party catalog** (`src/lib/catalog.ts`): 12 categories, 16 restaurants, and per-cuisine menus — deterministic data we control, so the demo is reliable and the agent can complete a real checkout.
- **One agent, two front doors:** an in-page text agent loop (AI SDK + OpenAI) and a **voice** agent (OpenAI Realtime over WebRTC) that call the exact same WebMCP tools. Checkout and order tracking are simulated first-party — no real payment.

### What's next

Food is the proof. The same pattern — publish your semantic actions, let any agent orchestrate them, keep the human in the loop at checkout — extends to groceries, retail, travel, and services. AgentBridge is a template for making any store agent-ready.

---

## Built with

`webmcp` · `@mcp-b/webmcp-polyfill` · `next.js` · `typescript` · `ai-sdk` · `openai` (chat + realtime voice) · `tailwindcss` · `zustand` · `react-query` · `vercel`

## Links

- **Live demo:** https://agentbridge-delta.vercel.app
- **Repository:** https://github.com/lautapercuspain/agent-bridge
</content>
