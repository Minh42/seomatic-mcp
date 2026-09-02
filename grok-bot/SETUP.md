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

## What's free vs paid

- Free (no card): connecting, and every analysis question over your own
  Search Console data.
- Paid (from $99/mo): agents applying fixes to your site (CMS edits, titles,
  content), always with your approval and one-click revert.

Full tool reference: https://seomatic.ai/developers/mcp
