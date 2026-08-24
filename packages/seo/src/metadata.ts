import { selfCanonical } from './canonical';
import { isIndexableRobots } from './robots';
import { SITE_NAME } from './site';

export type SearchIntent = 'utility' | 'informational' | 'navigational';

export interface SeoInput {
  path: string;
  title?: string;
  description?: string;
  h1?: string;
  robots?: string;
  kind?: string;
}

export interface ResolvedSeo {
  path: string;
  title: string;
  description: string;
  h1: string;
  topic: string;
  intent: SearchIntent;
  category: string;
  indexable: boolean;
  canonical: string;
}

interface Override {
  title: string;
  h1: string;
  description: string;
  topic: string;
  intent: SearchIntent;
  category: string;
}

/** Intent is inferred from the page itself. No invented search-volume numbers. */
const OVERRIDES: Record<string, Override> = {
  '/': {
    title: 'Alshafra — منصة عربية للمعلومات العملية',
    h1: 'المعرفة والأدوات والخدمات في مكان واحد.',
    description: 'منصة عربية لتحويل التاريخ ومواعيد الرواتب والأدوات والأدلة العملية، بصياغة واضحة ومصادر معلنة.',
    topic: 'المنصة',
    intent: 'navigational',
    category: 'core',
  },
  '/today': {
    title: 'التاريخ الهجري والميلادي اليوم',
    h1: 'التاريخ اليوم وفق أم القرى',
    description: 'التاريخ الهجري والميلادي اليوم بتوقيت الرياض وفق تقويم أم القرى، مع اسم اليوم وأيام الشهر.',
    topic: 'التاريخ اليوم',
    intent: 'informational',
    category: 'calendar',
  },
  '/date-converter': {
    title: 'تحويل التاريخ الهجري إلى ميلادي وفق أم القرى',
    h1: 'تحويل التاريخ الهجري والميلادي',
    description: 'حوّل بين الهجري والميلادي وفق أم القرى في المتصفح، مع شرح سريع للفروقات الشائعة.',
    topic: 'تحويل التاريخ',
    intent: 'utility',
    category: 'tools',
  },
  '/age-calculator': {
    title: 'حاسبة العمر بالهجري والميلادي',
    h1: 'حاسبة العمر بالهجري والميلادي',
    description: 'احسب عمرك بالسنوات والأيام من تاريخ الميلاد الميلادي، مع المقابل الهجري ليوم الميلاد.',
    topic: 'حساب العمر',
    intent: 'utility',
    category: 'tools',
  },
  '/hijri-calendar': {
    title: 'التقويم الهجري 1448 وفق أم القرى',
    h1: 'التقويم الهجري وفق أم القرى',
    description: 'عرض الشهر الهجري الحالي وفق أم القرى، مع روابط التحويل والتاريخ اليوم.',
    topic: 'التقويم الهجري',
    intent: 'informational',
    category: 'calendar',
  },
  '/salaries': {
    title: 'موعد صرف الرواتب وحساب المواطن 2026',
    h1: 'مواعيد صرف الرواتب والدعم',
    description: 'مواعيد تقريبية لرواتب الموظفين وحساب المواطن والمتقاعدين بعد قاعدة نهاية الأسبوع. ليست إعلاناً رسمياً.',
    topic: 'مواعيد الرواتب',
    intent: 'informational',
    category: 'calendar',
  },
  '/school-calendar': {
    title: 'التقويم الدراسي 1448-1449 في السعودية',
    h1: 'التقويم الدراسي 1448-1449هـ',
    description: 'بداية الدراسة والإجازات المتداولة للعام 1448-1449. راجع وزارة التعليم ومدرستك قبل الاعتماد.',
    topic: 'التقويم الدراسي',
    intent: 'informational',
    category: 'calendar',
  },
  '/holidays': {
    title: 'الإجازات الرسمية في السعودية 2026',
    h1: 'الإجازات الرسمية في السعودية',
    description: 'ميّز بين الإجازة النظامية والمناسبة التقويمية، مع روابط لعدّادات العيد واليوم الوطني.',
    topic: 'الإجازات الرسمية',
    intent: 'informational',
    category: 'calendar',
  },
  '/calendar': {
    title: 'التقويم الهجري والميلادي والمواعيد',
    h1: 'التقويم والمواعيد',
    description: 'تاريخ اليوم، تحويل أم القرى، مواعيد الرواتب، التقويم الدراسي والإجازات في قسم واحد.',
    topic: 'التقويم',
    intent: 'navigational',
    category: 'calendar',
  },
  '/tools': {
    title: 'أدوات الحساب والتحويل',
    h1: 'الأدوات',
    description: 'حاسبات ومحوّلات عربية تعمل في المتصفح: النسبة، الخصم، العمر، التاريخ، الذهب والدولار.',
    topic: 'الأدوات',
    intent: 'navigational',
    category: 'tools',
  },
  '/articles': {
    title: 'مقالات الرواتب والتقويم والإجازات',
    h1: 'المقالات',
    description: 'مقالات تحريرية عن مواعيد الرواتب وتحويل التاريخ والإجازات والتقويم الدراسي.',
    topic: 'المقالات',
    intent: 'navigational',
    category: 'articles',
  },
  '/trending': {
    title: 'أدلة الذهب والدولار والتعليم والسفر',
    h1: 'الأدلة العملية',
    description: 'شروحات عملية في المال والتقنية والتعليم والسفر. ليست تغطية أخبار لحظية.',
    topic: 'الأدلة',
    intent: 'navigational',
    category: 'guides',
  },
  '/countdown': {
    title: 'كم باقي على رمضان والعيد والراتب',
    h1: 'كم باقي على…؟',
    description: 'عدّادات تنازلية للمناسبات والرواتب والدراسة وفق أم القرى وتوقيت الرياض.',
    topic: 'العدّادات',
    intent: 'navigational',
    category: 'calendar',
  },
  '/gold-price': {
    title: 'سعر الذهب اليوم في الدول العربية',
    h1: 'أسعار الذهب في الدول العربية',
    description: 'لقطة إرشادية لسعر الجرام حسب العيار والدولة. ليست سعر تنفيذ من متجر.',
    topic: 'أسعار الذهب',
    intent: 'informational',
    category: 'tools',
  },
  '/usd-rate': {
    title: 'سعر الدولار اليوم في الدول العربية',
    h1: 'سعر الدولار في الدول العربية',
    description: 'سعر مرجعي للدولار مقابل العملات العربية من لقطة يومية، دون رسوم التحويل.',
    topic: 'سعر الدولار',
    intent: 'informational',
    category: 'tools',
  },
  '/faq': {
    title: 'أسئلة شائعة عن التحويل والرواتب',
    h1: 'الأسئلة الشائعة',
    description: 'إجابات مختصرة عن تحويل التاريخ ومواعيد الرواتب واستخدام الأدوات.',
    topic: 'الأسئلة الشائعة',
    intent: 'informational',
    category: 'core',
  },
  '/about': {
    title: 'عن Alshafra',
    h1: 'عن Alshafra',
    description: 'Alshafra منصة عربية مستقلة للمعلومات العملية والأدوات. ليست جهة حكومية.',
    topic: 'عن المنصة',
    intent: 'navigational',
    category: 'core',
  },
  '/contact': {
    title: 'تواصل مع Alshafra',
    h1: 'اتصل بنا',
    description: 'راسل Alshafra على info@alshafra.com لتصحيح معلومة موثّقة بمصدر.',
    topic: 'التواصل',
    intent: 'navigational',
    category: 'core',
  },
  '/privacy': {
    title: 'سياسة الخصوصية',
    h1: 'سياسة الخصوصية',
    description: 'كيف تتعامل Alshafra مع البيانات عند استخدام الأدوات العامة والصفحات الثابتة.',
    topic: 'الخصوصية',
    intent: 'navigational',
    category: 'core',
  },
  '/terms': {
    title: 'شروط الاستخدام',
    h1: 'شروط الاستخدام',
    description: 'شروط استخدام صفحات Alshafra وأدواتها. المعلومات استرشادية ولا تغني عن الإعلان الرسمي.',
    topic: 'الشروط',
    intent: 'navigational',
    category: 'core',
  },
  '/articles/official-holidays-saudi-arabia': {
    title: 'دليل الإجازات الرسمية حسب القطاع',
    h1: 'الإجازات الرسمية في السعودية حسب القطاع',
    description: 'شرح الفرق بين إجازة القطاع الحكومي والخاص والبنوك، مع روابط لعدّادات المناسبات.',
    topic: 'الإجازات الرسمية',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/salary-dates-saudi-arabia': {
    title: 'جدول صرف رواتب الموظفين الحكوميين',
    h1: 'موعد صرف رواتب الموظفين الحكوميين',
    description: 'متى يُتداول صرف رواتب الموظفين يوم 27 بعد قاعدة نهاية الأسبوع، مع روابط العدّاد والمقالات المرتبطة.',
    topic: 'مواعيد الرواتب',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/citizen-account-payment-dates': {
    title: 'موعد حساب المواطن والاستعلام عن الأهلية',
    h1: 'موعد حساب المواطن',
    description: 'موعد الدفعة المتداول يوم 10 وخطوات الاستعلام عن الأهلية من المصدر الرسمي.',
    topic: 'حساب المواطن',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/hijri-to-gregorian-conversion': {
    title: 'شرح تحويل التاريخ الهجري والميلادي',
    h1: 'تحويل التاريخ الهجري إلى ميلادي',
    description: 'كيف يعمل تحويل أم القرى، وأين تخطئ الحاسبات التقريبية، مع رابط الأداة.',
    topic: 'تحويل التاريخ',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/hijri-calendar-1448': {
    title: 'التقويم الهجري 1448 والمناسبات',
    h1: 'التقويم الهجري 1448',
    description: 'ترتيب شهور 1448 وأهم المناسبات، مع رابط التقويم والتحويل.',
    topic: 'التقويم الهجري',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/school-calendar-1448': {
    title: 'دليل التقويم الدراسي 1448-1449',
    h1: 'التقويم الدراسي 1448-1449',
    description: 'بداية الدراسة والإجازات المتداولة بنظام الفصلين، مع التأكيد على مراجعة المدرسة.',
    topic: 'التقويم الدراسي',
    intent: 'informational',
    category: 'articles',
  },
  '/articles/developed-social-security': {
    title: 'الضمان الاجتماعي المطور: التسجيل والأهلية',
    h1: 'الضمان الاجتماعي المطور',
    description: 'ملخص التسجيل والأهلية واحتساب الدخل والاعتراض، مع رابط موعد الصرف.',
    topic: 'الضمان الاجتماعي',
    intent: 'informational',
    category: 'articles',
  },
  '/search': {
    title: 'بحث في Alshafra',
    h1: 'ابحث عما تحتاجه',
    description: 'ابحث في الأدوات والمقالات والمواعيد. صفحة البحث غير مفهرسة.',
    topic: 'البحث',
    intent: 'navigational',
    category: 'core',
  },
  '/404': {
    title: 'الصفحة غير موجودة — 404',
    h1: 'الصفحة غير موجودة',
    description: 'هذا العنوان غير موجود في Alshafra.',
    topic: 'خطأ',
    intent: 'navigational',
    category: 'core',
  },
};

