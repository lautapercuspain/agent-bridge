# AgentBridge — Demo Video Script

**Target length:** 2–3 minutes
**Format:** Screen recording + voiceover (optionally face cam in corner)

---

## INTRO (0:00–0:15)

**[SCREEN: Cover graphic or hero shot of AgentBridge]**

**VOICEOVER:**
> "Online shopping was designed for humans. But what happens when an AI agent needs to shop for you? Today, agents rely on brittle browser automation and visual scraping. We built something better."

---

## THE PROBLEM (0:15–0:35)

**[SCREEN: Split-screen. Left: an agent struggling with a delivery app — clicking, scrolling, selectors breaking. Right: a simple chat bubble saying "Hey Agent, get me lunch."]**

**VOICEOVER:**
> "Imagine you want to order lunch. Normally, you'd open an app, scroll through restaurants, compare prices, customize your order, and check out. That's fine for a human — but for an AI agent, every click is a fragile automation step that can break at any time."

---

## INTRODUCING AGENTBRIDGE (0:35–0:55)

**[SCREEN: AgentBridge logo + architecture diagram fading in]**

**VOICEOVER:**
> "AgentBridge is an agent-native commerce site. Instead of forcing agents to pretend to be humans, the page publishes its shopping actions as WebMCP tools — search restaurants, filter by diet and budget, compare options, build a shortlist, check out. Any WebMCP agent that opens the page can call them directly."

---

## LIVE DEMO (0:55–2:05)

**[SCREEN: The live app at agentbridge-delta.vercel.app. Show the registered WebMCP tools (tool panel / activity indicator), then start the voice or text agent.]**

### Part 1 — The Request (0:55–1:10)

**USER (speaking or typing):**
> "Get me a healthy lunch under twenty dollars, delivered."

**AGENT (conversational, concise):**
> "On it — finding healthy spots near you under twenty dollars."

### Part 2 — The agent calls WebMCP tools (1:10–1:40)

**[SCREEN: Highlight tool activity as it happens — `search-restaurants`, then `get-restaurant-menu`, then `filter-menu-items` and `compare-options`. As each tool runs, the UI updates live: real restaurants populate, a menu opens, a shortlist fills in.]**

**VOICEOVER:**
> "Everything you're seeing is driven by WebMCP. The agent isn't scraping the screen — it's calling the site's own tools: search-restaurants, get-restaurant-menu, filter, compare. Because the tools and the UI share the same state, I can watch it work and step in anytime. The restaurants are real, from Yelp; the prices are clearly labeled estimates for planning."

**AGENT presents options:**
> "The Aloha Poke Bowl is the best fit — strong reviews and in budget. I've added it to your shortlist."

### Part 3 — Human approval and an honest handoff (1:40–2:05)

**USER:**
> "Perfect, let's order it."

**AGENT:**
> "Great — I'll hand you to your delivery app to confirm the live price and pay."

**[SCREEN: `checkout-on-platform` fires; the shortlist opens with "Order on Uber Eats / Rappi / PedidosYa" buttons for the user's country; clicking one deep-links into the real delivery app.]**

**VOICEOVER:**
> "Here's the honest part. No delivery marketplace exposes a public consumer ordering API — so AgentBridge doesn't fake an order or invent an ETA. WebMCP handles discovery and the decision; you complete payment in your own app, where prices and availability are real."

### Recap (2:05–2:15)

**[SCREEN: Quick diagram — You → Agent → WebMCP tools on the page → your delivery app.]**

**VOICEOVER:**
> "One conversation. The agent understood intent, called the site's WebMCP tools to discover and compare real options, and handed off for your final approval. No brittle automation. No apps to dig through. No friction."

---

## WHY IT MATTERS (2:10–2:30)

**[SCREEN: "Why WebMCP Matters" slide]**

**VOICEOVER:**
> "This is why WebMCP matters. Commerce is a set of semantic actions, not a screen to scrape. When a site publishes those actions as tools, agents interact reliably — nothing breaks when the page is restyled — the site keeps control of correctness and safety, and the human stays in the loop at the moment that counts. It's a commerce layer built for agents and people at the same time."

---

## CLOSING (2:30–2:50)

**[SCREEN: Vision slide with roadmap — food, groceries, retail, travel, services]**

**VOICEOVER:**
> "We started with food ordering, but our vision is broader. AgentBridge is infrastructure for agent-native commerce — any category, any store. Humans describe what they want. AI agents handle the rest."

**[SCREEN: Logo + team name + "Built for WebMCP Hackathon"]**

**VOICEOVER:**
> "This is AgentBridge. Making online commerce ready for AI agents."

---

## PRODUCTION NOTES

- **Music:** Low-key ambient/electronic. Something modern and clean — not dramatic.
- **Transitions:** Simple cuts or cross-fades. Avoid flashy motion graphics.
- **Key moments to emphasize:** The simplicity of the voice interaction, the MCP layer calls (show them on screen briefly), and the human approval step.
- **Suggested tools:** OBS or Screen Studio for recording, Descript or CapCut for editing.
- **Thumbnail:** Use the cover graphic (01-cover.svg exported to PNG).
- **Live URL to show on camera:** https://agentbridge-delta.vercel.app — open it fresh, show the WebMCP tools registered, then run the flow end to end.
- **Accuracy on camera:** say that menu prices are estimates for planning and that the real order is completed in the user's delivery app. Judges reward honesty about the handoff.
- **Eligibility (do not skip):** upload to YouTube as **Public** (not Unlisted/Private), keep it **under 3:00**, and ensure it has **audio narration** about the project. An AI voiceover of this script is allowed.
