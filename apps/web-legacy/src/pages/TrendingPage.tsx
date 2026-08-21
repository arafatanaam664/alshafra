// TrendingPage.tsx — صفحات /trending (المواضيع الرائجة في الخليج)
// تعرض المركز والفئات والمواضيع من src/data/trending.json، وكل موضوع يعرض
// محتواه الطويل الكامل (+1500 كلمة): فقرات، عناوين، جدول حقائق، أسئلة شائعة،
// وروابط داخلية. يُظهر أيضاً «أكثر ما يبحث عنه الخليج اليوم» من لقطة Google Trends.
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  ArrowLeft,
  Clock,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  Calendar,
  LayoutGrid,
} from 'lucide-react';
import { useSeo, SITE_URL } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Link from '../components/Link';
import {
  TRENDING_CATEGORIES,
  TRENDING_TOPICS,
  topicBySlug,
  topicsByCategory,
  categoryBySlug,
  topicReadMinutes,
  keywordsList,
  relatedTopics,
  loadTrendingSnapshot,
  type TrendingTopic,
  type TrendingCategory,
  type TrendingSnapshot,
} from '../lib/trendingData';

const CATEGORY_ORDER = Object.keys(TRENDING_CATEGORIES);

/* -------------------------------------------------------------------------- */
/* مكوّنات مشتركة                                                              */
/* -------------------------------------------------------------------------- */

