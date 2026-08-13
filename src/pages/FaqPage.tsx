import { useState } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';

interface QA {
  q: string;
  a: string;
}

const FAQ_GROUPS: { title: string; items: QA[] }[] = [
  {
    title: 'مواعيد الرواتب',
    items: [
      {
        q: 'متى يُصرف راتب الموظف الحكومي في السعودية؟',
        a: 'عادةً يُصرف راتب الموظف الحكومي في اليوم الأخير من كل شهر ميلادي أو في اليوم الأول من الشهر التالي. قد يتقدم الموعد في شهر رمضان والإجازات الرسمية.',
      },
      {
        q: 'متى ينزل دعم حساب المواطن؟',
        a: 'يُصرف دعم حساب المواطن في اليوم العاشر من كل شهر ميلادي. إذا صادف اليوم العاشر عطلة نهاية أسبوع، قد يتقدم الصرف إلى الخميس السابق.',
      },
      {
        q: 'متى تُودع رواتب المتقاعدين؟',
        a: 'تُودع رواتب المتقاعدين في اليوم الخامس والعشرين من كل شهر ميلادي وفق المؤسسة العامة للتقاعد.',
      },
      {
        q: 'متى يُصرف الضمان الاجتماعي المطوّر؟',
        a: 'يُصرف راتب الضمان الاجتماعي المطوّر في اليوم الأول من كل شهر ميلادي للمستفيدين المستحقين.',
      },
    ],
  },
  {
    title: 'التقويم والمناسبات',
    items: [
      {
        q: 'متى يبدأ العام الهجري 1448هـ؟',
        a: 'يبدأ العام الهجري 1448هـ في 1 محرم 1448هـ الموافق 15 يونيو 2026م تقريباً وفق تقويم أم القرى الرسمي.',
      },
      {
        q: 'متى يبدأ شهر رمضان 1448هـ؟',
        a: 'يُتوقع أن يبدأ شهر رمضان المبارك 1448هـ في 1 رمضان 1448هـ الموافق 18 فبراير 2027م تقريباً، ويُؤكد ذلك برؤية الهلال رسمياً.',
      },
      {
        q: 'متى عيد الفطر 1448هـ؟',
        a: 'يبدأ عيد الفطر المبارك 1448هـ في 1 شوال 1448هـ الموافق 19 مارس 2027م تقريباً. الإجازة الرسمية تستمر 4 أيام.',
      },
      {
        q: 'متى عيد الأضحى 1448هـ؟',
        a: 'يبدأ عيد الأضحى المبارك 1448هـ في 10 ذو الحجة 1448هـ الموافق 16 مايو 2027م تقريباً وفق أم القرى، وتبدأ إجازة القطاع الخاص من يوم عرفة وفق اللائحة.',
      },
    ],
  },
  {
    title: 'الإجازات الرسمية',
    items: [
      {
        q: 'متى اليوم الوطني السعودي 2026؟',
        a: 'يصادف اليوم الوطني السعودي 23 سبتمبر من كل عام ميلادي. في 2026م يوافق 23 ربيع الأول 1448هـ، وهو إجازة رسمية.',
      },
      {
        q: 'متى يوم التأسيس السعودي 1448؟',
        a: 'يصادف يوم التأسيس السعودي 22 فبراير من كل عام ميلادي، وهو إجازة رسمية ليوم واحد. يتغير التاريخ الهجري المقابل كل عام.',
      },
      {
        q: 'هل يوم العلم السعودي إجازة رسمية؟',
        a: 'يُحتفل بيوم العلم السعودي في 11 مارس من كل عام، لكنه ليس إجازة رسمية.',
      },
    ],
  },
  {
    title: 'أدوات وتحويل التاريخ',
    items: [
      {
        q: 'كيف أحول التاريخ الهجري إلى ميلادي؟',
        a: 'استخدم أداة تحويل التاريخ في تقويم السعودية، أو اضرب السنة الهجرية في 0.97 وأضف 621.6 لتحويل تقريبي.',
      },
      {
        q: 'هل التحويل بين الهجري والميلادي دقيق؟',
        a: 'التحويل دقيق لمعظم التواريخ، لكن قد يختلف بيوم قرب بدايات الأشهر الهجرية بسبب رؤية الهلال.',
      },
      {
        q: 'كيف أحسب عمري بالهجري؟',
        a: 'استخدم حاسبة العمر في تقويم السعودية — أدخل تاريخ ميلادك الميلادي وستحصل على عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي.',
      },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>('0-0');

  const allFaqs = FAQ_GROUPS.flatMap((g, gi) => g.items.map((item, ii) => ({ ...item, id: `${gi}-${ii}` })));

  useSeo({
    title: 'أسئلة شائعة عن مواعيد الرواتب والتقويم والإجازات في السعودية | تقويم السعودية',
    description:
      'إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والمتقاعدين والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.',
    canonical: 'https://alshafra.com/faq',
    keywords: 'أسئلة شائعة, مواعيد الرواتب, حساب المواطن, التقويم الهجري, الإجازات الرسمية',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'الأسئلة الشائعة' }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="section-title">الأسئلة الشائعة</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والمتقاعدين والتقويم
          الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {FAQ_GROUPS.map((group, gi) => (
          <section key={gi}>
            <h2 className="font-display text-lg font-bold text-brand-900">{group.title}</h2>
            <div className="mt-3 space-y-2">
              {group.items.map((item, ii) => {
                const id = `${gi}-${ii}`;
                const isOpen = open === id;
                return (
                  <div key={id} className="card overflow-hidden">
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-right"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                        <HelpCircle className="h-4 w-4 text-brand-600" />
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-brand-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-brand-900/5 px-4 py-3 text-sm leading-relaxed text-brand-700/85">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-brand-900">لديك سؤال آخر؟</h2>
            <p className="mt-2 text-sm text-brand-700/85">
              راسلنا على info@alshafra.com وسنحاول الإجابة على سؤالك في التحديثات القادمة.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
