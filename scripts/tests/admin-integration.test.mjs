// Local protocol stub only; does not replace an integration test against Supabase.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
const uid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
let role = 'editor', changed = null;
const stub = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  res.setHeader('Content-Type', 'application/json');
  if (u.pathname === '/auth/v1/user') return res.end(JSON.stringify({ id: uid }));
  if (u.pathname === '/rest/v1/admin_profiles') return res.end(JSON.stringify([{ role }]));
  if (u.pathname === '/rest/v1/official_sources' && req.method === 'GET') return res.end(JSON.stringify([{ id: 1, name: 'مصدر تجريبي', is_verified: true, verified_on: '2020-01-01', review_due: '2099-01-01' }]));
  if (['/rest/v1/official_sources','/rest/v1/date_events'].includes(u.pathname) && ['POST','PATCH'].includes(req.method)) {
    let raw = ''; for await (const chunk of req) raw += chunk;
    changed = { query: u.searchParams, body: JSON.parse(raw) };
    return res.end(JSON.stringify({ id: 1 }));
  }
  if (u.pathname === '/rest/v1/source_revisions') return res.end(JSON.stringify([{ id: 9, source_id: 1, snapshot: { name:'مصدر قديم', organization:'جهة', url:'https://example.invalid/old', is_verified:true, verified_on:'2026-01-01', review_due:'2099-01-01' } }]));
  if (u.pathname === '/rest/v1/event_revisions') return res.end(JSON.stringify([{ id: 7, event_id: 1, snapshot: { title:'نسخة موعد', program:'برنامج', audience:'', region:'', event_date:'2027-05-07', source_id:1, date_status:'official', publication_status:'published', slug:'old-slug' } }]));
  if (u.pathname === '/rest/v1/article_revisions') return res.end(JSON.stringify([{ id: 7, article_id: 1, changed_at: '2026-01-01T00:00:00Z', snapshot: { title: 'نسخة', description: '', body: [{ type: 'text', text: 'نص' }] } }]));
  if (u.pathname === '/rest/v1/articles' && req.method === 'GET') { changed = { query: u.searchParams }; return res.end(JSON.stringify([{ id: 1, author_id: uid }])); }
  if (u.pathname === '/rest/v1/articles' && req.method === 'PATCH') {
    let raw = ''; for await (const chunk of req) raw += chunk;
    changed = { query: u.searchParams, body: JSON.parse(raw) };
    if (u.searchParams.get('updated_at') === 'eq.2026-01-01T00:00:00Z') return res.end(JSON.stringify({ id: 1 }));
    return res.end('null');
  }
  res.statusCode = 404; res.end('{}');
});
await new Promise(resolve => stub.listen(0, '127.0.0.1', resolve));
process.env.SUPABASE_URL = `http://127.0.0.1:${stub.address().port}`;
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';
const { handler } = await import('../admin-server.mjs?integration');
const server = http.createServer(handler);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
after(() => { server.close(); stub.close(); });
const base = `http://127.0.0.1:${server.address().port}`;
const headers = { authorization: 'Bearer test-token', 'content-type': 'application/json' };
const post = (path, input) => fetch(base + path, { method: 'POST', headers, body: JSON.stringify(input) });
const article = { id: 1, slug: 'test', title: 'عنوان', description: '', text: 'نص', status: 'draft', updated_at: '2026-01-01T00:00:00Z' };
test('writer cannot publish even if the client submits it', async () => {
  role = 'writer'; const r = await post('/api/articles', { ...article, status: 'published', published_at: '2027-01-01T00:00:00Z' }); assert.equal(r.status, 403); role = 'editor';
});
test('updates require a version and send optimistic lock to database', async () => {
  let r = await post('/api/articles', { ...article, updated_at: undefined }); assert.equal(r.status, 400);
  r = await post('/api/articles', article); assert.equal(r.status, 200); assert.equal(changed.query.get('updated_at'), 'eq.2026-01-01T00:00:00Z');
  r = await post('/api/articles', { ...article, updated_at: '2026-01-02T00:00:00Z' }); assert.equal(r.status, 409);
});
test('restore preserves slug but returns article to draft', async () => {
  const r = await post('/api/restore', { revision_id: 7, updated_at: article.updated_at }); assert.equal(r.status, 200); assert.deepEqual(Object.keys(changed.body).sort(), ['body', 'description', 'published_at', 'status', 'title']); assert.equal(changed.body.status, 'draft'); assert.equal(changed.body.published_at, null); assert.equal(changed.query.get('updated_at'), `eq.${article.updated_at}`);
});
test('history requires a positive article id', async () => {
  const r = await fetch(base + '/api/revisions?article=0', { headers }); assert.equal(r.status, 400);
});