const TOOL_OVERRIDES: Record<string, Override> = {
  '/tool/percentage': {
    title: 'حاسبة النسبة المئوية',
    h1: 'حاسبة النسبة المئوية',
    description: 'احسب جزءاً من كل، أو نسبة رقم إلى آخر، أو نسبة التغيّر بين قيمتين داخل المتصفح.',
    topic: 'النسبة المئوية',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/discount': {
    title: 'حاسبة الخصم والسعر النهائي',
    h1: 'حاسبة الخصم',
    description: 'أدخل السعر ونسبة الخصم لمعرفة السعر النهائي والمبلغ الموفَّر.',
    topic: 'حساب الخصم',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/bmi': {
    title: 'حاسبة مؤشر كتلة الجسم BMI',
    h1: 'حاسبة مؤشر كتلة الجسم',
    description: 'احسب مؤشر كتلة الجسم من الوزن والطول. الناتج تقريبي وليس تشخيصاً.',
    topic: 'مؤشر الكتلة',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/loan': {
    title: 'حاسبة القسط الشهري للقرض',
    h1: 'حاسبة القسط الشهري',
    description: 'قدّر القسط من أصل القرض والنسبة وعدد الأشهر. ليست عرض تمويل.',
    topic: 'قسط القرض',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/unit-converter': {
    title: 'محوّل الوحدات للطول والوزن والحرارة',
    h1: 'محوّل الوحدات',
    description: 'حوّل بين وحدات الطول والوزن والحرارة الشائعة دون إرسال البيانات.',
    topic: 'تحويل الوحدات',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/word-counter': {
    title: 'عداد الكلمات والأحرف',
    h1: 'عداد الكلمات والأحرف',
    description: 'عدّ الكلمات والأحرف في نص عربي أو لاتيني داخل المتصفح.',
    topic: 'عد الكلمات',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/uuid': {
    title: 'مولّد UUID الإصدار 4',
    h1: 'مولّد UUID',
    description: 'أنشئ معرّفاً UUID v4 في المتصفح للتجارب والنماذج الأولية.',
    topic: 'UUID',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/base64': {
    title: 'ترميز وفك Base64',
    h1: 'ترميز Base64',
    description: 'حوّل النص من وإلى Base64 مع دعم العربية عبر UTF-8. هذا ترميز لا تشفير.',
    topic: 'Base64',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/url-encode': {
    title: 'ترميز وفك روابط URL',
    h1: 'ترميز عنوان URL',
    description: 'رمّز النصوص للروابط أو فك ترميز الاستعلام بالأحرف العربية.',
    topic: 'ترميز الروابط',
    intent: 'utility',
    category: 'tools',
  },
  '/tool/json-format': {
    title: 'تنسيق وفحص JSON',
    h1: 'تنسيق JSON',
    description: 'افحص صحة JSON ونسّقه في المتصفح دون رفع الملف.',
    topic: 'تنسيق JSON',
    intent: 'utility',
    category: 'tools',
  },
};

