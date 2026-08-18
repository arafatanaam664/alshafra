// Prerender script: generates a static HTML file for each route so search
// engines see fully-formed metadata AND visible body content instead of a
// blank SPA shell with just <div id="root"></div>.
// Run after `vite build` — reads dist/index.html as the template, injects
// per-route meta tags + JSON-LD + visible HTML body, writes dist/<path>/index.html.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  formatGregorian,
  formatHijri,
  gregorianToHijri,
  hijriMonthLength,
  isoDate,
  loadCountdowns,
  resolveAll,
  resolveCountdown,
  todayInRiyadh,
  weekdayName,
} from './countdowns.mjs';
import { mergeCatalog, PRERENDER_CSS as GLOBAL_CSS } from './catalog.mjs';
import { buildTrendingRoutes } from './trending.mjs';

const SITE_URL = 'https://alshafra.com';
const SITE_NAME = 'الشفرة';

const distDir = join(process.cwd(), 'dist');
const rootDir = process.cwd();
const templatePath = join(distDir, 'index.html');

if (!existsSync(templatePath)) {
  console.error('[prerender] dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Article data ------------------------------------------------------------
// React and prerender intentionally read one reviewed source of truth.
const ARTICLES = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'articles.json'), 'utf-8'),
).articles;
const CORE_GUIDES = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'core-guides.json'), 'utf-8'),
);
const FAULT_CODES = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'fault-codes.json'), 'utf-8'),
).faultCodes.filter((item) => item.status === 'published');
const CMS_CONTENT = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'cms-content.json'), 'utf-8'),
).items.filter((item) => item.status === 'published' && item.indexable);

function faultPath(item) {
  return `/fault-codes/${item.deviceSlug}/${item.brandSlug}/${item.slug}`;
}

function faultCardList(items) {
  return `<ul>${items.map((item) => `<li><a href="${faultPath(item)}"><bdi>${esc(item.code)}</bdi> — ${esc(item.title)}</a></li>`).join('')}</ul>`;
}

function faultCodeRoutes() {
  const latestReview = FAULT_CODES.map((item) => item.reviewedAt).sort().at(-1) || '2026-08-18';
  const devices = [...new Map(FAULT_CODES.map((item) => [item.deviceSlug, item.deviceName])).entries()];
  const brands = [...new Map(FAULT_CODES.map((item) => [`${item.deviceSlug}/${item.brandSlug}`, item])).values()];
  const shared = { reviewed: true, indexable: true, lang: 'ar', kind: 'fault-code', lastmod: latestReview };
  const hub = {
    ...shared,
    path: '/fault-codes',
    kind: 'fault-code-hub',
    title: 'دليل أكواد الأعطال للأجهزة المنزلية | الشفرة',
    description: 'ابحث عن معنى كود العطل حسب الجهاز والعلامة التجارية، واقرأ الأسباب وخطوات الفحص الآمنة والمصادر الرسمية ومتى تحتاج إلى فني.',
    keywords: 'أكواد الأعطال, رموز الأعطال, أعطال الغسالات, صيانة منزلية',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'دليل أكواد الأعطال', url: `${SITE_URL}/fault-codes`, inLanguage: 'ar' }],
    body: bodyWithNoscript(`<h1>دليل أكواد الأعطال للأجهزة المنزلية</h1><p>افهم الرمز الظاهر على جهازك قبل أن تطلب الفني. نربط كل شرح بنوع الجهاز والعلامة ونطاق الموديل ومصدر الشركة، ونفصل الفحوص الخارجية الآمنة عن الإصلاح الداخلي.</p><h2>تصفح حسب الجهاز</h2><ul>${devices.map(([slug, name]) => `<li><a href="/fault-codes/${slug}">أكواد أعطال ${esc(name)}</a></li>`).join('')}</ul><h2>الأكواد المراجعة</h2>${faultCardList(FAULT_CODES)}<h2>قبل تطبيق أي خطوة</h2><p>قد يحمل الرمز نفسه معنى مختلفاً بين علامتين أو سلسلتين. طابق رقم الموديل مع كتيب الجهاز، وافصل الكهرباء ومصدر الماء عند طلب التعليمات ذلك، وتوقف عند وجود تسريب أو رائحة احتراق أو خطر كهربائي.</p>`),
  };
  const deviceRoutes = devices.map(([slug, name]) => {
    const items = FAULT_CODES.filter((item) => item.deviceSlug === slug);
    return {
      ...shared,
      path: `/fault-codes/${slug}`,
      kind: 'fault-code-device',
      title: `أكواد أعطال ${name} ومعاني الرموز | الشفرة`,
      description: `تصفح أكواد أعطال ${name} الموثقة بالمصادر، مع الأسباب المحتملة وخطوات الفحص الآمنة ومتى يحتاج الجهاز إلى فني.`,
      keywords: `أكواد أعطال ${name}, رموز الأعطال, دليل الصيانة`,
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `أكواد أعطال ${name}`, url: `${SITE_URL}/fault-codes/${slug}`, inLanguage: 'ar' }],
      body: bodyWithNoscript(`<h1>أكواد أعطال ${esc(name)}</h1><p>اختر العلامة ثم الرمز الظاهر على الجهاز. يجب مطابقة نوع الجهاز والسلسلة ورقم الموديل قبل تطبيق الفحص لأن الرموز ليست موحدة بين الشركات.</p><h2>العلامات المتاحة</h2><ul>${brands.filter((item) => item.deviceSlug === slug).map((item) => `<li><a href="/fault-codes/${slug}/${item.brandSlug}">${esc(item.brandName)}</a></li>`).join('')}</ul><h2>الأكواد المنشورة</h2>${faultCardList(items)}`),
    };
  });
  const brandRoutes = brands.map((brand) => {
    const items = FAULT_CODES.filter((item) => item.deviceSlug === brand.deviceSlug && item.brandSlug === brand.brandSlug);
    return {
      ...shared,
      path: `/fault-codes/${brand.deviceSlug}/${brand.brandSlug}`,
      kind: 'fault-code-brand',
      title: `أكواد أعطال ${brand.deviceName} ${brand.brandName} | الشفرة`,
      description: `معاني أكواد أعطال ${brand.deviceName} ${brand.brandName} المراجعة، مع نطاق الموديل والمصادر الرسمية وخطوات الفحص الآمنة.`,
      keywords: `أكواد ${brand.brandName}, أعطال ${brand.deviceName}, رموز الأعطال`,
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `أكواد أعطال ${brand.deviceName} ${brand.brandName}`, url: `${SITE_URL}/fault-codes/${brand.deviceSlug}/${brand.brandSlug}`, inLanguage: 'ar' }],
      body: bodyWithNoscript(`<h1>أكواد أعطال ${esc(brand.deviceName)} ${esc(brand.brandName)}</h1><p>هذه الصفحات تخص الرموز التي تحقق منها فريق التحرير من مصدر الشركة. طابق الرمز ورقم الموديل مع كتيب جهازك لأن موضع الفلتر والخطوات والمعنى قد تختلف.</p><h2>الرموز المتاحة</h2>${faultCardList(items)}<h2>حدود الدليل</h2><p>نشرح ما يمكن فحصه من الخارج بأمان. فتح الغطاء أو اختبار الأسلاك أو المضخات والصمامات الداخلية عمل فني مؤهل.</p>`),
    };
  });
  const detailRoutes = FAULT_CODES.map((item) => ({
    ...shared,
    path: faultPath(item),
    title: `${item.seoTitle} | الشفرة`,
    description: item.description,
    keywords: `${item.code}, ${item.brandName}, ${item.deviceName}, كود عطل, حل آمن`,
    lastmod: item.reviewedAt,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'TechArticle', headline: item.title,
      description: item.description, datePublished: item.publishedAt, dateModified: item.reviewedAt,
      inLanguage: 'ar', author: { '@type': 'Organization', name: 'فريق تحرير الشفرة' },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
      mainEntityOfPage: `${SITE_URL}${faultPath(item)}`,
    }],
    body: bodyWithNoscript(`<article><p class="updated">آخر مراجعة: ${esc(item.reviewedAt)}</p><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p><section><h2>الإجابة المختصرة</h2><p>${esc(item.shortAnswer)}</p></section><section><h2>نطاق الموديلات</h2><p>${esc(item.modelScope)}</p></section><section><h2>تنبيه السلامة</h2><p>${esc(item.warning)}</p></section><section><h2>الأسباب المحتملة</h2>${item.causes.map((cause) => `<h3>${esc(cause.title)}</h3><p>${esc(cause.detail)}</p>`).join('')}</section><section><h2>خطوات الفحص الآمنة</h2><ol>${item.safeChecks.map((check) => `<li><strong>${esc(check.title)}:</strong> ${esc(check.detail)}</li>`).join('')}</ol></section><section><h2>جدول تشخيص سريع</h2><table><thead><tr><th>الملاحظة</th><th>السبب الأقرب</th><th>الإجراء الأول</th></tr></thead><tbody>${item.diagnosis.map((row) => `<tr><td>${esc(row.observation)}</td><td>${esc(row.likelyCause)}</td><td>${esc(row.firstAction)}</td></tr>`).join('')}</tbody></table></section><section><h2>متى تتوقف وتطلب فنيًا؟</h2><ul>${item.stopConditions.map((condition) => `<li>${esc(condition)}</li>`).join('')}</ul></section><section><h2>أسئلة شائعة</h2>${item.faq.map((faq) => `<h3>${esc(faq.q)}</h3><p>${esc(faq.a)}</p>`).join('')}</section><section><h2>المصادر الرسمية والتحقق</h2><p>يبقى كتيب رقم الموديل والدعم المحلي للشركة المرجع النهائي.</p><ul>${item.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join('')}</ul></section></article>`),
  }));
  return [hub, ...deviceRoutes, ...brandRoutes, ...detailRoutes];
}

