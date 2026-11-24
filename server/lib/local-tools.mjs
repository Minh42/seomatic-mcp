/**
 * Local tools that run on this machine with no SEOmatic account:
 * check_indexability, check_crawler_access, check_sitemap. (audit_page lives
 * in server.mjs.) They only read public URLs.
 */

import { CRAWLERS, parseRobots, robotsVerdict, parseSitemap, metaRobots, hasNoindex, xRobotsNoindex } from './parse.mjs';
import { readHead } from './checks.mjs';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_HOPS = 10;
const TIMEOUT_MS = 15_000;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

export const INDEXABILITY_TOOL = {
  name: 'check_indexability',
  title: 'Can Google index this URL?',
  description:
    'Answers whether Google can index one URL, and if not, exactly why. Runs locally with no account. It follows the redirect ' +
    'chain hop by hop (up to 10), then checks the final URL for: HTTP status, an X-Robots-Tag noindex header, a meta robots or ' +
    'googlebot noindex tag, a robots.txt rule blocking Googlebot from that path, and a canonical pointing to a different URL ' +
    '(a hint, not a block). Use it when a page is missing from Google, after a migration, or before asking Search Console why. ' +
    'It sees the HTML the server sends; content added later by JavaScript is not read. For the overall page basics use audit_page; ' +
    'for other crawlers use check_crawler_access.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The URL to check, e.g. https://example.com/blog/post. A bare domain is read as https://.' },
    },
    required: ['url'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The URL asked about.' },
      final_url: { type: 'string', description: 'Where the redirects ended.' },
      status: { type: 'integer', description: 'HTTP status of the final URL (0 = could not fetch).' },
      indexable: { type: 'boolean', description: 'true when nothing found blocks indexing.' },
      blockers: { type: 'array', items: { type: 'string' }, description: 'Each reason Google cannot index it.' },
      warnings: { type: 'array', items: { type: 'string' }, description: 'Things that may stop it ranking as this URL.' },
      redirects: {
        type: 'array',
        items: {
          type: 'object',
          properties: { url: { type: 'string' }, status: { type: 'integer' } },
          required: ['url', 'status'],
        },
        description: 'Each hop before the final URL.',
      },
      canonical: { type: ['string', 'null'], description: 'The canonical URL the page declares, resolved.' },
      robots_rule: { type: ['string', 'null'], description: 'The robots.txt rule that applies to Googlebot, if any.' },
    },
    required: ['url', 'final_url', 'status', 'indexable', 'blockers', 'warnings', 'redirects'],
  },
  annotations: { title: 'Can Google index this URL?', ...READ_ONLY },
};

export const CRAWLER_TOOL = {
  name: 'check_crawler_access',
  title: 'Which search and AI crawlers may read this URL?',
  description:
    'Reads the site\'s robots.txt and reports, for one path, whether each crawler may fetch it and which rule decides, using ' +
    'the standard robots.txt rules (RFC 9309: the crawler\'s own group, else *; longest rule wins; Allow wins a tie). Runs ' +
    'locally with no account. By default it covers search crawlers (Googlebot, Bingbot, Applebot), AI search and AI user ' +
    'agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) and AI training ' +
    'crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot), each labelled by kind. Blocking a training ' +
    'crawler does not remove a site from AI search answers; blocking an AI search crawler does. It reads robots.txt only: a ' +
    'firewall or CDN bot rule can still block a crawler robots.txt allows. Use check_indexability for the full Google picture.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'A page or a whole site, e.g. https://example.com/pricing or example.com (checks /).' },
      bots: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 30,
        description: 'Optional crawler names (user-agent product tokens) to check instead of the default list, e.g. ["GPTBot"].',
      },
    },
    required: ['url'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      robots_url: { type: 'string' },
      robots_status: { type: 'integer', description: 'HTTP status of robots.txt; 4xx means everything is allowed.' },
      path: { type: 'string' },
      crawlers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            bot: { type: 'string' },
            kind: { type: 'string', description: 'search, ai_search, ai_user, ai_training or other.' },
            allowed: { type: 'boolean' },
            rule: { type: ['string', 'null'], description: 'The deciding rule, null when no rule matches.' },
            group: { type: ['string', 'null'], description: 'The user-agent group used: the bot\'s own, *, or none.' },
          },
          required: ['bot', 'kind', 'allowed'],
        },
      },
      sitemaps: { type: 'array', items: { type: 'string' }, description: 'Sitemap: lines in robots.txt.' },
      note: { type: 'string' },
    },
    required: ['robots_url', 'robots_status', 'path', 'crawlers', 'sitemaps'],
  },
  annotations: { title: 'Which crawlers may read this URL?', ...READ_ONLY },
};

