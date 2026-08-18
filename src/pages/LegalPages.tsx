import { Mail, MessageCircle, ShieldCheck, FileText, Info } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';

function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: title }]} />
      <article className="mt-4 max-w-3xl">
        <h1 className="section-title">{title}</h1>
        <div className="mt-6 space-y-5 text-sm leading-loose text-brand-800/90">{children}</div>
      </article>
    </div>
  );
}

export function PrivacyPage() {
  useSeo({
    title: 'سياسة الخصوصية | الشفرة',
    description:
      'سياسة الخصوصية لموقع الشفرة (alshafra.com) — كيفية جمع البيانات واستخدامها وحمايتها، بما في ذلك ملفات تعريف الارتباط وإعلانات Google AdSense.',
    canonical: 'https://alshafra.com/privacy',
    keywords: 'سياسة الخصوصية, الخصوصية, الكوكيز, AdSense, حماية البيانات',
  });
  return (
    <LegalLayout title="سياسة الخصوصية">
      <p>
        نحترم خصوصية زوار موقعنا «الشفرة» (alshafra.com). توضّح هذه السياسة كيفية جمع
        البيانات واستخدامها وحمايتها عند استخدامك لموقعنا.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">1. البيانات التي نجمعها</h2>
      <p>
        موقعنا لا يتطلب إنشاء حساب ولا يجمع بياناتك الشخصية (الاسم، البريد، رقم الهوية) إلا إذا
        تواصلت معنا طوعاً عبر البريد الإلكتروني. نجمع تلقائياً بيانات تقنية عامة مثل نوع المتصفح،
        نظام التشغيل، الصفحات المُزارَة، ومصدر الزيارة عبر أدوات تحليلات مثل Google Analytics.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">2. ملفات تعريف الارتباط (Cookies)</h2>
      <p>
        يستخدم موقعنا ملفات تعريف ارتباط لتحسين تجربة المستخدم وتحليل الأداء. كما يستخدمها شركاؤنا
        مثل Google لعرض الإعلانات. يمكنك التحكم في هذه الملفات أو تعطيلها من إعدادات متصفحك، لكن
        ذلك قد يؤثر على بعض الوظائف.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">3. إعلانات Google AdSense</h2>
      <p>
        نستخدم خدمة Google AdSense لعرض الإعلانات. تستخدم Google ملفات تعريف ارتباط لعرض إعلانات
        بناءً على زياراتك السابقة لموقعنا أو مواقع أخرى. يمكنك تعطيل الإعلانات المخصصة عبر زيارة
        <a href="https://www.google.com/settings/ads" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer"> إعدادات إعلانات Google</a>.
      </p>
      <p>
        قد يستخدم طرف ثالث ملفات تعريف ارتباط لتحسين جودة الخدمة. يمكنك الاطلاع على سياسة Google
        للإعلانات عبر <a href="https://policies.google.com/technologies/ads" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">هذه الصفحة</a>.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">4. خدمات التحليلات</h2>
      <p>
        قد نستخدم Google Analytics لفهم كيفية استخدام الزوار للموقع وتحسين محتواه. تجمع هذه الخدمة
        بيانات مجهولة الهوية ولا تكشف هويتك الشخصية.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">5. الروابط الخارجية</h2>
      <p>
        يحتوي موقعنا على روابط لمواقع خارجية (مثل البوابة الرسمية لحساب المواطن ووزارة التعليم).
        لسنا مسؤولين عن سياسات الخصوصية لتلك المواقع، وننصحك بقراءتها.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">6. أمن البيانات</h2>
      <p>
        نتخذ إجراءات معقولة لحماية البيانات من الوصول غير المصرّح به. ومع ذلك، لا يمكن ضمان أمن أي
        نقل عبر الإنترنت بنسبة 100%.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">7. حقوق المستخدم</h2>
      <p>
        يمكنك طلب الاطلاع على أي بيانات جمعناها عنك أو طلب حذفها عبر التواصل معنا على
        info@alshafra.com.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">8. تحديثات السياسة</h2>
      <p>
        قد نُحدّث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث التاريخ.
      </p>

      <p className="text-xs text-brand-600/70">آخر تحديث: يوليو 2026</p>
    </LegalLayout>
  );
}

