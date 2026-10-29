# Build the SEOmatic app in Make's web editor

Follow these steps in order. "Paste" always means: open the tab, select all
of the default code, delete it, paste the whole file, then click
**Save changes** (or press Cmd + S). Files are in this folder.

Before you start, create a read-only SEOmatic API key for testing
(SEOmatic > **Settings > AI Agents > API Keys** > **Create key**, leave
**Allow this key to make changes** unticked). Keep it somewhere safe; it is
shown only once.

## 1. Create the app

1. Log in to Make. In the left navigation, click **Custom Apps** (you may
   need to click **More** first).
2. In the upper-right corner, click **+ Create app**.
3. Fill in the form:

   | Field       | Value                                                                                                                 |
   | ----------- | --------------------------------------------------------------------------------------------------------------------- |
   | Name        | `seomatic` (internal, cannot change later; must match `^[a-z][0-9a-z-]+[0-9a-z]$`; if it is taken, use `seomatic-ai`) |
   | Label       | `SEOmatic`                                                                                                            |
   | Description | `Run SEOmatic's SEO tools on your Google Search Console data and use the results in your scenarios.`                  |
   | Theme       | `#603CED`                                                                                                             |
   | Language    | English                                                                                                               |
   | Audience    | Global                                                                                                                |
   | App logo    | `logo-1024.png`                                                                                                       |

   Logo rules from Make: PNG, square, between 512 x 512 and 2048 x 2048 px,
   500 kB at most. The file here is 1024 x 1024 px and 28 kB. Make paints
   transparent areas in the theme color and black areas in white, which is
   why the logo is black on transparent.

4. Click **Save**. The app opens with its tabs across the top.

## 2. Connection

1. Open the **Connections** tab and click **Create connection**.
2. Label: `SEOmatic`. Type: **API key**. Click **Save**.
3. **Parameters** tab: paste `connection/parameters.imljson`.
4. **Communication** tab: paste `connection/communication.imljson`.
5. Save changes.

## 3. Base

1. Open the **Base** tab.
2. **Base** sub-tab: paste `base/base.imljson`.
3. **Common data** sub-tab: paste `base/common-data.json`. This raises the
   request timeout to 90 seconds, because a tool run can take up to 60.
4. Save changes.

## 4. Remote procedure (RPC)

1. Open the **Remote procedures** tab and click **Create a new remote
   procedure** (the button name may differ slightly).
2. Name: `listToolOptions`. Label: `List tool options`. Connection:
   **SEOmatic** (required: Make refuses to open a module whose RPC has no
   connection or a different one). Click **Save**.
3. **Communication** tab: paste `rpc-listToolOptions/communication.imljson`.
4. **Parameters** tab: paste `rpc-listToolOptions/parameters.imljson` (it is
   just `[]`).
5. Save changes.

## 5. Modules

Open the **Modules** tab. Create these three modules (the fourth, Watch
Events, needs the webhook first: see step 5b) with **Create module**.
For each one, use **Template: Blank module** and **Connection: SEOmatic**.

| Type      | Name          | Label              | Description                                                                                                                                                                 |
| --------- | ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action    | `runTool`     | `Run a tool`       | `Runs an SEOmatic tool with the arguments you provide and returns its result. Tools that make changes need an API key allowed to make changes and the Infrastructure plan.` |
| Search    | `listTools`   | `List tools`       | `Returns a list of the SEOmatic tools your API key can run, with each tool's description and arguments.`                                                                    |
| Universal | `makeApiCall` | `Make an API call` | `Sends a custom API call to SEOmatic. You can use this to call endpoints that aren't covered by existing modules.`                                                          |

If Make asks which kind of universal module, pick **REST**.

For each module, fill four tabs from the matching folder
(`module-runTool`, `module-listTools`, `module-makeApiCall`):

| Tab                 | File                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Communication       | `communication.imljson`                                                                  |
| Static parameters   | `static-parameters.imljson` (just `[]`; Make says this tab is only for polling triggers) |
| Mappable parameters | `mappable-parameters.imljson`                                                            |
| Interface           | `interface.imljson`                                                                      |

