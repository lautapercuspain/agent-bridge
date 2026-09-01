# AgentBridge

**Making online commerce ready for AI agents.**

AgentBridge is an agent-native commerce platform that lets AI agents shop on your behalf — no screen scraping, no brittle browser automation, just natural conversation.

## The Problem

Online shopping was designed for humans. When AI agents try to shop for you today, they rely on fragile workarounds: automating clicks, reading pixels off a screen, and breaking every time a website changes its layout. It's slow, unreliable, and not how agent-powered commerce should work.

## How AgentBridge Works

Instead of forcing AI agents to pretend to be humans on websites, AgentBridge gives them a structured layer of semantic actions — things like *search restaurants*, *compare prices*, *add to cart*, and *place order*. Agents understand these actions natively, so the entire shopping experience becomes a simple conversation.

Here's what it looks like in practice:

1. **You say what you want** — "Get me a healthy lunch under $20, delivered."
2. **The agent discovers options** — It searches nearby restaurants, filters by your preferences, and compares choices.
3. **You approve** — The agent presents its recommendation. You say yes, and the order is placed.

No apps to open. No menus to scroll through. No friction.

## What Makes It Different

- **Voice-first interaction** — Talk to the agent like you'd talk to a friend. It understands context, preferences, and budget.
- **Structured commerce layer** — Agents interact through clean, reliable capabilities (powered by [WebMCP](https://webmcp.org)) instead of scraping websites.
- **Human in the loop** — The agent handles the legwork, but you always make the final call before anything is purchased.
- **Real restaurant data** — AgentBridge connects to real restaurant listings to find what's actually available near you.

## The Vision

We started with food ordering, but the concept applies everywhere: groceries, retail, travel, services. AgentBridge is infrastructure for a future where humans describe what they want and AI agents handle the rest — reliably, across any store and any category.

## Built With

AgentBridge is built on [WebMCP](https://webmcp.org), an emerging standard that makes the web agent-friendly by giving AI models structured access to website capabilities.

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

*Built for the WebMCP Hackathon.*
