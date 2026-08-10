// trending.mjs — محرك المحتوى المؤتمت طويل المدى.
// يقرأ src/data/trending.json (مواضيع رائجة منسّقة وغنية) ويبني منها صفحات كاملة
// +1000 كلمة: عناوين رئيسية وفرعية، فقرات موسّعة، جدول حقائق، أسئلة شائعة،
// روابط داخلية، وبيانات schema.org. يُدمج مساراته مع الكتالوج في prerender.mjs.
//
// المحتوى في trending.json أصلّي ومحدَّث (وليس تاريخاً متبدّلاً فقط)، فكل موضوع
// له فقراته وعناوينه وأسئلته الخاصة، مما يجعل كل صفحة فريدة وقابلة للأرشفة.

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const DATA = JSON.parse(readFileSync(join(root, 'src', 'data', 'trending.json'), 'utf-8'));

export const SITE_URL = 'https://alshafra.com';
const TOPICS = DATA.topics;
const CATS = DATA.categories;

// لقطة Google Trends اليومية (إن وُجدت) لعرض «أكثر ما يبحث عنه الخليج اليوم»
let SNAPSHOT = null;
try {
  const snapPath = join(root, 'src', 'data', 'trending-snapshot.json');
  if (existsSync(snapPath)) SNAPSHOT = JSON.parse(readFileSync(snapPath, 'utf-8'));
} catch (e) {
  SNAPSHOT = null;
}

