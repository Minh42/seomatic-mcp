// Checks the plugin entry and the routing guide it registers.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as plugin from '../src/plugin.js'

// Tool -> actions, generated from the SEOmatic MCP catalog
// (seomatic-v2 content/mcp-catalog.json). Tools with no actions take none.
const catalog = JSON.parse(
  readFileSync(new URL('./catalog-actions.json', import.meta.url), 'utf8'),
)

test('entry is a Cordis plugin that needs ctx.skills', () => {
  assert.equal(plugin.name, 'dsh-seomatic')
  assert.deepEqual(plugin.inject, ['skills'])
  assert.equal(typeof plugin.apply, 'function')
})

test('apply registers exactly one seomatic skill', () => {
  const seen = []
  plugin.apply({ skills: { register: (s) => (seen.push(s), () => {}) } })
  assert.equal(seen.length, 1)
  const [skill] = seen
  assert.equal(skill.name, 'seomatic')
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.ok(skill.description.length > 40 && skill.description.length <= 500)
  assert.equal(skill.resourceBase.kind, 'directory')
  assert.ok(skill.content.startsWith('# SEOmatic'))
})

test('every `tool` `action` pair in the guide exists in the catalog', () => {
  const guide = plugin.readGuide()
  const pairs = [...guide.matchAll(/`([a-z_]+)` `([a-z_]+)`((?:, `[a-z_]+`)*)/g)]
  assert.ok(pairs.length > 10, 'expected a routing table')
  for (const [, tool, first, rest] of pairs) {
    if (!(tool in catalog)) continue
    // A listed name that is itself a tool ("`task_manage` `create`, `campaign_manage`")
    // starts a new item rather than naming another action.
    const actions = [first, ...[...rest.matchAll(/`([a-z_]+)`/g)].map((m) => m[1])]
      .filter((a) => !(a in catalog))
    for (const action of actions) {
      assert.ok(catalog[tool].includes(action), `${tool} has no action ${action}`)
    }
  }
})

test('every tool the guide names exists', () => {
  const guide = plugin.readGuide()
  const named = new Set(
    [...guide.matchAll(/`([a-z]+_[a-z_]+)`/g)]
      .map((m) => m[1])
      .filter((n) => /^(gsc|site|ai|get|run|task|campaign|keyword|backlink|serp)_/.test(n)),
  )
  const actionNames = new Set(Object.values(catalog).flat())
  for (const n of named) {
    assert.ok(n in catalog || actionNames.has(n), `unknown tool or action ${n}`)
  }
})

test('guide keeps approval with the user and staging behind a paid plan', () => {
  const guide = plugin.readGuide()
  assert.match(guide, /agents:act/)
  assert.match(guide, /Approving always stays with the user/)
  assert.doesNotMatch(guide, /\bdecay\b/i)
})
