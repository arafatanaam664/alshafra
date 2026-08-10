// catalog.mjs — مولّد الكتالوج العالمي متعدد اللغات
// يبني كل صفحات الموقع العالمية (أدوات × 16 لغة، دول، حروف، أسماء، قوائم، مقالات)
// مع حساب تاريخ النشر لكل صفحة حسب schedule.json (نشر تلقائي بمعدل pages/day).
// يُستخدم من scripts/prerender.mjs وقت البناء. البيانات مشتركة JSON مع تطبيق React.

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf-8'));

export const LANGUAGES = read('src/data/languages.json').languages;
export const COUNTRIES = read('src/data/countries.json').countries;
export const NAMES = read('src/data/names.json').names;
export const TRIVIA = read('src/data/trivia.json');
export const SCHEDULE = read('src/data/schedule.json');
export const PRICES = read('src/data/prices.json');

const I18N = {};
for (const l of LANGUAGES) I18N[l.code] = read(`src/i18n/${l.code}.json`);

export const SITE_URL = 'https://alshafra.com';
const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));

// ---------- أدوات مساعدة ----------
function resolve(obj, parts) {
  let v = obj;
  for (const p of parts) {
    if (v == null) return undefined;
    v = v[p];
  }
  return v;
}
export function t(lang, key) {
  const parts = key.split('.');
  let v = resolve(I18N[lang], parts);
  if (v !== undefined && v !== null && v !== '') return v;
  v = resolve(I18N.en, parts);
  if (v !== undefined && v !== null && v !== '') return v;
  v = resolve(I18N.ar, parts);
  return v !== undefined && v !== null && v !== '' ? v : key;
}
export function langDir(code) {
  const l = LANG_BY_CODE[code];
  return l ? l.dir : 'rtl';
}
export function langNative(code) {
  const l = LANG_BY_CODE[code];
  return l ? l.native : code;
}
export function countryName(lang, c) {
  if (lang === 'ar') return c.ar || c.en;
  if (lang === 'en') return c.en;
  return c.local || c.en;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// ---------- مسارات الأدوات (Slugs موضعية حسب اللغة) ----------
const TOOL_SLUGS = read('src/data/toolslugs.json').slugs;
const TOOL_ORDER = read('src/data/toolslugs.json').order;
const AR_EXISTING_TOOLS = read('src/data/toolslugs.json').arExisting;

const ISLAMIC_LANGS = ['ar', 'tr', 'fa', 'ur', 'id', 'ms', 'hi', 'bn', 'sw', 'en'];

// الحروف العربية
const ARABIC_LETTERS = [
  { char: 'أ', slug: 'alef', name: 'الألف' }, { char: 'ب', slug: 'ba', name: 'الباء' }, { char: 'ت', slug: 'ta', name: 'التاء' },
  { char: 'ث', slug: 'tha', name: 'الثاء' }, { char: 'ج', slug: 'jeem', name: 'الجيم' }, { char: 'ح', slug: 'ha', name: 'الحاء' },
  { char: 'خ', slug: 'kha', name: 'الخاء' }, { char: 'د', slug: 'dal', name: 'الدال' }, { char: 'ذ', slug: 'thal', name: 'الذال' },
  { char: 'ر', slug: 'ra', name: 'الراء' }, { char: 'ز', slug: 'zain', name: 'الزاي' }, { char: 'س', slug: 'seen', name: 'السين' },
  { char: 'ش', slug: 'sheen', name: 'الشين' }, { char: 'ص', slug: 'sad', name: 'الصاد' }, { char: 'ض', slug: 'dad', name: 'الضاد' },
  { char: 'ط', slug: 'taa', name: 'الطاء' }, { char: 'ظ', slug: 'dha', name: 'الظاء' }, { char: 'ع', slug: 'ain', name: 'العين' },
  { char: 'غ', slug: 'ghain', name: 'الغين' }, { char: 'ف', slug: 'fa', name: 'الفاء' }, { char: 'ق', slug: 'qaf', name: 'القاف' },
  { char: 'ك', slug: 'kaf', name: 'الكاف' }, { char: 'ل', slug: 'lam', name: 'اللام' }, { char: 'م', slug: 'meem', name: 'الميم' },
  { char: 'ن', slug: 'noon', name: 'النون' }, { char: 'ه', slug: 'haa', name: 'الهاء' }, { char: 'و', slug: 'waw', name: 'الواو' },
  { char: 'ي', slug: 'ya', name: 'الياء' }
];
const PERSIAN_EXTRA = [
  { char: 'پ', slug: 'pe', name: 'په' }, { char: 'چ', slug: 'che', name: 'چه' }, { char: 'ژ', slug: 'zhe', name: 'ژه' }, { char: 'گ', slug: 'gaf', name: 'گاف' }
];

// ---------- هيكل الصفحة (shell) ----------
export const PRERENDER_CSS = `<style>
  .prerender-shell{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;max-width:960px;margin:0 auto;padding:1.25rem 1.25rem 3rem;line-height:1.9;color:#0f3d2e}
  .prerender-shell a{color:#0b6e4f;text-decoration:none}
  .prerender-nav{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;padding:.75rem 0;border-bottom:1px solid rgba(11,110,79,.12);font-size:.9rem}
  .prerender-nav nav{display:flex;flex-wrap:wrap;gap:.75rem}
  .prerender-shell h1{font-size:1.7rem;line-height:1.5;margin:1.25rem 0 .5rem}
  .prerender-shell h2{font-size:1.2rem;margin:1.5rem 0 .5rem}
  .prerender-shell h3{font-size:1rem;margin:1rem 0 .25rem}
  .prerender-shell ul,.prerender-shell ol{padding-inline-start:1.25rem}
  .prerender-shell table{border-collapse:collapse;width:100%;margin:.75rem 0;font-size:.9rem}
  .prerender-shell th,.prerender-shell td{border:1px solid rgba(11,110,79,.15);padding:.4rem .6rem;text-align:start}
  .prerender-shell th{background:rgba(11,110,79,.07)}
  .prerender-shell .updated{color:#6b7f76;font-size:.8rem}
  .prerender-shell .disclaimer{background:#fdf6e3;border:1px solid #f0e0b0;border-radius:.5rem;padding:.6rem .9rem;font-size:.85rem;margin:1rem 0}
  .prerender-shell .faq-block{margin:1rem 0}
  .prerender-shell .tool-placeholder{background:rgba(11,110,79,.05);border:1px dashed rgba(11,110,79,.3);border-radius:.75rem;padding:1rem;text-align:center;color:#3f6b5a;margin:1rem 0}
  .prerender-shell .lang-links{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.8rem;margin:.75rem 0}
  .prerender-shell .lang-links a{border:1px solid rgba(11,110,79,.2);border-radius:999px;padding:.15rem .6rem}
  .prerender-shell .grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem}
  .prerender-shell .chip{display:inline-block;background:rgba(11,110,79,.08);border-radius:999px;padding:.1rem .7rem;font-size:.8rem;margin:.2rem .1rem}
  .prerender-footer{margin-top:2rem;padding-top:1rem;border-top:1px solid rgba(11,110,79,.12);font-size:.85rem;color:#4b6b5f}
</style>`;

function shell(lang, innerHtml) {
  const s = I18N[lang] || I18N.en;
  const nav = s.nav || {};
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const toolsSlug = (TOOL_SLUGS.tools && TOOL_SLUGS.tools[lang]) || 'tools';
  const navLinks = [
    `<a href="${prefix || '/'}">${esc(nav.home || 'Home')}</a>`,
    `<a href="${prefix}/${toolsSlug}">${esc(nav.tools || 'Tools')}</a>`,
    `<a href="${prefix}/articles">${esc(nav.articles || 'Articles')}</a>`
  ];
  if (lang === 'ar') {
    navLinks.push(`<a href="/today">${esc(nav.today || '')}</a>`);
    navLinks.push(`<a href="/countdown">${esc(nav.countdown || '')}</a>`);
    navLinks.push(`<a href="/name-decoration">زخرفة الأسماء</a>`);
    navLinks.push(`<a href="/salaries">مواعيد الرواتب</a>`);
    navLinks.push(`<a href="/hijri-calendar">التقويم الهجري</a>`);
  }
  const langSwitcher = `<div class="lang-links">${LANGUAGES.map((l) => {
    const p = l.code === 'ar' ? '/' : `/${l.code}`;
    return `<a href="${p}">${l.flag} ${esc(l.native)}</a>`;
  }).join('')}</div>`;
  const footer = `<footer class="prerender-footer">
    ${lang === 'ar' ? `<a href="/about">عن الموقع</a> · <a href="/contact">اتصل بنا</a> · <a href="/privacy">سياسة الخصوصية</a> · <a href="/terms">شروط الاستخدام</a>` : `<span>${esc(s.siteName || 'Shafra Tools')}</span> · <a href="${prefix}/articles">${esc(nav.articles || 'Articles')}</a>`}
  </footer>`;
  return `<div id="root"><div class="prerender-shell" dir="${langDir(lang)}" lang="${lang}">
    <header class="prerender-nav"><a href="${prefix || '/'}"><strong>${esc(s.siteName || '')}</strong></a><nav>${navLinks.join('')}</nav></header>
    ${langSwitcher}
    <main>${innerHtml}</main>
    ${footer}
  </div></div>`;
}

function faqBlock(faq) {
  if (!faq || !faq.length) return '';
  return `<div class="faq-block"><h2>${esc(faqTitle())}</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</div>`;
}
function faqTitle() {
  return 'FAQ';
}

function relatedBlock(links) {
  if (!links || !links.length) return '';
  return `<h2>${esc('🔗')}</h2><div class="grid2">${links.map((l) => `<a href="${l.href}">${esc(l.title)}</a>`).join('')}</div>`;
}

// ---------- إثراء المحتوى الطويل (لمحاربة الصفحات الرقيقة) ----------
// كل صفحة عميقة تُضاف إليها أقسام موسّعة تعتمد على بياناتها الخاصة (اسم/دولة/حرف/اسم)
// لتجاوز الحد الأدنى للكلمات وتقديم قيمة حقيقية، دون أن تتشابه الصفحات مع بعضها.
function factsTableHtml(rows, heading) {
  if (!rows || !rows.length) return '';
  return `<section><h2>${esc(heading)}</h2><table><tbody>${rows
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join('')}</tbody></table></section>`;
}
// تسميات محلية لرؤوس الجداول الموسّعة (مع خيار لغات إضافية)
const UI_LABEL = {
  quickFacts: { ar: 'معلومات سريعة', en: 'Quick Facts', tr: 'Hızlı Bilgiler', fa: 'اطلاعات سریع', fr: 'En bref', es: 'Datos rápidos', pt: 'Fatos rápidos', id: 'Fakta Cepat', ms: 'Fakta Cepat', ur: 'فوری معلومات', de: 'Schnellfakten', ru: 'Кратко', it: 'Fatti rapidi', hi: 'त्वरित तथ्य', bn: 'দ্রুত তথ্য', sw: 'Habari za haraka' },
  related: { ar: 'مواضيع ذات صلة', en: 'Related', tr: 'İlgili', fa: 'مطالب مرتبط', fr: 'Lié', es: 'Relacionado', pt: 'Relacionado', id: 'Terkait', ms: 'Berkaitan', ur: 'متعلقہ', de: 'Verwandt', ru: 'Связанное', it: 'Correlato', hi: 'संबंधित', bn: 'সম্পর্কিত', sw: 'Kuhusiana' },
  guide: { ar: 'دليل شامل', en: 'Complete Guide', tr: 'Kapsamlı Rehber', fa: 'راهنمای جامع', fr: 'Guide complet', es: 'Guía completa', pt: 'Guia completo', id: 'Panduan Lengkap', ms: 'Panduan Lengkap', ur: 'مکمل رہنما', de: 'Umfassender Leitfaden', ru: 'Полное руководство', it: 'Guida completa', hi: 'पूर्ण गाइड', bn: 'সম্পূর্ণ গাইড', sw: 'Mwongozo kamili' },
};
function uiLabel(lang, key) {
  const m = UI_LABEL[key];
  return (m && (m[lang] || m.en)) || key;
}
const FACTS_LABEL = {
  capital: { ar: 'العاصمة', en: 'Capital', tr: 'Başkent', fa: 'پایتخت', fr: 'Capitale', es: 'Capital', pt: 'Capital', id: 'Ibu kota', ms: 'Ibu negara', ur: 'دارالحکومت', de: 'Hauptstadt', ru: 'Столица', it: 'Capitale', hi: 'राजधानी', bn: 'রাজধানী', sw: 'Mji mkuu' },
  currency: { ar: 'العملة', en: 'Currency', tr: 'Para birimi', fa: 'واحد پول', fr: 'Devise', es: 'Moneda', pt: 'Moeda', id: 'Mata uang', ms: 'Mata wang', ur: 'کرنسی', de: 'Währung', ru: 'Валюта', it: 'Valuta', hi: 'मुद्रा', bn: 'মুদ্রা', sw: 'Sarafu' },
  region: { ar: 'المنطقة', en: 'Region', tr: 'Bölge', fa: 'منطقه', fr: 'Région', es: 'Región', pt: 'Região', id: 'Wilayah', ms: 'Wilayah', ur: 'علاقہ', de: 'Region', ru: 'Регион', it: 'Regione', hi: 'क्षेत्र', bn: 'অঞ্চল', sw: 'Mkoa' },
  population: { ar: 'عدد السكان', en: 'Population', tr: 'Nüfus', fa: 'جمعیت', fr: 'Population', es: 'Población', pt: 'População', id: 'Populasi', ms: 'Penduduk', ur: 'آبادی', de: 'Bevölkerung', ru: 'Население', it: 'Popolazione', hi: 'जनसंख्या', bn: 'জনসংখ্যা', sw: 'Idadi' },
};
function fl(lang, key, v) {
  const m = FACTS_LABEL[key];
  return (m && (m[lang] || m.en)) || key;
}
function countryFactsTable(lang, c, cname) {
  const rows = [
    [fl(lang, 'capital'), c.cap],
    [fl(lang, 'currency'), `${c.cur} — ${c.curName}`],
    [fl(lang, 'region'), c.reg || ''],
    [fl(lang, 'population'), `~${c.popM}M`],
  ].filter(([, v]) => v);
  return factsTableHtml(rows, uiLabel(lang, 'quickFacts'));
}

// ---------- بناة الصفحات ----------
// ربط مفتاح الأداة (في المسارات) بمفتاحها في ملفات الترجمة
const STRING_KEY = {
  'fancy-text': 'fancy-text',
  symbols: 'symbols',
  'password-generator': 'password',
  'word-counter': 'word-counter',
  'percentage-calculator': 'percentage',
  'case-converter': 'case-converter',
  'number-converter': 'number-converter',
  'age-calculator': 'age-calculator',
  'date-converter': 'date-converter',
  today: 'today',
  countdown: 'countdown',
  tools: 'hub'
};

function toolRoute(lang, toolKey) {
  if (lang === 'ar' && AR_EXISTING_TOOLS.includes(toolKey)) return null;
  const sk = STRING_KEY[toolKey] || toolKey;
  const s = t(lang, `tools.${sk}`);
  const st = t(lang, `tools.${sk}.title`) || s;
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const slug = TOOL_SLUGS[toolKey][lang] || TOOL_SLUGS[toolKey].en;
  const path = `${prefix}/${slug}`;
  const intro = (s.intro || []).map((p) => `<p>${esc(p)}</p>`).join('');
  const howto = (s.howto || []).map((p, i) => `<li>${esc(p)}</li>`).join('');
  const faq = faqBlock(s.faq || []);
  // صفحة "كل الأدوات": تسرد كل الأدوات بروابط بدل قالب الأداة
  let body;
  if (toolKey === 'tools') {
    const links = TOOL_ORDER.filter((tk) => !(lang === 'ar' && AR_EXISTING_TOOLS.includes(tk))).map((tk) => {
      const k = STRING_KEY[tk] || tk;
      const sl = TOOL_SLUGS[tk][lang] || TOOL_SLUGS[tk].en;
      return `<li><a href="${prefix}/${sl}">${esc(t(lang, `tools.${k}.title`))}</a></li>`;
    }).join('');
    body = `<h1>${esc(st)}</h1>${intro}<ul>${links}</ul>${faq}`;
  } else {
    body = `
    <h1>${esc(st)}</h1>
    <div class="tool-placeholder">⚙️ ${esc(st)}</div>
    ${intro}
    ${howto ? `<h2>${esc(t(lang, 'ui.generate'))}</h2><ol>${howto}</ol>` : ''}
    ${faq}
  `;
  }
  const keywords = st;
  const title = `${st} | ${t(lang, 'siteName')}`;
  const description = (s.intro && s.intro[0] ? s.intro[0] : st).slice(0, 155);
  const hreflang = LANGUAGES.filter((l) => !(l.code === 'ar' && AR_EXISTING_TOOLS.includes(toolKey))).map((l) => ({
    code: l.code,
    path: `${l.code === 'ar' ? '' : `/${l.code}`}/${TOOL_SLUGS[toolKey][l.code] || TOOL_SLUGS[toolKey].en}`
  }));
  return {
    path, lang, kind: 'tool', param: toolKey, title, description, keywords,
    body: shell(lang, body), hreflang,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: st, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
    ],
    changefreq: 'weekly', priority: '0.8',
    immediate: true
  };
}

