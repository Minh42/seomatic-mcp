---
name: seomatic-local-seo
description: 'Review local SEO for the connected business: Google Business Profile locations and reviews, local pack positions for the keywords that matter, local queries in Search Console, LocalBusiness schema and location pages, then stage the fixes. Use when the user runs a local business, asks about Google Maps, the local pack, reviews, Google Business Profile or city pages.'
version: 1.0.0
license: MIT
homepage: https://app.seomatic.ai
metadata:
  paperclip:
    requirements:
      env: []
      binaries: []
      mcp: [seomatic]
  openclaw:
    requires:
      mcp: [seomatic]
  hermes:
    requires_mcp_servers: [seomatic]
mcp:
  servers:
    seomatic:
      url: https://app.seomatic.ai/api/mcp
      transport: streamable-http
      auth: oauth
      setup: 'Add the SEOmatic MCP server (OAuth, or a Bearer smk_ API key from https://app.seomatic.ai/dashboard/settings?tab=ai-agents). Business Profile and Search Console reads are free; local position checks use the free monthly allowance or AI credits.'
tools:
  - local_presence
  - gsc_performance
  - site_pages
  - keyword_research
  - campaign_manage
  - task_manage
---

# Local SEO review

For a local business, the map pack and the Business Profile often bring more
customers than the website's organic rankings. This skill checks both, from
the business's own connected data.

## Prerequisites

- Google Business Profile: `local_presence` action `list_locations`. If none
  come back, the profile is not connected; send the user to
  https://app.seomatic.ai/dashboard/integrations and stop that part.
- Search Console for the website half: https://app.seomatic.ai/connect/gsc.

## 1. The profile

For each location, `local_presence` action `reviews`: average rating and
count. Compare with what the user tells you about competitors, or with the
businesses in the local results below. Under about 4.2 stars, or a fraction of
the competitors' review count, is usually the first constraint, and it is
fixed off-site (asking customers), not on the website. Say so plainly.

## 2. Local positions

`local_presence` action `visibility` with the 3-5 keywords that bring the
business customers ("plumber near me" is not useful; "emergency plumber
Lyon" is). If you do not know them, `gsc_performance` action `top_queries`
and look for the service + place pattern, or ask the user.

## 3. Local queries on the website

`gsc_performance` action `top_queries` and `dimension_breakdown` with
`dimension` country or page. Which service + city queries does the site
already earn impressions for, and on which page? A city query landing on the
homepage means a location page is missing.

## 4. The website signals

`site_pages` action `crawl` on the homepage and contact page:

- Name, address and phone written the same way as on the profile.
- LocalBusiness structured data present and matching (`local_schema` builds
  it from the profile itself, no invented ratings).
- A page per real service area or location, with something specific to say
  about it. Doorway pages with only the city name swapped hurt.

## 5. Report

Lead with the single biggest constraint (usually reviews, a missing location
page, or inconsistent NAP), then the rest ranked.

## Offer to stage the work

Staging needs a paid SEOmatic plan (the key carries the `agents:act` scope).
It costs no credits, runs nothing, and always waits for the user's approval.
On a free key the staging actions are locked and say which plan includes
them: describe the specific fix instead so the user can pass it on.

Check `task_manage` action `list` first so you do not stage a duplicate.
Then `task_manage` action `create` with up to 5 tasks: `local_schema` for LocalBusiness markup, `content_create` for a missing service page. For location pages, use `campaign_manage` action `propose_location_pages` (drafts on the site's own layout) instead of single tasks. Each task
needs `targetKey` (the full page URL, or a topic for content work), a
`title` that states the goal in the user's words ("Get 'pricing calculator'
onto page 1", never "Optimize meta tags"), and a `rationale` with the
numbers behind it. Quote cost from each task's `estimatedCost.label`.

- Tell the user the cards are staged and where to approve them.
- Never approve on the user's behalf. Approval happens in SEOmatic, or
  through `task_manage` action `decide` only after the user says yes to that
  specific task.
- Approved auto-executable tasks start within seconds: read the result back
  with `task_manage` action `get` before you claim anything changed.

## What not to do

- Do not suggest fake reviews, review gating, or keyword-stuffing the
  business name on the profile. All three get profiles suspended.
- Do not create city pages for places the business does not serve.
