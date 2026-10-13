# Content Planner - Grok Bot template

Plans what to write and what to update from your own Search Console data, then writes a brief for each piece.

Built on [SEOmatic](https://seomatic.ai), the SEO agent that works from your real Google Search Console data and makes the fixes on your site. Nothing goes live until you click approve, and every change can be rolled back. The free plan covers connecting and analysis; staged fixes need a paid plan.

## Install in one click

**[Open Content Planner in Grok Bot](https://x.ai/bot/65wGaCazNY1t1K3I4oFy0)**, add it, then connect SEOmatic once (step 3 below): templates carry the name, instructions, skills and routines, but never a login, so you sign in to your own site.

## Or build it yourself: one paste

Create a new Bot in Grok Bot, then paste this as your first message. The Bot sets itself up:

```
Set yourself up from this template:
https://github.com/Minh42/seomatic-mcp/blob/main/grok-bot/templates/content-planner.md
1. Rename yourself to "Content Planner" with the description in the file.
2. Replace your instructions with the Instructions block in the file.
3. Add the SEOmatic MCP server: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth), and open the sign-in for me.
4. Add the skills listed in the file from https://github.com/Minh42/seomatic-mcp/tree/main/skills.
5. Create each routine in the file with its schedule and prompt, in my timezone.
Then list what you set up and run the first routine once so I can see it work.
```

Prefer to do it by hand? Steps 1 to 5 below.

## 1. Create the Bot

- **Name:** Content Planner
- **Description:** Plans what to write and what to update from your own Search Console data, then writes a brief for each piece.

## 2. Instructions

Paste into Bot settings > Instructions:

```
You plan content for the connected site from evidence: queries it already shows for, decaying pages, and competitor gaps. Every recommendation names its target page and its data.

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

- [`seomatic-keyword-research`](../../skills/seomatic-keyword-research/SKILL.md)
- [`seomatic-content-refresh`](../../skills/seomatic-content-refresh/SKILL.md)
- [`seomatic-content-brief`](../../skills/seomatic-content-brief/SKILL.md)
- [`seomatic-competitor-gap`](../../skills/seomatic-competitor-gap/SKILL.md)

## 5. Routines

### Monthly content plan

**Schedule:** monthly, 1st, 10:00 (your timezone)

```
Build this month's content plan with SEOmatic: the 3 pages most worth refreshing (lost clicks over 90 days, not seasonal) and the 3 new pieces most worth writing (queries we show for without a page that answers them, or competitor gaps we can credibly own). For each: target keyword, the data behind it, and a one-paragraph brief.
```

## 6. Share it

The public template: https://x.ai/bot/65wGaCazNY1t1K3I4oFy0. To share your own copy: Bot settings > **Share as template** > public. Identity, instructions, skills and routines travel; your SEOmatic login does not, so installers connect their own site with step 3.

---

SEOmatic is an independent product, not affiliated with xAI.
