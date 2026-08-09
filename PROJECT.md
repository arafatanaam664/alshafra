# وثيقة المشروع الكاملة — تقويم السعودية (alshafra.com)

> هذه الوثيقة مرجع شامل لأي مطور أو أداة ذكاء اصطناعي تقوم بتعديل المشروع.
> اقرأها بالكامل قبل أي تعديل لتفهم الفكرة والبنية والقرارات المعمارية.

---

## 1. فكرة المشروع

**بوابة سعودية شاملة للمواعيد الرسمية** تجمع في مكان واحد كل ما يحتاجه المستخدم السعودي معرفته عن المواعيد:

- مواعيد صرف الرواتب (الموظفين الحكوميين، المتقاعدين، حساب المواطن، الضمان الاجتماعي)
- التقويم الهجري والميلادي مع التحويل بينهما
- التقويم الدراسي الرسمي (وزارة التعليم)
- الإجازات الرسمية والمناسبات الدينية والوطنية
- حاسبة العمر بالهجري والميلادي
- مقالات ودلائل SEO طويلة تستهدف الكلمات الطويلة (long-tail keywords)

**الجمهور المستهدف:** المستخدم السعودي العادي الذي يريد معرفة متى ينزل راتبه أو دعم حساب المواطن أو متى تبدأ الإجازة.

**اللغة والاتجاه:** عربية سعودية (ar-SA) باتجاه RTL.

**الدومين المستهدف عند النشر:** `alshafra.com`

---

## 2. التقنيات المستخدمة

| التقنية | الإصدار | الغرض |
|---------|---------|------|
| React | 18 | إطار الواجهة |
| TypeScript | 5.x | الأمان النوعي |
| Vite | 5.x | أداة البناء والـ dev server |
| Tailwind CSS | 3.x | التنسيق |
| lucide-react | latest | الأيقونات |
| Supabase | متاح | قاعدة بيانات (غير مستخدمة حالياً — جاهزة عند الحاجة) |

**لا توجد مكتبات إضافية** — لا تستخدم Redux أو React Router أو axios أو أي مكتبة خارجية دون التحقق من `package.json` أولاً.

---

## 3. البنية العامة للمشروع

```
project/
├── index.html              # نقطة الدخول + JSON-LD للموقع والمنظمة
├── package.json            # الاعتمادات والأوامر
├── tailwind.config.js      # نظام الألوان والخطوط
├── vite.config.ts          # إعدادات Vite
├── tsconfig.app.json       # إعدادات TypeScript
├── public/
│   ├── favicon.svg         # أيقونة الموقع
│   ├── robots.txt          # تعليمات لمحركات البحث
│   ├── sitemap.xml         # خريطة الموقع
│   └── manifest.webmanifest # PWA manifest
└── src/
    ├── main.tsx            # تهيئة React
    ├── App.tsx             # الموجّه الرئيسي (router)
    ├── index.css           # أنماط Tailwind العامة
    ├── components/
    │   ├── Header.tsx      # الشريط العلوي + القائمة
    │   ├── Footer.tsx      # التذييل + الروابط
    │   ├── Countdown.tsx   # عداد تنازلي للأحداث
    │   └── Breadcrumbs.tsx # مسار التنقل + JSON-LD
    ├── data/
    │   └── countdowns.json # مصدر العدّادات التنازلية (يقرأه التطبيق وسكربت التوليد معاً)
    ├── lib/
    │   ├── router.ts       # موجّه مخصص خفيف (hash-based)
    │   ├── seo.ts          # إدارة <title> وmeta وJSON-LD
    │   ├── hijri.ts        # حسابات التقويم الهجري
    │   ├── events.ts       # الأحداث والرواتب والمناسبات
    │   ├── countdowns.ts   # محرّك العدّادات التنازلية (كم باقي على…)
    │   ├── articles.ts     # بيانات المقالات الـ SEO
    │   └── useNow.ts        # hook للوقت الحالي
    └── pages/
        ├── HomePage.tsx           # الصفحة الرئيسية
        ├── CountdownPage.tsx      # مركز العدّادات + صفحة كل عدّاد
        ├── TodayPage.tsx          # التاريخ الهجري والميلادي اليوم
        ├── SalariesPage.tsx       # مواعيد الرواتب
        ├── HijriCalendarPage.tsx  # التقويم الهجري
        ├── SchoolCalendarPage.tsx  # التقويم الدراسي
        ├── HolidaysPage.tsx       # الإجازات الرسمية
        ├── DateConverterPage.tsx  # تحويل التاريخ
        ├── AgeCalculatorPage.tsx  # حاسبة العمر
        ├── FaqPage.tsx            # الأسئلة الشائعة
        └── ArticlePage.tsx        # صفحة مقال + قائمة المقالات
```

