# SEOmatic for Make (custom app)

Import these components into a Make custom app (make.com > Custom apps >
Create a new app), one file per tab:

| File | Where it goes |
| --- | --- |
| base.imljson | Base |
| connection.imljson | Connections > new API Key connection |
| rpc-list-tools.imljson | RPCs > new RPC named `listTools` |
| module-run-tool.imljson | Modules > new Action module "Run Tool" |

The module's tool dropdown loads LIVE from your API key via the RPC, so free
keys see the free insight tools and paid keys also see agent actions
(always human-approval-gated in SEOmatic).

App metadata suggestions: name "SEOmatic", theme #4f46e5, description "AI SEO
agents over your own Google Search Console data. You approve every change."

Free plan covers analysis with a monthly quota; agent actions are paid
(from $99/month). https://seomatic.ai/pricing
