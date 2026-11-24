/**
 * Pure parsers for the local tools: robots.txt (RFC 9309) and sitemaps.
 * No network.
 */

/** Crawlers check_crawler_access reports on by default. */
export const CRAWLERS = [
  { bot: 'Googlebot', kind: 'search', owner: 'Google Search' },
  { bot: 'Bingbot', kind: 'search', owner: 'Bing (also feeds ChatGPT search and Copilot)' },
  { bot: 'OAI-SearchBot', kind: 'ai_search', owner: 'ChatGPT search' },
  { bot: 'ChatGPT-User', kind: 'ai_user', owner: 'ChatGPT fetching a page a user asked about' },
  { bot: 'Claude-SearchBot', kind: 'ai_search', owner: 'Claude search' },
  { bot: 'Claude-User', kind: 'ai_user', owner: 'Claude fetching a page a user asked about' },
  { bot: 'PerplexityBot', kind: 'ai_search', owner: 'Perplexity search' },
  { bot: 'Perplexity-User', kind: 'ai_user', owner: 'Perplexity fetching a page a user asked about' },
  { bot: 'Applebot', kind: 'search', owner: 'Apple Spotlight, Siri and Safari' },
  { bot: 'GPTBot', kind: 'ai_training', owner: 'OpenAI model training' },
  { bot: 'ClaudeBot', kind: 'ai_training', owner: 'Anthropic model training' },
  { bot: 'Google-Extended', kind: 'ai_training', owner: 'Gemini training and grounding (not Google Search)' },
  { bot: 'Applebot-Extended', kind: 'ai_training', owner: 'Apple model training' },
  { bot: 'CCBot', kind: 'ai_training', owner: 'Common Crawl (used by many model trainers)' },
];

/** Parse robots.txt into user-agent groups and Sitemap: lines. */
export function parseRobots(txt) {
  const groups = [];
  const sitemaps = [];
  let current = null;
  let lastWasUa = false;
  for (const raw of String(txt ?? '').split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === 'sitemap') {
      if (value) sitemaps.push(value);
      continue; // not part of any group
    }
    if (field === 'user-agent') {
      if (!(lastWasUa && current)) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasUa = true;
      continue;
    }
    lastWasUa = false;
    if (!current) continue;
    if ((field === 'allow' || field === 'disallow') && value) {
      current.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return { groups, sitemaps };
}

function patternRegex(path) {
  const anchored = path.endsWith('$');
  const body = (anchored ? path.slice(0, -1) : path)
    .split('*')
    .map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${body}${anchored ? '$' : ''}`);
}

/**
 * RFC 9309 verdict for one crawler and one path: the crawler obeys only the
 * groups naming it (else the * groups); the longest matching rule wins and
 * Allow wins a tie. /robots.txt itself is always allowed.
 */
export function robotsVerdict(parsed, bot, path) {
  const p = path || '/';
  const lc = bot.toLowerCase();
  const exact = parsed.groups.filter(g => g.agents.includes(lc));
  const applicable = exact.length ? exact : parsed.groups.filter(g => g.agents.includes('*'));
  const group = exact.length ? bot : applicable.length ? '*' : null;
  if (p === '/robots.txt') return { allowed: true, rule: null, group };
  let best = null;
  for (const g of applicable) {
    for (const r of g.rules) {
      if (!patternRegex(r.path).test(p)) continue;
      const len = r.path.length;
      if (!best || len > best.len || (len === best.len && r.allow && !best.allow)) {
        best = { ...r, len };
      }
    }
  }
  return {
    allowed: best ? best.allow : true,
    rule: best ? `${best.allow ? 'Allow' : 'Disallow'}: ${best.path}` : null,
    group,
  };
}

const decodeXml = s =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

/** Parse a sitemap or sitemap index: { kind, entries: [{loc, lastmod}] }. */
export function parseSitemap(xml) {
  const text = String(xml ?? '');
  const isIndex = /<(?:[a-z0-9]+:)?sitemapindex[\s>]/i.test(text);
  const tag = isIndex ? 'sitemap' : 'url';
  const entries = [];
  const re = new RegExp(`<(?:[a-z0-9]+:)?${tag}[\\s>]([\\s\\S]*?)</(?:[a-z0-9]+:)?${tag}>`, 'gi');
  for (const m of text.matchAll(re)) {
    const loc = m[1].match(/<(?:[a-z0-9]+:)?loc>([\s\S]*?)<\/(?:[a-z0-9]+:)?loc>/i);
    if (!loc) continue;
    const lastmod = m[1].match(/<(?:[a-z0-9]+:)?lastmod>([\s\S]*?)<\/(?:[a-z0-9]+:)?lastmod>/i);
    entries.push({ loc: decodeXml(loc[1]), lastmod: lastmod ? decodeXml(lastmod[1]) : null });
  }
  const isSitemap = isIndex || /<(?:[a-z0-9]+:)?urlset[\s>]/i.test(text);
  return { kind: isIndex ? 'index' : isSitemap ? 'urlset' : 'unknown', entries };
}

/** noindex in a meta robots / googlebot tag, or in an X-Robots-Tag header value. */
export function metaRobots(html) {
  const out = [];
  for (const m of String(html ?? '').matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const name = tag.match(/\bname\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (name !== 'robots' && name !== 'googlebot') continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
    out.push({ name, content });
  }
  return out;
}

/** Does a meta robots content value say noindex (or none)? */
export const hasNoindex = value =>
  String(value ?? '')
    .split(',')
    .some(t => /^(noindex|none)$/i.test(t.trim()));

const VALUE_DIRECTIVES = ['unavailable_after', 'max-snippet', 'max-image-preview', 'max-video-preview'];

/**
 * Does an X-Robots-Tag header value say noindex for `bot`? A "<ua>:" prefix
 * scopes the directives after it to that crawler, until the next prefix.
 */
export function xRobotsNoindex(value, bot = 'googlebot') {
  let ua = null;
  for (let token of String(value ?? '').split(',')) {
    token = token.trim();
    const m = token.match(/^([a-z0-9_-]+)\s*:\s*(.*)$/i);
    if (m && !VALUE_DIRECTIVES.includes(m[1].toLowerCase())) {
      ua = m[1].toLowerCase();
      token = m[2].trim();
    }
    if (/^(noindex|none)$/i.test(token) && (ua === null || ua === bot.toLowerCase())) return true;
  }
  return false;
}
