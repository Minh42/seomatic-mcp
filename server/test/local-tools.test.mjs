import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRobots, robotsVerdict, parseSitemap, metaRobots, hasNoindex, xRobotsNoindex } from '../lib/parse.mjs';
import { createServer } from '../lib/server.mjs';

const call = (server, name, args) =>
  server.onMessage({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });

/** A fake fetch: routes maps a URL to [status, body, headers] or a function. */
function site(routes) {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    const r = routes[url];
    if (!r) return new Response('not found', { status: 404 });
    if (r === 'throw') throw new TypeError('fetch failed');
    const [status, body, headers = {}] = r;
    return new Response(status >= 300 && status < 400 ? null : body, { status, headers });
  };
  return { fetchImpl, seen };
}
const html = { 'content-type': 'text/html; charset=utf-8' };

test('robots.txt: own group beats *, longest rule wins, Allow wins a tie, wildcards', () => {
  const p = parseRobots(
    [
      'User-agent: *',
      'Disallow: /private',
      'Allow: /private/ok',
      'Disallow: /*.pdf$',
      '',
      'User-agent: GPTBot',
      'User-agent: CCBot',
      'Disallow: /',
      '',
      'User-agent: Googlebot',
      'Disallow: /a',
      'Allow: /a',
      'Sitemap: https://x.com/sitemap.xml # main',
    ].join('\n')
  );
  assert.deepEqual(p.sitemaps, ['https://x.com/sitemap.xml']);
  assert.equal(robotsVerdict(p, 'Bingbot', '/private/x').allowed, false);
  assert.equal(robotsVerdict(p, 'Bingbot', '/private/ok/1').rule, 'Allow: /private/ok');
  assert.equal(robotsVerdict(p, 'Bingbot', '/doc.pdf').allowed, false);
  assert.equal(robotsVerdict(p, 'Bingbot', '/doc.pdf?x').allowed, true);
  assert.deepEqual(robotsVerdict(p, 'gptbot', '/blog'), { allowed: false, rule: 'Disallow: /', group: 'gptbot' });
  assert.equal(robotsVerdict(p, 'CCBot', '/').allowed, false);
  assert.equal(robotsVerdict(p, 'GPTBot', '/robots.txt').allowed, true);
  // Googlebot has its own group, so the * rules do not apply; Allow wins the tie.
  assert.equal(robotsVerdict(p, 'Googlebot', '/private').allowed, true);
  assert.equal(robotsVerdict(p, 'Googlebot', '/a').allowed, true);
  assert.deepEqual(robotsVerdict(parseRobots(''), 'Googlebot', '/'), { allowed: true, rule: null, group: null });
});

test('sitemaps: urlset, index, prefixes, CDATA and entities', () => {
  const u = parseSitemap(
    '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      '<url><loc>https://x.com/a?b=1&amp;c=2</loc><lastmod>2026-11-01</lastmod></url>' +
      '<url><loc><![CDATA[https://x.com/b]]></loc></url></urlset>'
  );
  assert.equal(u.kind, 'urlset');
  assert.deepEqual(u.entries, [
    { loc: 'https://x.com/a?b=1&c=2', lastmod: '2026-11-01' },
    { loc: 'https://x.com/b', lastmod: null },
  ]);
  const i = parseSitemap('<sm:sitemapindex><sm:sitemap><sm:loc>https://x.com/s1.xml</sm:loc></sm:sitemap></sm:sitemapindex>');
  assert.equal(i.kind, 'index');
  assert.equal(i.entries[0].loc, 'https://x.com/s1.xml');
  assert.equal(parseSitemap('<html>nope</html>').kind, 'unknown');
});

test('noindex: meta tags and X-Robots-Tag with crawler scopes', () => {
  assert.deepEqual(metaRobots('<meta name="robots" content="noindex, follow"><meta name="description" content="x">'), [
    { name: 'robots', content: 'noindex, follow' },
  ]);
  assert.equal(hasNoindex('noindex, follow'), true);
  assert.equal(hasNoindex('NONE'), true);
  assert.equal(hasNoindex('index, follow'), false);
  assert.equal(xRobotsNoindex('noindex'), true);
  assert.equal(xRobotsNoindex('otherbot: noindex'), false);
  assert.equal(xRobotsNoindex('otherbot: noindex, googlebot: none'), true);
  assert.equal(xRobotsNoindex('unavailable_after: 25 Jun 2010 15:00:00 PST'), false);
  assert.equal(xRobotsNoindex('max-snippet: 20, noindex'), true);
  assert.equal(xRobotsNoindex(null), false);
});

