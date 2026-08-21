import {
  applyWeekendRule,
  formatGregorian,
  formatHijri,
  gregorianToHijri,
  hijriMonthLength,
  hijriToGregorian,
  todayGregorian,
  weekdayName,
} from '@alshafra/calendar';
import { mergeLegacyAndSnapshot, type ContentSnapshot } from '@alshafra/content/snapshot';
import { DATA, contentSource, loadContentSnapshot, loadPublished, readJson } from './load';
import { esc, faqHtml, h2, p, relatedHtml, sourcesHtml, ul } from './html';
import { FAQ_PAGE_ITEMS } from './faq-page';
import type { PageModel } from './types';

const SITE = 'https://alshafra.com';

interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  sections: { heading: string; body: string }[];
  faq?: { q: string; a: string }[];
  sources?: { label: string; url: string }[];
  reviewedAt?: string;
  updatedAt?: string;
}

interface CountdownDef {
  slug: string;
  title: string;
  question: string;
  category: string;
  emoji: string;
  summary: string;
  keywords?: string;
  paragraphs: string[];
  notes: string[];
  faq: { q: string; a: string }[];
  related?: string[];
  schedule: { type: string; month?: number; day?: number; hijriMonth?: number; hijriDay?: number; dayOfMonth?: number; dates?: string[]; weekendRule?: boolean; editionBase?: number; showHijriYear?: boolean };
}

interface Topic {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
  related?: string[];
  facts?: [string, string][];
}

interface Country {
  slug: string;
  ar?: string;
  en: string;
  cur: string;
  curName: string;
  flag?: string;
  langs?: string[];
}

const articles = readJson<{ articles: Article[] }>(`${DATA}/articles.json`).articles;
const countdowns = readJson<{ countdowns: CountdownDef[] }>(`${DATA}/countdowns.json`).countdowns;
const trending = readJson<{ topics: Topic[]; categories: Record<string, { ar: string; emoji: string }> }>(
  `${DATA}/trending.json`,
);
const prices = readJson<{ updated: string; xauUsd: number; rates: Record<string, number> }>(`${DATA}/prices.json`);
const countries = readJson<{ countries: Country[] }>(`${DATA}/countries.json`).countries;
const coreGuides = readJson<Record<string, { heading: string; paragraphs: string[]; bullets?: string[] }[]>>(
  `${DATA}/core-guides.json`,
);

const articleBy = Object.fromEntries(articles.map((a) => [a.slug, a]));
const countdownBy = Object.fromEntries(countdowns.map((c) => [c.slug, c]));
const topicBy = Object.fromEntries(trending.topics.map((t) => [t.slug, t]));
const arCountries = countries.filter((c) => (c.langs || []).includes('ar'));

function guideHtml(path: string): string {
  const sections = coreGuides[path];
  if (!sections?.length) return '';
  return sections
    .map(
      (s) =>
        `<section>${h2(s.heading)}${s.paragraphs.map(p).join('')}${
          s.bullets?.length ? ul(s.bullets.map(esc)) : ''
        }</section>`,
    )
    .join('');
}

function articleHtml(a: Article): string {
  const sections = a.sections.map((s) => `<section>${h2(s.heading)}${p(s.body)}</section>`).join('');
  return `${p(a.description)}${sections}${sourcesHtml(a.sources || [])}${faqHtml(a.faq || [])}${relatedHtml(
    articles.filter((x) => x.slug !== a.slug).slice(0, 6).map((x) => ({ href: `/articles/${x.slug}`, title: x.title })),
  )}`;
}

function nextMonthly(dayOfMonth: number): { date: ReturnType<typeof todayGregorian>; text: string; hijri: string; days: number } {
  const from = todayGregorian();
  for (let offset = 0; offset < 3; offset++) {
    const month = ((from.month - 1 + offset) % 12) + 1;
    const year = from.year + Math.floor((from.month - 1 + offset) / 12);
    const adjusted = applyWeekendRule({ year, month, day: dayOfMonth });
    const a = Date.UTC(from.year, from.month - 1, from.day);
    const b = Date.UTC(adjusted.year, adjusted.month - 1, adjusted.day);
    if (b >= a) {
      const days = Math.round((b - a) / 86400000);
      const h = gregorianToHijri(adjusted.year, adjusted.month, adjusted.day);
      return { date: adjusted, text: formatGregorian(adjusted), hijri: formatHijri(h), days };
    }
  }
  return { date: from, text: formatGregorian(from), hijri: formatHijri(gregorianToHijri(from.year, from.month, from.day)), days: 0 };
}