function safeMarkdownHtml(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => { if (paragraph.length) output.push(`<p>${esc(paragraph.join(' '))}</p>`); paragraph = []; };
  const flushList = () => { if (list.length) output.push(`<ul>${list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`); list = []; };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    if (line.startsWith('### ')) { flushParagraph(); flushList(); output.push(`<h3>${esc(line.slice(4).trim())}</h3>`); continue; }
    if (line.startsWith('## ')) { flushParagraph(); flushList(); output.push(`<h2>${esc(line.slice(3).trim())}</h2>`); continue; }
    if (/^[-*]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^[-*]\s+/, '').trim()); continue; }
    flushList(); paragraph.push(line);
  }
  flushParagraph(); flushList();
  return output.join('');
}

function cmsRoutes() {
  return CMS_CONTENT.map((item) => ({
    path: item.canonical_path,
    title: `${item.seo_title || item.title} | الشفرة`,
    description: item.description,
    keywords: (item.keywords || []).join(', '),
    image: item.cover_image_url || null,
    lastmod: item.reviewed_at || item.updated_at,
    lang: item.locale,
    kind: item.type,
    reviewed: true,
    indexable: true,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': item.type === 'landing_page' ? 'WebPage' : 'Article',
      headline: item.title, description: item.description,
      datePublished: item.published_at || item.updated_at, dateModified: item.reviewed_at || item.updated_at,
      inLanguage: item.locale, author: { '@type': 'Person', name: item.author_name || 'فريق تحرير الشفرة' },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
      mainEntityOfPage: `${SITE_URL}${item.canonical_path}`,
      ...(item.cover_image_url ? { image: item.cover_image_url } : {}),
    }],
    body: bodyWithNoscript(`<article><p class="updated">آخر تحديث: ${esc(item.reviewed_at || item.updated_at)}</p><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p>${item.cover_image_url ? `<img src="${esc(item.cover_image_url)}" alt="${esc(item.cover_image_alt || item.title)}" width="1280" height="720">` : ''}${safeMarkdownHtml(item.body_markdown)}${item.sources?.length ? `<section><h2>المصادر والمراجع</h2><ul>${item.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join('')}</ul></section>` : ''}</article>`),
  }));
}

function editorialGuideHtml(path) {
  const sections = CORE_GUIDES[path];
  if (!sections?.length) return '';
  return `<aside class="editorial-guide" aria-label="دليل الصفحة">${sections.map((section) => `<section><h2>${esc(section.heading)}</h2>${section.paragraphs
    .map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join('')}</ul>` : ''}</section>`).join('')}</aside>`;
}

function injectEditorialGuide(bodyHtml, path) {
  const guide = editorialGuideHtml(path);
  return guide && bodyHtml.includes('</main>') ? bodyHtml.replace('</main>', `${guide}\n</main>`) : bodyHtml;
}

function articleRoutes() {
  return ARTICLES.map((a) => ({
    path: `/articles/${a.slug}`,
    title: `${a.seoTitle || a.title} | تقويم السعودية`,
    description: a.description,
    keywords: a.keywords,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: a.description,
        datePublished: a.updatedAt,
        dateModified: a.reviewedAt || a.updatedAt,
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: 'فريق تحرير تقويم السعودية' },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.svg' },
        },
      },
      ...(a.faq && a.faq.length
        ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: a.faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }]
        : []),
    ],
    body: bodyWithNoscript(`
      <article>
      <p class="updated">مراجعة تحريرية: ${esc(a.reviewedAt || a.updatedAt)}</p>
      <h1>${esc(a.title)}</h1>
      <p>${esc(a.description)}</p>
${a.sections.map((s) => `      <section><h2>${esc(s.heading)}</h2>\n      <p>${esc(s.body)}</p></section>`).join('\n')}
${a.sources && a.sources.length ? `      <section><h2>المصادر الرسمية والتحقق</h2><p>رُوجع الدليل مقابل المصادر التالية، ويكون الإعلان الأحدث للجهة هو المرجع النهائي.</p><ul>${a.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join('')}</ul></section>` : ''}
${a.faq && a.faq.length ? `      <section><h2>الأسئلة الشائعة</h2>\n${a.faq.map((f) => `      <h3>${esc(f.q)}</h3>\n      <p>${esc(f.a)}</p>`).join('\n')}</section>` : ''}
      </article>
    `),
    lastmod: a.reviewedAt || a.updatedAt,
    kind: 'article',
    lang: 'ar',
    category: a.category,
  }));
}

// --- Countdown pages ("كم باقي على…") ----------------------------------------
// Built from src/data/countdowns.json — the same file the React app imports —
// with every date resolved at build time through the Umm Al-Qura table, so the
// crawlable HTML already contains the real Gregorian + Hijri dates instead of
// an empty shell that only fills in after JavaScript runs.

const TODAY_SA = todayInRiyadh();
const TODAY_HIJRI = gregorianToHijri(TODAY_SA.year, TODAY_SA.month, TODAY_SA.day);
const COUNTDOWNS = loadCountdowns();
const COUNTDOWN_GUIDES = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'countdown-guides.json'), 'utf-8'),
);

const COUNTDOWN_CATEGORY_LABELS = {
  national: 'وطنية',
  religious: 'دينية',
  salary: 'الرواتب والدعم',
  school: 'دراسية',
  seasonal: 'مواسم',
};

function fillCountdownGuide(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function countdownGuideHtml(def, resolved) {
  const values = {
    event: def?.title || 'الموعد الذي تختاره',
    date: resolved?.gregorianText || 'التاريخ المكتوب في صفحة كل عدّاد',
  };
  const sections = [
    ...COUNTDOWN_GUIDES.universal,
    ...(def ? (COUNTDOWN_GUIDES.categories[def.category] || []) : []),
  ];
  return sections.map((section) => `<section><h2>${esc(fillCountdownGuide(section.heading, values))}</h2>${section.paragraphs
    .map((paragraph) => `<p>${esc(fillCountdownGuide(paragraph, values))}</p>`).join('')}</section>`).join('');
}

function countdownHubRoute() {
  const resolved = resolveAll(TODAY_SA);
  const groups = ['religious', 'national', 'salary', 'school', 'seasonal'];
  const listHtml = groups
    .map((g) => {
      const items = resolved.filter((r) => r.def.category === g);
      if (!items.length) return '';
      return `      <h2>عدّادات ${COUNTDOWN_CATEGORY_LABELS[g]}</h2>\n      <ul>\n${items
        .map(
          (r) =>
            `        <li><a href="/countdown/${r.def.slug}">${r.def.question}</a> — ${
              r.date ? `${r.gregorianText} الموافق ${r.hijriText} (${r.weekdayText})، باقٍ ${r.daysRemaining} يوماً.` : r.def.summary
            }</li>`,
        )
        .join('\n')}\n      </ul>`;
    })
    .filter(Boolean)
    .join('\n');

  return {
    path: '/countdown',
    title: 'كم باقي على؟ عدادات المناسبات والرواتب في السعودية | تقويم السعودية',
    description:
      'عدّادات تنازلية مباشرة: كم باقي على رمضان، عيد الفطر، عيد الأضحى، اليوم الوطني، يوم التأسيس، حساب المواطن، الرواتب، بداية الدراسة والإجازات — محسوبة وفق تقويم أم القرى بتوقيت الرياض.',
    keywords:
      'كم باقي على رمضان, كم باقي على العيد, كم باقي على الراتب, كم باقي على اليوم الوطني, عداد تنازلي, كم باقي على حساب المواطن, كم باقي على الدراسة',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'العدّادات التنازلية في تقويم السعودية',
        inLanguage: 'ar-SA',
        itemListElement: resolved.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.def.question,
          url: `${SITE_URL}/countdown/${r.def.slug}`,
        })),
      },
    ],
    body: bodyWithNoscript(`
      <h1>كم باقي على…؟ عدّادات تنازلية سعودية</h1>
      <p>عدّاد تنازلي مباشر لكل موعد يهم السعوديين: رمضان والعيدان والمناسبات الوطنية ومواعيد الرواتب وحساب المواطن والضمان والإجازات الدراسية والمواسم — محسوبة من تقويم أم القرى الرسمي وبتوقيت الرياض.</p>
