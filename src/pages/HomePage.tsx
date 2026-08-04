import {
  Clock,
  Coins,
  BookOpen,
  CalendarDays,
  Flag,
  Sparkles,
  ArrowLeft,
  Users,
  HandCoins,
  ShieldCheck,
  Home as HomeIcon,
  Briefcase,
  Download,
  TrendingUp,
  FileText,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { useSeo } from '../lib/seo';
import { useNow } from '../lib/useNow';
import {
  todayGregorian,
  todayHijri,
  formatHijri,
  formatGregorian,
  weekdayName,
  formatHijriShort,
  formatGregorianShort,
} from '../lib/hijri';
import {
  upcomingEvents,
  buildSalaryInstances,
  daysUntilEvent,
  eventHijriText,
  nextHolidayAfter,
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  SAUDI_EVENTS,
  type SalaryInstance,
} from '../lib/events';
import { ARTICLES, CATEGORY_LABELS_ARTICLE } from '../lib/articles';
import Countdown from '../components/Countdown';
import Link from '../components/Link';
import AdSlot from '../components/AdSlot';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Users,
  HandCoins,
  ShieldCheck,
  Home: HomeIcon,
};

export default function HomePage() {
  const now = useNow(1000);
  const today = todayGregorian();
  const hijri = todayHijri();
  const weekday = weekdayName(today);
  const upcoming = upcomingEvents(today, 6);
  const salaries = buildSalaryInstances(today);
  const nextEvent = upcoming[0];
  const nextHoliday = nextHolidayAfter(today) ?? upcoming[0];

  useSeo({
    title: 'تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي',
    description:
      'بوابة سعودية شاملة لمواعيد صرف الرواتب الحكومية، حساب المواطن، الضمان الاجتماعي المطوّر، رواتب المتقاعدين، التقويم الهجري والميلادي، التقويم الدراسي، الإجازات الرسمية، وتحويل التاريخ وحاسبة العمر — وفق تقويم أم القرى الرسمي.',
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
                البوابة السعودية الأولى للمواعيد الرسمية
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
                مواعيد الرواتب، التقويم الهجري، والإجازات الرسمية في مكان واحد
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
                منصة سعودية شاملة تجمع مواعيد صرف الرواتب الحكومية، حساب المواطن، الضمان الاجتماعي
                المطوّر، رواتب المتقاعدين، التقويم الهجري والميلادي، التقويم الدراسي، والإجازات
                الرسمية، مع أدوات تحويل التاريخ وحاسبة العمر — وفق تقويم أم القرى الرسمي.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/salaries" className="btn bg-gold-500 text-brand-900 hover:bg-gold-400">
                  <Coins className="h-4 w-4" />
                  مواعيد الرواتب
                </Link>
                <Link to="/countdown" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                  <Clock className="h-4 w-4" />
                  كم باقي؟
                </Link>
                <Link to="/today" className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                  <CalendarDays className="h-4 w-4" />
                  تاريخ اليوم
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

      {/* Stats bar */}
      <section className="container-page -mt-8 relative z-10">
        <div className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
          <Stat label="أقرب مناسبة" value={`${daysUntilEvent(nextEvent, today)} يوم`} sub={nextEvent.title} />
          <Stat label="أقرب إجازة" value={`${daysUntilEvent(nextHoliday, today)} يوم`} sub={nextHoliday.title} />
          <Stat label="المناسبات هذا العام" value={`${SAUDI_EVENTS.length}`} sub="مناسبة رسمية" />
          <Stat label="برامج الرواتب" value="5" sub="حكومية ومستحقة" />
        </div>
      </section>

      {/* Next event countdown */}
      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card overflow-hidden lg:col-span-2">
            <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-brand-900">العدّ التنازلي لأقرب مناسبة</h2>
                <span className={`chip ring-1 ${CATEGORY_STYLES[nextEvent.category]}`}>
                  {CATEGORY_LABELS[nextEvent.category]}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{nextEvent.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-900">{nextEvent.title}</h3>
                  <p className="mt-1 text-sm text-brand-700/80">
                    {formatGregorian(nextEvent.date)} — {eventHijriText(nextEvent)}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Countdown target={nextEvent.date} />
              </div>
              <p className="mt-5 text-sm leading-relaxed text-brand-700/80">{nextEvent.description}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-brand-900/5 bg-gradient-to-l from-gold-50 to-transparent px-6 py-4">
              <h2 className="font-display text-lg font-bold text-brand-900">أقرب إجازة رسمية</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{nextHoliday.emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-900">{nextHoliday.title}</h3>
                  <p className="mt-1 text-sm text-brand-700/80">
                    {formatGregorian(nextHoliday.date)} — {eventHijriText(nextHoliday)}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Countdown target={nextHoliday.date} />
              </div>
              {nextHoliday.holidayDays ? (
                <p className="mt-4 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-800">
                  مدة الإجازة المتوقعة: {nextHoliday.holidayDays} أيام
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

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
            icon={Clock}
            title="كم باقي؟"
            desc="18 عدّادًا تنازليًا لرمضان والعيد والرواتب والدراسة والمواسم السعودية."
            to="/countdown"
          />
          <ServiceCard
            icon={CalendarDays}
            title="تاريخ اليوم"
            desc="التاريخ الهجري والميلادي الآن في السعودية حسب تقويم أم القرى وتوقيت الرياض."
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
            desc="تقويم أم القرى الرسمي لكل الشهور الهجرية مع المناسبات الدينية والوطنية."
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
            desc="قائمة كاملة بالإجازات الدينية والوطنية مع مدة كل إجازة وتاريخها الهجري."
            to="/holidays"
          />
          <ServiceCard
            icon={Clock}
            title="تحويل التاريخ"
            desc="حوّل بين التاريخ الهجري والميلادي بدقة وفق تقويم أم القرى."
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

      {/* Salary schedule preview */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">مواعيد الصرف القادمة</h2>
            <p className="mt-1 text-sm text-brand-700/70">أقرب مواعيد صرف البرامج الحكومية والدعم</p>
          </div>
          <Link to="/salaries" className="btn-ghost">
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salaries.slice(0, 6).map((s) => (
            <SalaryMiniCard key={s.schedule.id} instance={s} to="/salaries" />
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">أقرب المناسبات</h2>
            <p className="mt-1 text-sm text-brand-700/70">مناسبات دينية ووطنية ودراسية قادمة</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => {
            const days = daysUntilEvent(e, today);
            return (
              <Link
                key={e.id}
                to={e.category === 'school' ? '/school-calendar' : '/holidays'}
                className="card group block p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{e.emoji}</span>
                  <span className={`chip ring-1 ${CATEGORY_STYLES[e.category]}`}>
                    {CATEGORY_LABELS[e.category]}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-brand-900">{e.title}</h3>
                <p className="mt-1 text-xs text-brand-700/70">
                  {formatGregorian(e.date)} — {eventHijriText(e)}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-2xl font-bold tabular-nums text-brand-700">{days}</span>
                  <span className="text-xs text-brand-600/70">يوم متبقي</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full gradient-brand transition-all group-hover:opacity-90"
                    style={{ width: `${Math.max(8, 100 - days * 2)}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Download CTA */}
      <section className="container-page mt-14">
        <div className="card overflow-hidden">
          <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-brand-900 sm:text-2xl">
                تحميل التقويم الهجري 1448هـ — PDF مجاني
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
                نسخة PDF كاملة جاهزة للطباعة والتشاريك، تشمل جميع المناسبات الدينية والوطنية والإجازات
                الرسمية وفق تقويم أم القرى الرسمي للعام الهجري 1448هـ (2026-2027م).
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link to="/hijri-calendar" className="btn-primary">
                <Download className="h-4 w-4" />
                تحميل التقويم PDF
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Articles + FAQ */}
      <section className="container-page mt-14">
        <AdSlot slot="1111111111" />
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
              التقويمات والمواعيد المهمة في المملكة العربية السعودية. نقدم لكم مواعيد صرف الرواتب
              الحكومية، حساب المواطن، الضمان الاجتماعي المطوّر، رواتب المتقاعدين، والدعم السكني،
              بالإضافة إلى التقويم الهجري والميلادي، التقويم الدراسي، وجميع المناسبات الوطنية والدينية.
            </p>
            <p>
              تعتمد البوابة على تقويم أم القرى الرسمي الصادر عن المملكة العربية السعودية كمرجع أساسي
              لتحديد مواعيد الإجازات الرسمية والمناسبات. توفر المنصة أيضاً أدوات تحويل التاريخ بين
              الهجري والميلادي، وحاسبة العمر بالسنوات والأشهر والأيام.
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

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-[11px] font-medium uppercase tracking-wide text-brand-600/70">{label}</div>
      <div className="mt-1 stat-num text-brand-700">{value}</div>
      <div className="mt-0.5 truncate text-xs text-brand-700/70">{sub}</div>
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
      <p className="mt-1 text-sm leading-relaxed text-brand-700/75">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
        اكتشف المزيد
        <ArrowLeft className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function SalaryMiniCard({ instance, to }: { instance: SalaryInstance; to: string }) {
  const Icon = ICONS[instance.schedule.icon] ?? Coins;
  return (
    <Link
      to={to}
      className="card group block p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${instance.schedule.accent} text-white`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-bold tabular-nums text-brand-700">
          {instance.daysRemaining}
          <span className="mr-1 text-xs font-medium text-brand-600/70">يوم</span>
        </span>
      </div>
      <h3 className="mt-3 font-display text-sm font-bold text-brand-900">{instance.schedule.title}</h3>
      <p className="mt-1 text-xs text-brand-700/70">
        {instance.gregorianText} — {instance.weekdayText}
      </p>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-brand-600/70">
        <TrendingUp className="h-3.5 w-3.5" />
        {instance.hijriText}
      </div>
    </Link>
  );
}