function countryRoute(lang, country, kind) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const cname = countryName(lang, country);
  const path = `${prefix}/${kind === 'gold' ? 'gold-price' : kind === 'usd' ? 'usd-rate' : 'date-today'}/${country.slug}`;
  const tplKey = kind === 'gold' ? 'gold' : kind === 'usd' ? 'usd' : 'dateToday';
  const s = t(lang, tplKey);
  const titleTpl = s.title || '{country}';
  const title = fill(titleTpl, { country: cname, currency: country.curName, capital: country.cap });
  const intro = (s.intro || []).map((p) => `<p>${esc(fill(p, { country: cname, currency: country.curName, capital: country.cap }))}</p>`).join('');
  const faq = faqBlock((s.faq || []).map((f) => ({
    q: fill(f.q, { country: cname, currency: country.curName, capital: country.cap }),
    a: fill(f.a, { country: cname, currency: country.curName, capital: country.cap })
  })));
  let extra = '';
  const updated = `${t(lang, 'ui.lastUpdated')}: ${PRICES.updated}`;
  if (kind === 'gold') {
    const rate = PRICES.rates[country.cur] || 1;
    const oz = PRICES.xauUsd;
    const ozLocal = oz * rate;
    const gLocal = (v) => (ozLocal * v).toFixed(country.cur === 'IRR' || country.cur === 'VND' || country.cur === 'IDR' ? 0 : 2);
    extra = `<h2>${esc(fill(t(lang, 'gold.title'), { country: cname }))}</h2>
      <p class="updated">🗓️ ${esc(updated)}</p>
      <table><thead><tr><th>${esc('24K')}</th><th>${esc('22K')}</th><th>${esc('21K')}</th><th>${esc('18K')}</th></tr></thead>
      <tbody><tr><td>${esc(gLocal(1))}</td><td>${esc(gLocal(0.9166))}</td><td>${esc(gLocal(0.875))}</td><td>${esc(gLocal(0.75))}</td></tr></tbody></table>
      <p>${esc(fill(t(lang, 'gold.intro')[0] || '', { country: cname, currency: country.curName }))}</p>
      <div class="disclaimer">${esc(t(lang, 'ui.disclaimer'))}</div>`;
  } else if (kind === 'usd') {
    const rate = PRICES.rates[country.cur] || 1;
    extra = `<h2>${esc(fill(t(lang, 'usd.title'), { country: cname }))}</h2>
      <p class="updated">🗓️ ${esc(updated)}</p>
      <table><thead><tr><th>${esc('1 USD → ' + country.cur)}</th><th>${esc('1 ' + country.cur + ' → USD')}</th></tr></thead>
      <tbody><tr><td>${esc(rate.toFixed(2))}</td><td>${esc((1 / rate).toFixed(4))}</td></tr></tbody></table>
      <div class="disclaimer">${esc(t(lang, 'ui.disclaimer'))}</div>`;
  } else {
    extra = `<h2>${esc(fill(t(lang, 'dateToday.title'), { country: cname }))}</h2>
      <p class="updated">🗓️ ${esc(updated)}</p>
      <table><thead><tr><th>${esc(t(lang, 'ui.lastUpdated'))}</th><th>${esc(t(lang, 'names.gender'))}</th><th>${esc('💱')}</th></tr></thead>
      <tbody><tr><td>${esc(cname)}</td><td>${esc(country.cap)}</td><td>${esc(country.cur + ' — ' + country.curName)}</td></tr></tbody></table>`;
  }
  const hreflang = (country.langs || [lang]).filter((l) => l !== lang).map((l) => ({ code: l, path: `${l === 'ar' ? '' : `/${l}`}/${kind === 'gold' ? 'gold-price' : kind === 'usd' ? 'usd-rate' : 'date-today'}/${country.slug}` }));
  // إثراء طويل: جدول حقائق + دليل شامل يعتمد على بيانات الدولة نفسها (مختلف لكل صفحة)
  const facts = countryFactsTable(lang, country, cname);
  const kindAr = kind === 'gold' ? 'الذهب' : kind === 'usd' ? 'الدولار' : 'التاريخ والوقت';
  let guide = '';
  if (lang === 'ar') {
    guide = `<section><h2>${esc(`دليل ${kindAr} في ${cname}`)}</h2>
      <p>عند التعامل مع ${kind === 'gold' ? `أسعار الذهب في ${cname}` : kind === 'usd' ? `سعر صرف الدولار في ${cname}` : `التاريخ والتوقيت في ${cname}`}، من المهم فهم السياق الاقتصادي والجغرافي الكامل للدولة؛ فالعاصمة ${esc(country.cap)} هي مركز النشاط الاقتصادي، والعملة الرسمية هي ${esc(country.cur)} (${esc(country.curName)}). هذه المعلومات تمنحك خلفية واضحة تساعدك على تفسير أي رقم تراه.</p>
      <p>يبلغ عدد سكان ${esc(cname)} حوالي ${esc(country.popM)} مليون نسمة، وتقع في منطقة ${esc(country.reg)} التي تتميز بموقع جغرافي واقتصادي مؤثر. متابعة ${kind === 'gold' ? 'أسعار الذهب' : kind === 'usd' ? 'سعر الدولار' : 'التواريخ والتوقيت'} في ${esc(cname)} يهم المتعاملين والمستثمرين والمسافرين على حد سواء.</p>
      <p>للاستفادة القصوى من هذه الصفحة، ننصح بمراجعة الأرقام الحالية في الأعلى ثم الاطلاع على جدول المعلومات السريع، وقراءة الأسئلة الشائعة في الأسفل؛ فهذه الأقسام مجتمعة تمنحك صورة متكاملة عن ${kind === 'gold' ? 'سوق الذهب' : kind === 'usd' ? 'سوق الصرف' : 'التقويم والتوقيت'} في ${esc(cname)} دون الحاجة إلى مصادر متعددة.</p>
      <p>تذكّر أن الأسعار والقيم المذكورة تقريبية وتُحدَّث بانتظام، وقد تختلف بحسب السوق والمصدر. تابع الصفحة للبقاء على اطلاع بأحدث المستجدات المتعلقة بـ${esc(cname)}.</p></section>`;
  } else {
    const kw = kind === 'gold' ? `${cname} gold price` : kind === 'usd' ? `${cname} USD exchange rate` : `${cname} date and time`;
    guide = `<section><h2>${esc(`${uiLabel(lang, 'guide')}: ${kw}`)}</h2>
      <p>Use this page as a quick reference for ${kw}. We provide current figures at the top, a quick-facts table below, and a FAQ section at the bottom covering the most common questions.</p>
      <p>Figures are indicative and updated regularly. Always verify with official sources for important transactions.</p></section>`;
  }
  const related = COUNTRIES.filter((c) => c.reg === country.reg && c.slug !== country.slug).slice(0, 8).map((c) => ({
    href: `${prefix}/${kind === 'gold' ? 'gold-price' : kind === 'usd' ? 'usd-rate' : 'date-today'}/${c.slug}`,
    title: `${countryName(lang, c)} — ${kind === 'gold' ? 'gold' : kind === 'usd' ? 'USD' : 'date'}`
  }));
  const relatedHtml = related.length ? `<section><h2>${esc(uiLabel(lang, 'related'))}</h2><div class="grid2">${related.map((l) => `<a href="${l.href}">${esc(l.title)}</a>`).join('')}</div></section>` : '';
  return {
    path, lang, kind: kind === 'gold' ? 'gold' : kind === 'usd' ? 'usd' : 'date-today', param: country.slug,
    title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: `${title}, ${cname}, ${country.cur}, ${t(lang, 'gold.title')}`,
    body: shell(lang, `<h1>${esc(title)}</h1>${intro}${extra}${facts}${guide}${faq}${relatedHtml}`),
    hreflang,
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: title, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: lang }],
    changefreq: 'daily', priority: '0.7'
  };
}

