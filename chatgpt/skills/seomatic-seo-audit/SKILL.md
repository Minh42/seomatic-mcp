---
name: seomatic-seo-audit
description: "Run an SEO health check of the user's own site from real data through SEOmatic: whether Google can index it, Search Console clicks and queries, pages losing traffic, indexing problems and AI-answer visibility, ending with a short ranked fix list the user can approve. Use when the user asks for an SEO audit, how their site is doing, or what to fix first."
---

# SEO audit of the user's own site

Work only from SEOmatic tool results. Every finding carries a number from the
data; never invent a metric, a ranking or a cause.

## Steps

1. Call `get_started`. It returns whether Google can index the site, the
   Search Console summary (when connected), the near-page-one queries, a
   verdict and the top 3 actions. If no site is on record, ask the user for
   their site and pass it as `site`; pass `confirmed_own: true` only after the
   user said the site is theirs.
2. If Search Console is not connected, call `show_connect_card` and show the
   link as is. Continue with what `get_started` returned.
3. Call `get_top_pages` (28 days) and `compare_periods` with
   `dimension: "page"` to find the pages that lost the most clicks.
4. For the one or two most important pages that lost clicks, call
   `inspect_url_indexing` to rule out an indexing cause.
5. Call `get_ai_visibility` for the latest AI-answer scan. If there is no
   scan, say so; do not start one.

## Answer

- One-line verdict.
- Up to 5 actions, highest impact first. For each: the page or query, the
  number behind it (clicks, impressions, position, CTR or the indexing state)
  and the concrete change.
- Ask which ones to prepare. Only after the user agrees, call
  `create_seo_tasks` for those (at most 5), then `show_approval_cards` with
  the new task ids. Staging changes nothing on the site: each fix waits for
  the user's approval.

Do not promise rankings or that Google will index a page.
