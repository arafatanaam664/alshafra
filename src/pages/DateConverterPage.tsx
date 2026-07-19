import { useMemo, useState } from 'react';
import { ArrowLeftRight, Calendar, CalendarDays, Copy, Check } from 'lucide-react';
import { useSeo } from '../lib/seo';
import {
  gregorianToHijri,
  hijriToGregorian,
  formatHijri,
  formatGregorian,
  formatHijriShort,
  formatGregorianShort,
  weekdayName,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  todayGregorian,
  todayHijri,
  type HijriDate,
  type GregorianDate,
} from '../lib/hijri';

type Mode = 'g2h' | 'h2g';

export default function DateConverterPage() {
  const [mode, setMode] = useState<Mode>('g2h');
  const today = todayGregorian();
  const todayH = todayHijri();
  const [g, setG] = useState<GregorianDate>(today);
  const [h, setH] = useState<HijriDate>(todayH);
  const [copied, setCopied] = useState(false);

  useSeo({
    title: 'تحويل التاريخ بين الهجري والميلادي | تقويم السعودية',
    description:
      'أداة مجانية لتحويل التاريخ بين التقويم الهجري والميلادي بدقة وفق تقويم أم القرى الرسمي. حوّل أي تاريخ هجري إلى ميلادي أو العكس مع عرض اليوم من الأسبوع.',
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
    if (mode === 'g2h') {
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
    const greg = hijriToGregorian(h);
    return {
      primary: formatGregorian(greg),
      secondary: formatHijri(h),
      weekday: weekdayName(greg),
      hijriShort: formatHijriShort(h),
      gregorianShort: formatGregorianShort(greg),
      hijri: h,
      greg,
    };
  }, [mode, g, h]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(`${result.primary} (${result.secondary}) — ${result.weekday}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const swap = () => setMode((m) => (m === 'g2h' ? 'h2g' : 'g2h'));

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="section-title">تحويل التاريخ بين الهجري والميلادي</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          أداة دقيقة لتحويل التاريخ بين التقويم الهجري والميلادي وفق تقويم أم القرى الرسمي المعتمد في
          المملكة العربية السعودية. اختر التاريخ ثم اضغط زر التبديل لعكس الاتجاه.
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
              className="btn-ghost"
              title="تبديل الاتجاه"
            >
              <ArrowLeftRight className="h-4 w-4" />
              تبديل
            </button>
          </div>

          {mode === 'g2h' ? (
            <GregorianPicker value={g} onChange={setG} />
          ) : (
            <HijriPicker value={h} onChange={setH} />
          )}
        </div>

        {/* Result */}
        <div className="card overflow-hidden">
          <div className="border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-4">
            <h2 className="font-display text-lg font-bold text-brand-900">النتيجة</h2>
          </div>
          <div className="p-6">
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
                value={diffLabel(result.greg)}
              />
            </div>

            <button onClick={copyResult} className="btn-primary mt-5 w-full">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'تم النسخ' : 'نسخ النتيجة'}
            </button>
          </div>
        </div>
      </div>

      {/* SEO content */}
      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">كيف تعمل أداة تحويل التاريخ؟</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            تعتمد الأداة على تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية كمرجع للتحويل
            بين التاريخ الهجري والميلادي. يقوم المحرك بحساب رقم اليوم اليولياني ثم تحويله إلى
            التقويم المقابل باستخدام القاعدة الحسابية التقريبية لتقويم أم القرى.
          </p>
          <p>
            التحويل دقيق لمعظم التواريخ العملية، مع احتمال اختلاف يوم واحد قرب بدايات الأشهر
            الهجرية لأن رؤية الهلال تعتمد على الرصد الفعلي. للمسائل القانونية والرسمية يُنصح
            بالرجوع للتقويم الرسمي الصادر عن المملكة.
          </p>
        </div>
      </section>
    </div>
  );
}

function diffLabel(target: GregorianDate): string {
  const today = todayGregorian();
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
          className="input"
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
          className="input"
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
          type="number"
          className="input"
          value={value.year}
          min={1900}
          max={2100}
          onChange={(e) => onChange({ ...value, year: +e.target.value })}
        />
      </Field>
      <style>{`.input{ @apply w-full rounded-xl border-0 bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500; }`}</style>
    </div>
  );
}

function HijriPicker({ value, onChange }: { value: HijriDate; onChange: (v: HijriDate) => void }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <Field label="اليوم">
        <select
          className="input-h"
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
          className="input-h"
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
          type="number"
          className="input-h"
          value={value.year}
          min={1}
          max={1700}
          onChange={(e) => onChange({ ...value, year: +e.target.value })}
        />
      </Field>
      <style>{`.input-h{ width:100%; border-radius:0.75rem; background:#faf7f2; padding:0.625rem 0.75rem; font-size:0.875rem; color:#022c22; outline:none; box-shadow: inset 0 0 0 1px #c9aa7c; }
      .input-h:focus{ box-shadow: inset 0 0 0 2px #10b981; }`}</style>
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
