import { useState } from 'react';
import { Flag, Calendar, Star } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { todayGregorian, formatGregorian, formatHijri, gregorianToHijri, weekdayName } from '../lib/hijri';
import {
  SAUDI_EVENTS,
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  daysUntilEvent,
  eventHijriText,
  holidayDurationText,
  nextHolidayAfter,
} from '../lib/events';
import Countdown from '../components/Countdown';

type Filter = 'all' | 'religious' | 'national' | 'school';

export default function HolidaysPage() {
  const today = todayGregorian();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = SAUDI_EVENTS.filter((e) => {
    if (filter === 'all') return e.isHoliday;
    return e.category === filter;
  }).sort(
    (a, b) =>
      new Date(a.date.year, a.date.month - 1, a.date.day).getTime() -
      new Date(b.date.year, b.date.month - 1, b.date.day).getTime(),
  );

  // `daysUntilEvent` clamps to 0, so filtering on it used to keep events that
  // already happened and show them as «أقرب إجازة» with a frozen 00:00:00
  // countdown. `nextHolidayAfter` compares the real (signed) difference.
  const nextHoliday = nextHolidayAfter(today);

  useSeo({
    title: 'الإجازات الرسمية في السعودية 2026-2027 | تقويم السعودية',
    description:
      'قائمة كاملة بالإجازات الرسمية في المملكة العربية السعودية للعام 2026-2027م مع تواريخها الهجرية والميلادية ومدة كل إجازة. تشمل الإجازات الدينية والوطنية والإجازات الدراسية.',
    canonical: 'https://alshafra.com/holidays',
    keywords: 'الإجازات الرسمية, عطلات السعودية, إجازة عيد الفطر, إجازة عيد الأضحى, اليوم الوطني, يوم التأسيس',
    jsonLd: SAUDI_EVENTS.filter((e) => e.isHoliday).map((e) => {
      const startDate = `${e.date.year}-${String(e.date.month).padStart(2, '0')}-${String(e.date.day).padStart(2, '0')}`;
      const endDateObj = e.holidayDays && e.holidayDays > 1
        ? (() => {
            const d = new Date(e.date.year, e.date.month - 1, e.date.day + e.holidayDays - 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })()
        : startDate;
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: e.title,
        description: e.description,
        startDate,
        endDate: endDateObj,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: 'المملكة العربية السعودية',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'SA',
          },
        },
        organizer: {
          '@type': 'GovernmentOrganization',
          name: 'حكومة المملكة العربية السعودية',
          url: 'https://www.saudi.gov.sa',
        },
        inLanguage: 'ar-SA',
      };
    }),
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'religious', label: 'دينية' },
    { key: 'national', label: 'وطنية' },
    { key: 'school', label: 'دراسية' },
  ];

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'الإجازات الرسمية' }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="section-title">الإجازات الرسمية في السعودية</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          قائمة كاملة بالإجازات الرسمية في المملكة العربية السعودية للعام 2026-2027م مع تواريخها
          الهجرية والميلادية ومدة كل إجازة، تشمل الإجازات الدينية والوطنية والإجازات الدراسية.
        </p>
      </header>

      {nextHoliday && (
        <section className="mt-8 card overflow-hidden">
          <div className="border-b border-brand-900/5 bg-gradient-to-l from-gold-50 to-transparent px-6 py-4">
            <h2 className="font-display text-lg font-bold text-brand-900">أقرب إجازة رسمية</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{nextHoliday.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-brand-900">{nextHoliday.title}</h3>
                  <p className="mt-1 text-sm text-brand-700/80">
                    {formatGregorian(nextHoliday.date)} — {eventHijriText(nextHoliday)} — {weekdayName(nextHoliday.date)}
                  </p>
                  {nextHoliday.holidayDays && (
                    <span className="chip mt-2 bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                      <Star className="h-3 w-3" />
                      مدة الإجازة: {holidayDurationText(nextHoliday.holidayDays)}
                    </span>
                  )}
                </div>
              </div>
              <div className="sm:w-64">
                <Countdown target={nextHoliday.date} />
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-brand-700/80">{nextHoliday.description}</p>
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
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

      {/* List */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const h = gregorianToHijri(e.date.year, e.date.month, e.date.day);
          const days = daysUntilEvent(e, today);
          const isPast = new Date(e.date.year, e.date.month - 1, e.date.day) < new Date(today.year, today.month - 1, today.day);
          return (
            <article key={e.id} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{e.emoji}</span>
                <span className={`chip ring-1 ${CATEGORY_STYLES[e.category]}`}>
                  {CATEGORY_LABELS[e.category]}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-brand-900">{e.title}</h3>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-700/70">
                <Calendar className="h-3.5 w-3.5" />
                {formatGregorian(e.date)} — {formatHijri(h)}
              </div>
              <div className="mt-1 text-xs text-brand-700/60">{weekdayName(e.date)}</div>
              <p className="mt-3 text-sm leading-relaxed text-brand-700/80 line-clamp-3">{e.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-brand-900/5 pt-3">
                {e.isHoliday && e.holidayDays ? (
                  <span className="chip bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                    <Flag className="h-3 w-3" />
                    {holidayDurationText(e.holidayDays)}
                  </span>
                ) : (
                  <span className="text-xs text-brand-600/60">مناسبة</span>
                )}
                <span className="font-display text-lg font-bold tabular-nums text-brand-700">
                  {isPast ? 'انتهت' : `${days} يوم`}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">عن الإجازات الرسمية في السعودية</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            تُحدد الإجازات الرسمية في المملكة العربية السعودية وفق تقويم أم القرى وتشمل الإجازات
            الدينية (رأس السنة الهجرية، المولد النبوي، عيد الفطر، عرفة، عيد الأضحى) والإجازات الوطنية
            (يوم التأسيس، يوم العلم، اليوم الوطني) والإجازات الدراسية وفق تقويم وزارة التعليم.
          </p>
          <p>
            تُعلن الإجازات الرسمية من قبل الجهات المختصة وقد تختلف مدتها من عام لآخر. التواريخ
            المعروضة هنا تقريبية ولأغراض معلوماتية، ويُنصح بمتابعة الإعلانات الرسمية.
          </p>
        </div>
      </section>
    </div>
  );
}
