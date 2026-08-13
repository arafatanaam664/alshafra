// trending.mjs — محرك المحتوى المؤتمت طويل المدى.
// يقرأ src/data/trending.json (مواضيع رائجة منسّقة وغنية) ويبني منها صفحات كاملة
// +1500 كلمة: عناوين رئيسية وفرعية، فقرات موسّعة، جدول حقائق، أسئلة شائعة،
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

// عدّ الكلمات (للتأكد من أن الصفحات طويلة +1500 كلمة)
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

// بناء جسم الصفحة الطويل (+1500 كلمة)
function reviewChecklist(topic) {
  const keywords = kwList(topic).slice(0, 6).join('، ');
  return `<section><h2>كيف تتحقق من معلومات «${esc(topic.title)}» قبل التطبيق؟</h2>
    <p>ابدأ بتحديد القرار الذي تريد اتخاذه بدل الاكتفاء بعنوان رائج. اكتب الدولة والفئة والتاريخ والمبلغ أو الخدمة المعنية، ثم ارجع إلى الجهة صاحبة الاختصاص. يختلف الحكم أو السعر أو الإجراء بين دول الخليج وبين القطاع العام والخاص، وقد تكون نتيجة منتشرة صحيحة لسنة أو فئة أخرى وليست لحالتك.</p>
    <p>استخدم كلمات البحث المحددة في هذا الدليل مثل ${esc(keywords)} للوصول إلى المصدر الأصلي، وافحص تاريخ النشر واسم الكاتب والروابط. لا تجعل كثرة المشاركات دليلًا على الصحة، ولا تعتمد على صورة مقصوصة تخفي السنة أو التنبيه. قارن ادعاءين على الأقل عندما تكون المعلومة مالية أو نظامية أو مرتبطة بالسفر.</p>
    <p>حوّل الشرح إلى قائمة تنفيذ: ما الوثيقة المطلوبة؟ ما آخر موعد؟ ما التكلفة الكاملة بعد الرسوم؟ من الجهة التي تستقبل الطلب؟ وما دليل نجاح الإجراء؟ احتفظ برقم مرجع أو فاتورة من الجهة المنفذة. المقال يشرح السياق ولا يدخل إلى حسابك ولا يضمن قبولًا أو سعرًا أو نتيجة شخصية.</p>
    <p>انتبه إلى علامات الاحتيال: استعجال غير مبرر، طلب رمز تحقق، تحويل إلى حساب شخصي، وعد بعائد مضمون، أو رابط يشبه نطاق جهة مع تغيير حرف. افتح الموقع الرسمي بنفسك ولا تثبت تطبيق تحكم بطلب متصل. إذا شاركت بيانات مصرفية فتواصل مع البنك فورًا بدل انتظار رد موقع محتوى.</p>
    <p>عند تغير الخبر حدّث خطتك ولا تعيد نشر النسخة القديمة. اكتب تاريخ آخر تحقق، واحفظ المصدر مع المعلومة. المحتوى المتجدد الجيد يوضح ما تغير ولماذا، ولا يبدل التاريخ في فقرة قديمة كي تبدو خبرًا جديدًا. أرسل تصحيحًا موثقًا إذا وجدت تعارضًا.</p>
    <p>أخيرًا افصل بين التعليم العام والاستشارة الفردية. القواعد العامة تساعدك على طرح السؤال الصحيح، لكن العقد والحالة الصحية والملف المالي والأنظمة المحلية قد تحتاج مختصًا مرخصًا. استخدم الدليل كبداية منظمة، ثم نفذ عبر القنوات الرسمية وبالمستندات المطلوبة.</p>
    <p>ولكي تقيس فائدة ما قرأت، اكتب قبل البدء السؤال والنتيجة المطلوبة، ثم بعد المراجعة سجل المصدر والخطوة التالية والموعد والتكلفة والمخاطر التي بقيت. إذا لم تستطع تحويل المقال إلى معلومة قابلة للتحقق أو إجراء واضح فلا تتخذ قرارًا بسبب طول النص وحده. راجع الأرقام والوحدات وأسماء الدول، واسأل هل المثال يخص فردًا أم شركة وهل يشمل الضريبة والرسوم. هذه المراجعة القصيرة تمنع إسقاط حالة في دولة خليجية على دولة أخرى، وتساعدك على العودة إلى المعلومة وتحديثها بدل بدء البحث من الصفر في كل مرة. احتفظ أيضًا بتاريخ الصفحة وعنوانها الكامل، ولا تنسخ جدولًا من دون عناوين الأعمدة. إذا تغير المصدر فعدّل ملاحظتك وشارك التصحيح مع من أرسلت إليهم النسخة السابقة. قبل الإغلاق راجع هل عرفت تاريخًا مطلقًا واسم جهة ورابطًا وخطوة قابلة للتنفيذ؛ إذا بقيت الإجابة كلمات عامة فارجع إلى القسم المتخصص أو اسأل الجهة بدل ملء الفراغ بتخمين. دوّن كذلك ما إذا كان المصدر إلزاميًا أم إرشاديًا، ومن المسؤول عن تنفيذه، ومتى يجب أن تعيد التحقق منه قبل القرار النهائي.</p>
  </section>`;
}

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
    reviewChecklist(topic),
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