export const SITEMAP_TOOL = {
  name: 'check_sitemap',
  title: 'Check a site\'s XML sitemap',
  description:
    'Finds and reads a site\'s XML sitemap (the Sitemap: lines in robots.txt, else /sitemap.xml), follows a sitemap index into ' +
    'up to 5 child sitemaps, and reports how many URLs it lists, the newest lastmod date, and URLs on another host. Then it ' +
    'fetches a sample of the listed URLs and flags any that do not answer 200 (redirects, 404s, errors): a sitemap should only ' +
    'list live, canonical pages. Runs locally with no account. Use it after a launch or migration, or when Search Console ' +
    'reports sitemap or "discovered, not indexed" problems.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The site (e.g. example.com) or a sitemap URL (e.g. https://example.com/sitemap_index.xml).',
      },
      sample: {
        type: 'integer',
        minimum: 0,
        maximum: 20,
        default: 5,
        description: 'How many listed URLs to fetch and check (0-20, default 5).',
      },
    },
    required: ['url'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      sitemaps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            status: { type: 'integer' },
            kind: { type: 'string', description: 'index, urlset or unknown.' },
            entries: { type: 'integer' },
          },
          required: ['url', 'status', 'kind', 'entries'],
        },
      },
      url_count: { type: 'integer', description: 'URLs listed in the sitemaps read.' },
      newest_lastmod: { type: ['string', 'null'] },
      other_host_urls: { type: 'integer', description: 'Listed URLs on a different host than the sitemap.' },
      sample: {
        type: 'array',
        items: {
          type: 'object',
          properties: { url: { type: 'string' }, status: { type: 'integer' }, ok: { type: 'boolean' } },
          required: ['url', 'status', 'ok'],
        },
      },
      problems: { type: 'array', items: { type: 'string' } },
    },
    required: ['sitemaps', 'url_count', 'newest_lastmod', 'other_host_urls', 'sample', 'problems'],
  },
  annotations: { title: 'Check a site\'s XML sitemap', ...READ_ONLY },
};

export const LOCAL_TOOLS = [INDEXABILITY_TOOL, CRAWLER_TOOL, SITEMAP_TOOL];

/** Read at most maxBytes of a response body as text. */
export async function readCapped(res, maxBytes = MAX_BYTES) {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
    size += value.byteLength;
  }
  reader.cancel().catch(() => {});
  return Buffer.concat(chunks).subarray(0, maxBytes).toString('utf8');
}

const discard = res => res.body?.cancel?.()?.catch?.(() => {});

