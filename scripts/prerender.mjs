// Prerender script: generates a static HTML file for each route so search
// engines see fully-formed metadata and content instead of a blank SPA shell.
// Run after `vite build` — reads dist/index.html as the template, injects
// per-route meta tags + JSON-LD, and writes dist/<path>/index.html files.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const SITE_URL = 'https://alshafra.com';
const SITE_NAME = 'تقويم السعودية';

const distDir = join(process.cwd(), 'dist');
const templatePath = join(distDir, 'index.html');

if (!existsSync(templatePath)) {
  console.error('[prerender] dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');

// --- Route metadata ---------------------------------------------------------
// Each route has: path, title, description, keywords, optional JSON-LD.

const routes = [
  {
    path: '/',
    title: 'تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي',
    description:
      'بوابة سعودية شاملة لمواعيد صرف الرواتب الحكومية، حساب المواطن، الضمان الاجتماعي المطوّر، رواتب المتقاعدين، التقويم الهجري والميلادي، التقويم الدراسي، الإجازات الرسمية، وتحويل التاريخ وحاسبة العمر، وزخرفة الأسماء — وفق تقويم أم القرى الرسمي.',
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
  },
  {
    path: '/salaries',
    title: 'مواعيد الرواتب في السعودية 2026-2027 | حساب المواطن والمتقاعدين | تقويم السعودية',
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
  },
  {
    path: '/holidays',
    title: 'الإجازات الرسمية في السعودية 2026-2027 | الأعياد والمناسبات | تقويم السعودية',
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
  },
  {
    path: '/articles/salary-dates-saudi-arabia',
    title: 'مواعيد الرواتب في السعودية 2026-2027م | تقويم السعودية',
    description:
      'دليل شامل لمواعيد صرف الرواتب الحكومية وحساب المواطن ورواتب المتقاعدين والضمان الاجتماعي المطوّر والدعم السكني في المملكة العربية السعودية مع عدّ تنازلي لكل موعد.',
    keywords:
      'مواعيد الرواتب, صرف الرواتب, حساب المواطن, رواتب المتقاعدين, الضمان الاجتماعي, الدعم السكني',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'مواعيد الرواتب في السعودية 2026-2027م',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/citizen-account-payment-dates',
    title: 'مواعيد حساب المواطن 2026-2027م | تقويم السعودية',
    description:
      'مواعيد صرف حساب المواطن لجميع دفعات العام 2026-2027م مع الاستعلام عن الأهلية وقيمة الدعم وخطوات التسجيل في حساب المواطن.',
    keywords: 'حساب المواطن, مواعيد حساب المواطن, صرف حساب المواطن, الاستعلام عن حساب المواطن',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'مواعيد حساب المواطن 2026-2027م',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/hijri-calendar-1448',
    title: 'التقويم الهجري 1448هـ — دليل شامل | تقويم السعودية',
    description:
      'دليل شامل للتقويم الهجري 1448هـ مع جميع المناسبات الدينية والوطنية والإجازات الرسمية لكل شهر هجري وفق تقويم أم القرى الرسمي.',
    keywords: 'التقويم الهجري, 1448, تقويم أم القرى, الشهور الهجرية, المناسبات الدينية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'التقويم الهجري 1448هـ — دليل شامل',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/school-calendar-1448',
    title: 'التقويم الدراسي 1448هـ 2026-2027م | تقويم السعودية',
    description:
      'التقويم الدراسي الرسمي 1448هـ (2026-2027م) — مواعيد بداية الدراسة، الإجازات المدرسية، الاختبارات، ونهاية العام الدراسي وفق وزارة التعليم السعودية.',
    keywords: 'التقويم الدراسي, 1448, وزارة التعليم, بداية الدراسة, الإجازات المدرسية, الاختبارات',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'التقويم الدراسي 1448هـ 2026-2027م',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/official-holidays-saudi-arabia',
    title: 'الإجازات الرسمية في السعودية 2026-2027م | تقويم السعودية',
    description:
      'قائمة كاملة بالإجازات الرسمية في المملكة العربية السعودية لعام 2026-2027م مع تواريخها الهجرية والميلادية ومدة كل إجازة.',
    keywords: 'الإجازات الرسمية, عيد الفطر, عيد الأضحى, اليوم الوطني, الإجازات السعودية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'الإجازات الرسمية في السعودية 2026-2027م',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/hijri-to-gregorian-conversion',
    title: 'تحويل التاريخ الهجري إلى ميلادي والعكس | تقويم السعودية',
    description:
      'دليل شامل لتحويل التاريخ بين الهجري والميلادي بدقة وفق تقويم أم القرى الرسمي مع شرح الفرق بين التقويمين وأمثلة عملية.',
    keywords: 'تحويل التاريخ, هجري إلى ميلادي, ميلادي إلى هجري, تقويم أم القرى',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'تحويل التاريخ الهجري إلى ميلادي والعكس',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    ],
  },
  {
    path: '/articles/developed-social-security',
    title: 'الضمان الاجتماعي المطور 2026-2027م | الشروط وخطوات التسجيل وقيمة الدعم | تقويم السعودية',
    description:
      'الدليل الشامل للضمان الاجتماعي المطور في المملكة العربية السعودية: شروط الاستحقاق، خطوات التسجيل عبر منصة الدعم، رابط التقديم، الاستعلام عن النتيجة، فئات المستفيدين، قيمة الدعم الشهري، ورفع الجهل.',
    keywords:
      'الضمان الاجتماعي المطور, التسجيل في الضمان الاجتماعي المطور, رابط الضمان الاجتماعي المطور, شروط الضمان الاجتماعي المطور, الاستعلام عن الضمان الاجتماعي المطور, منصة الدعم الاجتماعي, قيمة دعم الضمان الاجتماعي',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'الضمان الاجتماعي المطور 2026-2027م | الشروط وخطوات التسجيل وقيمة الدعم',
        inLanguage: 'ar-SA',
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: SITE_URL + '/favicon.svg' },
        },
      },
    ],
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
  },
  {
    path: '/privacy',
    title: 'سياسة الخصوصية | تقويم السعودية',
    description: 'سياسة الخصوصية لبوابة تقويم السعودية — كيف نجمع ونستخدم ونحمي بيانات المستخدمين.',
    keywords: 'سياسة الخصوصية, الخصوصية, حماية البيانات',
    jsonLd: [],
  },
  {
    path: '/terms',
    title: 'شروط الاستخدام | تقويم السعودية',
    description: 'شروط استخدام بوابة تقويم السعودية — القواعد والأحكام لاستخدام الموقع وخدماته.',
    keywords: 'شروط الاستخدام, الأحكام, القواعد',
    jsonLd: [],
  },
];

// --- HTML generation --------------------------------------------------------

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

function setTitle(html, title) {
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setJsonLd(html, data) {
  // Remove existing page-specific JSON-LD (keep the site-wide ones in template)
  const tag = `<script type="application/ld+json" data-page-jsonld>${JSON.stringify(data)}</script>`;
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

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

  // Write to dist/<path>/index.html (root stays dist/index.html)
  const outDir = route.path === '/' ? distDir : join(distDir, route.path);
  const outFile = join(outDir, 'index.html');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, html, 'utf-8');
  count++;
  console.log(`[prerender] ${route.path} -> ${outFile.replace(distDir, 'dist')}`);
}

console.log(`[prerender] Done. ${count} pages generated.`);
