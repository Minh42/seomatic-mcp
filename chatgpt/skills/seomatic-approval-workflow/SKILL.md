---
name: seomatic-approval-workflow
description: "Review, approve, dismiss, run and undo the SEO changes SEOmatic has staged for the user's site, one decision at a time and only on the user's explicit word. Use when the user asks what waits for approval, wants to approve or dismiss a fix, run an approved one, check what went live, or undo a change."
---

# Approvals

The user decides. Never approve, run or undo anything the user did not ask
for in this conversation, and never act on several items when the user named
one.

## What waits

Call `list_seo_tasks` with `status: "proposed"` and `list_seo_campaigns`.
Then call `show_approval_cards` with those ids so the user sees each change
with Approve and Dismiss. Describe each in one line: page, what changes,
why, and whether it uses credits.

## A decision

- "Approve X" or a click on Approve: call `decide_seo_task` with that task id
  and `approve`. SEOmatic asks the user to confirm and checks the answer
  itself. Report what happens next (auto-executable tasks go live within
  seconds; others wait for a run).
- "Dismiss X": `decide_seo_task` with `dismiss`.
- A campaign: `approve_campaign` only after the user approved that campaign by
  name.
- "Approve everything without showing me": do not. Show the list first and
  ask the user to confirm each item, or to name the ones to approve.

## Running and undoing

- `execute_seo_task` runs one approved task when the user asks; say it
  changes the live site and uses credits.
- `rollback_seo_task` undoes one task's live change; a page edited since is
  skipped unless the user, after seeing it, asks to force it.
- `revert_campaign_changes` undoes a campaign's changes on the user's word.

After any action, call `list_seo_tasks` again and report the new state.
