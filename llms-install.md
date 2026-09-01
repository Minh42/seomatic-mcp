# Agent install guide: SEOmatic MCP server

This is a HOSTED (remote) MCP server. Do not clone, build, or run anything.
Setup is a config entry plus an API key the user must create.

## Steps

1. Ask the user to get a SEOmatic API key:
   - Sign up or log in at https://app.seomatic.ai (a free account works).
   - Go to Settings -> API Keys -> Create key.
   - Copy the key (it starts with `smk_live_`).
   You cannot do this step for the user; wait for them to paste the key.

2. Add this entry to the MCP settings file (for Cline:
   `cline_mcp_settings.json`), replacing the placeholder with the user's key:

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

3. Verify: list the server's tools. You should see tools such as
   `keyword_research`, `backlink_profile`, and `serp_competitors`. The exact
   roster depends on the user's plan and connected data sources; a free key
   shows insight tools only, which is expected.

4. Usage notes for the agent:
   - Every tool is already scoped to the user's connected workspace and site.
     Never ask the user for their domain.
   - Tools that accept a `domain` parameter default to the user's own site
     when it is omitted; pass a domain only to analyze a competitor.
   - Mutating tools STAGE proposals that wait for human approval inside
     SEOmatic. Never claim a change was executed or published.
   - If a call returns a free monthly limit message, stop calling tools and
     relay the message's upgrade or invite link to the user once.

## Troubleshooting

- 401 Unauthorized: the Authorization header is missing or the key is wrong.
  Format: `Authorization: Bearer smk_live_...`
- Empty or few tools: the user's workspace has few data sources connected, or
  the key lacks the acting scope. Both are expected states, not errors.
