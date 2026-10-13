<p align="center">
  <img src="logo.png" alt="SEOmatic" width="96" height="96">
</p>

# SEOmatic for AI agents

SEO agent for your own website, in the AI agent you already use. Ask about
your real Google Search Console data, audit your pages, check how ChatGPT,
Claude, Perplexity and Google AI Overviews describe you, research keywords and
backlinks, and stage fixes. **Nothing goes live until you approve it**; after
approval SEOmatic publishes to WordPress, Shopify, Webflow, Wix and other
connected CMSs and measures the before and after.

This repository carries every agent's install file in one place: the hosted
MCP server config, 20 Agent Skills, Grok Bot templates, and plugin manifests for Claude Code, Cowork,
Cursor, Codex, Grok Build, Gemini CLI, Kimi Code and DeepSeek Harness.

| What | Where |
| --- | --- |
| MCP endpoint | `https://app.seomatic.ai/api/mcp` (Streamable HTTP) |
| Auth | OAuth 2.1 (dynamic client registration) or `Authorization: Bearer smk_live_...` |
| REST API | `https://app.seomatic.ai/api/v1` |
| CLI | [`seomatic`](https://www.npmjs.com/package/seomatic) on npm (`npx -y seomatic`) |
| API keys | [Settings, AI Agents, API Keys](https://app.seomatic.ai/dashboard/settings?tab=ai-agents) (admin role) |
| Docs | https://seomatic.ai/developers/mcp |

A free SEOmatic account (OAuth or API key) can read everything: diagnosis,
Search Console, site audits and AI visibility results. Staging fixes over MCP
(`task_manage` create and decide, `campaign_manage`) needs a paid plan, whose
key carries the `agents:act` scope. Acting through the REST API or CLI needs
the Infrastructure plan. Approving always stays with you: an agent only
records a decision you made.

## Quick start

Add the 20 SEO skills to any agent that reads Agent Skills (Claude Code,
Cursor, Codex, Gemini CLI, OpenCode, Kiro and 40+ more):

```bash
npx skills add Minh42/seomatic-mcp --full-depth
```

Then connect the MCP server they use (OAuth, free account, no card):

```bash
claude mcp add --transport http seomatic https://app.seomatic.ai/api/mcp
```

Ask: *"Which of my pages are closest to page 1?"* The answer cites your real
Search Console numbers. Prefer an always-on bot? See the
[Grok Bot templates](./grok-bot/templates/README.md).

## Contents

- [Quick start](#quick-start) · [What you can ask](#what-you-can-ask)
- Install: [Claude](#claude-web-and-desktop) ·
  [Claude Cowork](#claude-cowork) · [Claude Code](#claude-code) ·
  [ChatGPT](#chatgpt) · [Codex](#codex) · [Cursor](#cursor) ·
  [Grok Bot](#grok-bot) · [Grok Build](#grok-build) ·
  [Gemini CLI and Gemini](#gemini-cli-and-gemini) ·
  [Google Antigravity](#google-antigravity) · [Kimi Code](#kimi-code) ·
  [OpenClaw](#openclaw) · [Hermes Agent](#hermes-agent) ·
  [NanoClaw](#nanoclaw) · [Paperclip](#paperclip) ·
  [DeepSeek Harness](#deepseek-harness-dsh) ·
  [Manus and Cue](#manus-and-cue) ·
  [Perplexity Computer](#perplexity-computer) · [Muse](#muse) ·
  [OpenCode](#opencode) · [Kilo Code](#kilo-code) · [Warp](#warp) ·
  [Goose](#goose) · [Kiro](#kiro) ·
  [GitHub Copilot CLI](#github-copilot-cli) ·
  [Cline and other MCP clients](#cline-and-other-mcp-clients) ·
  [Any agent: skills only](#any-agent-skills-only)
- [Skills](#skills) · [Tools](#tools) · [Repository layout](#repository-layout) ·
  [Syncing skills](#syncing-skills-from-the-app)

## What you can ask

- Which keywords am I close to ranking on page 1 for?
- Which pages lost traffic in the last 28 days, and why?
- Run a full SEO audit of my site.
- Does ChatGPT mention my site when people ask about my topic?
- What backlinks did I gain this month? Who links to my competitors but not me?
- Write me a weekly SEO brief every Monday.

Tools are scoped to the workspace you signed in to, so you never pass a
domain.

---

## Claude (web and desktop)

Settings, **Connectors**, **Add custom connector**:

- Name: `SEOmatic`
- URL: `https://app.seomatic.ai/api/mcp`

Click **Connect** and sign in to SEOmatic. No key needed. For the guided
workflows, add the skills under Settings, **Capabilities**, **Skills**,
**Upload skill** (zip any folder from [`skills/`](./skills)).

## Claude Cowork

Cowork reads the same plugin as Claude Code. Open **Customize**, **Plugins**,
**Add marketplace**, enter `Minh42/seomatic-mcp`, then install **seomatic**.
It brings the SEOmatic connector (OAuth on first use) and all twenty skills.
If you only want the connector, add it as in [Claude](#claude-web-and-desktop).

## Claude Code

As a plugin (MCP server plus twenty skills):

```text
/plugin marketplace add Minh42/seomatic-mcp
/plugin install seomatic@seomatic
```

From your shell, the same is `claude plugin marketplace add Minh42/seomatic-mcp`
then `claude plugin install seomatic@seomatic`. Run `/mcp` and pick
`seomatic` to sign in.

MCP server only:

```bash
claude mcp add --transport http seomatic https://app.seomatic.ai/api/mcp
```

## ChatGPT

ChatGPT web and desktop (plans with developer mode): Settings, **Apps and
Connectors**, **Advanced settings**, turn on **Developer mode**, then
**Create**:

- Name: `SEOmatic`
- MCP server URL: `https://app.seomatic.ai/api/mcp`
- Authentication: OAuth

Sign in to SEOmatic when ChatGPT asks.

## Codex

As a plugin (the repo carries `plugin.json`, `mcp.json` and
`.agents/plugins/marketplace.json` in the open plugin format):

```bash
codex plugin marketplace add Minh42/seomatic-mcp
codex plugin add seomatic@seomatic
```

MCP server only:

```bash
codex mcp add seomatic --url https://app.seomatic.ai/api/mcp
codex mcp login seomatic
```

Headless (CI, servers): `export SEOMATIC_API_KEY=smk_live_...` and
`codex mcp add seomatic --url https://app.seomatic.ai/api/mcp --bearer-token-env-var SEOMATIC_API_KEY`.

## Cursor

One click:
[Add SEOmatic to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=seomatic&config=eyJ1cmwiOiJodHRwczovL2FwcC5zZW9tYXRpYy5haS9hcGkvbWNwIn0=)

Or add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "seomatic": { "url": "https://app.seomatic.ai/api/mcp" }
  }
}
```

Then **Settings, MCP**, **Connect** next to `seomatic` to sign in. Cursor uses
OAuth here: it does not send custom headers to this server, so do not paste an
API key into the config.

As a plugin (MCP server, skills and a rule): the repo carries
`.cursor-plugin/`. Install it from the Cursor marketplace once listed, or
locally:

```bash
git clone https://github.com/Minh42/seomatic-mcp.git
ln -s "$(pwd)/seomatic-mcp" ~/.cursor/plugins/local/seomatic
```

then **Developer: Reload Window**.

## Grok Bot

An always-on SEO teammate on [Grok Bot](https://x.ai/bot) with weekly
routines. One click: [install SEO Teammate](https://x.ai/bot/TAd_1q_rpYCcb94h8PXDG),
then connect SEOmatic once (OAuth). Eight more ready-made bots (traffic-drop
watch, weekly brief, quick wins, AI visibility, local SEO, agency reports,
content planner, technical monitor) install from
[`grok-bot/templates`](./grok-bot/templates/README.md). To build one by hand
instead: follow [`grok-bot/`](./grok-bot): paste the instructions, connect
the MCP server per [`grok-bot/SETUP.md`](./grok-bot/SETUP.md) (OAuth), add
the skills and the three routines. For the CLI skill, add `SEOMATIC_API_KEY`
as a bot secret.

## Grok Build

The repo carries `.grok-plugin/plugin.json` (metadata; Grok Build picks up
the skills from `skills/` and the hosted MCP server, OAuth on first use, from
the root `.mcp.json`) and `.grok-plugin/marketplace.json`, so Grok
Build can add it as a marketplace source: add `Minh42/seomatic-mcp` as a
plugin marketplace, then install `seomatic`. Once SEOmatic is listed in the
[xAI plugin marketplace](https://github.com/xai-org/plugin-marketplace), it
installs from there too.

## Gemini CLI and Gemini

The repo is a Gemini CLI extension (`gemini-extension.json` plus
[`GEMINI.md`](./GEMINI.md)):

```bash
gemini extensions install https://github.com/Minh42/seomatic-mcp
```

It installs the hosted MCP server and the skills. Gemini CLI opens a browser
to sign in on first use; run `/mcp auth seomatic` to sign in again.

MCP server only, in `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "seomatic": { "httpUrl": "https://app.seomatic.ai/api/mcp", "oauth": { "enabled": true } }
  }
}
```

Gemini CLI was retired for personal Google accounts on 2026-06-18. Google
Workspace accounts and Gemini API key users keep it; everyone else can use
[Google Antigravity](#google-antigravity).

Gemini web (gemini.google.com) does not take custom MCP servers on personal
accounts. Use Gemini CLI, or a Gemini Enterprise workspace where your admin
can add `https://app.seomatic.ai/api/mcp` as a custom MCP connector.

## Google Antigravity

Use an API key: Antigravity's OAuth flow for remote MCP servers is broken
upstream. Create a key at
[Settings, AI Agents](https://app.seomatic.ai/dashboard/settings?tab=ai-agents),
then add it from the terminal:

```bash
agy mcp add -H "Authorization: Bearer smk_live_YOUR_KEY" seomatic https://app.seomatic.ai/api/mcp
```

or in `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "seomatic": {
      "serverUrl": "https://app.seomatic.ai/api/mcp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
    }
  }
}
```

## Kimi Code

The repo carries `kimi.plugin.json` (skills plus the MCP server):

```text
/plugins install https://github.com/Minh42/seomatic-mcp
```

MCP server only:

```bash
kimi mcp add --transport http --auth oauth seomatic https://app.seomatic.ai/api/mcp
kimi mcp auth seomatic
```

## OpenClaw

Skill from ClawHub (drives the `seomatic` CLI, needs an API key):

```bash
clawhub install @Minh42/seomatic
```

Then set the key in `~/.openclaw/openclaw.json` under
`skills.entries.seomatic.apiKey`, or export `SEOMATIC_API_KEY` for the
gateway. The MCP skills are on ClawHub too (`seomatic-seo-audit`,
`seomatic-striking-distance`, ...).

MCP server: OpenClaw runs headless, so use an API key. Settings, **MCP**,
**Add server**:

```json
{
  "seomatic": {
    "url": "https://app.seomatic.ai/api/mcp",
    "transport": "streamable-http",
    "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
  }
}
```

## Hermes Agent

```bash
hermes mcp add seomatic --url https://app.seomatic.ai/api/mcp --auth oauth
```

Skills (all twenty, kept up to date):

```bash
hermes skills tap add Minh42/seomatic-mcp
```

or one at a time: `hermes skills install Minh42/seomatic-mcp/skills/seomatic-seo-audit`.
The MCP skills declare `requires_mcp_servers: [seomatic]`, so they show up
once the server is connected. The `seomatic` CLI skill asks for
`SEOMATIC_API_KEY` when it loads.

## NanoClaw

Keep the key in the OneCLI vault, never in `ncl` flags. The vault injects it
on requests to `app.seomatic.ai`:

```bash
onecli secrets create --name SEOmatic --type api_key \
  --value "$SEOMATIC_API_KEY" --host-pattern app.seomatic.ai \
  --header-name Authorization --value-format 'Bearer {value}'
```

Attach that secret to the group's agent (`onecli agents set-secrets`
replaces the whole list, so merge it with the secrets already there), then
add the server without any header and restart:

```bash
ncl groups config add-mcp-server --id <group-id> --name seomatic \
  --url https://app.seomatic.ai/api/mcp
ncl groups restart --id <group-id>
```

[`nanoclaw/add-seomatic-tool.md`](./nanoclaw/add-seomatic-tool.md) walks
NanoClaw's agent through all of it, including the merge. Copy it into your
NanoClaw checkout as `.claude/skills/add-seomatic-tool/SKILL.md` and run
`/add-seomatic-tool`. It lives outside `skills/` so the skills CLI does not
install it into other agents. Copy any folder from [`skills/`](./skills) into
the group's skills to add the guided workflows.

## Paperclip

Skills: **Skills**, **Import from GitHub**, add `Minh42/seomatic-mcp`,
**Find skills**, select the SEOmatic skills, **Import**. Paperclip shows each
skill's declared runtime requirements (`SEOMATIC_API_KEY` for the CLI skill,
the `seomatic` MCP server for the others) on import. Add `SEOMATIC_API_KEY`
as a company secret and expose it to the agents that use SEOmatic. For the
MCP skills, add the SEOmatic MCP server to the agent's runtime (for a Claude
Code agent: `claude mcp add --transport http seomatic https://app.seomatic.ai/api/mcp --header "Authorization: Bearer $SEOMATIC_API_KEY"`).

## DeepSeek Harness (dsh)

The [`plugins/dsh-seomatic`](./plugins/dsh-seomatic) bundle connects dsh to
the hosted MCP server and registers a `seomatic` skill:

```bash
dsh plugin --profile web add "github:Minh42/seomatic-mcp#path:/plugins/dsh-seomatic"
export SEOMATIC_API_KEY=smk_live_...
dsh web
```

The same bundle is on npm as `dsh-seomatic`
(`dsh plugin --profile web add dsh-seomatic`). Tools appear as `mcp__seomatic__*`. Without a key the profile still starts,
with no SEOmatic tools. See the [plugin README](./plugins/dsh-seomatic/README.md).

## Manus and Cue

Settings, **Connectors**, **Custom MCP**, **Add custom MCP**, **Direct
configuration**:

- Name: `SEOmatic`
- Transport: Streamable HTTP
- URL: `https://app.seomatic.ai/api/mcp`
- Header: `Authorization: Bearer smk_live_YOUR_KEY` (or OAuth where offered)

Cue and other agents with a "custom MCP server" screen take the same three
values.

## Perplexity Computer

Pro, Max and Enterprise: Settings, **Connectors**, **Add custom connector**
(or perplexity.ai/computer/connectors, **+ Custom connector**):

- Name: `SEOmatic`
- MCP URL: `https://app.seomatic.ai/api/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth, or API key with your `smk_live_...` key

## Muse

Ask Muse to add a custom connector for SEOmatic at
`https://app.seomatic.ai/api/mcp` and sign in to SEOmatic when it asks. Use
SEOmatic from the connector list instead once it appears there.

## OpenCode

In `opencode.json` (project) or `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "seomatic": {
      "type": "remote",
      "url": "https://app.seomatic.ai/api/mcp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
    }
  }
}
```

Leave out `headers` to sign in with OAuth instead (`opencode mcp auth seomatic`).

## Kilo Code

`kilo.jsonc` takes the same block as OpenCode:

```jsonc
{
  "mcp": {
    "seomatic": {
      "type": "remote",
      "url": "https://app.seomatic.ai/api/mcp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
    }
  }
}
```

## Warp

Settings, **AI**, **MCP servers**, **+ Add**, then paste:

```json
{
  "seomatic": {
    "url": "https://app.seomatic.ai/api/mcp",
    "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
  }
}
```

## Goose

`goose configure`, **Add Extension**, **Remote Extension (Streamable HTTP)**,
name `seomatic`, URL `https://app.seomatic.ai/api/mcp`, and an
`Authorization` header of `Bearer smk_live_YOUR_KEY`. In
`~/.config/goose/config.yaml` that is:

```yaml
extensions:
  seomatic:
    enabled: true
    name: seomatic
    type: streamable_http
    uri: https://app.seomatic.ai/api/mcp
    headers:
      Authorization: Bearer smk_live_YOUR_KEY
    timeout: 300
```

## Kiro

In `~/.kiro/settings/mcp.json` (or `.kiro/settings/mcp.json` in a project).
The `Authorization` header is the recommended route:

```json
{
  "mcpServers": {
    "seomatic": {
      "url": "https://app.seomatic.ai/api/mcp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" }
    }
  }
}
```

## GitHub Copilot CLI

```bash
copilot mcp add --transport http seomatic https://app.seomatic.ai/api/mcp
```

To use an API key, add the header in `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "seomatic": {
      "type": "http",
      "url": "https://app.seomatic.ai/api/mcp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY" },
      "tools": ["*"]
    }
  }
}
```

## Cline and other MCP clients

Any client that speaks Streamable HTTP works. With an API key (Cline's
`cline_mcp_settings.json` shown):

```json
{
  "mcpServers": {
    "seomatic": {
      "url": "https://app.seomatic.ai/api/mcp",
      "type": "streamableHttp",
      "headers": { "Authorization": "Bearer smk_live_YOUR_KEY_HERE" }
    }
  }
}
```

Clients with OAuth support only need the URL. VS Code and GitHub Copilot find
SEOmatic in the [GitHub MCP Registry](https://github.com/mcp) as
`ai.seomatic/seomatic`. The registry entry is published from the SEOmatic app
repository's `server.json`, which is the source; [`server.json`](./server.json)
here is a copy kept identical to it. Agents that install
MCP servers themselves can follow [`llms-install.md`](./llms-install.md).

## Any agent: skills only

The [skills CLI](https://github.com/vercel-labs/skills) installs into Claude
Code, Cursor, Codex, Gemini CLI, OpenClaw and many more:

```bash
npx skills add Minh42/seomatic-mcp                # the seomatic CLI skill
npx skills add Minh42/seomatic-mcp --full-depth   # all twenty skills
```

The `seomatic` skill drives the CLI, so it works in any agent that can run
shell commands, with no MCP setup: `npx -y seomatic login --device` on your
own computer, or `SEOMATIC_API_KEY` on a server.

---

## Skills

| Skill | Needs | What it does |
| --- | --- | --- |
| [`seomatic`](./skills/seomatic/SKILL.md) | CLI + `SEOMATIC_API_KEY` | Everything through `npx -y seomatic`: Search Console, audits, any tool |
| [`seomatic-seo-audit`](./skills/seomatic-seo-audit/SKILL.md) | MCP server | Full audit ending in a prioritized fix list |
| [`seomatic-striking-distance`](./skills/seomatic-striking-distance/SKILL.md) | MCP server | Page-2 queries, click upside, fixes to stage |
| [`seomatic-weekly-brief`](./skills/seomatic-weekly-brief/SKILL.md) | MCP server | Short Monday brief of what changed |
| [`seomatic-ai-visibility-review`](./skills/seomatic-ai-visibility-review/SKILL.md) | MCP server | How AI answers show your brand, tracked prompts |
| [`seomatic-ai-citations`](./skills/seomatic-ai-citations/SKILL.md) | MCP server | First-party evidence of AI citations and AI referrals |
| [`seomatic-approval-workflow`](./skills/seomatic-approval-workflow/SKILL.md) | MCP server | Review staged work, approve or dismiss, roll back |
| [`seomatic-traffic-drop`](./skills/seomatic-traffic-drop/SKILL.md) | MCP server | Why traffic dropped: seasonality, pages, indexing, competitors |
| [`seomatic-ctr-fix`](./skills/seomatic-ctr-fix/SKILL.md) | MCP server | Pages that rank but lose the click; new titles and metas |
| [`seomatic-content-refresh`](./skills/seomatic-content-refresh/SKILL.md) | MCP server | Decaying pages and exactly what each needs |
| [`seomatic-cannibalization`](./skills/seomatic-cannibalization/SKILL.md) | MCP server | Your own pages competing for one query, and which should win |
| [`seomatic-indexing-check`](./skills/seomatic-indexing-check/SKILL.md) | MCP server | URL Inspection on key pages, each status in plain words |
| [`seomatic-internal-linking`](./skills/seomatic-internal-linking/SKILL.md) | MCP server | Contextual links from strong pages to pages near page 1 |
| [`seomatic-keyword-research`](./skills/seomatic-keyword-research/SKILL.md) | MCP server | Keywords from your own Search Console, mapped to pages |
| [`seomatic-content-brief`](./skills/seomatic-content-brief/SKILL.md) | MCP server | A brief from the live results, and draft scoring before publishing |
| [`seomatic-competitor-gap`](./skills/seomatic-competitor-gap/SKILL.md) | MCP server | Who really outranks you and the keywords they win |
| [`seomatic-backlink-audit`](./skills/seomatic-backlink-audit/SKILL.md) | MCP server | Whether authority is your constraint, and real link prospects |
| [`seomatic-local-seo`](./skills/seomatic-local-seo/SKILL.md) | MCP server | Business Profile, reviews, map pack and location pages |
| [`seomatic-ai-crawlers`](./skills/seomatic-ai-crawlers/SKILL.md) | MCP server | Which AI bots crawl you, what is blocked, crawl to citation |
| [`seomatic-client-report`](./skills/seomatic-client-report/SKILL.md) | MCP server | Monthly client or boss report from real data |

Every skill follows the same rules: numbers come from tool results only, date
ranges are quoted exactly, and nothing goes live until you approve it.

## Tools

16 tools, each annotated read-only or staging and scoped to the connected
workspace: `gsc_performance`, `gsc_insights`, `gsc_indexing`,
`keyword_research`, `keyword_clusters`, `backlink_profile`,
`serp_competitors`, `site_pages`, `ai_citations`, `visibility_manage`,
`traffic_analytics`, `local_presence`, `dataset_library`,
`strategy_insights`, `task_manage`, `campaign_manage`. What you see depends
on your plan and connected data sources. Reference:
https://seomatic.ai/developers/mcp

## Repository layout

| Path | For |
| --- | --- |
| `.mcp.json` | Claude Code plugin MCP config |
| `.claude-plugin/` | Claude Code and Cowork plugin + marketplace |
| `.cursor-plugin/`, `rules/` | Cursor plugin, marketplace, MCP config, rule |
| `.grok-plugin/` | Grok Build plugin + marketplace |
| `plugin.json`, `mcp.json`, `.agents/plugins/` | Codex / open agent plugin format |
| `gemini-extension.json`, `GEMINI.md` | Gemini CLI extension |
| `kimi.plugin.json` | Kimi Code plugin |
| `lhm.plugin.json` | LobeHub |
| `SKILL.md`, `skills/` | Agent Skills (root `SKILL.md` = `skills/seomatic/SKILL.md`) |
| `plugins/dsh-seomatic/` | DeepSeek Harness bundle (npm `dsh-seomatic`) |
| `server.json` | Copy of the Official MCP Registry entry (published from the app repo) |
| `nanoclaw/add-seomatic-tool.md` | NanoClaw skill (copy to `.claude/skills/add-seomatic-tool/SKILL.md`) |
| `grok-bot/`, `make-app/` | Grok Bot template, Make custom app |

## Syncing skills from the app

The six MCP skills are maintained in the SEOmatic app repository. To refresh
them here:

```bash
scripts/sync-skills.sh /path/to/seomatic-app
git diff --stat
```

The script copies `skills/seomatic-*/SKILL.md`, adds the Paperclip
requirements block where the app copy has none, and refreshes the root
`SKILL.md` from `skills/seomatic/SKILL.md`. A GitHub Action cannot do this
without a cross-repo token, so run it by hand before a release.

## License

MIT. Support: https://seomatic.ai/contact
