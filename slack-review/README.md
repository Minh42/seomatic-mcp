# SEOmatic for Slack: install flow, setup and features

Screenshots for the Slack Marketplace review of the SEOmatic app (App ID `A0C48081V09`).

## 1. Install (OAuth)

| Step | Screenshot |
| --- | --- |
| The install page, [seomatic.ai/integrations/slack](https://seomatic.ai/integrations/slack), with **Add to Slack**. Only the owner of the SEOmatic organization can finish the install. | [01-install-page.jpg](01-install-page.jpg) |
| Slack's consent screen (Slack's standard OAuth page). It names the app, the workspace and the 14 bot scopes requested (`chat:write`, `chat:write.public`, `incoming-webhook`, `users:read`, `users:read.email`, `commands`, `links:read`, `links:write`, `channels:read`, `groups:read`, `app_mentions:read`, `im:history`, `assistant:write`, `files:read`), and asks for the channel where SEOmatic posts. To see it yourself, click **Add to Slack** on the install page; it goes through our Direct Install URL `https://app.seomatic.ai/api/integrations/slack/install`. | (no screenshot) |

After **Allow**, Slack redirects to `https://app.seomatic.ai/api/integrations/slack/callback`. SEOmatic saves the connection, and from then on posts decision cards to the chosen channel.

## 2. Features

These images show the app's real Slack messages (same buttons, texts and dialogs), filled with sample data for a fictional agency.

| Feature | Screenshot |
| --- | --- |
| Decision cards: each change an SEO agent stages is posted as a card with Approve, Dismiss and View in SEOmatic. | [03-feature-1.png](03-feature-1.png) |
| Approve in one click: the card updates in place, and its thread records who decided and the outcome. | [04-feature-2.png](04-feature-2.png) |
| Dismiss with a reason: the reason is recorded, and the agent won't propose that fix again for six months. | [05-feature-3.png](05-feature-3.png) |
| Revert from Slack: when a change measures worse, Revert asks for confirmation and restores the page. | [06-feature-4.png](06-feature-4.png) |
| App Home: decisions waiting for each site, the channel each site posts to, and Send a test card. | [07-feature-5.png](07-feature-5.png) |
| Digest mode: one grouped message instead of one card per decision. | [08-feature-6.png](08-feature-6.png) |

## 3. Uninstall

In SEOmatic, go to Settings, then Integrations, then Slack, and click **Disconnect**. This revokes the token at Slack and deletes the stored credentials. Removing the app from the Slack workspace does the same. Details are in [the privacy policy](https://seomatic.ai/privacy), sections 13 to 15.

Contact: contact@seomatic.ai
