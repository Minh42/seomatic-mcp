# SEOmatic for Make (custom app)

A Make custom app that connects scenarios to your SEOmatic workspace through
the SEOmatic REST API (`https://app.seomatic.ai/api/v1`). It lets a scenario
run any SEOmatic tool your API key is allowed to use (Search Console queries,
top pages, audits, AI visibility, and more) and use the result in later
modules.

## Modules

| Module           | Type            | What it does                                                                                                                            |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Run a tool       | Action          | Runs one SEOmatic tool with the arguments you give it. The tool's result comes back already parsed, so you can map its fields directly. |
| List tools       | Search          | Lists the tools your API key can run, with each tool's description, whether it makes changes, and the arguments it accepts.             |
| Make an API call | Universal       | Calls any SEOmatic REST endpoint, for example `GET /v1/me`. It can only reach `https://app.seomatic.ai/api`.                            |
| Watch Events     | Instant trigger | Starts the scenario the moment an SEOmatic event happens, for example a new Google review or a ranking drop. See the event list below.  |

## Files and where each one goes

Every file maps to one tab in Make's web app editor. Paste the whole file
into that tab, replacing the default code. For the click-by-click version,
see `MAKE-UI-GUIDE.md`.

| File                                           | Make component                            | Tab                 |
| ---------------------------------------------- | ----------------------------------------- | ------------------- |
| `base/base.imljson`                            | Base                                      | Base                |
| `base/common-data.json`                        | Base                                      | Common data         |
| `connection/communication.imljson`             | Connections > SEOmatic (type: API key)    | Communication       |
| `connection/parameters.imljson`                | Connections > SEOmatic                    | Parameters          |
| `rpc-listToolOptions/communication.imljson`    | Remote procedures > `listToolOptions`     | Communication       |
| `rpc-listToolOptions/parameters.imljson`       | Remote procedures > `listToolOptions`     | Parameters          |
| `module-runTool/communication.imljson`         | Modules > `runTool` (Action)              | Communication       |
| `module-runTool/static-parameters.imljson`     | Modules > `runTool`                       | Static parameters   |
| `module-runTool/mappable-parameters.imljson`   | Modules > `runTool`                       | Mappable parameters |
| `module-runTool/interface.imljson`             | Modules > `runTool`                       | Interface           |
| `module-listTools/*`                           | Modules > `listTools` (Search)            | Same four tabs      |
| `module-makeApiCall/*`                         | Modules > `makeApiCall` (Universal)       | Same four tabs      |
| `webhook-seomaticEvents/communication.imljson` | Webhooks > `seomaticEvents`               | Communication       |
| `webhook-seomaticEvents/parameters.imljson`    | Webhooks > `seomaticEvents`               | Parameters          |
| `webhook-seomaticEvents/attach.imljson`        | Webhooks > `seomaticEvents`               | Attach              |
| `webhook-seomaticEvents/detach.imljson`        | Webhooks > `seomaticEvents`               | Detach              |
| `module-watchEvents/communication.imljson`     | Modules > `watchEvents` (Instant trigger) | Communication       |
| `module-watchEvents/static-parameters.imljson` | Modules > `watchEvents`                   | Static parameters   |
| `module-watchEvents/interface.imljson`         | Modules > `watchEvents`                   | Interface           |
| `module-watchEvents/samples.imljson`           | Modules > `watchEvents`                   | Samples             |
| `logo-1024.png`                                | App settings                              | App logo            |

All files are plain JSON with no comments. Each one passes `JSON.parse`.

## Getting an API key

