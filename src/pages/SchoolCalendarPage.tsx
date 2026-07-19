import { BookOpen, GraduationCap, CalendarCheck } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { todayGregorian, formatGregorian, formatHijri, gregorianToHijri, weekdayName } from '../lib/hijri';
import { eventsByCategory, daysUntilEvent } from '../lib/events';
import Countdown from '../components/Countdown';

export default function SchoolCalendarPage() {
  const today = todayGregorian();
  const schoolEvents = [...eventsByCategory('school')].sort(
    (a, b) => a.date.year - b.date.year || a.date.month - b.date.month || a.date.day - b.date.day,
  );
  const next = schoolEvents.find((e) => daysUntilEvent(e, today) >= 0);

  useSeo({
    title: 'التقويم الدراسي 1448-1449هـ (2026-2027م) | تقويم السعودية',
    description:
      'التقويم الدراسي الرسمي للعام 1448-1449هـ (2026-2027م) وفق وزارة التعليم السعودية وتقويم أم القرى — مواعيد بداية الدراسة وإجازات المدارس لجميع مراحل التعليم.',
    canonical: 'https://alshafra.com/school-calendar',
    keywords: 'التقويم الدراسي, 1448, بداية الدراسة, إجازات المدارس, وزارة التعليم, التقويم المدرسي',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EventSeries',
      name: 'التقويم الدراسي 1448-1449هـ',
      startDate: '2026-08-23',
      endDate: '2027-05-27',
    },
  });

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="section-title">التقويم الدراسي 1448-1449هـ</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          التقويم الدراسي الرسمي وفق وزارة التعليم السعودية وتقويم أم القرى — مواعيد بداية الدراسة
          وإجازات المدارس لجميع مراحل التعليم العام في المملكة العربية السعودية.
        </p>
      </header>

      {next && (
        <section className="mt-8 card overflow-hidden">
          <div className="border-b border-brand-900/5 bg-gradient-to-l from-sky-50 to-transparent px-6 py-4">
            <h2 className="font-display text-lg font-bold text-brand-900">أقرب موعد دراسي</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{next.emoji}</span>
              <div>
                <h3 className="font-display text-xl font-bold text-brand-900">{next.title}</h3>
                <p className="mt-1 text-sm text-brand-700/80">
                  {formatGregorian(next.date)} — {next.hijriNote} — {weekdayName(next.date)}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Countdown target={next.date} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-brand-700/80">{next.description}</p>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-900">جدول التقويم الدراسي</h2>
        <div className="mt-4 space-y-4">
          {schoolEvents.map((e, idx) => {
            const h = gregorianToHijri(e.date.year, e.date.month, e.date.day);
            const days = daysUntilEvent(e, today);
            const isPast = days === 0 && new Date(e.date.year, e.date.month - 1, e.date.day) < new Date(today.year, today.month - 1, today.day);
            return (
              <div key={e.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <BookOpen className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-brand-900">{e.title}</span>
                      {e.isHoliday && (
                        <span className="chip bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                          <CalendarCheck className="h-3 w-3" />
                          إجازة {e.holidayDays} أيام
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-brand-700/70">
                      {formatGregorian(e.date)} — {formatHijri(h)} — {weekdayName(e.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:mr-auto sm:justify-end">
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold tabular-nums text-brand-700">
                      {isPast ? 'انتهت' : days}
                    </div>
                    <div className="text-[11px] text-brand-600/70">{isPast ? '' : 'يوم متبقي'}</div>
                  </div>
                  <span className="text-2xl">{e.emoji}</span>
                </div>
                {idx === 0 && <div className="hidden" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-brand-900">عن التقويم الدراسي</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/85">
              يُحدد التقويم الدراسي في المملكة العربية السعودية من قبل وزارة التعليم لجميع مراحل
              التعليم العام (الابتدائي، المتوسط، الثانوي) في جميع المناطق الإدارية. يتضمن التقويم
              مواعيد بداية ونهاية كل فصل دراسي، وإجازات منتصف الفصل، والإجازات الرسمية الدينية
              والوطنية. التقويم المعروض هنا تقريبي ولأغراض معلوماتية.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
