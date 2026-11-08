---
name: seomatic-traffic-drop
description: "Explain why the user's Google traffic dropped or grew, from their real Search Console data: compare with the previous period, find the pages and queries that lost or gained the most clicks, rule out indexing problems, and say what to do first. Use when the user says their traffic, clicks or rankings changed."
---

# Why traffic changed

1. Call `compare_periods` with `dimension: "page"` (28 days unless the user
   names a window between 7 and 45 days).
2. Call `compare_periods` with `dimension: "query"` for the same window.
3. Call `get_dimension_breakdown` with `dimension: "date"` to see whether the
   change is sudden (one day) or gradual, and with `dimension: "device"` if
   one device explains it.
4. For the 1 to 3 pages that lost the most, call `inspect_url_indexing`.

## Reading the data

- Position fell and clicks fell: a ranking loss on those queries.
- Position held, impressions fell: less demand (seasonality or the topic
  cooling); say so and do not call it a loss you can fix.
- Position held, CTR fell: something on the results page took the clicks, or
  the title no longer matches the search.
- Not indexed, or a different canonical: an indexing problem, fix that first.

## Answer

Lead with the cause and the number (for example "clicks -38%, mostly from 3
pages that lost 4 positions"). Then the pages and queries with before and
after numbers, then up to 3 fixes. Offer to prepare them; after the user
agrees, use `create_seo_tasks` and `show_approval_cards`.
