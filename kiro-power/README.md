# SEOmatic Kiro Power

SEOmatic is the SEO agent for your own website. This Kiro Power connects Kiro
to SEOmatic's hosted MCP server and adds SEO skills. It follows the Agent
Plugins format Kiro uses for powers (`plugin.json`, `mcp.json`, `skills/`).

- **MCP server:** `https://app.seomatic.ai/api/mcp` (Streamable HTTP). Sign in
  with your SEOmatic account through OAuth when Kiro first connects. No key
  goes in this power.
- **Skills:** `seomatic-kiro` (how to use SEOmatic in Kiro, loaded first),
  plus site audit, striking-distance keywords, traffic-drop diagnosis, CTR
  fixes, AI visibility, AI citations and AI crawlers, keyword and backlink
  research, content briefs and refreshes, competitor gaps, cannibalization,
  internal linking, indexing checks, local SEO, weekly briefs, client reports
  and the approval workflow, plus a skill for the SEOmatic CLI.
- **Activation keywords:** SEO, Search Console, rankings, keywords, backlinks,
  site audit, traffic drop, AI visibility, local SEO, Google Business Profile
  and more (see `plugin.json`).

## Setup

1. Create an SEOmatic account at https://app.seomatic.ai and connect your
   site and Google Search Console there.
2. In Kiro, open the Powers panel and choose **Add Custom Power** >
   **Import power from a repository URL** (named **Import power from
   GitHub** before Kiro IDE 1.4.236), then paste:
   `https://github.com/Minh42/seomatic-mcp/tree/main/kiro-power`
   (or clone this repo and use **Import power from a folder** on
   `kiro-power/`).
3. Ask something like "Which of my keywords are closest to page 1?". Kiro
   activates the power, connects to the SEOmatic MCP server and opens the
   SEOmatic sign-in page in your browser the first time. Approve access and
   the tools are ready.

## What it can do on your site

Reading your own data (Search Console, audits, stored results) is free. Live
market data, fresh AI visibility scans and approved fixes use SEOmatic
credits; each tool says so before it runs. Fixes Kiro stages wait for your
approval in SEOmatic. SEOmatic's own agent, in its default mode, also ships
small, undoable fixes by itself. Every change can be rolled back.

## Data, privacy and support

Tool calls go to app.seomatic.ai and act on your SEOmatic account.

- Privacy policy: https://seomatic.ai/privacy
- Terms: https://seomatic.ai/terms
- Docs: https://seomatic.ai/developers/mcp
- Support: contact@seomatic.ai

## Maintainers

`skills/` is generated from the repo's `skills/` folder by
`scripts/build-kiro-power.sh` (also run by `scripts/sync-skills.sh`); edit
the source skills, not the copies. `skills/seomatic-kiro/` lives only here.
