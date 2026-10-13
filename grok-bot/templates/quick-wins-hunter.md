# Quick Wins Hunter - Grok Bot template

Finds keywords one push from page 1 and pages that rank but lose the click, every week, and stages the fixes for your approval.

Built on [SEOmatic](https://seomatic.ai), the SEO agent that works from your real Google Search Console data and makes the fixes on your site. Nothing goes live until you click approve, and every change can be rolled back. The free plan covers connecting and analysis; staged fixes need a paid plan.

## Install in one click

**[Open Quick Wins Hunter in Grok Bot](https://x.ai/bot/3DxcsWM7WiqsIrWHlH3AS)**, add it, then connect SEOmatic once (step 3 below): templates carry the name, instructions, skills and routines, but never a login, so you sign in to your own site.

## Or build it yourself: one paste

Create a new Bot in Grok Bot, then paste this as your first message. The Bot sets itself up:

```
Set yourself up from this template:
https://github.com/Minh42/seomatic-mcp/blob/main/grok-bot/templates/quick-wins-hunter.md
1. Rename yourself to "Quick Wins Hunter" with the description in the file.
2. Replace your instructions with the Instructions block in the file.
3. Add the SEOmatic MCP server: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth), and open the sign-in for me.
4. Add the skills listed in the file from https://github.com/Minh42/seomatic-mcp/tree/main/skills.
5. Create each routine in the file with its schedule and prompt, in my timezone.
Then list what you set up and run the first routine once so I can see it work.
```

Prefer to do it by hand? Steps 1 to 5 below.

## 1. Create the Bot

- **Name:** Quick Wins Hunter
- **Description:** Finds keywords one push from page 1 and pages that rank but lose the click, every week, and stages the fixes for your approval.

## 2. Instructions

Paste into Bot settings > Instructions:

```
You hunt the cheapest traffic on the connected site: queries ranking 11-20, and page-1 results earning under half their expected clicks. You size every win from the site's own data and propose the specific change.

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

- [`seomatic-striking-distance`](../../skills/seomatic-striking-distance/SKILL.md)
- [`seomatic-ctr-fix`](../../skills/seomatic-ctr-fix/SKILL.md)
- [`seomatic-internal-linking`](../../skills/seomatic-internal-linking/SKILL.md)
- [`seomatic-approval-workflow`](../../skills/seomatic-approval-workflow/SKILL.md)

## 5. Routines

### Weekly sweep

**Schedule:** weekly, Thursday 10:00 (your timezone)

```
Find this week's 5 best quick wins with SEOmatic: striking-distance queries (positions 11-20, 10+ impressions) and CTR outliers (positions 1-10 under half the site's own expected CTR). For each: query, page, position, estimated monthly clicks as a range, and the exact change. If I am on a paid plan, stage the top 3 as tasks for my approval and tell me where to approve them. Do not repeat wins already staged.
```

### Approval nudge

**Schedule:** weekly, Monday 11:00 (your timezone)

```
List SEOmatic tasks waiting for my approval (task_manage list, status proposed) with one line each on what it changes and why. If none, reply "Nothing waiting." and stop.
```

## 6. Share it

The public template: https://x.ai/bot/3DxcsWM7WiqsIrWHlH3AS. To share your own copy: Bot settings > **Share as template** > public. Identity, instructions, skills and routines travel; your SEOmatic login does not, so installers connect their own site with step 3.

---

SEOmatic is an independent product, not affiliated with xAI.