function resolveCountdownDate(def: CountdownDef) {
  const from = todayGregorian();
  const s = def.schedule;
  if (s.type === 'gregorian-annual' && s.month && s.day) {
    let y = from.year;
    let d = { year: y, month: s.month, day: s.day };
    const fromU = Date.UTC(from.year, from.month - 1, from.day);
    if (Date.UTC(d.year, d.month - 1, d.day) < fromU) d = { year: y + 1, month: s.month, day: s.day };
    return d;
  }
  if (s.type === 'hijri-annual' && s.hijriMonth && s.hijriDay) {
    const h = gregorianToHijri(from.year, from.month, from.day);
    let d = hijriToGregorian({ year: h.year, month: s.hijriMonth, day: s.hijriDay });
    const fromU = Date.UTC(from.year, from.month - 1, from.day);
    if (Date.UTC(d.year, d.month - 1, d.day) < fromU) {
      d = hijriToGregorian({ year: h.year + 1, month: s.hijriMonth, day: s.hijriDay });
    }
    return d;
  }
  if (s.type === 'monthly' && s.dayOfMonth) return nextMonthly(s.dayOfMonth).date;
  if (s.type === 'fixed' && s.dates?.length) {
    const fromU = Date.UTC(from.year, from.month - 1, from.day);
    for (const iso of s.dates) {
      const [y, m, d] = iso.split('-').map(Number);
      if (Date.UTC(y, m - 1, d) >= fromU) return { year: y, month: m, day: d };
    }
  }
  return from;
}

function countdownHtml(def: CountdownDef): string {
  const date = resolveCountdownDate(def);
  const h = gregorianToHijri(date.year, date.month, date.day);
  const from = todayGregorian();
  const days = Math.max(
    0,
    Math.round((Date.UTC(date.year, date.month - 1, date.day) - Date.UTC(from.year, from.month - 1, from.day)) / 86400000),
  );
  const related = (def.related || [])
    .map((slug) => countdownBy[slug])
    .filter(Boolean)
    .map((c) => ({ href: `/countdown/${c.slug}`, title: c.question }));
  return `${p(def.summary)}<ul><li>الميلادي: ${esc(formatGregorian(date))}</li><li>الهجري: ${esc(formatHijri(h))}</li><li>اليوم: ${esc(weekdayName(date))}</li><li>المتبقي: ${days} يوماً</li></ul>${def.paragraphs.map(p).join('')}${h2('ملاحظات')}${ul(def.notes.map(esc))}${faqHtml(def.faq)}${relatedHtml(related)}`;
}

function goldHtml(country: Country): string {
  const rate = prices.rates[country.cur] || 1;
  const oz = prices.xauUsd * rate;
  const g = (purity: number) => ((oz * purity) / 31.1034768).toFixed(2);
  return `${p(`سعر الجرام التقريبي في ${country.ar || country.en} بتاريخ ${prices.updated}. الأسعار إرشادية.`)}<p class="text-xs text-brand-600">آخر تحديث: ${esc(prices.updated)}</p><table class="w-full text-sm my-4"><thead><tr><th>24K</th><th>22K</th><th>21K</th><th>18K</th></tr></thead><tbody><tr><td>${g(1)}</td><td>${g(0.9166)}</td><td>${g(0.875)}</td><td>${g(0.75)}</td></tr></tbody></table>${p('المصدر لقطة يومية من أسعار عالمية محوّلة للعملة المحلية. اطلب سعراً قابلاً للتنفيذ من متجر مرخص.')}${relatedHtml([{ href: `/usd-rate/${country.slug}`, title: `سعر الدولار في ${country.ar || country.en}` }, { href: '/gold-price', title: 'كل الدول — الذهب' }])}`;
}

