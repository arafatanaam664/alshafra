import { LEGACY_TOOLS, type ToolDefinition } from './legacy';

export type ToolFamily = 'calculator' | 'converter' | 'text' | 'developer' | 'legacy';

export interface PublicTool extends ToolDefinition {
  title: string;
  h1: string;
  description: string;
  family: ToolFamily;
  indexable: boolean;
  faq: { q: string; a: string }[];
  sections: { heading: string; body: string }[];
}

export const NEW_TOOLS: readonly PublicTool[] = [
  {
    key: 'percentage',
    path: '/tool/percentage',
    engineKey: 'calc.percentage',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'calculator',
    indexable: true,
    title: 'حاسبة النسبة المئوية',
    h1: 'حاسبة النسبة المئوية',
    description: 'احسب كم يساوي جزء من كل، أو النسبة بين رقمين، أو نسبة الزيادة والنقصان، مع أمثلة عربية.',
    faq: [
      { q: 'كيف أحسب نسبة مئوية من رقم؟', a: 'اضرب الرقم في النسبة ثم اقسم على 100. مثلاً 15٪ من 200 = 30.' },
      { q: 'كيف أعرف أن 40 هي كم بالمئة من 200؟', a: 'اقسم الجزء على الكل واضرب في 100: 40÷200×100 = 20٪.' },
      { q: 'هل الحاسبة تخزن أرقامي؟', a: 'لا. الحساب يتم في المتصفح ولا يُرسل إلى خادم.' },
    ],
    sections: [
      {
        heading: 'متى تحتاج حاسبة النسبة؟',
        body: 'تظهر النسبة في الخصومات، الضرائب التقديرية، نتائج الاختبارات، ومقارنة نمو رقمين. الأداة تنفّذ الصيغ الثلاث الأكثر طلباً: جزء من كل، جزء بالنسبة إلى كل، ونسبة التغيّر بين قيمتين.',
      },
      {
        heading: 'صيغة التغيّر',
        body: 'نسبة التغيّر = (الجديد − القديم) ÷ القديم × 100. الناتج الموجب زيادة، والسالب نقصان. إذا كان القديم صفراً لا تُعرَّف النسبة.',
      },
    ],
  },
  {
    key: 'discount',
    path: '/tool/discount',
    engineKey: 'calc.discount',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'calculator',
    indexable: true,
    title: 'حاسبة الخصم',
    h1: 'حاسبة الخصم',
    description: 'أدخل السعر الأصلي ونسبة الخصم لتحصل على السعر النهائي والمبلغ الموفَّر.',
    faq: [
      { q: 'كيف أحسب سعر بعد خصم 25٪؟', a: 'السعر النهائي = الأصلي × (1 − 0.25). الموفَّر = الأصلي − النهائي.' },
      { q: 'هل تشمل الحاسبة الضريبة؟', a: 'لا. أدخل السعر كما تريد مقارنته، ثم أضف الضريبة منفصلاً إن لزم.' },
      { q: 'هل الناتج عرض ملزم؟', a: 'لا. الناتج حسابي لمساعدتك على المقارنة، والسعر النهائي لدى البائع.' },
    ],
    sections: [
      {
        heading: 'الفرق بين الخصم والتخفيض النقدي',
        body: 'الخصم النسبي يتغيّر مع السعر، بينما التخفيض النقدي مبلغ ثابت. هذه الحاسبة للنسبة فقط حتى لا تُخلط الصيغتان.',
      },
    ],
  },
  {
    key: 'bmi',
    path: '/tool/bmi',
    engineKey: 'calc.bmi',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'calculator',
    indexable: true,
    title: 'حاسبة مؤشر كتلة الجسم BMI',
    h1: 'حاسبة مؤشر كتلة الجسم',
    description: 'احسب مؤشر كتلة الجسم من الوزن والطول وفق الصيغة الشائعة، مع تصنيف تقريبي وليس تشخيصاً طبياً.',
    faq: [
      { q: 'ما صيغة BMI؟', a: 'الوزن بالكيلوغرام مقسوماً على مربع الطول بالمتر.' },
      { q: 'هل النتيجة تشخيص؟', a: 'لا. التصنيف تقريبي ولا يغني عن استشارة مختص.' },
      { q: 'لماذا قد لا يناسب الرياضيين؟', a: 'المؤشر لا يفرّق بين العضل والدهون، لذلك قد يبالغ في تصنيف أصحاب الكتلة العضلية.' },
    ],
    sections: [
      {
        heading: 'حدود المؤشر',
        body: 'تستخدم منظمة الصحة العالمية حدوداً تقريبية: أقل من 18.5 نحافة، حتى 25 وزن مناسب، حتى 30 زيادة وزن. هذه الحدود لا تراعي العمر أو الحمل أو تكوين الجسم.',
      },
    ],
  },
  {
    key: 'loan',
    path: '/tool/loan',
    engineKey: 'calc.loan',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'calculator',
    indexable: true,
    title: 'حاسبة القسط الشهري للقرض',
    h1: 'حاسبة القسط الشهري',
    description: 'قدّر القسط الشهري من أصل القرض ونسبة سنوية وعدد الأشهر وفق إطفاء ثابت. ليست عرض تمويل.',
    faq: [
      { q: 'ما الصيغة المستخدمة؟', a: 'قسط ثابت بفائدة شهرية مركبة: P×r×(1+r)^n ÷ ((1+r)^n−1).' },
      { q: 'هل تشمل الرسوم؟', a: 'لا. الرسوم الإدارية والتأمين والسداد المبكر خارج هذه الصيغة.' },
      { q: 'هل هذا عرض بنك؟', a: 'لا. أداة تقديرية مستقلة وليست جهة تمويل.' },
    ],
    sections: [
      {
        heading: 'إخلاء مسؤولية',
        body: 'الناتج تقريبي لمساعدتك على فهم أثر المدة والنسبة. القرار المالي يُراجع مع الجهة المموِّلة والعقد.',
      },
    ],
  },
  {
    key: 'unit-converter',
    path: '/tool/unit-converter',
    engineKey: 'convert.units',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'converter',
    indexable: true,
    title: 'محوّل الوحدات',
    h1: 'محوّل الوحدات',
    description: 'حوّل الطول والوزن ودرجة الحرارة بين الوحدات الشائعة دون إرسال البيانات إلى خادم.',
    faq: [
      { q: 'أي وحدات مدعومة؟', a: 'الطول: م، سم، كم، إنش، قدم. الوزن: كغ، غرام، رطل. الحرارة: مئوي وفهرنهايت.' },
      { q: 'هل التحويل تقريبي؟', a: 'ثوابت الطول والوزن قياسية. الحرارة تستخدم الصيغة الخطية المعتادة.' },
      { q: 'هل توجد عملات هنا؟', a: 'أسعار الصرف في صفحات الذهب والدولار لأنها تعتمد لقطة سوق لا ثابتاً فيزيائياً.' },
    ],
    sections: [
      {
        heading: 'لماذا فُصلت العملات؟',
        body: 'تحويل المتر إلى سنتيمتر ثابت، أما الريال إلى دولار فيتغير يومياً. لذلك أسعار الصرف بقيت في مسارها القديم `/usd-rate`.',
      },
    ],
  },
  {
    key: 'word-counter',
    path: '/tool/word-counter',
    engineKey: 'text.count',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'text',
    indexable: true,
    title: 'عداد الكلمات والأحرف',
    h1: 'عداد الكلمات والأحرف',
    description: 'عدّ الكلمات والأحرف في نص عربي أو لاتيني داخل المتصفح.',
    faq: [
      { q: 'كيف تُعدّ الكلمة؟', a: 'أي مقطع مفصول بمسافة يُحسب كلمة واحدة.' },
      { q: 'هل تُحسب التشكيل؟', a: 'كل رمز يونيكود يُحسب حرفاً، بما في ذلك التشكيل إن وُجد.' },
      { q: 'هل يُرفع النص؟', a: 'لا. العدّ محلي في جهازك.' },
    ],
    sections: [
      {
        heading: 'الاستخدام',
        body: 'مفيد لتقدير طول مقال أو تغريدة أو وصف منتج قبل النشر. النتيجة فورية ولا تُحفظ.',
      },
    ],
  },
  {
    key: 'uuid',
    path: '/tool/uuid',
    engineKey: 'dev.uuid',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'developer',
    indexable: true,
    title: 'مولّد UUID',
    h1: 'مولّد UUID الإصدار 4',
    description: 'أنشئ معرّفاً UUID v4 في المتصفح للاستخدام في النماذج والتجارب البرمجية.',
    faq: [
      { q: 'ما الإصدار المولَّد؟', a: 'الإصدار 4 العشوائي مع البتات الثابتة وفق RFC 4122.' },
      { q: 'هل هو UUIDv7؟', a: 'لا. معرّفات المنصة الداخلية UUIDv7 تُولَّد في الخادم عند الحاجة، وهذه الأداة للتجارب العامة.' },
      { q: 'هل يتكرر؟', a: 'احتمال التصادم ضئيل عملياً، لكن لا تستخدمه كمفتاح سري.' },
    ],
    sections: [
      {
        heading: 'متى تستخدمه؟',
        body: 'لنماذج أولية أو مفاتيح تجريبية. لا تعتمد عليه كسر للمصادقة أو كبديل لكلمة مرور.',
      },
    ],
  },
  {
    key: 'base64',
    path: '/tool/base64',
    engineKey: 'dev.base64',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'developer',
    indexable: true,
    title: 'ترميز وفك Base64',
    h1: 'ترميز Base64',
    description: 'حوّل النص من وإلى Base64 مع دعم الأحرف العربية عبر UTF-8.',
    faq: [
      { q: 'لماذا يظهر خطأ عند الفك؟', a: 'النص ليس Base64 صالحاً أو نُسخ ناقصاً.' },
      { q: 'هل يدعم العربية؟', a: 'نعم عبر تحويل UTF-8 قبل الترميز.' },
      { q: 'هل هذا تشفير؟', a: 'لا. Base64 ترميز قابل للعكس وليس حماية سرية.' },
    ],
    sections: [
      {
        heading: 'الاستخدام الآمن',
        body: 'لا تلصق كلمات مرور حقيقية في أدوات عامة على جهاز مشترك. الأداة لا ترسل النص، لكن الشاشة قد تُحفظ.',
      },
    ],
  },
  {
    key: 'url-encode',
    path: '/tool/url-encode',
    engineKey: 'dev.url',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'developer',
    indexable: true,
    title: 'ترميز وفك روابط URL',
    h1: 'ترميز عنوان URL',
    description: 'رمّز النصوص للروابط أو فك ترميز query string بالأحرف العربية.',
    faq: [
      { q: 'ما الفرق عن encodeURI؟', a: 'نستخدم encodeURIComponent المناسب لمكوّن واحد في الاستعلام.' },
      { q: 'هل يغيّر المسار الكامل؟', a: 'الصق الجزء المراد ترميزه فقط حتى لا تُكسر الفواصل.' },
      { q: 'هل يُرسل الرابط؟', a: 'لا. التحويل محلي.' },
    ],
    sections: [
      {
        heading: 'مثال',
        body: 'الجملة «أم القرى» تصبح %D8%A3%D9%85%20%D8%A7%D9%84%D9%82%D8%B1%D9%89 داخل معامل بحث.',
      },
    ],
  },
  {
    key: 'json-format',
    path: '/tool/json-format',
    engineKey: 'dev.json',
    runtime: 'island',
    dataMode: 'client_compute',
    family: 'developer',
    indexable: true,
    title: 'تنسيق وفحص JSON',
    h1: 'تنسيق JSON',
    description: 'افحص صحة JSON ونسّقه بمسافات واضحة داخل المتصفح.',
    faq: [
      { q: 'ماذا يعني خطأ التحليل؟', a: 'النص ليس JSON صالحاً: فاصلة زائدة أو مفاتيح بلا علامات اقتباس.' },
      { q: 'هل يُحفظ الملف؟', a: 'لا. لا يوجد رفع إلى خادم.' },
      { q: 'هل يدعم JSONC؟', a: 'لا. التعليقات غير مسموحة في JSON القياسي.' },
    ],
    sections: [
      {
        heading: 'حدود الأداة',
        body: 'مخصصة للنصوص الصغيرة والمتوسطة. الملفات الضخمة أفضل في محرر محلي.',
      },
    ],
  },
];

export function allToolDefinitions(): ToolDefinition[] {
  return [...LEGACY_TOOLS, ...NEW_TOOLS];
}

export function collidingToolPaths(reserved: Iterable<string>): string[] {
  const taken = new Set(reserved);
  return NEW_TOOLS.filter((tool) => taken.has(tool.path)).map((tool) => tool.path);
}