test('writer cannot modify sources or dates', async () => {
  role = 'writer';
  assert.equal((await post('/api/sources', {})).status, 403);
  assert.equal((await post('/api/events', {})).status, 403);
  role = 'editor';
});
test('sources require HTTPS and real review dates', async () => {
  const source = { name:'مصدر', organization:'جهة', url:'https://example.invalid', is_verified:true, verified_on:'2026-01-01', review_due:'2099-01-01' };
  assert.equal((await post('/api/sources', {...source, url:'javascript:alert(1)'})).status, 400);
  assert.equal((await post('/api/sources', {...source, verified_on:'2026-02-30'})).status, 400);
  assert.equal((await post('/api/sources', source)).status, 200);
});
test('publication requires official status and a currently verified source', async () => {
  const event = { title:'اختبار', slug:'test-event', program:'اختبار', event_date:'2027-05-07', audience:'', region:'', date_status:'official', publication_status:'published', source_id:1, verified_on:'2026-01-01', review_due:'2099-01-01' };
  assert.equal((await post('/api/events', {...event, date_status:'estimated'})).status, 400);
  assert.equal((await post('/api/events', {...event, event_date:'2027-02-29'})).status, 400);
  assert.equal((await post('/api/events', {...event, review_due:'2026-01-02'})).status, 400);
  assert.equal((await post('/api/events', event)).status, 200);
  assert.equal(changed.body.publication_status, 'published');
});

test('event restoration resets review and publishing without changing slug', async () => {
  const response = await post('/api/event-restore', { revision_id:7, updated_at:'2026-01-01T00:00:00Z' });
  assert.equal(response.status, 200);
  assert.equal(changed.body.publication_status, 'draft');
  assert.equal(changed.body.date_status, 'pending');
  assert.equal(changed.body.verified_on, null);
  assert.equal(changed.body.review_due, null);
  assert.equal(changed.body.slug, undefined);
  assert.equal(changed.query.get('updated_at'), 'eq.2026-01-01T00:00:00Z');
});
test('writer cannot restore an event version', async () => {
  role = 'writer';
  const response = await post('/api/event-restore', { revision_id:7, updated_at:'2026-01-01T00:00:00Z' });
  assert.equal(response.status, 403); role = 'editor';
});

test('restoring a source clears approval and requires the current version', async () => {
  const result = await post('/api/source-restore', { revision_id:9, updated_at:'2026-01-01T00:00:00Z' });
  assert.equal(result.status, 200);
  assert.equal(changed.body.is_verified, false);
  assert.equal(changed.body.verified_on, null);
  assert.equal(changed.body.review_due, null);
  assert.equal(changed.query.get('updated_at'), 'eq.2026-01-01T00:00:00Z');
});
test('writer cannot restore source history', async () => {
  role = 'writer';
  const result = await post('/api/source-restore', { revision_id:9, updated_at:'2026-01-01T00:00:00Z' });
  assert.equal(result.status, 403); role = 'editor';
});

test('writer article filter is applied in database query before limiting rows', async () => {
  role = 'writer';
  const response = await fetch(base + '/api/articles', { headers });
  assert.equal(response.status, 200);
  assert.equal(changed.query.get('author_id'), `eq.${uid}`);
  assert.equal(changed.query.get('limit'), '100');
  assert.equal((await response.json()).articles.length, 1);
  role = 'editor';
});