export function stripSiteBrand(title: string): string {
  return title
    .replace(/\s*\|\s*Alshafra\s*$/u, '')
    .replace(/\s*\|\s*تقويم السعودية\s*$/u, '')
    .replace(/\s*\|\s*شفرة تولز\s*$/u, '')
    .trim();
}

export function withSiteBrand(title: string): string {
  const core = stripSiteBrand(title);
  if (!core) return SITE_NAME;
  if (core === SITE_NAME || core.startsWith(`${SITE_NAME} `) || core.startsWith(`${SITE_NAME}—`) || core.startsWith(`${SITE_NAME} —`)) {
    return core;
  }
  if (core === `عن ${SITE_NAME}` || core === `تواصل مع ${SITE_NAME}` || core === `بحث في ${SITE_NAME}`) return core;
  return `${core} | ${SITE_NAME}`;
}

export function isGenericTitle(title: string): boolean {
  const core = stripSiteBrand(title).toLowerCase();
  return ['', 'untitled', 'page', 'tool', 'الصفحة الرئيسية', 'صفحة الأدوات', SITE_NAME.toLowerCase()].includes(core);
}

function inferCategory(path: string): string {
  if (path.startsWith('/articles')) return 'articles';
  if (path.startsWith('/trending')) return 'guides';
  if (path.startsWith('/tool') || path === '/tools' || path === '/date-converter' || path === '/age-calculator') return 'tools';
  if (path.startsWith('/gold-price') || path.startsWith('/usd-rate')) return 'tools';
  if (path.startsWith('/countdown') || path === '/calendar' || path === '/today' || path === '/hijri-calendar') return 'calendar';
  if (path === '/salaries' || path === '/school-calendar' || path === '/holidays') return 'calendar';
  return 'core';
}

