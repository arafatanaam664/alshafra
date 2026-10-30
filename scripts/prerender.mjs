// Prerender script: generates a static HTML file for each route so search
// engines see fully-formed metadata AND visible body content instead of a
// blank SPA shell with just <div id="root"></div>.
// Run after `vite build` — reads dist/index.html as the template, injects
// per-route meta tags + JSON-LD + visible HTML body, writes dist/<path>/index.html.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { countdownNotice } from '../src/lib/countdown-notice.mjs';
import { isPrivateDatePath } from '../src/lib/date-privacy.mjs';
import {
  loadCountdowns,
  resolveAll,
  todayInRiyadh,
} from './countdowns.mjs';

const contact = JSON.parse(readFileSync(new URL('../src/data/site-contact.json', import.meta.url), 'utf-8'));
const toolGuides = JSON.parse(readFileSync(new URL('../src/data/tool-guides.json', import.meta.url), 'utf-8'));
const holidayGuide = JSON.parse(readFileSync(new URL('../src/data/holiday-guide.json', import.meta.url), 'utf-8'));
const privacyNotice = JSON.parse(readFileSync(new URL('../src/data/privacy-notice.json', import.meta.url), 'utf-8'));
const faqGroups = JSON.parse(readFileSync(new URL('../src/data/faq.json', import.meta.url), 'utf-8'));
const schoolCalendar = JSON.parse(readFileSync(new URL('../src/data/school-calendar.json', import.meta.url), 'utf-8'));

const SITE_URL = 'https://alshafra.com';
const SITE_NAME = 'تقويم السعودية';

const distDir = join(process.cwd(), 'dist');
const templatePath = join(distDir, 'index.html');

if (!existsSync(templatePath)) {
  console.error('[prerender] dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Shared with the React article pages.
const ARTICLES = JSON.parse(readFileSync(new URL('../src/data/articles.json', import.meta.url), 'utf-8'));

function articleRoutes() {
  return ARTICLES.map((a) => ({
    path: `/articles/${a.slug}`,
    title: `${a.title} | تقويم السعودية`,
    description: a.description,
    keywords: a.keywords.join(', '),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        inLanguage: 'ar-SA',
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
      <h1>${escapeHtml(a.title)}</h1>
      <p>${escapeHtml(a.description)}</p>
${a.sections.map((s) => `      <h2>${escapeHtml(s.heading)}</h2>\n      <p>${escapeHtml(s.body)}</p>`).join('\n')}
${a.slug === 'salary-dates-saudi-arabia' ? `      <p><a href="https://www.mof.gov.sa/">وزارة المالية</a></p>` : a.slug === 'citizen-account-payment-dates' ? `      <p><a href="https://portal.ca.gov.sa/">بوابة حساب المواطن الرسمية</a></p>` : a.slug === 'official-holidays-saudi-arabia' ? `      <p><a href="/holidays">جدول الإجازات والمصادر الرسمية</a></p>` : a.slug === 'school-calendar-1448' ? `      <p><a href="/school-calendar">جدول التقويم المدرسي ومصدر وزارة التعليم</a></p>` : a.slug === 'developed-social-security' ? `      <p><a href="https://www.hrsd.gov.sa/">وزارة الموارد البشرية والتنمية الاجتماعية</a></p>` : ''}
${a.faq && a.faq.length ? `      <h2>الأسئلة الشائعة</h2>\n${a.faq.map((f) => `      <h3>${escapeHtml(f.q)}</h3>\n      <p>${escapeHtml(f.a)}</p>`).join('\n')}` : ''}
    `),
  }));
}

// --- Countdown pages ("كم باقي على…") ----------------------------------------
// Built from src/data/countdowns.json — the same file the React app imports —
// with every date resolved at build time through the Umm Al-Qura table, so the
// crawlable HTML already contains the real Gregorian + Hijri dates instead of
// an empty shell that only fills in after JavaScript runs.

const TODAY_SA = todayInRiyadh();
const COUNTDOWNS = loadCountdowns();

const COUNTDOWN_CATEGORY_LABELS = {
  national: 'وطنية',
  religious: 'دينية',
  salary: 'الرواتب والدعم',
  school: 'دراسية',
  seasonal: 'مواسم',
};

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
            `        <li><a href="/countdown/${r.def.slug}">${r.def.question}</a> — ${r.def.summary}</li>`,
        )
        .join('\n')}\n      </ul>`;
    })
    .filter(Boolean)
    .join('\n');

  return {
    path: '/countdown',
    title: 'كم باقي على… | عدّادات تنازلية للمناسبات والرواتب في السعودية',
    description:
      'عدّادات ومواعيد دراسية ومناسبات بتوقيت الرياض، مع بيان حالة الموعد؛ الرواتب والدعم بانتظار التحقق.',
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
      <p>عدّادات بتوقيت الرياض للمناسبات والمواسم والمواعيد الدراسية المتاحة؛ الرواتب والدعم بانتظار التحقق. المواعيد الدينية حسابية وليست إعلاناً رسمياً.</p>
      <h2>عدّ تنازلي لتاريخ تختاره</h2>
      <p>اختر تاريخاً ميلادياً من 1900 إلى 2100. ينتهي العد عند بداية ذلك اليوم بتوقيت الرياض (UTC+3)، وليس عند ساعة محددة. يتطلب تشغيل الأداة JavaScript.</p>
${listHtml}
      <h2>كيف تُحسب هذه العدّادات؟</h2>
      <p>المناسبات الدينية تُحسب باستخدام تقويم أم القرى الذي يوفره المتصفح أو حساب تقريبي عند عدم توفره، وتبقى مرتبطة بالإعلان الرسمي. المناسبات الوطنية من تاريخها الميلادي الثابت، ومواعيد الرواتب والدعم بانتظار التحقق، والمواعيد الدراسية من صفحة وزارة التعليم عند آخر مراجعة. جميع الأيام محسوبة بتوقيت الرياض.</p>
    `),
  };
}

function countdownRoutes() {
  return COUNTDOWNS.map((def) => {
    const description = `${def.question} — ${def.summary}`;

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
${countdownNotice(def, schoolCalendar.verifiedAt, TODAY_SA) ? `      <p>${countdownNotice(def, schoolCalendar.verifiedAt, TODAY_SA)}</p>` : ''}
      <h2>${def.title}</h2>
      <p>لعرض الموعد الحالي والعدّاد إن توفرا، فعّل JavaScript. راجع المصدر المرفق للموعد النهائي.</p>
      <h2>التفاصيل</h2>
${def.paragraphs.map((p) => `      <p>${p}</p>`).join('\n')}
${def.source ? `      <p><a href="${def.source.url}">المصدر: ${def.source.label}</a></p>` : ''}
      <h2>معلومات سريعة</h2>
      <ul>
${def.notes.map((n) => `        <li>${n}</li>`).join('\n')}
      </ul>
      <h2>الأسئلة الشائعة</h2>
${def.faq.map((f) => `      <h3>${escapeHtml(f.q)}</h3>\n      <p>${escapeHtml(f.a)}</p>`).join('\n')}
${relatedHtml}
      <p><a href="/countdown">كل العدّادات التنازلية</a> · <a href="/today">التاريخ اليوم</a></p>
    `),
    };
  });
}

