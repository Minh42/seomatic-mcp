import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer, normalizeUrl, apiBase, AUDIT_TOOL } from '../lib/server.mjs';

const INDEX = fileURLToPath(new URL('../index.mjs', import.meta.url));

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

const call = (server, method, params, id = 1) => server.onMessage({ jsonrpc: '2.0', id, method, params });

test('initialize echoes a supported protocol version, else the newest', async () => {
  const s = createServer({ env: {}, version: '9.9.9' });
  const a = await call(s, 'initialize', { protocolVersion: '2025-06-18' });
  assert.equal(a.result.protocolVersion, '2025-06-18');
  assert.equal(a.result.serverInfo.version, '9.9.9');
  assert.ok(a.result.capabilities.tools);
  const b = await call(s, 'initialize', { protocolVersion: '1999-01-01' });
  assert.equal(b.result.protocolVersion, '2025-11-25');
});

test('ping, unknown method, notifications, invalid request', async () => {
  const s = createServer({ env: {} });
  assert.deepEqual((await call(s, 'ping')).result, {});
  assert.equal((await call(s, 'nope')).error.code, -32601);
  assert.equal(await s.onMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  assert.equal((await s.onMessage({ id: 3 , method: 'ping'})).error.code, -32600);
});

test('without a key, only audit_page is listed and remote names are refused', async () => {
  let fetched = 0;
  const s = createServer({ env: {}, fetchImpl: async () => (fetched++, json(200, {})) });
  const r = await call(s, 'tools/list');
  assert.deepEqual(r.result.tools.map(t => t.name), ['audit_page']);
  assert.equal(fetched, 0);
  const c = await call(s, 'tools/call', { name: 'gsc_query', arguments: {} });
  assert.equal(c.error.code, -32602);
});

test('with a key, REST tools are mapped with readOnlyHint from acts', async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    return json(200, {
      tools: [
        { name: 'gsc_query', description: 'Search Console', input_schema: { properties: { site: { type: 'string' } } }, acts: false },
        { name: 'publish_fix', description: 'Publishes', input_schema: null, acts: true },
        { name: 'audit_page', description: 'shadow', acts: false },
      ],
    });
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'smk_live_x' }, fetchImpl });
  const tools = (await call(s, 'tools/list')).result.tools;
  assert.deepEqual(tools.map(t => t.name), ['audit_page', 'gsc_query', 'publish_fix']);
  assert.equal(tools[1].inputSchema.type, 'object');
  assert.equal(tools[1].annotations.readOnlyHint, true);
  assert.equal(tools[2].annotations.readOnlyHint, false);
  assert.deepEqual(tools[2].inputSchema, { type: 'object' });
  assert.equal(seen[0].url, 'https://app.seomatic.ai/api/v1/tools');
  assert.equal(seen[0].init.headers.authorization, 'Bearer smk_live_x');
  assert.equal(seen[0].init.redirect, 'error');
});

test('a failing tool list still offers audit_page and logs to stderr only', async () => {
  const logs = [];
  const s = createServer({
    env: { SEOMATIC_API_KEY: 'bad' },
    fetchImpl: async () => json(401, { error: 'Invalid API key', code: 'UNAUTHORIZED' }),
    log: l => logs.push(l),
  });
  const tools = (await call(s, 'tools/list')).result.tools;
  assert.deepEqual(tools.map(t => t.name), ['audit_page']);
  assert.match(logs[0], /Invalid API key/);
});

test('tools/call posts the arguments with an Idempotency-Key and returns the result text', async () => {
  const posts = [];
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json(200, { tools: [{ name: 'gsc_query', acts: false }] });
    posts.push({ url, init });
    return json(200, { tool: 'gsc_query', result: '{"clicks":12}' });
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'k' }, fetchImpl });
  const r = await call(s, 'tools/call', { name: 'gsc_query', arguments: { site: 'a.com' } });
  assert.equal(r.result.content[0].text, '{"clicks":12}');
  assert.equal(posts[0].url, 'https://app.seomatic.ai/api/v1/tools/gsc_query');
  assert.deepEqual(JSON.parse(posts[0].init.body), { site: 'a.com' });
  assert.match(posts[0].init.headers['idempotency-key'], /^[0-9a-f-]{36}$/);
});

