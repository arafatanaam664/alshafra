// fetch-trending.mjs — يحفظ لقطة اختيارية من Google Trends لدول الخليج.
// Google لا يوفّر API عاماً ثابتاً للترند؛ لذلك نستخدم موجز RSS العام، ونبقي
// آخر لقطة صالحة عند تعذر الشبكة. الأهم أن ملف اللقطة يُنشأ دائماً حتى لا
// يفشل `git add` في GitHub Actions عند أول تشغيل.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SNAPSHOT = join(root, 'src', 'data', 'trending-snapshot.json');

const GEO = [
  { code: 'SA', country: 'السعودية' },
  { code: 'AE', country: 'الإمارات' },
  { code: 'QA', country: 'قطر' },
  { code: 'KW', country: 'الكويت' },
  { code: 'BH', country: 'البحرين' },
  { code: 'OM', country: 'عُمان' },
];

function emptySnapshot() {
  return { date: '', countries: {} };
}

function readPrevious() {
  if (!existsSync(SNAPSHOT)) return emptySnapshot();
  try {
    const value = JSON.parse(readFileSync(SNAPSHOT, 'utf-8'));
    return value && typeof value === 'object' ? value : emptySnapshot();
  } catch (error) {
    console.warn(`[trending] invalid previous snapshot (${error.message}); resetting it.`);
    return emptySnapshot();
  }
}

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; alshafra-trends/2.0; +https://alshafra.com)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
}

function titlesFromRss(xml) {
  const titles = [];
  const itemRe = /<item\b[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/item>/gi;
  for (const match of xml.matchAll(itemRe)) {
    const title = decodeXml(match[1]);
    if (title && !titles.includes(title)) titles.push(title);
  }
  return titles.slice(0, 15);
}

async function main() {
  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  const previous = readPrevious();
  const countries = {};

  for (const geo of GEO) {
    try {
      const xml = await fetchText(`https://trends.google.com/trending/rss?geo=${geo.code}`);
      const titles = titlesFromRss(xml);
      if (!titles.length) throw new Error('RSS returned no topics');
      countries[geo.code] = { country: geo.country, date: new Date().toISOString().slice(0, 10), titles };
      console.log(`[trending] ${geo.country}: ${titles.length} topics`);
    } catch (error) {
      const cached = previous.countries?.[geo.code];
      if (cached?.titles?.length) countries[geo.code] = cached;
      console.log(`[trending] ${geo.country}: ${error.message}; using cached data when available.`);
    }
  }

  const hasFreshData = Object.values(countries).some(
    (country) => country.date === new Date().toISOString().slice(0, 10) && country.titles?.length,
  );
  const payload = {
    date: hasFreshData ? new Date().toISOString().slice(0, 10) : previous.date || '',
    countries,
  };

  // نكتب الملف حتى في أول فشل كامل. بهذه الطريقة يبقى سير النشر قابلاً للتكرار
  // ولا يتوقف بسبب pathspec مفقود.
  writeFileSync(SNAPSHOT, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  console.log(`[trending] snapshot ready (${Object.keys(countries).length} countries, date ${payload.date || 'none'}).`);
}

main().catch((error) => {
  console.error('[trending] unexpected error:', error);
  // خطأ الترند الاختياري لا ينبغي أن يمنع تحديث الأسعار وبناء الموقع.
  if (!existsSync(SNAPSHOT)) writeFileSync(SNAPSHOT, `${JSON.stringify(emptySnapshot(), null, 2)}\n`, 'utf-8');
});