export function makeLocalTools({ fetchImpl, ua, normalizeUrl }) {
  const get = (url, redirect = 'follow') =>
    fetchImpl(url, { redirect, signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': ua } });

  async function getText(url) {
    try {
      const res = await get(url);
      return { status: res.status, url: res.url || url, text: await readCapped(res) };
    } catch {
      return { status: 0, url, text: '' };
    }
  }

  async function robotsFor(origin) {
    const r = await getText(`${origin}/robots.txt`);
    // 4xx: no rules, everything allowed. 5xx / unreachable: Google treats the site as fully disallowed.
    return { ...r, parsed: r.status >= 200 && r.status < 300 ? parseRobots(r.text) : parseRobots('') };
  }

  const pathOf = u => `${u.pathname}${u.search}`;

  async function checkIndexability(args) {
    const start = normalizeUrl(args?.url);
    if (!start) return { error: 'url must be an http(s) URL or a domain, e.g. https://example.com' };
    const redirects = [];
    const blockers = [];
    const warnings = [];
    let current = start;
    let res = null;
    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      try {
        res = await get(current.href, 'manual');
      } catch (e) {
        res = null;
        blockers.push(`Could not fetch ${current.href} (${e.name === 'TimeoutError' ? 'timed out' : 'network error'}).`);
        break;
      }
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        discard(res);
        redirects.push({ url: current.href, status: res.status });
        let next;
        try {
          next = new URL(loc, current);
        } catch {
          blockers.push(`Redirect from ${current.href} has an invalid Location header.`);
          res = null;
          break;
        }
        if (!['http:', 'https:'].includes(next.protocol)) {
          blockers.push(`Redirect leaves the web (${next.protocol}).`);
          res = null;
          break;
        }
        if (hop === MAX_HOPS) {
          blockers.push(`More than ${MAX_HOPS} redirects; Google stops following long chains.`);
          res = null;
          break;
        }
        current = next;
        continue;
      }
      break;
    }
    const status = res ? res.status : 0;
    let canonical = null;
    let robotsRule = null;
    if (res) {
      if (status !== 200) blockers.push(`The final URL answers HTTP ${status}; only 200 pages are indexed.`);
      const xr = res.headers.get('x-robots-tag');
      if (xRobotsNoindex(xr)) blockers.push(`X-Robots-Tag header says noindex (${xr}).`);
      const type = res.headers.get('content-type') || '';
      const html = /html|xml/i.test(type) || !type ? await readCapped(res) : (discard(res), '');
      for (const m of metaRobots(html)) {
        if (hasNoindex(m.content)) blockers.push(`<meta name="${m.name}" content="${m.content}"> says noindex.`);
      }
      const head = readHead(html);
      if (head.canonical) {
        try {
          canonical = new URL(head.canonical, current).href;
          if (canonical !== current.href) {
            warnings.push(`The canonical points to ${canonical}, so Google will usually index that URL instead of this one.`);
          }
        } catch {
          warnings.push(`The canonical "${head.canonical}" is not a valid URL.`);
        }
      }
      if (redirects.length > 1) warnings.push(`${redirects.length} redirects before the page; link to the final URL directly.`);
      const robots = await robotsFor(current.origin);
      if (robots.status >= 500 || robots.status === 0) {
        warnings.push(`robots.txt answered ${robots.status || 'nothing'}; Google pauses crawling a site whose robots.txt errors.`);
      }
      const v = robotsVerdict(robots.parsed, 'Googlebot', pathOf(current));
      robotsRule = v.rule;
      if (!v.allowed) {
        blockers.push(`robots.txt blocks Googlebot from ${pathOf(current)} (${v.rule}). Google may still list the URL without content.`);
      }
    }
    return {
      url: start.href,
      final_url: current.href,
      status,
      indexable: blockers.length === 0,
      blockers,
      warnings,
      redirects,
      canonical,
      robots_rule: robotsRule,
    };
  }

  async function checkCrawlerAccess(args) {
    const target = normalizeUrl(args?.url);
    if (!target) return { error: 'url must be an http(s) URL or a domain, e.g. https://example.com' };
    if (args.bots !== undefined && (!Array.isArray(args.bots) || args.bots.some(b => typeof b !== 'string' || !b.trim()))) {
      return { error: 'bots must be a list of crawler names, e.g. ["GPTBot", "PerplexityBot"]' };
    }
    const list = args.bots?.length
      ? args.bots.slice(0, 30).map(b => CRAWLERS.find(c => c.bot.toLowerCase() === b.trim().toLowerCase()) ?? { bot: b.trim(), kind: 'other' })
      : CRAWLERS;
    const robots = await robotsFor(target.origin);
    const path = pathOf(target);
    let note;
    if (robots.status === 0) note = 'robots.txt could not be fetched; crawlers retry and may treat the site as blocked until it answers.';
    else if (robots.status >= 500) note = `robots.txt answered ${robots.status}; Google treats a robots.txt server error as "disallow everything".`;
    else if (robots.status >= 400) note = `robots.txt answered ${robots.status}: no rules, every crawler may read everything.`;
    const blockAll = robots.status === 0 || robots.status >= 500;
    return {
      robots_url: `${target.origin}/robots.txt`,
      robots_status: robots.status,
      path,
      crawlers: list.map(c => {
        if (blockAll) return { bot: c.bot, kind: c.kind, allowed: false, rule: null, group: null };
        const v = robotsVerdict(robots.parsed, c.bot, path);
        return { bot: c.bot, kind: c.kind, allowed: v.allowed, rule: v.rule, group: v.group };
      }),
      sitemaps: robots.parsed.sitemaps,
      ...(note ? { note } : {}),
    };
  }

  async function checkSitemap(args) {
    const target = normalizeUrl(args?.url);
    if (!target) return { error: 'url must be an http(s) URL or a domain, e.g. https://example.com' };
    const sampleSize = Math.max(0, Math.min(20, Number.isInteger(args.sample) ? args.sample : 5));
    const problems = [];
    let starts;
    if (/\.xml(\.gz)?$/i.test(target.pathname) || /sitemap/i.test(target.pathname)) {
      starts = [target.href];
    } else {
      const robots = await robotsFor(target.origin);
      starts = robots.parsed.sitemaps
        .map(u => {
          try {
            return new URL(u, target.origin).href;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .slice(0, 5);
      if (!starts.length) starts = [`${target.origin}/sitemap.xml`];
    }
    const sitemaps = [];
    const urls = [];
    const queue = [...starts];
    const seen = new Set();
    let childBudget = 5;
    while (queue.length && sitemaps.length < 10) {
      const u = queue.shift();
      if (seen.has(u)) continue;
      seen.add(u);
      if (/\.gz$/i.test(u)) {
        problems.push(`${u} is gzipped; this tool reads plain XML only.`);
        continue;
      }
      const r = await getText(u);
      const parsed = r.status === 200 ? parseSitemap(r.text) : { kind: 'unknown', entries: [] };
      sitemaps.push({ url: u, status: r.status, kind: parsed.kind, entries: parsed.entries.length });
      if (r.status !== 200) problems.push(`${u} answered HTTP ${r.status || 'nothing'}.`);
      else if (parsed.kind === 'unknown') problems.push(`${u} is not an XML sitemap.`);
      if (parsed.kind === 'index') {
        for (const e of parsed.entries) {
          if (childBudget <= 0) break;
          queue.push(e.loc);
          childBudget--;
        }
        if (parsed.entries.length > 5) problems.push(`Index lists ${parsed.entries.length} sitemaps; only the first 5 were read.`);
      } else {
        urls.push(...parsed.entries);
      }
    }
    const host = target.hostname.replace(/^www\./, '');
    let otherHost = 0;
    let newest = null;
    for (const e of urls) {
      try {
        if (new URL(e.loc).hostname.replace(/^www\./, '') !== host) otherHost++;
      } catch {
        otherHost++;
      }
      if (e.lastmod && !Number.isNaN(Date.parse(e.lastmod)) && (!newest || Date.parse(e.lastmod) > Date.parse(newest))) {
        newest = e.lastmod;
      }
    }
    if (otherHost) problems.push(`${otherHost} listed URLs are on another host; Google ignores them unless that host is verified for this sitemap.`);
    if (sitemaps.some(s => s.status === 200) && urls.length === 0 && !problems.length) problems.push('The sitemap lists no URLs.');
    const step = urls.length > sampleSize ? urls.length / sampleSize : 1;
    const picks = [];
    for (let i = 0; i < Math.min(sampleSize, urls.length); i++) picks.push(urls[Math.floor(i * step)].loc);
    const sample = await Promise.all(
      picks.map(async u => {
        try {
          const res = await get(u, 'manual');
          discard(res);
          return { url: u, status: res.status, ok: res.status === 200 };
        } catch {
          return { url: u, status: 0, ok: false };
        }
      })
    );
    for (const s of sample) {
      if (!s.ok) {
        problems.push(
          s.status >= 300 && s.status < 400
            ? `${s.url} redirects (${s.status}); list the final URL instead.`
            : `${s.url} answered ${s.status || 'nothing'}; remove it or fix the page.`
        );
      }
    }
    return { sitemaps, url_count: urls.length, newest_lastmod: newest, other_host_urls: otherHost, sample, problems };
  }

  const toText = {
    check_indexability: r =>
      `${r.url}${r.final_url !== r.url ? ` -> ${r.final_url}` : ''}: ${r.indexable ? 'INDEXABLE' : 'NOT INDEXABLE'} (HTTP ${r.status})` +
      r.blockers.map(b => `\nBLOCKER: ${b}`).join('') +
      r.warnings.map(w => `\nWARNING: ${w}`).join(''),
    check_crawler_access: r =>
      `${r.robots_url} (HTTP ${r.robots_status}), path ${r.path}` +
      (r.note ? `\n${r.note}` : '') +
      r.crawlers.map(c => `\n${c.allowed ? 'ALLOWED' : 'BLOCKED'} ${c.bot} [${c.kind}]${c.rule ? ` by ${c.rule} (group ${c.group})` : ''}`).join(''),
    check_sitemap: r =>
      `${r.url_count} URLs in ${r.sitemaps.length} sitemap file(s)${r.newest_lastmod ? `, newest lastmod ${r.newest_lastmod}` : ''}` +
      r.sitemaps.map(s => `\n${s.url}: HTTP ${s.status}, ${s.kind}, ${s.entries} entries`).join('') +
      (r.sample.length ? `\nSample: ${r.sample.filter(s => s.ok).length}/${r.sample.length} answer 200` : '') +
      (r.problems.length ? r.problems.map(p => `\nPROBLEM: ${p}`).join('') : '\nNo problems found.'),
  };

  const handlers = {
    check_indexability: checkIndexability,
    check_crawler_access: checkCrawlerAccess,
    check_sitemap: checkSitemap,
  };

  /** Run a local tool; returns an MCP tool result, or null if the name is not local. */
  return async function callLocal(name, args) {
    const h = handlers[name];
    if (!h) return null;
    const r = await h(args ?? {});
    if (r.error) return { content: [{ type: 'text', text: r.error }], isError: true };
    return { content: [{ type: 'text', text: toText[name](r) }], structuredContent: r };
  };
}