function todayRoute() {
  return {
    path: '/today',
    title: 'تاريخ اليوم هجري وميلادي في السعودية | تقويم السعودية',
    description: 'اعرف التاريخ الهجري والميلادي اليوم في السعودية بتوقيت الرياض، مع تفاصيل التقويم وأدوات التحويل.',
    keywords: 'التاريخ اليوم, التاريخ الهجري اليوم, التاريخ الميلادي اليوم, تقويم أم القرى',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>التاريخ اليوم في السعودية</h1>
      <p>اعرف التاريخ الهجري والميلادي الحالي بتوقيت الرياض. يتطلب عرض التاريخ المتجدد تشغيل JavaScript؛ لا يُعرض تاريخ ثابت من وقت بناء الموقع على أنه تاريخ اليوم.</p>
      <h2>عن التاريخ الهجري في السعودية</h2>
      <p>يستخدم الموقع تقويم أم القرى الحسابي، وقد تختلف المناسبات المرتبطة برؤية الهلال عن التاريخ الحسابي.</p>
      <p><a href="/date-converter">تحويل التاريخ</a> · <a href="/hijri-calendar">التقويم الهجري</a> · <a href="/countdown">العدّادات التنازلية</a></p>
    `),
  };
}

// --- Route metadata + body content -------------------------------------------

const routes = [
  {
    path: '/',
    title: 'تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي',
    description:
      'منصة مستقلة للتقويم والمواعيد والأدوات في السعودية؛ مواعيد الرواتب والدعم بانتظار التحقق، والتواريخ الحسابية تحتاج إلى مراجعة المصادر الرسمية.',
    keywords:
      'التقويم الهجري, التقويم الميلادي, مواعيد الرواتب, حساب المواطن, رواتب المتقاعدين, الضمان الاجتماعي, التقويم الدراسي, الإجازات الرسمية, تحويل التاريخ, حاسبة العمر, تقويم أم القرى, السعودية, زخرفة الأسماء',
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
<h1>مواعيد الرواتب، التقويم الهجري، والإجازات الرسمية في مكان واحد</h1>
    <p>منصة مستقلة للتقويم والمواعيد والأدوات في السعودية. مواعيد الرواتب والدعم بانتظار التحقق؛ راجع المصادر الرسمية قبل الاعتماد على أي موعد.</p>
    <h2>خدماتنا</h2>
    <ul>
      <li><a href="/countdown">كم باقي على…</a> — عدّادات تنازلية مباشرة لرمضان والعيدين واليوم الوطني والرواتب وبداية الدراسة والإجازات.</li>
      <li><a href="/today">التاريخ اليوم</a> — التاريخ الهجري والميلادي الآن بتوقيت الرياض وفق تقويم أم القرى.</li>
      <li><a href="/salaries">مواعيد الرواتب</a> — رواتب الموظفين الحكوميين وحساب المواطن والمتقاعدين والضمان الاجتماعي والدعم السكني.</li>
      <li><a href="/hijri-calendar">التقويم الهجري</a> — تقويم هجري حسابي ومناسبات مختارة؛ قد يُستخدم بديل تقريبي عند غياب تقويم المتصفح.</li>
      <li><a href="/school-calendar">التقويم الدراسي</a> — موعد بداية الدراسة وإجازات المدارس وفق تقويم وزارة التعليم السعودية.</li>
      <li><a href="/holidays">الإجازات الرسمية</a> — دليل للفئات المختلفة ومصادرها الرسمية.</li>
      <li><a href="/date-converter">تحويل التاريخ</a> — أداة تحويل حسابية مع بيان حدود النتيجة.</li>
      <li><a href="/age-calculator">حاسبة العمر</a> — احسب عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي.</li>
      <li><a href="/name-decoration">زخرفة الأسماء</a> — زخرف اسمك بأكثر من 75 نمط مجاناً — عربي، ببجي، إنجليزي، فري فاير، وفرنسي.</li>
    </ul>
    <h2>مقالات</h2>
    <ul>
${ARTICLES.map((a) => `        <li><a href="/articles/${a.slug}">${escapeHtml(a.title)}</a></li>`).join('\n')}
    </ul>
    `),
  },
  {
    path: '/salaries',
    title: 'مواعيد صرف الرواتب والدعم في السعودية | تقويم السعودية',
    description:
      'اختر برنامج الرواتب أو الدعم وراجع مصدر الجهة المعنية لمعرفة موعد الصرف.',
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
      <p>اختر البرنامج ثم راجع إعلان الجهة المعنية. لا نعرض موعداً قادماً هنا قبل التحقق من الجدول أو الإعلان الرسمي لكل دفعة.</p>
      <h2>برامج الصرف</h2>
      <ul>
        <li><a href="/countdown/employee-salaries">رواتب الموظفين الحكوميين</a> — بانتظار التحقق. <a href="https://www.mof.gov.sa/mediacenter/Payroll/Pages/2026.aspx">وزارة المالية</a></li>
        <li><a href="/countdown/citizen-account">حساب المواطن</a> — بانتظار التحقق. <a href="https://portal.ca.gov.sa/">البرنامج</a></li>
        <li><a href="/countdown/retiree-salaries">معاشات المتقاعدين</a> — بانتظار التحقق. <a href="https://beta.gosi.gov.sa/pension-disbursement-date">التأمينات الاجتماعية</a></li>
        <li><a href="/countdown/social-security">الضمان الاجتماعي المطور</a> — بانتظار التحقق. <a href="https://www.hrsd.gov.sa/">وزارة الموارد البشرية والتنمية الاجتماعية</a></li>
      </ul>
      <p>لا يُستعاض عن الجدول السنوي لوزارة المالية بقاعدة شهرية عامة. <a href="/articles/salary-dates-saudi-arabia">دليل رواتب الموظفين الحكوميين</a>.</p>
    `),
  },
  {
    path: '/hijri-calendar',
    title: 'التقويم الهجري وأم القرى | تقويم السعودية',
    description:
      'تقويم هجري حسابي مع مناسبات مختارة ومواعيد دراسية من وزارة التعليم؛ راجع الإعلانات الرسمية للتواريخ الحساسة.',
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
      <p>تقويم هجري حسابي ومناسبات مختارة؛ لا تمثل القائمة جميع الإجازات. تواريخ المناسبات الدينية حسابية وتخضع للإعلان الرسمي، وتختلف إجازات الجهات بحسب لوائحها.</p>
      <h2>عن التقويم الهجري وأم القرى</h2>
      <p>يستخدم الموقع تقويم أم القرى المتاح في المتصفح عند دعمه، وإلا يستخدم حساباً تقريبياً. القائمة ليست جدولاً رسمياً شاملاً للإجازات، وتخضع المواعيد للإعلانات واللوائح ذات الصلة.</p>
      <p>يُسمى التقويم الرسمي «تقويم أم القرى» نسبة إلى مدينة مكة المكرمة، ويُحسب فلكياً لتحديد بدايات الأشهر الهجرية. التواريخ المعروضة هنا تقريبية وقد تختلف بيوم واحد عن الإعلان الرسمي لرؤية الهلال.</p>
      <h2>أبرز المناسبات في 1448هـ</h2>
      <ul>
        <li>رأس السنة الهجرية — 1 محرم</li>
        <li>المولد النبوي الشريف — 12 ربيع الأول</li>
        <li>بداية شهر رمضان — 1 رمضان</li>
        <li>عيد الفطر المبارك — 1 شوال</li>
        <li>وقفة عرفة — 9 ذو الحجة</li>
        <li>عيد الأضحى المبارك — 10 ذو الحجة</li>
        <li>يوم التأسيس السعودي — 22 فبراير</li>
      </ul>
    `),
  },
  {
    path: '/school-calendar',
    title: 'التقويم الدراسي 1448-1449هـ (2026-2027م) | تقويم السعودية',
    description:
      'مواعيد بداية الدراسة وإجازات المدارس 1448-1449هـ حسب صفحة التقويم الدراسي لوزارة التعليم، مع رابط المصدر وتاريخ المراجعة.',
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
      <p>بداية الدراسة وإجازات المدارس كما وردت في صفحة وزارة التعليم عند المراجعة. تاريخ إجازة المدرسة ليس بالضرورة يوم العيد نفسه.</p>
      <p>${schoolCalendar.notice} آخر تحقق: ${schoolCalendar.verifiedAt} · <a href="${schoolCalendar.source}">صفحة التقويم الدراسي بوزارة التعليم</a></p>
      <h2>مواعيد الدراسة والإجازات المدرسية</h2>
      <table><thead><tr><th>المناسبة</th><th>اليوم والميلادي</th><th>الهجري كما في المصدر</th></tr></thead><tbody>${schoolCalendar.events.map(e => `<tr><th scope="row">${escapeHtml(e.title)}${e.countdownSlug ? ` <a href="/countdown/${escapeHtml(e.countdownSlug)}">عرض العداد</a>` : ''}</th><td>${new Intl.DateTimeFormat('ar-SA', { weekday: 'long', timeZone: 'Asia/Riyadh' }).format(new Date(`${e.date}T12:00:00Z`))}، ${e.date}</td><td>${e.hijri}</td></tr>`).join('')}</tbody></table>
      <p>الفئة: المدارس، مع تحديد عودة المعلمين في صفها. الحالة: منقول من صفحة الوزارة عند تاريخ التحقق أعلاه، لا يغني عن متابعة تحديثاتها. لم تُحدّد في الصفحة المعروضة هنا آخر أيام الإجازات أو العودة منها؛ لا نستنتجها من تاريخ البداية. راجع الوزارة وإدارة التعليم المختصة لأي تحديث.</p>
    `),
  },
  {
    path: '/holidays',
    title: 'الإجازات الرسمية في السعودية والمدارس | تقويم السعودية',
    description: 'دليل الإجازات بحسب الفئة ومصادر الأنظمة، مع التمييز بين المناسبات وإجازات المدارس.',
    keywords: 'الإجازات الرسمية, عطلات السعودية, إجازة عيد الفطر, إجازة عيد الأضحى, اليوم الوطني, يوم التأسيس',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>الإجازات الرسمية في السعودية</h1>
      <p>دليل يفرق بين أيام المناسبات وإجازات العمل والمدارس.</p>
      <p>${holidayGuide.notice} آخر مراجعة للمصادر: ${holidayGuide.verifiedAt}.</p>
      <h2>الإجازات بحسب الفئة</h2>
      <table><thead><tr><th>المناسبة</th><th>الفئة</th><th>التفاصيل</th></tr></thead><tbody>${holidayGuide.items.map(item => `<tr><th scope="row">${item.title}</th><td>${item.audience}</td><td>${item.detail}</td></tr>`).join('')}</tbody></table>
      <h2>المصادر الرسمية</h2><ul>${holidayGuide.sources.map(source => `<li><a href="${source.url}">${source.label}</a></li>`).join('')}</ul>
      <p><a href="/school-calendar">جدول إجازات المدارس</a> · <a href="/countdown">عدادات المناسبات</a></p>
    `),
  },
  {
    path: '/date-converter',
    title: 'تحويل التاريخ بين الهجري والميلادي | تقويم السعودية',
    description:
      'أداة لتحويل التاريخ بين الهجري والميلادي بتقويم أم القرى المتاح في المتصفح، مع بيان الحدود والتنبيه إلى الإعلانات الرسمية.',
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
      <p>أداة لتحويل التاريخ الهجري والميلادي باستخدام تقويم أم القرى المتاح في المتصفح عند دعمه، وتتوقف الأداة إذا لم يتوفر أو لم يجتز فحص التوافق. النطاق المتاح 1900–2100 ميلادية. راجع الجهة المختصة للقرارات الرسمية.</p>
      <h2>كيف تعمل أداة تحويل التاريخ؟</h2>
      <p>تستخدم الأداة تقويم أم القرى الذي يوفره المتصفح إن اجتاز فحص التوافق، وتتوقف عند عدم توفره. قد تختلف بيانات المتصفحات وإصداراتها؛ لا يغني التحويل عن مراجعة الجهة الرسمية.</p>
      <p>قد تختلف بداية الأشهر والمناسبات الدينية عن الحساب بحسب إعلان رؤية الهلال الرسمي.</p>
      <p><a href="https://www.ummulqura.org.sa/ar/calendar">موقع تقويم أم القرى</a> مرجع للمراجعة ولا تتصل الأداة به لإجراء الحساب.</p>
      <h2>حساب الفرق بين تاريخين ميلاديين</h2>
      <p>اختر تاريخ البداية والنهاية بين 1900 و2100 لحساب الفرق بالأيام وبالسنوات والأشهر والأيام. يتطلب الحساب تشغيل JavaScript، ويُستخدم آخر يوم من الشهر الأقصر عند حساب الأشهر المكتملة.</p>
      <h2>أسئلة عن الأداة</h2>
${toolGuides.converter.map(item => `      <h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join('\n')}
      <h2>أدوات التقويم المرتبطة</h2>
      <ul><li><a href="/age-calculator">حساب العمر بالهجري والميلادي</a></li><li><a href="/today">تاريخ اليوم في السعودية</a></li><li><a href="/hijri-calendar">التقويم الهجري الشهري</a></li></ul>
      <h2>الفرق بين التقويم الهجري والميلادي</h2>
      <p>التقويم الهجري قمري يعتمد على دورة القمر، ومدة السنة 354 أو 355 يوماً (12 شهراً قمرياً). التقويم الميلادي شمسي يعتمد على دورة الأرض حول الشمس، ومدة السنة 365 أو 366 يوماً. لهذا الفرق يسبق التقويم الهجري الميلادي بحوالي 11 يوماً كل سنة.</p>
    `),
  },
  {
    path: '/age-calculator',
    title: 'حاسبة العمر بالهجري والميلادي | تقويم السعودية',
    description:
      'احسب العمر بالسنوات والأشهر والأيام الهجرية والميلادية، والأيام المتبقية لعيد الميلاد وفق يوم الرياض.',
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
      <p>أدخل تاريخ ميلادك بالتقويم الميلادي أو الهجري لتحصل على عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي، بالإضافة إلى عدد الأيام والأسابيع والأيام المتبقية لعيد ميلادك القادم.</p>
      <p>يجري كود الأداة الحساب داخل المتصفح ولا يرسل تاريخ الميلاد أو يحفظه بنفسه. نسخة الحاسبة المبنية تعزل الصفحة عن سكربتات الإعلان والتحليلات الخارجية، لكن يجب اختبار إعدادات النشر والمتصفح قبل تأكيد الخصوصية الشاملة. راجع <a href="/privacy">الخصوصية</a>.</p>
      <h2>مقارنة العمر بين شخصين</h2>
      <p>يمكن مقارنة تاريخ الميلاد المدخل بتاريخ شخص ثانٍ ميلادياً، واحتساب الفرق بينهما بالأيام والسنوات والأشهر المكتملة دون ساعة الميلاد. تتطلب المقارنة تشغيل JavaScript.</p>
      <h2>عن حاسبة العمر</h2>
      <p>يُحسب العمر حسب يوم الرياض من دون ساعة الميلاد. يُحتسب الشهر الكامل من يوم الميلاد، وإذا لم يوجد ذلك اليوم في شهر أقصر يُستخدم آخر يوم فيه. يُحتسب عيد ميلاد 29 فبراير في 28 فبراير خلال السنوات غير الكبيسة؛ وقد تختلف طرق الحساب الأخرى أو الأحكام الرسمية.</p>
      <p>يستخدم الحساب تقويم أم القرى الذي يوفره المتصفح إن اجتاز فحص التوافق؛ وإلا تتوقف الحاسبة. قد يختلف إعلان رؤية الهلال عن الحساب التقويمي؛ لا تستخدم النتيجة وثيقة رسمية وراجع الجهة المختصة.</p>
      <p><a href="https://www.ummulqura.org.sa/ar/calendar">موقع تقويم أم القرى</a> مرجع للمراجعة ولا تتصل الأداة به لإجراء الحساب.</p>
      <h2>أسئلة عن الأداة</h2>
${toolGuides.age.map(item => `      <h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join('\n')}
      <h2>أدوات مرتبطة بحساب العمر</h2>
      <ul><li><a href="/date-converter">تحويل تاريخ الميلاد بين الهجري والميلادي</a></li><li><a href="/today">تاريخ اليوم في السعودية</a></li><li><a href="/hijri-calendar">التقويم الهجري الشهري</a></li></ul>
    `),
  },
  {
    path: '/name-decoration',
    title: 'زخرفة الأسماء أونلاين | 5 أدوات زخرفة مجانية | تقويم السعودية',
    description:
      'زخرف اسمك أونلاين مجاناً بأكثر من 75 نمط زخرفة: زخرفة الأسماء عربي، ببجي، بالإنجليزي، فري فاير، وبالفرنسية. أدوات زخرفة سريعة مع نسخ مباشر لكل نمط.',
    keywords:
      'زخرفة الأسماء, زخرفة الأسماء عربي, زخرفة الأسماء ببجي, زخرفة الأسماء بالانجليزي, زخرفة الأسماء فري فاير, زخرفة الأسماء بالفرنسية, أدوات زخرفة, زخرفة أسماء أونلاين',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء أونلاين</h1>
      <p>مجموعة من 5 أدوات مجانية لزخرفة الأسماء أونلاين — زخرف اسمك بأكثر من 75 نمط زخرفة مختلف لكل اللغات والألعاب. اختر الأداة المناسبة لك وابدأ الزخرفة فوراً مع نسخ مباشر لكل نمط.</p>
      <h2>أدوات الزخرفة المتاحة</h2>
      <ul>
        <li><a href="/name-decoration/arabic">زخرفة الأسماء عربي</a> — زخرفة الحروف العربية الأصيلة والرموز.</li>
        <li><a href="/name-decoration/pubg">زخرفة الأسماء ببجي</a> — أنماط مخصصة للاعبي ببجي موبايل.</li>
        <li><a href="/name-decoration/english">زخرفة الأسماء بالإنجليزي</a> — خطوط مزخرفة مثل Script وBold وItalic وCircle.</li>
        <li><a href="/name-decoration/free-fire">زخرفة الأسماء فري فاير</a> — أنماط مخصصة للاعبي فري فاير.</li>
        <li><a href="/name-decoration/french">زخرفة الأسماء بالفرنسية</a> — خطوط ورموز أنيقة بالفرنسية.</li>
      </ul>
      <h2>عن زخرفة الأسماء</h2>
      <p>زخرفة الأسماء هي فن تحويل الاسم العادي إلى شكل جذاب ومميز باستخدام رموز يونيكود والحروف المزخرفة. تُستخدم زخرفة الأسماء على نطاق واسع في منصات التواصل الاجتماعي والألعاب الإلكترونية لإبراز الشخصية وجذب الانتباه. توفر بوابة تقويم السعودية 5 أدوات مجانية لزخرفة الأسماء بأكثر من 75 نمط مختلف.</p>
      <p>كل أداة توفر أكثر من 15 نمط زخرفة مختلف، مع زر نسخ مباشر لكل نمط لتسهيل نسخ الاسم المزخرف واستخدامه في أي مكان — وسائل التواصل الاجتماعي، الألعاب، الرسائل، أو أي تطبيق آخر. أدواتنا مجانية بالكامل ولا تتطلب تسجيل دخول، وتعمل على جميع الأجهزة.</p>
    `),
  },
  {
    path: '/name-decoration/arabic',
    title: 'زخرفة الأسماء بالعربي أونلاين مجاناً | تقويم السعودية',
    description:
      'أداة زخرفة الأسماء بالعربية أونلاين مجاناً — اكتب اسمك واحصل على أكثر من 15 نمط زخرفة عربي بأجنحة ونجوم وورود وألماس، مع زر نسخ مباشر لكل نمط.',
    keywords:
      'زخرفة الأسماء عربي, زخرفة الأسماء بالعربي, زخرفة الأسماء العربية, زخرفة اسمي بالعربي, أداة زخرفة الأسماء عربي, زخرفة عربية أونلاين',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء بالعربي',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء بالعربي أونلاين</h1>
      <p>أداة مجانية لزخرفة الأسماء بالعربية — اكتب اسمك واحصل على أكثر من 15 نمط زخرفة عربي بأجنحة ونجوم وورود وألماس، مع زر نسخ مباشر لكل نمط.</p>
      <p>زخرفة الأسماء العربية تستخدم رموز يونيكود والحروف المزخرفة لتحويل اسمك إلى شكل جذاب ومميز. تُستخدم في منصات التواصل الاجتماعي والألعاب الإلكترونية. أداتنا مجانية بالكامل ولا تتطلب تسجيل دخول.</p>
    `),
  },
  {
    path: '/name-decoration/pubg',
    title: 'زخرفة الأسماء ببجي (PUBG) أونلاين مجاناً | تقويم السعودية',
    description:
      'أداة زخرفة الأسماء ببجي PUBG Mobile أونلاين — زخرف اسمك في ببجي بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وألماس مع نسخ مباشر لتغيير اسمك في اللعبة.',
    keywords:
      'زخرفة الأسماء ببجي, زخرفة اسم ببجي, زخرفة ببجي, اسم ببجي مزخرف, تغيير اسم ببجي, زخرفة ببجي موبايل, PUBG name decoration',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء ببجي',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء ببجي (PUBG Mobile) أونلاين</h1>
      <p>أداة زخرفة الأسماء ببجي PUBG Mobile أونلاين — زخرف اسمك في ببجي بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وألماس مع نسخ مباشر لتغيير اسمك في اللعبة.</p>
      <p>زخرفة اسم ببجي من أكثر الأدوات استخداماً بين لاعبي ببجي موبايل. اختر النمط المناسب وانسخ الاسم المزخرف واستخدمه في اللعبة مباشرة. أداتنا مجانية بالكامل.</p>
    `),
  },
  {
    path: '/name-decoration/english',
    title: 'زخرفة الأسماء بالإنجليزي (English Name Decoration) أونلاين | تقويم السعودية',
    description:
      'أداة زخرفة الأسماء بالإنجليزي أونلاين — اكتب اسمك بالإنجليزية واحصل على أكثر من 15 خطاً مزخرفاً: Script، Bold، Italic، Double، Circle، Monospace مع رموز ونسخ مباشر.',
    keywords:
      'زخرفة الأسماء بالانجليزي, زخرفة الأسماء بالإنجليزي, English name decoration, fancy text generator, زخرفة اسم بالإنجليزي, زخرفة خطوط إنجليزية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء بالإنجليزي',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء بالإنجليزي (English Name Decoration) أونلاين</h1>
      <p>أداة زخرفة الأسماء بالإنجليزي أونلاين — اكتب اسمك بالإنجليزية واحصل على أكثر من 15 خطاً مزخرفاً: Script، Bold، Italic، Double، Circle، Monospace مع رموز ونسخ مباشر.</p>
      <p>زخرفة الأسماء بالإنجليزي تستخدم خطوط يونيكود المزخرفة لتحويل اسمك إلى أشكال جذابة. تُستخدم في وسائل التواصل الاجتماعي والألعاب والتطبيقات. أداتنا مجانية بالكامل.</p>
    `),
  },
  {
    path: '/name-decoration/free-fire',
    title: 'زخرفة الأسماء فري فاير (Free Fire) أونلاين مجاناً | تقويم السعودية',
    description:
      'أداة زخرفة الأسماء فري فاير Free Fire أونلاين — زخرف اسمك في فري فاير بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وورود مع نسخ مباشر لتغيير اسمك في اللعبة.',
    keywords:
      'زخرفة الأسماء فري فاير, زخرفة اسم فري فاير, زخرفة فري فاير, اسم فري فاير مزخرف, تغيير اسم فري فاير, Free Fire name decoration',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء فري فاير',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء فري فاير (Free Fire) أونلاين</h1>
      <p>أداة زخرفة الأسماء فري فاير Free Fire أونلاين — زخرف اسمك في فري فاير بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وورود مع نسخ مباشر لتغيير اسمك في اللعبة.</p>
      <p>زخرفة اسم فري فاير من أكثر الأدوات استخداماً بين لاعبي فري فاير. اختر النمط المناسب وانسخ الاسم المزخرف واستخدمه في اللعبة مباشرة. أداتنا مجانية بالكامل.</p>
    `),
  },
  {
    path: '/name-decoration/french',
    title: 'زخرفة الأسماء بالفرنسية (Décoration de Noms) أونلاين | تقويم السعودية',
    description:
      'أداة زخرفة الأسماء بالفرنسية أونلاين — اكتب اسمك بالفرنسية واحصل على أكثر من 15 نمط زخرفة: Script، Bold، Italic، Double، Circle مع رموز ونسخ مباشر.',
    keywords:
      'زخرفة الأسماء بالفرنسية, زخرفة الأسماء فرنسي, décoration de noms, زخرفة اسم بالفرنسي, stylish French name, زخرفة فرنسية أونلاين',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء بالفرنسية',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
    ],
    body: bodyWithNoscript(`
      <h1>زخرفة الأسماء بالفرنسية (Décoration de Noms) أونلاين</h1>
      <p>أداة زخرفة الأسماء بالفرنسية أونلاين — اكتب اسمك بالفرنسية واحصل على أكثر من 15 نمط زخرفة: Script، Bold، Italic، Double، Circle مع رموز ونسخ مباشر.</p>
      <p>زخرفة الأسماء بالفرنسية تستخدم خطوط يونيكود المزخرفة لتحويل اسمك إلى أشكال أنيقة. تُستخدم في وسائل التواصل الاجتماعي والألعاب والتطبيقات. أداتنا مجانية بالكامل.</p>
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
        itemListElement: ARTICLES.map((article, index) => ({ '@type': 'ListItem', position: index + 1, name: article.title })),
      },
    ],
    body: bodyWithNoscript(`
      <h1>مقالات عن المواعيد والتقويم في السعودية</h1>
      <p>مقالات ودلائل شاملة عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي المطور والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.</p>
      <h2>قائمة المقالات</h2>
      <ul>
${ARTICLES.map((a) => `        <li><a href="/articles/${a.slug}">${escapeHtml(a.title)}</a></li>`).join('\n')}
      </ul>
    `),
  },
  ...articleRoutes(),
  countdownHubRoute(),
  ...countdownRoutes(),
  todayRoute(),
  {
    path: '/faq',
    title: 'أسئلة شائعة عن مواعيد الرواتب والتقويم والإجازات في السعودية | تقويم السعودية',
    description:
      'إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والضمان الاجتماعي والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في السعودية.',
    keywords: 'الأسئلة الشائعة, أسئلة, مواعيد الرواتب, حساب المواطن, التقويم الهجري, الإجازات الرسمية',
    body: bodyWithNoscript(`
      <h1>الأسئلة الشائعة</h1>
      <p>إجابات على الأسئلة الشائعة عن المواعيد والتقويم والأدوات في السعودية.</p>
      ${faqGroups.map(group => `<h2>${group.title}</h2>${group.items.map(item => `<h3>${item.q}</h3><p>${item.a}</p>`).join('')}`).join('')}
      <h2>لديك سؤال آخر؟</h2><p>راسلنا على <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>.</p>
    `),
  },
  {
    path: '/about',
    title: 'عن تقويم السعودية | تقويم السعودية',
    description: 'تعرف على بوابة تقويم السعودية — منصة شاملة للمواعيد الرسمية والتقويمات والأدوات في المملكة العربية السعودية.',
    keywords: 'عن تقويم السعودية, من نحن, البوابة السعودية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'عن تقويم السعودية',
        inLanguage: 'ar-SA',
      },
    ],
    body: bodyWithNoscript(`
      <h1>عن تقويم السعودية</h1>
      <p>تقويم السعودية منصة مستقلة للتقويم والأدوات والمعلومات في السعودية. مواعيد الرواتب والدعم بانتظار التحقق؛ راجع الجهات الرسمية قبل الاعتماد على أي موعد.</p>
      <h2>التحرير</h2><p>يتولى ${escapeHtml(contact.editorialTeam)} مسؤولية مراجعة المحتوى والمواعيد واعتماد النشر. راجع المصادر الرسمية للتحديثات النهائية.</p>
      <p>للتواصل: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>
    `),
  },
  {
    path: '/contact',
    title: 'تواصل معنا | تقويم السعودية',
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
      <p>البريد الإلكتروني: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>
    `),
  },
  {
    path: '/privacy',
    title: 'سياسة الخصوصية | تقويم السعودية',
    description: 'سياسة الخصوصية لبوابة تقويم السعودية — كيف نجمع ونستخدم ونحمي بيانات المستخدمين.',
    keywords: 'سياسة الخصوصية, الخصوصية, حماية البيانات',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>سياسة الخصوصية</h1>
      <p>${escapeHtml(privacyNotice.intro)}</p>
${privacyNotice.sections.map(section => `      <h2>${escapeHtml(section.heading)}</h2>\n      <p>${escapeHtml(section.body)}</p>\n${section.links.length ? `      <ul>${section.links.map(link => `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>` : ''}`).join('\n')}
    `),
  },
  {
    path: '/terms',
    title: 'شروط الاستخدام | تقويم السعودية',
    description: 'شروط استخدام بوابة تقويم السعودية — القواعد والأحكام لاستخدام الموقع وخدماته.',
    keywords: 'شروط الاستخدام, الأحكام, القواعد',
    jsonLd: [],
    body: bodyWithNoscript(`
      <h1>شروط الاستخدام</h1>
      <p>شروط استخدام بوابة تقويم السعودية — القواعد والأحكام لاستخدام الموقع وخدماته. المعلومات المعروضة على الموقع لأغراض معلوماتية فقط ولا تُغني عن الإعلانات الرسمية.</p>
    `),
  },
];

// --- HTML helpers ------------------------------------------------------------

// The static HTML that every crawler (Googlebot, Bingbot, social + AI bots)
// and every first paint sees. It lives INSIDE #root — not inside <noscript> —
// because content hidden in <noscript> is discounted by search engines and is
// invisible to Bing/Yandex/LLM crawlers, which do not execute JavaScript.
// React replaces this markup on hydration with the interactive version.
function bodyWithNoscript(innerHtml) {
  return `<div id="root"><div class="prerender-shell" dir="rtl" lang="ar">
      <a class="prerender-skip" href="#main-content">انتقل إلى المحتوى الرئيسي</a>
      <header class="prerender-nav">
        <a href="/"><strong>تقويم السعودية</strong></a>
        <nav>
          <a href="/countdown">كم باقي على…</a>
          <a href="/today">التاريخ اليوم</a>
          <a href="/salaries">مواعيد الرواتب</a>
          <a href="/hijri-calendar">التقويم الهجري</a>
          <a href="/school-calendar">التقويم الدراسي</a>
          <a href="/holidays">الإجازات الرسمية</a>
          <a href="/date-converter">تحويل التاريخ</a>
          <a href="/age-calculator">حاسبة العمر</a>
          <a href="/name-decoration">زخرفة الأسماء</a>
          <a href="/articles">مقالات</a>
          <a href="/faq">الأسئلة الشائعة</a>
        </nav>
      </header>
      <main id="main-content" tabindex="-1">
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
  .prerender-skip{position:absolute;left:-9999px}
  .prerender-skip:focus{position:fixed;left:auto;right:1rem;top:1rem;z-index:50;background:white;padding:.75rem;outline:2px solid #065f46}
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
  const tag = `<meta ${attr}="${name}" content="${escapeHtml(content)}">`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setLink(html, rel, href) {
  const regex = new RegExp(`<link rel="${rel}"[^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${href}" />`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setTitle(html, title) {
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function setJsonLd(html, data) {
  const tag = `<script type="application/ld+json" data-page-jsonld>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setBody(html, bodyContent) {
  return html.replace(/<div id="root"><\/div>/, bodyContent);
}

// --- Generate pages ----------------------------------------------------------

let count = 0;
for (const route of routes) {
  let html = template;
  const canonical = SITE_URL + route.path;

  html = setTitle(html, route.title);
  html = setMeta(html, 'description', route.description);
  html = setMeta(html, 'keywords', route.keywords);
  html = setLink(html, 'canonical', canonical);
  html = setMeta(html, 'og:title', route.title, 'property');
  html = setMeta(html, 'og:description', route.description, 'property');
  html = setMeta(html, 'og:url', canonical, 'property');
  html = setMeta(html, 'twitter:title', route.title);
  html = setMeta(html, 'twitter:description', route.description);

  if (route.jsonLd && route.jsonLd.length > 0) {
    html = setJsonLd(html, route.jsonLd);
  }

  if (route.body) {
    html = setBody(html, route.body);
    html = html.replace('</head>', `    ${PRERENDER_CSS}\n  </head>`);
  }

  if (isPrivateDatePath(route.path)) {
    // This document must not inherit advertising/analytics scripts or fonts.
    // A restrictive CSP is defense in depth, not a substitute for network tests.
    html = html.replace(/<script\b[^>]*\bsrc="https:\/\/[^"]+"[^>]*><\/script>/gi, '');
    html = html.replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/i, '');
    html = html.replace(/<link\b[^>]*\bhref="https:\/\/(?:bauval\.org|araplhn\.org|fonts\.googleapis\.com|fonts\.gstatic\.com)[^"]*"[^>]*\/?>/gi, '');
    html = html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" data-date-isolation content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">`);
  }

  const outDir = route.path === '/' ? distDir : join(distDir, route.path);
  const outFile = join(outDir, 'index.html');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, html, 'utf-8');
  count++;
  console.log(`[prerender] ${route.path} -> ${outFile.replace(distDir, 'dist')}`);
}

console.log(`[prerender] Done. ${count} pages generated.`);

// --- sitemap.xml -------------------------------------------------------------
// Generated from the same route table that produced the HTML, so the sitemap
// can never drift out of sync with the pages that actually exist.

const today = new Date().toISOString().slice(0, 10);

const CHANGEFREQ = {
  '/': 'daily',
  '/countdown': 'daily',
  '/today': 'daily',
  '/salaries': 'daily',
  '/hijri-calendar': 'weekly',
  '/school-calendar': 'weekly',
  '/holidays': 'weekly',
  '/articles': 'weekly',
  '/name-decoration': 'weekly',
};

const PRIORITY = {
  '/': '1.0',
  '/countdown': '0.9',
  '/today': '0.9',
  '/salaries': '0.9',
  '/hijri-calendar': '0.9',
  '/name-decoration': '0.8',
  '/school-calendar': '0.8',
  '/holidays': '0.8',
  '/date-converter': '0.7',
  '/age-calculator': '0.7',
  '/articles': '0.7',
  '/faq': '0.6',
  '/about': '0.4',
  '/contact': '0.4',
  '/privacy': '0.3',
  '/terms': '0.3',
};

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((r) => {
    const loc = r.path === '/' ? `${SITE_URL}/` : SITE_URL + r.path;
    const isCountdown = r.path.startsWith('/countdown/');
    const changefreq = CHANGEFREQ[r.path] || (isCountdown ? 'daily' : 'monthly');
    const priority = PRIORITY[r.path] || (isCountdown ? '0.8' : '0.6');
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  }),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`[prerender] sitemap.xml written with ${routes.length} URLs.`);
