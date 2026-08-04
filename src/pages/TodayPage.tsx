import { CalendarDays, Clock, Globe2, Moon, Sun } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { useNow } from '../lib/useNow';
import {
  formatGregorian,
  formatGregorianShort,
  formatHijri,
  formatHijriShort,
  gregorianToHijri,
  todayGregorian,
  weekdayName,
} from '../lib/hijri';
import Link from '../components/Link';

export default function TodayPage() {
  const now = useNow(1000);
  const today = todayGregorian();
  const hijri = gregorianToHijri(today.year, today.month, today.day);
  const weekday = weekdayName(today);

  useSeo({
    title: 'تاريخ اليوم هجري وميلادي في السعودية | تقويم السعودية',
    description:
      'اعرف تاريخ اليوم في السعودية الآن بالتقويم الهجري والميلادي، مع اليوم من الأسبوع والوقت الحالي حسب توقيت المملكة العربية السعودية.',
    canonical: 'https://alshafra.com/today',
    keywords: 'تاريخ اليوم, تاريخ اليوم هجري, تاريخ اليوم ميلادي, التقويم الهجري اليوم, السعودية اليوم',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'تاريخ اليوم',
        inLanguage: 'ar-SA',
        url: 'https://alshafra.com/today',
      },
    ],
  });

  const timeString = now.toLocaleTimeString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div>
      <section className="relative overflow-hidden gradient-brand text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-page relative py-14 sm:py-20">
          <span className="chip bg-white/15 text-white ring-1 ring-white/20">
            <CalendarDays className="h-3.5 w-3.5 text-gold-300" />
            التاريخ الآن في السعودية
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
            تاريخ اليوم هجري وميلادي
          </h1>
          <p className="mt-4 max-w-2xl text-brand-50/90">
            التاريخ الحالي حسب توقيت المملكة العربية السعودية وتقويم أم القرى، مع عرض التاريخين الهجري والميلادي والوقت المباشر.
          </p>
        </div>
      </section>

      <section className="container-page -mt-10 relative z-10">
        <div className="card p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <DateCard icon={Moon} label="التاريخ الهجري اليوم" value={formatHijri(hijri)} sub={formatHijriShort(hijri)} />
            <DateCard icon={Sun} label="التاريخ الميلادي اليوم" value={formatGregorian(today)} sub={formatGregorianShort(today)} />
            <DateCard icon={Clock} label="الوقت الآن" value={timeString} sub={`${weekday} — توقيت الرياض`} />
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-brand-900">ما هو تاريخ اليوم هجري؟</h2>
            <p className="mt-3 leading-relaxed text-brand-700/85">
              تاريخ اليوم هجريًا في السعودية هو <strong>{formatHijri(hijri)}</strong>، ويوافق ميلاديًا <strong>{formatGregorian(today)}</strong>.
              يتم احتساب التاريخ حسب تقويم أم القرى وتوقيت المملكة العربية السعودية.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-brand-900">أدوات مرتبطة</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/date-converter" className="btn-primary">تحويل التاريخ</Link>
              <Link to="/hijri-calendar" className="btn-ghost">التقويم الهجري</Link>
              <Link to="/countdown" className="btn-ghost">العدّادات التنازلية</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DateCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white to-sand-50 p-5 text-center ring-1 ring-brand-900/5">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-xs font-semibold text-brand-600/70">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-brand-900">{value}</div>
      <div className="mt-1 font-display text-sm tabular-nums text-brand-700/70">
        <Globe2 className="ml-1 inline h-3.5 w-3.5" />
        {sub}
      </div>
    </div>
  );
}