function letterRoute(lang, letter) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const path = `${prefix}/fancy-letter/${letter.slug}`;
  const s = t(lang, 'letters');
  const display = lang === 'ar' || lang === 'fa' || lang === 'ur' ? letter.char : letter.char.toLowerCase();
  const title = fill(s.title || '{letter}', { letter: display });
  const intro = (s.intro || []).map((p) => `<p>${esc(fill(p, { letter: display }))}</p>`).join('');
  const faq = faqBlock((s.faq || []).map((f) => ({ q: fill(f.q, { letter: display }), a: fill(f.a, { letter: display }) })));
  const lettersForLang = lang === 'fa' ? [...ARABIC_LETTERS, ...PERSIAN_EXTRA] : ARABIC_LETTERS;
  const latin = LANG_BY_CODE[lang].script === 'latin';
  const list = latin
    ? 'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => ({ slug: c, char: c }))
    : lettersForLang;
  const related = list.slice(0, 26).map((l2) => ({ href: `${prefix}/fancy-letter/${l2.slug}`, title: `${l2.char}` }));
  const relatedHtml = relatedBlock(related);
  // hreflang فقط للغات التي تملك هذه الصفحة فعلاً (نفس الخط)
  const hreflang = LANGUAGES.filter((l) => LANG_BY_CODE[l.code].script === LANG_BY_CODE[lang].script && l.code !== lang).filter((l) => {
    if (LANG_BY_CODE[l.code].script === 'latin') return true;
    const letters = l.code === 'fa' ? [...ARABIC_LETTERS, ...PERSIAN_EXTRA] : ARABIC_LETTERS;
    return letters.some((x) => x.slug === letter.slug);
  }).map((l) => ({
    code: l.code,
    path: `${l.code === 'ar' ? '' : `/${l.code}`}/fancy-letter/${letter.slug}`
  }));
  let extended = '';
  if (lang === 'ar') {
    extended = `<section><h2>${esc(`كل ما تريد معرفته عن حرف «${letter.name}»`)}</h2>
      <p>حرف «${esc(letter.char)}» هو أحد حروف الأبجدية في اللغة العربية، ويُكتب ويكون موضعه بين الحروف حسب ترتيب الأبجدية. يظهر هذا الحرف في مئات الكلمات اليومية، وله أشكال مختلفة حسب موقعه في الكلمة: في أول الكلمة ووسطها وآخرها، وتختلف طريقة كتابته مع الحروف المتصلة.</p>
      <p>يتعلم الأطفال هذا الحرف في مرحلة الروضة والابتدائية عبر أنشطة متنوعة، ويستخدم الخطاطون أشكالاً مزخرفة منه في اللوحات والتصاميم. كما يُعد الحرف أساساً في تعليم القراءة والكتابة، ويظهر في كثير من الأسماء العربية الشهيرة.</p>
      <p>عند زخرفة حرف «${esc(letter.char)}» يمكنك اختيار أنماط متعددة تليق بالاسم الذي تريده، سواء للاستخدام في وسائل التواصل الاجتماعي أو الألعاب أو الشعارات. جرّب الحرف الآن وانسخ الشكل المزخرف مباشرة.</p>
      <p>هذه الصفحة مرجعك السريع لحرف «${esc(letter.char)}» من حيث شكله ومواضعه واستخداماته في الزخرفة، مع روابط لباقي الحروف أدناه لتتنقل بسهولة بينها.</p></section>`;
  } else {
    extended = `<section><h2>${esc(`${uiLabel(lang, 'guide')}: letter ${display}`)}</h2>
      <p>This page is your quick reference for the letter «${esc(display)}». Use the fancy-text generator to style this letter in many different ways for social media, gaming, or branding.</p></section>`;
  }
  return {
    path, lang, kind: 'letter', param: letter.slug, title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: title,
    body: shell(lang, `<h1>${esc(title)}</h1>${intro}${extended}${faq}${relatedHtml}`),
    hreflang,
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: title, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', inLanguage: lang }],
    changefreq: 'monthly', priority: '0.6'
  };
}

