import { Mail } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import AdPlacement from '../components/AdPlacement';
import SmartlinkCard from '../components/SmartlinkCard';
import FAQ_GROUPS from '../data/faq.json';
import contact from '../data/site-contact.json';

export default function FaqPage() {
  useSeo({
    title: 'أسئلة شائعة عن مواعيد الرواتب والتقويم والإجازات في السعودية | تقويم السعودية',
    description:
      'إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والمتقاعدين والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.',
    canonical: 'https://alshafra.com/faq',
    keywords: 'أسئلة شائعة, مواعيد الرواتب, حساب المواطن, التقويم الهجري, الإجازات الرسمية',
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'الأسئلة الشائعة' }]} />
      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_160px] lg:justify-center">
        <div className="min-w-0">
          <header className="max-w-2xl">
            <h1 className="section-title">الأسئلة الشائعة</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
              إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والمتقاعدين والتقويم
              الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.
            </p>
          </header>

          <AdPlacement name="content" unit="native" className="mt-8" />

          <AdPlacement name="content" size="320x50" className="mt-6" />

          <div className="mt-8 space-y-8">
            {FAQ_GROUPS.map((group, gi) => (
              <section key={gi}>
                <h2 className="font-display text-lg font-bold text-brand-900">{group.title}</h2>
                <div className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <div key={item.q} className="card p-4">
                      <h3 className="text-sm font-semibold text-brand-900">{item.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-700/85">{item.a}</p>
                    </div>
                  ))}
                </div>
                {gi === 0 && <AdPlacement name="content" unit="rectangle" className="mt-6" />}
                {gi === 1 && <AdPlacement name="content" size="468x60" className="mt-6" />}
                {gi === 2 && <AdPlacement name="content" size="160x300" className="mt-6 lg:hidden" />}
                {gi === 3 && <AdPlacement name="content" size="728x90" className="mt-6" />}
                {gi === 1 && (
                  <SmartlinkCard
                    className="mt-6"
                    title="عرض من شريكنا"
                    description="عرض مختار من شبكة إعلاناتنا — يُفتح في نافذة جديدة ولا علاقة له بمحتوى الأسئلة."
                  />
                )}
              </section>
            ))}
          </div>

          <SmartlinkCard className="mt-8" />

          <section className="mt-10 card p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-brand-900">لديك سؤال آخر؟</h2>
                <p className="mt-2 text-sm text-brand-700/85">
                  راسلنا على <a className="break-all underline" href={`mailto:${contact.email}`}>{contact.email}</a> وسنحاول الإجابة على سؤالك في التحديثات القادمة.
                </p>
              </div>
            </div>
          </section>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <AdPlacement name="sidebar" includeCompactSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
