# dsh-seomatic

Connects [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
(`dsh`) to [SEOmatic](https://seomatic.ai), so the agent can answer from your
real Google Search Console data, audit your pages, read your AI search
visibility and run keyword and backlink research.

The bundle adds two rows to a dsh profile:

- `seomatic-mcp`: DeepSeek's own `@deepseek-ai/dsh-mcp-client`, connected to
  `https://app.seomatic.ai/api/mcp` over streamable HTTP with your API key as
  a Bearer token. The tools appear as `mcp__seomatic__<tool>`.
- `seomatic-guide`: this package. It registers a `seomatic` skill that tells
  the model which tool and action answers which question, what costs credits,
  and that approving changes stays with you.

## Install

From GitHub:

```bash
dsh plugin --profile web add "github:Minh42/seomatic-mcp#path:/plugins/dsh-seomatic"
```

Or from npm, as `dsh-seomatic`:

```bash
dsh plugin --profile web add dsh-seomatic
```

Use another profile name in place of `web` if you boot a different one.

## API key

Create a key at
[app.seomatic.ai/dashboard/settings?tab=ai-agents](https://app.seomatic.ai/dashboard/settings?tab=ai-agents)
(a free account works) and export it before booting:

```bash
export SEOMATIC_API_KEY=smk_live_...
dsh web
```

The key is read from `SEOMATIC_API_KEY` when the profile boots. Without it the
profile still starts, with no SEOmatic tools; set the key and restart to add
them.

## What a key can do

- **Free plan**: every read. Search Console performance and indexing, site
  audits, page checks and stored AI visibility results are free. Live market
  data (keyword volumes, backlinks, competitors) uses the monthly free
  questions.
- **Paid plans**: the key also carries the `agents:act` scope, so the agent
  can stage fixes (`task_manage` `create`, `campaign_manage`). Nothing goes
  live until you approve it; the agent only records a decision you made.

## Change the setup

Override a row by its `id` in your profile's `cordis.patch.yml`. A patch
replaces the whole `config`, so restate every key. For example, to fail the
boot when SEOmatic cannot connect:

```yaml
- id: seomatic-mcp
  config:
    serverName: seomatic
    transport: streamable-http
    url: https://app.seomatic.ai/api/mcp
    headers: !!js "({ Authorization: 'Bearer ' + process.env.SEOMATIC_API_KEY })"
    failOnStartupError: true
```

## Develop

```bash
npm test             # node --test
npm pack --dry-run   # what gets published
```

`tests/catalog-actions.json` lists every SEOmatic tool and action. Regenerate
it from the catalog when tools change; the tests fail if the guide names an
action that does not exist.

## License

MIT