function nameRoute(lang, name) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const path = `${prefix}/name/${name.slug}`;
  const s = t(lang, 'names');
  const display = (lang === 'ar' || lang === 'fa' || lang === 'ur') && name.ar ? name.ar : name.en;
  const title = fill(s.title || '{name}', { name: display });
  const intro = (s.intro || []).map((p) => `<p>${esc(fill(p, { name: display }))}</p>`).join('');
  const meaning = lang === 'ar' || lang === 'fa' || lang === 'ur' ? name.meaningAr || name.meaningEn : name.meaningEn;
  const faq = faqBlock((s.faq || []).map((f) => ({ q: fill(f.q, { name: display }), a: fill(f.a, { name: display }) })));
  const gender = t(lang, name.gender === 'male' ? 'ui.male' : 'ui.female');
  const related = NAMES.filter((n) => n.slug !== name.slug && n.origin === name.origin).slice(0, 24).map((n) => ({
    href: `${prefix}/name/${n.slug}`,
    title: (lang === 'ar' || lang === 'fa' || lang === 'ur') && n.ar ? n.ar : n.en
  }));
  const relatedHtml = relatedBlock(related);
  // hreflang فقط للغات التي تملك صفحة هذا الاسم فعلاً
  const nameExistsIn = (l, nm) => {
    if (l === 'ar') return nm.origin === 'arabic';
    if (l === 'fa') return nm.origin === 'arabic' || nm.origin === 'persian';
    if (l === 'ur') return nm.origin === 'arabic';
    if (l === 'tr') return nm.origin === 'turkish' || nm.origin === 'arabic';
    if (l === 'en') return nm.origin === 'english' || nm.origin === 'arabic';
    return nm.origin === 'english';
  };
  const hreflang = LANGUAGES.filter((l) => l.code !== lang && nameExistsIn(l.code, name)).map((l) => ({
    code: l.code,
    path: `${l.code === 'ar' ? '' : `/${l.code}`}/name/${name.slug}`
  }));
  const originAr = { arabic: 'عربي', persian: 'فارسي', turkish: 'تركي', english: 'إنجليزي' }[name.origin] || name.origin;
  let extended = '';
  if (lang === 'ar') {
    extended = `<section><h2>${esc(`تفاصيل اسم «${display}»`)}</h2>
      <p>اسم «${esc(display)}» ${name.gender === 'male' ? 'اسم مذكر' : 'اسم مؤنث'} من أصل ${esc(originAr)}، ومعناه «${esc(meaning)}». يُعد هذا الاسم من الأسماء المتداولة في المجتمعات العربية والإسلامية، ويُختار كثيراً لجمال لفظه وحسن معناه.</p>
      <p>تتعدد طرق كتابة الاسم وزخرفته؛ فبإمكانك تحويله إلى أشكال مزخرفة تناسب منصات التواصل والألعاب والشعارات عبر أدوات الزخرفة المتاحة في الموقع. جرّب أنماطاً مختلفة وانسخ ما يعجبك مباشرة.</p>
      <p>اختيار الاسم قرار شخصي وهادف، وينظر الآباء إلى معناه وأصله وموقعه بين الأسماء الأخرى عند تسمية أطفالهم. تمنحك هذه الصفحة كل ما يخص اسم «${esc(display)}» في مكان واحد.</p>
      <p>استعرض قائمة الأسماء ذات الصلة أدناه لاكتشاف أسماء قريبة من حيث الأصل والمعنى، وتصفّح معانيها بسهولة بالتنقل بين صفحاتها.</p></section>`;
  } else {
    extended = `<section><h2>${esc(`${uiLabel(lang, 'guide')}: name ${display}`)}</h2>
      <p>This page covers the name «${esc(display)}»: its meaning, gender, origin and related names. Browse the related names below for more options.</p></section>`;
  }
  return {
    path, lang, kind: 'name', param: name.slug, title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: `${title}, ${t(lang, 'names.title')}`,
    body: shell(lang, `<h1>${esc(title)}</h1>
      <p><strong>${esc(t(lang, 'ui.meaning'))}:</strong> ${esc(meaning)} &nbsp;·&nbsp; <strong>${esc(t(lang, 'ui.gender'))}:</strong> ${esc(gender)}</p>
      ${intro}${extended}${faq}${relatedHtml}`),
    hreflang,
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, inLanguage: lang }],
    changefreq: 'monthly', priority: '0.6'
  };
}

