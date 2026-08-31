# AgentBridge — Demo Video Script

**Target length:** under 3:00
**Format:** Screen recording of the live app + voiceover (AI voiceover of this script is fine)
**Live URL:** https://agentbridge-delta.vercel.app

> The hero moment: an AI agent completes a **whole food order — including checkout —**
> on AgentBridge, by calling the site's WebMCP tools. No scraping, no handoff.

---

## INTRO (0:00–0:15)

**[SCREEN: The AgentBridge storefront — restaurants, categories, the assistant dock with the "WebMCP" badge.]**

**VOICEOVER:**
> "This looks like a normal food-delivery app. But it was built for AI agents. Watch an agent order lunch for me — start to finish — without touching the screen."

---

## THE PROBLEM (0:15–0:35)

**[SCREEN: Split — left: an agent fighting a normal website, clicking, selectors breaking. Right: a single chat message "order me lunch".]**

**VOICEOVER:**
> "Today, when an AI agent shops for you, it has to pretend to be a person — driving a browser, guessing at buttons, reading prices off pixels. It's slow and it breaks constantly. Shopping isn't really clicks. It's intentions: search, compare, add to cart, check out."

---

## THE IDEA — WEBMCP (0:35–0:55)

**[SCREEN: Highlight the assistant dock's "WebMCP" badge; show a small overlay listing the tool names.]**

**VOICEOVER:**
> "AgentBridge publishes those intentions as WebMCP tools — right on the page. Eleven of them: search restaurants, open a menu, add to cart, start checkout, place the order, track it. Any WebMCP-capable agent that opens the page can call them directly."

---

## LIVE DEMO (0:55–2:05)

**[SCREEN: A WebMCP browser (ChatGPT's in-app browser, or Chrome with the WebMCP/MCP-B extension) on the live URL. If demoing the built-in agent instead, use the assistant dock — it calls the exact same tools.]**

### The request (0:55–1:10)

**USER (typed or spoken to the agent):**
> "Order me two double smash burgers and check out."

**AGENT (in the dock, concise):**
> "On it — finding a great burger spot."

### The agent works (1:10–1:45)

**[SCREEN: Narrate the tool calls as the storefront updates LIVE — restaurants filter to burgers (search-restaurants), Char & Cheese opens (get-restaurant-menu), two Double Smash Burgers land in the cart (add-to-cart), the checkout screen appears (start-checkout).]**

**VOICEOVER:**
> "Everything you're seeing is the agent calling AgentBridge's WebMCP tools. It's not scraping — it's driving the site's real capabilities. And because the tools and the UI share one state, I'm watching it happen and I can step in at any point."

### Human approval + checkout (1:45–2:05)

**[SCREEN: The order confirmation appears — order number, ETA, courier — and the live status tracker starts: Confirmed → Preparing → On the way → Delivered.]**

**AGENT:**
> "Your order's in — two Double Smash Burgers from Char & Cheese, about twenty minutes out."

**VOICEOVER:**
> "That's the whole thing. The agent searched, chose, built the cart, and completed checkout — on AgentBridge itself. I just said what I wanted and gave the go-ahead."

---

## WHY IT MATTERS (2:05–2:35)

**[SCREEN: "Why WebMCP" slide — three short lines.]**

**VOICEOVER:**
> "This is why WebMCP matters. Commerce is a set of semantic actions, not a screen to scrape — so the site hands agents typed tools that never break when we restyle the page. The site keeps control of correctness and the human stays in the loop at the moment of purchase. And the agent and I work on the same screen, together. It's a store that's natively ready for agents."

---

## CLOSE (2:35–2:50)

**[SCREEN: Logo + tagline + "Built on WebMCP".]**

**VOICEOVER:**
> "We started with food. The same pattern works for groceries, retail, travel — any store. This is AgentBridge: commerce built for agents and people at the same time."

---

## PRODUCTION NOTES

- **Recording env (pick one):**
  - **Chrome + WebMCP/MCP-B extension** (recommended, most reliable): install the extension, open the live URL, use the extension's agent to run the prompt. This proves an *external* agent driving our tools.
  - **ChatGPT in-app browser** if it exposes WebMCP.
  - **Built-in assistant dock** as a fallback — it calls the exact same registered WebMCP tools, so the flow is identical on camera.
- **Show the tools are real:** briefly open dev console and run `await navigator.modelContext.getTools()` to reveal the 11 tools. Great B-roll for judges.
- **Say what's simulated:** checkout and delivery tracking are simulated first-party (this is a demo marketplace) — no real payment. Judges reward honesty.
- **Eligibility (do not skip):** upload to YouTube as **Public** (not Unlisted/Private), keep it **under 3:00**, with **audio narration**. AI voiceover of this script is allowed.
- **Tools:** Screen Studio or OBS to record; Descript or CapCut to edit. Keep cuts simple.
</content>
