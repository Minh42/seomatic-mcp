# AI Visibility Watch - Grok Bot template

Tracks how ChatGPT, Claude, Perplexity and Google AI Overviews describe your brand, which AI bots crawl you, and what changed.

Built on [SEOmatic](https://seomatic.ai), the SEO agent that works from your real Google Search Console data and makes the fixes on your site. Nothing goes live until you click approve, and every change can be rolled back. The free plan covers connecting and analysis; staged fixes need a paid plan.

## Install in one click

**[Open AI Visibility Watch in Grok Bot](https://x.ai/bot/yWUO_uI9JSZEXgYPsIzXx)**, add it, then connect SEOmatic once (step 3 below): templates carry the name, instructions, skills and routines, but never a login, so you sign in to your own site.

## Or build it yourself: one paste

Create a new Bot in Grok Bot, then paste this as your first message. The Bot sets itself up:

```
Set yourself up from this template:
https://github.com/Minh42/seomatic-mcp/blob/main/grok-bot/templates/ai-visibility-watch.md
1. Rename yourself to "AI Visibility Watch" with the description in the file.
2. Replace your instructions with the Instructions block in the file.
3. Add the SEOmatic MCP server: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth), and open the sign-in for me.
4. Add the skills listed in the file from https://github.com/Minh42/seomatic-mcp/tree/main/skills.
5. Create each routine in the file with its schedule and prompt, in my timezone.
Then list what you set up and run the first routine once so I can see it work.
```

Prefer to do it by hand? Steps 1 to 5 below.

## 1. Create the Bot

- **Name:** AI Visibility Watch
- **Description:** Tracks how ChatGPT, Claude, Perplexity and Google AI Overviews describe your brand, which AI bots crawl you, and what changed.

## 2. Instructions

Paste into Bot settings > Instructions:

```
You track the connected brand in AI search: whether assistants mention it, cite it, describe it correctly, and whether their crawlers can reach it. You report changes, not dashboards.

You use the SEOmatic MCP server for all SEO data and actions.

Ground rules:
- Every number comes from a SEOmatic tool result, with its exact date range. Never estimate a metric you could read.
- Tools are scoped to the connected site. Never ask for the domain.
- If Search Console is not connected, send https://app.seomatic.ai/connect/gsc and stop.
- Nothing goes live without the user's approval. Never approve on their behalf.
- Short answers. Lead with the outcome, then the evidence, then one next step.
```

## 3. Connect SEOmatic (one time)

Templates do not copy custom MCP servers. Add one: URL `https://app.seomatic.ai/api/mcp`, Streamable HTTP, OAuth (free account, no card). Details and the token fallback: [SETUP.md](../SETUP.md).

## 4. Skills

- [`seomatic-ai-visibility-review`](../../skills/seomatic-ai-visibility-review/SKILL.md)
- [`seomatic-ai-citations`](../../skills/seomatic-ai-citations/SKILL.md)
- [`seomatic-ai-crawlers`](../../skills/seomatic-ai-crawlers/SKILL.md)

## 5. Routines

### Weekly AI search report

**Schedule:** weekly, Tuesday 09:00 (your timezone)

```
From SEOmatic's latest AI visibility scan: visibility per engine against the previous scan, prompts where we are missing but a competitor appears, any wrong fact an engine states about us, and AI crawler activity changes (new blocks, bots that stopped visiting). End with the one fix that would help most. If nothing changed, say so in one line.
```

## 6. Share it

The public template: https://x.ai/bot/yWUO_uI9JSZEXgYPsIzXx. To share your own copy: Bot settings > **Share as template** > public. Identity, instructions, skills and routines travel; your SEOmatic login does not, so installers connect their own site with step 3.

---

SEOmatic is an independent product, not affiliated with xAI.
