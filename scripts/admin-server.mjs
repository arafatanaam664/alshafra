// Standalone DEVELOPMENT server. Never expose directly to the public internet.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = join(process.cwd(), 'admin');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const port = Number(process.env.ADMIN_PORT || 4174);
const authOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'", 'X-Robots-Tag': 'noindex, nofollow' };
const buckets = new Map();
function send(res, status, data) { res.writeHead(status, { ...headers, 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
function limit(req) {
  // Only a development safeguard; a distributed, trusted-proxy-aware limiter is required for deployment.
  const id = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (buckets.get(id) || []).filter(t => now - t < 60000);
  recent.push(now); buckets.set(id, recent);
  if (buckets.size > 10000) buckets.clear();
  return recent.length <= 60;
}
async function body(req) {
  let text = '';
  for await (const chunk of req) { text += chunk; if (text.length > 70000) throw new Error('too large'); }
  return JSON.parse(text || '{}');
}
function client(token) {
  return createClient(url, key, { auth: authOptions, ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}) });
}
function validArticle(x) {
  return x && typeof x.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.slug) && x.slug.length <= 100 && typeof x.title === 'string' && x.title.trim().length > 0 && x.title.length <= 200 && typeof x.description === 'string' && x.description.length <= 500 && typeof x.text === 'string' && x.text.length <= 30000 && ['draft', 'review', 'published', 'archived'].includes(x.status) && (x.status !== 'published' || (typeof x.published_at === 'string' && Number.isFinite(Date.parse(x.published_at))));
}
function nonempty(value, max = 200) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
function optionalText(value, max = 200) { return typeof value === 'string' && value.length <= max; }
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function riyadhToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts();
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
function validVersion(x) {
  return x.id === undefined || (Number.isSafeInteger(x.id) && x.id > 0 && typeof x.updated_at === 'string' && Number.isFinite(Date.parse(x.updated_at)));
}
function validHttps(value) {
  try { const parsed = new URL(value); return typeof value === 'string' && value.length <= 2048 && parsed.protocol === 'https:' && !parsed.username && !parsed.password && !/\s/.test(value); } catch { return false; }
}
function validReview(x) {
  return (x.verified_on === null && x.review_due === null) || (validDate(x.verified_on) && validDate(x.review_due) && x.verified_on <= x.review_due && x.verified_on <= riyadhToday());
}
export async function handler(req, res) {
  const parsedUrl = new URL(req.url, 'http://local');
  const path = parsedUrl.pathname;
  if (req.method === 'GET' && ['/', '/admin', '/admin/', '/admin.js', '/admin.css'].includes(path)) {
    const file = path === '/admin.js' ? 'admin.js' : path === '/admin.css' ? 'admin.css' : 'index.html';
    try { const content = await readFile(join(root, file)); res.writeHead(200, { ...headers, 'Content-Type': file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8' }); res.end(content); } catch { send(res, 500, { error: 'تعذر تحميل الواجهة.' }); } return;
  }
  if (!path.startsWith('/api/')) return send(res, 404, { error: 'غير موجود.' });
  if (!limit(req)) return send(res, 429, { error: 'محاولات كثيرة، حاول لاحقاً.' });
  if (!url || !key) return send(res, 503, { error: 'لم يُضبط اتصال Supabase لبيئة التطوير.' });
  if (req.method !== 'GET' && !req.headers['content-type']?.startsWith('application/json')) return send(res, 415, { error: 'طلب غير صالح.' });
  try {
    if (path === '/api/login' && req.method === 'POST') {
      const input = await body(req);
      if (typeof input.email !== 'string' || typeof input.password !== 'string' || input.email.length > 254 || input.password.length > 1024) return send(res, 400, { error: 'بيانات الدخول غير صالحة.' });
      const { data, error } = await client().auth.signInWithPassword({ email: input.email, password: input.password });
      if (error || !data.session) return send(res, 401, { error: 'تعذر تسجيل الدخول.' });
      const scoped = client(data.session.access_token);
      const { data: profile } = await scoped.from('admin_profiles').select('role').eq('user_id', data.user.id).maybeSingle();
      if (!profile) return send(res, 403, { error: 'الحساب غير مخول بإدارة المحتوى.' });
      return send(res, 200, { token: data.session.access_token, role: profile.role });
    }
    const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token) return send(res, 401, { error: 'سجّل الدخول أولاً.' });
    const db = client(token);
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user) return send(res, 401, { error: 'انتهت الجلسة؛ سجّل الدخول مجدداً.' });
    const { data: profile, error: roleError } = await db.from('admin_profiles').select('role').eq('user_id', auth.user.id).maybeSingle();
    if (roleError || !profile || !['admin', 'editor', 'writer'].includes(profile.role)) return send(res, 403, { error: 'الحساب غير مخول.' });
    if (['/api/sources', '/api/events'].includes(path) && req.method === 'GET') {
      const table = path === '/api/sources' ? 'official_sources' : 'date_events';
      const { data, error } = await db.from(table).select('*').order('updated_at', { ascending: false }).limit(100);
      if (error) return send(res, 500, { error: 'تعذر تحميل السجلات.' });
      return send(res, 200, { records: data });
    }
    if (['/api/sources', '/api/events'].includes(path) && req.method === 'POST') {
      if (!['admin', 'editor'].includes(profile.role)) return send(res, 403, { error: 'تعديل المصادر والمواعيد متاح للمحرر والمدير فقط.' });
      const input = await body(req);
      if (!input || !validVersion(input) || !validReview(input)) return send(res, 400, { error: 'تحقق من إصدار السجل وتاريخ المراجعة.' });
      const source = path === '/api/sources';
      let values;
      if (source) {
        if (!nonempty(input.name) || !nonempty(input.organization) || !validHttps(input.url) || typeof input.is_verified !== 'boolean' || (input.is_verified && !input.verified_on)) return send(res, 400, { error: 'تحقق من اسم المصدر والرابط الآمن وبيانات المراجعة.' });
        values = { name: input.name.trim(), organization: input.organization.trim(), url: input.url, is_verified: input.is_verified, verified_on: input.verified_on, review_due: input.review_due };
      } else {
        if (!nonempty(input.title) || !nonempty(input.program) || !nonempty(input.slug, 100) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || !optionalText(input.audience) || !optionalText(input.region) || (input.event_date !== null && !validDate(input.event_date)) || (input.source_id !== null && (!Number.isSafeInteger(input.source_id) || input.source_id < 1)) || !['official','usual','estimated','pending','expired'].includes(input.date_status) || !['draft','published','archived'].includes(input.publication_status)) return send(res, 400, { error: 'تحقق من حقول الموعد والتاريخ.' });
        if (input.publication_status === 'published') {
          if (input.date_status !== 'official' || !input.event_date || !input.source_id || !input.verified_on || input.review_due < riyadhToday()) return send(res, 400, { error: 'يتطلب النشر موعداً رسمياً ومصدراً ومراجعة سارية.' });
          const { data: official, error } = await db.from('official_sources').select('id,is_verified,verified_on,review_due').eq('id', input.source_id).maybeSingle();
          if (error || !official || !official.is_verified || !validDate(official.verified_on) || !validDate(official.review_due) || official.verified_on > riyadhToday() || official.review_due < riyadhToday()) return send(res, 400, { error: 'المصدر غير متحقق أو انتهت مراجعته.' });
        }
        values = { slug: input.slug, title: input.title.trim(), program: input.program.trim(), event_date: input.event_date, audience: input.audience, region: input.region, date_status: input.date_status, publication_status: input.publication_status, source_id: input.source_id, verified_on: input.verified_on, review_due: input.review_due };
      }
      const table = source ? 'official_sources' : 'date_events';
      const query = input.id ? db.from(table).update(values).eq('id', input.id).eq('updated_at', input.updated_at) : db.from(table).insert(values);
      const { data, error } = await query.select('id').maybeSingle();
      if (error || !data || !Number.isSafeInteger(data.id)) return send(res, 409, { error: 'تعذر الحفظ؛ تحقق من الصلاحية أو تعارض التعديل أو تكرار الرابط.' });
      return send(res, 200, { id: data.id });
    }
    if (path === '/api/source-revisions' && req.method === 'GET') {
      const id = Number(parsedUrl.searchParams.get('source'));
      if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: 'معرّف المصدر غير صالح.' });
      const { data, error } = await db.from('source_revisions').select('id,source_id,changed_at,snapshot').eq('source_id', id).order('changed_at', { ascending: false }).limit(50);
      if (error) return send(res, 500, { error: 'تعذر تحميل سجل نسخ المصدر.' });
      return send(res, 200, { revisions: data });
    }
    if (path === '/api/source-restore' && req.method === 'POST') {
      if (!['admin', 'editor'].includes(profile.role)) return send(res, 403, { error: 'الاستعادة متاحة للمحرر والمدير فقط.' });
      const input = await body(req);
      if (!input || !Number.isSafeInteger(input.revision_id) || input.revision_id < 1 || typeof input.updated_at !== 'string' || !Number.isFinite(Date.parse(input.updated_at))) return send(res, 400, { error: 'طلب الاستعادة غير صالح.' });
      const { data: revision, error } = await db.from('source_revisions').select('source_id,snapshot').eq('id', input.revision_id).maybeSingle();
      if (error || !revision || !revision.snapshot) return send(res, 404, { error: 'النسخة غير متاحة.' });
      const snap = revision.snapshot;
      if (!nonempty(snap.name) || !nonempty(snap.organization) || !validHttps(snap.url)) return send(res, 400, { error: 'صيغة النسخة غير مدعومة.' });
      // Restoring never re-approves old source data; dependent public events are hidden by RLS.
      const values = { name: snap.name, organization: snap.organization, url: snap.url, is_verified: false, verified_on: null, review_due: null };
      const { data, error: updateError } = await db.from('official_sources').update(values).eq('id', revision.source_id).eq('updated_at', input.updated_at).select('id').maybeSingle();
      if (updateError || !data || !Number.isSafeInteger(data.id)) return send(res, 409, { error: 'تعذرت الاستعادة؛ قد يكون المصدر تغيّر أو الصلاحية غير كافية.' });
      return send(res, 200, { id: data.id });
    }
    if (path === '/api/event-revisions' && req.method === 'GET') {
      const id = Number(parsedUrl.searchParams.get('event'));
      if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: 'معرّف الموعد غير صالح.' });
      const { data, error } = await db.from('event_revisions').select('id,event_id,changed_at,snapshot').eq('event_id', id).order('changed_at', { ascending: false }).limit(50);
      if (error) return send(res, 500, { error: 'تعذر تحميل سجل نسخ الموعد.' });
      return send(res, 200, { revisions: data });
    }
    if (path === '/api/event-restore' && req.method === 'POST') {
      if (!['admin', 'editor'].includes(profile.role)) return send(res, 403, { error: 'الاستعادة متاحة للمحرر والمدير فقط.' });
      const input = await body(req);
      if (!input || !Number.isSafeInteger(input.revision_id) || input.revision_id < 1 || typeof input.updated_at !== 'string' || !Number.isFinite(Date.parse(input.updated_at))) return send(res, 400, { error: 'طلب الاستعادة غير صالح.' });
      const { data: revision, error } = await db.from('event_revisions').select('event_id,snapshot').eq('id', input.revision_id).maybeSingle();
      if (error || !revision || !revision.snapshot) return send(res, 404, { error: 'النسخة غير متاحة.' });
      const snap = revision.snapshot;
      if (!nonempty(snap.title) || !nonempty(snap.program) || !optionalText(snap.audience) || !optionalText(snap.region) || (snap.event_date !== null && !validDate(snap.event_date)) || (snap.source_id !== null && (!Number.isSafeInteger(snap.source_id) || snap.source_id < 1))) return send(res, 400, { error: 'صيغة النسخة غير مدعومة.' });
      // Keep the current URL, and require a fresh review before republication.
      const values = { title: snap.title, program: snap.program, event_date: snap.event_date, audience: snap.audience, region: snap.region, source_id: snap.source_id, date_status: 'pending', publication_status: 'draft', verified_on: null, review_due: null };
      const { data, error: updateError } = await db.from('date_events').update(values).eq('id', revision.event_id).eq('updated_at', input.updated_at).select('id').maybeSingle();
      if (updateError || !data || !Number.isSafeInteger(data.id)) return send(res, 409, { error: 'تعذرت الاستعادة؛ قد يكون السجل تغيّر أو الصلاحية غير كافية.' });
      return send(res, 200, { id: data.id });
    }
    if (path === '/api/articles' && req.method === 'GET') {
      let query = db.from('articles').select('id,slug,title,description,body,status,published_at,updated_at,author_id');
      // Apply the writer filter before the 100-row limit, not after fetching public articles.
      if (profile.role === 'writer') query = query.eq('author_id', auth.user.id);
      const { data, error } = await query.order('updated_at', { ascending: false }).limit(100);
      if (error) return send(res, 500, { error: 'تعذر تحميل المقالات.' });
      return send(res, 200, { role: profile.role, articles: profile.role === 'writer' ? data.filter(a => a.author_id === auth.user.id) : data });
    }
    if (path === '/api/articles' && req.method === 'POST') {
      const input = await body(req);
      if (!validArticle(input) || (input.id !== undefined && (!Number.isSafeInteger(input.id) || input.id < 1 || typeof input.updated_at !== 'string' || !Number.isFinite(Date.parse(input.updated_at))))) return send(res, 400, { error: 'تحقق من الحقول ومعرّف المقال وتاريخ النشر.' });
      if (profile.role === 'writer' && !['draft', 'review'].includes(input.status)) return send(res, 403, { error: 'الكاتب لا يستطيع النشر أو الأرشفة.' });
      const values = { slug: input.slug, title: input.title.trim(), description: input.description, body: [{ type: 'text', text: input.text }], status: input.status, published_at: input.status === 'published' ? new Date(input.published_at).toISOString() : null };
      const query = input.id ? db.from('articles').update(values).eq('id', input.id).eq('updated_at', input.updated_at) : db.from('articles').insert({ ...values, author_id: auth.user.id });
      const { data, error } = await query.select('id').maybeSingle();
      if (error || !data || !Number.isSafeInteger(data.id)) return send(res, 409, { error: 'تعذر الحفظ؛ قد يكون المقال تغيّر أو الرابط مستخدماً أو الصلاحية غير كافية. حدّث القائمة وحاول مجدداً.' });
      return send(res, 200, { id: data.id });
    }
    if (path === '/api/revisions' && req.method === 'GET') {
      const id = Number(parsedUrl.searchParams.get('article'));
      if (!Number.isSafeInteger(id) || id < 1) return send(res, 400, { error: 'معرّف المقال غير صالح.' });
      const { data, error } = await db.from('article_revisions').select('id,article_id,changed_at,snapshot').eq('article_id', id).order('changed_at', { ascending: false }).limit(50);
      if (error) return send(res, 500, { error: 'تعذر تحميل سجل النسخ.' });
      return send(res, 200, { revisions: data });
    }
    if (path === '/api/restore' && req.method === 'POST') {
      const input = await body(req);
      if (!Number.isSafeInteger(input.revision_id) || input.revision_id < 1 || typeof input.updated_at !== 'string' || !Number.isFinite(Date.parse(input.updated_at))) return send(res, 400, { error: 'طلب الاستعادة غير صالح.' });
      const { data: revision, error } = await db.from('article_revisions').select('article_id,snapshot').eq('id', input.revision_id).maybeSingle();
      if (error || !revision) return send(res, 404, { error: 'النسخة غير متاحة.' });
      const snap = revision.snapshot;
      if (!snap || typeof snap.title !== 'string' || typeof snap.description !== 'string' || !Array.isArray(snap.body) || snap.body.length > 1 || snap.body.some(b => !b || b.type !== 'text' || typeof b.text !== 'string' || b.text.length > 30000)) return send(res, 400, { error: 'صيغة النسخة غير مدعومة في هذا المحرر.' });
      // Restored content must be reviewed again; keep its existing URL.
      const { data, error: updateError } = await db.from('articles').update({ title: snap.title, description: snap.description, body: snap.body, status: 'draft', published_at: null }).eq('id', revision.article_id).eq('updated_at', input.updated_at).select('id').maybeSingle();
      if (updateError || !data || !Number.isSafeInteger(data.id)) return send(res, 409, { error: 'تعذرت الاستعادة؛ قد يكون المقال تغيّر أو الصلاحية غير كافية.' });
      return send(res, 200, { id: data.id });
    }
    return send(res, 404, { error: 'غير موجود.' });
  } catch { return send(res, 400, { error: 'تعذر معالجة الطلب.' }); }
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  http.createServer(handler).listen(port, '127.0.0.1', () => console.log(`Development admin listening locally on ${port}`));
}
