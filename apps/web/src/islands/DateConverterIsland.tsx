import { useMemo, useState } from 'react';
import {
  formatGregorian,
  formatHijri,
  gregorianToHijri,
  hijriToGregorian,
  todayGregorian,
  todayHijri,
  weekdayName,
  GREGORIAN_MONTHS,
  HIJRI_MONTHS,
  type GregorianDate,
  type HijriDate,
} from '@alshafra/calendar';

type Mode = 'g2h' | 'h2g';

export default function DateConverterIsland() {
  const [mode, setMode] = useState<Mode>('g2h');
  const [g, setG] = useState<GregorianDate>(todayGregorian);
  const [h, setH] = useState<HijriDate>(todayHijri);

  const result = useMemo(() => {
    if (mode === 'g2h') {
      const hijri = gregorianToHijri(g.year, g.month, g.day);
      return { primary: formatHijri(hijri), secondary: formatGregorian(g), weekday: weekdayName(g) };
    }
    const greg = hijriToGregorian(h);
    return { primary: formatGregorian(greg), secondary: formatHijri(h), weekday: weekdayName(greg) };
  }, [mode, g, h]);

  return (
    <div className="card my-6 p-6">
      <div className="flex justify-between">
        <h2 className="font-display text-lg font-bold">{mode === 'g2h' ? 'من ميلادي' : 'من هجري'}</h2>
        <button type="button" className="btn-ghost" onClick={() => setMode((m) => (m === 'g2h' ? 'h2g' : 'g2h'))}>
          تبديل
        </button>
      </div>
      {mode === 'g2h' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" value={g.day} onChange={(e) => setG({ ...g, day: +e.target.value })}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" value={g.month} onChange={(e) => setG({ ...g, month: +e.target.value })}>
            {GREGORIAN_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <input className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" type="number" value={g.year} onChange={(e) => setG({ ...g, year: +e.target.value })} />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" value={h.day} onChange={(e) => setH({ ...h, day: +e.target.value })}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" value={h.month} onChange={(e) => setH({ ...h, month: +e.target.value })}>
            {HIJRI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <input className="rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200" type="number" value={h.year} onChange={(e) => setH({ ...h, year: +e.target.value })} />
        </div>
      )}
      <div className="mt-6 rounded-xl bg-brand-50 p-4">
        <div className="text-xs text-brand-600">النتيجة</div>
        <div className="font-display text-2xl font-bold">{result.primary}</div>
        <div className="text-sm text-brand-700">{result.secondary} — {result.weekday}</div>
      </div>
    </div>
  );
}
