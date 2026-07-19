import { useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { useSeo } from '../lib/seo';
import {
  HIJRI_MONTHS,
  ARABIC_WEEKDAYS,
  hijriToGregorian,
  gregorianToHijri,
  formatGregorian,
  weekdayIndex,
  hijriMonthLengths,
  type HijriDate,
} from '../lib/hijri';
import { SAUDI_EVENTS, CATEGORY_STYLES, CATEGORY_LABELS } from '../lib/events';

export default function HijriCalendarPage() {
  const today = gregorianToHijriFromToday();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);

  useSeo({
    title: 'التقويم الهجري 1448هـ — تقويم أم القرى الرسمي | تقويم السعودية',
    description:
      'التقويم الهجري الكامل وفق تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية، مع عرض جميع المناسبات الدينية والوطنية والإجازات الرسمية لكل شهر هجري.',
    canonical: 'https://saudicalendar.sa/hijri-calendar',
    keywords: 'التقويم الهجري, تقويم أم القرى, 1448هـ, التقويم الإسلامي, المناسبات الدينية',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Calendar',
      name: 'التقويم الهجري 1448هـ',
      calendarType: 'Hijri',
    },
  });

  const monthLength = hijriMonthLengths(year)[month - 1];
  const firstHijri: HijriDate = { year, month, day: 1 };
  const firstGreg = hijriToGregorian(firstHijri);
  const firstWeekday = weekdayIndex(firstGreg);

  const eventsThisMonth = SAUDI_EVENTS.filter((e) => {
    const h = gregorianToHijri(e.date.year, e.date.month, e.date.day);
    return h.year === year && h.month === month;
  });

  const eventByDay = useMemo(() => {
    const map = new Map<number, typeof SAUDI_EVENTS[number]>();
    for (const e of eventsThisMonth) {
      const h = gregorianToHijri(e.date.year, e.date.month, e.date.day);
      map.set(h.day, e);
    }
    return map;
  }, [eventsThisMonth, year, month]);

  const cells: (HijriDate | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= monthLength; d++) cells.push({ year, month, day: d });

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="section-title">التقويم الهجري — تقويم أم القرى</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          التقويم الهجري الكامل وفق تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية، مع
          عرض المناسبات الدينية والوطنية والإجازات الرسمية لكل شهر.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
            <button onClick={prevMonth} className="btn-ghost" aria-label="الشهر السابق">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="text-center">
              <div className="font-display text-xl font-bold text-brand-900">
                {HIJRI_MONTHS[month - 1]} {year}هـ
              </div>
              <div className="text-xs text-brand-600/70">
                {formatGregorian(hijriToGregorian({ year, month, day: 1 }))} —{' '}
                {formatGregorian(hijriToGregorian({ year, month, day: monthLength }))}
              </div>
            </div>
            <button onClick={nextMonth} className="btn-ghost" aria-label="الشهر التالي">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {ARABIC_WEEKDAYS.map((d) => (
                <div key={d} className="py-2 text-xs font-semibold text-brand-700/70">
                  {d}
                </div>
              ))}
              {cells.map((c, i) => {
                if (!c) return <div key={`empty-${i}`} />;
                const greg = hijriToGregorian(c);
                const event = eventByDay.get(c.day);
                const isToday =
                  c.year === today.year && c.month === today.month && c.day === today.day;
                return (
                  <div
                    key={`${c.year}-${c.month}-${c.day}`}
                    className={`relative flex min-h-[64px] flex-col items-center justify-start rounded-xl p-2 text-sm transition-colors ${
                      isToday
                        ? 'bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-soft'
                        : event
                        ? 'bg-gold-50 text-brand-900 ring-1 ring-gold-200'
                        : 'bg-sand-50 text-brand-900 ring-1 ring-brand-900/5 hover:bg-brand-50'
                    }`}
                  >
                    <span className="font-display font-bold">{c.day}</span>
                    <span className={`text-[10px] ${isToday ? 'text-brand-50/80' : 'text-brand-600/60'}`}>
                      {greg.day}/{greg.month}
                    </span>
                    {event && (
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-500" title={event.title} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-brand-900">مناسبات الشهر</h2>
            {eventsThisMonth.length === 0 ? (
              <p className="mt-3 text-sm text-brand-700/70">لا توجد مناسبات رسمية في هذا الشهر.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {eventsThisMonth.map((e) => {
                  const h = gregorianToHijri(e.date.year, e.date.month, e.date.day);
                  return (
                    <li key={e.id} className="flex items-start gap-3">
                      <span className="text-xl">{e.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold text-brand-900">{e.title}</div>
                        <div className="text-xs text-brand-700/70">
                          {h.day} {HIJRI_MONTHS[h.month - 1]} — {formatGregorian(e.date)}
                        </div>
                        <span className={`chip mt-1 ring-1 ${CATEGORY_STYLES[e.category]}`}>
                          {CATEGORY_LABELS[e.category]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-brand-900">تحميل التقويم</h2>
            <p className="mt-2 text-xs text-brand-700/70">
              حمّل التقويم الهجري 1448هـ بصيغة PDF مجاناً جاهز للطباعة والتشاريك.
            </p>
            <button className="btn-primary mt-4 w-full" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              تحميل / طباعة PDF
            </button>
          </div>
        </div>
      </div>

      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">عن التقويم الهجري وأم القرى</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            التقويم الهجري هو التقويم الرسمي المعتمد في المملكة العربية السعودية، ويُعدّ المرجع الأساسي
            لتحديد مواعيد الإجازات الرسمية والمناسبات الوطنية والدينية. يبدأ العام الهجري 1448 في
            يونيو 2026 ويمتد حتى يونيو 2027م وفق تقويم أم القرى الصادر عن المملكة.
          </p>
          <p>
            يُسمى التقويم الرسمي «تقويم أم القرى» نسبة إلى مدينة مكة المكرمة، ويُحسب فلكياً لتحديد
            بدايات الأشهر الهجرية. التواريخ المعروضة هنا تقريبية وقد تختلف بيوم واحد عن الإعلان
            الرسمي لرؤية الهلال.
          </p>
        </div>
      </section>
    </div>
  );
}

function gregorianToHijriFromToday(): HijriDate {
  const d = new Date();
  return gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