test('tools/call waits while the tool is still running, with the same key', async () => {
  const keys = [];
  let n = 0;
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json(200, { tools: [{ name: 'run_audit', acts: false }] });
    keys.push(init.headers['idempotency-key']);
    n++;
    if (n === 1) return json(504, { error: 'still running', code: 'TOOL_TIMEOUT' }, { 'retry-after': '1' });
    if (n === 2) return json(409, { error: 'in progress', code: 'IDEMPOTENCY_IN_PROGRESS' });
    return json(200, { result: { done: true } });
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'k' }, fetchImpl, sleep: async () => {} });
  const r = await call(s, 'tools/call', { name: 'run_audit', arguments: {} });
  assert.equal(r.result.content[0].text, '{"done":true}');
  assert.equal(new Set(keys).size, 1);
  assert.equal(keys.length, 3);
});

test('tools/call returns server errors as isError with the code', async () => {
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json(200, { tools: [{ name: 'publish_fix', acts: true }] });
    return json(402, { error: 'Acting tools over REST need the Infrastructure plan', code: 'REST_ACT_REQUIRES_INFRA', upgrade_url: 'https://app.seomatic.ai/pricing' });
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'k' }, fetchImpl });
  const r = await call(s, 'tools/call', { name: 'publish_fix', arguments: {} });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /REST_ACT_REQUIRES_INFRA/);
  assert.match(r.result.content[0].text, /pricing/);
});

test('tools/call retries a 429 then a transient 503 at most twice', async () => {
  let posts = 0;
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json(200, { tools: [{ name: 't', acts: false }] });
    posts++;
    return posts === 1 ? json(429, {}, { 'retry-after': '1' }) : json(503, {});
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'k' }, fetchImpl, sleep: async () => {} });
  const r = await call(s, 'tools/call', { name: 't', arguments: {} });
  assert.equal(posts, 3);
  assert.equal(r.result.isError, true);
});

test('an unknown tool with a key is refused before any POST', async () => {
  let posts = 0;
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json(200, { tools: [{ name: 'gsc_query', acts: false }] });
    posts++;
    return json(200, {});
  };
  const s = createServer({ env: { SEOMATIC_API_KEY: 'k' }, fetchImpl });
  const r = await call(s, 'tools/call', { name: 'rm_rf', arguments: {} });
  assert.equal(r.error.code, -32602);
  assert.equal(posts, 0);
});

test('arguments must be an object', async () => {
  const s = createServer({ env: {} });
  const r = await call(s, 'tools/call', { name: 'audit_page', arguments: [1] });
  assert.equal(r.error.code, -32602);
});

test('normalizeUrl and apiBase', () => {
  assert.equal(normalizeUrl('example.com').href, 'https://example.com/');
  assert.equal(normalizeUrl('http://a.com/x').href, 'http://a.com/x');
  assert.equal(normalizeUrl('ftp://a.com'), null);
  assert.equal(normalizeUrl('file:///etc/passwd'), null);
  assert.equal(normalizeUrl(''), null);
  assert.equal(normalizeUrl(42), null);
  assert.equal(apiBase({}), 'https://app.seomatic.ai/api/v1');
  assert.equal(apiBase({ SEOMATIC_API_URL: 'http://localhost:3000/api/v1/' }), 'http://localhost:3000/api/v1');
  assert.throws(() => apiBase({ SEOMATIC_API_URL: 'http://evil.example/api/v1' }), /https/);
});

