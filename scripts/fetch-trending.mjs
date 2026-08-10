// fetch-trending.mjs — ميزة «استكشاف الترند» الذكية.
// يحاول جلب أبرز المواضيع الرائجة اليومية في دول الخليج من Google Trends
// (نقاط النهاية الداخلية غير الرسمية) ويكتب src/data/trending-snapshot.json.
// تُعرض هذه المواضيع في صفحة /trending كـ«أكثر ما يبحث عنه الخليج اليوم».
//
// ملاحظة صادقة: Google Trends لا يوفّر API عاماً رسمياً، ونقطة النهاية هذه
// غير رسمية وقد تتعرض للحجب أو تقييد المعدل (429). لذلك:
//   - إن نجح الجلب => نُحدّث اللقطة ونستفيد منها.
//   - إن فشل (لا إنترنت / حجب) => نحتفظ باللقطة السابقة ونكمل بنجاح.
// لا يفشل السكربت أبداً ولا يعطّل البناء.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SNAPSHOT = join(root, 'src', 'data', 'trending-snapshot.json');

// دول الخليج وحرف المنطقة الجغرافية في Google Trends
const GEO = [
  { code: 'SA', country: 'السعودية' },
  { code: 'AE', country: 'الإمارات' },
  { code: 'QA', country: 'قطر' },
  { code: 'KW', country: 'الكويت' },
  { code: 'BH', country: 'البحرين' },
  { code: 'OM', country: 'عُمان' },
];

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; shafra-trends/1.0)', 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    // نقطة النهاية تبدأ بمقدمة 5 حروف ثم JSON
    const json = JSON.parse(text.replace(/^\)\]\}'/, ''));
    return json;
  } finally {
    clearTimeout(timer);
  }
}

// مطابقة فئة لكل موضوع رائج (تستخدم لربطها بصفحات الكتالوج)
const CATEGORY_KEYWORDS = {
  economy: ['سعر', 'ذهب', 'دولار', 'عملة', 'أسعار', 'اقتصاد', 'بورصة', 'نفط', 'ربح', 'أسهم', 'دعم', 'راتب', 'حساب المواطن', 'ضمان', 'قرض', 'أرباح', 'تجارة', 'سوق'],
  technology: ['تطبيق', 'هاتف', 'آيفون', 'ذكاء', 'تقنية', 'موقع', 'برنامج', 'أبل', 'سامسونج', 'إنترنت', 'تحديث', 'أندرويد', 'ألعاب', 'كمبيوتر', 'بلايستيشن'],
  education: ['جامعة', 'دراسة', 'منحة', 'مدرسة', 'امتحان', 'طلاب', 'تعليم', 'نظام', 'مناهج', 'معدل'],
  religion: ['صلاة', 'عيد', 'رمضان', 'حج', 'عمرة', 'قرآن', 'فجر', 'أذان', 'دعاء', 'ليلة'],
  travel: ['سفر', 'سياحة', 'طيران', 'فيزا', 'تأشيرة', 'فندق', 'وجهة'],
};

function guessCategory(title) {
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => title.includes(k))) return cat;
  }
  return 'social';
}

async function main() {
  const collected = {};
  let fetchedAny = false;
  for (const g of GEO) {
    const url = `https://trends.google.com/trends/api/dailytrends?hl=ar&geo=${g.code}&ns=15`;
    try {
      const data = await fetchJson(url);
      const defaultBlock = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
      const titles = defaultBlock.map((t) => t.title?.query).filter(Boolean).slice(0, 15);
      collected[g.code] = { country: g.country, date: data?.default?.trendingSearchesDays?.[0]?.date || '', titles };
      if (titles.length) fetchedAny = true;
      console.log(`[trending] ${g.country}: ${titles.length} مواضيع رائجة`);
    } catch (e) {
      console.log(`[trending] ${g.country} فشل الجلب (${e.message}) — سنحتفظ باللقطة السابقة.`);
    }
  }

  const now = new Date().toISOString().slice(0, 10);
  const prev = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf-8')) : { date: '', countries: {} };

  if (fetchedAny) {
    const payload = { date: now, countries: collected };
    writeFileSync(SNAPSHOT, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[trending] updated snapshot ${now}`);
  } else {
    // إن لم ينجح أي جلب، نحتفظ باللقطة القديمة حتى لا نفقد البيانات
    console.log(`[trending] no live data; keeping previous snapshot (${prev.date || 'none'}).`);
  }
}

main();
