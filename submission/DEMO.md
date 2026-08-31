# AgentBridge — Live Demo Runbook (WebMCP)

How to run the demo where an **external AI agent drives AgentBridge through WebMCP**.

**Live URL:** https://agentbridge-delta.vercel.app

AgentBridge registers 11 tools on `navigator.modelContext`. Any WebMCP-capable
agent can discover and call them. Pick one of the environments below.

---

## Before you start

- Open the live URL in a **fresh / incognito** window (proves it works on any machine).
- Confirm the tools are exposed. Open DevTools → Console and run:
  ```js
  await navigator.modelContext.getTools()   // → array of 11 tools
  ```
  You should see: `list-categories, search-restaurants, get-restaurant-menu,
  filter-menu-items, add-to-cart, remove-from-cart, update-cart-item, get-cart,
  start-checkout, place-order, get-order-status`.

---

## Option A — Chrome + WebMCP / MCP-B extension (recommended)

The most reliable way to show an **external** agent calling our tools.

1. In Chrome, install the WebMCP / MCP-B extension (search the Chrome Web Store
   for "MCP-B" / "WebMCP"; it pairs with the `@mcp-b/webmcp-polyfill` this app uses).
2. Open the live URL. The extension should detect the page's tools.
3. Open the extension's agent/chat and give it the prompt (below).
4. Watch the AgentBridge storefront update live as the agent calls each tool.

## Option B — ChatGPT in-app browser

1. Open the live URL inside ChatGPT's in-app browser.
2. Ask the agent to order food (prompt below). It calls the page's WebMCP tools.

## Option C — Built-in assistant (fallback, always works)

If a WebMCP browser isn't available, use the **assistant dock** on the right of
the page (top-right on mobile). It calls the **exact same** registered tools, so
the on-screen flow is identical — ideal for a clean recording.

---

## The prompts

**Primary (full autonomous checkout):**
> "Order me two double smash burgers and check out."

Expected: the agent runs `search-restaurants` (burgers) → `get-restaurant-menu`
(Char & Cheese) → `add-to-cart` ×2 → `start-checkout` → `place-order`. The
storefront navigates through each step and ends on the **order tracker**
(Confirmed → Preparing → On the way → Delivered) with an order number and ETA.

**Alternates:**
> "Find me a healthy lunch under $15 and add your top pick to the cart."
> "I'm craving spicy ramen — open the best-rated ramen place."
> "What's in my cart, and what's the total?"

---

## What to point out on camera

- The **WebMCP** badge on the assistant, and the 11 tools from the console.
- The UI updating **live** from the agent's tool calls (agent + human share one state).
- The **human approval** before `place-order`.
- The completed order + live tracker — the agent finished the *whole* task, checkout included.

---

## Honesty note (say this)

AgentBridge is a first-party demo marketplace. Restaurants, menus, and prices are
our own data; **checkout and delivery tracking are simulated — no real payment is
taken.** The point is the WebMCP interaction model, end to end.

---

## Reset between takes

Reload the page — the cart, order, and view reset to the storefront. (State is
in-memory; a refresh gives you a clean slate.)

## Troubleshooting

- **Agent can't see tools:** confirm `await navigator.modelContext.getTools()`
  returns 11 in that browser. If empty, the WebMCP browser/extension isn't
  injecting — use Option C to record.
- **Grid looks empty for a beat on load:** the storefront seeds on mount; it
  populates immediately. Give it a moment or reload.
</content>