function inferIntent(path: string, kind?: string): SearchIntent {
  if (path === '/' || path === '/tools' || path === '/calendar' || path === '/articles' || path === '/trending') {
    return 'navigational';
  }
  if (
    path.startsWith('/tool/') ||
    path === '/date-converter' ||
    path === '/age-calculator' ||
    kind === 'tool'
  ) {
    return 'utility';
  }
  return 'informational';
}

function patternOverride(path: string, fallbackTitle: string): Override | null {
  const gold = path.match(/^\/gold-price\/([^/]+)$/);
  if (gold) {
    const label = countryLabel(gold[1]);
    return {
      title: `سعر الذهب اليوم في ${label}`,
      h1: `سعر الذهب في ${label}`,
      description: `سعر تقريبي للجرام في ${label} حسب العيار من لقطة يومية. ليس سعر تنفيذ.`,
      topic: 'أسعار الذهب',
      intent: 'informational',
      category: 'tools',
    };
  }
  const usd = path.match(/^\/usd-rate\/([^/]+)$/);
  if (usd) {
    const label = countryLabel(usd[1]);
    return {
      title: `سعر الدولار اليوم في ${label}`,
      h1: `سعر الدولار في ${label}`,
      description: `سعر مرجعي للدولار في ${label} من لقطة يومية، دون رسوم الصرافة.`,
      topic: 'سعر الدولار',
      intent: 'informational',
      category: 'tools',
    };
  }
  const trendCat = path.match(/^\/trending\/(economy|technology|social|education|religion|travel)$/);
  if (trendCat) {
    const names: Record<string, string> = {
      economy: 'الاقتصاد',
      technology: 'التقنية',
      social: 'الدعم والحياة',
      education: 'التعليم',
      religion: 'الدين والعبادات',
      travel: 'السفر',
    };
    const label = names[trendCat[1]];
    return {
      title: `أدلة ${label} العملية`,
      h1: `أدلة ${label}`,
      description: `مجموعة أدلة عملية في ${label}. اختر موضوعاً واقرأ الشرح ثم انتقل إلى أداة أو مقال مرتبط.`,
      topic: label,
      intent: 'navigational',
      category: 'guides',
    };
  }
  if (path.startsWith('/countdown/') && path !== '/countdown') {
    const core = stripSiteBrand(fallbackTitle).replace(/^كم باقي على\s*/u, '') || 'المناسبة';
    return {
      title: `كم باقي على ${core.replace(/\s*\|\s*.*$/, '')}`,
      h1: stripSiteBrand(fallbackTitle) || `كم باقي على ${core}`,
      description: `عدّاد تنازلي لـ${core} وفق أم القرى وتوقيت الرياض.`,
      topic: 'العدّادات',
      intent: 'informational',
      category: 'calendar',
    };
  }
  return null;
}

