---
name: seomatic-weekly-brief
description: "Write a short weekly SEO brief for the user's own site from real Search Console data: what changed in the last 7 days against the 7 before, the pages and queries behind it, what went live or waits for approval, and the one thing to do this week. Use when the user asks for a weekly SEO update or what changed this week, or as a scheduled task."
---

# Weekly SEO brief

1. Call `compare_periods` with `days: 7` and `dimension: "page"`, then with
   `dimension: "query"`.
2. Call `get_dimension_breakdown` with `dimension: "date"` and `days: 14` to
   spot a single-day break.
3. Call `list_seo_tasks` for what went live this week and what waits for the
   user.

## Answer (under 150 words)

- Clicks and impressions this week against last week, with the change in %.
- The 2 to 3 pages or queries that moved most, with numbers.
- Live this week, and waiting for approval (show them with
  `show_approval_cards` if any).
- One action for this week.

Search Console data lags 2 to 3 days; say so when the last days look low.
