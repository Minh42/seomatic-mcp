---
name: seomatic-ai-visibility-review
description: "Report how the user's brand shows up in AI answer engines using SEOmatic's latest stored AI-visibility scan: which engines mention or cite the site, the prompts where it was missed, the competitors named instead and the sources cited, with what to do next. Use when the user asks whether AI assistants or AI search mention or recommend their business."
---

# AI-answer visibility

1. Call `get_ai_visibility`. It reads the latest completed scan; it does not
   run a new one.
2. If there is no scan yet, say so plainly and explain that a scan runs from
   the SEOmatic app. Do not guess what the engines would say.

## Answer

- Per engine: mentioned or not, cited or not, share of tracked prompts.
- The prompts where the brand was missed, with who was named instead.
- The sources the engines cited most, and whether the user's own pages are
  among them.
- Up to 3 actions (a page that answers a missed prompt directly, facts the
  engines get wrong, sources worth being listed on). After the user agrees,
  stage them with `create_seo_tasks` and show them with `show_approval_cards`.

Report what the scan observed; do not claim a change will make an engine cite
the site.
