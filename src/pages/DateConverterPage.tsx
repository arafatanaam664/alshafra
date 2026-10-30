import { useMemo, useState } from 'react';
import { ArrowLeftRight, Calendar, CalendarDays, Copy, Check } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Link from '../components/Link';
import ToolGuide from '../components/ToolGuide';
import { useRiyadhToday } from '../lib/useRiyadhToday';
import { parseYearInput } from '../lib/number-input';
import { calculateGregorianInterval } from '../lib/age';
import {
  gregorianToHijri,
  isUmmAlQuraExact,
  hijriToGregorian,
  formatHijri,
  formatGregorian,
  formatHijriShort,
  formatGregorianShort,
  weekdayName,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  isValidGregorianDate,
  isValidHijriDate,
  type HijriDate,
  type GregorianDate,
} from '../lib/hijri';

type Mode = 'g2h' | 'h2g';

export default function DateConverterPage() {
  const hasCalendar = isUmmAlQuraExact();
  const [mode, setMode] = useState<Mode>('g2h');
  const today = useRiyadhToday();
  const todayH = gregorianToHijri(today.year, today.month, today.day);
  const [g, setG] = useState<GregorianDate>(today);
  const [h, setH] = useState<HijriDate>(todayH);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useSeo({
    title: 'تحويل التاريخ بين الهجري والميلادي | تقويم السعودية',
    description:
      'أداة لتحويل التاريخ بين الهجري والميلادي بتقويم أم القرى المتاح في المتصفح، مع بيان الحدود والتنبيه إلى الإعلانات الرسمية.',
    canonical: 'https://alshafra.com/date-converter',
    keywords: 'تحويل التاريخ, الهجري إلى الميلادي, الميلادي إلى الهجري, تقويم أم القرى, حاسبة تاريخ',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'تحويل التاريخ بين الهجري والميلادي',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      inLanguage: 'ar-SA',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
    },
  });

  const result = useMemo(() => {
    if (!hasCalendar) return null;
    if (mode === 'g2h') {
      if (!isValidGregorianDate(g)) return null;
      const hijri = gregorianToHijri(g.year, g.month, g.day);
      return {
        primary: formatHijri(hijri),
        secondary: formatGregorian(g),
        weekday: weekdayName(g),
        hijriShort: formatHijriShort(hijri),
        gregorianShort: formatGregorianShort(g),
        hijri,
        greg: g,
      };
    }
    if (!isValidHijriDate(h)) return null;
    const greg = hijriToGregorian(h);
    if (!isValidGregorianDate(greg)) return null;
    const roundTrip = gregorianToHijri(greg.year, greg.month, greg.day);
    if (roundTrip.year !== h.year || roundTrip.month !== h.month || roundTrip.day !== h.day) return null;
    return {
      primary: formatGregorian(greg),
      secondary: formatHijri(h),
      weekday: weekdayName(greg),
      hijriShort: formatHijriShort(h),
      gregorianShort: formatGregorianShort(greg),
      hijri: h,
      greg,
    };
  }, [mode, g, h, hasCalendar]);

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.primary} (${result.secondary}) — ${result.weekday}`);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  };

  const swap = () => {
    if (!result) return;
    if (mode === 'g2h') setH(result.hijri);
    else setG(result.greg);
    setCopyStatus('idle');
    setMode(mode === 'g2h' ? 'h2g' : 'g2h');
  };

  return (
    <div className="container-page py-10">
      <div className="grid items-start gap-8">
        <div className="min-w-0">
          <header className="max-w-2xl">
            <h1 className="section-title">تحويل التاريخ بين الهجري والميلادي</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
              أداة لتحويل التاريخ الهجري والميلادي باستخدام تقويم أم القرى المتاح في المتصفح عند دعمه،
              وتتوقف الأداة إذا لم يتوفر أو لم يجتز فحص التوافق. النطاق المتاح 1900–2100 ميلادية. راجع الجهة المختصة للقرارات الرسمية.
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-brand-900">
                  {mode === 'g2h' ? 'التاريخ الميلادي' : 'التاريخ الهجري'}
                </h2>
                <button
                  onClick={swap}
                  disabled={!result}
                  className="btn-ghost"
                  title="تبديل الاتجاه"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  تبديل
                </button>
              </div>

              {!result && <button type="button" className="mt-4 text-sm font-medium text-brand-700 underline" onClick={() => { if (mode === 'g2h') setG(today); else setH(todayH); setCopyStatus('idle'); }}>استخدام تاريخ اليوم</button>}

              {mode === 'g2h' ? (
                <GregorianPicker value={g} onChange={(value) => { setCopyStatus('idle'); setG(value); }} />
              ) : (
                <HijriPicker value={h} onChange={(value) => { setCopyStatus('idle'); setH(value); }} />
              )}
            </div>

            {/* Result */}
            <div className="card overflow-hidden">
              <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
                <h2 className="font-display text-lg font-bold text-brand-900">النتيجة</h2>
              </div>
              <div className="p-6">
                {result ? <>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl gradient-brand text-white">
                    {mode === 'g2h' ? <CalendarDays className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs text-brand-600/70">الناتج المحوّل</div>
                    <div className="font-display text-2xl font-bold text-brand-900">{result.primary}</div>
                    <div className="mt-1 text-sm text-brand-700/70">{result.secondary}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InfoTile label="اليوم" value={result.weekday} />
                  <InfoTile label="الهجري (رقمي)" value={result.hijriShort} />
                  <InfoTile label="الميلادي (رقمي)" value={result.gregorianShort} />
                  <InfoTile
                    label="الفرق عن اليوم"
                    value={diffLabel(result.greg, today)}
                  />
                </div>

                <button onClick={copyResult} className="btn-primary mt-5 w-full">
                  {copyStatus === 'success' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copyStatus === 'success' ? 'تم النسخ' : 'نسخ النتيجة'}
                </button>
                {copyStatus === 'error' && <p role="status" className="mt-2 text-sm text-rose-700">تعذر النسخ؛ يمكنك تحديد النتيجة ونسخها يدوياً.</p>}
                </> : <p role="alert" className="text-sm text-red-700">{hasCalendar ? 'يرجى إدخال تاريخ صحيح يقابله تاريخ ميلادي بين 1900 و2100؛ تحقق من عدد أيام الشهر.' : 'تقويم أم القرى غير متاح أو لم يجتز فحص المتصفح؛ جرّب متصفحاً آخر.'}</p>}
              </div>
            </div>
          </div>

          {/* SEO content */}
          <section className="mt-10 card p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-brand-900">كيف تعمل أداة تحويل التاريخ؟</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
              <p>
                تستخدم الأداة تقويم أم القرى الذي يوفره المتصفح إن اجتاز فحص التوافق، وتتوقف عند عدم توفره.
                قد تختلف بيانات المتصفحات وإصداراتها؛ لا يغني التحويل عن مراجعة الجهة الرسمية.
              </p>
              <p>
                قد تختلف بداية الأشهر والمناسبات الدينية عن الحساب بحسب إعلان رؤية الهلال الرسمي.
              </p>
              <p><a className="underline" href="https://www.ummulqura.org.sa/ar/calendar" target="_blank" rel="noopener noreferrer">موقع تقويم أم القرى</a> — مرجع للمراجعة، ولا تتصل الأداة به لإجراء الحساب.</p>
            </div>
          </section>
          <DateInterval />
          <ToolGuide tool="converter" />
          <section className="mt-8 card p-6" aria-labelledby="converter-related">
            <h2 id="converter-related" className="font-display text-lg font-bold text-brand-900">أدوات التقويم المرتبطة</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-700 underline">
              <li><Link to="/age-calculator">حساب العمر بالهجري والميلادي</Link></li>
              <li><Link to="/today">تاريخ اليوم في السعودية</Link></li>
              <li><Link to="/hijri-calendar">التقويم الهجري الشهري</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function DateInterval() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const parse = (value: string): GregorianDate | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
  };
  const a = parse(start), b = parse(end);
  const interval = a && b ? calculateGregorianInterval(a, b) : null;
  const inputClass = 'mt-2 w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500';
  return (
    <section className="mt-8 card p-6" aria-labelledby="interval-heading">
      <h2 id="interval-heading" className="font-display text-lg font-bold text-brand-900">حساب الفرق بين تاريخين ميلاديين</h2>
      <p className="mt-2 text-sm text-brand-700/80">اختر تاريخ البداية والنهاية بين 1900 و2100. الفرق بالأيام لا يشمل يوم البداية مرة إضافية.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-brand-700">تاريخ البداية<input className={inputClass} type="date" min="1900-01-01" max="2100-12-31" value={start} onChange={e => setStart(e.target.value)} /></label>
        <label className="text-sm text-brand-700">تاريخ النهاية<input className={inputClass} type="date" min="1900-01-01" max="2100-12-31" value={end} onChange={e => setEnd(e.target.value)} /></label>
      </div>
      {start && end && (interval ? <p role="status" className="mt-4 text-sm font-bold text-brand-900">الفرق: {interval.totalDays.toLocaleString('ar-SA')} يوم — {interval.span.years} سنة و{interval.span.months} شهر و{interval.span.days} يوم</p> : <p role="alert" className="mt-4 text-sm text-rose-700">تحقق من التاريخين والنطاق؛ يجب أن يكون تاريخ النهاية في تاريخ البداية أو بعده.</p>)}
      <p className="mt-3 text-xs leading-relaxed text-brand-700/80">لحساب الأشهر المكتملة، إذا لم يوجد يوم البداية في شهر أقصر نستخدم آخر يوم في ذلك الشهر؛ قد تختلف طرق الحساب الأخرى.</p>
    </section>
  );
}

function diffLabel(target: GregorianDate, today: GregorianDate): string {
  const a = Date.UTC(today.year, today.month - 1, today.day);
  const b = Date.UTC(target.year, target.month - 1, target.day);
  const diff = Math.round((b - a) / 86400000);
  if (diff === 0) return 'اليوم';
  if (diff > 0) return `بعد ${diff} يوم`;
  return `منذ ${Math.abs(diff)} يوم`;
}

function GregorianPicker({ value, onChange }: { value: GregorianDate; onChange: (v: GregorianDate) => void }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <Field label="اليوم">
        <select
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.day}
          onChange={(e) => onChange({ ...value, day: +e.target.value })}
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="الشهر">
        <select
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.month}
          onChange={(e) => onChange({ ...value, month: +e.target.value })}
        >
          {GREGORIAN_MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
      </Field>
      <Field label="السنة">
        <input
          type="text" inputMode="numeric"
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.year || ''}
          onChange={(e) => onChange({ ...value, year: parseYearInput(e.target.value) })}
        />
      </Field>
    </div>
  );
}

function HijriPicker({ value, onChange }: { value: HijriDate; onChange: (v: HijriDate) => void }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <Field label="اليوم">
        <select
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.day}
          onChange={(e) => onChange({ ...value, day: +e.target.value })}
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="الشهر">
        <select
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.month}
          onChange={(e) => onChange({ ...value, month: +e.target.value })}
        >
          {HIJRI_MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
      </Field>
      <Field label="السنة">
        <input
          type="text" inputMode="numeric"
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          value={value.year || ''}
          onChange={(e) => onChange({ ...value, year: parseYearInput(e.target.value) })}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-brand-700/80">{label}</span>
      {children}
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sand-50 p-3 ring-1 ring-brand-900/5">
      <div className="text-[11px] text-brand-600/70">{label}</div>
      <div className="mt-0.5 font-display text-sm font-bold text-brand-900">{value}</div>
    </div>
  );
}
