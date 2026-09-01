# SEOmatic MCP Server

SEO agent for your own website, as a **hosted (remote) MCP server**. Connect it
and your AI agent can read your real SEO data and stage fixes that always wait
for your approval.

- **Endpoint:** `https://app.seomatic.ai/api/mcp` (Streamable HTTP)
- **Auth:** OAuth 2.1 (interactive clients) or a `Bearer` API key (headless)
- **Docs:** https://seomatic.ai/developers/mcp

There is nothing to clone, build, or run: this repository documents how to
connect to the hosted server.

## What you can ask

- Which keywords am I close to ranking on page 1 for?
- Which pages are losing traffic, and why?
- What backlinks did I gain this month? Who links to my competitors but not me?
- Does ChatGPT mention my site when people ask about my topic?
- Are my Google Ads and SEO fighting over the same keywords?

On a paid SEOmatic plan, the agent can also **stage** SEO fix tasks, content
campaigns, and article drafts. Nothing touches your site until a human
approves it in SEOmatic, and every change shows before-and-after results.

## Tools

13 consolidated tools, each annotated (read-only vs staging) and scoped to the
connected workspace: `gsc_performance`, `gsc_indexing`, `keyword_research`,
`keyword_clusters`, `backlink_profile`, `serp_competitors`,
`traffic_analytics`, `local_presence`, `site_pages`, `dataset_library`,
`strategy_insights`, `task_manage`, `campaign_manage`. The roster you see
depends on your plan and connected data sources. Full reference:
https://seomatic.ai/developers/mcp

## Install in Cline

1. Create a SEOmatic account at https://app.seomatic.ai (free tier works) and
   mint an API key: **Settings -> API Keys -> Create key**. Copy the
   `smk_live_...` value.
2. Add this to your Cline MCP settings file (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "seomatic": {
      "url": "https://app.seomatic.ai/api/mcp",
      "type": "streamableHttp",
      "headers": {
        "Authorization": "Bearer smk_live_YOUR_KEY_HERE"
      }
    }
  }
}
```

3. Ask Cline something like: "What are my striking-distance queries? Use
   SEOmatic." Tools are already scoped to your connected site, so no domain
   parameter is ever needed.

## Install in other clients

- **Claude (web/desktop):** Settings -> Connectors -> Add custom connector ->
  URL `https://app.seomatic.ai/api/mcp` (OAuth, no key needed)
- **Claude Code:** `claude mcp add --transport http seomatic https://app.seomatic.ai/api/mcp`
- **Cursor:** add `{"mcpServers": {"seomatic": {"url": "https://app.seomatic.ai/api/mcp"}}}` to `mcp.json`

## Free vs paid

The free tier includes the insight tools with a monthly question quota shared
with SEOmatic chat. Acting tools (staging tasks, campaigns, articles) need a
paid plan and always keep the human-approval gate.

## Support

- Docs: https://seomatic.ai/developers/mcp
- Site: https://seomatic.ai
