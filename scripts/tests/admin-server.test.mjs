import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
const { handler } = await import('../admin-server.mjs');
const server = http.createServer(handler);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
after(() => server.close());
const base = `http://127.0.0.1:${server.address().port}`;
test('admin shell has restrictive headers and no tracking', async () => {
  const response = await fetch(`${base}/admin`); const html = await response.text();
  assert.equal(response.status, 200); assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/); assert.match(response.headers.get('x-robots-tag'), /noindex/); assert.doesNotMatch(html, /googletag|adsbygoogle|bauval/);
});
test('protected endpoint rejects anonymous requests', async () => {
  const response = await fetch(`${base}/api/articles`); assert.equal(response.status, 401);
});
test('login requires json and input validation', async () => {
  assert.equal((await fetch(`${base}/api/login`, { method: 'POST', body: 'x' })).status, 415);
  assert.equal((await fetch(`${base}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
});
test('unknown route does not expose files', async () => {
  assert.equal((await fetch(`${base}/admin/../package.json`)).status, 404);
});
