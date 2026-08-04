import { ArrowLeft, CalendarDays, Clock3, Search, Share2 } from 'lucide-react';
import { useState } from 'react';
import Countdown from '../components/Countdown';
import Link from '../components/Link';
import { useSeo } from '../lib/seo';
import { useNow } from '../lib/useNow';
import { todayGregorian } from '../lib/hijri';
import {
  COUNTDOWNS,
  countdownsByCategory,
  findCountdown,
  resolveCountdowns,
  type ResolvedCountdown,
} from '../lib/countdowns';
import { CATEGORY_LABELS, type EventCategory } from '../lib/events';

const CATEGORY_ORDER: EventCategory[] = ['national', 'religious', 'salary', 'school', 'seasonal'];
const CATEGORY_DESCRIPTIONS: Record<EventCategory, string> = {
  national: 'المناسبات الوطنية السعودية مثل اليوم الوطني ويوم التأسيس.',
  religious: 'مواعيد رمضان والأعياد والمناسبات الهجرية وفق تقويم أم القرى.',
  salary: 'مواعيد صرف الرواتب والدعم مع قاعدة الجمعة والسبت.',
  school: 'بداية الدراسة والإجازات المدرسية الرئيسية.',
  seasonal: 'مواسم شعبية وفلكية مهمة في السعودية.',
};