test('check_indexability follows redirects and finds every blocker', async () => {
  const { fetchImpl, seen } = site({
    'https://x.com/old': [301, '', { location: '/new' }],
    'https://x.com/new': [
      200,
      '<html><head><meta name="robots" content="noindex"><link rel="canonical" href="/other"></head></html>',
      { ...html, 'x-robots-tag': 'noindex' },
    ],
    'https://x.com/robots.txt': [200, 'User-agent: *\nDisallow: /new'],
  });
  const s = createServer({ fetchImpl });
  const r = (await call(s, 'check_indexability', { url: 'x.com/old' })).result;
  const sc = r.structuredContent;
  assert.equal(sc.final_url, 'https://x.com/new');
  assert.deepEqual(sc.redirects, [{ url: 'https://x.com/old', status: 301 }]);
  assert.equal(sc.status, 200);
  assert.equal(sc.indexable, false);
  assert.equal(sc.blockers.length, 3);
  assert.match(sc.blockers.join('\n'), /X-Robots-Tag/);
  assert.match(sc.blockers.join('\n'), /meta name="robots"/);
  assert.match(sc.blockers.join('\n'), /Disallow: \/new/);
  assert.equal(sc.canonical, 'https://x.com/other');
  assert.match(sc.warnings[0], /canonical/);
  assert.match(r.content[0].text, /NOT INDEXABLE/);
  assert.equal(seen[0].init.redirect, 'manual');
});

test('check_indexability: a clean page is indexable; a redirect loop and a 404 are not', async () => {
  const ok = site({
    'https://x.com/': [200, '<head><link rel="canonical" href="https://x.com/"></head>', html],
    'https://x.com/robots.txt': [404, ''],
  });
  const good = (await call(createServer({ fetchImpl: ok.fetchImpl }), 'check_indexability', { url: 'https://x.com/' })).result;
  assert.equal(good.structuredContent.indexable, true);
  assert.deepEqual(good.structuredContent.warnings, []);

  const loop = site({ 'https://x.com/a': [302, '', { location: '/a' }] });
  const l = (await call(createServer({ fetchImpl: loop.fetchImpl }), 'check_indexability', { url: 'https://x.com/a' })).result;
  assert.equal(l.structuredContent.indexable, false);
  assert.match(l.structuredContent.blockers[0], /More than 10 redirects/);

  const gone = site({ 'https://x.com/robots.txt': [404, ''] });
  const g = (await call(createServer({ fetchImpl: gone.fetchImpl }), 'check_indexability', { url: 'https://x.com/gone' })).result;
  assert.equal(g.structuredContent.status, 404);
  assert.match(g.structuredContent.blockers[0], /HTTP 404/);

  const down = site({ 'https://x.com/': 'throw' });
  const d = (await call(createServer({ fetchImpl: down.fetchImpl }), 'check_indexability', { url: 'https://x.com/' })).result;
  assert.equal(d.structuredContent.status, 0);
  assert.match(d.structuredContent.blockers[0], /Could not fetch/);

  const bad = (await call(createServer({ fetchImpl: ok.fetchImpl }), 'check_indexability', { url: 'ftp://x' })).result;
  assert.equal(bad.isError, true);
});

test('check_crawler_access labels each crawler and the deciding rule', async () => {
  const { fetchImpl } = site({
    'https://x.com/robots.txt': [200, 'User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin\nSitemap: https://x.com/s.xml'],
  });
  const s = createServer({ fetchImpl });
  const r = (await call(s, 'check_crawler_access', { url: 'x.com/blog' })).result.structuredContent;
  assert.equal(r.path, '/blog');
  assert.deepEqual(r.sitemaps, ['https://x.com/s.xml']);
  const by = Object.fromEntries(r.crawlers.map(c => [c.bot, c]));
  assert.equal(by.GPTBot.allowed, false);
  assert.equal(by.GPTBot.kind, 'ai_training');
  assert.equal(by.GPTBot.rule, 'Disallow: /');
  assert.equal(by['OAI-SearchBot'].allowed, true);
  assert.equal(by['OAI-SearchBot'].kind, 'ai_search');
  assert.equal(r.crawlers.length, 14);

  const admin = (await call(s, 'check_crawler_access', { url: 'https://x.com/admin', bots: ['perplexitybot', 'MyBot'] })).result;
  assert.deepEqual(
    admin.structuredContent.crawlers.map(c => [c.bot, c.kind, c.allowed]),
    [
      ['PerplexityBot', 'ai_search', false],
      ['MyBot', 'other', false],
    ]
  );
  const bad = (await call(s, 'check_crawler_access', { url: 'x.com', bots: 'GPTBot' })).result;
  assert.equal(bad.isError, true);
});

