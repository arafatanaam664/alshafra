import { useMemo, useState } from 'react';
import { daysBetween, gregorianToHijri, todayGregorian, type GregorianDate } from '@alshafra/calendar';

export default function AgeCalculatorIsland() {
  const today = todayGregorian();
  const [birth, setBirth] = useState<GregorianDate>({ year: today.year - 20, month: 1, day: 1 });
  const age = useMemo(() => {
    const total = Math.max(0, daysBetween(birth, today));
    const years = Math.floor(total / 365);
    return { total, years, hijri: gregorianToHijri(birth.year, birth.month, birth.day) };
  }, [birth, today]);

  return (
    <div className="card my-6 p-6">
      <h2 className="font-display text-lg font-bold">تاريخ الميلاد الميلادي</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" type="number" value={birth.day} onChange={(e) => setBirth({ ...birth, day: +e.target.value })} />
        <input className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" type="number" value={birth.month} onChange={(e) => setBirth({ ...birth, month: +e.target.value })} />
        <input className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" type="number" value={birth.year} onChange={(e) => setBirth({ ...birth, year: +e.target.value })} />
      </div>
      <p className="mt-4 text-sm">تقريباً {age.years} سنة ميلادية ({age.total} يوماً). المقابل الهجري للميلاد: {age.hijri.year}-{String(age.hijri.month).padStart(2,'0')}-{String(age.hijri.day).padStart(2,'0')}</p>
    </div>
  );
}
