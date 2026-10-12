// dsh-seomatic: contributes the `seomatic` skill to DeepSeek Harness.
//
// The MCP connection itself is a plain @deepseek-ai/dsh-mcp-client row in
// ../bundle.yml; this module only teaches the model which SEOmatic tool to
// reach for. The skill text lives in ../guide/seomatic.md so it can be read
// and edited as Markdown.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const guideDir = new URL('../guide/', import.meta.url)

export const SKILL_NAME = 'seomatic'

export const SKILL_DESCRIPTION =
  "Answer SEO questions about the user's own site with SEOmatic's MCP tools " +
  '(mcp__seomatic__*): Google Search Console clicks, queries and indexing, ' +
  'site audits, AI search visibility, keyword and backlink research, and ' +
  'fixes staged for the user to approve.'

/** Read the skill body shipped in guide/seomatic.md. */
export function readGuide() {
  return readFileSync(new URL('seomatic.md', guideDir), 'utf8')
}

/** The runtime skill handed to ctx.skills.register(). */
export function seomaticSkill() {
  return {
    name: SKILL_NAME,
    description: SKILL_DESCRIPTION,
    source: 'runtime',
    resourceBase: { kind: 'directory', path: fileURLToPath(guideDir) },
    content: readGuide(),
  }
}

export const name = 'dsh-seomatic'
export const inject = ['skills']

export function apply(ctx) {
  // register() returns a disposer; Cordis also cleans it up on unload.
  ctx.skills.register(seomaticSkill())
}
