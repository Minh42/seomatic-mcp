# SEOmatic for ChatGPT

The plugin package submitted to the ChatGPT plugin directory (Agent Plugins
format): `plugin.json`, `mcp.json` (the hosted server
`https://app.seomatic.ai/api/mcp`, OAuth 2.1 with dynamic client
registration), `assets/logo.png` and 7 skills written for the tools ChatGPT sees (the
server lists 19 one-action tools to ChatGPT, see `mcp-projections.ts` in the
app: `get_search_queries`, `list_seo_tasks`, `decide_seo_task` ...), not the
grouped tools the other skills name.

Build the upload ZIP from inside this folder so `plugin.json` sits at the
archive root:

    cd chatgpt && zip -r ../seomatic-chatgpt.zip . -x '.*'

Edit these skills here; they are not built from `skills/`.