Leave **Samples** empty. Save changes after each tab.

New modules are hidden. In the **Modules** list, switch each of the three
modules to **visible**.

## 5b. Webhook and the Watch Events trigger

Watch Events is an instant trigger: SEOmatic sends each event to a Make
webhook the moment it happens. Make registers that webhook in SEOmatic by
itself (attach) and removes it when the webhook is deleted (detach).

First the webhook:

1. Open the **Webhooks** tab and click **Create webhook**.
2. Fill in: Label `SEOmatic Events`, Name `seomaticEvents`, Type
   **Dedicated** (attached), Connection **SEOmatic**. Click **Save**.
3. Paste into its tabs:

   | Tab           | File                                           |
   | ------------- | ---------------------------------------------- |
   | Communication | `webhook-seomaticEvents/communication.imljson` |
   | Parameters    | `webhook-seomaticEvents/parameters.imljson`    |
   | Attach        | `webhook-seomaticEvents/attach.imljson`        |
   | Detach        | `webhook-seomaticEvents/detach.imljson`        |

   Leave **Update** and **Required scopes** empty. Save changes.

Then the module:

1. **Modules** tab > **Create module**. Template: **Blank module**.
2. Fill in:

   | Field       | Value                                                                                                                    |
   | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
   | Type        | **Instant trigger**                                                                                                      |
   | Webhook     | `SEOmatic Events` (`seomaticEvents`)                                                                                     |
   | Name        | `watchEvents`                                                                                                            |
   | Label       | `Watch Events`                                                                                                           |
   | Description | `Triggers when an SEOmatic event happens, such as a new Google review, a ranking drop or a task awaiting your approval.` |

3. Paste `module-watchEvents/communication.imljson` (just `{}`),
   `static-parameters.imljson` (just `[]`), `interface.imljson` and
   `samples.imljson` into the matching tabs. Save changes.
4. Switch the module to **visible**.

The event is picked in the webhook, not in the module: when a user clicks
**Create a webhook** in Watch Events, Make shows the **Event** select from
`parameters.imljson`, then calls `POST /v1/triggers/subscribe` with the
webhook URL and that event. The SEOmatic subscription id is kept as
`externalHookId` and sent back to `POST /v1/triggers/unsubscribe` when the
webhook is deleted.

## 6. Test before you publish

1. Create a new scenario. Search for **SEOmatic**; the app shows a
   **Private** tag.
2. Add **SEOmatic > List tools**. Click **Create a connection**, paste the
   test key, click **Save**. Check that the connection name shows your
   workspace name followed by `(read-only)`.
3. Save the scenario. When Make asks to install the app in your
   organization, click **Yes**.
4. Click **Run once**. You should get one bundle per tool.
5. Add **SEOmatic > Run a tool**. Pick `get_search_queries` and set
   **Arguments** to `{"days": 28, "limit": 10}`. Run once. Open the output:
   **Result** should be a collection of fields, not a block of text. If it
   is, the result parsing works.
6. Add **SEOmatic > Make an API call** with URL `/v1/me` and method GET.
   Run once; you should see status code 200 and your workspace in the body.
7. Watch Events: start a new scenario with **SEOmatic > Watch Events**.
   Click **Create a webhook**, pick the connection and the event
   **Site Audit Completed**, and save. Saving without an error means
   SEOmatic accepted the subscription. Click **Run once** in Make, then run
   a deep site audit in SEOmatic (any event you can cause works). The
   bundle shows `Event`, `Event ID` and the filled `Data` fields. Then
   delete the webhook in Make (**Webhooks** in the left menu); Make calls
   the unsubscribe on its own and SEOmatic stops sending.
8. Error check: create a second connection with a made-up key such as
   `smk_live_invalid`. Make should refuse it with
   `[401] Invalid or revoked API key...`.
