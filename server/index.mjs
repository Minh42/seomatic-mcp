#!/usr/bin/env node
/**
 * SEOmatic MCP server over stdio. Newline-delimited JSON-RPC 2.0 on
 * stdin/stdout; logs go to stderr only.
 *
 *   node server/index.mjs                      # audit_page only, no account
 *   SEOMATIC_API_KEY=smk_live_... node server/index.mjs   # + your SEOmatic tools
 */

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './lib/server.mjs';

const version = (() => {
  try {
    const pkg = join(dirname(fileURLToPath(import.meta.url)), 'package.json');
    return JSON.parse(readFileSync(pkg, 'utf8')).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
})();

const log = line => process.stderr.write(`${line}\n`);
const server = createServer({ version, log });
const send = obj => process.stdout.write(`${JSON.stringify(obj)}\n`);

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
let pending = 0;
let closed = false;
const maybeExit = () => {
  if (closed && pending === 0) process.exit(0);
};

rl.on('line', async line => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  const batch = Array.isArray(msg) ? msg : [msg];
  pending++;
  try {
    const replies = (await Promise.all(batch.map(m => server.onMessage(m)))).filter(Boolean);
    if (Array.isArray(msg)) {
      if (replies.length) send(replies);
    } else if (replies[0]) {
      send(replies[0]);
    }
  } finally {
    pending--;
    maybeExit();
  }
});
rl.on('close', () => {
  closed = true;
  maybeExit();
});
process.stdout.on('error', e => {
  if (e.code === 'EPIPE') process.exit(0);
  throw e;
});
