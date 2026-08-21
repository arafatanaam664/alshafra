import { CalendarDays, Clock, Moon, Sun, ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useSeo, SITE_URL } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Link from '../components/Link';
import AdSlot from '../components/AdSlot';
import { useNow } from '../lib/useNow';
import {
  todayGregorian,
  gregorianToHijri,
  formatHijri,
  formatGregorian,
  formatHijriShort,
  formatGregorianShort,
  weekdayName,
  hijriMonthLength,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  gregorianToJdn,
  isUmmAlQuraExact,
  SITE_TIMEZONE,
} from '../lib/hijri';
import { resolveAll } from '../lib/countdowns';

export default function TodayPage() {
  const now = useNow(1000);
  const today = todayGregorian();
  const hijri = gregorianToHijri(today.year, today.month, today.day);
  const weekday = weekdayName(today);
  const [copied, setCopied] = useState<string | null>(null);

  const monthLength = hijriMonthLength(hijri.year, hijri.month);
  const daysLeftInHijriMonth = Math.max(0, monthLength - hijri.day);
  const startOfYearJdn = gregorianToJdn(today.year, 1, 1);
  const dayOfYear = gregorianToJdn(today.year, today.month, today.day) - startOfYearJdn + 1;
  const upcoming = resolveAll(today).filter((c) => c.date).slice(0, 6);

  const timeString = now.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: SITE_TIMEZONE,
  });

  const hijriText = formatHijri(hijri);
  const gregorianText = formatGregorian(today);

  useSeo({
    title: `التاريخ اليوم: ${hijriText} — ${gregorianText} | تقويم السعودية`,
    description: `التاريخ الهجري والميلادي اليوم في السعودية: ${weekday} ${hijriText} الموافق ${gregorianText} بتوقيت الرياض، وفق تقويم أم القرى الرسمي، مع الوقت الحالي وأقرب المواعيد والمناسبات.`,
    canonical: `${SITE_URL}/today`,
    keywords:
      'التاريخ اليوم, كم التاريخ اليوم, التاريخ الهجري اليوم, التاريخ الميلادي اليوم, تاريخ اليوم بالهجري, اليوم كم بالهجري, تقويم أم القرى',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `التاريخ اليوم في السعودية — ${hijriText}`,
        description: `التاريخ الهجري والميلادي اليوم في المملكة العربية السعودية وفق تقويم أم القرى: ${hijriText} الموافق ${gregorianText}.`,
        inLanguage: 'ar-SA',
        url: `${SITE_URL}/today`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'كم التاريخ الهجري اليوم؟',
            acceptedAnswer: { '@type': 'Answer', text: `التاريخ الهجري اليوم هو ${hijriText} وفق تقويم أم القرى الرسمي.` },
          },
          {
            '@type': 'Question',
            name: 'كم التاريخ الميلادي اليوم؟',
            acceptedAnswer: { '@type': 'Answer', text: `التاريخ الميلادي اليوم هو ${gregorianText}، ويوافق يوم ${weekday}.` },
          },
        ],
      },
    ],
  });

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  const facts = [
    { label: 'اليوم', value: weekday },
    { label: 'الشهر الهجري', value: HIJRI_MONTHS[hijri.month - 1] },
    { label: 'الشهر الميلادي', value: GREGORIAN_MONTHS[today.month - 1] },
    { label: 'أيام الشهر الهجري', value: `${monthLength} يوماً` },
    { label: 'المتبقي من الشهر الهجري', value: `${daysLeftInHijriMonth} يوماً` },
    { label: 'ترتيب اليوم في السنة الميلادية', value: `${dayOfYear}` },
  ];

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'التاريخ اليوم' }]} />

      <header className="mt-4 max-w-2xl">
        <h1 className="section-title">التاريخ اليوم في السعودية</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          التاريخ الهجري والميلادي الآن بتوقيت الرياض وفق تقويم أم القرى الرسمي، مع الوقت الحالي
          وتفاصيل الشهر الهجري وأقرب المواعيد القادمة.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-brand-900/5 bg-gradient-to-l from-brand-50 to-transparent px-6 py-3">
            <Moon className="h-4 w-4 text-brand-600" />
            <h2 className="font-display text-sm font-bold text-brand-900">التاريخ الهجري</h2>
          </div>
          <div className="p-6">
            <p className="font-display text-2xl font-bold text-brand-800 sm:text-3xl">{hijriText}</p>
            <p className="mt-1 text-sm text-brand-700/70">{weekday}</p>
            <button
              onClick={() => copy(formatHijriShort(hijri), 'hijri')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
            >
              {copied === 'hijri' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {formatHijriShort(hijri)}
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-brand-900/5 bg-gradient-to-l from-gold-50 to-transparent px-6 py-3">
            <Sun className="h-4 w-4 text-gold-600" />
            <h2 className="font-display text-sm font-bold text-brand-900">التاريخ الميلادي</h2>
          </div>
          <div className="p-6">
            <p className="font-display text-2xl font-bold text-brand-800 sm:text-3xl">{gregorianText}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-700/70">
              <Clock className="h-3.5 w-3.5" />
              الساعة {timeString} بتوقيت الرياض
            </p>
            <button
              onClick={() => copy(formatGregorianShort(today), 'greg')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-700 ring-1 ring-gold-200 hover:bg-gold-100"
            >
              {copied === 'greg' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {formatGregorianShort(today)}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 card p-6">
        <h2 className="font-display text-lg font-bold text-brand-900">تفاصيل اليوم</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-xl bg-sand-50 p-4 ring-1 ring-brand-900/5">
              <dt className="text-xs text-brand-600/70">{f.label}</dt>
              <dd className="mt-1 font-display text-base font-bold text-brand-800">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-brand-600/70">
          {isUmmAlQuraExact()
            ? 'التحويل الهجري مأخوذ من جدول أم القرى الرسمي (ICU) وليس تقديراً حسابياً.'
            : 'متصفحك لا يدعم جدول أم القرى، لذا يُستخدم التقويم الهجري الحسابي التقريبي (فارق يوم محتمل).'}
        </p>
      </section>

      <AdSlot />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-brand-900">أقرب المواعيد القادمة</h2>
          <Link to="/countdown" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            كل العدّادات
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((c) => (
            <Link
              key={c.def.slug}
              to={`/countdown/${c.def.slug}`}
              className="card flex items-center justify-between gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.def.emoji}</span>
                  <h3 className="font-display text-sm font-bold text-brand-900">{c.displayTitle}</h3>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-700/70">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {c.gregorianText}
                </p>
              </div>
              <span className="font-display text-lg font-bold tabular-nums text-brand-700">
                {c.daysRemaining}
                <span className="mr-1 text-xs font-normal text-brand-600/70">يوم</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-brand-900">عن التاريخ الهجري في السعودية</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            تعتمد المملكة العربية السعودية تقويم أم القرى مرجعاً رسمياً للتواريخ الهجرية في
            المعاملات الحكومية والعقود والإجازات. يُحسب هذا التقويم فلكياً لتحديد بدايات الأشهر،
            وقد يختلف بيوم واحد عن الرؤية الشرعية المُعلنة للأشهر ذات الشأن مثل رمضان وشوال وذي الحجة.
          </p>
          <p>
            التاريخ المعروض في هذه الصفحة محسوب بتوقيت الرياض (UTC+3) بغض النظر عن موقع الزائر،
            حتى لا يختلف التاريخ الذي يراه المقيم خارج المملكة عن التاريخ الرسمي داخلها. لتحويل أي
            تاريخ آخر استخدم{' '}
            <Link to="/date-converter" className="text-brand-700 underline">
              أداة تحويل التاريخ
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