${listHtml}
      <h2>كيف تُحسب هذه العدّادات؟</h2>
      <p>المناسبات الدينية تُشتق من تاريخها الهجري عبر تقويم أم القرى (مثلاً عيد الأضحى = 10 ذو الحجة)، والمناسبات الوطنية من تاريخها الميلادي الثابت، ومواعيد الرواتب والدعم من يوم الصرف الشهري بعد تطبيق قاعدة نهاية الأسبوع (الجمعة تُقدَّم للخميس والسبت يُؤجَّل للأحد)، والمواعيد الدراسية من التقويم المعتمد لوزارة التعليم. جميع الأيام محسوبة بتوقيت الرياض.</p>
${countdownGuideHtml(null, null)}
    `),
  };
}

function countdownRoutes() {
  return COUNTDOWNS.map((def) => {
    const r = resolveCountdown(def, TODAY_SA);
    const description = r.date
      ? `${def.question} ${r.daysRemaining} يوماً — ${r.displayTitle} يوم ${r.weekdayText} ${r.gregorianText} الموافق ${r.hijriText}. عدّاد تنازلي مباشر بالأيام والساعات والدقائق بتوقيت الرياض.`
      : `${def.question} — ${def.summary}`;

    const upcomingHtml =
      r.upcoming.length > 1
        ? `      <h2>المواعيد القادمة</h2>\n      <ul>\n${r.upcoming
            .map((d) => `        <li>${formatGregorian(d)} — ${weekdayName(d)} — ${formatHijri(gregorianToHijri(d.year, d.month, d.day))}</li>`)
            .join('\n')}\n      </ul>`
        : '';

    const relatedHtml = def.related && def.related.length
      ? `      <h2>عدّادات ذات صلة</h2>\n      <ul>\n${def.related
          .map((slug) => COUNTDOWNS.find((c) => c.slug === slug))
          .filter(Boolean)
          .map((c) => `        <li><a href="/countdown/${c.slug}">${c.question}</a></li>`)
          .join('\n')}\n      </ul>`
      : '';

    return {
      path: `/countdown/${def.slug}`,
      title: `${def.question} العدّ التنازلي | تقويم السعودية`,
      description,
      keywords: def.keywords,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: def.question,
          description,
          url: `${SITE_URL}/countdown/${def.slug}`,
          dateModified: isoDate(TODAY_SA),
          inLanguage: 'ar-SA',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: def.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
      ],
      body: bodyWithNoscript(`
      <h1>${def.emoji} ${def.question}</h1>
      <p>${description}</p>
      <h2>${r.displayTitle}</h2>
      <ul>
        <li>التاريخ الميلادي: ${r.gregorianText}</li>
        <li>التاريخ الهجري: ${r.hijriText}</li>
        <li>اليوم: ${r.weekdayText}</li>
        <li>المتبقي: ${r.date ? `${r.daysRemaining} يوماً` : 'يُحدَّث فور اعتماد الموعد رسمياً'}</li>
      </ul>
      <h2>التفاصيل</h2>
${def.paragraphs.map((p) => `      <p>${p}</p>`).join('\n')}
${countdownGuideHtml(def, r)}
      <h2>معلومات سريعة</h2>
      <ul>
${def.notes.map((n) => `        <li>${n}</li>`).join('\n')}
      </ul>
${upcomingHtml}
      <h2>الأسئلة الشائعة</h2>
${def.faq.map((f) => `      <h3>${f.q}</h3>\n      <p>${f.a}</p>`).join('\n')}
${relatedHtml}
      <p><a href="/countdown">كل العدّادات التنازلية</a> · <a href="/today">التاريخ اليوم</a></p>
    `),
    };
  });
}

function todayRoute() {
  const hijriText = formatHijri(TODAY_HIJRI);
  const gregorianText = formatGregorian(TODAY_SA);
  const weekday = weekdayName(TODAY_SA);
  const monthLength = hijriMonthLength(TODAY_HIJRI.year, TODAY_HIJRI.month);
  const upcoming = resolveAll(TODAY_SA).filter((r) => r.date).slice(0, 6);

  return {
    path: '/today',
    title: `التاريخ اليوم: ${hijriText} — ${gregorianText} | تقويم السعودية`,
    description: `التاريخ الهجري والميلادي اليوم في السعودية: ${weekday} ${hijriText} الموافق ${gregorianText} بتوقيت الرياض، وفق تقويم أم القرى الرسمي، مع الوقت الحالي وأقرب المواعيد والمناسبات.`,
    keywords:
      'التاريخ اليوم, كم التاريخ اليوم, التاريخ الهجري اليوم, التاريخ الميلادي اليوم, تاريخ اليوم بالهجري, اليوم كم بالهجري, تقويم أم القرى',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `التاريخ اليوم في السعودية — ${hijriText}`,
        description: `التاريخ الهجري والميلادي اليوم في المملكة العربية السعودية وفق تقويم أم القرى: ${hijriText} الموافق ${gregorianText}.`,
        inLanguage: 'ar-SA',
        url: `${SITE_URL}/today`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'كم التاريخ الهجري اليوم؟',
            acceptedAnswer: { '@type': 'Answer', text: `التاريخ الهجري اليوم هو ${hijriText} وفق تقويم أم القرى الرسمي.` },
          },
          {
            '@type': 'Question',
            name: 'كم التاريخ الميلادي اليوم؟',
            acceptedAnswer: { '@type': 'Answer', text: `التاريخ الميلادي اليوم هو ${gregorianText}، ويوافق يوم ${weekday}.` },
          },
        ],
      },
    ],
    body: bodyWithNoscript(`
      <h1>التاريخ اليوم في السعودية</h1>
      <p>التاريخ الهجري اليوم هو ${hijriText}، الموافق ${gregorianText}، ويوم ${weekday} بتوقيت الرياض وفق تقويم أم القرى الرسمي.</p>
      <h2>تفاصيل اليوم</h2>
      <ul>
        <li>التاريخ الهجري: ${hijriText}</li>
        <li>التاريخ الميلادي: ${gregorianText}</li>
        <li>اليوم: ${weekday}</li>
        <li>عدد أيام الشهر الهجري الحالي: ${monthLength} يوماً</li>
        <li>المتبقي من الشهر الهجري: ${Math.max(0, monthLength - TODAY_HIJRI.day)} يوماً</li>
      </ul>
      <h2>أقرب المواعيد القادمة</h2>
      <ul>
