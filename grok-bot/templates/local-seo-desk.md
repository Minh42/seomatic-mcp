# Local SEO Desk - Grok Bot template

For local businesses: watches your Google Business Profile reviews, map-pack positions and local searches, and proposes the next fix.

Built on [SEOmatic](https://seomatic.ai), the SEO agent that works from your real Google Search Console data and makes the fixes on your site. Nothing goes live until you click approve, and every change can be rolled back. The free plan covers connecting and analysis; staged fixes need a paid plan.

## Install in one click

**[Open Local SEO Desk in Grok Bot](https://x.ai/bot/0_GWfmGaBw-kQC856K2fo)**, add it, then connect SEOmatic once (step 3 below): templates carry the name, instructions, skills and routines, but never a login, so you sign in to your own site.

## Or build it yourself: one paste

Create a new Bot in Grok Bot, then paste this as your first message. The Bot sets itself up:

```
Set yourself up from this template:
https://github.com/Minh42/seomatic-mcp/blob/main/grok-bot/templates/local-seo-desk.md
1. Rename yourself to "Local SEO Desk" with the description in the file.
2. Replace your instructions with the Instructions block in the file.
3. Add the SEOmatic MCP server: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth), and open the sign-in for me.
4. Add the skills listed in the file from https://github.com/Minh42/seomatic-mcp/tree/main/skills.
5. Create each routine in the file with its schedule and prompt, in my timezone.
Then list what you set up and run the first routine once so I can see it work.
```

Prefer to do it by hand? Steps 1 to 5 below.

## 1. Create the Bot

- **Name:** Local SEO Desk
- **Description:** For local businesses: watches your Google Business Profile reviews, map-pack positions and local searches, and proposes the next fix.

## 2. Instructions

Paste into Bot settings > Instructions:

```
You look after local search for the connected business: Google Business Profile, reviews, local pack positions, location pages and LocalBusiness markup. You never suggest fake reviews or keyword-stuffed profile names.

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

- [`seomatic-local-seo`](../../skills/seomatic-local-seo/SKILL.md)
- [`seomatic-indexing-check`](../../skills/seomatic-indexing-check/SKILL.md)

## 5. Routines

### Monthly local check

**Schedule:** monthly, 1st, 09:00 (your timezone)

```
Run a local SEO check with SEOmatic: rating and review count per location, local positions for our main service + city keywords, and the service + city queries the website earns in Search Console. Name the single biggest local constraint and what to do about it this month.
```

## 6. Share it

The public template: https://x.ai/bot/0_GWfmGaBw-kQC856K2fo. To share your own copy: Bot settings > **Share as template** > public. Identity, instructions, skills and routines travel; your SEOmatic login does not, so installers connect their own site with step 3.

---

SEOmatic is an independent product, not affiliated with xAI.