---

## 4. القرارات المعمارية المهمة

### 4.1 الموجّه (Router)
- **موجّه مخصص خفيف** يعتمد على `window.location.pathname` + `history.pushState` — لا يستخدم `react-router`.
- التنقّل يبثّ حدث `alshafra:routechange` على `window` حتى تتزامن كل نسخ `useRoute()` (بدونه كان الهيدر يغيّر الرابط دون تغيير الصفحة).
- **كل رابط داخلي يجب أن يستخدم مكوّن `src/components/Link.tsx`** الذي يُخرج `<a href>` حقيقياً — لا تستخدم `<button onClick={navigate}>` لأن جوجل لا يتبع الأزرار.
- السبب: بساطة المشروع وعدم الحاجة لـ SSR أو موجّه كامل.
- الدوال الرئيسية: `useRoute()` و `parseRoute(path)`.
- المسارات المتاحة: `/`, `/countdown`, `/countdown/:slug`, `/today`, `/salaries`, `/hijri-calendar`, `/school-calendar`, `/holidays`, `/date-converter`, `/age-calculator`, `/name-decoration`, `/name-decoration/:slug`, `/faq`, `/articles`, `/articles/:slug`, `/about`, `/contact`, `/privacy`, `/terms`.
- **عند إضافة صفحة جديدة:** أضف المسار في `parseRoute` داخل `src/lib/router.ts`، ثم عالجه في `App.tsx`.

### 4.2 إدارة SEO
- `src/lib/seo.ts` يحتوي على hook اسمه `useSeo({ title, description, canonical, keywords, jsonLd })`.
- يحدّث `document.title` ووسوم meta وروابط canonical وبيانات JSON-LD ديناميكياً.
- الثوابت: `SITE_URL = 'https://alshafra.com'` و `SITE_NAME = 'تقويم السعودية'`.
- **عند إضافة صفحة:** استدعِ `useSeo` في بداية الصفحة بكل الحقول المناسبة.
- **عند تغيير الدومين:** حدّث `SITE_URL` في `seo.ts` وكل الروابط في `index.html` و `sitemap.xml` و `robots.txt` و `manifest.webmanifest`.

### 4.3 البيانات المنظمة (JSON-LD)
- `WebSite` و `Organization` في `index.html` (ثابتة).
- `BreadcrumbList` يُحقن ديناميكياً من مكوّن `Breadcrumbs` في كل صفحة داخلية.
- `FAQPage` في `FaqPage.tsx` وكل مقال يحتوي FAQ.
- `Article` في `ArticlePage.tsx`.
- `ItemList` في قائمة المقالات.
- **لا تكرّر JSON-LD** — استخدم id `page-jsonld` للبيانات الديناميكية (موجود في `seo.ts`).

### 4.4 حسابات التقويم الهجري
- `src/lib/hijri.ts` يحتوي على دوال: `todayHijri`, `todayGregorian`, `formatHijri`, `formatGregorian`, `weekdayName`, `formatHijriShort`, `formatGregorianShort`.
- يعتمد على `Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn')` (جدول أم القرى الرسمي في ICU) مع خوارزمية جدولية كخطة بديلة فقط.
- `todayGregorian()` يحسب اليوم بتوقيت **الرياض** لا بتوقيت جهاز الزائر.
- **لا تكتب تواريخ هجرية يدوياً في البيانات** — استخدم `eventHijriText()` / `gregorianToHijri()` لاشتقاقها.
- **لا تستخدم Date API العادية مباشرة** — استخدم دوال `hijri.ts` لضمان التوافق مع التقويم السعودي.