${upcoming
  .map((r) => `        <li><a href="/countdown/${r.def.slug}">${r.displayTitle}</a> — ${r.gregorianText} (باقٍ ${r.daysRemaining} يوماً)</li>`)
  .join('\n')}
      </ul>
      <h2>عن التاريخ الهجري في السعودية</h2>
      <p>تعتمد المملكة العربية السعودية تقويم أم القرى مرجعاً رسمياً للتواريخ الهجرية في المعاملات الحكومية والعقود والإجازات. يُحسب هذا التقويم فلكياً لتحديد بدايات الأشهر، وقد يختلف بيوم واحد عن الرؤية الشرعية المُعلنة لأشهر رمضان وشوال وذي الحجة.</p>
      <p>التاريخ المعروض محسوب بتوقيت الرياض (UTC+3) بغض النظر عن موقع الزائر. لتحويل أي تاريخ آخر استخدم <a href="/date-converter">أداة تحويل التاريخ</a>، ولمعرفة المواعيد القادمة تصفّح <a href="/countdown">العدّادات التنازلية</a>.</p>
    `),
  };
}

// --- Route metadata + body content -------------------------------------------

const routes = [
  {
    path: '/',
    title: 'الشفرة | تقويم السعودية ودليل أكواد الأعطال',
    description:
      'الشفرة تجمع خدمات تقويم السعودية للمواعيد والرواتب والتاريخ مع دليل عربي موثق لفهم أكواد أعطال الأجهزة والفحوص الآمنة.',
    keywords:
      'أكواد الأعطال, التقويم الهجري, مواعيد الرواتب, حساب المواطن, التقويم الدراسي, الإجازات الرسمية, تحويل التاريخ, السعودية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL + '/',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
<h1>الشفرة — تقويم السعودية ودليل أكواد الأعطال</h1>
    <p>منصة للحلول والأدوات والمراجع العملية؛ تحافظ على خدمات تقويم السعودية للرواتب والتاريخ والإجازات، وتضيف دليلاً موثقاً لفهم رموز أعطال الأجهزة والفحوص الخارجية الآمنة.</p>
    <h2>الشفرة إصلاح</h2>
    <ul>
      <li><a href="/fault-codes">دليل أكواد الأعطال</a> — ابحث حسب الجهاز والعلامة والرمز.</li>
      <li><a href="/fault-codes/washing-machines/samsung/4e-4c">كود 4E و4C في غسالة Samsung</a> — معنى مشكلة تزويد الماء والفحوص الآمنة.</li>
      <li><a href="/fault-codes/washing-machines/lg/oe">كود OE في غسالة LG</a> — معنى مشكلة التصريف ومتى تحتاج إلى فني.</li>
    </ul>
    <h2>خدمات تقويم السعودية</h2>
    <ul>
      <li><a href="/countdown">كم باقي على…</a> — عدّادات تنازلية مباشرة لرمضان والعيدين واليوم الوطني والرواتب وبداية الدراسة والإجازات.</li>
      <li><a href="/today">التاريخ اليوم</a> — التاريخ الهجري والميلادي الآن بتوقيت الرياض وفق تقويم أم القرى.</li>
      <li><a href="/salaries">مواعيد الرواتب</a> — رواتب الموظفين الحكوميين وحساب المواطن والمتقاعدين والضمان الاجتماعي والدعم السكني.</li>
      <li><a href="/hijri-calendar">التقويم الهجري</a> — تقويم أم القرى الرسمي لكل الشهور الهجرية مع المناسبات الدينية والوطنية.</li>
      <li><a href="/school-calendar">التقويم الدراسي</a> — موعد بداية الدراسة وإجازات المدارس وفق تقويم وزارة التعليم السعودية.</li>
      <li><a href="/holidays">الإجازات الرسمية</a> — قائمة كاملة بالإجازات الدينية والوطنية مع مدة كل إجازة وتاريخها.</li>
      <li><a href="/date-converter">تحويل التاريخ</a> — حوّل بين التاريخ الهجري والميلادي بدقة وفق تقويم أم القرى.</li>
      <li><a href="/age-calculator">حاسبة العمر</a> — احسب عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي.</li>
    </ul>
    <h2>مقالات</h2>
    <ul>
      <li><a href="/articles/salary-dates-saudi-arabia">مواعيد صرف الرواتب الحكوميين في السعودية 2026-2027</a></li>
      <li><a href="/articles/citizen-account-payment-dates">مواعيد صرف دعم حساب المواطن 2026-2027م</a></li>
      <li><a href="/articles/hijri-calendar-1448">التقويم الهجري 1448هـ — دليل شامل</a></li>
      <li><a href="/articles/school-calendar-1448">التقويم الدراسي 1448-1449هـ (2026-2027م)</a></li>
      <li><a href="/articles/official-holidays-saudi-arabia">الإجازات الرسمية في السعودية 2026-2027م</a></li>
      <li><a href="/articles/hijri-to-gregorian-conversion">كيف تحوّل التاريخ الهجري إلى ميلادي بدقة؟</a></li>
      <li><a href="/articles/developed-social-security">الضمان الاجتماعي المطور 2026-2027م</a></li>
    </ul>
    `),
  },
  {
    path: '/salaries',
    title: 'مواعيد الرواتب وحساب المواطن والمتقاعدين 2026-2027 | تقويم السعودية',
    description:
      'مواعيد صرف الرواتب الحكومية وحساب المواطن ورواتب المتقاعدين والضمان الاجتماعي المطوّر والدعم السكني في المملكة العربية السعودية مع عدّ تنازلي لكل موعد.',
    keywords:
      'مواعيد الرواتب, صرف الرواتب, حساب المواطن, رواتب المتقاعدين, الضمان الاجتماعي, الدعم السكني, موعد الراتب, تقويم الرواتب',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'مواعيد الرواتب',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>مواعيد صرف الرواتب والدعم في السعودية</h1>
      <p>مواعيد صرف رواتب الموظفين الحكوميين، حساب المواطن، رواتب المتقاعدين، الضمان الاجتماعي المطوّر، والدعم السكني في المملكة العربية السعودية، مع عدّ تنازلي مباشر لكل موعد.</p>
      <h2>برامج الصرف</h2>
      <ul>
        <li>رواتب الموظفين الحكوميين — تُصرف في اليوم 27 من كل شهر ميلادي.</li>
        <li>حساب المواطن — يُصرف في اليوم 10 من كل شهر ميلادي.</li>
        <li>رواتب المتقاعدين — تُصرف في اليوم 1 من كل شهر ميلادي (المؤسسة العامة للتأمينات الاجتماعية).</li>
        <li>الضمان الاجتماعي المطوّر — يُصرف في اليوم 1 من كل شهر ميلادي.</li>
        <li>الدعم السكني (سكني) — يُصرف في اليوم 24 من كل شهر ميلادي.</li>
      </ul>
      <h2>قاعدة نهاية الأسبوع في مواعيد الصرف</h2>
      <p>إذا صادف موعد الصرف يوم الجمعة يُقدَّم الإيداع إلى يوم الخميس الذي قبله، وإذا صادف يوم السبت يُؤجَّل إلى يوم الأحد الذي بعده. تطبّق هذه القاعدة وزارة المالية والمؤسسة العامة للتأمينات الاجتماعية وبرنامج حساب المواطن وبرنامج سكني.</p>
      <p>مواعيد الصرف المعروضة تقريبية بناءً على المواعيد الشهرية المعتادة لكل برنامج. قد تتغير المواعيد الفعلية بإعلان رسمي من الجهة المُصدرة (وزارة المالية، المؤسسة العامة للتقاعد، وزارة الموارد البشرية، برنامج سكني، إلخ). يُنصح بمتابعة الإعلانات الرسمية.</p>
    `),
  },
  {
    path: '/hijri-calendar',
    title: 'التقويم الهجري 1448هـ | تقويم أم القرى الرسمي | تقويم السعودية',
    description:
      'التقويم الهجري الرسمي 1448هـ وفق تقويم أم القرى مع جميع المناسبات الدينية والوطنية والإجازات الرسمية لكل شهر هجري، قابل للطباعة والتحميل PDF.',
    keywords:
      'التقويم الهجري, تقويم أم القرى, 1448, التقويم الإسلامي, الشهور الهجرية, المناسبات الدينية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'التقويم الهجري',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>التقويم الهجري — تقويم أم القرى</h1>
      <p>تقويم شهري وفق حساب أم القرى مع عرض المناسبات الدينية والوطنية. لا تعني كل مناسبة ظاهرة في التقويم أنها إجازة نظامية للموظفين.</p>
      <h2>عن التقويم الهجري وأم القرى</h2>
      <p>تستخدم الجهات السعودية تقويم أم القرى في عرض التواريخ الهجرية، بينما ترتبط بدايات رمضان والعيدين والحج بما تعلنه الجهات الرسمية بعد ثبوت الهلال. لذلك قد يختلف التاريخ المتداول يومًا واحدًا.</p>
      <p>اختر الشهر للاطلاع على الأيام وما يقابلها ميلاديًا، وارجع إلى إعلان الجهة المختصة عند ترتيب إجازة أو التزام رسمي.</p>
      <h2>أبرز المناسبات في 1448هـ</h2>
      <ul>
        <li>1 محرم — بداية السنة الهجرية، مناسبة تقويمية وليست إجازة عامة تلقائية في السعودية</li>
        <li>1 رمضان — البداية الحسابية لشهر رمضان، ويُنتظر الإعلان الرسمي</li>
        <li>1 شوال — عيد الفطر، ويُنتظر الإعلان الرسمي</li>
        <li>9 ذو الحجة — يوم عرفة</li>
        <li>10 ذو الحجة — عيد الأضحى، ويُنتظر الإعلان الرسمي</li>
        <li>22 فبراير ميلاديًا — يوم التأسيس السعودي</li>
        <li>23 سبتمبر ميلاديًا — اليوم الوطني السعودي</li>
      </ul>
    `),
  },
  {
    path: '/school-calendar',
    title: 'التقويم الدراسي 1448هـ 2026-2027م | وزارة التعليم السعودية | تقويم السعودية',
    description:
      'التقويم الدراسي الرسمي للعام 1448هـ (2026-2027م) وفق وزارة التعليم السعودية — مواعيد بداية الدراسة، الإجازات المدرسية، الاختبارات، ونهاية العام الدراسي.',
    keywords:
      'التقويم الدراسي, 1448, وزارة التعليم, بداية الدراسة, الإجازات المدرسية, الاختبارات, العام الدراسي',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'التقويم الدراسي',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>التقويم الدراسي 1448-1449هـ (2026-2027م)</h1>
      <p>التقويم الدراسي الرسمي للعام 1448-1449هـ وفق وزارة التعليم السعودية — مواعيد بداية ونهاية الفصول الدراسية وإجازات المدارس لجميع المراحل.</p>
      <h2>متى تبدأ الدراسة في العام 1448-1449هـ؟</h2>
      <p>تبدأ الدراسة للعام الدراسي 1448-1449هـ يوم الأحد 23 أغسطس 2026م الموافق 10 ربيع الأول 1448هـ لجميع مراحل التعليم العام. يعود المعلمون والمعلمات قبل ذلك بيوم الأحد 16 أغسطس 2026م استعداداً لبدء العام الدراسي.</p>
      <h2>كم عدد الفصول الدراسية في العام؟</h2>
      <p>أعلنت وزارة التعليم عودة مدارس التعليم العام إلى نظام الفصلين ابتداءً من 1447-1448هـ ولمدة أربعة أعوام. وقد تختلف ترتيبات مكة والمدينة وجدة والطائف وفق المرونة التي أعلنتها الوزارة؛ لذلك لا يصح الاعتماد على وصف «ثلاثة فصول» القديم.</p>
      <h2>محطات العام الدراسي 1448-1449هـ</h2>
      <ul>
        <li>بداية الدراسة المعروضة: 23 أغسطس 2026 لمعظم المناطق، مع ضرورة مطابقتها بتحديث وزارة التعليم</li>
        <li>إجازة اليوم الوطني: 23 سبتمبر 2026</li>
        <li>إجازة منتصف العام: تظهر وفق التقويم التفصيلي المعتمد للمدرسة والمنطقة</li>
        <li>يوم التأسيس: 22 فبراير 2027</li>
        <li>إجازتا عيد الفطر وعيد الأضحى: تتبعان التقويم الدراسي والإعلانات الرسمية</li>
        <li>نهاية الإطار العام المعروضة: 24 يونيو 2027، وقد تتغير بتحديث رسمي</li>
      </ul>
    `),
  },
  {
    path: '/holidays',
    title: 'الإجازات الرسمية في السعودية 2026 و2027 حسب القطاع | تقويم السعودية',
    description:
      'قائمة كاملة بالإجازات الرسمية في المملكة العربية السعودية لعام 2026-2027م مع تواريخها الهجرية والميلادية ومدة كل إجازة — الأعياد الوطنية والدينية.',
    keywords:
      'الإجازات الرسمية, عيد الفطر, عيد الأضحى, اليوم الوطني, الإجازات السعودية, المناسبات الرسمية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'الإجازات الرسمية',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>الإجازات الرسمية والمناسبات في السعودية 2026-2027م</h1>
      <p>دليل يفرّق بين الإجازة النظامية والمناسبة التقويمية. تختلف مدة إجازتي العيد بين القطاعين العام والخاص والطلاب والمؤسسات المالية، لذا اختر فئتك ولا تفترض أن مدة واحدة تنطبق على الجميع.</p>
      <h2>إجازات القطاع الخاص الأساسية</h2>
      <ul>
        <li>عيد الفطر — أربعة أيام وفق اللائحة التنفيذية لنظام العمل</li>
        <li>عيد الأضحى — أربعة أيام وفق اللائحة التنفيذية لنظام العمل</li>
        <li>اليوم الوطني — يوم واحد في 23 سبتمبر</li>
        <li>يوم التأسيس — يوم واحد في 22 فبراير</li>
      </ul>
      <h2>ما ليس إجازة عامة تلقائية؟</h2>
      <p>رأس السنة الهجرية والمولد النبوي ويوم العلم مناسبات معروفة، لكنها ليست ضمن الإجازات الأربع العامة للقطاع الخاص المذكورة أعلاه. وقد يصدر قرار خاص لجهة أو قطاع، فيُتبع قرارها.</p>
      <h2>قبل ترتيب السفر</h2>
      <p>تحقق من جهة عملك ومن إعلان وزارة الموارد البشرية أو البنك المركزي أو وزارة التعليم حسب فئتك؛ فالصفحة تنظّم المواعيد ولا تستبدل القرار الرسمي.</p>
    `),
  },
  {
    path: '/date-converter',
    title: 'تحويل التاريخ الهجري إلى ميلادي والعكس | تقويم أم القرى | تقويم السعودية',
    description:
      'حوّل التاريخ بين الهجري والميلادي بدقة وفق تقويم أم القرى الرسمي. أدخل أي تاريخ هجري أو ميلادي واحصل على النتيجة فوراً مع يوم الأسبوع.',
    keywords:
      'تحويل التاريخ, هجري إلى ميلادي, ميلادي إلى هجري, تقويم أم القرى, تحويل التواريخ',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'تحويل التاريخ',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>تحويل التاريخ بين الهجري والميلادي</h1>
      <p>أداة دقيقة لتحويل التاريخ بين التقويم الهجري والميلادي وفق تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية. اختر التاريخ ثم اضغط زر التبديل لعكس الاتجاه.</p>
      <h2>كيف تعمل أداة تحويل التاريخ؟</h2>
      <p>تعتمد الأداة على تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية كمرجع للتحويل بين التاريخ الهجري والميلادي. يقوم المحرك بحساب رقم اليوم اليولياني ثم تحويله إلى التقويم المقابل باستخدام القاعدة الحسابية التقريبية لتقويم أم القرى.</p>
      <p>التحويل دقيق لمعظم التواريخ العملية، مع احتمال اختلاف يوم واحد قرب بدايات الأشهر الهجرية لأن رؤية الهلال تعتمد على الرصد الفعلي. للمسائل القانونية والرسمية يُنصح بالرجوع للتقويم الرسمي الصادر عن المملكة.</p>
      <h2>الفرق بين التقويم الهجري والميلادي</h2>
      <p>التقويم الهجري قمري يعتمد على دورة القمر، ومدة السنة 354 أو 355 يوماً (12 شهراً قمرياً). التقويم الميلادي شمسي يعتمد على دورة الأرض حول الشمس، ومدة السنة 365 أو 366 يوماً. لهذا الفرق يسبق التقويم الهجري الميلادي بحوالي 11 يوماً كل سنة.</p>
    `),
  },
  {
    path: '/age-calculator',
    title: 'حاسبة العمر بالهجري والميلادي | تقويم السعودية',
    description:
      'احسب عمرك بدقة بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي. أدخل تاريخ ميلادك واحصل على عمرك الكامل والقادم مع عدد الأيام التي عشتها.',
    keywords: 'حاسبة العمر, حساب العمر, العمر بالهجري, العمر بالميلادي, كم عمري',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'حاسبة العمر',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>حاسبة العمر بالهجري والميلادي</h1>
      <p>أدخل تاريخ ميلادك بالتقويم الميلادي لتحصل على عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي، بالإضافة إلى عدد الأيام والأسابيع والساعات التي عشتها، وعدد الأيام المتبقية على عيد ميلادك القادم.</p>
      <h2>عن حاسبة العمر</h2>
      <p>تحسب هذه الأداة عمرك بالتقويم الميلادي والهجري بدقة، مع عرض الفرق بالأيام والشهور والسنوات. كما تحسب عدد الأيام والأسابيع والساعات الكلية التي عشتها منذ تاريخ ميلادك، وعدد الأيام المتبقية على عيد ميلادك القادم.</p>
      <p>الحساب الهجري يعتمد على تقويم أم القرى التقريبي، وقد يختلف بيوم واحد عن التقويم الرسمي قرب بدايات الأشهر الهجرية.</p>
    `),
  },
  {
    path: '/articles',
    title: 'مقالات عن المواعيد والتقويم في السعودية | تقويم السعودية',
    description:
      'مقالات ودلائل شاملة عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي المطور والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.',
    keywords:
      'مقالات, مواعيد الرواتب, حساب المواطن, الضمان الاجتماعي المطور, التقويم الهجري, الإجازات الرسمية, تحويل التاريخ',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'مواعيد الرواتب في السعودية' },
          { '@type': 'ListItem', position: 2, name: 'مواعيد حساب المواطن' },
          { '@type': 'ListItem', position: 3, name: 'التقويم الهجري 1448هـ' },
          { '@type': 'ListItem', position: 4, name: 'التقويم الدراسي 1448هـ' },
          { '@type': 'ListItem', position: 5, name: 'الإجازات الرسمية في السعودية' },
          { '@type': 'ListItem', position: 6, name: 'تحويل التاريخ الهجري والميلادي' },
          { '@type': 'ListItem', position: 7, name: 'الضمان الاجتماعي المطور' },
        ],
      },
    ],
    body: bodyWithNoscript(`
      <h1>مقالات عن المواعيد والتقويم في السعودية</h1>
      <p>مقالات ودلائل شاملة عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي المطور والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.</p>
      <h2>قائمة المقالات</h2>
      <ul>
        <li><a href="/articles/salary-dates-saudi-arabia">مواعيد صرف الرواتب الحكوميين في السعودية 2026-2027</a></li>
        <li><a href="/articles/citizen-account-payment-dates">مواعيد صرف دعم حساب المواطن 2026-2027م</a></li>
        <li><a href="/articles/hijri-calendar-1448">التقويم الهجري 1448هـ — دليل شامل لكل المناسبات والإجازات</a></li>
        <li><a href="/articles/school-calendar-1448">التقويم الدراسي 1448-1449هـ (2026-2027م) — مواعيد الدراسة والإجازات</a></li>
        <li><a href="/articles/official-holidays-saudi-arabia">الإجازات الرسمية في السعودية 2026-2027م — قائمة كاملة</a></li>
        <li><a href="/articles/hijri-to-gregorian-conversion">كيف تحوّل التاريخ الهجري إلى ميلادي بدقة؟ — دليل عملي</a></li>
        <li><a href="/articles/developed-social-security">الضمان الاجتماعي المطور 2026-2027م | الشروط وخطوات التسجيل وقيمة الدعم</a></li>
      </ul>
    `),
  },
  ...articleRoutes(),
  countdownHubRoute(),
  ...countdownRoutes(),
  todayRoute(),
  ...faultCodeRoutes(),
  ...cmsRoutes(),
  {
    path: '/admin',
    title: 'لوحة تحرير الشفرة',
    description: 'منطقة خاصة للمحررين المخولين لإدارة محتوى موقع الشفرة ومصادره وملفاته.',
    keywords: '',
    jsonLd: [],
    body: bodyWithNoscript('<h1>لوحة تحرير الشفرة</h1><p>هذه منطقة خاصة. فعّل JavaScript وسجّل الدخول بحساب منحه المالك صلاحية تحرير.</p>'),
    indexable: false,
    reviewed: true,
    kind: 'admin',
    lang: 'ar',
  },
  {
    path: '/faq',
    title: 'الأسئلة الشائعة عن المواعيد والتقويم في السعودية | تقويم السعودية',
    description:
      'إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في السعودية.',
    keywords: 'الأسئلة الشائعة, أسئلة, مواعيد الرواتب, حساب المواطن, التقويم الهجري, الإجازات الرسمية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'متى يصرف راتب الشهر الحالي؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'تصرف رواتب الموظفين الحكوميين في اليوم 27 من كل شهر ميلادي.',
            },
          },
          {
            '@type': 'Question',
            name: 'متى ينزل حساب المواطن؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ينزل حساب المواطن في اليوم العاشر من كل شهر ميلادي.',
            },
          },
        ],
      },
    ],
    body: bodyWithNoscript(`
      <h1>الأسئلة الشائعة عن المواعيد والتقويم في السعودية</h1>
      <p>إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في السعودية.</p>
      <h2>متى يصرف راتب الشهر الحالي؟</h2>
      <p>تصرف رواتب الموظفين الحكوميين في اليوم 27 من كل شهر ميلادي. قد يتقدم الصرف في رمضان والإجازات الرسمية.</p>
      <h2>متى ينزل حساب المواطن؟</h2>
      <p>ينزل حساب المواطن في اليوم العاشر من كل شهر ميلادي. إذا صادف اليوم العاشر يوم جمعة أو سبت، قد يتقدم الصرف إلى الخميس الذي يسبقه.</p>
      <h2>متى ينزل دعم الضمان الاجتماعي المطور؟</h2>
      <p>يُصرف دعم الضمان الاجتماعي المطور في اليوم الأول من كل شهر ميلادي، وقد يتقدم الصرف إلى الخميس إذا صادف اليوم الأول عطلة نهاية أسبوع.</p>
      <h2>كيف أحول التاريخ الهجري إلى ميلادي؟</h2>
      <p>استخدم أداة تحويل التاريخ في تقويم السعودية، أو اضرب السنة الهجرية في 0.97 وأضف 621.6 لتحويل تقريبي.</p>
    `),
  },
  {
    path: '/about',
    title: 'عن الشفرة | حلول وأدوات ومراجع عملية',
    description: 'تعرف على منصة الشفرة وقسمي تقويم السعودية والشفرة إصلاح، ورسالتها ومصادر معلوماتها وسياسة المراجعة.',
    keywords: 'عن الشفرة, تقويم السعودية, الشفرة إصلاح, من نحن',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'عن الشفرة',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>عن الشفرة</h1>
      <p>الشفرة منصة مستقلة للحلول والأدوات والمراجع العملية. تحافظ على قسم تقويم السعودية للمواعيد والرواتب والتاريخ، وتضيف قسم الشفرة إصلاح لفهم أكواد أعطال الأجهزة من مصدر الشركة مع حدود سلامة واضحة.</p>
    `),
  },
  {
    path: '/contact',
    title: 'تواصل معنا | الشفرة',
    description: 'تواصل مع فريق تقويم السعودية لأي استفسار أو اقتراح حول المواعيد الرسمية والتقويمات والأدوات.',
    keywords: 'تواصل معنا, اتصال, استفسار, تقويم السعودية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'تواصل معنا',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>تواصل معنا</h1>
      <p>تواصل مع فريق تقويم السعودية لأي استفسار أو اقتراح حول المواعيد الرسمية والتقويمات والأدوات المتاحة على الموقع.</p>
    `),
  },
  {
    path: '/privacy',
    title: 'سياسة الخصوصية | الشفرة',
    description: 'سياسة الخصوصية لموقع الشفرة — كيف نجمع ونستخدم ونحمي بيانات المستخدمين.',
    keywords: 'سياسة الخصوصية, الخصوصية, حماية البيانات',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>سياسة الخصوصية</h1>
      <p>سياسة الخصوصية لموقع الشفرة — كيف نجمع ونستخدم ونحمي بيانات المستخدمين. لا نجمع بيانات شخصية إلا ما يلزم لتشغيل الأدوات وعرض المواعيد الرسمية.</p>
    `),
  },
  {
    path: '/terms',
    title: 'شروط الاستخدام | الشفرة',
    description: 'شروط استخدام موقع الشفرة — القواعد والأحكام لاستخدام الموقع وخدماته.',
    keywords: 'شروط الاستخدام, الأحكام, القواعد',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>شروط الاستخدام</h1>
      <p>شروط استخدام موقع الشفرة — القواعد والأحكام لاستخدام الموقع وخدماته. المعلومات المعروضة على الموقع لأغراض معلوماتية فقط ولا تُغني عن الإعلانات الرسمية.</p>
    `),
  },
];

