import { useMemo, useState } from 'react';
import { Cake, CalendarDays, Sparkles } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Link from '../components/Link';
import ToolGuide from '../components/ToolGuide';
import {
  formatGregorian,
  formatHijri,
  weekdayName,
  isUmmAlQuraExact,
  gregorianToHijri,
  gregorianToJdn,
  hijriToGregorian,
  isValidHijriDate,
  isValidGregorianDate,
  HIJRI_MONTHS,
  type GregorianDate,
  GREGORIAN_MONTHS,
} from '../lib/hijri';
import { calculateAge, calculateGregorianInterval } from '../lib/age';
import { validIso } from '../lib/iso-date.mjs';
import { useRiyadhToday } from '../lib/useRiyadhToday';
import { parseYearInput } from '../lib/number-input';

export default function AgeCalculatorPage() {
  const today = useRiyadhToday();
  const hasCalendar = isUmmAlQuraExact();
  const [birth, setBirth] = useState<GregorianDate>({ year: 2000, month: 1, day: 1 });
  const [mode, setMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [hijriBirth, setHijriBirth] = useState(() => gregorianToHijri(2000, 1, 1));

  useSeo({
    title: 'حاسبة العمر بالهجري والميلادي | تقويم السعودية',
    description:
      'احسب العمر بالسنوات والأشهر والأيام الهجرية والميلادية، والأيام المتبقية لعيد الميلاد وفق يوم الرياض.',
    canonical: 'https://alshafra.com/age-calculator',
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

  const resolvedBirth = useMemo(() => {
    if (!hasCalendar) return null;
    if (mode === 'gregorian') return isValidGregorianDate(birth) ? birth : null;
    if (!isValidHijriDate(hijriBirth)) return null;
    const converted = hijriToGregorian(hijriBirth);
    if (!isValidGregorianDate(converted)) return null;
    const roundTrip = gregorianToHijri(converted.year, converted.month, converted.day);
    return roundTrip.year === hijriBirth.year && roundTrip.month === hijriBirth.month && roundTrip.day === hijriBirth.day ? converted : null;
  }, [mode, birth, hijriBirth, hasCalendar]);
  const result = useMemo(() => resolvedBirth ? calculateAge(resolvedBirth, today) : null, [resolvedBirth, today]);
  const input = mode === 'gregorian' ? birth : hijriBirth;
  const setInput = mode === 'gregorian' ? setBirth : setHijriBirth;
  const switchMode = () => {
    if (!resolvedBirth) return;
    if (mode === 'gregorian') setHijriBirth(gregorianToHijri(birth.year, birth.month, birth.day));
    else setBirth(resolvedBirth);
    setMode(mode === 'gregorian' ? 'hijri' : 'gregorian');
  };

  return (
    <div className="container-page py-10">
      <div className="grid items-start gap-8">
        <div className="min-w-0">
          <header className="max-w-2xl">
            <h1 className="section-title">حاسبة العمر بالهجري والميلادي</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
              أدخل تاريخ ميلادك بالتقويم الميلادي أو الهجري لتحصل على عمرك بالسنوات والأشهر والأيام بالتقويمين
              الهجري والميلادي، بالإضافة إلى عدد الأيام والأسابيع والأيام المتبقية لعيد ميلادك القادم.
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-brand-900">تاريخ الميلاد</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-brand-700">الإدخال: {mode === 'gregorian' ? 'ميلادي' : 'هجري'}</span>
                <button type="button" className="btn-ghost" onClick={switchMode} disabled={!resolvedBirth}>تبديل إلى {mode === 'gregorian' ? 'الهجري' : 'الميلادي'}</button>
              </div>
              <button type="button" className="mt-3 text-sm font-medium text-brand-700 underline" onClick={() => { setBirth({ year: 2000, month: 1, day: 1 }); setMode('gregorian'); }}>إعادة الإدخال إلى 1 يناير 2000 ميلادي</button>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-brand-700/80">اليوم</span>
                  <select
                    className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
                    value={input.day}
                    onChange={(e) => setInput({ ...input, day: +e.target.value })}
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
                    value={input.month}
                    onChange={(e) => setInput({ ...input, month: +e.target.value })}
                  >
                    {(mode === 'gregorian' ? GREGORIAN_MONTHS : HIJRI_MONTHS).map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-brand-700/80">السنة</span>
                  <input
                    type="text" inputMode="numeric"
                    className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
                    value={input.year || ''}
                    onChange={(e) => setInput({ ...input, year: parseYearInput(e.target.value) })}
                  />
                </label>
              </div>
              <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
                تاريخ الميلاد المُدخل: <strong>{resolvedBirth ? (mode === 'gregorian' ? formatGregorian(birth) : formatHijri(hijriBirth)) : 'تاريخ غير صحيح أو خارج النطاق أو التقويم غير متاح'}</strong>
                {resolvedBirth && <p className="mt-1">يقابله: {mode === 'gregorian' ? formatHijri(gregorianToHijri(birth.year, birth.month, birth.day)) : formatGregorian(resolvedBirth)}</p>}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
                <h2 className="font-display text-lg font-bold text-brand-900">النتيجة</h2>
              </div>
              <div className="p-6">
                {!result ? (
                  <div role="alert" className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                    <Cake className="h-5 w-5" />
                    {hasCalendar ? 'أدخل تاريخ ميلاد صحيحاً لا يتجاوز اليوم ويقابله تاريخ ميلادي من 1900 حتى اليوم.' : 'تقويم أم القرى غير متاح أو لم يجتز فحص المتصفح؛ لا يمكن حساب العمر الهجري هنا. جرّب متصفحاً آخر.'}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <BigStat value={result.gregorian.years} label="سنة ميلادية" />
                      <BigStat value={result.gregorian.months} label="شهر" />
                      <BigStat value={result.gregorian.days} label="يوم" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <BigStat value={result.hijri.years} label="سنة هجرية" accent />
                      <BigStat value={result.hijri.months} label="شهر هجري" accent />
                      <BigStat value={result.hijri.days} label="يوم هجري" accent />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <MiniStat icon={CalendarDays} label="إجمالي الأيام" value={result.totalDays.toLocaleString('ar-SA')} />
                      <MiniStat icon={Sparkles} label="إجمالي الأسابيع" value={result.totalWeeks.toLocaleString('ar-SA')} />
                      <MiniStat icon={CalendarDays} label="يوم الميلاد" value={weekdayName(resolvedBirth!)} />
                      <MiniStat icon={Cake} label="عيد الميلاد الميلادي القادم" value={`${formatGregorian(result.nextBirthday)} — بعد ${result.daysToBirthday} يوم`} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-brand-700/80">يجري كود الأداة الحساب داخل المتصفح ولا يرسل تاريخ الميلاد أو يحفظه بنفسه. نسخة الحاسبة المبنية تعزل الصفحة عن سكربتات الإعلان والتحليلات الخارجية، لكن يجب اختبار إعدادات النشر والمتصفح قبل تأكيد الخصوصية الشاملة. راجع <Link className="underline" to="/privacy">الخصوصية</Link>.</p>
          <AgeComparison first={result ? resolvedBirth : null} today={today} />

          <section className="mt-10 card p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-brand-900">عن حاسبة العمر</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
              <p>
                يُحسب العمر حسب يوم الرياض من دون ساعة الميلاد. يُحتسب الشهر الكامل من يوم الميلاد،
                وإذا لم يوجد ذلك اليوم في شهر أقصر يُستخدم آخر يوم فيه. يُحتسب عيد ميلاد 29 فبراير
                في 28 فبراير خلال السنوات غير الكبيسة؛ وقد تختلف طرق الحساب الأخرى أو الأحكام الرسمية.
              </p>
              <p>
                يستخدم الحساب تقويم أم القرى الذي يوفره المتصفح إن اجتاز فحص التوافق؛ وإلا تتوقف الحاسبة.
                قد يختلف إعلان رؤية الهلال عن الحساب التقويمي؛ لا تستخدم النتيجة وثيقة رسمية وراجع الجهة المختصة.
              </p>
              <p><a className="underline" href="https://www.ummulqura.org.sa/ar/calendar" target="_blank" rel="noopener noreferrer">موقع تقويم أم القرى</a> — مرجع للمراجعة، ولا تتصل الأداة به لإجراء الحساب.</p>
            </div>
          </section>
          <ToolGuide tool="age" />
          <section className="mt-8 card p-6" aria-labelledby="age-related">
            <h2 id="age-related" className="font-display text-lg font-bold text-brand-900">أدوات مرتبطة بحساب العمر</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-700 underline">
              <li><Link to="/date-converter">تحويل تاريخ الميلاد بين الهجري والميلادي</Link></li>
              <li><Link to="/today">تاريخ اليوم في السعودية</Link></li>
              <li><Link to="/hijri-calendar">التقويم الهجري الشهري</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function AgeComparison({ first, today }: { first: GregorianDate | null; today: GregorianDate }) {
  const [secondValue, setSecondValue] = useState('');
  const todayIso = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  const secondValid = validIso(secondValue) && secondValue <= todayIso;
  const second = secondValid ? (() => {
    const [year, month, day] = secondValue.split('-').map(Number);
    return { year, month, day };
  })() : null;
  const firstJdn = first ? gregorianToJdn(first.year, first.month, first.day) : null;
  const secondJdn = second ? gregorianToJdn(second.year, second.month, second.day) : null;
  const interval = first && second && firstJdn !== null && secondJdn !== null
    ? calculateGregorianInterval(firstJdn <= secondJdn ? first : second, firstJdn <= secondJdn ? second : first)
    : null;
  return (
    <section className="mt-8 card p-6" aria-labelledby="age-comparison-title">
      <h2 id="age-comparison-title" className="font-display text-lg font-bold text-brand-900">مقارنة العمر بين شخصين</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-700/80">يُستخدم تاريخ الميلاد أعلاه للشخص الأول. أدخل تاريخ الشخص الثاني ميلادياً لمعرفة الأكبر والفرق بين تاريخي الميلاد بالأيام والسنوات والأشهر المكتملة، دون احتساب ساعة الميلاد.</p>
      <label className="mt-4 block max-w-sm text-sm font-medium text-brand-800">تاريخ ميلاد الشخص الثاني
        <input type="date" min="1900-01-01" max={todayIso} value={secondValue} onChange={event => setSecondValue(event.target.value)} className="mt-2 block w-full rounded-xl bg-sand-50 px-3 py-2.5 text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500" />
      </label>
      {secondValue && !secondValid && <p role="alert" className="mt-3 text-sm text-rose-700">أدخل تاريخاً صحيحاً من 1900 حتى اليوم بتوقيت الرياض.</p>}
      {second && !first && <p className="mt-3 text-sm text-brand-700">أدخل تاريخاً صالحاً للشخص الأول أعلاه لإتمام المقارنة.</p>}
      {interval && <div role="status" className="mt-4 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-900">
        <p className="font-bold">{firstJdn === secondJdn ? 'تاريخا الميلاد متساويان.' : firstJdn! < secondJdn! ? 'الشخص الأول أكبر سناً.' : 'الشخص الثاني أكبر سناً.'}</p>
        <p>الفرق: {interval.span.years} سنة و{interval.span.months} شهر و{interval.span.days} يوم، بإجمالي {interval.totalDays.toLocaleString('ar-SA')} يوم.</p>
      </div>}
    </section>
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
