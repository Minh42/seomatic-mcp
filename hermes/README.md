# SEOmatic for Hermes Agent

SEOmatic is an SEO agent for your own website. In
[Hermes Agent](https://github.com/NousResearch/hermes-agent) it answers from
your real data through SEOmatic's hosted MCP server: Google Search Console
queries and pages, keywords close to page 1, traffic drops, site audits,
backlinks and SERP competitors, how ChatGPT, Claude, Perplexity and Google AI
Overviews describe you, daily local rankings and your Google Business Profile.
It can also stage fixes for pages on WordPress, Shopify, Webflow, Wix and
other connected sites.

Ask things like:

- "Which of my keywords are closest to page 1?"
- "Why did my traffic drop this month?"
- "Run a full SEO audit of my site."
- "Do AI answers cite my site? Who do they cite instead?"

## What is in this package

An [Agent Plugins v1](https://agent-plugins.org) package, configuration only
(no code, no binaries):

- `plugin.json`: the manifest. It marks the `seomatic` server `untrusted`, so
  Hermes asks before every tool the server does not mark read-only, and
  refuses those tools in unattended runs.
- `mcp.json`: one MCP server, `seomatic`, that runs the pinned
  [`mcp-remote@0.15.2`](https://www.npmjs.com/package/mcp-remote) through
  `npx` and connects it to `https://app.seomatic.ai/api/mcp` with OAuth
  sign-in.
- `skills/`: twenty workflow skills (SEO audit, striking distance, traffic
  drop, CTR fix, cannibalization, content refresh, keyword research, content
  brief, competitor gap, backlink audit, internal linking, indexing check,
  AI visibility review, AI citations, AI crawlers, local SEO, local SEO
  weekly, weekly brief, client report, approval workflow). They are built
  from the repository's `skills/` folder by `scripts/build-hermes-skills.sh`.

## Install

```bash
hermes plugins install seomatic --enable
```

Requirements: Hermes Agent 0.21.6 or newer, Node.js 20.18.1 or newer with
`npx` on the `PATH`, and a SEOmatic account (free plan at
https://app.seomatic.ai/signup).

## Sign in

The first time Hermes connects, `mcp-remote` registers a client named
"Hermes Agent (SEOmatic)" with SEOmatic (OAuth 2.1 dynamic client
registration, PKCE S256), opens your browser on the SEOmatic sign-in page and
listens on a local callback port. Sign in and allow access. `mcp-remote`
stores the tokens under `~/.mcp-auth`.

Hermes waits about a minute for a new MCP connection. If signing in takes
longer (a new account, Search Console to connect), the attempt is dropped and
the next use opens the sign-in page again. Creating the account first at
https://app.seomatic.ai avoids that, and so does letting Hermes run the
sign-in itself. Hermes's own OAuth client then replaces this package's
`mcp-remote` server, and the skills keep working:

```bash
hermes mcp add seomatic --url https://app.seomatic.ai/api/mcp --auth oauth
```

On a headless machine, use an API key in a header instead (an entry in
`config.yaml` replaces this package's server). Create the key in SEOmatic
under Settings, AI Agents, API Keys:

```yaml
# ~/.hermes/config.yaml
mcp_servers:
  seomatic:
    url: "https://app.seomatic.ai/api/mcp"
    headers:
      Authorization: "Bearer smk_live_..."
```

## What to know before you install

- **Network.** Every tool call goes to `app.seomatic.ai` and acts on your own
  SEOmatic workspace with your role in it. The tool list comes from the
  server at runtime and depends on your plan and connected data sources; it
  is not part of this package.
- **Credits.** Reads of your Search Console data, stored data and the site
  audit are free. Live market data (keyword metrics and suggestions,
  backlinks, SERP competitors, local SERP visibility) and fresh AI visibility
  scans bill SEOmatic AI credits. Actions that generate content quote the
  credit estimate first and run only after you confirm. Approved fixes bill
  credits when they run. `generate_article` uses one prepaid article unit.
- **Changes to your site.** Fixes the agent proposes through these tools are
  staged in SEOmatic. Approving, publishing, undoing and rolling back change
  your live site, and those tool calls need an explicit confirmation from
  you (Hermes also asks first, because the server is untrusted). SEOmatic's
  own background agents follow the autonomy mode set in SEOmatic, under
  Settings, AI Agents: in Assisted, the default for new workspaces,
  reversible changes (titles, descriptions, internal links, schema, page
  text, articles) go live on their own with a one-click undo, and new pages,
  bulk changes, redirects and removals wait for your yes. In Approval mode
  every change waits for your yes.
- **Credentials.** None in the package or in Hermes's config. `mcp-remote`
  keeps its OAuth tokens in `~/.mcp-auth`.
- **No telemetry, no self-updater, no background process** in the package
  beyond the `mcp-remote` process Hermes starts for the server.

More: https://seomatic.ai/developers/mcp