// تجميد صريح: بيان النشر السابق هو القائمة المسموحة لصفحات الكتالوج المؤتمتة.
// المسارات الجديدة لا تدخل إلا إذا كانت تحريرية وموسومة reviewed في المصدر.
const frozenManifestPath = join(rootDir, 'public', 'published.json');
const frozenPaths = existsSync(frozenManifestPath)
  ? JSON.parse(readFileSync(frozenManifestPath, 'utf-8')).published.map((item) => item.path)
  : [];
const trendingRoutes = buildTrendingRoutes().map((route) => ({ ...route, automated: true }));
const { all: routesGenerated, published: routesFinal, total: catalogTotal, today: buildDate } = mergeCatalog(
  [...routes, ...trendingRoutes],
  { frozenPaths },
);
console.log(`[prerender] publication freeze: considered ${catalogTotal} catalog/editorial definitions; generating ${routesGenerated.length} reviewed or previously published routes (${buildDate}).`);

// --- HTML helpers ------------------------------------------------------------

// The static HTML that every crawler (Googlebot, Bingbot, social + AI bots)
// and every first paint sees. It lives INSIDE #root — not inside <noscript> —
// because content hidden in <noscript> is discounted by search engines and is
// invisible to Bing/Yandex/LLM crawlers, which do not execute JavaScript.
// React replaces this markup on hydration with the interactive version.
function bodyWithNoscript(innerHtml) {
  return `<div id="root"><div class="prerender-shell" dir="rtl" lang="ar">
      <header class="prerender-nav">
        <a href="/"><strong>الشفرة</strong></a>
        <nav>
          <a href="/fault-codes">أكواد الأعطال</a>
          <a href="/countdown">كم باقي على…</a>
          <a href="/today">التاريخ اليوم</a>
          <a href="/salaries">مواعيد الرواتب</a>
          <a href="/hijri-calendar">التقويم الهجري</a>
          <a href="/school-calendar">التقويم الدراسي</a>
          <a href="/holidays">الإجازات الرسمية</a>
          <a href="/date-converter">تحويل التاريخ</a>
          <a href="/articles">مقالات</a>
        </nav>
      </header>
      <main>
${innerHtml}
      </main>
      <footer class="prerender-footer">
        <a href="/about">عن الموقع</a> ·
        <a href="/contact">اتصل بنا</a> ·
        <a href="/privacy">سياسة الخصوصية</a> ·
        <a href="/terms">شروط الاستخدام</a>
      </footer>
    </div></div>`;
}

