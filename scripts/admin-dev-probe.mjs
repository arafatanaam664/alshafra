// Read-only connection check for the alshafra-dev project. Run on a trusted machine.
// It never creates content, roles, or users, and never prints credentials or tokens.
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';

const DEV_URL = 'https://itcpwcifkvuhbdwxdgrf.supabase.co';

export function publicKeyOnly(key) {
  if (typeof key !== 'string') return false;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try { return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')).role === 'anon'; } catch { return false; }
}

export async function checkDevConnection({ key, email, password, clientFactory = createClient }) {
  if (!publicKeyOnly(key)) throw new Error('استخدم مفتاح المشروع العام publishable أو anon فقط.');
  const options = { auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } };
  const anonymous = clientFactory(DEV_URL, key, options);
  const visitor = await anonymous.from('date_events').select('id').limit(1);
  if (visitor.error) throw new Error('تعذر الوصول إلى واجهة PostgREST العامة لمشروع التطوير.');
  const client = clientFactory(DEV_URL, key, options);
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error || !login.data.user || !login.data.session) throw new Error('فشل تسجيل الدخول؛ تحقق من الحساب وتأكيد البريد في مشروع التطوير.');
  try {
    const auth = await client.auth.getUser();
    if (auth.error || !auth.data.user || auth.data.user.id !== login.data.user.id) throw new Error('تعذر التحقق من الجلسة عبر Auth.');
    const profile = await client.from('admin_profiles').select('role').eq('user_id', auth.data.user.id).maybeSingle();
    if (profile.error || !profile.data || !['admin','editor','writer'].includes(profile.data.role)) throw new Error('الحساب ليس مرتبطاً بدور تحريري صالح.');
    for (const table of ['articles','official_sources','date_events']) {
      const result = await client.from(table).select('id').limit(1);
      if (result.error) throw new Error(`تعذرت قراءة جدول ${table} بهذا الحساب.`);
    }
    return { role:profile.data.role };
  } finally {
    // Revokes the refresh session where supported; does not immediately invalidate every issued access token.
    await client.auth.signOut().catch(() => {});
  }
}

async function secret(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('شغّل الفحص في نافذة طرفية تفاعلية على جهاز موثوق.');
  process.stdout.write(prompt);
  const input = process.stdin;
  input.setRawMode(true); input.resume(); input.setEncoding('utf8');
  let value = '';
  try {
    for await (const chunk of input) {
      for (const c of chunk) {
        if (c === '\u0003') throw new Error('أُلغي الفحص.');
        if (c === '\r' || c === '\n') { process.stdout.write('\n'); return value; }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else if (c >= ' ') value += c;
      }
    }
  } finally { input.setRawMode(false); input.pause(); }
  throw new Error('أُغلق الإدخال.');
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('شغّل الفحص في نافذة طرفية تفاعلية على جهاز موثوق.');
  const rl = createInterface({ input:process.stdin, output:process.stdout });
  const key = (await rl.question('المفتاح العام لمشروع alshafra-dev (publishable أو anon): ')).trim();
  const email = (await rl.question('بريد حساب التحرير التجريبي: ')).trim();
  rl.close();
  const password = await secret('كلمة مرور حساب التطوير (لن تظهر): ');
  const result = await checkDevConnection({ key, email, password });
  console.log(`نجح فحص الاتصال والقراءة. الدور: ${result.role}. لا يثبت ذلك اختبار التعديل أو الأمان أو النشر.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
