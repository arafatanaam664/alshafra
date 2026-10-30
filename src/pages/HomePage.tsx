import {
  Clock,
  Coins,
  BookOpen,
  CalendarDays,
  Flag,
  Sparkles,
  ArrowLeft,
  Download,
  FileText,
  HelpCircle,
  Wand2,
  Timer,
  Sun,
} from 'lucide-react';
import { useSeo } from '../lib/seo';
import { useNow } from '../lib/useNow';
import {
  todayGregorian,
  gregorianToHijri,
  formatHijri,
  formatGregorian,
  weekdayName,
  formatHijriShort,
  formatGregorianShort,
} from '../lib/hijri';
import { ARTICLES, CATEGORY_LABELS_ARTICLE } from '../lib/articles';
import Link from '../components/Link';
import AdSlot from '../components/AdSlot';
import AdPlacement from '../components/AdPlacement';
import SmartlinkCard from '../components/SmartlinkCard';

export default function HomePage() {
  const now = useNow(1000);
  const today = todayGregorian();
  const hijri = gregorianToHijri(today.year, today.month, today.day);
  const weekday = weekdayName(today);

  useSeo({
    title: 'تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي',
    description:
      'منصة مستقلة للتقويم والمواعيد والأدوات في السعودية؛ مواعيد الرواتب والدعم بانتظار التحقق، والتواريخ الحسابية تحتاج إلى مراجعة المصادر الرسمية.',
    canonical: 'https://alshafra.com/',
    keywords:
      'التقويم الهجري, التقويم الميلادي, مواعيد الرواتب, حساب المواطن, رواتب المتقاعدين, الضمان الاجتماعي, التقويم الدراسي, الإجازات الرسمية, تحويل التاريخ, حاسبة العمر, تقويم أم القرى, السعودية',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'تقويم السعودية',
        url: 'https://alshafra.com/',
        inLanguage: 'ar-SA',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alshafra.com/' },
        ],
      },
    ],
  });

  const timeString = now.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Riyadh',
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-brand text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="container-page relative py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <span className="chip bg-white/15 text-white ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5 text-gold-300" />
                منصة مستقلة للمواعيد والتقويم
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
                مواعيد الرواتب، التقويم الهجري، والإجازات الرسمية في مكان واحد
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
                منصة مستقلة للتقويم والمواعيد والأدوات في السعودية. مواعيد الرواتب والدعم بانتظار
                التحقق؛ راجع المصادر الرسمية قبل الاعتماد على أي موعد.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/salaries" className="btn bg-gold-500 text-brand-900 hover:bg-gold-400">
                  <Coins className="h-4 w-4" />
                  مواعيد الرواتب
                </Link>
                <Link to="/date-converter" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                  <Clock className="h-4 w-4" />
                  تحويل التاريخ
                </Link>
                <Link to="/hijri-calendar" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                  <CalendarDays className="h-4 w-4" />
                  التقويم الهجري
                </Link>
              </div>
            </div>

            {/* Today card */}
            <div className="animate-fade-in-up rounded-3xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-md sm:p-8">
              <div className="flex items-center justify-between">
                <span className="chip bg-white/15 text-white">اليوم</span>
                <span className="font-display tabular-nums text-sm text-brand-50/80">{timeString}</span>
              </div>
              <div className="mt-5 text-center">
                <div className="text-sm text-brand-50/80">{weekday}</div>
                <div className="mt-1 font-display text-3xl font-bold sm:text-4xl">{formatHijri(hijri)}</div>
                <div className="mt-1 text-brand-50/80">{formatGregorian(today)}</div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-[11px] text-brand-50/70">الهجري (رقمي)</div>
                  <div className="mt-0.5 font-display tabular-nums text-lg font-bold">{formatHijriShort(hijri)}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-[11px] text-brand-50/70">الميلادي (رقمي)</div>
                  <div className="mt-0.5 font-display tabular-nums text-lg font-bold">{formatGregorianShort(today)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_160px] lg:justify-center">
          <div className="min-w-0">
            <AdPlacement name="content" unit="native" lazy={false} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AdPlacement name="sidebar" />
            </div>
          </aside>
        </div>
      </div>

      {/* Services grid */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">خدماتنا</h2>
            <p className="mt-1 text-sm text-brand-700/70">كل ما تحتاجه من مواعيد وأدوات في بوابة واحدة</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            icon={Timer}
            title="كم باقي على…"
            desc="عدّادات للمناسبات ومواعيد الدراسة المراجَعة؛ مواعيد الرواتب بانتظار التحقق."
            to="/countdown"
          />
          <ServiceCard
            icon={Sun}
            title="التاريخ اليوم"
            desc="التاريخ الهجري والميلادي بتوقيت الرياض؛ التاريخ الهجري حسابي وقد يستخدم بديلاً تقريبياً."
            to="/today"
          />
          <ServiceCard
            icon={Coins}
            title="مواعيد الرواتب"
            desc="رواتب الموظفين، حساب المواطن، المتقاعدين، الضمان الاجتماعي، والدعم السكني."
            to="/salaries"
          />
          <ServiceCard
            icon={CalendarDays}
            title="التقويم الهجري"
            desc="تقويم هجري حسابي مع مناسبات مختارة وروابط مصادرها المتاحة."
            to="/hijri-calendar"
          />
          <ServiceCard
            icon={BookOpen}
            title="التقويم الدراسي"
            desc="موعد بداية الدراسة وإجازات المدارس وفق تقويم وزارة التعليم السعودية."
            to="/school-calendar"
          />
          <ServiceCard
            icon={Flag}
            title="الإجازات الرسمية"
            desc="دليل الإجازات بحسب الفئة والجهة، مع روابط المصادر."
            to="/holidays"
          />
          <ServiceCard
            icon={Clock}
            title="تحويل التاريخ"
            desc="أداة تحويل حسابية مع بيان حدود النتيجة."
            to="/date-converter"
          />
          <ServiceCard
            icon={Sparkles}
            title="حاسبة العمر"
            desc="احسب عمرك بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي."
            to="/age-calculator"
          />
          <ServiceCard
            icon={Wand2}
            title="زخرفة الأسماء"
            desc="زخرف اسمك بأكثر من 75 نمط مجاناً — عربي، ببجي، إنجليزي، فري فاير، وفرنسي."
            to="/name-decoration"
          />
        </div>
      </section>

      <div className="container-page mt-8">
        <AdPlacement name="content" size="320x50" />
      </div>

      <div className="container-page mt-8"><AdPlacement name="content" unit="rectangle" /></div>

      <div className="container-page mt-8">
        <AdPlacement name="content" size="468x60" />
        <SmartlinkCard className="mt-8" />
      </div>

      {/* Adsterra smartlink — high-intent partner offer */}
      <div className="container-page mt-6">
        <AdPlacement name="content" size="160x300" className="mb-8" />
        <SmartlinkCard variant="inline" />
      </div>

      {/* Download CTA */}
      <section className="container-page mt-14">
        <div className="card overflow-hidden">
          <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-brand-900 sm:text-2xl">
                طباعة التقويم الهجري
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
                انتقل إلى التقويم واختر الطباعة؛ يمكنك حفظه بصيغة PDF إذا دعم متصفحك ذلك.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/hijri-calendar" className="btn-primary">
                <Download className="h-4 w-4" />
                عرض التقويم للطباعة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Articles + FAQ */}
      <section className="container-page mt-14">
        <AdSlot slot="home" />
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">مقالات ودلائل</h2>
            <p className="mt-1 text-sm text-brand-700/70">دلائل شاملة لكل ما يهمك معرفته عن المواعيد في السعودية</p>
          </div>
          <Link to="/articles" className="btn-ghost">
            كل المقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to={`/articles/${a.slug}`}
              className="card group flex flex-col p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  {CATEGORY_LABELS_ARTICLE[a.category]}
                </span>
                <FileText className="h-4 w-4 text-brand-400" />
              </div>
              <h3 className="mt-3 font-display text-sm font-bold leading-snug text-brand-900 group-hover:text-brand-700">
                {a.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-700/70 line-clamp-2">{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="card overflow-hidden">
          <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-brand-900 sm:text-2xl">
                أسئلة شائعة عن المواعيد في السعودية
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
                إجابات على أكثر الأسئلة شيوعاً عن مواعيد الرواتب وحساب المواطن والتقويم الهجري
                والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/faq" className="btn-primary">
                <HelpCircle className="h-4 w-4" />
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="container-page mt-14">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-brand-900">عن بوابة تقويم السعودية</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-700/85">
            <p>
              <strong className="text-brand-900">تقويم السعودية</strong> هي بوابة إلكترونية متخصصة في عرض
              التقويمات ومعلومات المواعيد في المملكة العربية السعودية. مواعيد الرواتب والدعم بانتظار
              التحقق، وتتوفر مواعيد دراسية مختارة وروابط الجهات المختصة.
            </p>
            <p>
              تستخدم أدوات التقويم بيانات أم القرى المتاحة في المتصفح عند دعمها، أو حساباً تقريبياً
              عند عدم توفرها. لا تغني النتائج عن الإعلانات الرسمية واللوائح الخاصة بكل فئة.
            </p>
            <p>
              نسعى لجعل المعلومات في متناول الجميع بسرعة ودقة، مع التذكير بأن التواريخ المعروضة
              تقريبية ولأغراض معلوماتية، ويُنصح بالرجوع للمصادر الرسمية للمسائل القانونية.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  desc,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="card group flex flex-col items-start p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-brand-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-brand-800">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
        اكتشف المزيد
        <ArrowLeft className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
