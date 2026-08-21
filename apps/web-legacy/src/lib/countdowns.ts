// Countdown engine ("كم باقي على…").
//
// Every countdown is declared once in src/data/countdowns.json — the SAME file
// that scripts/prerender.mjs reads when it generates the static HTML — so the
// app and the crawlable markup can never disagree about a date.
//
// No Gregorian date of a religious event is ever written by hand: Hijri
// schedules are resolved through the Umm Al-Qura table in lib/hijri.ts.

import type { GregorianDate, HijriDate } from './hijri';
import {
  formatGregorian,
  formatHijri,
  gregorianToHijri,
  gregorianToJdn,
  hijriToGregorian,
  jdnToGregorian,
  weekdayName,
} from './hijri';
import { applyWeekendRule } from './events';
import raw from '../data/countdowns.json';

export type CountdownCategory = 'national' | 'religious' | 'salary' | 'school' | 'seasonal';

export type CountdownSchedule =
  | { type: 'gregorian-annual'; month: number; day: number; editionBase?: number }
  | { type: 'hijri-annual'; hijriMonth: number; hijriDay: number; showHijriYear?: boolean }
  | { type: 'monthly'; dayOfMonth: number; weekendRule?: boolean }
  | { type: 'fixed'; dates: string[] };

export interface CountdownFaq {
  q: string;
  a: string;
}

export interface CountdownDef {
  slug: string;
  title: string;
  question: string;
  category: CountdownCategory;
  emoji: string;
  accent: string;
  summary: string;
  keywords: string;
  schedule: CountdownSchedule;
  paragraphs: string[];
  notes: string[];
  faq: CountdownFaq[];
  related: string[];
  source?: { label: string; url: string };
}

export interface ResolvedCountdown {
  def: CountdownDef;
  /** Next occurrence, or null when the schedule has no future date left. */
  date: GregorianDate | null;
  hijri: HijriDate | null;
  /** Title with the edition / Hijri year appended, e.g. «اليوم الوطني السعودي 96». */
  displayTitle: string;
  gregorianText: string;
  hijriText: string;
  weekdayText: string;
  daysRemaining: number;
  /** Up to three upcoming occurrences (recurring schedules only). */
  upcoming: GregorianDate[];
}

export const COUNTDOWNS = (raw as { countdowns: CountdownDef[] }).countdowns;

export const COUNTDOWN_CATEGORY_LABELS: Record<CountdownCategory, string> = {
  national: 'وطنية',
  religious: 'دينية',
  salary: 'الرواتب والدعم',
  school: 'دراسية',
  seasonal: 'مواسم',
};

export const COUNTDOWN_CATEGORY_STYLES: Record<CountdownCategory, string> = {
  national: 'bg-gold-50 text-gold-700 ring-gold-200',
  religious: 'bg-brand-50 text-brand-700 ring-brand-200',
  salary: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  school: 'bg-sky-50 text-sky-700 ring-sky-200',
  seasonal: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function getCountdown(slug: string): CountdownDef | undefined {
  return COUNTDOWNS.find((c) => c.slug === slug);
}

function parseIso(value: string): GregorianDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

function jdn(d: GregorianDate): number {
  return gregorianToJdn(d.year, d.month, d.day);
}

/**
 * Every future occurrence needed by the UI (max `limit`), already adjusted for
 * the Saudi weekend rule where the schedule asks for it.
 */
export function occurrences(def: CountdownDef, from: GregorianDate, limit = 3): GregorianDate[] {
  const fromJdn = jdn(from);
  const out: GregorianDate[] = [];
  const s = def.schedule;

  if (s.type === 'gregorian-annual') {
    for (let i = 0; out.length < limit && i < limit + 2; i++) {
      const candidate = { year: from.year + i, month: s.month, day: s.day };
      if (jdn(candidate) >= fromJdn) out.push(candidate);
    }
    return out.slice(0, limit);
  }

  if (s.type === 'hijri-annual') {
    const h = gregorianToHijri(from.year, from.month, from.day);
    for (let i = 0; out.length < limit && i < limit + 2; i++) {
      const candidate = hijriToGregorian({ year: h.year + i, month: s.hijriMonth, day: s.hijriDay });
      if (jdn(candidate) >= fromJdn) out.push(candidate);
    }
    return out.slice(0, limit);
  }

  if (s.type === 'monthly') {
    for (let offset = 0; out.length < limit && offset < limit + 3; offset++) {
      const month = ((from.month - 1 + offset) % 12) + 1;
      const year = from.year + Math.floor((from.month - 1 + offset) / 12);
      const scheduled: GregorianDate = { year, month, day: s.dayOfMonth };
      const adjusted = s.weekendRule === false ? scheduled : applyWeekendRule(scheduled);
      if (jdn(adjusted) >= fromJdn) out.push(adjusted);
    }
    return out.slice(0, limit);
  }

  return s.dates
    .map(parseIso)
    .filter((d): d is GregorianDate => d !== null)
    .filter((d) => jdn(d) >= fromJdn)
    .sort((a, b) => jdn(a) - jdn(b))
    .slice(0, limit);
}

export function nextOccurrence(def: CountdownDef, from: GregorianDate): GregorianDate | null {
  return occurrences(def, from, 1)[0] ?? null;
}

/** Title enriched with the Hijri year or the National Day edition number. */
export function displayTitle(def: CountdownDef, date: GregorianDate | null): string {
  if (!date) return def.title;
  const s = def.schedule;
  if (s.type === 'gregorian-annual' && s.editionBase) {
    return `${def.title} ${date.year - s.editionBase}`;
  }
  if (s.type === 'hijri-annual' && s.showHijriYear) {
    const h = gregorianToHijri(date.year, date.month, date.day);
    return `${def.title} ${h.year}هـ`;
  }
  return def.title;
}

export function resolveCountdown(def: CountdownDef, from: GregorianDate): ResolvedCountdown {
  const upcoming = occurrences(def, from, 3);
  const date = upcoming[0] ?? null;
  const hijri = date ? gregorianToHijri(date.year, date.month, date.day) : null;
  return {
    def,
    date,
    hijri,
    displayTitle: displayTitle(def, date),
    gregorianText: date ? formatGregorian(date) : '—',
    hijriText: hijri ? formatHijri(hijri) : '—',
    weekdayText: date ? weekdayName(date) : '—',
    daysRemaining: date ? Math.max(0, jdn(date) - jdn(from)) : -1,
    upcoming,
  };
}

/** All countdowns, nearest first; schedules with no future date go last. */
export function resolveAll(from: GregorianDate): ResolvedCountdown[] {
  return COUNTDOWNS.map((def) => resolveCountdown(def, from)).sort((a, b) => {
    if (a.date && b.date) return a.daysRemaining - b.daysRemaining;
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

export function resolveRelated(def: CountdownDef, from: GregorianDate): ResolvedCountdown[] {
  return def.related
    .map((slug) => getCountdown(slug))
    .filter((d): d is CountdownDef => Boolean(d))
    .map((d) => resolveCountdown(d, from));
}

/** ISO date (YYYY-MM-DD) — used for schema.org Event payloads. */
export function isoDate(d: GregorianDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

/** Days between two dates without clamping — handy for progress bars. */
export function daysBetweenDates(a: GregorianDate, b: GregorianDate): number {
  return jdn(b) - jdn(a);
}

export function addDaysTo(d: GregorianDate, days: number): GregorianDate {
  return jdnToGregorian(jdn(d) + days);
}
