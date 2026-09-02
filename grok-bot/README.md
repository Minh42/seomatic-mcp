# SEOmatic SEO Teammate - Grok Bot template

An always-on SEO teammate for [Grok Bot](https://x.ai/bot): it watches your
Google Search Console data through [SEOmatic](https://seomatic.ai), reports
what changed, finds keywords one step from page 1, and (on paid plans)
stages fixes to your CMS for your approval.

## What's in this template

| Piece | File | Where it goes in Grok Bot |
| --- | --- | --- |
| Bot instructions | [INSTRUCTIONS.md](./INSTRUCTIONS.md) | Bot settings → Instructions |
| MCP setup | [SETUP.md](./SETUP.md) | One-time step after install (templates don't copy custom MCP servers) |
| Skill: SEO audit | [../skills/seomatic-seo-audit/SKILL.md](../skills/seomatic-seo-audit/SKILL.md) | Bot skills |
| Routine: weekly review | [routines/weekly-seo-review.md](./routines/weekly-seo-review.md) | Routines (Mon 09:00) |
| Routine: traffic-drop watch | [routines/traffic-drop-watch.md](./routines/traffic-drop-watch.md) | Routines (daily 08:30) |
| Routine: striking-distance sweep | [routines/striking-distance-sweep.md](./routines/striking-distance-sweep.md) | Routines (Thu 10:00) |

## Build it in your Grok Bot (10 minutes)

1. Create a new Bot. Name: **SEO Teammate**. Description: *Watches your
   Search Console via SEOmatic, reports what changed, and stages fixes for
   your approval.*
2. Paste [INSTRUCTIONS.md](./INSTRUCTIONS.md) into its Instructions.
3. Connect the SEOmatic MCP server per [SETUP.md](./SETUP.md) (free
   account, OAuth, ~2 minutes).
4. Add the skill and the three routines from the table above.
5. Ask it: *"Which of my pages are closest to page 1?"* - first answer
   should cite your real Search Console numbers.

## Share it as a template

Once your Bot works: Bot settings → **Share as template** → review the
draft pack (identity, instructions, skills, routines travel; your MCP
login does NOT - installers authenticate themselves via SETUP.md) →
publish, and share the x.ai link.

## Why an always-on bot beats a chat window for SEO

SEO is a monitoring problem: rankings drift, pages slip, opportunities
appear on their own schedule. A chat assistant answers when you remember to
ask; routines ask for you, every week, and only speak when something
changed.

---

SEOmatic is an independent product, not affiliated with xAI. The free plan
covers connecting and all analysis; agent write-actions are paid, always
approval-gated, always revertible. Docs: https://seomatic.ai/developers/mcp
