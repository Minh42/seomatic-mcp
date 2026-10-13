# Weekly SEO Brief - Grok Bot template

Every Monday, a five-line brief of what changed in your Google Search Console and what to do this week.

Built on [SEOmatic](https://seomatic.ai), the SEO agent that works from your real Google Search Console data and makes the fixes on your site. Nothing goes live until you click approve, and every change can be rolled back. The free plan covers connecting and analysis; staged fixes need a paid plan.

## Install in one click

**[Open Weekly SEO Brief in Grok Bot](https://x.ai/bot/EkSJB1aArC2kU3odN1Z5W)**, add it, then connect SEOmatic once (step 3 below): templates carry the name, instructions, skills and routines, but never a login, so you sign in to your own site.

## Or build it yourself: one paste

Create a new Bot in Grok Bot, then paste this as your first message. The Bot sets itself up:

```
Set yourself up from this template:
https://github.com/Minh42/seomatic-mcp/blob/main/grok-bot/templates/weekly-seo-brief.md
1. Rename yourself to "Weekly SEO Brief" with the description in the file.
2. Replace your instructions with the Instructions block in the file.
3. Add the SEOmatic MCP server: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth), and open the sign-in for me.
4. Add the skills listed in the file from https://github.com/Minh42/seomatic-mcp/tree/main/skills.
5. Create each routine in the file with its schedule and prompt, in my timezone.
Then list what you set up and run the first routine once so I can see it work.
```

Prefer to do it by hand? Steps 1 to 5 below.

## 1. Create the Bot

- **Name:** Weekly SEO Brief
- **Description:** Every Monday, a five-line brief of what changed in your Google Search Console and what to do this week.

## 2. Instructions

Paste into Bot settings > Instructions:

```
You write one short SEO brief a week for the owner of the connected site. You report changes that matter and stay silent about noise.

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

- [`seomatic-weekly-brief`](../../skills/seomatic-weekly-brief/SKILL.md)
- [`seomatic-traffic-drop`](../../skills/seomatic-traffic-drop/SKILL.md)

## 5. Routines

### Monday brief

**Schedule:** weekly, Monday 09:00 (your timezone)

```
Write my weekly SEO brief from SEOmatic: clicks, impressions and position for the last 7 days against the 7 before (exact dates), the 3 pages and 3 queries that moved most, anything newly not indexed, and the ONE thing to do this week. Five lines plus a table. If nothing moved beyond normal variation, say "Quiet week" and give the one thing to do.
```

## 6. Share it

The public template: https://x.ai/bot/EkSJB1aArC2kU3odN1Z5W. To share your own copy: Bot settings > **Share as template** > public. Identity, instructions, skills and routines travel; your SEOmatic login does not, so installers connect their own site with step 3.

---

SEOmatic is an independent product, not affiliated with xAI.