const COUNTRY_AR: Record<string, string> = {
  egypt: 'مصر',
  sudan: 'السودان',
  algeria: 'الجزائر',
  iraq: 'العراق',
  morocco: 'المغرب',
  'saudi-arabia': 'السعودية',
  yemen: 'اليمن',
  syria: 'سوريا',
  tunisia: 'تونس',
  jordan: 'الأردن',
  uae: 'الإمارات',
  libya: 'ليبيا',
  lebanon: 'لبنان',
  palestine: 'فلسطين',
  mauritania: 'موريتانيا',
  oman: 'عُمان',
  kuwait: 'الكويت',
  qatar: 'قطر',
  bahrain: 'البحرين',
  djibouti: 'جيبوتي',
  comoros: 'جزر القمر',
};

function countryLabel(slug: string): string {
  return COUNTRY_AR[slug] || slug;
}

export function resolveMetadata(input: SeoInput): ResolvedSeo {
  const path = input.path || '/';
  const override = OVERRIDES[path] || TOOL_OVERRIDES[path] || patternOverride(path, input.title || input.h1 || '');
  const coreTitle = override?.title || stripSiteBrand(input.title || input.h1 || path);
  const h1 = override?.h1 || stripSiteBrand(input.h1 || coreTitle);
  let description = (override?.description || input.description || '').trim();
  if (!description || description === coreTitle || description === input.title) {
    description = `${h1} في Alshafra.`;
  }
  if (description.length > 170) description = `${description.slice(0, 167)}…`;
  const title = path === '/' ? coreTitle : withSiteBrand(coreTitle);
  return {
    path,
    title,
    description,
    h1,
    topic: override?.topic || h1,
    intent: override?.intent || inferIntent(path, input.kind),
    category: override?.category || inferCategory(path),
    indexable: isIndexableRobots(input.robots || 'index, follow') && path !== '/search' && path !== '/404',
    canonical: selfCanonical(path),
  };
}

export function validateMetadata(seo: ResolvedSeo): string[] {
  const errors: string[] = [];
  if (!seo.title) errors.push('missing title');
  if (!seo.h1) errors.push('missing h1');
  if (!seo.description || seo.description.length < 40) errors.push('thin description');
  if (!seo.canonical.includes('alshafra.com')) errors.push('bad canonical');
  if (isGenericTitle(seo.title)) errors.push('generic title');
  if (/تقويم السعودية|شفرة تولز/.test(`${seo.title} ${seo.h1}`)) errors.push('old brand in title/h1');
  if (seo.title.length > 80) errors.push('title too long');
  if (seo.h1 === SITE_NAME) errors.push('h1 is only the site name');
  return errors;
}

export function listSeoOverrides(): string[] {
  return [...Object.keys(OVERRIDES), ...Object.keys(TOOL_OVERRIDES)];
}
