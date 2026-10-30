import { useSeo } from '../lib/seo';
import schoolCalendar from '../data/school-calendar.json';
import Link from '../components/Link';
import { useRiyadhToday } from '../lib/useRiyadhToday';
import { approvedSchoolEvents } from '../lib/school-trust.mjs';

const weekday = new Intl.DateTimeFormat('ar-SA', { weekday: 'long', timeZone: 'Asia/Riyadh' });
const dateFormat = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' });

export default function SchoolCalendarPage() {
  const today = useRiyadhToday();
  const events = approvedSchoolEvents(schoolCalendar, today);
  useSeo({
    title: 'التقويم الدراسي 1448-1449هـ (2026-2027م) | تقويم السعودية',
    description: 'مواعيد بداية الدراسة وإجازات المدارس 1448-1449هـ حسب صفحة التقويم الدراسي لوزارة التعليم، مع رابط المصدر وتاريخ المراجعة.',
    canonical: 'https://alshafra.com/school-calendar',
  });

  return (
    <div className="container-page py-10">
      <header className="max-w-3xl">
        <h1 className="section-title">التقويم الدراسي 1448-1449هـ (2026-2027م)</h1>
        <p className="mt-3 leading-relaxed text-brand-700/80">راجع صفحة وزارة التعليم للمواعيد الرسمية. لا يعرض الموقع موعداً قبل مراجعة فريق التحرير واعتماده.</p>
      </header>
      <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">
        <p>{schoolCalendar.notice}</p>
        <p className="mt-2">آخر تحقق: {schoolCalendar.verifiedAt} · <a className="underline" href={schoolCalendar.source} target="_blank" rel="noopener noreferrer">صفحة التقويم الدراسي بوزارة التعليم</a></p>
      </div>
      <section className="mt-8" aria-labelledby="school-dates">
        <h2 id="school-dates" className="font-display text-xl font-bold">مواعيد الدراسة والإجازات المدرسية</h2>
        {events.length === 0 ? <p role="status" className="mt-4 text-sm text-brand-800">المواعيد بانتظار التحقق والاعتماد؛ راجع صفحة الوزارة أعلاه.</p> : <div className="mt-4 overflow-x-auto rounded-xl bg-white ring-1 ring-brand-900/10">
          <table className="w-full min-w-[34rem] text-right text-sm">
            <caption className="sr-only">مواعيد التقويم الدراسي وتواريخها كما في وزارة التعليم</caption>
            <thead className="bg-brand-50"><tr><th scope="col" className="p-4">المناسبة</th><th scope="col" className="p-4">اليوم والميلادي</th><th scope="col" className="p-4">الهجري كما في المصدر</th></tr></thead>
            <tbody>{events.map((event) => {
              const [year, month, day] = event.date.split('-').map(Number);
              const instant = new Date(Date.UTC(year, month - 1, day, 12));
              return <tr key={event.id} className="border-t border-brand-900/10"><th scope="row" className="p-4 font-semibold">{event.title}<span className="mt-1 block text-xs font-normal">التحقق {event.verification.verifiedAt} · الاعتماد {event.verification.approvedAt} · المراجعة {event.verification.reviewDue}</span>{'countdownSlug' in event && <span className="mt-1 block font-normal"><Link className="text-brand-700 underline" to={`/countdown/${event.countdownSlug}`}>عرض العداد</Link></span>}</th><td className="p-4">{weekday.format(instant)}، {dateFormat.format(instant)}</td><td className="p-4"><span dir="ltr">{event.hijri}</span> هـ</td></tr>;
            })}</tbody>
          </table>
        </div>}
        {events.length > 0 && events.length < schoolCalendar.events.length && <p className="mt-4 text-sm text-brand-800">بعض المواعيد الأخرى بانتظار الاعتماد أو تجديد المراجعة؛ راجع وزارة التعليم.</p>}
        <p className="mt-4 text-sm leading-relaxed text-brand-700/80">الفئة: المدارس، مع تحديد عودة المعلمين في صفها. كل موعد معروض معتمد للمراجعة حتى تاريخ انتهائها ولا يغني عن متابعة تحديثات الوزارة. لم تُحدّد في الصفحة المعروضة هنا آخر أيام الإجازات أو العودة منها؛ لا نستنتجها من تاريخ البداية. راجع الوزارة وإدارة التعليم المختصة لأي تحديث.</p>
      </section>
    </div>
  );
}
