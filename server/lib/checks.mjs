/**
 * Pure audit checks, copied from the seomatic CLI (cli/lib/checks.mjs in the app repo).
 * Everything here is parse-and-score with NO network: the bin fetches,
 * these functions judge. Kept pure so they are unit-testable and so the
 * CLI stays zero-dependency.
 */

/** AI SEARCH crawlers: blocking one removes the site from that engine's
 * answers (OpenAI: OAI-SearchBot controls ChatGPT search). */
export const AI_BOTS = ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'];

/** Training-only crawlers: blocking them is a content-licensing choice, not
 * a visibility defect, so they are reported but never fail the check. */
export const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended'];

/**
 * Very small robots.txt reader: is `bot` (or *) disallowed from "/"?
 * Deliberately conservative - only a blanket `Disallow: /` under a
 * matching user-agent group counts as blocked.
 */
export function robotsBlocks(robotsTxt, bot) {
  // Real robots semantics: a crawler obeys ONLY its most specific
  // matching group - an exact `User-agent: <bot>` group wins outright
  // over `User-agent: *`. Parse into groups first, then judge the one
  // group that applies (first pass had the sequential-override bug the
  // unit test caught: a later * group cleared a specific bot's block).
  const groups = [];
  let current = null;
  let lastWasUa = false;
  for (const raw of robotsTxt.split('\n')) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const ua = line.match(/^user-agent:\s*(.+)$/i);
    if (ua) {
      const agent = ua[1].trim().toLowerCase();
      if (lastWasUa && current) {
        current.agents.push(agent); // consecutive UA lines share one group
      } else {
        current = { agents: [agent], rules: [] };
        groups.push(current);
      }
      lastWasUa = true;
      continue;
    }
    lastWasUa = false;
    if (current) current.rules.push(line);
  }

  const botLc = bot.toLowerCase();
  const exact = groups.filter(g => g.agents.includes(botLc));
  const star = groups.filter(g => g.agents.includes('*'));
  const applicable = exact.length > 0 ? exact : star;

  let blocked = false;
  for (const g of applicable) {
    for (const rule of g.rules) {
      if (/^disallow:\s*\/\s*$/i.test(rule)) blocked = true;
      if (/^allow:\s*\/\s*$/i.test(rule)) blocked = false;
    }
  }
  return blocked;
}

/** Extract simple head facts from an HTML string without a parser. */
export function readHead(html) {
  const grab = re => {
    const m = html.match(re);
    return m ? m[1].trim() : null;
  };
  return {
    title: grab(/<title[^>]*>([^<]*)<\/title>/i),
    metaDescription: grab(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ),
    canonical: grab(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
    ),
    hasJsonLd: /<script[^>]+application\/ld\+json/i.test(html),
    hasH1: /<h1[\s>]/i.test(html),
  };
}

/**
 * Turn raw probe results into the scored report.
 * probes: { home: {status, ms, html}, robots: {status, body},
 *           sitemap: {status}, llms: {status}, security: {status} }
 */
export function buildReport(url, probes) {
  const checks = [];
  // scored=false: shown for information, never counted in the score
  // (llms.txt has no measured effect on AI citations; security.txt is not
  // an SEO signal).
  const add = (id, ok, detail, scored = true) =>
    checks.push({ id, ok, detail, ...(scored ? {} : { scored: false }) });

  const home = probes.home ?? { status: 0, ms: 0, html: '' };
  add(
    'reachable',
    home.status >= 200 && home.status < 400,
    `HTTP ${home.status} in ${home.ms}ms`
  );

  const head = readHead(home.html ?? '');
  add('title', Boolean(head.title), head.title ?? 'missing <title>');
  add(
    'meta_description',
    Boolean(head.metaDescription),
    head.metaDescription ? `${head.metaDescription.slice(0, 60)}...` : 'missing'
  );
  add('canonical', Boolean(head.canonical), head.canonical ?? 'missing');
  add('h1', head.hasH1, head.hasH1 ? 'present' : 'missing');
  add(
    'json_ld',
    head.hasJsonLd,
    head.hasJsonLd ? 'structured data found' : 'no JSON-LD'
  );

  const robotsOk = (probes.robots?.status ?? 0) === 200;
  add('robots_txt', robotsOk, robotsOk ? 'present' : 'missing');
  if (robotsOk) {
    const blockedBots = AI_BOTS.filter(b =>
      robotsBlocks(probes.robots.body, b)
    );
    const blockedTraining = TRAINING_BOTS.filter(b =>
      robotsBlocks(probes.robots.body, b)
    );
    const trainingNote =
      blockedTraining.length > 0
        ? ` (training only, does not affect AI search: ${blockedTraining.join(', ')} blocked)`
        : '';
    add(
      'ai_bots_allowed',
      blockedBots.length === 0,
      (blockedBots.length === 0
        ? 'all AI search bots allowed'
        : `BLOCKED: ${blockedBots.join(', ')}`) + trainingNote
    );
  }
  add(
    'sitemap',
    (probes.sitemap?.status ?? 0) === 200,
    `sitemap.xml HTTP ${probes.sitemap?.status ?? 0}`
  );
  add(
    'llms_txt',
    (probes.llms?.status ?? 0) === 200,
    `llms.txt HTTP ${probes.llms?.status ?? 0} (optional, not scored)`,
    false
  );
  add(
    'security_txt',
    (probes.security?.status ?? 0) === 200,
    `.well-known/security.txt HTTP ${probes.security?.status ?? 0} (not scored)`,
    false
  );

  const scored = checks.filter(c => c.scored !== false);
  const passed = scored.filter(c => c.ok).length;
  const score = Math.round((passed / scored.length) * 100);
  return { url, score, passed, total: scored.length, checks };
}