### 4.5 الأحداث والرواتب
- `src/lib/events.ts` يحتوي على:
  - `SAUDI_EVENTS`: قائمة المناسبات الدينية والوطنية.
  - `buildSalaryInstances`: يولّد مواعيد الرواتب لكل شهر.
  - `upcomingEvents`: يرجع الأحداث القادمة مرتبة زمنياً.
  - `daysUntilEvent`: يحسب الأيام المتبقية لحدث.
  - `CATEGORY_LABELS` و `CATEGORY_STYLES`: لتصنيف الأحداث بصرياً.
- **المناسبات الدينية تُشتق من تاريخها الهجري** عبر `hijriEvent(سنة, شهر, يوم)` الذي يحوّل بتقويم أم القرى — لا تكتب مقابلاً ميلادياً يدوياً (كانت هذه مصدر أخطاء تصل إلى شهرين، مثل عيد الأضحى 1448 الذي كان مكتوباً 19 يوليو 2027 والصحيح 16 مايو 2027).
- **عند إضافة مناسبة جديدة:** أضفها إلى `SAUDI_EVENTS` مع الحقول المطلوبة (لا تكرر المناسبات الدينية الموجودة).

### 4.5.1 العدّادات التنازلية (كم باقي على…)
- **مصدر البيانات الوحيد:** `src/data/countdowns.json` — يقرأه تطبيق React (`src/lib/countdowns.ts`) وسكربت التوليد الثابت (`scripts/countdowns.mjs` + `scripts/prerender.mjs`) معاً، فلا تختلف الصفحة الثابتة عن الصفحة التفاعلية أبداً.
- **أنواع الجدولة (`schedule.type`):**
  - `hijri-annual` — يوم هجري ثابت (رمضان، العيدان، ليلة القدر، رأس السنة الهجرية) يُحوَّل بتقويم أم القرى.
  - `gregorian-annual` — يوم ميلادي ثابت (اليوم الوطني، يوم التأسيس، رأس السنة، سهيل، المربعانية)، ويدعم `editionBase` لترقيم اليوم الوطني تلقائياً.
  - `monthly` — يوم صرف شهري (الرواتب والدعم) مع قاعدة نهاية الأسبوع: الجمعة تُقدَّم للخميس والسبت يُؤجَّل للأحد.
  - `fixed` — قائمة تواريخ معتمدة (المواعيد الدراسية).
- **عند إضافة عدّاد:** أضف عنصراً واحداً في `countdowns.json` فقط — تُولَّد صفحته الثابتة ورابط الخريطة تلقائياً في البناء التالي.

### 4.6 المقالات
- `src/lib/articles.ts` يحتوي على مصفوفة `ARTICLES` — كل مقال له: `slug`, `title`, `description`, `category`, `updatedAt`, `readMinutes`, `keywords`, `sections[]`, `faq[]`.
- `ArticlePage.tsx` يعرض مقالاً واحداً + مقالات ذات صلة.
- `ArticlesListPage` (مصدّرة من نفس الملف) تعرض قائمة كل المقالات.
- **عند إضافة مقال:** أضفه إلى مصفوفة `ARTICLES` **وإلى جدول المسارات في `scripts/prerender.mjs`** (منه تُولَّد صفحة HTML ثابتة وخريطة الموقع تلقائياً). لم يعد هناك `public/sitemap.xml` يدوي.
- **التصنيفات المتاحة:** `salaries`, `calendar`, `holidays`, `tools` (مع تسمياتها في `CATEGORY_LABELS_ARTICLE`).

### 4.7 التنسيق (Tailwind)
- نظام ألوان `brand` أخضر سعودي (انظر `tailwind.config.js`).
- خطوط: `font-display` للعناوين، خط عادي للنص.
- فئات مخصصة: `container-page`, `card`, `btn-primary`, `btn-ghost`, `chip`, `section-title`.
- **اتجاه RTL** مفعّل في `index.css` عبر `dir="rtl"` على `<html>`.
- **لا تستخدم ألوان بنفسجية/indigo** — التوجيهات تمنعها. التزم بنظام `brand` الأخضر.