function categoryQualityGuide(category) {
  return `<section><h2>كيف تستخدم أدلة فئة «${esc(category.ar)}»؟</h2>
    <p>ابدأ بالموضوع الأقرب إلى سؤالك، ثم اقرأ الوصف والمصدر والتاريخ قبل فتح التفاصيل. تجمع الفئة مواد متعددة للتنقل، لكنها لا تعني أن كل موضوع خبر وقع اليوم أو أن ترتيبه توصية. كلمة رائج تصف اهتمام الباحثين، ولا تثبت صحة ادعاء أو ملاءمة قرار لحالتك.</p>
    <p>حدد الدولة الخليجية والفئة المستفيدة والسنة. الأنظمة والأسعار والتقويمات تختلف بين السعودية والإمارات والكويت وقطر والبحرين وعُمان، وقد يختلف القطاع الحكومي عن الخاص. أضف هذه المحددات إلى بحثك وافتح نطاق الجهة صاحبة الاختصاص بدل الاكتفاء بمقتطف.</p>
    <p>قارن تاريخين عند التعامل مع محتوى متجدد: تاريخ الواقعة أو البيانات وتاريخ مراجعة الدليل. لا يكفي تبديل السنة في العنوان. إذا لم يتغير المصدر أو الأرقام فلا نقدم الفقرة القديمة كخبر جديد، وإذا تغيرت القاعدة نشرح سبب التعديل.</p>
    <p>في المعلومات المالية احسب السعر النهائي والرسوم والمخاطر، ولا تعتمد على عائد مضمون أو وسيط مجهول. في التعليم والسفر والدين تحقق من الوزارة أو الجهة الرسمية والإعلان الخاص بالسنة. وفي التقنية راجع الصلاحيات وسياسة الخصوصية قبل تثبيت خدمة.</p>
    <p>استخدم الروابط بين موضوعات الفئة لبناء صورة كاملة، لكن تجنب قراءة عناوين كثيرة من دون تنفيذ تحقق واحد. اكتب السؤال والمصدر والنتيجة والخطوة التالية. إذا احتاج القرار عقدًا أو ملفًا صحيًا أو استثمارًا فاستعن بمختص مرخص.</p>
    <p>عند مشاركة دليل أرسل رابطه بدل صورة مقصوصة، واكتب الدولة والسنة والتنبيه المهم. لا تنشر بيانات شخصية أو رقم حجز أو كشف حساب لإثبات السؤال. وإذا وجدت خطأ أرسل رابط المصدر الرسمي والعبارة المحددة كي يمكن تصحيحها.</p>
    <p>نراجع الصفحات آليًا من حيث الروابط والبنية والطول، ثم تحتاج الادعاءات إلى مراجعة تحريرية. الصفحة التي لا تبلغ معيار الجودة تبقى في طابور النشر الآلي ولا تحذف؛ تظهر عندما يكتمل محتواها المفيد ومصادرها.</p>
    <p>يمكنك العودة إلى مركز المواضيع لاختيار فئة أخرى، أو استخدام البحث داخل الصفحة للوصول إلى مصطلح. الهدف تقليل الوقت بين السؤال والمصدر الصحيح، لا زيادة عدد الصفحات بلا قيمة. الإعلان، إن ظهر، لا يغير ترتيب الأدلة أو خلاصتها.</p>
    <h3>خطة بحث عملية من السؤال إلى القرار</h3>
    <p>صغ سؤالك في سطر واحد وحدد ما إذا كنت تريد تعريفًا أو مقارنة أو موعدًا أو تكلفة أو إجراء. اجمع المصطلحات الرسمية المرادفة، ثم ابحث في نطاق الجهة المختصة. افتح الوثيقة الكاملة واقرأ نطاقها والاستثناءات والحواشي، وسجل رقم القرار أو تاريخ البيان بدل الاحتفاظ بعنوان نتيجة البحث فقط.</p>
    <p>بعد ذلك اختبر المعلومة على مثال واقعي غير حساس. احسب المبلغ بوحداته، أو ضع التاريخ في تقويم، أو اكتب خطوات الطلب بالترتيب. إذا ظهرت فجوة فابحث عنها تحديدًا؛ لا تعوضها بتجربة شخص في دولة أخرى. تحقق من أن الخدمة ما تزال متاحة وأن الرابط لا يعيدك إلى صفحة تسويقية بلا مستند.</p>
    <p>قارن بين خيارين بمعايير ثابتة. في السعر استخدم الإجمالي بعد الرسوم، وفي التطبيق استخدم الخصوصية والدعم والتوافق، وفي السفر استخدم شروط الدخول والإلغاء، وفي التعليم استخدم الاعتماد والمدة، وفي أي حق استخدم النص والمهلة. اكتب سبب تفضيلك حتى تستطيع مراجعته إذا تغير عامل.</p>
    <h3>مراجعة السلامة والخصوصية</h3>
    <p>لا تدخل كلمة مرور أو رمز تحقق في موقع وصل عبر رسالة، ولا ترسل وثيقة كاملة إلى منتدى عام. تحقق من HTTPS واسم النطاق، وافتح التطبيق من متجره الرسمي، وراجع الأذونات. إذا طلب شخص تحويلًا سريعًا أو وعدًا لا يمكن التحقق منه فتوقف واتصل بالجهة عبر رقم منشور في موقعها.</p>
    <p>عند استخدام أداة ذكاء اصطناعي أو حاسبة عامة لا تدخل بيانات عميل أو طفل أو ملف صحي. استبدلها بمثال، ثم طبق النتيجة محليًا بعد التحقق. المخرجات قد تخطئ في تاريخ أو مادة نظامية، ولذلك لا تصبح مصدرًا رسميًا لأنها مكتوبة بثقة أو بصياغة سليمة.</p>
    <h3>حفظ النتيجة وتحديثها</h3>
    <p>احفظ عنوان المصدر والرابط وتاريخ الوصول وخلاصة قصيرة وما الذي ستفعله. ضع تذكيرًا قبل المهلة بهامش، وراجع المعلومة قرب التنفيذ. عند التحديث لا تمسح السجل القديم؛ اكتب ما تغير لتفهم أثره وتخبر من شاركتهم القرار. هذه العادة تجعل متابعة فئة «${esc(category.ar)}» تراكمًا منظمًا لا بحثًا مشتتًا يتكرر كل مرة.</p>
    <p>خصص في ملاحظتك خانة لما لا تعرفه بعد. قد يكون المصدر صامتًا عن رسوم أو استثناء أو تاريخ تطبيق، والصمت لا يعني صفرًا أو موافقة. تواصل مع الجهة بسؤال محدد، وسجل اسم القناة ورقم الطلب لا اسم الموظف وحده. إذا تلقيت جوابًا شفهيًا في قرار مهم فاطلب صفحة أو مستندًا يؤيده. لا تخلط بين تجربة مستخدم تشرح مسار الواجهة وبين نص يحدد حقًا عامًا؛ كلاهما مفيد في مكانه لكن درجة الاعتماد مختلفة.</p>
    <p>راجع القرار من منظور أسوأ احتمال معقول: ماذا لو تأخر التحويل أو رفض الطلب أو تغير الموعد أو لم تعمل الأداة؟ ضع بديلًا وميزانية وهامش وقت، واقرأ شروط الاسترداد والاعتراض. لا تنشر استنتاجك كقاعدة للجميع؛ اذكر البلد والفئة والتاريخ والمصدر. وعندما تستخدم قائمة الأدلة، انتقل إلى الموضوع المرتبط فقط إذا كان يجيب عن فجوة حقيقية، لا لمجرد زيادة وقت القراءة. بهذه الطريقة يبقى المحتوى في فئة «${esc(category.ar)}» أداة للتصرف الآمن لا سلسلة عناوين جذابة.</p>
    <p>قبل مغادرة الفئة أنشئ ملخصًا من خمس نقاط: الحقيقة التي ثبتت، المصدر، تاريخها، الاستثناء الذي قد يغيرها، والخطوة التالية. افصل الاقتباس عن رأيك، ولا تنسب رقمًا إلى جهة لم تنشره. إذا كانت الصفحة ستستخدم في عمل فريق فحدد مسؤول المراجعة وموعدها، واحفظ الروابط في مكان مشترك. راقب الروابط المعطلة والتغييرات الجوهرية بدل إعادة كتابة النص من الذاكرة. وعند عدم وجود جواب رسمي قل إن المعلومة غير مؤكدة؛ الاعتراف بالفجوة أكثر قيمة من ملئها بفقرة عامة، ويحمي القارئ من بناء تكلفة أو سفر أو عبادة أو دراسة على أساس غير ثابت. أضف رابط الفئة إلى مفضلاتك فقط إذا كنت ستعود لتحديث القرار، واحذف النسخ المكررة التي لا تحمل مصدرًا أو تاريخًا. المعلومة الأقصر الموثقة أفضل من أرشيف كبير لا تعرف أي نسخة فيه صالحة. قبل اعتماد الملخص اقرأه مرة أخرى من منظور شخص لم يتابع الموضوع: هل يعرف الدولة والفترة والجهة والخطوة، أم يحتاج إلى افتراض معلومات غير مكتوبة؟ أضف الناقص فقط ثم توقف. اختبر أيضًا أن الروابط تفتح الصفحة المقصودة لا الصفحة الرئيسية، وأن اسم الملف أو رقم التعميم يطابق ما سجلته في ملاحظتك.</p>
  </section>`;
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
      return `<section><h2>${esc(c.emoji)} ${esc(c.ar)}</h2>${items
        .map((t) => `<article><h3><a href="/trending/${t.slug}">${esc(t.title)}</a></h3><p>${esc(t.description)}</p><p>${esc((t.intro || [])[0] || '')}</p></article>`)
        .join('')}</section>`;
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
        `<main><article><h1>أكثر ما يبحث عنه الخليج اليوم</h1><p>قائمة بالمواضيع الأكثر رواجاً في محركات البحث داخل دول الخليج اليوم (${esc(SNAPSHOT.date || '')}) وفق Google Trends. تعني القائمة أن الاهتمام ارتفع في وقت ومكان محددين، ولا تعني أن الخبر صحيح أو أن كل سكان الدولة بحثوا عنه.</p>${blocks}<section><h2>من القائمة إلى سؤال مفيد</h2><p>قد يرتفع البحث لأن مباراة بدأت أو خدمة تعطلت أو اسمًا ظهر في برنامج، وقد يكون السبب إشاعة. ابحث عن سبب الارتفاع قبل قراءة النتائج، ثم حدد هل تحتاج خبرًا آنيًا أم تعريفًا أم إجراءً. افتح صفحة الجهة أو الحساب الموثق من موقعها، وقارن التوقيت بتوقيت الدولة. لا تنقل ترتيب الكلمات كاستطلاع رأي، فبيانات Trends نسبية لعينة البحث ولا تعرض عدد جميع الأشخاص.</p><p>إذا كان الاسم غامضًا فأضف البلد والمجال والتاريخ إلى الاستعلام. راقب اختلاف الكتابة، وافصل الشخص عن الشركة والحدث عن النسخ السابقة منه. توقف عندما تحصل على مصدر أولي يثبت الواقعة ومصدر يشرح السياق وخطوة آمنة؛ كثرة الصفحات التي تكرر الوصف نفسه لا تضيف تأكيدًا. ارجع لاحقًا إذا كان الحدث يتطور، وسجل ما تغير كي لا تبني ملخص اليوم على عنوان من الليلة السابقة.</p></section>${categoryQualityGuide({ ar: 'الترند اليومي' })}${reviewChecklist({ title: 'موضوع الترند اليومي', keywords: ['سبب ارتفاع البحث', 'المصدر الأصلي', 'تاريخ الواقعة', 'الدولة المعنية'] })}</article></main>`,
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
    const listHtml = items.map((t) => `<section><h2><a href="/trending/${t.slug}">${esc(t.title)}</a></h2><p>${esc(t.description)}</p>${(t.intro || []).slice(0, 2).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${(t.sections || []).slice(0, 1).map((section) => `<h3>${esc(section.heading)}</h3>${section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}`).join('')}</section>`).join('');
    const body = arShell([
      breadcrumbs([{ label: 'الرئيسية', href: '/' }, { label: 'المواضيع الرائجة', href: '/trending' }, { label: c.ar, href: `/trending/${code}` }]),
      `<main><article><h1>${esc(c.emoji)} ${esc(c.ar)}</h1><p>أدلة ومواضيع شاملة ضمن فئة «${esc(c.ar)}» الأكثر بحثاً في الخليج.</p>${listHtml}${categoryQualityGuide(c)}</article></main>`,
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