const PRERENDER_CSS = `<style>
  .prerender-shell{font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;max-width:960px;margin:0 auto;padding:1.25rem 1.25rem 3rem;line-height:1.9;color:#0f3d2e}
  .prerender-shell a{color:#0b6e4f;text-decoration:none}
  .prerender-nav{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;padding:.75rem 0;border-bottom:1px solid rgba(11,110,79,.12);font-size:.9rem}
  .prerender-nav nav{display:flex;flex-wrap:wrap;gap:.75rem}
  .prerender-shell h1{font-size:1.7rem;line-height:1.5;margin:1.25rem 0 .5rem}
  .prerender-shell h2{font-size:1.2rem;margin:1.5rem 0 .5rem}
  .prerender-shell ul{padding-inline-start:1.25rem}
  .prerender-footer{margin-top:2rem;padding-top:1rem;border-top:1px solid rgba(11,110,79,.12);font-size:.85rem;color:#4b6b5f}
</style>`;

function setMeta(html, name, content, attr = 'name') {
  const regex = new RegExp(`<meta ${attr}="${name}"[^>]*>`, 'i');
  const tag = `<meta ${attr}="${name}" content="${content}">`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setLink(html, rel, href) {
  const regex = new RegExp(`<link rel="${rel}"[^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${href}" />`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setAlternateLink(html, hreflang, href) {
  const regex = new RegExp(`<link\\s+rel=["']alternate["'][^>]*hreflang=["']${hreflang}["'][^>]*>`, 'i');
  const tag = `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setTitle(html, title) {
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setJsonLd(html, data) {
  const tag = `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(data)}</script>`;
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setBody(html, bodyContent) {
  return html.replace(/<div id="root"><\/div>/, bodyContent);
}

// --- Internal linking engine ------------------------------------------------
// يبني فهرساً بكلمات مفتاحية وفئات لكل صفحة، ثم لكل صفحة يختار صفحات ذات صلة
// (نفس اللغة + تداخل الكلمات/الفئة) ويحقن رابط «مواضيع ذات صلة» داخل جسم الصفحة،
// فلا تبقى أي صفحة يتيمة (orphan) — بل كل صفحة ترتبط بعدة صفحات وتُربط من غيرها.

const STOPWORDS = new Set([
  'في', 'من', 'على', 'إلى', 'التي', 'الذي', 'و', 'هي', 'هو', 'ما', 'لا', 'كل', 'كان', 'مع', 'عن', 'أن', 'أنه', 'لم', 'لن', 'بين', 'أو', 'لكن', 'ثم', 'هذا', 'هذه', 'ذلك',
  'the', 'and', 'of', 'to', 'in', 'a', 'is', 'for', 'on', 'with', 'at', 'by', 'as', 'an',
]);

function normalizeTerms(str) {
  const tokens = String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && t.length > 1 && !STOPWORDS.has(t));
  return new Set(tokens);
}

function buildLinkIndex(routes) {
  return routes.map((r) => ({
    path: r.path,
    title: r.title || '',
    lang: r.lang || 'ar',
    category: r.category || '',
    terms: normalizeTerms(`${r.title} ${r.keywords || ''} ${r.path}`),
  }));
}

function findRelated(route, index, limit = 6) {
  const self = index.find((i) => i.path === route.path);
  if (!self) return [];
  const scored = [];
  for (const other of index) {
    if (other.path === route.path) continue;
    if (other.lang !== self.lang) continue;
    // تداخل الكلمات المفتاحية + تطابق الفئة
    let score = 0;
    for (const t of other.terms) if (self.terms.has(t)) score += 1;
    if (other.category && other.category === self.category) score += 3;
    if (score <= 0) continue;
    scored.push({ ...other, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => ({ href: s.path, title: s.title }));
}

function injectRelatedLinks(bodyHtml, related) {
  if (!related || !related.length || !bodyHtml.includes('</main>')) return bodyHtml;
  const block = `<section class="related-links"><h2>مواضيع ذات صلة</h2><div class="grid2">${related
    .map((l) => `<a href="${l.href}">${l.title.replace(/ \|.*$/, '')}</a>`)
    .join('')}</div></section>`;
  // لا نضيف إذا كان هناك قسم مشابه موجود أصلاً
  if (bodyHtml.includes('class="related-links"')) return bodyHtml;
  return bodyHtml.replace('</main>', `${block}\n  </main>`);
}

const linkIndex = buildLinkIndex(routesFinal);
const pageWordCounts = [];

function visibleMainWordCount(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const text = main
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ');
  return (text.match(/[\p{L}\p{N}]+/gu) || []).length;
}

function normalizeInternalHref(href) {
  const clean = href.split(/[?#]/, 1)[0];
  if (!clean.startsWith('/')) return clean;
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

function removeUnpublishedLinks(html, allowedPaths) {
  return html.replace(/<a\b([^>]*?)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, href, after, inner) => {
    if (href.includes('undefined')) return inner;
    if (!href.startsWith('/')) return full;
    return allowedPaths.has(normalizeInternalHref(href)) ? full : inner;
  });
}

function assertPageStructure(route, html) {
  const errors = [];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const canonicalCount = (html.match(/<link\s+rel=["']canonical["']/gi) || []).length;
  const robots = html.match(/<meta name="robots" content="([^"]+)">/i)?.[1] || '';
  const googlebot = html.match(/<meta name="googlebot" content="([^"]+)">/i)?.[1] || '';
  if (!route.title || route.title.trim().length < 15) errors.push('missing/short title');
  if (!route.description || route.description.trim().length < 30) errors.push('missing/short description');
  if (!route.body?.includes('<main>')) errors.push('missing visible main content');
  if (h1Count !== 1) errors.push(`expected one H1, found ${h1Count}`);
  if (canonicalCount !== 1) errors.push(`expected one canonical, found ${canonicalCount}`);
  if (route.indexable === false ? !robots.includes('noindex') : !robots.startsWith('index, follow')) {
    errors.push('robots does not match indexable state');
  }
  if (googlebot !== robots) errors.push('googlebot conflicts with robots');
  if (/href="[^"]*undefined/i.test(html)) errors.push('undefined link');
  if (route.kind === 'article' || route.kind === 'fault-code') {
    if ((html.match(/<h2\b/gi) || []).length < 2) errors.push('reviewed article needs section headings');
    if (!html.includes('المصادر')) errors.push('reviewed article needs visible sources');
  }
  if (errors.length) throw new Error(`[prerender] Structural validation failed for ${route.path}: ${errors.join('; ')}`);
}

// --- Generate pages ----------------------------------------------------------

const publishedPaths = new Set(routesFinal.map((route) => route.path));
const routeByPath = new Map(routesFinal.map((route) => [route.path, route]));
let count = 0;
for (const route of routesGenerated) {
  // حقن الدليل التحريري والروابط ذات الصلة من قائمة الصفحات المفهرسة فقط،
  // ثم إزالة أي رابط بقي موجهاً إلى مسار غير منشور.
  if (route.body) route.body = injectEditorialGuide(route.body, route.path);
  const related = findRelated(route, linkIndex, 6);
  if (route.body) {
    if (related.length) route.body = injectRelatedLinks(route.body, related);
    route.body = removeUnpublishedLinks(route.body, publishedPaths);
  }
  let html = template;
  const canonical = SITE_URL + route.path;

  html = setTitle(html, route.title);
  html = setMeta(html, 'description', route.description);
  html = setMeta(html, 'keywords', route.keywords);
  // يبقى ملف SPA الاحتياطي noindex، ولا تُفتح الفهرسة إلا للمسارات ذات
  // indexable=true في قرار النشر المراجع.
  const robotsDirective = route.indexable === false
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  html = setMeta(html, 'robots', robotsDirective);
  html = setMeta(html, 'googlebot', robotsDirective);
  html = setLink(html, 'canonical', canonical);
  html = setMeta(html, 'og:title', route.title, 'property');
  html = setMeta(html, 'og:description', route.description, 'property');
  html = setMeta(html, 'og:url', canonical, 'property');
  html = setMeta(html, 'og:type', route.kind === 'article' || route.kind === 'fault-code' ? 'article' : 'website', 'property');
  html = setMeta(html, 'og:image', route.image || `${SITE_URL}/og-image.jpg`, 'property');
  html = setMeta(html, 'twitter:title', route.title);
  html = setMeta(html, 'twitter:description', route.description);
  html = setMeta(html, 'twitter:image', route.image || `${SITE_URL}/og-image.jpg`);

  // لا نعلن بديلاً إلا إذا كان مفهرساً ويعيد رابطاً متبادلاً إلى هذه الصفحة.
  if (route.hreflang && route.hreflang.length > 0) {
    const validAlternates = route.hreflang.filter((alt) => {
      if (!publishedPaths.has(alt.path)) return false;
      if (alt.path === route.path) return true;
      const counterpart = routeByPath.get(alt.path);
      return counterpart?.hreflang?.some((candidate) => candidate.path === route.path);
    });
    for (const alt of validAlternates) {
      html = setAlternateLink(html, alt.code, SITE_URL + alt.path);
    }
    const xDefault = validAlternates.find((alt) => alt.code === 'en');
    if (xDefault) html = setAlternateLink(html, 'x-default', SITE_URL + xDefault.path);
  }

  if (route.jsonLd && route.jsonLd.length > 0) {
    html = setJsonLd(html, route.jsonLd);
  }

  if (route.body) {
    html = setBody(html, route.body);
    const css = route.lang && route.lang !== 'ar' ? GLOBAL_CSS : PRERENDER_CSS;
    html = html.replace('</head>', `    ${css}\n  </head>`);
  }
  assertPageStructure(route, html);
  pageWordCounts.push({ path: route.path, words: visibleMainWordCount(html) });

  const outDir = route.path === '/' ? distDir : join(distDir, route.path);
  const outFile = join(outDir, 'index.html');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, html, 'utf-8');
  count++;
  if (count <= 5 || count % 50 === 0) console.log(`[prerender] ${route.path}`);
}

const wordRange = pageWordCounts.map((page) => page.words);
console.log(`[prerender] Structural quality gate passed for ${pageWordCounts.length} pages (descriptive word range ${Math.min(...wordRange)}–${Math.max(...wordRange)}; no ranking-oriented minimum).`);
console.log(`[prerender] Done. ${count} static pages generated; ${routesFinal.length} are indexable.`);
// تدقيق الصفحات اليتيمة الحقيقي: نحسب الروابط الواردة، لا مجرد وجود روابط
// خارجة من الصفحة. الروابط في الهيدر والبوابات والأقسام ذات الصلة كلها محتسبة.
const inbound = new Map(routesFinal.map((route) => [route.path, new Set()]));
for (const route of routesFinal) {
  const hrefs = route.body ? [...route.body.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)].map((match) => match[1]) : [];
  for (const href of hrefs) {
    if (!href.startsWith('/') || href === route.path || !publishedPaths.has(href)) continue;
    inbound.get(href).add(route.path);
  }
}
const orphanPaths = routesFinal
  .map((route) => route.path)
  .filter((path) => path !== '/' && inbound.get(path).size === 0);
console.log(`[prerender] Internal links: ${routesFinal.length - orphanPaths.length} pages have inbound links, ${orphanPaths.length} orphans.`);
if (orphanPaths.length) console.warn(`[prerender] Orphan paths: ${orphanPaths.join(', ')}`);

// --- sitemap.xml -------------------------------------------------------------
// Generated from the same route table that produced the HTML, so the sitemap
// can never drift out of sync with the pages that actually exist.

const EDITORIAL_REVIEW_DATE = '2026-08-18';
const DAILY_DYNAMIC_PATHS = new Set(['/today', '/countdown']);
function routeLastmod(route) {
  if (route.lastmod) return String(route.lastmod).slice(0, 10);
  if (DAILY_DYNAMIC_PATHS.has(route.path) || route.path.startsWith('/countdown/')) return buildDate;
  return EDITORIAL_REVIEW_DATE;
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routesFinal.map((r) => {
    const loc = r.path === '/' ? `${SITE_URL}/` : SITE_URL + r.path;
    // lastmod يعكس مراجعة تحريرية أو تغيراً يومياً حقيقياً في بيانات العدّاد.
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${routeLastmod(r)}</lastmod>`,
      '  </url>',
    ].join('\n');
  }),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`[prerender] sitemap.xml written with ${routesFinal.length} URLs (lastmod ${buildDate}).`);

// --- published.json ----------------------------------------------------------
// هذه قائمة الصفحات المفهرسة فقط؛ لا تشمل المسودات أو صفحات الإدارة/المعاينة.
const publishedData = {
  generatedAt: buildDate,
  published: routesFinal.map((r) => ({ path: r.path, title: r.title, lang: r.lang || 'ar', kind: r.kind || 'page' })),
};
writeFileSync(join(distDir, 'published.json'), JSON.stringify(publishedData), 'utf-8');
writeFileSync(join(rootDir, 'public', 'published.json'), JSON.stringify(publishedData), 'utf-8');
console.log(`[prerender] published.json written (${publishedData.published.length} indexable pages).`);
