# SEOmatic for ChatGPT

The plugin package submitted to the ChatGPT plugin directory (Agent Plugins
format): `plugin.json`, `mcp.json` (the hosted server
`https://app.seomatic.ai/api/mcp`, OAuth 2.1 with dynamic client
registration), `assets/logo.png` and the 20 SEOmatic MCP skills (the CLI skill
is left out: ChatGPT has no shell).

`name` is the plugin ID OpenAI assigned in 09 (`app-6a96...`); the upload
is refused with any other name. Build the upload ZIP from inside this folder so `plugin.json` sits at the
archive root:

    cd chatgpt && zip -r ../seomatic-chatgpt.zip . -x '.*'

Skills are copied from `claude/skills/`; rebuild that first with
`scripts/build-claude-plugin.sh` after editing `skills/`.