---

## 5. دليل التعديل الآمن

### 5.1 قبل أي تعديل
1. اقرأ هذه الوثيقة بالكامل.
2. اقرأ الملف الذي ستعدّله قبل تعديله.
3. تحقق من `package.json` قبل إضافة أي اعتماد جديد.
4. لا تضف مكتبات خارجية دون حاجة فعلية.

### 5.2 عند إضافة صفحة جديدة
1. أنشئ ملف `src/pages/NewPage.tsx`.
2. استدعِ `useSeo` في بدايته بكل الحقول.
3. أضف المسار في `parseRoute` داخل `src/lib/router.ts`.
4. أضف المعالجة في `App.tsx`.
5. أضف الرابط في `Header.tsx` و `Footer.tsx`.
6. أضف الرابط إلى `public/sitemap.xml`.
7. استخدم `Breadcrumbs` في بداية الصفحة.

### 5.3 عند تعديل الدومين
حدث في كل هذه المواضع دفعة واحدة:
- `src/lib/seo.ts` → `SITE_URL`
- `index.html` → JSON-LD (WebSite + Organization)
- `public/robots.txt` → رابط Sitemap
- `public/sitemap.xml` → كل الروابط
- `public/manifest.webmanifest` → start_url

### 5.4 عند تعديل بيانات منظمة
- لا تكرّر نفس النوع من JSON-LD في نفس الصفحة.
- استخدم `useSeo({ jsonLd: ... })` للبيانات الديناميكية.
- تحقق من صحة الـ schema عبر [Schema.org Validator](https://validator.schema.org/) قبل النشر.

### 5.5 عند تعديل التقويم
- استخدم دوال `hijri.ts` دائماً، لا `new Date()` مباشرة.
- تذكّر أن التقويم الهجري قد يختلف بيوم عن التقاويم الفلكية بسبب رؤية الهلال.
- لا تعدّل دوال `hijri.ts` دون فهم عميق لـ `Intl.DateTimeFormat`.

### 5.6 عند إضافة مقال
1. أضف كائناً جديداً إلى مصفوفة `ARTICLES` في `src/lib/articles.ts`.
2. أضف الرابط إلى `public/sitemap.xml`.
3. تأكد أن `slug` فريد ووصفي (مثل `salary-dates-saudi-arabia`).
4. اكتب 4-6 أقسام على الأقل، و3 أسئلة FAQ على الأقل لاستهداف rich results.

---

## 6. الأوامر المتاحة

```bash
npm run dev         # تشغيل dev server (يُمنع تشغيله في هذه البيئة)
npm run build       # بناء الإنتاج إلى dist/
npm run typecheck   # فحص الأنواع فقط
npm run lint        # فحص ESLint
```

**التحقق قبل الإغلاق:** شغّل `npm run typecheck` و `npm run build` — كلاهما يجب أن ينجح بدون أخطاء.

---

## 7. حالة المشروع الحالية

### ما تم بناؤه
- ✅ 47 صفحة ثابتة مُولَّدة (`npm run build`) مع خريطة موقع تُبنى من نفس جدول المسارات
- ✅ نظام عدّادات تنازلية «كم باقي على…» (19 عدّاداً) + صفحة مركز `/countdown` وصفحة لكل عدّاد
- ✅ صفحة `/today` للتاريخ الهجري والميلادي الآن بتوقيت الرياض
- ✅ 7 صفحات وظيفية (الرئيسية + 6 أدوات)
- ✅ صفحة أسئلة شائعة (FAQ) مع JSON-LD
- ✅ 6 مقالات SEO طويلة لاستهداف long-tail keywords
- ✅ صفحة قائمة المقالات
- ✅ robots.txt + sitemap.xml + manifest.webmanifest
- ✅ JSON-LD كامل (WebSite, Organization, BreadcrumbList, FAQPage, Article, ItemList)
- ✅ تنقل داخلي محكم (Header, Footer, Breadcrumbs, مقالات ذات صلة)
- ✅ تصميم RTL متجاوب بنظام ألوان أخضر سعودي

### ما لم يُبنَ (مقترح للمراحل القادمة)
- ❌ قاعدة بيانات Supabase (متاحة لكن غير مستخدمة — تُفعّل عند الحاجة لميزات مثل حفظ تفضيلات المستخدم أو إشعارات البريد)
- ❌ صفحة "اتصل بنا" حقيقية (يوجد بريد info@alshafra.com فقط)
- ❌ صفحة سياسة الخصوصية وشروط الاستخدام (مطلوبة قانونياً عند النشر)
- ❌ مدونة بنظام CMS (المقالات حالياً ثابتة في كود)
- ❌ نظام إشعارات بريدية لمواعيد الرواتب
- ❌ PWA offline كامل (manifest موجود لكن service worker غير مفعّل)

---

## 8. توقعات SEO الواقعية

**لا يوجد موقع جديد «يكتسح» محركات البحث في شهر أول.** هذا وعد غير واقعي.

ما يوفّره المشروع حالياً:
- أساس SEO تقني كامل (robots, sitemap, JSON-LD, canonical, meta).
- محتوى طويل لاستهداف كلمات long-tail منخفضة المنافسة.
- بنية روابط داخلية محكمة.

ما يحتاجه إضافياً للنجاح الفعلي:
- نشر الموقع في Google Search Console وتقديم sitemap.
- باكلينكات من مواقع سعودية موثوقة (3-6 أشهر من العمل).
- محتوى مستمر ومتجدد (مقالات جديدة كل أسبوع).
- تحديث المقالات الحالية عند تغير المواعيد الرسمية.
- صفحات سياسة الخصوصية وشروط الاستخدام قبل النشر.

---

## 9. ملاحظات مهمة لأي أداة ذكاء اصطناعي

1. **لا تضف تعليقات** في الكود إلا لشرح «لماذا» غير الواضح.
2. **لا تضف معالجة أخطاء** لسيناريوهات مستحيلة — ثق بضمانات TypeScript و React.
3. **لا تضف مكتبات** دون التحقق من `package.json`.
4. **لا تستخدم ألوان بنفسجية/indigo** — التزم بنظام `brand` الأخضر.
5. **اتجه RTL** دائماً — لا تكتب CSS يعتمد LTR.
6. **استخدم دوال `hijri.ts`** لكل ما يتعلق بالتاريخ — لا `new Date()` مباشرة.
7. **حدّث `sitemap.xml`** عند إضافة أي صفحة جديدة.
8. **شغّل `npm run typecheck` و `npm run build`** بعد كل تعديل مهم.
9. **لا تضف auth** إلا إذا طلب المستخدم صراحة.
10. **لا تضف Supabase** إلا إذا كانت الميزة تحتاج حفظ بيانات — الحالة الافتراضية هي state في الذاكرة.

---

## 10. ملفات المرجع السريع

| للقيام بـ | افتح الملف |
|----------|----------|
| فهم الموجّه | `src/lib/router.ts` |
| تعديل SEO | `src/lib/seo.ts` |
| حسابات التاريخ | `src/lib/hijri.ts` |
| إضافة مناسبة | `src/lib/events.ts` |
| إضافة مقال | `src/lib/articles.ts` |
| إضافة صفحة | `src/pages/` + `App.tsx` + `router.ts` |
| تعديل التصميم | `tailwind.config.js` + `src/index.css` |
| تحديث الدومين | `seo.ts` + `index.html` + `sitemap.xml` + `robots.txt` + `manifest.webmanifest` |

---

**آخر تحديث لهذه الوثيقة:** 2026-07-19
**نسخة المشروع:** 1.0
**المؤلف:** فريق تطوير تقويم السعودية

---

## 11. البنية العالمية متعددة اللغات (أُضيفت 2026-08-09)

### الفكرة
تحويل الموقع من بوابة سعودية إلى **منصة أدوات عالمية** بـ 16 لغة (ar, en, tr, fa, fr, es, pt, id, ms, ur, de, ru, it, hi, bn, sw) مع **نشر تلقائي** و**أسعار حية** و**فهرسة تلقائية**. أي لغة جديدة = ملف `src/i18n/{code}.json` + سطر في `src/data/languages.json`.

### المكونات

| الملف | الدور |
|---|---|
| `src/data/languages.json` | سجل اللغات (رمز، اسم، اتجاه، خط، إسلامية) |
| `src/i18n/*.json` | ترجمات 16 لغة (fallback: اللغة ← en ← ar) |
| `src/data/countries.json` | ~190 دولة (اسم، علم، عملة، عاصمة، سكان، لغات) |
| `src/data/names.json` | أسماء عربية/إنجليزية/فارسية/تركية مع معانيها |
| `src/data/trivia.json` | محتوى المقالات (معلومات، ألغاز، نكت، عبارات، أذكار، أسماء حيوانات) |
| `src/data/prices.json` | أسعار الذهب والعملات — **يُحدَّث تلقائياً يومياً** عبر `scripts/fetch-prices.mjs` |
| `src/data/toolslugs.json` | مسارات الأدوات الموضعية حسب اللغة (مشترك بين المولّد والتطبيق) |
| `src/data/schedule.json` | جدولة النشر: `ratePerDay` (افتراضياً 5 صفحات/يوم) و`startDate` |
| `scripts/catalog.mjs` | **مولّد الكتالوج**: يبني ~3200 صفحة (أدوات × 16 لغة، دول، حروف، أسماء، قوائم، مقالات) مع تاريخ نشر لكل صفحة |
| `scripts/fetch-prices.mjs` | يجلب XAU + أسعار صرف من مصادر مفتوحة مجانية |
| `scripts/indexnow.mjs` | يرسل الصفحات الجديدة إلى Bing IndexNow (فهرسة فورية) |
| `.github/workflows/daily-publish.yml` | يعمل 3 مرات/يوم: أسعار → بناء → commit → Vercel يعيد النشر → IndexNow |
| `src/pages/GlobalPage.tsx` | يعرض كل أنواع الصفحات العالمية في تطبيق React |
| `src/lib/i18n.tsx` | مزوّد اللغة + `t()` مع fallback + مبدّل اللغة |
| `src/lib/fancy.ts` | أنماط زخرفة يونيكود (لاتيني + عربي) |
| `src/lib/globalData.ts` | بيانات الدول/الأسماء/الأسعار للمتصفح |
| `public/published.json` | قائمة الصفحات المنشورة حالياً (يُحدِّثها البناء يومياً) |
| `public/4f9c...txt` | مفتاح IndexNow للفهرسة الفورية |

### كيف يعمل النشر التلقائي؟
1. `scripts/catalog.mjs` يبني كل الصفحات بالترتيب (الأولوية الأعلى أولاً).
2. كل صفحة تأخذ تاريخ نشر = `startDate + floor(index / ratePerDay)`.
3. `prerender.mjs` يكتب **فقط** الصفحات التي مضى تاريخ نشرها، وsitemap يشملها فقط.
4. GitHub Actions يعمل 3 مرات/يوم: يحدّث الأسعار، يبني، يدفع `public/published.json` → Vercel يعيد البناء → الصفحات الجديدة تظهر وتُرسل لـ IndexNow.
5. لتسريع الوصول إلى 1000+ صفحة: ارفع `ratePerDay` في `src/data/schedule.json`.

### قواعد للعالمية
- **لا تُترجم المحتوى السعودي المحلي** (رواتب/حساب مواطن) — يبقى عربياً.
- كل صفحة عالمية تحمل: عنوان/وصف موضعي، canonical خاص، hreflang لكل النسخ الموجودة فعلاً، JSON-LD، FAQ.
- الأسعار تُحدَّث يومياً تلقائياً؛ الصفحات تعرض «آخر تحديث» بتاريخ البناء.
- **إيران تستخدم التقويم الشمسي** — لا تخلط بين الهجري القمري والجلالي.
- أي صفحة جديدة للكتالوج: أضف مولدها في `buildCatalog()` داخل `scripts/catalog.mjs` + معالجها في `GlobalPage.tsx` + مسارها في `parseRoute` (router.ts).