export function TermsPage() {
  useSeo({
    title: 'شروط الاستخدام | الشفرة',
    description:
      'شروط وأحكام استخدام موقع الشفرة (alshafra.com) — المسؤولية القانونية ودقة المعلومات وحقوق الملكية الفكرية.',
    canonical: 'https://alshafra.com/terms',
    keywords: 'شروط الاستخدام, الأحكام, المسؤولية, حقوق الملكية',
  });
  return (
    <LegalLayout title="شروط الاستخدام">
      <p>
        باستخدامك لموقع «الشفرة» (alshafra.com)، فإنك توافق على الشروط التالية. إذا لم
        توافق على أي بند منها، يُرجى عدم استخدام الموقع.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">1. طبيعة الخدمة</h2>
      <p>
        موقعنا يقدّم معلومات استرشادية عن مواعيد الرواتب والتقويم الهجري والميلادي والإجازات
        الرسمية والتقويم الدراسي. المعلومات محسوبة وفق تقويم أم القرى التقريبي وقد تختلف بيوم عن
        الإعلانات الرسمية بسبب رؤية الهلال.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">2. إخلاء المسؤولية</h2>
      <p>
        لا يتحمّل الموقع أي مسؤولية عن أي ضرر مباشر أو غير مباشر ينتج عن الاعتماد على المعلومات
        المعروضة. للمسائل القانونية والرسمية، يُرجى الرجوع للمصادر الرسمية للمملكة العربية السعودية
        مثل بوابة حكومتي ووزارة الموارد البشرية ووزارة التعليم.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">3. دقة المعلومات</h2>
      <p>
        نسعى لعرض معلومات دقيقة ومحدّثة، لكن لا نضمن خلوّها من الأخطاء. قد تتغير المواعيد الرسمية
        (مثل الرواتب أو الإجازات) دون إشعار مسبق من الجهات الحكومية.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">4. حقوق الملكية الفكرية</h2>
      <p>
        جميع المحتوى على هذا الموقع (نصوص، تصاميم، أكواد، شعارات) ملك لموقع الشفرة ما لم
        يُذكر خلاف ذلك. لا يجوز نسخ المحتوى أو إعادة نشره دون إذن كتابي، باستثناء الاقتباس المختصر
        مع ذكر المصدر.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">5. الروابط الخارجية</h2>
      <p>
        قد يحتوي الموقع على روابط لمواقع خارجية. لا نتحمّل مسؤولية محتوى أو سياسات تلك المواقع.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">6. الإعلانات</h2>
      <p>
        قد يعرض الموقع إعلانات عبر Google AdSense أو شركاء آخرين. الإعلانات لا تعكس بالضرورة
        رأينا، ولا نتحمّل مسؤولية محتواها.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">7. التعديلات على الشروط</h2>
      <p>
        نحتفظ بحق تعديل هذه الشروط في أي وقت. استمرارك في استخدام الموقع بعد التعديل يُعدّ موافقة
        على الشروط المُحدّثة.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">8. القانون الحاكم</h2>
      <p>
        تخضع هذه الشروط للأنظمة والقوانين المعمول بها في المملكة العربية السعودية.
      </p>

      <p className="text-xs text-brand-600/70">آخر تحديث: يوليو 2026</p>
    </LegalLayout>
  );
}