function listRoute(lang, listKey) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const path = `${prefix}/names/${listKey}`;
  const s = t(lang, `lists.${listKey}`);
  const title = s.title || listKey;
  const intro = (s.intro || []).map((p) => `<p>${esc(p)}</p>`).join('');
  let items;
  if (listKey === 'cat') items = TRIVIA.catNames;
  else if (listKey === 'dog') items = TRIVIA.dogNames;
  else if (listKey === 'company') items = TRIVIA.companyNames;
  else {
    const g = listKey === 'boy' ? 'male' : 'female';
    const origins = lang === 'ar' ? ['arabic'] : lang === 'fa' ? ['arabic', 'persian'] : lang === 'tr' ? ['turkish', 'arabic'] : ['english'];
    items = NAMES.filter((n) => n.gender === g && origins.includes(n.origin)).slice(0, 120).map((n) => (lang === 'ar' || lang === 'fa' || lang === 'ur') && n.ar ? n.ar : n.en);
  }
  const chips = items.map((i) => `<span class="chip">${esc(i)}</span>`).join('');
  let extended = '';
  if (lang === 'ar') {
    const listLabel = { boy: 'أسماء الأولاد', girl: 'أسماء البنات', cat: 'أسماء القطط', dog: 'أسماء الكلاب', company: 'أسماء الشركات' }[listKey] || title;
    extended = `<section><h2>${esc(`كل ما تريد معرفته عن ${listLabel}`)}</h2>
      <p>تحتوي هذه القائمة على مجموعة مختارة من ${esc(listLabel)} التي يكثر البحث عنها، مرتبة لسهولة التصفح والاختيار. جمعنا لك ${esc(items.length)} اسماً متنوعاً مع إمكانية تصفحها والاستفادة منها مباشرة.</p>
      <p>اختيار الاسم المناسب يعتمد على الذوق والمعنى والملاءمة؛ فبالنسبة للأسماء الشخصية يراعي الآباء المعنى والأصل، أما أسماء الحيوانات الأليفة فتميل إلى القصر واللطف وسهولة النطق، فيما تعكس أسماء الشركات هوية العلامة وقيمها.</p>
      <p>استعرض القائمة أدناه، وانسخ ما يناسبك، وتصفّح الصفحات المرتبطة لمزيد من الخيارات والأفكار المتنوعة.</p></section>`;
  } else {
    extended = `<section><h2>${esc(`${uiLabel(lang, 'guide')}: ${title}`)}</h2>
      <p>This curated list contains ${items.length} names to help you find the right one. Browse through and pick what suits you best.</p></section>`;
  }
  const body = `<h1>${esc(title)}</h1>${intro}${extended}<p>${chips}</p>${faqBlock(s.faq || [])}`;
  return {
    path, lang, kind: 'list', param: listKey, title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: title,
    body: shell(lang, body),
    hreflang: LANGUAGES.filter((l) => l.code !== lang).map((l) => ({ code: l.code, path: `${l.code === 'ar' ? '' : `/${l.code}`}/names/${listKey}` })),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Article', headline: title, inLanguage: lang }],
    changefreq: 'monthly', priority: '0.6'
  };
}

