import rawCountdowns from '../data/countdowns.json';
import type { GregorianDate, HijriDate } from './hijri';
import {
  daysBetween,
  formatGregorian,
  formatGregorianShort,
  formatHijri,
  gregorianToHijri,
  hijriToGregorian,
  parseGregorianShort,
  todayGregorian,
  weekdayName,
} from './hijri';
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  SALARY_SCHEDULES,
  nextSalaryDate,
  type EventCategory,
} from './events';

export type CountdownTarget =
  | { type: 'fixed'; date: string }
  | ({ type: 'hijri' } & HijriDate)
  | { type: 'salary'; scheduleId: string };

export interface CountdownDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  category: EventCategory;
  emoji: string;
  keywords: string;
  description: string;
  target: CountdownTarget;
  source: string;
}

export interface ResolvedCountdown extends CountdownDefinition {
  date: GregorianDate;
  hijri: HijriDate;
  daysRemaining: number;
  gregorianText: string;
  hijriText: string;
  weekdayText: string;
  shortGregorian: string;
  categoryLabel: string;
  categoryStyle: string;
}

export const COUNTDOWNS = rawCountdowns as CountdownDefinition[];

export function resolveCountdown(def: CountdownDefinition, from: GregorianDate = todayGregorian()): ResolvedCountdown {
  const date = resolveTargetDate(def.target, from);
  const hijri = gregorianToHijri(date.year, date.month, date.day);
  return {
    ...def,
    date,
    hijri,
    daysRemaining: Math.max(0, daysBetween(from, date)),
    gregorianText: formatGregorian(date),
    hijriText: formatHijri(hijri),
    weekdayText: weekdayName(date),
    shortGregorian: formatGregorianShort(date),
    categoryLabel: CATEGORY_LABELS[def.category],
    categoryStyle: CATEGORY_STYLES[def.category],
  };
}

export function resolveCountdowns(from: GregorianDate = todayGregorian()): ResolvedCountdown[] {
  return COUNTDOWNS.map((c) => resolveCountdown(c, from)).sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function findCountdown(slug: string, from: GregorianDate = todayGregorian()): ResolvedCountdown | undefined {
  const def = COUNTDOWNS.find((c) => c.slug === slug);
  return def ? resolveCountdown(def, from) : undefined;
}

export function countdownsByCategory(from: GregorianDate = todayGregorian()): Record<EventCategory, ResolvedCountdown[]> {
  return resolveCountdowns(from).reduce(
    (acc, c) => {
      acc[c.category].push(c);
      return acc;
    },
    { religious: [], national: [], school: [], salary: [], seasonal: [] } as Record<EventCategory, ResolvedCountdown[]>,
  );
}

function resolveTargetDate(target: CountdownTarget, from: GregorianDate): GregorianDate {
  if (target.type === 'fixed') {
    const parsed = parseGregorianShort(target.date);
    if (!parsed) throw new Error(`Invalid countdown date: ${target.date}`);
    return parsed;
  }

  if (target.type === 'hijri') {
    return hijriToGregorian({ year: target.year, month: target.month, day: target.day });
  }

  const schedule = SALARY_SCHEDULES.find((s) => s.id === target.scheduleId);
  if (!schedule) throw new Error(`Unknown salary schedule: ${target.scheduleId}`);
  return nextSalaryDate(schedule, from);
}