function usdHtml(country: Country): string {
  const rate = prices.rates[country.cur] || 1;
  return `${p(`سعر مرجعي: 1 دولار ≈ ${rate} ${country.cur} (${country.curName}). لقطة ${prices.updated}.`)}<table class="w-full text-sm my-4"><tbody><tr><th>1 USD</th><td>${esc(String(rate))} ${esc(country.cur)}</td></tr><tr><th>1 ${esc(country.cur)}</th><td>${(1 / rate).toFixed(4)} USD</td></tr></tbody></table>${p('السعر إرشادي ولا يشمل رسوم التحويل.')}${relatedHtml([{ href: `/gold-price/${country.slug}`, title: `الذهب في ${country.ar || country.en}` }, { href: '/usd-rate', title: 'كل الدول — الدولار' }])}`;
}

function todayHtml(): string {
  const g = todayGregorian();
  const h = gregorianToHijri(g.year, g.month, g.day);
  const len = hijriMonthLength(h.year, h.month);
  return `${p(`التاريخ الهجري اليوم هو ${formatHijri(h)} الموافق ${formatGregorian(g)}، يوم ${weekdayName(g)} بتوقيت الرياض وفق تقويم أم القرى.`)}<ul><li>الهجري: ${esc(formatHijri(h))}</li><li>الميلادي: ${esc(formatGregorian(g))}</li><li>أيام الشهر الهجري: ${len}</li></ul>${p('قد يختلف إعلان رؤية الهلال يوماً واحداً عن الجدول الحسابي.')}${guideHtml('/today')}`;
}

function salariesHtml(): string {
  const rows = [
    ['رواتب الموظفين الحكوميين', 27],
    ['حساب المواطن', 10],
    ['رواتب المتقاعدين', 1],
    ['الضمان الاجتماعي المطوّر', 1],
    ['الدعم السكني', 24],
  ] as const;
  const list = rows.map(([name, day]) => {
    const n = nextMonthly(day);
    return `<li><strong>${esc(name)}</strong> — ${esc(n.text)} (${esc(n.hijri)}) بعد ${n.days} يوماً</li>`;
  });
  return `${p('مواعيد الصرف بعد قاعدة نهاية الأسبوع (الجمعة ← الخميس، السبت ← الأحد). معلوماتية وليست إعلاناً رسمياً.')}<ul>${list.join('')}</ul>${guideHtml('/salaries')}`;
}

function hijriCalHtml(): string {
  const g = todayGregorian();
  const h = gregorianToHijri(g.year, g.month, g.day);
  return `${p(`التقويم المعروض وفق أم القرى. الشهر الحالي: ${h.month}/${h.year}هـ.`)}${guideHtml('/hijri-calendar')}`;
}

function homeHtml(): string {
  return `${p('Alshafra منصة عربية للمعلومات العملية والأدوات. التقويم والمواعيد قسم أساسي فيها وليس علامة منفصلة.')}${h2('التقويم والمواعيد')}${ul([
    `<a href="/today">التاريخ اليوم</a>`,
    `<a href="/date-converter">تحويل التاريخ (أم القرى)</a>`,
    `<a href="/hijri-calendar">التقويم الهجري</a>`,
    `<a href="/salaries">مواعيد الرواتب</a>`,
    `<a href="/school-calendar">التقويم الدراسي</a>`,
    `<a href="/holidays">الإجازات الرسمية</a>`,
    `<a href="/countdown">كم باقي على…</a>`,
  ])}${h2('أدوات')}${ul([`<a href="/age-calculator">حاسبة العمر</a>`, `<a href="/gold-price">أسعار الذهب</a>`, `<a href="/usd-rate">أسعار الدولار</a>`])}${h2('أدلة')}${ul([`<a href="/articles">المقالات</a>`, `<a href="/trending">أدلة عملية</a>`])}${guideHtml('/')}`;
}

function legalHtml(path: string, intro: string): string {
  return `${p(intro)}${guideHtml(path)}`;
}

function page(partial: Omit<PageModel, 'robots'> & { robots?: PageModel['robots'] }): PageModel {
  return { robots: 'index, follow', ...partial };
}

