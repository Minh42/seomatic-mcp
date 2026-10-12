// Checks the profile layer in bundle.yml without booting dsh. The file is
// read as text (no YAML dependency) because the rows are flat and stable.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const layer = readFileSync(new URL('../bundle.yml', import.meta.url), 'utf8')

function field(key) {
  const hit = layer.match(new RegExp(`^\\s+${key}: (.+)$`, 'm'))
  assert.ok(hit, `bundle.yml has no ${key}`)
  return hit[1].trim()
}

// Evaluate the !!js headers expression the way the loader would, against a
// chosen environment.
function headersWith(env) {
  const raw = field('headers')
  assert.match(raw, /^!!js /)
  const expr = JSON.parse(raw.slice('!!js '.length))
  return new Function('process', `return (${expr})`)({ env })
}

test('package declares bundle.yml as its dsh layer and ships it', () => {
  assert.equal(pkg.dsh.bundle.patch, './bundle.yml')
  assert.ok(pkg.files.includes('bundle.yml'))
  assert.ok(pkg.files.includes('guide/'))
})

test('layer mounts this package and one MCP client row', () => {
  assert.match(layer, /- id: seomatic-guide\n\s+name: dsh-seomatic\n/)
  assert.match(layer, /- id: seomatic-mcp\n\s+name: '@deepseek-ai\/dsh-mcp-client'\n/)
})

test('MCP row targets the hosted server over streamable HTTP', () => {
  assert.equal(field('serverName'), 'seomatic')
  assert.equal(field('transport'), 'streamable-http')
  assert.equal(field('url'), 'https://app.seomatic.ai/api/mcp')
})

test('a missing key still boots: no header, startup errors tolerated', () => {
  assert.equal(field('failOnStartupError'), 'false')
  assert.deepEqual(headersWith({}), {})
  assert.deepEqual(headersWith({ SEOMATIC_API_KEY: '' }), {})
})

test('a key becomes a Bearer Authorization header', () => {
  assert.deepEqual(headersWith({ SEOMATIC_API_KEY: 'smk_live_abc' }), {
    Authorization: 'Bearer smk_live_abc',
  })
  assert.deepEqual(headersWith({ SEOMATIC_API_KEY: ' smk_live_abc\n' }), {
    Authorization: 'Bearer smk_live_abc',
  })
})
