# Connect SEOmatic to your Grok Bot (2 minutes)

Grok Bot templates don't copy custom MCP servers, so this is the one manual
step after adding the template.

## Fastest path: let the Bot do it

Paste this into your Bot:

```
Set up the SEOmatic MCP server for me. Instructions:
https://seomatic.ai/developers/mcp
Server URL: https://app.seomatic.ai/api/mcp (Streamable HTTP, OAuth).
If you can edit MCP config or run commands in this client, do the setup
yourself. Otherwise, give me the exact steps for this client.
```

## Manual path

1. In Grok Bot, add a custom MCP server:
   - URL: `https://app.seomatic.ai/api/mcp`
   - Transport: Streamable HTTP
   - Auth: OAuth (the Bot will open a SEOmatic login/consent page)
2. Sign in (or create a free account - no card) and approve access for the
   workspace you want the Bot to work on.
3. Done. Ask: "Which of my pages are closest to page 1?" to confirm it works.

## If your Grok Bot only accepts a token (no OAuth screen)

The server also speaks plain Bearer auth:
1. In SEOmatic: Dashboard > Settings > API Keys > create a key.
2. Add the MCP server with URL `https://app.seomatic.ai/api/mcp` and your
   key as the Bearer token.

## Three field-tested gotchas

1. Add SEOmatic as your ONLY new custom server, then verify, then add others.
   A known beta bug lets one hung custom server break tool discovery for
   every connector (DeadlineExceeded errors).
2. After connecting, ask the Bot: "What tools do you have from this server?"
   You should see the SEOmatic tools listed. Most setup failures are caught
   right here.
3. Run one job manually before enabling routines: ask "Which of my pages are
   closest to page 1?" and check the answer cites your real Search Console
   numbers.

## What's free vs paid

- Free (no card): connecting, and every analysis question over your own
  Search Console data.
- Paid (from $99/mo): agents applying fixes to your site (CMS edits, titles,
  content), always with your approval and one-click revert.

Full tool reference: https://seomatic.ai/developers/mcp