9. Log check (optional but recommended): open Make DevTool (Chrome
   extension), run the scenario, and confirm the `authorization` header
   shows as sanitized, not as your key.

If step 5 fails with a parsing error, open `runTool` > **Communication** and
replace the `result` line with `"result": "{{parseJSON(body.result)}}"`,
then tell the developer; the fallback logic uses only built-in functions
but could not be run without a Make account.

## 7. Publish and share the invite link

Read this first: **publishing cannot be undone.**

- After publishing you cannot delete the app or make it private again.
- You cannot delete any module, connection, RPC or webhook either. The only
  way out is to rename a component to `[DO NOT USE] ...` and hide it.

So before you click Publish, delete any test modules, connections or RPCs
you added yourself, and make sure the three modules are named and labelled
as above.

1. Open the app and click **Publish** in the upper-right corner.
2. Make generates an **invite link**. Share it with any Make user; they
   install the app into their own organization (EU or US region both work).
3. To control what invitees see, switch individual modules between visible
   and hidden. Hiding a module does not break scenarios already using it.

Changes you save after publishing go live for everyone using the invite link
immediately, so test changes in a separate scenario first.

## 8. Later: asking Make to approve the app for all users

Approval makes SEOmatic appear in Make's app list for every user. Make
checks these before approving (all mandatory):

- Base and connection sanitize the API key and handle errors. (Done.)
- Base and connection use SEOmatic's own production domain. (Done.)
- A wrong key gives an error when creating the connection. (Done.)
- Correct module labels and descriptions. (Done, following Make's naming
  guide.)
- A universal module. (Done: Make an API call.)
- Instant triggers attach and detach their webhook on their own. (Done:
  Watch Events.)
- Correct interfaces for every module. (Done.)
- Search modules and RPCs have a limit. (Done: List tools has **Limit**, the
  RPC stops at 500.)
- Pagination where the API supports it. (The tools list is not paginated.)

What you prepare:

1. Test scenarios that use every module at least once, plus one scenario
   that produces an error on purpose. Run them right before requesting
   review; reviewers only see recent logs. Use a workspace without personal
   or sensitive data.
2. After publishing, a **Review** tab appears. Fill it with the API
   documentation link (`https://seomatic.ai/developers/rest-api`) and the
   links to your test scenarios, then click **Request review**.
3. Make emails a form ("App review: SEOmatic") asking for: your relationship
   to the service, partnership and support contacts, categories, company
   logo, website URL, and trademark and terms confirmations.
4. An automatic review sends a PDF of issues, then a QA engineer reviews by
   email. Track progress in the **Review** tab.

Expect the reviewer to ask for dedicated modules, because a generic "Run a
tool" module is hard to map. Good first candidates, all existing endpoints:

| Suggested module        | Type   | Endpoint                     |
| ----------------------- | ------ | ---------------------------- |
| Ask a question          | Action | `POST /v1/ask`               |
| List top pages          | Search | `GET /v1/gsc/top-pages`      |
| List top queries        | Search | `GET /v1/gsc/top-queries`    |
| List decaying pages     | Search | `GET /v1/gsc/decaying-pages` |
| List queries for a page | Search | `GET /v1/gsc/page-queries`   |
| Get my workspace        | Action | `GET /v1/me`                 |

After approval, changes to the public version (including logo and theme) need Make's approval, and
Common data is locked.

## Sources (Make official documentation)

- Create an app, name rules: `create-your-first-app/create-your-app`
- Connection tabs and API key type: `create-your-first-app/apps-environment/connection`
- Logo rules: `create-your-first-app/app-logo`
- Testing, visibility, publishing, invite link: `create-your-first-app/test-your-app`, `create-your-first-app/app-visibility`
- Static parameters only for triggers: `component-blocks/parameters`
- RPC must share the module's connection: `app-components/rpcs`
- Timeout via Common data: `app-components/base`
- Review checklist and process: `app-review/prerequisites`, `app-review/request-app-review`

All under <https://developers.make.com/custom-apps-documentation/>.
