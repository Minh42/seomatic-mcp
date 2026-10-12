---
name: add-seomatic-tool
description: Add SEOmatic SEO tools to an agent group. The agent reads your Google Search Console data, audits your site, checks your AI visibility and stages fixes you approve, through SEOmatic's hosted MCP server. API key stored in the OneCLI vault.
---

> Contributed by [@Minh42](https://github.com/Minh42) (SEOmatic)

# Add SEOmatic SEO Tools

Connects an agent group to [SEOmatic](https://seomatic.ai)'s hosted MCP server (`https://app.seomatic.ai/api/mcp`, Streamable HTTP). The agent can then answer from your real Google Search Console data (clicks, impressions, CTR, position, indexing), audit up to 30 pages, read your AI visibility results. On a paid SEOmatic plan the key also carries the `agents:act` scope, so the agent can stage SEO fixes; nothing reaches your site until you approve it.

No code changes: this skill only adds an MCP server to a group and a secret to the vault.

## Phase 1: Pre-flight

1. Ask which agent group(s) should get SEOmatic. List them with `ncl groups list` if the user is unsure.
2. Check the group does not already have it: `ncl groups config get --id <group-id>` and look for an MCP server named `seomatic`. If present, skip to Phase 4.
3. Ask the user for a SEOmatic API key (`smk_live_...`). They create one at https://app.seomatic.ai/dashboard/settings?tab=ai-agents (a free account works; no card). Do not echo the key back in chat.

## Phase 2: Store the key in the OneCLI vault

Never pass the key to `ncl` (not in `--url`, not in `--headers`, not in `--env`). The gateway injects it on requests to `app.seomatic.ai`:

```bash
onecli secrets create \
  --name SEOmatic \
  --type api_key \
  --value "$SEOMATIC_API_KEY" \
  --host-pattern app.seomatic.ai \
  --header-name Authorization \
  --value-format 'Bearer {value}'
```

Note the new secret id from the output, then assign it to each chosen group without dropping existing secrets (`set-secrets` replaces the whole list):

```bash
AGENT_ID=$(onecli agents list | jq -r '.data[] | select(.identifier=="<group-id>") | .id')
CURRENT=$(onecli agents secrets --id "$AGENT_ID" | jq -r '[.data[]] | join(",")')
MERGED=$(printf '%s' "$CURRENT,<seomatic-secret-id>" | tr ',' '\n' | sed '/^$/d' | sort -u | paste -sd ',' -)
onecli agents set-secrets --id "$AGENT_ID" --secret-ids "$MERGED"
```

## Phase 3: Add the MCP server and restart

```bash
ncl groups config add-mcp-server --id <group-id> --name seomatic --url https://app.seomatic.ai/api/mcp
ncl groups restart --id <group-id>
```

## Phase 4: Verify

Message the agent in that group:

> List the SEOmatic tools you have, then show my SEOmatic workspaces.

It should list tools such as `gsc_performance`, `site_pages` and `task_manage`. Then try:

> How did my site do on Google over the last 28 days? Give the exact date range.

If the agent says Search Console is not connected, the user connects it once at https://app.seomatic.ai/connect/gsc and asks again.

## Gotchas

- **401 from the server**: the secret is not attached to this group, or the host pattern is not exactly `app.seomatic.ai`. Re-run the assignment step and restart the group.
- **Approvals stay human**: on a paid plan the agent may stage fixes when asked, but it never approves on its own judgment. It only records a decision you state, or you approve in SEOmatic. On a free key the staging actions are locked and say which plan includes them.
- **Free plan**: reads of your own data (Search Console, indexing, site audits, page checks, stored AI visibility results) are free and unlimited. Market-data answers (keyword volumes, competitors, backlinks) use free questions: 5 a month, plus 10 once Search Console is connected, counted once per question however many lookups it needs.
- **Other surfaces**: the same server works in Claude, ChatGPT, Codex, Cursor and OpenClaw. Guide: https://seomatic.ai/ai-assistants/nanoclaw

## Configuration Reference

| Item | Value |
|------|-------|
| MCP server URL | `https://app.seomatic.ai/api/mcp` |
| Transport | Streamable HTTP |
| Auth | `Authorization: Bearer smk_live_...`, injected by the OneCLI vault |
| Key settings | https://app.seomatic.ai/dashboard/settings?tab=ai-agents |