export function CountdownHubPage() {
  const [query, setQuery] = useState('');
  const today = todayGregorian();
  const all = resolveCountdowns(today);
  const grouped = countdownsByCategory(today);
  const filtered = all.filter((c) => `${c.title} ${c.shortTitle} ${c.keywords}`.includes(query.trim()));

  useSeo({
    title: 'كم باقي؟ 18 عدّادًا تنازليًا للسعودية | تقويم السعودية',
    description:
      'مركز العدّادات التنازلية في السعودية: كم باقي على رمضان، العيد، اليوم الوطني، يوم التأسيس، حساب المواطن، الرواتب، الدراسة، سهيل والمربعانية.',
    canonical: 'https://alshafra.com/countdown',
    keywords:
      'كم باقي, عداد تنازلي, كم باقي على رمضان, كم باقي على الراتب, كم باقي على حساب المواطن, كم باقي على اليوم الوطني',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'العدّادات التنازلية السعودية',
        url: 'https://alshafra.com/countdown',
        inLanguage: 'ar-SA',
        hasPart: COUNTDOWNS.map((c) => ({ '@type': 'WebPage', name: c.title, url: `https://alshafra.com/countdown/${c.slug}` })),
      },
    ],
  });

  return (
    <div>
      <section className="relative overflow-hidden gradient-brand text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-page relative py-14 sm:py-20">
          <span className="chip bg-white/15 text-white ring-1 ring-white/20">
            <Clock3 className="h-3.5 w-3.5 text-gold-300" />
            كم باقي على أهم مواعيد السعودية؟
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            العدّادات التنازلية السعودية
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-brand-50/90">
            18 عدّادًا مباشرًا لأكثر عمليات البحث السعودية: المناسبات الوطنية والدينية، الرواتب، الدراسة، والمواسم.
          </p>
          <div className="mt-7 max-w-xl rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur">
            <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-brand-900">
              <Search className="h-4 w-4 text-brand-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث: رمضان، الراتب، الدراسة..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-brand-400"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="container-page -mt-10 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {all.slice(0, 4).map((c) => (
            <CountdownCard key={c.slug} countdown={c} featured />
          ))}
        </div>
      </section>

      {query.trim() ? (
        <section className="container-page mt-12">
          <h2 className="section-title">نتائج البحث</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => <CountdownCard key={c.slug} countdown={c} />)}
          </div>
        </section>
      ) : (
        CATEGORY_ORDER.map((category) => (
          <section key={category} className="container-page mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="section-title">{CATEGORY_LABELS[category]}</h2>
                <p className="mt-1 text-sm text-brand-700/70">{CATEGORY_DESCRIPTIONS[category]}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[category].map((c) => <CountdownCard key={c.slug} countdown={c} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default function CountdownPage({ slug }: { slug: string }) {
  useNow(1000);
  const countdown = findCountdown(slug);
  const related = resolveCountdowns().filter((c) => c.slug !== slug && c.category === countdown?.category).slice(0, 3);

  useSeo({
    title: countdown ? `${countdown.title} | تقويم السعودية` : 'العدّاد غير موجود | تقويم السعودية',
    description: countdown?.description ?? 'العدّاد المطلوب غير موجود في تقويم السعودية.',
    canonical: `https://alshafra.com/countdown/${slug}`,
    keywords: countdown?.keywords ?? 'كم باقي, عداد تنازلي',
    jsonLd: countdown
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: countdown.title,
            url: `https://alshafra.com/countdown/${slug}`,
            inLanguage: 'ar-SA',
            about: countdown.shortTitle,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alshafra.com/' },
              { '@type': 'ListItem', position: 2, name: 'العدّادات', item: 'https://alshafra.com/countdown' },
              { '@type': 'ListItem', position: 3, name: countdown.shortTitle, item: `https://alshafra.com/countdown/${slug}` },
            ],
          },
        ]
      : [],
  });

  if (!countdown) {
    return (
      <div className="container-page py-16">
        <div className="card p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-brand-900">العدّاد غير موجود</h1>
          <p className="mt-2 text-brand-700/80">اختر عدّادًا من مركز العدّادات التنازلية.</p>
          <Link to="/countdown" className="btn-primary mt-5 inline-flex">عرض العدّادات</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden gradient-brand text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-page relative py-14 sm:py-20">
          <Link to="/countdown" className="inline-flex items-center gap-1 text-sm text-brand-50/85 hover:text-white">
            <ArrowLeft className="h-4 w-4 rotate-180" />
            كل العدّادات
          </Link>
          <div className="mt-5 flex items-start gap-4">
            <span className="text-5xl">{countdown.emoji}</span>
            <div>
              <span className="chip bg-white/15 text-white ring-1 ring-white/20">{countdown.categoryLabel}</span>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{countdown.title}</h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-brand-50/90">{countdown.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page -mt-10 relative z-10">
        <div className="card p-6 sm:p-8">
          <Countdown target={countdown.date} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info label="الموعد الميلادي" value={countdown.gregorianText} />
            <Info label="الموعد الهجري" value={countdown.hijriText} />
            <Info label="اليوم" value={countdown.weekdayText} />
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-brand-900">تفاصيل الموعد</h2>
            <p className="mt-3 leading-relaxed text-brand-700/85">
              يتبقى <strong>{countdown.daysRemaining} يوم</strong> على {countdown.shortTitle}. الموعد هو {countdown.weekdayText}، {countdown.gregorianText}، الموافق {countdown.hijriText}.
            </p>
            <p className="mt-3 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">
              <CalendarDays className="ml-1 inline h-4 w-4" />
              {countdown.source}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-brand-900">شارك العدّاد</h2>
            <p className="mt-2 text-sm text-brand-700/75">انسخ الرابط أو شاركه لمعرفة كم باقي على {countdown.shortTitle}.</p>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="btn-primary mt-4 w-full justify-center"
            >
              <Share2 className="h-4 w-4" />
              نسخ الرابط
            </button>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="section-title">عدّادات مشابهة</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => <CountdownCard key={c.slug} countdown={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function CountdownCard({ countdown, featured = false }: { countdown: ResolvedCountdown; featured?: boolean }) {
  return (
    <Link
      to={`/countdown/${countdown.slug}`}
      className={`card group block p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-soft ${featured ? 'bg-white' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl">{countdown.emoji}</span>
        <span className={`chip ring-1 ${countdown.categoryStyle}`}>{countdown.categoryLabel}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-brand-900 group-hover:text-brand-700">{countdown.shortTitle}</h3>
      <p className="mt-1 text-xs text-brand-700/70">{countdown.gregorianText} — {countdown.hijriText}</p>
      <div className="mt-4 flex items-end justify-between">
        <span className="font-display text-3xl font-bold tabular-nums text-brand-700">{countdown.daysRemaining}</span>
        <span className="text-xs text-brand-600/70">يوم متبقي</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full rounded-full gradient-brand" style={{ width: `${Math.max(8, 100 - countdown.daysRemaining / 4)}%` }} />
      </div>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sand-50 p-4 text-center ring-1 ring-brand-900/5">
      <div className="text-xs font-semibold text-brand-600/70">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-brand-900">{value}</div>
    </div>
  );
}
