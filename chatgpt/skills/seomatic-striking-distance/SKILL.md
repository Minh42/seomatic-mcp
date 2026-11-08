---
name: seomatic-striking-distance
description: "Find the user's Google queries that rank just off page one (average position about 4 to 15) from their real Search Console data, estimate the clicks a small push could win, and prepare the fixes for approval. Use when the user wants quick SEO wins, keywords close to page 1, or more traffic without new content."
---

# Keywords closest to page one

1. Call `get_search_queries` with `days: 28` and `limit: 500`.
2. Keep queries with average position between 4 and 15 and at least 50
   impressions. Sort by impressions.
3. For the top 5, call `get_dimension_breakdown` with `dimension: "page"` and
   `filterQuery` set to the query, to see which page ranks. Two of the
   site's pages sharing one query is worth pointing out.
4. Estimate the upside plainly: impressions times the gap between today's CTR
   and a typical page-one CTR for a better position. Say it is an estimate.

## Answer

A table: query, page, position, impressions, clicks, CTR, suggested change
(title and meta rewrite for a weak CTR, a content section for a thin match,
internal links for a page short on links). Then ask which to prepare. After
the user agrees, stage them with `create_seo_tasks` (at most 5) and show
them with `show_approval_cards`. Nothing changes on the site until the user
approves.

If Search Console is not connected, call `show_connect_card`.