const WORLD_ARTICLES = ['smallest-country', 'biggest-country', 'messi-vs-ronaldo', 'pele', 'argentina', 'fun-facts', 'riddles', 'jokes', 'love-quotes', 'sad-quotes', 'whatsapp-statuses', 'instagram-bios'];
const DHIKR_ARTICLES = ['morning-dhikr', 'evening-dhikr', 'daily-dua'];

// فهرس المقالات لكل لغة (/{lang}/articles) — يضمن أن رابط التنقل لا يقع في 404
function articlesHubRoute(lang) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const path = `${prefix}/articles`;
  const base = lang === 'ar' ? '/world' : path;
  const slugs = [...WORLD_ARTICLES, ...(ISLAMIC_LANGS.includes(lang) ? DHIKR_ARTICLES : [])];
  const links = slugs.map((a) => `<li><a href="${base}/${a}">${esc(t(lang, `articles.${a}.title`))}</a></li>`).join('');
  const navTitle = t(lang, 'nav.articles') || 'Articles';
  const body = `<h1>${esc(navTitle)}</h1><ul>${links}</ul>`;
  return {
    path, lang, kind: 'articles-list', title: `${navTitle} | ${t(lang, 'siteName')}`,
    description: navTitle,
    keywords: navTitle,
    body: shell(lang, body),
    hreflang: LANGUAGES.filter((l) => l.code !== lang).map((l) => ({ code: l.code, path: `${l.code === 'ar' ? '' : `/${l.code}`}/articles` })),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: navTitle, inLanguage: lang }],
    changefreq: 'weekly', priority: '0.7',
    immediate: true,
  };
}

