import { useState } from 'react';
import { Timer, CalendarDays, ArrowLeft, ExternalLink, Info, ListChecks } from 'lucide-react';
import { useSeo, SITE_URL } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Countdown from '../components/Countdown';
import { useRiyadhToday } from '../lib/useRiyadhToday';
import Link from '../components/Link';
import AdSlot from '../components/AdSlot';
import AdPlacement from '../components/AdPlacement';
import SmartlinkCard from '../components/SmartlinkCard';
import type { GregorianDate } from '../lib/hijri';
import { formatGregorian, formatHijri, gregorianToHijri, weekdayName, gregorianToJdn } from '../lib/hijri';
import { validIso } from '../lib/iso-date.mjs';
import {
  COUNTDOWN_CATEGORY_LABELS,
  COUNTDOWN_CATEGORY_STYLES,
  getCountdown,
  getCountdownNotice,
  isoDate,
  resolveAll,
  resolveCountdown,
  resolveRelated,
  type CountdownCategory,
  type ResolvedCountdown,
} from '../lib/countdowns';

/* -------------------------------------------------------------------------- */
/* Hub: /countdown                                                             */
/* -------------------------------------------------------------------------- */

type Filter = 'all' | CountdownCategory;

export function CountdownHubPage() {
  const today = useRiyadhToday();
  const [filter, setFilter] = useState<Filter>('all');
  const all = resolveAll(today);

  const list = all.filter((c) => (filter === 'all' ? true : c.def.category === filter));
  const nearest = all.find((c) => c.date);

  useSeo({
    title: 'كم باقي على… | عدّادات تنازلية للمناسبات والرواتب في السعودية',
    description:
      'عدّادات ومواعيد دراسية ومناسبات بتوقيت الرياض، مع بيان حالة الموعد؛ الرواتب والدعم بانتظار التحقق.',
    canonical: `${SITE_URL}/countdown`,
    keywords:
      'كم باقي على رمضان, كم باقي على العيد, كم باقي على الراتب, كم باقي على اليوم الوطني, عداد تنازلي, كم باقي على حساب المواطن, كم باقي على الدراسة',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'العدّادات التنازلية في تقويم السعودية',
        itemListElement: list.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.def.question,
          url: `${SITE_URL}/countdown/${c.def.slug}`,
        })),
      },
    ],
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'religious', label: 'دينية' },
    { key: 'national', label: 'وطنية' },
    { key: 'salary', label: 'الرواتب والدعم' },
    { key: 'school', label: 'دراسية' },
    { key: 'seasonal', label: 'مواسم' },
  ];

  return (
    <div className="container-page py-10">
      <div className="grid items-start gap-8">
        <div className="min-w-0">
          <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'كم باقي على…' }]} />

          <header className="mt-4 max-w-2xl">
            <h1 className="section-title">كم باقي على…؟ عدّادات تنازلية سعودية</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
              {COUNTDOWNS_INTRO}
            </p>
          </header>

      {nearest && (
        <section className="mt-8 card overflow-hidden">
          <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
            <h2 className="font-display text-lg font-bold text-brand-900">أقرب موعد قادم</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{nearest.def.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-900">{nearest.displayTitle}</h3>
                  <p className="mt-1 text-sm text-brand-700/80">
                    {nearest.gregorianText} — {nearest.hijriText} — {nearest.weekdayText}
                  </p>
                  <p className="mt-1 text-xs text-brand-700/80">{getCountdownNotice(nearest.def)}</p>
                  <Link
                    to={`/countdown/${nearest.def.slug}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                  >
                    تفاصيل العدّاد
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <div className="sm:w-72">
                {nearest.date && <Countdown target={nearest.date} />}
              </div>
            </div>
          </div>
        </section>
      )}

      <CustomCountdown today={today} />

      <div className="mt-8 flex flex-wrap gap-2" aria-label="تصفية العدادات حسب النوع">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`chip ring-1 transition-colors ${
              filter === f.key
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-brand-700 ring-brand-200 hover:bg-brand-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <CountdownCard key={c.def.slug} item={c} />
        ))}
      </section>

          <section className="mt-10 card p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-brand-900">كيف تُحسب هذه العدّادات؟</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
              <p>
                المناسبات الدينية تُحسب من تاريخها الهجري باستخدام تقويم أم القرى الذي يوفره المتصفح،
                أو حساب تقريبي عند عدم توفره (مثلاً عيد الأضحى = 10 ذو الحجة)،
                والمناسبات الوطنية من تاريخها الميلادي الثابت. مواعيد الرواتب والدعم بانتظار
                التحقق من الجهة المعنية، والمواعيد الدراسية من صفحة وزارة التعليم عند آخر مراجعة.
              </p>
              <p>
                جميع الأيام تُحسب بتوقيت الرياض (UTC+3) حتى يرى الزائر داخل المملكة وخارجها الرقم
                نفسه. التواريخ الدينية تبقى مرتبطة بإعلان رؤية الهلال وقد تختلف عن الحساب.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CustomCountdown({ today }: { today: GregorianDate }) {
  const [value, setValue] = useState('');
  const valid = validIso(value);
  const [year, month, day] = valid ? value.split('-').map(Number) : [0, 0, 0];
  const target = { year, month, day };
  const days = valid ? gregorianToJdn(year, month, day) - gregorianToJdn(today.year, today.month, today.day) : 0;
  return (
    <section className="mt-8 card p-6" aria-labelledby="custom-countdown-title">
      <h2 id="custom-countdown-title" className="font-display text-lg font-bold text-brand-900">عدّ تنازلي لتاريخ تختاره</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-700/80">اختر تاريخاً ميلادياً من 1900 إلى 2100. ينتهي العد عند بداية ذلك اليوم بتوقيت الرياض (UTC+3)، وليس عند ساعة محددة.</p>
      <label className="mt-4 block max-w-sm text-sm font-medium text-brand-800">التاريخ المطلوب
        <input type="date" min="1900-01-01" max="2100-12-31" value={value} onChange={event => setValue(event.target.value)} className="mt-2 block w-full rounded-xl bg-sand-50 px-3 py-2.5 text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500" />
      </label>
      {value && !valid && <p role="alert" className="mt-4 text-sm text-rose-700">أدخل تاريخاً صحيحاً بين عامي 1900 و2100.</p>}
      {valid && days < 0 && <p role="status" className="mt-4 text-sm text-brand-700">هذا التاريخ مضى بتوقيت الرياض. اختر تاريخاً آخر لبدء العدّ.</p>}
      {valid && days === 0 && <p role="status" className="mt-4 text-sm text-brand-700">بدأ هذا اليوم بالفعل بتوقيت الرياض.</p>}
      {valid && days > 0 && <div className="mt-4 max-w-lg">
        <p className="mb-3 text-sm text-brand-700">حتى بداية {weekdayName(target)}، {formatGregorian(target)} — بعد {days} يوم تقويمي.</p>
        <Countdown target={target} />
      </div>}
    </section>
  );
}

const COUNTDOWNS_INTRO =
  'عدّادات بتوقيت الرياض للمناسبات والمواسم والمواعيد الدراسية المتاحة؛ الرواتب والدعم بانتظار التحقق. المواعيد الدينية حسابية وليست إعلاناً رسمياً.';

function CountdownCard({ item }: { item: ResolvedCountdown }) {
  return (
    <article className="card group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{item.def.emoji}</span>
        <span className={`chip ring-1 ${COUNTDOWN_CATEGORY_STYLES[item.def.category]}`}>
          {COUNTDOWN_CATEGORY_LABELS[item.def.category]}
        </span>
      </div>
      <h3 className="mt-3 font-display text-base font-bold text-brand-900">
        <Link to={`/countdown/${item.def.slug}`} className="hover:text-brand-600">
          {item.def.question}
        </Link>
      </h3>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-700/70">
        <CalendarDays className="h-3.5 w-3.5" />
        {item.date ? `${item.gregorianText} — ${item.hijriText}` : 'يُحدَّث قريباً'}
      </div>
      {item.date && <p className="mt-2 text-xs leading-relaxed text-brand-700/80">{getCountdownNotice(item.def)}</p>}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-700/80">{item.def.summary}</p>
      <div className="mt-4 flex items-center justify-between border-t border-brand-900/5 pt-3">
        <span className="text-xs text-brand-600/70">{item.date ? item.weekdayText : '—'}</span>
        <span className="font-display text-lg font-bold tabular-nums text-brand-700">
          {item.date ? `${item.daysRemaining} يوم` : '—'}
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail: /countdown/:slug                                                    */
/* -------------------------------------------------------------------------- */

export default function CountdownDetailPage({ slug }: { slug: string }) {
  const today = useRiyadhToday();
  const def = getCountdown(slug);

  if (!def) return <CountdownNotFound />;

  const item = resolveCountdown(def, today);
  const related = resolveRelated(def, today);
  const title = `${def.question} العدّ التنازلي | تقويم السعودية`;
  const description = `${def.question} — ${def.summary}`;

  return (
    <CountdownDetailView
      item={item}
      related={related}
      title={title}
      description={description}
      today={today}
    />
  );
}

function CountdownDetailView({
  item,
  related,
  title,
  description,
  today,
}: {
  item: ResolvedCountdown;
  related: ResolvedCountdown[];
  title: string;
  description: string;
  today: GregorianDate;
}) {
  const { def } = item;

  useSeo({
    title,
    description,
    canonical: `${SITE_URL}/countdown/${def.slug}`,
    keywords: def.keywords,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: def.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'كم باقي على…', path: '/countdown' },
          { name: def.title },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <span className={`chip ring-1 ${COUNTDOWN_CATEGORY_STYLES[def.category]}`}>
          <Timer className="h-3.5 w-3.5" />
          {COUNTDOWN_CATEGORY_LABELS[def.category]}
        </span>
        <h1 className="section-title mt-3">
          <span className="ml-2">{def.emoji}</span>
          {def.question}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">{def.summary}</p>
      </header>

      <section className="mt-8 card overflow-hidden">
        <div className={`bg-gradient-to-l ${def.accent} px-6 py-5 text-white`}>
          <h2 className="font-display text-xl font-bold">{item.displayTitle}</h2>
          {item.date ? (
            <p className="mt-1 text-sm text-white/85">
              {item.weekdayText} — {item.gregorianText} — {item.hijriText}
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/85">لا يتوفر موعد مؤكد لهذا العدّاد حالياً.</p>
          )}
        </div>
        <div className="p-6">
          {item.date ? (
            <>
              <p className="mb-4 text-sm leading-relaxed text-brand-700/80">{getCountdownNotice(def)}</p>
              <Countdown target={item.date} />
              <p className="mt-4 text-center text-sm text-brand-700/80">
                الفارق بين تاريخ اليوم وتاريخ المناسبة: <strong className="font-display text-brand-800">{item.daysRemaining}</strong> يوم تقويمي. العدّاد أعلاه يعرض الأيام الكاملة والساعات المتبقية حتى بداية التاريخ بتوقيت الرياض. اليوم ({formatGregorian(today)} — {formatHijri(gregorianToHijri(today.year, today.month, today.day))}
                {' '}— {weekdayName(today)}).
              </p>
            </>
          ) : (
            <p className="text-sm text-brand-700/80">
              لا يتوفر موعد مؤكد لهذا العدّاد حالياً. راجع تفاصيل الصفحة والمصدر المرتبط بها إن وُجد.
            </p>
          )}
        </div>
      </section>

      <AdSlot slot="countdown" />
      <AdPlacement name="content" unit="native" />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-brand-900">التفاصيل</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
            {def.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {def.source && (
            <a
              href={def.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              المصدر: {def.source.label}
            </a>
          )}
        </section>

        <aside className="space-y-6">
          <AdPlacement name="sidebar" />
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-brand-900">
              <Info className="h-4 w-4 text-brand-600" />
              معلومات سريعة
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-700/85">
              {def.notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>

          {item.upcoming.length > 1 && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-brand-900">
                <ListChecks className="h-4 w-4 text-brand-600" />
                المواعيد القادمة
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-brand-700/85">
                {item.upcoming.map((d) => (
                  <li key={isoDate(d)} className="flex items-center justify-between gap-2 border-b border-brand-900/5 pb-2 last:border-0 last:pb-0">
                    <span>{formatGregorian(d)}</span>
                    <span className="text-xs text-brand-600/70">{weekdayName(d)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <section className="mt-8 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">الأسئلة الشائعة</h2>
        <div className="mt-4 space-y-4">
          {def.faq.map((f) => (
            <div key={f.q} className="border-b border-brand-900/5 pb-4 last:border-0 last:pb-0">
              <h3 className="font-display text-sm font-bold text-brand-800">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-700/85">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-brand-900">عدّادات ذات صلة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <CountdownCard key={r.def.slug} item={r} />
            ))}
          </div>
        </section>
      )}

      <SmartlinkCard variant="inline" className="mt-8" />

      <div className="mt-8">
        <Link to="/countdown" className="btn btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          كل العدّادات التنازلية
        </Link>
      </div>
    </div>
  );
}

function CountdownNotFound() {
  useSeo({
    title: 'العدّاد غير موجود | تقويم السعودية',
    description: 'لم نعثر على العدّاد التنازلي المطلوب. تصفّح جميع العدّادات المتاحة في تقويم السعودية.',
    canonical: `${SITE_URL}/countdown`,
  });

  return (
    <div className="container-page py-16 text-center">
      <h1 className="section-title">لم نعثر على هذا العدّاد</h1>
      <p className="mt-2 text-sm text-brand-700/80">
        قد يكون الرابط قديماً أو مكتوباً بشكل خاطئ. تصفّح جميع العدّادات التنازلية المتاحة.
      </p>
      <Link to="/countdown" className="btn btn-primary mt-6">
        كل العدّادات التنازلية
      </Link>
    </div>
  );
}