function TopicCard({ topic, large }: { topic: TrendingTopic; large?: boolean }) {
  const cat = TRENDING_CATEGORIES[topic.category];
  return (
    <Link
      to={`/trending/${topic.slug}`}
      className={`card group flex flex-col p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft ${
        large ? 'sm:p-6' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{topic.emoji}</span>
        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          {cat ? `${cat.emoji} ${cat.ar}` : topic.category}
        </span>
      </div>
      <h3
        className={`mt-3 font-display font-bold leading-snug text-brand-900 group-hover:text-brand-700 ${
          large ? 'text-lg' : 'text-sm'
        }`}
      >
        {topic.title}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-brand-700/70 line-clamp-3">
        {topic.description}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-brand-700/70 line-clamp-4">{topic.intro[0]}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
          اقرأ الدليل
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-brand-600/60">
          <Clock className="h-3 w-3" />
          {topicReadMinutes(topic)} دقائق قراءة
        </span>
      </div>
    </Link>
  );
}

function CategoryChip({ code, cat }: { code: string; cat: TrendingCategory }) {
  return (
    <Link
      to={`/trending/${code}`}
      className="card group flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl transition-colors group-hover:bg-brand-600">
        {cat.emoji}
      </span>
      <span className="flex-1 text-right">
        <span className="block font-display text-sm font-bold text-brand-900">{cat.ar}</span>
        <span className="block text-[11px] text-brand-600/60">
          {topicsByCategory(code).length} أدلة شاملة
        </span>
      </span>
      <ArrowLeft className="h-4 w-4 text-brand-300 transition-transform group-hover:-translate-x-0.5" />
    </Link>
  );
}

function TopicReviewGuide({ topic }: { topic: TrendingTopic }) {
  const keywords = keywordsList(topic).slice(0, 6).join('، ');
  const paragraphs = [
    `ابدأ بتحديد القرار الذي تريد اتخاذه في موضوع «${topic.title}» واكتب الدولة والفئة والتاريخ والمبلغ أو الخدمة. قد تكون نتيجة منتشرة صحيحة لسنة أو قطاع آخر، لذلك ارجع إلى الجهة صاحبة الاختصاص ولا تجعل الرواج دليل صحة.`,
    `استخدم كلمات مثل ${keywords} للوصول إلى المصدر الأصلي، وافحص تاريخ النشر والروابط والنطاق. لا تعتمد على صورة مقصوصة أو عنوان محدث بسنة جديدة من دون تغير المصدر والأرقام.`,
    'حوّل الشرح إلى قائمة تنفيذ: الوثيقة والموعد والتكلفة الكاملة والجهة ودليل نجاح الإجراء. احتفظ برقم مرجع أو فاتورة، فالمقال لا يدخل إلى حسابك ولا يضمن قبولًا أو سعرًا أو نتيجة شخصية.',
    'انتبه إلى الاستعجال وطلب رمز التحقق والتحويل إلى حساب شخصي والوعد بعائد مضمون. افتح الموقع الرسمي بنفسك، ولا تثبت تطبيق تحكم. إذا شاركت بيانات مالية فاتصل بالبنك فورًا.',
    'اكتب تاريخ آخر تحقق واحفظ المصدر. عند تغير الخبر حدّث خطتك وشارك التصحيح مع من وصلتهم النسخة القديمة. المحتوى الجيد يوضح ما تغير ولا يبدل التاريخ فقط كي يبدو جديدًا.',
    'افصل التعليم العام عن الاستشارة الفردية؛ العقد والملف الصحي والمالي والأنظمة المحلية قد تحتاج مختصًا مرخصًا. استخدم الدليل لبناء السؤال ثم نفذ عبر القناة الرسمية.',
    'قِس الفائدة بتسجيل الحقيقة والمصدر والخطوة والموعد والتكلفة والمخاطر. راجع الوحدات وأسماء الدول وهل المثال لفرد أو شركة وهل يشمل الرسوم والضريبة.',
    'قبل الإغلاق تحقق أنك عرفت تاريخًا مطلقًا واسم جهة ورابطًا وخطوة قابلة للتنفيذ. إذا بقيت الإجابة عامة فارجع إلى القسم المتخصص ولا تملأ الفجوة بتخمين.',
    'ابنِ استعلام البحث من اسم الموضوع والدولة والسنة وكلمة ملف أو لائحة أو دليل. افتح النتيجة الأصلية، وابحث داخلها عن المصطلح، واقرأ الحاشية والاستثناء بدل نقل أول سطر يظهر في محرك البحث.',
    'إذا تعارض مصدران فابدأ بصاحب الصلاحية الأضيق والأحدث: الجهة المنظمة قبل المدونة، ومقدم الخدمة في شروطه قبل مراجعة مجهولة. احتفظ بالتعارض في ملاحظاتك حتى تجد تحديثًا يحسمه.',
    'طبّق مثالًا تجريبيًا بلا بيانات حساسة: احسب الإجمالي، أو ضع الموعد في التقويم، أو جهز قائمة الوثائق. يكشف الاختبار اختلاف الوحدات والضرائب والمناطق الزمنية والخطوات الناقصة.',
    'قارن البدائل في جدول بمعايير ثابتة لا بالانطباع: المصدر، تاريخ التحقق، التكلفة، الوقت، الخصوصية، شروط الإلغاء، وأثر أسوأ احتمال معقول. لا تجعل السعر المعلن وحده معيارًا.',
    'ضع خطة رجوع تشمل مهلة الإلغاء وطريقة الاعتراض والقناة الاحتياطية. القرار المتين لا يفترض أن التحويل أو الحجز أو التسجيل سيكتمل من المحاولة الأولى.',
    'عند مشاركة النتيجة اكتب أنها خلاصة مرتبطة بدولة وتاريخ وفئة، وأرفق الرابط المباشر. لا تحول تجربة فردية إلى قاعدة عامة ولا تنقل بياناته لإثبات القصة.',
    'خصص مراجعة لاحقة للقرار عند اقتراب الموعد أو تغير السعر أو صدور إعلان. حدث النسخة المستخدمة وأبق سجلًا قصيرًا لما تغير كي لا تعمل الأسرة أو الفريق على تعليمات مختلفة.',
  ];
  return <section className="mt-10 card p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-brand-900">كيف تتحقق قبل التطبيق؟</h2>{paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-[15px] leading-loose text-brand-800/90">{paragraph}</p>)}</section>;
}

function TopicApplicationGuide({ topic, category }: { topic: TrendingTopic; category?: TrendingCategory }) {
  const facts = (topic.facts || []).map(([key, value]) => `${key}: ${value}`).join('؛ ');
  return (
    <>
      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-brand-900">خطوات عملية للتطبيق المباشر</h2>
        <ol className="mt-4 space-y-3 text-[15px] leading-loose text-brand-800/90">
          {topic.sections.map((section, index) => (
            <li key={section.heading}>{index === 0 ? 'ابدأ أولًا' : 'ثم انتقل'} إلى محور «{section.heading}»، وحدد المعلومة التي تحتاجها منه وطبّق الخطوات المذكورة على دولتك وفئتك وتاريخ قرارك. دوّن المصدر والنتيجة بدل الاكتفاء بحفظ العنوان.</li>
          ))}
        </ol>
        <p className="mt-4 text-[15px] leading-loose text-brand-800/90">بعد المرور على المحاور، اجمع النتائج في قائمة واحدة: ما ثبت، وما بقي غير مؤكد، وما يحتاج إلى اتصال رسمي، وما يمكنك تنفيذه الآن. راجع التعارضات قبل الدفع أو التقديم أو المشاركة.</p>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-brand-900">خلاصة الدليل وحدود استخدامه</h2>
        <p className="mt-3 text-[15px] leading-loose text-brand-800/90">ينتمي موضوع «{topic.title}» إلى فئة «{category?.ar || topic.category}»، وقد تناول الدليل {topic.sections.length} محاور مترابطة. ابدأ بالسؤال الذي يخصك ولا تفترض أن كل الأمثلة تنطبق على دولة أو سنة أو عقد مختلف.</p>
        <p className="mt-3 text-[15px] leading-loose text-brand-800/90">من الحقائق المختصرة الواردة هنا: {facts || 'تعريف المصطلحات والخطوات والمخاطر الأساسية'}. ارجع إلى سياق كل حقيقة ووحدتها وتاريخها؛ الجدول المختصر وسيلة وصول وليس بديلًا عن القسم والمصدر.</p>
        <p className="mt-3 text-[15px] leading-loose text-brand-800/90">احتفظ برابط الصفحة مع تاريخ مراجعتك، وارجع إلى الجهة المختصة قرب التنفيذ. إذا تغيرت قاعدة أو تكلفة أو مهلة فحدّث قرارك وشارك التصحيح. الهدف أن تتحول القراءة إلى سؤال أدق وخطوة أكثر أمانًا، لا أن يمنح طول المقال ثقة غير مستحقة.</p>
      </section>
      <section className="mt-10 rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
        <h2 className="font-display text-lg font-bold text-brand-900">أسئلة المراجعة الأخيرة</h2>
        <p className="mt-3 text-sm leading-loose text-brand-800/90">هل عرفت الجهة والتاريخ والدولة؟ هل قارنت التكلفة الكاملة والشروط؟ هل احتفظت بمرجع؟ هل حذفت البيانات الحساسة من ملاحظاتك؟ وهل لديك بديل إذا تأخر الإجراء؟ إذا كانت إجابة مهمة غير واضحة، فعد إلى القسم المرتبط بها قبل اتخاذ القرار.</p>
        <p className="mt-3 text-sm leading-loose text-brand-800/90">افتح الروابط المهمة مرة أخيرة وتأكد أنها تصل إلى الوثيقة المقصودة لا إلى الصفحة الرئيسية. طابق اسم الملف ورقم التعميم والتاريخ، وافصل بين تاريخ نشر الخبر وتاريخ بدء التطبيق. إذا كان المصدر صامتًا عن استثناء أو رسم فلا تعتبر الصمت إعفاءً، بل اسأل الجهة بسؤال محدد وسجل رقم الطلب والقناة.</p>
        <p className="mt-3 text-sm leading-loose text-brand-800/90">راجع القرار من منظور أسوأ احتمال معقول: تأخر التحويل، رفض الطلب، تغير الموعد، أو توقف الأداة. ضع هامش وقت وميزانية وخطة بديلة، واقرأ شروط الاسترداد والاعتراض. لا تنشر خلاصتك كقاعدة للجميع؛ اذكر البلد والفئة والتاريخ، وميّز بوضوح بين اقتباس المصدر واستنتاجك الشخصي.</p>
        <p className="mt-3 text-sm leading-loose text-brand-800/90">إذا استخدم الدليل فريق أو أسرة فاحفظ النسخة في مكان مشترك وحدد مسؤول المراجعة وموعدها. عند ظهور تحديث اكتب ما تغير وأرسل التصحيح إلى من تلقوا التعليمات السابقة. سجل كذلك ما لا تعرفه بعد؛ الاعتراف بالفجوة يحمي القرار أكثر من ملئها بتخمين أو تجربة من سياق مختلف.</p>
      </section>
    </>
  );
}

function CategoryQualityGuide({ cat }: { cat: TrendingCategory }) {
  const paragraphs = [
    `ابدأ بالموضوع الأقرب إلى سؤالك في فئة «${cat.ar}»، لكن لا تعتبر ترتيب الأدلة توصية أو خبرًا وقع اليوم. كلمة رائج تصف اهتمام الباحثين ولا تثبت صحة الادعاء.`,
    'حدد الدولة الخليجية والفئة والسنة؛ فالأنظمة والأسعار والتقويمات تختلف، كما يختلف القطاع الحكومي عن الخاص. افتح نطاق الجهة صاحبة الاختصاص بدل الاكتفاء بمقتطف.',
    'قارن تاريخ الواقعة بتاريخ مراجعة الدليل. لا يكفي تبديل السنة في العنوان، وإذا لم يتغير المصدر فلا تقدم فقرة قديمة كخبر جديد.',
    'في المال احسب الإجمالي والرسوم والمخاطر، وفي التعليم والسفر والدين راجع إعلان الجهة، وفي التقنية راجع الأذونات والخصوصية قبل التثبيت.',
    'اكتب السؤال والمصدر والنتيجة والخطوة التالية. إذا احتاج القرار عقدًا أو ملفًا صحيًا أو استثمارًا فاستعن بمختص مرخص.',
    'شارك الرابط والدولة والسنة والتنبيه، ولا تنشر وثائق شخصية. أرسل التصحيح مع المصدر والعبارة المحددة بدل وصف عام.',
    'صغ البحث كتحديد أو مقارنة أو موعد أو تكلفة أو إجراء، واقرأ نطاق الوثيقة والاستثناءات والحواشي وسجل رقم القرار وتاريخه.',
    'اختبر المعلومة على مثال غير حساس. احسب المبلغ أو ضع التاريخ في تقويم أو اكتب خطوات الطلب، ولا تعوض الفجوة بتجربة شخص في بلد آخر.',
    'قارن الخيارات بمعايير ثابتة: الإجمالي في السعر، والخصوصية في التطبيق، وشروط الدخول والإلغاء في السفر، والاعتماد في التعليم، والنص والمهلة في الحقوق.',
    'لا تدخل كلمة مرور أو رمز تحقق من رابط رسالة، ولا تستخدم بيانات عميل أو طفل مع أداة عامة. استبدلها بمثال وتحقق من المخرجات.',
    'احفظ الرابط وتاريخ الوصول والخلاصة وما ستفعله، وضع تذكيرًا قبل المهلة. عند التحديث اكتب ما تغير ولا تمسح السجل القديم.',
    `اختم بملخص من الحقيقة والمصدر والتاريخ والاستثناء والخطوة التالية. هذه العادة تجعل متابعة «${cat.ar}» تراكمًا منظمًا لا عناوين كثيرة بلا قرار.`,
    'أنشئ سجل مصادر بسيطًا يضم عنوان الوثيقة والجهة والرابط وتاريخ الوصول والاقتباس الداعم. الرابط وحده لا يكفي لأنه قد يتغير، واللقطة وحدها لا تكفي لأنها تخفي السياق.',
    'رتب المراجعة على ثلاث جولات: افهم المصطلحات أولًا، ثم تحقق من الأرقام والمواعيد، ثم راجع المخاطر والتنفيذ. فصل الجولات يقلل احتمال تمرير ادعاء لأنه يوافق توقعك.',
    'إذا كانت هناك حاسبة أو نموذج فاقرأ تعريف المدخلات قبل استخدامها. اختبر رقمًا تعرف نتيجته، وميّز التقدير عن النتيجة الرسمية، ولا تدخل هوية أو رقم بطاقة في أداة غير موثقة.',
    'للمقارنة العادلة ثبّت الوحدة والمدة وما تشمله التكلفة. قد يبدو عرض أرخص لأنه يستبعد الضريبة أو التأمين أو الشحن أو رسوم التحويل؛ اكتب الافتراضات بجوار النتيجة.',
    'ضع لكل معلومة درجة ثقة: موثقة بنص رسمي، أو مؤكدة من مصدرين، أو تجربة قابلة للتغير، أو ادعاء لم يتحقق. لا تستخدم الدرجة الأخيرة في قرار لا يمكن التراجع عنه.',
    'تأكد من أهلية المعلومة لحالتك: العمر والجنسية ومكان الإقامة والقطاع ونوع العقد قد تغير النتيجة. وجود مثال قريب لا يعني انطباق شروطه تلقائيًا.',
    'عند الاتصال بالجهة صغ سؤالًا واحدًا يذكر الحالة والتاريخ والمرجع، واطلب رابطًا مكتوبًا. سجل رقم البلاغ والموعد المتوقع بدل الاعتماد على اسم موظف أو ذاكرة مكالمة.',
    'راجع أسوأ احتمال معقول قبل الدفع أو الحجز أو التقديم: التأخير أو الرفض أو تغير الموعد أو تعطل الأداة. حدد بديلًا وهامش وقت وميزانية وطريقة اعتراض.',
    'لا تجعل كثرة النتائج بديلًا عن تنوعها؛ عشر صفحات تعيد الخبر نفسه مصدر واحد فعليًا. ابحث عن النص المؤسس، وصفحة الإجراء، ومصدر مستقل يشرح التطبيق أو القيود.',
    'بعد التنفيذ سجل ما نجح وما اختلف عن الدليل من دون نشر بيانات شخصية. هذه الملاحظة تحسن مراجعتك التالية، لكنها تظل تجربة وليست حكمًا عامًا على كل المستخدمين.',
  ];
  return <section className="mt-10 card p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-brand-900">دليل التحقق واستخدام الفئة</h2>{paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-loose text-brand-700/85">{paragraph}</p>)}</section>;
}

/* -------------------------------------------------------------------------- */
/* /trending — المركز                                                            */
/* -------------------------------------------------------------------------- */

export function TrendingHubPage() {
  const [snapshot, setSnapshot] = useState<TrendingSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    loadTrendingSnapshot().then((s) => {
      if (alive) setSnapshot(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useSeo({
    title: 'المواضيع الرائجة في الخليج | تقويم السعودية',
    description:
      'دلائل ومواضيع شاملة وأكثر ما يبحث عنه المستخدمون في الخليج: الاقتصاد، التقنية، الحياة، التعليم، الدين والسفر — أدلة طويلة +1500 كلمة تُحدَّث يومياً.',
    canonical: `${SITE_URL}/trending`,
    keywords:
      'المواضيع الرائجة, الأكثر بحثاً, أدلة شاملة, الاقتصاد, التقنية, السفر, الخليج, ترند الخليج',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'المواضيع الرائجة في الخليج',
        url: `${SITE_URL}/trending`,
        inLanguage: 'ar-SA',
        hasPart: TRENDING_TOPICS.map((t) => ({
          '@type': 'Article',
          headline: t.title,
          url: `${SITE_URL}/trending/${t.slug}`,
        })),
      },
    ],
  });

  const snapshotCountries =
    snapshot && snapshot.countries
      ? Object.entries(snapshot.countries).filter(([, c]) => c && c.titles && c.titles.length)
      : [];

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'المواضيع الرائجة' }]} />

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl gradient-brand p-8 text-white sm:p-10">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="relative">
          <span className="chip bg-white/15 text-white ring-1 ring-white/20">
            <TrendingUp className="h-3.5 w-3.5 text-gold-300" />
            الأكثر بحثاً في الخليج
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
            المواضيع الرائجة والمطلوبة في الخليج
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-50/90 sm:text-base">
            مجموعة متجددة من الأدلة الشاملة للمواضيع الأكثر بحثاً لدى المستخدمين في دول الخليج
            العربي، مكتوبة بعناية وتُحدَّث باستمرار لتقديم معلومات دقيقة ومفيدة في الاقتصاد
            والتقنية والحياة والتعليم والدين والسفر.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-brand-50/80">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> {TRENDING_TOPICS.length} دليلاً شاملاً
            </span>
            <span>·</span>
            <span>{CATEGORY_ORDER.length} فئات</span>
            <span>·</span>
            <span>تُحدَّث يومياً</span>
          </div>
        </div>
      </section>

      {/* أقسام الفئات */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">تصفح حسب الفئة</h2>
            <p className="mt-1 text-sm text-brand-700/70">اختر الفئة التي تهمك للوصول لأدلتها</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_ORDER.map((code) => (
            <CategoryChip key={code} code={code} cat={TRENDING_CATEGORIES[code]} />
          ))}
        </div>
      </section>

      {/* جميع المواضيع */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">جميع الأدلة والمواضيع</h2>
            <p className="mt-1 text-sm text-brand-700/70">
              كل موضوع صفحة كاملة +1500 كلمة بعناوينها وفقراتها وأسئلتها الشائعة
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_TOPICS.map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      </section>

      {/* أكثر ما يبحث عنه الخليج اليوم */}
      {snapshotCountries.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">أكثر ما يبحث عنه الخليج اليوم</h2>
              <p className="mt-1 text-sm text-brand-700/70">
                وفق Google Trends — {snapshot?.date || ''}
              </p>
            </div>
            <Link to="/trending/today" className="btn-ghost">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snapshotCountries.map(([code, c]) => (
              <div key={code} className="card p-5">
                <h3 className="font-display text-sm font-bold text-brand-900">
                  {c.country || code}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {(c.titles || []).slice(0, 8).map((title, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-brand-700/80">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand-400" />
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* /trending/:category — صفحة الفئة                                              */
/* -------------------------------------------------------------------------- */

export function TrendingCategoryPage({ category }: { category: string }) {
  const cat = categoryBySlug(category);
  const items = topicsByCategory(category);

  useSeo({
    title: cat
      ? `${cat.ar} | المواضيع الرائجة في الخليج | تقويم السعودية`
      : 'فئة غير موجودة | المواضيع الرائجة | تقويم السعودية',
    description: cat
      ? `أدلة شاملة في فئة ${cat.ar} — المواضيع الأكثر بحثاً في الخليج العربي.`
      : undefined,
    canonical: `${SITE_URL}/trending/${category}`,
    keywords: cat ? `${cat.ar}, مواضيع رائجة, الخليج, دليل شامل` : undefined,
  });

  if (!cat) {
    return <NotFoundBlock />;
  }

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'المواضيع الرائجة', path: '/trending' },
          { name: cat.ar },
        ]}
      />
      <header className="mt-4 max-w-2xl">
        <span className="text-4xl">{cat.emoji}</span>
        <h1 className="mt-3 section-title">{cat.ar}</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          أدلة ومواضيع شاملة ضمن فئة «{cat.ar}» الأكثر بحثاً في الخليج، كل دليل صفحة كاملة
          بفقراتها وأسئلتها الشائعة وجدول معلوماتها.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-brand-600/70">لا توجد مواضيع في هذه الفئة بعد.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      )}

      <section className="mt-10 space-y-8">
        <h2 className="section-title">ملخصات عملية لموضوعات الفئة</h2>
        {items.map((topic) => (
          <article key={topic.slug} className="card p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-brand-900">
              <Link to={`/trending/${topic.slug}`}>{topic.title}</Link>
            </h3>
            <p className="mt-3 text-sm leading-loose text-brand-700/85">{topic.description}</p>
            {topic.intro.slice(0, 2).map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-loose text-brand-700/85">{paragraph}</p>)}
            {topic.sections.slice(0, 2).map((section) => (
              <section key={section.heading} className="mt-5">
                <h4 className="font-display text-base font-bold text-brand-900">{section.heading}</h4>
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-loose text-brand-700/85">{paragraph}</p>)}
              </section>
            ))}
          </article>
        ))}
      </section>

      <CategoryQualityGuide cat={cat} />

      <section className="mt-12">
        <h2 className="font-display text-lg font-bold text-brand-900">فئات أخرى</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORY_ORDER.filter((c) => c !== category).map((code) => (
            <Link
              key={code}
              to={`/trending/${code}`}
              className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              {TRENDING_CATEGORIES[code].emoji} {TRENDING_CATEGORIES[code].ar}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* /trending/:slug — صفحة الموضوع الطويلة (+1500 كلمة)                           */
/* -------------------------------------------------------------------------- */

export function TrendingTopicPage({ slug }: { slug: string }) {
  const topic = topicBySlug(slug);
  const cat = topic ? TRENDING_CATEGORIES[topic.category] : undefined;
  const related = topic ? relatedTopics(topic, 8) : [];
  const minutes = topic ? topicReadMinutes(topic) : 0;

  useSeo({
    title: topic ? `${topic.title} | تقويم السعودية` : 'موضوع غير موجود | تقويم السعودية',
    description: topic?.description,
    canonical: `${SITE_URL}/trending/${slug}`,
    keywords: topic ? keywordsList(topic).join(', ') : undefined,
    jsonLd: topic
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: topic.title,
            description: topic.description,
            inLanguage: 'ar-SA',
            author: { '@type': 'Organization', name: 'تقويم السعودية' },
            publisher: { '@type': 'Organization', name: 'تقويم السعودية' },
            keywords: keywordsList(topic).join(', '),
            articleSection: cat ? cat.ar : topic.category,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'المواضيع الرائجة', item: `${SITE_URL}/trending` },
              ...(cat
                ? [
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: cat.ar,
                      item: `${SITE_URL}/trending/${topic.category}`,
                    },
                  ]
                : []),
              { '@type': 'ListItem', position: 4, name: topic.title, item: `${SITE_URL}/trending/${topic.slug}` },
            ],
          },
        ]
      : undefined,
  });

  if (!topic) {
    return <NotFoundBlock />;
  }

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'المواضيع الرائجة', path: '/trending' },
          ...(cat ? [{ name: cat.ar, path: `/trending/${topic.category}` }] : []),
          { name: topic.title },
        ]}
      />

      <article className="mx-auto mt-6 max-w-3xl">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
              {cat ? `${cat.emoji} ${cat.ar}` : topic.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-brand-600/70">
              <Clock className="h-3.5 w-3.5" /> {minutes} دقائق قراءة
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-brand-600/70">
              <LayoutGrid className="h-3.5 w-3.5" /> دليل شامل
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
            {topic.emoji} {topic.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-700/85">{topic.description}</p>
        </header>

        {/* المقدمة */}
        <div className="mt-8 space-y-4">
          {topic.intro.map((p, i) => (
            <p key={i} className="text-[15px] leading-loose text-brand-800/90">
              {p}
            </p>
          ))}
        </div>

        {/* الأقسام الرئيسية */}
        <div className="mt-8 space-y-8">
          {topic.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-bold text-brand-900">{s.heading}</h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-[15px] leading-loose text-brand-800/90">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <TopicReviewGuide topic={topic} />
        <TopicApplicationGuide topic={topic} category={cat} />

        {/* جدول الحقائق */}
        {topic.facts && topic.facts.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-900">معلومات سريعة</h2>
            <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-brand-900/10">
              <table className="w-full text-sm">
                <tbody>
                  {topic.facts.map(([k, v], i) => (
                    <tr key={i} className={i % 2 ? 'bg-brand-50/40' : 'bg-white'}>
                      <th className="w-1/2 px-4 py-2.5 text-right font-semibold text-brand-900">
                        {k}
                      </th>
                      <td className="px-4 py-2.5 text-brand-700/85">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* خلاصة النقاط */}
        <section className="mt-10 rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-900">
            <ListChecks className="h-5 w-5 text-brand-600" />
            أبرز ما يقدمه هذا الدليل
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-800/90">
            {topic.sections.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{s.heading}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* الأسئلة الشائعة */}
        {topic.faq && topic.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-brand-900">
              <HelpCircle className="h-5 w-5 text-brand-600" />
              الأسئلة الشائعة
            </h2>
            <div className="mt-4 space-y-3">
              {topic.faq.map((f, i) => (
                <div key={i} className="card p-4">
                  <h3 className="font-semibold text-brand-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-700/85">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* مواضيع ذات صلة */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-lg font-bold text-brand-900">مواضيع ذات صلة</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/trending/${r.slug}`}
                  className="card group flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className="text-xl">{r.emoji}</span>
                  <span className="flex-1 text-right text-sm font-semibold leading-snug text-brand-800 group-hover:text-brand-700">
                    {r.title}
                  </span>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-brand-300 transition-transform group-hover:-translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* /trending/today — أكثر ما يبحث عنه الخليج اليوم                               */
/* -------------------------------------------------------------------------- */

export function TrendingTodayPage() {
  const [snapshot, setSnapshot] = useState<TrendingSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    loadTrendingSnapshot().then((s) => {
      if (alive) setSnapshot(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useSeo({
    title: 'أكثر ما يبحث عنه الخليج اليوم | تقويم السعودية',
    description: 'المواضيع الأكثر بحثاً في دول الخليج اليوم وفق Google Trends.',
    canonical: `${SITE_URL}/trending/today`,
    keywords: 'الأكثر بحثاً اليوم, ترند الخليج, Google Trends, مواضيع رائجة اليوم',
  });

  const countries =
    snapshot && snapshot.countries
      ? Object.entries(snapshot.countries).filter(([, c]) => c && c.titles && c.titles.length)
      : [];

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'المواضيع الرائجة', path: '/trending' },
          { name: 'أكثر ما يبحث عنه اليوم' },
        ]}
      />
      <header className="mt-4 max-w-2xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand text-white">
          <TrendingUp className="h-6 w-6" />
        </span>
        <h1 className="mt-4 section-title">أكثر ما يبحث عنه الخليج اليوم</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          قائمة بالمواضيع الأكثر رواجاً في محركات البحث داخل دول الخليج اليوم
          {snapshot?.date ? ` (${snapshot.date})` : ''} وفق Google Trends، مع روابط إلى أدلتنا
          الشاملة المرتبطة بها.
        </p>
      </header>

      {countries.length === 0 ? (
        <div className="mt-10 card flex flex-col items-center p-10 text-center">
          <Calendar className="h-10 w-10 text-brand-300" />
          <p className="mt-3 text-sm text-brand-700/75">
            لم تتوفر لقطة ترند اليوم بعد — ستظهر هنا تلقائياً عند أول تحديث يومي.
          </p>
          <Link to="/trending" className="btn-primary mt-5">
            تصفح المواضيع الرائجة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {countries.map(([code, c]) => (
            <div key={code} className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-brand-900">
                  {c.country || code}
                </h2>
                <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  {c.titles?.length || 0} موضوعاً
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {(c.titles || []).map((title, i) => {
                  const matchSlug = slugify(title);
                  const inner = (
                    <>
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600">
                        {i + 1}
                      </span>
                      <span className="group-hover:underline">{title}</span>
                    </>
                  );
                  return (
                    <li key={i}>
                      {matchSlug ? (
                        <Link
                          to={`/trending/${matchSlug}`}
                          className="group flex items-start gap-2 text-sm leading-relaxed text-brand-800/90 transition-colors hover:text-brand-600"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <span className="flex items-start gap-2 text-sm leading-relaxed text-brand-800/90">
                          {inner}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-brand-900">من القائمة إلى سؤال مفيد</h2>
        <p className="mt-3 text-[15px] leading-loose text-brand-800/90">قد يرتفع البحث لأن مباراة بدأت أو خدمة تعطلت أو اسمًا ظهر في برنامج، وقد يكون السبب إشاعة. ابحث عن سبب الارتفاع قبل قراءة النتائج، ثم حدد هل تحتاج خبرًا آنيًا أم تعريفًا أم إجراءً. افتح صفحة الجهة أو الحساب الموثق من موقعها، وقارن التوقيت بتوقيت الدولة. لا تنقل ترتيب الكلمات كاستطلاع رأي، فبيانات Trends نسبية لعينة البحث ولا تعرض عدد جميع الأشخاص.</p>
        <p className="mt-3 text-[15px] leading-loose text-brand-800/90">إذا كان الاسم غامضًا فأضف البلد والمجال والتاريخ إلى الاستعلام. راقب اختلاف الكتابة، وافصل الشخص عن الشركة والحدث عن النسخ السابقة منه. توقف عندما تحصل على مصدر أولي يثبت الواقعة ومصدر يشرح السياق وخطوة آمنة؛ كثرة الصفحات التي تكرر الوصف نفسه لا تضيف تأكيدًا. ارجع لاحقًا إذا كان الحدث يتطور، وسجل ما تغير كي لا تبني ملخص اليوم على عنوان من الليلة السابقة.</p>
      </section>

      <CategoryQualityGuide cat={{ ar: 'الترند اليومي', en: 'Daily trends', emoji: '📈' }} />

      <section className="mt-12">
        <h2 className="font-display text-lg font-bold text-brand-900">أدلة شاملة ذات صلة</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_TOPICS.slice(0, 12).map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* مساعدة                                                                      */
/* -------------------------------------------------------------------------- */

function slugify(title: string): string {
  // ربط عنوان ترند عربي بأقرب موضوع منسّق (مطابقة كلمات)، وإلا نعود للمركز.
  const words = title.split(/\s+/).filter((w) => w.length > 2);
  let best: TrendingTopic | undefined;
  let bestScore = 0;
  for (const t of TRENDING_TOPICS) {
    let score = 0;
    for (const w of words) {
      if (t.title.includes(w)) score += 1;
      if (keywordsList(t).some((k) => k.includes(w) || title.includes(k))) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best ? best.slug : '';
}

function NotFoundBlock() {
  return (
    <div className="container-page py-20 text-center">
      <TrendingUp className="mx-auto h-12 w-12 text-brand-400" />
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">الصفحة غير موجودة</h1>
      <p className="mt-2 text-sm text-brand-700/70">عذراً، لم نعثر على ما تبحث عنه في المواضيع الرائجة.</p>
      <Link to="/trending" className="btn-primary mt-6 inline-flex">
        <ArrowLeft className="h-4 w-4" />
        العودة للمواضيع الرائجة
      </Link>
    </div>
  );
}