function articleRoute(lang, slug) {  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const basePath = lang === 'ar' ? '/world' : `${prefix}/articles`;
  const path = `${basePath}/${slug}`;
  const s = t(lang, `articles.${slug}`);
  const title = s.title || slug;
  const intro = (s.intro || []).map((p) => `<p>${esc(p)}</p>`).join('');
  const faq = faqBlock(s.faq || []);
  let itemsHtml = '';
  if (slug === 'fun-facts' || slug === 'riddles' || slug === 'jokes' || slug === 'love-quotes' || slug === 'sad-quotes' || slug === 'whatsapp-statuses' || slug === 'instagram-bios') {
    const key = slug === 'whatsapp-statuses' ? 'statuses' : slug === 'instagram-bios' ? 'bios' : slug;
    const list = TRIVIA[key] && TRIVIA[key][lang === 'ar' ? 'ar' : 'en'] ? TRIVIA[key][lang === 'ar' ? 'ar' : 'en'] : [];
    itemsHtml = `<ul>${list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  }
  if (slug === 'morning-dhikr' || slug === 'evening-dhikr' || slug === 'daily-dua') {
    const key = slug === 'morning-dhikr' ? 'morning' : slug === 'evening-dhikr' ? 'evening' : 'dua';
    itemsHtml = `<div class="grid2">${TRIVIA.dhikr[key].map((d) => `<div><strong>${esc(d.text)}</strong><br/><span>${esc(d.detail)}</span></div>`).join('')}</div>`;
  }
  if (slug === 'smallest-country' || slug === 'biggest-country') {
    const sorted = [...COUNTRIES].sort((a, b) => (slug === 'smallest-country' ? a.popM - b.popM : b.popM - a.popM));
    itemsHtml = `<table><thead><tr><th>#</th><th>${esc(t(lang, 'names.gender') === 'Gender' ? 'Country' : 'الدولة')}</th><th>${esc('👥')}</th></tr></thead><tbody>${sorted.slice(0, 10).map((c, i) => `<tr><td>${i + 1}</td><td>${esc(c.flag)} ${esc(countryName(lang, c))}</td><td>~${c.popM}M</td></tr>`).join('')}</tbody></table>`;
  }
  const related = WORLD_ARTICLES.filter((a) => a !== slug).slice(0, 6).map((a) => ({ href: `${basePath}/${a}`, title: t(lang, `articles.${a}.title`) }));
  const relatedHtml = relatedBlock(related);
  return {
    path, lang, kind: 'article', param: slug, title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: title,
    body: shell(lang, `<h1>${esc(title)}</h1>${intro}${itemsHtml}${faq}${relatedHtml}`),
    hreflang: LANGUAGES.filter((l) => l.code !== lang && (WORLD_ARTICLES.includes(slug) ? true : ISLAMIC_LANGS.includes(l.code))).map((l) => ({
      code: l.code, path: l.code === 'ar' ? `/world/${slug}` : `/${l.code}/articles/${slug}`
    })),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Article', headline: title, inLanguage: lang, description: descriptionOf(intro) }],
    changefreq: 'monthly', priority: '0.6'
  };
}
function descriptionOf(introHtml) {
  return introHtml.replace(/<[^>]+>/g, '').slice(0, 155);
}

function hubRoute(lang) {
  const prefix = lang === 'ar' ? '' : `/${lang}`;
  const s = t(lang, 'home');
  const title = s.title || '';
  const intro = (s.intro || []).map((p) => `<p>${esc(p)}</p>`).join('');
  const toolLinks = TOOL_ORDER.filter((tk) => !(lang === 'ar' && AR_EXISTING_TOOLS.includes(tk))).map((tk) => {
    const slug = TOOL_SLUGS[tk][lang] || TOOL_SLUGS[tk].en;
    const sk = STRING_KEY[tk] || tk;
    return `<a href="${prefix}/${slug}" class="chip">${esc(t(lang, `tools.${sk}.title`))}</a>`;
  }).join('');
  const faq = faqBlock(s.faq || []);
  const body = `<h1>${esc(title)}</h1>${intro}<p>${toolLinks}</p>${faq}`;
  const path = prefix || '/';
  return {
    path, lang, kind: 'home', title: `${title} | ${t(lang, 'siteName')}`,
    description: intro.replace(/<[^>]+>/g, '').slice(0, 155),
    keywords: title,
    body: shell(lang, body),
    hreflang: LANGUAGES.filter((l) => l.code !== lang).map((l) => ({ code: l.code, path: l.code === 'ar' ? '/' : `/${l.code}` })),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: t(lang, 'siteName'), url: SITE_URL + path, inLanguage: lang }],
    changefreq: 'daily', priority: '0.9',
    immediate: true
  };
}