export function AboutPage() {
  useSeo({
    title: 'عن الموقع | الشفرة',
    description:
      'تعرّف على موقع الشفرة (alshafra.com) — رسالته وأهدافه ومصادر بياناته وفريق العمل.',
    canonical: 'https://alshafra.com/about',
    keywords: 'عن تقويم السعودية, من نحن, رسالة الموقع',
  });
  return (
    <LegalLayout title="عن الموقع">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Info className="h-5 w-5" />
        </span>
        <p>
          «الشفرة» (alshafra.com) منصة مستقلة للحلول والأدوات والمراجع العملية. تضم «تقويم السعودية»
          للمواعيد والتاريخ، و«الشفرة إصلاح» لفهم أكواد أعطال الأجهزة ضمن حدود السلامة.
        </p>
      </div>

      <h2 className="font-display text-lg font-bold text-brand-900">رسالتنا</h2>
      <p>
        توفير مرجع سهل الاستخدام لمواعيد الرواتب وحساب المواطن والمتقاعدين والضمان الاجتماعي،
        والتقويم الهجري والدراسي والإجازات، بالتوازي مع أدلة أعطال تربط المعنى بالعلامة والموديل
        ومصدر الشركة وتوضح متى يجب التوقف وطلب فني.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">مصادر بياناتنا</h2>
      <ul className="list-disc space-y-1 pr-5">
        <li>تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية.</li>
        <li>الإعلانات الرسمية لوزارة الموارد البشرية والتنمية الاجتماعية.</li>
        <li>التقويم الدراسي الصادر عن وزارة التعليم.</li>
        <li>بيانات المؤسسة العامة للتقاعد وحساب المواطن.</li>
        <li>كتيبات الأجهزة وصفحات الدعم الرسمية للشركات المصنّعة.</li>
      </ul>

      <h2 className="font-display text-lg font-bold text-brand-900">استقلالنا</h2>
      <p>
        موقعنا مستقل ولا يتبع لأي جهة حكومية أو شركة أجهزة. لا يحتاج الزائر إلى تسجيل الدخول لاستخدام
        الصفحات العامة؛ حسابات الدخول محصورة بفريق التحرير. كل الخدمات العامة مجانية.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">التمويل</h2>
      <p>
        يُموَّل الموقع ذاتياً عبر إعلانات Google AdSense لاستمرار تقديم الخدمة مجاناً. لا تؤثر
        الإعلانات على محتوى المقالات أو الأدوات.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">التواصل</h2>
      <p>
        لأي ملاحظة أو اقتراح، راسلنا على info@alshafra.com.
      </p>
    </LegalLayout>
  );
}

export function ContactPage() {
  useSeo({
    title: 'اتصل بنا | الشفرة',
    description:
      'تواصل مع فريق موقع الشفرة (alshafra.com) لأي ملاحظة أو اقتراح أو تصحيح معلومة.',
    canonical: 'https://alshafra.com/contact',
    keywords: 'اتصل بنا, تواصل, تقويم السعودية, الدعم',
  });
  return (
    <LegalLayout title="اتصل بنا">
      <p>
        يسعدنا تواصلك معنا لأي سبب: ملاحظة على المحتوى، اقتراح ميزة جديدة، أو تصحيح معلومة.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Mail className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-brand-900">البريد الإلكتروني</h3>
          <p className="mt-1 text-sm text-brand-700/85">info@alshafra.com</p>
          <p className="mt-1 text-xs text-brand-600/70">نرد خلال 48 ساعة عادةً</p>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-brand-900">تصحيح معلومة</h3>
          <p className="mt-1 text-sm text-brand-700/85">
            إن لاحظت خطأً في موعد أو تاريخ، أرسل لنا المصدر الرسمي وسنحدّث الصفحة فوراً.
          </p>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-brand-900">الأسئلة الشائعة قبل التواصل</h2>
      <p>
        قبل مراسلتنا، ننصحك بزيارة صفحة <a href="/faq" className="text-brand-700 underline">الأسئلة الشائعة</a> —
        قد تجد إجابتك مباشرة.
      </p>

      <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
        <p>
          لا نطلب كلمة المرور أو بياناتك البنكية أبداً. أي رسالة تطلب ذلك هي محاولة احتيال ولا
          تمثّلنا.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <p>
          للإبلاغ عن محتوى مخالف أو طلب إزالة، استخدم نفس البريد مع وصف واضح للمحتوى والرابط.
        </p>
      </div>
    </LegalLayout>
  );
}