1. Sign in at [app.seomatic.ai](https://app.seomatic.ai).
2. Open **Settings > AI Agents** and scroll to **API Keys**.
3. Name the key (for example "Make"), then click **Create key**.
4. Copy the key right away. It starts with `smk_` and is shown only once.

New keys are **read-only**. They read your data and run analysis tools. To
let a scenario run tools that change your site, tick **Allow this key to make
changes** when you create the key. That option needs a live subscription or
trial. Edits made this way are staged in SEOmatic for your approval. Use a
read-only key unless the scenario really needs to make changes.

## Setting up the connection in a scenario

1. Add any SEOmatic module to a scenario and click **Create a connection**.
2. Paste the API key and click **Save**.
3. Make checks the key against `GET /v1/me`. If the key is wrong or revoked,
   you get `[401] Invalid or revoked API key` and the connection is not saved.
4. The connection list then shows your workspace name, with `(read-only)` or
   `(can make changes)` after it, so you can tell your keys apart.

## Plans and limits

- **The SEOmatic Make integration needs the Infrastructure plan**, like
  SEOmatic's Zapier and n8n integrations. Without it, the connection test fails
  with `[402] The Make integration needs the Infrastructure plan.` and an
  upgrade link.
- **Tools that make changes** also need a key created with **Allow this key to
  make changes**. A read-only key never sees these tools in the list at all.
- **Workflows never spend prepaid scans.** If the workspace's AI credits
  cannot cover a new AI visibility scan, the scan is refused instead.
- **Rate limits are per key:** 60 tool runs per minute and 1,000 per hour.
  Other endpoints allow 500 requests per minute. When you hit a limit, Make
  treats the `429` response as a rate-limit error and retries the scenario
  later on its own, so the scenario is not switched off.
- **Make switches a scenario off after 3 failed runs in a row.** A plan or
  billing refusal (`402`/`403`) is reported as a configuration error and a
  revoked key (`401`) as a connection error, each with SEOmatic's message and
  the link to fix it. After fixing the plan, billing or key, turn the scenario
  back on in Make: it does not restart on its own.
- **Run a tool is safe to retry.** Each run sends an `Idempotency-Key` built
  from the scenario, the execution, the tool and its arguments, so a repeat of
  the same call collects the first run's answer instead of running the tool
  twice.
- A single tool run can take up to 60 seconds. The app raises Make's request
  timeout to 90 seconds so slow tools can finish.

Plans and prices: [seomatic.ai/pricing](https://seomatic.ai/pricing).

## Using Watch Events

1. Add **SEOmatic > Watch Events** as the first module of a scenario.
2. Click **Create a webhook**, pick the connection, and pick one **Event**.
   When you save, Make subscribes to that event in SEOmatic
   (`POST /v1/triggers/subscribe`). Deleting the webhook unsubscribes it
   (`POST /v1/triggers/unsubscribe`). To listen to several events, add one
   Watch Events webhook per event.
3. Each event arrives as one bundle: `Event`, `Event ID` (the same on a
   retried delivery, so you can skip repeats), `Workspace ID`, `Created At`,
   `Cursor` and `Data`. **Data** lists the fields of every event; only the
   fields of the event you picked are filled.

The connection's API key needs the **admin** role in the workspace (a
subscription is a webhook) and the Infrastructure plan, like Zapier
triggers. A workspace can hold 25 webhooks and triggers in total.

| Event                         | Value                              | When it fires                                                              |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| Page Published                | `page.published`                   | A page went live on your site.                                             |
| Page Publish Failed           | `page.publish_failed`              | SEOmatic could not publish a page to your site.                            |
| Task Awaiting Approval        | `task.awaiting_approval`           | The SEO agent staged work that needs your decision.                        |
| Task Approved or Dismissed    | `task.decided`                     | Someone approved or dismissed an agent task.                               |
| Task Completed                | `task.completed`                   | An SEO agent task finished running.                                        |
| Change Live on Your Site      | `task.live`                        | SEOmatic saw an agent change on your live page.                            |
| Campaign Completed            | `campaign.completed`               | Every task in a campaign has settled.                                      |
| AI Visibility Scan Completed  | `ai_visibility.scan_completed`     | An AI visibility scan finished.                                            |
| Site Audit Completed          | `site_audit.completed`             | A deep site audit finished.                                                |
| Ranking Dropped               | `ranking.dropped`                  | A search that brings you clicks, or a search you track, slipped in Google. |
| Ranking Page Changed          | `ranking.page_changed`             | Google shows a different page of your site for a search you track.         |
| New Google Review             | `review.received`                  | A new review arrived on your Google Business Profile.                      |
| Weekly Business Profile Calls | `business_profile.calls_report`    | Every Monday: last week's calls, direction requests and website clicks.    |
| Business Profile Update Due   | `business_profile.update_due`      | This week's Business Profile update has not been drafted yet.              |
| Possible Duplicate Listing    | `business_profile.duplicate_found` | Another Google Maps listing looks like your business.                      |

The Zapier app offers the same 15 events on the same terms (the Infrastructure
plan). The n8n SEOmatic Trigger lists them too from version 2.1.0; it registers
a regular SEOmatic webhook and also needs the Infrastructure plan.
Field details for each event: <https://seomatic.ai/developers/rest-api>.

## Using Run a tool

1. Pick a tool in **Tool**. Tools that change your site are marked
   `(makes changes)`.
2. In **Arguments**, enter the tool's arguments as a JSON object, for example
   `{"days": 28, "limit": 50}`. Leave it empty to use the tool's defaults.
   To see which arguments a tool accepts, run **List tools** and look at
   `Input schema`, or read the
   [REST API documentation](https://seomatic.ai/developers/rest-api).
3. The output has three fields:
   - `Tool`: the tool that ran.
   - `Result`: the tool's output, parsed into fields you can map. Run the
     module once and Make offers every field of the result for mapping.
   - `Raw result`: the same output as JSON text, handy for passing to an AI
     module or storing as is.

## Security

- The API key is stored in a `password` field. Make masks it when you type it
  and does not show it when you edit the connection.
- The `Authorization` header is removed from Make's logs in the Base, in the
  connection check, and in Make an API call. The per-workspace crawler URL
  that `GET /v1/me` returns is removed from logs too.
- Every request goes over HTTPS to `app.seomatic.ai`. Make an API call only
  accepts paths like `/v1/...` and cannot send your key to another host.
- The tool name is URL-encoded before it goes into the request path, and the
  server only runs tools that are on your key's list.
- Error messages show SEOmatic's error text and code. They never include
  your key.

## Links

- REST API documentation: <https://seomatic.ai/developers/rest-api>
- Developer hub: <https://seomatic.ai/developers>
- Pricing: <https://seomatic.ai/pricing>
- Make custom apps documentation: <https://developers.make.com/custom-apps-documentation>
