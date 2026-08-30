# AgentBridge — Devpost Description

> Paste-ready copy for the Devpost submission. The **elevator pitch** is the tagline;
> everything under **Project Description** goes into the main description field.

---

## Elevator pitch (one line)

Commerce built for agents, not scrapers — a website that publishes its shopping actions as WebMCP tools, so any browser agent can find, compare, and shortlist real food, then hand you off to your own delivery app to finish the order.

---

## Project Description

### The problem

Online shopping was built for human eyes and human clicks. When an AI agent shops for you today, it has to *pretend to be a person* — driving a headless browser, guessing at selectors, and reading prices off pixels. It's slow, it breaks on every redesign, and it gives the agent no reliable notion of what a "restaurant," a "menu item," or a "checkout" actually is.

Shopping isn't really a sequence of clicks. It's a sequence of **intentions**: *search*, *filter to my diet and budget*, *compare*, *shortlist*, *check out*. Those intentions are exactly what a website knows how to do — and exactly what today's agents can't see.

### What AgentBridge does

AgentBridge is an agent-native commerce site for food ordering. Instead of hiding its capabilities behind a UI that agents have to scrape, the page **publishes them as WebMCP tools** on `document.modelContext`. Nine typed, self-describing tools cover the whole shopping arc:

`search-restaurants` · `get-restaurant-menu` · `filter-menu-items` · `compare-options` · `add-to-cart` · `remove-from-cart` · `get-cart-summary` · `get-delivery-options` · `checkout-on-platform`

Any WebMCP-capable agent that opens the page — ChatGPT's in-app browser, Chrome with WebMCP, or the text/voice agent we ship in the page itself — can call those tools directly. You say *"healthy lunch under $20, delivered"* and the agent searches **real** nearby restaurants (Yelp Fusion), filters to your constraints, compares options, and assembles a shortlist — while the page you're looking at updates live with every tool call.

Because no delivery marketplace exposes a public *consumer* ordering API, AgentBridge is honest about the last step: it doesn't fake an order or invent a delivery ETA. When you approve, `checkout-on-platform` hands you off to the right app for your country — Uber Eats, Rappi, PedidosYa, or DiDi Food — where you confirm live pricing and pay. The agent does the legwork; you make the call; your delivery app does what only it can do.

### Why WebMCP is the right fit

This isn't "we added a chatbot." WebMCP is load-bearing:

- **Commerce is semantic, so expose semantics — not a DOM.** Every step of ordering is already a structured action with structured inputs. WebMCP lets the site hand the agent those actions as typed tools, so there's zero scraping and nothing to break when we restyle the page. Redesign the UI freely; the tool contract is stable.
- **The site keeps control of correctness and safety.** The tools own id resolution, sensible defaults, error recovery (they return *available alternatives* instead of hard failures), and — crucially — the human-approval boundary. The agent orchestrates; the website stays the source of truth. That's a safer division of labor than letting an agent free-click through a checkout.
- **People and agents share one screen.** The same Zustand-backed state the tools mutate is the state the UI renders. So as the agent works, *you watch it happen* — restaurants populate, a menu opens, a shortlist fills in — and you can steer or veto at any point. WebMCP turns "the agent did something on my behalf, somewhere" into "the agent and I are working on the same page, together."
- **It's honest about today's boundaries.** WebMCP handles discovery, comparison, and decision — the parts the web *can* safely expose — and stops at the human-in-the-loop handoff to a real payment surface. That makes AgentBridge a realistic, shippable pattern for agentic commerce right now, not a demo that only works in a sandbox.

### What people and agents can now do together

- Describe a craving once, in **text or voice**, instead of tapping through an app.
- Watch the agent search real restaurants near you and narrow to your diet, budget, and cuisine — with the UI updating in real time so you're never guessing what it's doing.
- Compare options side by side and build a shortlist by conversation.
- Give one final yes, and get dropped into the correct delivery app for your country to pay and track — no fake orders, no surprises.

### How we built it

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4.
- **WebMCP** via `@mcp-b/webmcp-polyfill`, initialized in a `WebMCPProvider`. Tools are registered on `document.modelContext` with JSON-Schema inputs and annotations, and unregistered via `AbortController`.
- **Self-healing tools** in `src/lib/webmcp-tools.ts`: each `execute` reads fresh store state and resolves restaurants/items by id *or* name (exact, then fuzzy), returning actionable alternatives on a miss so the agent recovers on its own instead of dead-ending.
- **One agent, two front doors:** an in-page text agent loop (discovers tools with `getTools()`, forwards them to `/api/chat` with the AI SDK, and executes tool calls via `executeTool()`), plus a **voice** agent on the OpenAI Realtime API over WebRTC that calls the exact same WebMCP tools.
- **Real data:** Yelp Fusion for restaurants and geocoding with country detection; menus are clearly labeled **estimates** for planning, since Yelp has no menu API.
- **Real handoff:** country-aware deep links to Uber Eats / Rappi / PedidosYa / DiDi Food.

### What's next

The food vertical is the proof. The same WebMCP pattern — publish your semantic actions, let any agent orchestrate them, keep the human in the loop at the moment of commitment — extends to groceries, retail, travel, and services. AgentBridge is a template for making any store agent-ready without rebuilding it for every agent.

---

## Built with

`webmcp` · `@mcp-b/webmcp-polyfill` · `next.js` · `typescript` · `ai-sdk` · `openai` (chat + realtime voice) · `yelp-fusion` · `tailwindcss` · `zustand` · `react-query` · `vercel`

## Links

- **Live demo:** https://agentbridge-delta.vercel.app
- **Repository:** https://github.com/lautaro-kunaico/AgentBridge
</content>
</invoke>