// ---------- بناء الكتالوج بالمراحل ----------
// المرحلة 0-2: المحاور + الأدوات + فهارس المقالات لكل اللغات (تُنشر فوراً — لا 404)
// المرحلة 3+: المحتوى العميق (دول، حروف، أسماء، قوائم، مقالات) حسب جدولة ratePerDay
export function buildCatalog() {
  const routes = [];
  const push = (r) => { if (r) routes.push(r); };
  const langs = LANGUAGES.map((l) => l.code);

  // المرحلة 0: محاور اللغات (العربية الرئيسية = الصفحة السعودية القائمة)
  for (const lang of langs) if (lang !== 'ar') push(hubRoute(lang));

  // المرحلة 1: كل الأدوات لكل اللغات
  for (const lang of langs) for (const tk of TOOL_ORDER) push(toolRoute(lang, tk));

  // المرحلة 2: فهرس المقالات لكل لغة
  for (const lang of langs) if (lang !== 'ar') push(articlesHubRoute(lang));

  // المرحلة 3: المحتوى العميق لكل لغة
  for (const lang of langs) {
    // 3.1) صفحات الدول (الذهب + الدولار + تاريخ اليوم) — الأكبر سكاناً أولاً
    const countries = COUNTRIES.filter((c) => (c.langs || []).includes(lang));
    countries.sort((a, b) => b.popM - a.popM);
    for (const c of countries) {
      push(countryRoute(lang, c, 'gold'));
      push(countryRoute(lang, c, 'usd'));
      push(countryRoute(lang, c, 'date-today'));
    }
    // 3.2) الحروف
    if (LANG_BY_CODE[lang].script === 'latin') {
      for (const ch of 'abcdefghijklmnopqrstuvwxyz'.split('')) push(letterRoute(lang, { slug: ch, char: ch }));
    } else {
      const letters = lang === 'fa' ? [...ARABIC_LETTERS, ...PERSIAN_EXTRA] : ARABIC_LETTERS;
      for (const ltr of letters) push(letterRoute(lang, ltr));
    }
    // 3.3) الأسماء (مع إزالة أي تكرار slug داخل نفس اللغة)
    let names;
    if (lang === 'ar') names = NAMES.filter((n) => n.origin === 'arabic');
    else if (lang === 'fa') names = NAMES.filter((n) => n.origin === 'arabic' || n.origin === 'persian');
    else if (lang === 'ur') names = NAMES.filter((n) => n.origin === 'arabic');
    else if (lang === 'tr') names = NAMES.filter((n) => n.origin === 'turkish' || n.origin === 'arabic');
    else if (lang === 'en') names = NAMES.filter((n) => n.origin === 'english' || n.origin === 'arabic');
    else names = NAMES.filter((n) => n.origin === 'english');
    const seenNames = new Set();
    for (const n of names) {
      if (seenNames.has(n.slug)) continue;
      seenNames.add(n.slug);
      push(nameRoute(lang, n));
    }
    // 3.4) قوائم الأسماء
    for (const lk of ['boy', 'girl', 'cat', 'dog', 'company']) push(listRoute(lang, lk));
    // 3.5) المقالات
    for (const a of WORLD_ARTICLES) push(articleRoute(lang, a));
    if (ISLAMIC_LANGS.includes(lang)) for (const a of DHIKR_ARTICLES) push(articleRoute(lang, a));
  }
  return routes;
}

// ---------- الجدولة ----------
// الملفات: تُولَّد كلها (حتى لا يقع أي رابط في 404 عند تبديل اللغة أو التنقل).
// sitemap + published.json + IndexNow: مقيدة بالجدولة — كل يوم تظهر 5 صفحات جديدة
// (ratePerDay) في sitemap فقط، بينما الصفحات الفورية (immediate) تظهر من اليوم الأول.
export function mergeCatalog(existingRoutes) {
  const catalog = buildCatalog();
  const start = new Date(`${SCHEDULE.startDate}T00:00:00Z`);
  const rate = SCHEDULE.ratePerDay || 5;
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayIso = today.toISOString().slice(0, 10);
  const all = existingRoutes.map((r) => ({ ...r, publishDate: start, fromExisting: true }));
  // إزالة أي تكرار: الصفحات القائمة لها الأولوية (لا نكتب فوق الرئيسية السعودية أبداً)
  const seen = new Set(existingRoutes.map((r) => r.path));
  // الفورية (محاور + أدوات + فهارس) تُنشر فوراً، والعميقة تُحسب أيامها من فهرسها الخاص
  // (وليس من الفهرس العام) حتى تبدأ 10 صفحات يومياً من اليوم الأول.
  let deepIndex = 0;
  catalog.forEach((r) => {
    if (seen.has(r.path)) return;
    seen.add(r.path);
    if (r.immediate) {
      all.push({ ...r, publishDate: start });
    } else {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + Math.floor(deepIndex / rate));
      deepIndex++;
      all.push({ ...r, publishDate: d });
    }
  });
  // المنشور (يظهر في sitemap): الصفحات القائمة + الفورية + ما حلّ أجله
  const published = all.filter((r) => r.publishDate <= today);
  // start يُعاد لتحديد lastmod: الصفحات المجدولة (بعد بداية الجدولة) تُظهر تاريخ نشرها
  // الفعلي، بينما الصفحات القائمة والفورية (تُعاد بناؤها يومياً) تُظهر تاريخ البناء.
  return { all, published, today: todayIso, total: all.length, start };
}