// ربط موضوع رائج بصفحات الكتالوج ذات الصلة عبر تداخل الكلمات
function kwList(x) {
  return Array.isArray(x.keywords) ? x.keywords : String(x.keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
}
function matchTopicToCurated(title) {
  const t = String(title).replace(/['"]/g, '');
  const hits = TOPICS
    .filter((x) => kwList(x).some((k) => t.includes(k) || String(x.title).includes(k)))
    .map((x) => x);
  // إن لم يوجد تطابق مباشر، ابحث عن أقرب تطابق في العنوان
  if (!hits.length) {
    for (const x of TOPICS) {
      const titleWords = t.split(/\s+/).filter((w) => w.length > 2);
      const overlap = titleWords.filter((w) => x.title.includes(w)).length;
      if (overlap >= 1) hits.push(x);
      if (hits.length >= 3) break;
    }
  }
  return hits.slice(0, 3);
}

function trendingTodayHtml() {
  if (!SNAPSHOT || !SNAPSHOT.countries) return '';
  const countries = Object.entries(SNAPSHOT.countries).filter(([, c]) => c && c.titles && c.titles.length);
  if (!countries.length) return '';
  const blocks = countries
    .map(([code, c]) => {
      const items = c.titles
        .map((title) => {
          const related = matchTopicToCurated(title);
          const link = related.length ? `<a href="/trending/${related[0].slug}">${esc(title)}</a>` : esc(title);
          return `<li>${link}</li>`;
        })
        .join('');
      return `<section><h2>${esc(c.country)}</h2><ul>${items}</ul></section>`;
    })
    .join('');
  return `<section class="trending-today"><h2>أكثر ما يبحث عنه الخليج اليوم</h2>
  <p>مواضيع رائجة اليوم في دول الخليج وفق Google Trends ${esc(SNAPSHOT.date || '')}، مع روابط إلى أدلتنا الشاملة المرتبطة بها.</p>${blocks}
  <p><a href="/trending/today">عرض كل المواضيع الرائجة اليوم</a></p></section>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// هيكل الصفحة العربي الموحّد (مطابق لبقية صفحات الموقع) — يضم التنقل والتذييل
function arShell(innerHtml) {
  return `<div id="root"><div class="prerender-shell" dir="rtl" lang="ar">
  <header class="prerender-nav">
    <a href="/"><strong>تقويم السعودية</strong></a>
    <nav>
      <a href="/trending">المواضيع الرائجة</a>
      <a href="/countdown">كم باقي على…</a>
      <a href="/today">التاريخ اليوم</a>
      <a href="/salaries">مواعيد الرواتب</a>
      <a href="/hijri-calendar">التقويم الهجري</a>
      <a href="/name-decoration">زخرفة الأسماء</a>
      <a href="/articles">مقالات</a>
    </nav>
  </header>
  ${innerHtml}
  <footer class="prerender-footer">
    <a href="/about">عن الموقع</a> ·
    <a href="/contact">اتصل بنا</a> ·
    <a href="/privacy">سياسة الخصوصية</a> ·
    <a href="/terms">شروط الاستخدام</a>
  </footer>
  </div></div>`;
}

// عدّ الكلمات (للتأكد من أن الصفحات طويلة +1000 كلمة)
export function countWords(html) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.split(' ').filter(Boolean).length;
}

function breadcrumbs(crumbs) {
  const items = crumbs.map((c, i) => {
    const last = i === crumbs.length - 1;
    return last
      ? `<span aria-current="page">${esc(c.label)}</span>`
      : `<a href="${c.href}">${esc(c.label)}</a>`;
  });
  return `<nav class="prerender-shell breadcrumbs" aria-label="breadcrumb">${items.join(' › ')}</nav>`;
}

function relatedBlock(list, label) {
  if (!list || !list.length) return '';
  return `<section class="related-links"><h2>${esc(label)}</h2><div class="grid2">${list
    .map((l) => `<a href="${l.href}">${esc(l.title)}</a>`)
    .join('')}</div></section>`;
}

function faqBlock(faq) {
  if (!faq || !faq.length) return '';
  return `<section class="faq-block"><h2>الأسئلة الشائعة</h2>${faq
    .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
    .join('')}</section>`;
}

function factsTable(facts) {
  if (!facts || !facts.length) return '';
  return `<section><h2>معلومات سريعة</h2><table><tbody>${facts
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join('')}</tbody></table></section>`;
}

// فقرة ختامية وأهم النقاط مشتقّة من بيانات الموضوع نفسه (عناوينه وحقائقه وكلماته)
// فتكون طويلة وفريدة لكل صفحة وليست قالباً عاماً متكرراً بين الصفحات.
function keyPointsSection(topic) {
  return `<section><h2>أهم النقاط المستفادة من هذا الدليل</h2><ul>${topic.sections
    .map((s) => `<li>تناولنا «${esc(s.heading)}» بعمق مع أمثلة عملية تساعدك على التطبيق مباشرة في حياتك اليومية أو نشاطك التجاري.</li>`)
    .join('')}</ul></section>`;
}

function conclusionSection(topic, catLabel) {
  const facts = (topic.facts || []).map(([k, v]) => `${esc(k)} (${esc(v)})`).join('، ');
  const head = topic.sections[0] ? topic.sections[0].heading : 'الموضوع';
  return `<section><h2>خلاصة شاملة</h2>
  <p>في ختام هذا الدليل الطويل حول «${esc(topic.title)}» ضمن فئة «${esc(catLabel)}»، نؤكد أن المعرفة الدقيقة والمنظمة هي أساس أي قرار ناجح؛ فقد استعرضنا بالتفصيل ${topic.sections.length} محاور رئيسية تغطي الجوانب العملية والنظرية، وبدءنا من «${esc(head)}» وصولاً إلى النصائح التطبيقية.</p>
  <p>من أهم الحقائق التي يجب أن تستحضرها دائماً: ${facts}. هذه المعلومات مجمعة بعناية لتمنحك صورة كاملة دون الحاجة للتنقل بين عشرات المصادر، وهي تحدث باستمرار لتعكس أحدث المستجدات في السوق والحياة في الخليج.</p>
  <p>ننصحك بالاحتفاظ بهذه الصفحة كمصدر مرجعي والعودة إليها عند الحاجة، ومشاركتها مع من قد يستفيد من هذه المعلومات القيمة من أفراد عائلتك وأصدقائك، كما يمكنك تصفح باقي المواضيع ذات الصلة أسفل الصفحة للتعمق أكثر في المجالات التي تهمك.</p>
  </section>`;
}

function actionStepsSection(topic) {
  const steps = topic.sections
    .map((s, i) => `<li>${i === 0 ? 'ابدأ أولاً' : 'ثم انتقل إلى'} التعمق في «${esc(s.heading)}» الوارد أعلاه، وطبّق الخطوات العملية المذكورة فيه على حالتك الخاصة؛ فهذا من أكثر المحاور التي تحقق نتيجة ملموسة لكل من يهتم بهذا الموضوع في الخليج.</li>`)
    .join('');
  return `<section><h2>خطوات عملية للتطبيق المباشر</h2><ol>${steps}</ol><p>بعد تطبيق هذه الخطوات بالترتيب، ستكون قد ألممت بجميع جوانب «${esc(topic.title)}» وتمكنت من تحويل المعلومات النظرية إلى قرارات عملية ملموسة تناسب احتياجاتك.</p></section>`;
}

function keywordsToQa(topic) {
  const kw = Array.isArray(topic.keywords) ? topic.keywords : String(topic.keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
  const extras = (topic.facts || []).slice(0, 3).map(([k, v]) => ({ q: `ما أبرز ما يخص «${k}» في هذا الموضوع؟`, a: `${k}: ${v}. هذه من المعلومات الأساسية التي ينبغي لكل من يهتم بـ«${topic.title}» أن يكون ملماً بها.` }));
  const stem = kw.slice(0, 2).map((k) => ({ q: `هل هناك دليل عملي مفصل حول «${k}»؟`, a: `نعم، هذا الدليل يغطي «${k}» بالتفصيل مع أمثلة عملية وخطوات واضحة، ويساعدك على اتخاذ القرار الصحيح دون عناء البحث الطويل.` }));
  return [...extras, ...stem].slice(0, 4);
}

function extraFaq(topic) {
  const qa = keywordsToQa(topic);
  if (!qa.length) return '';
  return `<section class="faq-block"><h2>أسئلة يبحث عنها المستخدمون</h2>${qa
    .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
    .join('')}</section>`;
}

// بناء جسم الصفحة الطويل (+1000 كلمة)
function buildBody(topic, catLabel, relatedTopics, relatedLinksArr) {
  const introHtml = topic.intro.map((p) => `<p>${esc(p)}</p>`).join('');
  const sectionsHtml = topic.sections
    .map((s) => `<section><h2>${esc(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`)
    .join('');
  const crumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'المواضيع الرائجة', href: '/trending' },
    { label: catLabel, href: `/trending/${topic.category}` },
    { label: topic.title, href: `/trending/${topic.slug}` },
  ];
  const relLinks = relatedLinksArr.map((s) => {
    const t = TOPICS.find((x) => x.slug === s);
    if (!t) return null;
    return { href: `/trending/${t.slug}`, title: t.title };
  }).filter(Boolean);
  return arShell([
    breadcrumbs(crumbs),
    `<main><article>`,
    `<h1>${esc(topic.title)}</h1>`,
    introHtml,
    sectionsHtml,
    factsTable(topic.facts),
    keyPointsSection(topic),
    actionStepsSection(topic),
    conclusionSection(topic, catLabel),
    faqBlock(topic.faq),
    extraFaq(topic),
    relatedBlock([...(relatedTopics || []), ...relLinks], 'مواضيع ذات صلة'),
    `</article></main>`,
  ].join('\n'));
}

function topicJsonLd(topic, catLabel) {
  const kw = Array.isArray(topic.keywords) ? topic.keywords : String(topic.keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: topic.title,
      description: topic.description,
      inLanguage: 'ar-SA',
      author: { '@type': 'Organization', name: 'تقويم السعودية' },
      publisher: { '@type': 'Organization', name: 'تقويم السعودية' },
      keywords: kw.join(', '),
      articleSection: catLabel,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: 'المواضيع الرائجة', item: SITE_URL + '/trending' },
        { '@type': 'ListItem', position: 3, name: catLabel, item: `${SITE_URL}/trending/${topic.category}` },
        { '@type': 'ListItem', position: 4, name: topic.title, item: `${SITE_URL}/trending/${topic.slug}` },
      ],
    },
  ];
}

// بناء المسارات (hub + صفحات الفئات + صفحات المواضيع)
export function buildTrendingRoutes() {
  const routes = [];

  // صفحة المركز /trending
  const catBlocks = Object.keys(CATS)
    .map((code) => {
      const c = CATS[code];
      const items = TOPICS.filter((t) => t.category === code);
      if (!items.length) return '';
      return `<section><h2>${esc(c.emoji)} ${esc(c.ar)}</h2><div class="grid2">${items
        .map((t) => `<a href="/trending/${t.slug}">${esc(t.title)}</a>`)
        .join('')}</div></section>`;
    })
    .join('');
  const hubBody = arShell([
    breadcrumbs([{ label: 'الرئيسية', href: '/' }, { label: 'المواضيع الرائجة', href: '/trending' }]),
    `<main><article><h1>المواضيع الرائجة والمطلوبة في الخليج</h1>`,
    `<p>مجموعة متجددة من الأدلة الشاملة والمواضيع الأكثر بحثاً لدى المستخدمين في دول الخليج العربي، مكتوبة بعناية وتُحدَّث باستمرار لتقديم معلومات دقيقة ومفيدة في الاقتصاد والتقنية والحياة والتعليم والدين والسفر.</p>`,
    trendingTodayHtml(),
    catBlocks,
    `</article></main>`,
  ].join('\n'));
  routes.push({
    path: '/trending',
    kind: 'trending-hub',
    lang: 'ar',
    title: 'المواضيع الرائجة في الخليج | تقويم السعودية',
    description: 'دلائل ومواضيع شاملة وأكثر ما يبحث عنه المستخدمون في الخليج: الاقتصاد، التقنية، الحياة، التعليم، الدين والسفر.',
    keywords: 'المواضيع الرائجة, الأكثر بحثاً, أدلة شاملة, الاقتصاد, التقنية, السفر, الخليج',
    body: hubBody,
    changefreq: 'daily',
    priority: '0.8',
    immediate: true,
    jsonLd: [],
  });

  // صفحة «ما يبحث عنه الخليج اليوم» (من لقطة Google Trends)
  if (SNAPSHOT && SNAPSHOT.countries) {
    const countries = Object.entries(SNAPSHOT.countries).filter(([, c]) => c && c.titles && c.titles.length);
    if (countries.length) {
      const blocks = countries
        .map(([, c]) => `<section><h2>${esc(c.country)}</h2><ul>${c.titles.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`)
        .join('');
      const body = arShell([
        breadcrumbs([{ label: 'الرئيسية', href: '/' }, { label: 'المواضيع الرائجة', href: '/trending' }, { label: 'أكثر ما يبحث عنه اليوم', href: '/trending/today' }]),
        `<main><article><h1>أكثر ما يبحث عنه الخليج اليوم</h1><p>قائمة بالمواضيع الأكثر رواجاً في محركات البحث داخل دول الخليج اليوم (${esc(SNAPSHOT.date || '')}) وفق Google Trends، مع روابط إلى أدلتنا الشاملة.</p>${blocks}</article></main>`,
      ].join('\n'));
      routes.push({
        path: '/trending/today',
        kind: 'trending-today',
        lang: 'ar',
        title: 'أكثر ما يبحث عنه الخليج اليوم | تقويم السعودية',
        description: 'المواضيع الأكثر بحثاً في دول الخليج اليوم وفق Google Trends.',
        keywords: 'الأكثر بحثاً اليوم, ترند الخليج, Google Trends, مواضيع رائجة اليوم',
        body,
        changefreq: 'daily',
        priority: '0.8',
        immediate: true,
        jsonLd: [],
      });
    }
  }

  // صفحات الفئات
  for (const [code, c] of Object.entries(CATS)) {
    const items = TOPICS.filter((t) => t.category === code);
    const listHtml = items.map((t) => `<li><a href="/trending/${t.slug}">${t.title}</a></li>`).join('');
    const body = arShell([
      breadcrumbs([{ label: 'الرئيسية', href: '/' }, { label: 'المواضيع الرائجة', href: '/trending' }, { label: c.ar, href: `/trending/${code}` }]),
      `<main><article><h1>${esc(c.emoji)} ${esc(c.ar)}</h1><p>أدلة ومواضيع شاملة ضمن فئة «${esc(c.ar)}» الأكثر بحثاً في الخليج.</p><ul>${listHtml}</ul></article></main>`,
    ].join('\n'));
    routes.push({
      path: `/trending/${code}`,
      kind: 'trending-category',
      lang: 'ar',
      category: code,
      title: `${c.ar} | المواضيع الرائجة في الخليج | تقويم السعودية`,
      description: `أدلة شاملة في فئة ${c.ar} — المواضيع الأكثر بحثاً في الخليج العربي.`,
      keywords: `${c.ar}, مواضيع رائجة, الخليج, دليل شامل`,
      body,
      changefreq: 'daily',
      priority: '0.7',
      immediate: true,
      jsonLd: [],
    });
  }

  // صفحات المواضيع
  for (const t of TOPICS) {
    const catLabel = CATS[t.category] ? CATS[t.category].ar : t.category;
    const kw = Array.isArray(t.keywords) ? t.keywords : String(t.keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
    const relArr = [...(t.related || []), ...TOPICS.filter((x) => x.category === t.category && x.slug !== t.slug).map((x) => x.slug)].slice(0, 8);
    const body = buildBody(t, catLabel, relArr, []);
    const words = countWords(body);
    routes.push({
      path: `/trending/${t.slug}`,
      kind: 'trending',
      lang: 'ar',
      category: t.category,
      param: t.slug,
      title: `${t.title} | تقويم السعودية`,
      description: t.description,
      keywords: kw.join(', '),
      body,
      changefreq: 'daily',
      priority: '0.8',
      immediate: true,
      jsonLd: topicJsonLd(t, catLabel),
      relatedTopics: relArr,
      words,
    });
  }

  return routes;
}
