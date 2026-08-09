// indexnow.mjs — يرسل الصفحات المنشورة حديثاً إلى Bing/Yandex IndexNow تلقائياً
// (الفهرسة الفورية لمحركات بحث مايكروسوفت وياندكس — جوجل يستخدم sitemap + lastmod).
// يُشغَّل بعد البناء في GitHub Actions. لا يفشل أبداً.

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SITE = 'https://alshafra.com';
const KEY = '4f9c2a7e1b8d3f6a9c0e5b7d2a8f4c1e'; // مفتاح IndexNow (موجود في public/4f9c2a7e1b8d3f6a9c0e5b7d2a8f4c1e.txt)

async function main() {
  const listPath = join(root, 'dist', 'indexnow-new.txt');
  if (!existsSync(listPath)) {
    console.log('[indexnow] no indexnow-new.txt — skip.');
    return;
  }
  const urls = readFileSync(listPath, 'utf-8').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!urls.length) {
    console.log('[indexnow] no new URLs.');
    return;
  }
  const payload = {
    host: 'alshafra.com',
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls.slice(0, 1000)
  };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);
    console.log(`[indexnow] submitted ${payload.urlList.length} URLs → HTTP ${res.status}`);
    if (!res.ok) {
      const body = await res.text();
      console.log(`[indexnow] response: ${body.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`[indexnow] failed (will retry next build): ${e.message}`);
  }
}

main();