test('audit_page fetches the five probes and scores them', async () => {
  const urls = [];
  const html =
    '<html><head><title>Hi</title><meta name="description" content="A page"><link rel="canonical" href="https://a.com/">' +
    '<script type="application/ld+json">{}</script></head><body><h1>Hi</h1></body></html>';
  const fetchImpl = async url => {
    urls.push(url);
    if (url.endsWith('/robots.txt')) return new Response('User-agent: PerplexityBot\nDisallow: /\n');
    if (url.endsWith('/sitemap.xml')) return new Response('<urlset/>');
    if (url.endsWith('/llms.txt') || url.endsWith('security.txt')) return new Response('nf', { status: 404 });
    return new Response(html);
  };
  const s = createServer({ env: {}, fetchImpl });
  const r = await call(s, 'tools/call', { name: 'audit_page', arguments: { url: 'a.com' } });
  const rep = r.result.structuredContent;
  assert.equal(urls.length, 5);
  assert.ok(urls.includes('https://a.com/.well-known/security.txt'));
  assert.equal(rep.total, 9);
  assert.equal(rep.passed, 8);
  assert.equal(rep.checks.find(c => c.id === 'ai_bots_allowed').ok, false);
  assert.match(r.result.content[0].text, /score 89\/100/);
  assert.deepEqual(Object.keys(AUDIT_TOOL.outputSchema.properties).sort(), Object.keys(rep).sort());
});

test('audit_page reports an unreachable page without throwing', async () => {
  const s = createServer({ env: {}, fetchImpl: async () => { throw new Error('ENOTFOUND'); } });
  const r = await call(s, 'tools/call', { name: 'audit_page', arguments: { url: 'https://nope.invalid' } });
  assert.equal(r.result.structuredContent.checks[0].ok, false);
  assert.match(r.result.content[0].text, /could not be fetched/);
});

test('audit_page refuses a non-http URL as a tool error', async () => {
  const s = createServer({ env: {} });
  const r = await call(s, 'tools/call', { name: 'audit_page', arguments: { url: 'javascript:alert(1)' } });
  assert.equal(r.result.isError, true);
});

test('stdio: initialize, tools/list, a batch and a parse error over a real process', async () => {
  const child = spawn(process.execPath, [INDEX], { env: { PATH: process.env.PATH }, stdio: ['pipe', 'pipe', 'pipe'] });
  let out = '';
  child.stdout.on('data', d => (out += d));
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } } }) + '\n');
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n');
  child.stdin.write(JSON.stringify([{ jsonrpc: '2.0', id: 3, method: 'ping' }, { jsonrpc: '2.0', id: 4, method: 'ping' }]) + '\n');
  child.stdin.write('{not json\n');
  child.stdin.end();
  const code = await new Promise(r => child.on('close', r));
  assert.equal(code, 0);
  const lines = out.trim().split('\n').map(l => JSON.parse(l));
  const byId = Object.fromEntries(lines.filter(l => !Array.isArray(l)).map(l => [l.id, l]));
  assert.equal(byId[1].result.serverInfo.name, 'seomatic');
  assert.equal(byId[1].result.serverInfo.version, '1.0.0');
  assert.deepEqual(byId[2].result.tools.map(t => t.name), ['audit_page']);
  assert.equal(byId[null].error.code, -32700);
  const batch = lines.find(Array.isArray);
  assert.deepEqual(batch.map(b => b.id).sort(), [3, 4]);
});

test('audit_page counts a 200 with no body (sitemap, llms.txt) as reachable', async () => {
  const fetchImpl = async url =>
    url.endsWith('/') ? new Response('<title>x</title>') : new Response(null, { status: 200 });
  const s = createServer({ env: {}, fetchImpl });
  const r = await call(s, 'tools/call', { name: 'audit_page', arguments: { url: 'https://a.com/' } });
  const byId = Object.fromEntries(r.result.structuredContent.checks.map(c => [c.id, c]));
  assert.equal(byId.sitemap.ok, true);
  assert.equal(byId.llms_txt.ok, true);
});