function buildForPublished(path: string, publishedTitle: string, kind: string): PageModel {
  if (path === '/') {
    return page({
      path,
      title: 'Alshafra — معلومات عملية وأدوات والتقويم والمواعيد',
      description:
        'منصة عربية للمعلومات العملية والأدوات: تحويل التاريخ وفق أم القرى، مواعيد الرواتب، التقويم الدراسي والإجازات.',
      h1: 'Alshafra — معلومات عملية وأدوات',
      kind: 'home',
      html: homeHtml(),
    });
  }

  const articleSlug = path.startsWith('/articles/') && path !== '/articles' ? path.slice('/articles/'.length) : null;
  if (articleSlug && articleBy[articleSlug]) {
    const a = articleBy[articleSlug];
    return page({
      path,
      title: publishedTitle,
      description: a.description,
      h1: a.title,
      kind: 'article',
      html: articleHtml(a),
      faq: a.faq,
      datePublished: a.updatedAt,
      dateModified: a.reviewedAt || a.updatedAt,
    });
  }

  if (path === '/articles') {
    return page({
      path,
      title: publishedTitle,
      description: 'مقالات ودلائل عن المواعيد والتقويم في السعودية.',
      h1: 'مقالات ودلائل',
      kind: 'collection',
      itemList: articles.map((a) => ({ name: a.title, path: `/articles/${a.slug}` })),
      html: `${p('مقالات تحريرية عن الرواتب والتقويم والإجازات والتحويل.')}${ul(
        articles.map((a) => `<a href="/articles/${a.slug}">${esc(a.title)}</a>`),
      )}${guideHtml('/articles')}`,
    });
  }

  const cdSlug = path.startsWith('/countdown/') ? path.slice('/countdown/'.length) : null;
  if (cdSlug && countdownBy[cdSlug]) {
    const def = countdownBy[cdSlug];
    const date = resolveCountdownDate(def);
    return page({
      path,
      title: publishedTitle,
      description: def.summary,
      h1: `${def.emoji} ${def.question}`,
      kind: 'countdown',
      island: 'countdown',
      countdownSlug: def.slug,
      isoDate: `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`,
      faq: def.faq,
      html: countdownHtml(def),
    });
  }

  if (path === '/countdown') {
    return page({
      path,
      title: publishedTitle,
      description: 'عدّادات تنازلية للمناسبات والرواتب والدراسة في السعودية.',
      h1: 'كم باقي على…؟',
      kind: 'collection',
      itemList: countdowns.map((c) => ({ name: c.question, path: `/countdown/${c.slug}` })),
      html: `${p('عدّادات وفق أم القرى وتوقيت الرياض.')}${ul(
        countdowns.map((c) => `<a href="/countdown/${c.slug}">${esc(c.question)}</a>`),
      )}`,
    });
  }

  if (path === '/trending') {
    return page({
      path,
      title: publishedTitle,
      description: 'أدلة عملية في الاقتصاد والتقنية والتعليم والدين والسفر.',
      h1: 'الأدلة العملية',
      kind: 'collection',
      html: `${p('مجموعة أدلة عربية عملية. ليست تغطية أخبار لحظية.')}${Object.entries(trending.categories)
        .map(
          ([code, c]) =>
            `<section>${h2(`${c.emoji} ${c.ar}`)}${ul(
              trending.topics.filter((t) => t.category === code).map((t) => `<a href="/trending/${t.slug}">${esc(t.title)}</a>`),
            )}</section>`,
        )
        .join('')}`,
    });
  }

  if (path === '/trending/today') {
    return page({
      path,
      title: publishedTitle,
      description: 'اهتمامات بحثية متغيرة في الخليج — ليست توصية.',
      h1: 'أكثر ما يبحث عنه الخليج اليوم',
      kind: 'trending-today',
      html: `${p('الصفحة تعرض اهتماماً بحثياً وليس خبراً مؤكداً. تحقق من المصدر الرسمي قبل أي قرار.')}${relatedHtml(
        trending.topics.slice(0, 8).map((t) => ({ href: `/trending/${t.slug}`, title: t.title })),
      )}`,
    });
  }

  const trendCat = path.match(/^\/trending\/(economy|technology|social|education|religion|travel)$/);
  if (trendCat) {
    const code = trendCat[1];
    const cat = trending.categories[code];
    const items = trending.topics.filter((t) => t.category === code);
    return page({
      path,
      title: publishedTitle,
      description: `أدلة فئة ${cat.ar}`,
      h1: `${cat.emoji} ${cat.ar}`,
      kind: 'collection',
      html: `${p(`أدلة في فئة ${cat.ar}.`)}${ul(items.map((t) => `<a href="/trending/${t.slug}">${esc(t.title)}</a>`))}`,
    });
  }

  const topicSlug = path.startsWith('/trending/') ? path.slice('/trending/'.length) : null;
  if (topicSlug && topicBy[topicSlug]) {
    const t = topicBy[topicSlug];
    const html = `${t.intro.map(p).join('')}${t.sections
      .map((s) => `<section>${h2(s.heading)}${s.paragraphs.map(p).join('')}</section>`)
      .join('')}${
      t.facts?.length
        ? `<table class="w-full text-sm my-4">${t.facts.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`
        : ''
    }${faqHtml(t.faq || [])}${relatedHtml((t.related || []).filter((s) => topicBy[s]).map((s) => ({ href: `/trending/${s}`, title: topicBy[s].title })))}`;
    return page({
      path,
      title: publishedTitle,
      description: t.description,
      h1: t.title,
      kind: 'guide',
      html,
      faq: t.faq,
    });
  }

  if (path === '/gold-price') {
    return page({
      path,
      title: publishedTitle,
      description: 'أسعار ذهب إرشادية حسب الدولة.',
      h1: 'أسعار الذهب في الدول العربية',
      kind: 'gold-hub',
      html: `${p('اختر الدولة. الأرقام لقطة وليست سعر تنفيذ.')}${ul(
        arCountries.map((c) => `<a href="/gold-price/${c.slug}">${esc(c.ar || c.en)}</a>`),
      )}`,
    });
  }
  if (path.startsWith('/gold-price/')) {
    const slug = path.slice('/gold-price/'.length);
    const c = arCountries.find((x) => x.slug === slug);
    if (c) {
      return page({
        path,
        title: publishedTitle,
        description: `سعر الذهب التقريبي في ${c.ar || c.en}`,
        h1: `سعر الذهب في ${c.ar || c.en}`,
        kind: 'gold',
        html: goldHtml(c),
      });
    }
  }
  if (path === '/usd-rate') {
    return page({
      path,
      title: publishedTitle,
      description: 'أسعار دولار إرشادية حسب الدولة.',
      h1: 'سعر الدولار في الدول العربية',
      kind: 'usd-hub',
      html: `${p('اختر الدولة.')}${ul(arCountries.map((c) => `<a href="/usd-rate/${c.slug}">${esc(c.ar || c.en)}</a>`))}`,
    });
  }
  if (path.startsWith('/usd-rate/')) {
    const slug = path.slice('/usd-rate/'.length);
    const c = arCountries.find((x) => x.slug === slug);
    if (c) {
      return page({
        path,
        title: publishedTitle,
        description: `سعر الدولار التقريبي في ${c.ar || c.en}`,
        h1: `سعر الدولار في ${c.ar || c.en}`,
        kind: 'usd',
        html: usdHtml(c),
      });
    }
  }

  const staticPages: Record<string, () => PageModel> = {
    '/today': () =>
      page({
        path,
        title: publishedTitle,
        description: 'التاريخ الهجري والميلادي اليوم بتوقيت الرياض وفق أم القرى.',
        h1: 'التاريخ اليوم في السعودية',
        kind,
        island: 'today',
        html: todayHtml(),
      }),
    '/salaries': () =>
      page({
        path,
        title: publishedTitle,
        description: 'مواعيد الرواتب والدعم بعد قاعدة نهاية الأسبوع.',
        h1: 'مواعيد صرف الرواتب والدعم',
        kind,
        island: 'salaries',
        html: salariesHtml(),
      }),
    '/hijri-calendar': () =>
      page({
        path,
        title: publishedTitle,
        description: 'التقويم الهجري وفق أم القرى.',
        h1: 'التقويم الهجري — تقويم أم القرى',
        kind,
        island: 'hijri-calendar',
        html: hijriCalHtml(),
      }),
    '/school-calendar': () =>
      page({
        path,
        title: publishedTitle,
        description: 'التقويم الدراسي 1448-1449.',
        h1: 'التقويم الدراسي 1448-1449هـ',
        kind,
        html: `${p('بداية الدراسة العامة المتداولة 23 أغسطس 2026 بنظام الفصلين. راجع وزارة التعليم ومدرستك.')}${guideHtml('/school-calendar')}`,
      }),
    '/holidays': () =>
      page({
        path,
        title: publishedTitle,
        description: 'الإجازات الرسمية حسب القطاع.',
        h1: 'الإجازات الرسمية في السعودية',
        kind,
        html: `${p('ميّز بين الإجازة النظامية والمناسبة التقويمية.')}${guideHtml('/holidays')}`,
      }),
    '/date-converter': () =>
      page({
        path,
        title: publishedTitle,
        description: 'تحويل التاريخ بين الهجري والميلادي وفق أم القرى.',
        h1: 'تحويل التاريخ بين الهجري والميلادي',
        kind,
        island: 'date-converter',
        html: guideHtml('/date-converter'),
      }),
    '/age-calculator': () =>
      page({
        path,
        title: publishedTitle,
        description: 'حاسبة العمر بالهجري والميلادي.',
        h1: 'حاسبة العمر بالهجري والميلادي',
        kind,
        island: 'age-calculator',
        html: guideHtml('/age-calculator'),
      }),
    '/faq': () =>
      page({
        path,
        title: publishedTitle,
        description: 'أسئلة شائعة عن المواعيد والتقويم.',
        h1: 'الأسئلة الشائعة',
        kind,
        html: guideHtml('/faq'),
      }),
    '/about': () =>
      page({
        path,
        title: publishedTitle,
        description: 'عن Alshafra.',
        h1: 'عن Alshafra',
        kind,
        html: legalHtml('/about', 'Alshafra منصة عربية مستقلة للمعلومات العملية والأدوات. التقويم والمواعيد قسم فيها.'),
      }),
    '/contact': () =>
      page({
        path,
        title: publishedTitle,
        description: 'تواصل مع Alshafra.',
        h1: 'اتصل بنا',
        kind,
        html: legalHtml('/contact', 'راسلنا على info@alshafra.com لتصحيح معلومة موثّقة بمصدر.'),
      }),
    '/privacy': () =>
      page({
        path,
        title: publishedTitle,
        description: 'سياسة الخصوصية.',
        h1: 'سياسة الخصوصية',
        kind,
        html: legalHtml('/privacy', 'لا نطلب حساباً لاستخدام الأدوات العامة.'),
      }),
    '/terms': () =>
      page({
        path,
        title: publishedTitle,
        description: 'شروط الاستخدام.',
        h1: 'شروط الاستخدام',
        kind,
        html: legalHtml('/terms', 'المعلومات استرشادية ولا تغني عن الإعلان الرسمي.'),
      }),
  };

  const builder = staticPages[path];
  if (builder) return builder();

  return page({
    path,
    title: publishedTitle,
    description: publishedTitle,
    h1: publishedTitle.split('|')[0].trim(),
    kind,
    html: p('المحتوى قيد المطابقة مع المصدر التحريري.'),
  });
}

let cache: PageModel[] | null = null;

function applySnapshot(pages: PageModel[]): PageModel[] {
  const source = contentSource();
  const snap = loadContentSnapshot() as ContentSnapshot | null;
  const merged = mergeLegacyAndSnapshot(pages, snap, source);
  return merged.map((page) => {
    const existing = pages.find((p) => p.path === page.path);
    if (existing) return existing;
    return {
      path: page.path,
      title: page.title,
      description: page.description,
      h1: page.h1,
      robots: page.robots,
      kind: page.kind,
      html: page.html,
    };
  });
}

export function getAllPages(): PageModel[] {
  if (cache) return cache;
  cache = applySnapshot(loadPublished().map((row) => buildForPublished(row.path, row.title, row.kind)));
  return cache;
}

export function getPage(path: string): PageModel | undefined {
  return getAllPages().find((p) => p.path === path);
}

export function publishedCount(): number {
  return loadPublished().length;
}

export { SITE };
export type { PageModel } from './types';
