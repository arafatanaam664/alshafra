import { useMemo, useState } from 'react';
import { Cake, CalendarDays, Sparkles } from 'lucide-react';
import { useSeo } from '../lib/seo';
import {
  gregorianToHijri,
  formatGregorian,
  gregorianToJdn,
  todayGregorian,
  type GregorianDate,
  GREGORIAN_MONTHS,
} from '../lib/hijri';

export default function AgeCalculatorPage() {
  const today = todayGregorian();
  const [birth, setBirth] = useState<GregorianDate>({ year: 2000, month: 1, day: 1 });

  useSeo({
    title: 'حاسبة العمر بالهجري والميلادي | تقويم السعودية',
    description:
      'احسب عمرك بدقة بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي. أدخل تاريخ ميلادك واحصل على عمرك الكامل والقادم مع عدد الأيام التي عشتها.',
    canonical: 'https://saudicalendar.sa/age-calculator',
    keywords: 'حاسبة العمر, حساب العمر, العمر بالهجري, العمر بالميلادي, كم عمري',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'حاسبة العمر',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      inLanguage: 'ar-SA',
    },
  });

  const result = useMemo(() => {
    const birthJdn = gregorianToJdn(birth.year, birth.month, birth.day);
    const todayJdn = gregorianToJdn(today.year, today.month, today.day);
    const totalDays = Math.max(0, todayJdn - birthJdn);
    if (totalDays <= 0) return null;

    // Gregorian age
    let yearsG = today.year - birth.year;
    let monthsG = today.month - birth.month;
    let daysG = today.day - birth.day;
    if (daysG < 0) {
      monthsG -= 1;
      const prevMonth = today.month === 1 ? 12 : today.month - 1;
      const prevYear = today.month === 1 ? today.year - 1 : today.year;
      const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();
      daysG += daysInPrev;
    }
    if (monthsG < 0) {
      yearsG -= 1;
      monthsG += 12;
    }

    // Hijri age
    const birthH = gregorianToHijri(birth.year, birth.month, birth.day);
    const todayH = gregorianToHijri(today.year, today.month, today.day);
    let yearsH = todayH.year - birthH.year;
    let monthsH = todayH.month - birthH.month;
    let daysH = todayH.day - birthH.day;
    if (daysH < 0) {
      monthsH -= 1;
      daysH += 30;
    }
    if (monthsH < 0) {
      yearsH -= 1;
      monthsH += 12;
    }
    if (yearsH < 0) yearsH = 0;

    // Next birthday (gregorian)
    let nextBYear = today.year;
    if (today.month > birth.month || (today.month === birth.month && today.day > birth.day)) {
      nextBYear = today.year + 1;
    }
    const nextBirthday: GregorianDate = { year: nextBYear, month: birth.month, day: birth.day };
    const daysToBirthday = Math.max(0, gregorianToJdn(nextBirthday.year, nextBirthday.month, nextBirthday.day) - todayJdn);

    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalWeeks = Math.floor(totalDays / 7);

    return {
      yearsG,
      monthsG,
      daysG,
      yearsH,
      monthsH,
      daysH,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      daysToBirthday,
      nextBirthday,
    };
  }, [birth, today]);

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="section-title">حاسبة العمر بالهجري والميلادي</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          أدخل تاريخ ميلادك بالتقويم الميلادي لتحصل على عمرك بالسنوات والأشهر والأيام بالتقويمين
          الهجري والميلادي، بالإضافة إلى عدد الأيام والأسابيع والساعات التي عشتها، وعدد الأيام
          المتبقية على عيد ميلادك القادم.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-brand-900">تاريخ الميلاد</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-brand-700/80">اليوم</span>
              <select
                className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
                value={birth.day}
                onChange={(e) => setBirth({ ...birth, day: +e.target.value })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-brand-700/80">الشهر</span>
              <select
                className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
                value={birth.month}
                onChange={(e) => setBirth({ ...birth, month: +e.target.value })}
              >
                {GREGORIAN_MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-brand-700/80">السنة</span>
              <input
                type="number"
                className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
                value={birth.year}
                min={1900}
                max={today.year}
                onChange={(e) => setBirth({ ...birth, year: +e.target.value })}
              />
            </label>
          </div>
          <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
            تاريخ الميلاد المُدخل: <strong>{formatGregorian(birth)}</strong>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
            <h2 className="font-display text-lg font-bold text-brand-900">النتيجة</h2>
          </div>
          <div className="p-6">
            {!result ? (
              <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                <Cake className="h-5 w-5" />
                تاريخ الميلاد يجب أن يكون قبل اليوم.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <BigStat value={result.yearsG} label="سنة ميلادية" />
                  <BigStat value={result.monthsG} label="شهر" />
                  <BigStat value={result.daysG} label="يوم" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <BigStat value={result.yearsH} label="سنة هجرية" accent />
                  <BigStat value={result.monthsH} label="شهر هجري" accent />
                  <BigStat value={result.daysH} label="يوم هجري" accent />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat icon={CalendarDays} label="إجمالي الأيام" value={result.totalDays.toLocaleString('ar-SA')} />
                  <MiniStat icon={Sparkles} label="إجمالي الأسابيع" value={result.totalWeeks.toLocaleString('ar-SA')} />
                  <MiniStat icon={CalendarDays} label="إجمالي الساعات" value={result.totalHours.toLocaleString('ar-SA')} />
                  <MiniStat icon={Cake} label="عيد ميلادك القادم بعد" value={`${result.daysToBirthday} يوم`} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">عن حاسبة العمر</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            تحسب هذه الأداة عمرك بالتقويم الميلادي والهجري بدقة، مع عرض الفرق بالأيام والشهور
            والسنوات. كما تحسب عدد الأيام والأسابيع والساعات الكلية التي عشتها منذ تاريخ ميلادك،
            وعدد الأيام المتبقية على عيد ميلادك القادم.
          </p>
          <p>
            الحساب الهجري يعتمد على تقويم أم القرى التقريبي، وقد يختلف بيوم واحد عن التقويم الرسمي
            قرب بدايات الأشهر الهجرية.
          </p>
        </div>
      </section>
    </div>
  );
}

function BigStat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? 'bg-gradient-to-b from-brand-600 to-brand-700 text-white' : 'bg-sand-50 text-brand-900 ring-1 ring-brand-900/5'}`}>
      <div className="font-display text-3xl font-bold tabular-nums">{value}</div>
      <div className={`mt-0.5 text-[11px] ${accent ? 'text-brand-50/80' : 'text-brand-600/70'}`}>{label}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-sand-50 p-3 ring-1 ring-brand-900/5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[11px] text-brand-600/70">{label}</div>
        <div className="font-display text-sm font-bold text-brand-900">{value}</div>
      </div>
    </div>
  );
}
