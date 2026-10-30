import { Mail, MessageCircle, ShieldCheck, FileText, Info } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import AdPlacement from '../components/AdPlacement';
import SmartlinkCard from '../components/SmartlinkCard';
import privacyNotice from '../data/privacy-notice.json';
import contact from '../data/site-contact.json';

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

function LegalWithAdsLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: title }]} />
      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,48rem)_160px] lg:justify-center">
        <article className="min-w-0 max-w-3xl">
          <h1 className="section-title">{title}</h1>
          <AdPlacement name="content" unit="native" className="mt-6" />
          <AdPlacement name="content" size="320x50" className="mt-6" />
          <div className="mt-6 space-y-5 text-sm leading-loose text-brand-800/90">{children}</div>
          <AdPlacement name="content" unit="rectangle" className="mt-8" />
          <AdPlacement name="content" size="160x300" className="mt-8 lg:hidden" />
          <SmartlinkCard
            className="mt-8"
            title="عرض من شريكنا"
            description="عرض مختار من شبكة إعلاناتنا — يُفتح في نافذة جديدة ولا علاقة له بمحتوى هذه الصفحة."
          />
          <AdPlacement name="content" size="468x60" className="mt-8" />
          <SmartlinkCard className="mt-8" />
          <AdPlacement name="content" size="728x90" className="mt-8" />
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <AdPlacement name="sidebar" includeCompactSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  useSeo({
    title: 'سياسة الخصوصية | تقويم السعودية',
    description:
      'سياسة الخصوصية لموقع تقويم السعودية (alshafra.com) — كيفية جمع البيانات واستخدامها وحمايتها، بما في ذلك ملفات تعريف الارتباط وإعلانات Google AdSense وشبكة Adsterra.',
    canonical: 'https://alshafra.com/privacy',
    keywords: 'سياسة الخصوصية, الخصوصية, الكوكيز, AdSense, Adsterra, حماية البيانات',
  });
  return (
    <LegalLayout title="سياسة الخصوصية">
      <p>{privacyNotice.intro}</p>
      {privacyNotice.sections.map(section => (
        <section key={section.heading}>
          <h2 className="font-display text-lg font-bold text-brand-900">{section.heading}</h2>
          <p className="mt-2">{section.body}</p>
          {section.links.length > 0 && <ul className="mt-2 list-disc pr-5">{section.links.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{link.label}</a></li>)}</ul>}
        </section>
      ))}
    </LegalLayout>
  );
}

export function TermsPage() {
  useSeo({
    title: 'شروط الاستخدام | تقويم السعودية',
    description:
      'شروط وأحكام استخدام موقع تقويم السعودية (alshafra.com) — المسؤولية القانونية ودقة المعلومات وحقوق الملكية الفكرية.',
    canonical: 'https://alshafra.com/terms',
    keywords: 'شروط الاستخدام, الأحكام, المسؤولية, حقوق الملكية',
  });
  return (
    <LegalLayout title="شروط الاستخدام">
      <p>
        باستخدامك لموقع «تقويم السعودية» (alshafra.com)، فإنك توافق على الشروط التالية. إذا لم
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
        جميع المحتوى على هذا الموقع (نصوص، تصاميم، أكواد، شعارات) ملك لموقع تقويم السعودية ما لم
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

    </LegalLayout>
  );
}

export function AboutPage() {
  useSeo({
    title: 'عن الموقع | تقويم السعودية',
    description:
      'تعرّف على موقع تقويم السعودية (alshafra.com) — رسالته وأهدافه ومصادر بياناته وفريق العمل.',
    canonical: 'https://alshafra.com/about',
    keywords: 'عن تقويم السعودية, من نحن, رسالة الموقع',
  });
  return (
    <LegalWithAdsLayout title="عن الموقع">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Info className="h-5 w-5" />
        </span>
        <p>
          «تقويم السعودية» (alshafra.com) بوابة إلكترونية مستقلة تهدف إلى تسهيل الوصول لمواعيد
          المناسبات الرسمية في المملكة العربية السعودية في مكان واحد، بدلاً من البحث في عدة مصادر.
        </p>
      </div>

      <h2 className="font-display text-lg font-bold text-brand-900">رسالتنا</h2>
      <p>
        توفير مرجع سعودي موثوق وسهل الاستخدام لمواعيد الرواتب وحساب المواطن والمتقاعدين والضمان
        الاجتماعي، التقويم الهجري والميلادي، التقويم الدراسي، والإجازات الرسمية، مع أدوات تحويل
        التاريخ وحاسبة العمر.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">مصادر بياناتنا</h2>
      <ul className="list-disc space-y-1 pr-5">
        <li>تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية.</li>
        <li>الإعلانات الرسمية لوزارة الموارد البشرية والتنمية الاجتماعية.</li>
        <li>التقويم الدراسي الصادر عن وزارة التعليم.</li>
        <li>بيانات المؤسسة العامة للتقاعد وحساب المواطن.</li>
      </ul>

      <h2 className="font-display text-lg font-bold text-brand-900">التحرير</h2>
      <p>يتولى {contact.editorialTeam} مسؤولية مراجعة المحتوى والمواعيد واعتماد النشر. راجع المصادر الرسمية للتحديثات النهائية.</p>

      <h2 className="font-display text-lg font-bold text-brand-900">استقلالنا</h2>
      <p>
        موقعنا مستقل ولا يتبع لأي جهة حكومية. لا نطلب تسجيل الدخول ولا نجمع بياناتك الشخصية لاستخدام
        الأدوات. كل الخدمات مجانية بالكامل.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">التمويل</h2>
      <p>
        يتضمن الموقع مواضع إعلانية وروابط إعلانية من شبكات تشمل Google وAdsterra. لا يُعد الإعلان
        مصدراً تحريرياً للمواعيد.
      </p>

      <h2 className="font-display text-lg font-bold text-brand-900">التواصل</h2>
      <p>
        لأي ملاحظة أو اقتراح، راسلنا على <a className="break-all text-brand-700 underline" href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </LegalWithAdsLayout>
  );
}

export function ContactPage() {
  useSeo({
    title: 'اتصل بنا | تقويم السعودية',
    description:
      'تواصل مع فريق موقع تقويم السعودية (alshafra.com) لأي ملاحظة أو اقتراح أو تصحيح معلومة.',
    canonical: 'https://alshafra.com/contact',
    keywords: 'اتصل بنا, تواصل, تقويم السعودية, الدعم',
  });
  return (
    <LegalWithAdsLayout title="اتصل بنا">
      <p>
        يسعدنا تواصلك معنا لأي سبب: ملاحظة على المحتوى، اقتراح ميزة جديدة، أو تصحيح معلومة.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Mail className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-brand-900">البريد الإلكتروني</h3>
          <p className="mt-1 text-sm text-brand-700/85"><a className="break-all underline" href={`mailto:${contact.email}`}>{contact.email}</a></p>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-brand-900">تصحيح معلومة</h3>
          <p className="mt-1 text-sm text-brand-700/85">
            إن لاحظت خطأً في موعد أو تاريخ، أرسل لنا المصدر الرسمي لمراجعته من فريق التحرير.
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
    </LegalWithAdsLayout>
  );
}