test('check_crawler_access: a missing robots.txt allows all; a 5xx blocks all', async () => {
  const none = site({});
  const n = (await call(createServer({ fetchImpl: none.fetchImpl }), 'check_crawler_access', { url: 'x.com' })).result.structuredContent;
  assert.equal(n.robots_status, 404);
  assert.ok(n.crawlers.every(c => c.allowed));
  assert.match(n.note, /no rules/);

  const err = site({ 'https://x.com/robots.txt': [503, 'down'] });
  const e = (await call(createServer({ fetchImpl: err.fetchImpl }), 'check_crawler_access', { url: 'x.com' })).result.structuredContent;
  assert.ok(e.crawlers.every(c => !c.allowed));
  assert.match(e.note, /503/);
});

test('check_sitemap reads robots.txt sitemaps, follows an index and samples URLs', async () => {
  const { fetchImpl } = site({
    'https://x.com/robots.txt': [200, 'Sitemap: https://x.com/index.xml'],
    'https://x.com/index.xml': [
      200,
      '<sitemapindex><sitemap><loc>https://x.com/a.xml</loc></sitemap><sitemap><loc>https://x.com/b.xml</loc></sitemap></sitemapindex>',
    ],
    'https://x.com/a.xml': [
      200,
      '<urlset><url><loc>https://x.com/1</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://x.com/2</loc><lastmod>2026-11-20</lastmod></url></urlset>',
    ],
    'https://x.com/b.xml': [200, '<urlset><url><loc>https://other.com/3</loc></url></urlset>'],
    'https://x.com/1': [200, 'ok'],
    'https://x.com/2': [301, '', { location: '/2/' }],
  });
  const r = (await call(createServer({ fetchImpl }), 'check_sitemap', { url: 'x.com', sample: 3 })).result;
  const sc = r.structuredContent;
  assert.deepEqual(
    sc.sitemaps.map(s => [s.url, s.kind, s.entries]),
    [
      ['https://x.com/index.xml', 'index', 2],
      ['https://x.com/a.xml', 'urlset', 2],
      ['https://x.com/b.xml', 'urlset', 1],
    ]
  );
  assert.equal(sc.url_count, 3);
  assert.equal(sc.newest_lastmod, '2026-11-20');
  assert.equal(sc.other_host_urls, 1);
  assert.deepEqual(
    sc.sample.map(s => [s.url, s.status, s.ok]),
    [
      ['https://x.com/1', 200, true],
      ['https://x.com/2', 301, false],
      ['https://other.com/3', 404, false],
    ]
  );
  assert.equal(sc.problems.length, 3);
  assert.match(r.content[0].text, /3 URLs in 3 sitemap file/);
});

test('check_sitemap: falls back to /sitemap.xml and reports a missing one', async () => {
  const { fetchImpl, seen } = site({ 'https://x.com/robots.txt': [200, 'User-agent: *\nAllow: /'] });
  const sc = (await call(createServer({ fetchImpl }), 'check_sitemap', { url: 'https://x.com' })).result.structuredContent;
  assert.ok(seen.some(s => s.url === 'https://x.com/sitemap.xml'));
  assert.equal(sc.url_count, 0);
  assert.match(sc.problems[0], /HTTP 404/);

  const direct = site({ 'https://x.com/sitemap_index.xml': [200, '<urlset></urlset>'] });
  const d = (await call(createServer({ fetchImpl: direct.fetchImpl }), 'check_sitemap', { url: 'https://x.com/sitemap_index.xml', sample: 0 }))
    .result.structuredContent;
  assert.equal(direct.seen[0].url, 'https://x.com/sitemap_index.xml');
  assert.deepEqual(d.problems, ['The sitemap lists no URLs.']);
});

test('every local tool has an output schema and read-only annotations', async () => {
  const s = createServer({ fetchImpl: async () => new Response('', { status: 404 }) });
  const { tools } = (await s.onMessage({ jsonrpc: '2.0', id: 1, method: 'tools/list' })).result;
  for (const t of tools) {
    assert.equal(t.outputSchema.type, 'object', t.name);
    assert.equal(t.annotations.readOnlyHint, true, t.name);
    assert.equal(t.inputSchema.additionalProperties, false, t.name);
    assert.ok(t.description.length > 200, t.name);
  }
});

test('check_sitemap survives a malformed Sitemap: line', async () => {
  const { fetchImpl, seen } = site({
    'https://x.com/robots.txt': [200, 'Sitemap: http://[bad\nSitemap: /rel.xml'],
    'https://x.com/rel.xml': [200, '<urlset><url><loc>https://x.com/1</loc></url></urlset>'],
  });
  const r = (await call(createServer({ fetchImpl }), 'check_sitemap', { url: 'x.com', sample: 0 })).result;
  assert.equal(r.isError, undefined);
  assert.ok(seen.some(s => s.url === 'https://x.com/rel.xml'));
  assert.equal(r.structuredContent.url_count, 1);
});
