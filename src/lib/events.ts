import schoolCalendar from '../data/school-calendar.json';
import holidayGuide from '../data/holiday-guide.json';
import type { GregorianDate } from './hijri';
import { approvedSchoolEvents } from './school-trust.mjs';
import {
  gregorianToHijri,
  hijriToGregorian,
  formatHijri,
  weekdayIndex,
  gregorianToJdn,
  jdnToGregorian,
  todayGregorian,
} from './hijri';

/**
 * Calculate the Gregorian equivalent using the browser calendar or fallback.
 * Religious dates remain subject to official announcements.
 */
export function hijriEvent(year: number, month: number, day: number): GregorianDate {
  return hijriToGregorian({ year, month, day });
}

export type EventCategory =
  | 'religious'
  | 'national'
  | 'school'
  | 'salary'
  | 'seasonal';

export interface SaudiEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: GregorianDate;
  description: string;
  isHoliday: boolean;
  emoji?: string;
  source?: { url: string; label: string; verifiedAt: string };
}

export const SAUDI_EVENTS: SaudiEvent[] = [
  {
    id: 'hijri-new-year-1448',
    title: 'رأس السنة الهجرية 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 1, 1),
    description:
      'بداية العام الهجري الجديد 1448هـ بحساب المتصفح؛ قد يكون تقريبياً عند عدم توفر تقويم أم القرى.',
    isHoliday: false,
    emoji: '📅',
  },
  {
    id: 'national-day-2026',
    title: 'اليوم الوطني السعودي',
    category: 'national',
    date: { year: 2026, month: 9, day: 23 },
    description:
      'يصادف 23 سبتمبر من كل عام ذكرى توحيد المملكة العربية السعودية على يد الملك عبدالعزيز آل سعود عام 1351هـ/1932م. عطلة رسمية وطنية.',
    isHoliday: true,
    emoji: '🇸🇦',
    source: { url: holidayGuide.sources[0].url, label: 'وزارة الموارد البشرية والتنمية الاجتماعية', verifiedAt: holidayGuide.verifiedAt },
  },
  {
    id: 'founders-day-1448',
    title: 'يوم التأسيس السعودي',
    category: 'national',
    date: { year: 2027, month: 2, day: 22 },
    description:
      'يصادف 22 فبراير من كل عام ميلادي ذكرى تأسيس الدولة السعودية الأولى عام 1139هـ على يد الإمام محمد بن سعود. يوم وطني؛ تختلف الإجازة والتعويض بحسب اللوائح والجهة.',
    isHoliday: true,
    emoji: '🇸🇦',
    source: { url: holidayGuide.sources[0].url, label: 'وزارة الموارد البشرية والتنمية الاجتماعية', verifiedAt: holidayGuide.verifiedAt },
  },
  {
    id: 'ramadan-start-1448',
    title: 'مطلع شهر رمضان المبارك 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 9, 1),
    description:
      'بداية شهر رمضان المبارك للعام الهجري 1448هـ، شهر الصيام والقيام وتلاوة القرآن. تُعلن رؤية الهلال رسمياً من قبل المحكمة العليا.',
    isHoliday: false,
    emoji: '🌙',
  },
  {
    id: 'eid-fitr-1448',
    title: 'عيد الفطر المبارك 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 10, 1),
    description:
      'يبدأ عيد الفطر المبارك في 1 شوال 1448هـ بعد صيام شهر رمضان. التحويل حسابي ويخضع للإعلان الرسمي؛ تختلف الإجازة حسب الجهة واللوائح.',
    isHoliday: true,
    emoji: '🎉',
  },
  {
    id: 'arafat-1448',
    title: 'وقفة عرفة 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 12, 9),
    description:
      'يوم عرفة، أعظم أيام السنة عند المسلمين، يقف فيه حجاج بيت الله الحرام على عرفات. يُستحب صيامه لغير الحجاج.',
    isHoliday: true,
    emoji: '🕋',
  },
  {
    id: 'eid-adha-1448',
    title: 'عيد الأضحى المبارك 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 12, 10),
    description:
      'يوافق عيد الأضحى 10 ذو الحجة؛ التحويل حسابي ويخضع للإعلان الرسمي، وتختلف الإجازة حسب الجهة واللوائح.',
    isHoliday: true,
    emoji: '🐏',
  },
  {
    id: 'hijri-new-year-1449',
    title: 'رأس السنة الهجرية 1449هـ',
    category: 'religious',
    date: hijriEvent(1449, 1, 1),
    description:
      'بداية العام الهجري الجديد 1449هـ بحساب المتصفح؛ قد يكون تقريبياً عند عدم توفر تقويم أم القرى.',
    isHoliday: false,
    emoji: '📅',
  },
];

/** Mechanical weekend adjustment only; this is not a verified payment schedule. */
export function applyWeekendRule(date: GregorianDate): GregorianDate {
  const jdn = gregorianToJdn(date.year, date.month, date.day);
  const wd = weekdayIndex(date); // 0=Sunday .. 5=Friday, 6=Saturday
  if (wd === 5) return jdnToGregorian(jdn - 1); // Friday -> Thursday
  if (wd === 6) return jdnToGregorian(jdn + 1); // Saturday -> Sunday
  return date;
}

export function schoolEventsForDay(today: GregorianDate): SaudiEvent[] {
  return approvedSchoolEvents(schoolCalendar, today).map(event => {
    const [year, month, day] = event.date.split('-').map(Number);
    return { id: event.id, title: event.title, category: 'school', date: { year, month, day }, description: `حسب وزارة التعليم؛ آخر تحقق ${event.verification.verifiedAt}. راجع المصدر لأي تحديث.`, isHoliday: event.holiday, emoji: '🏫', source: { url: schoolCalendar.source, label: 'وزارة التعليم', verifiedAt: event.verification.verifiedAt } };
  });
}

export function eventsByCategory(category: EventCategory): SaudiEvent[] {
  return [...SAUDI_EVENTS, ...schoolEventsForDay(todayGregorian())].filter((e) => e.category === category);
}

export function upcomingEvents(from: GregorianDate, limit = 6): SaudiEvent[] {
  const fromJdn = gregorianToJdn(from.year, from.month, from.day);
  return [...SAUDI_EVENTS, ...schoolEventsForDay(from)]
    .filter((e) => gregorianToJdn(e.date.year, e.date.month, e.date.day) >= fromJdn)
    .sort(
      (a, b) =>
        gregorianToJdn(a.date.year, a.date.month, a.date.day) -
        gregorianToJdn(b.date.year, b.date.month, b.date.day),
    )
    .slice(0, limit);
}

export function daysUntilEvent(event: SaudiEvent, from: GregorianDate): number {
  return Math.max(0, rawDaysUntilEvent(event, from));
}

/** Signed day difference — negative for events that already happened. */
export function rawDaysUntilEvent(event: SaudiEvent, from: GregorianDate): number {
  return (
    gregorianToJdn(event.date.year, event.date.month, event.date.day) -
    gregorianToJdn(from.year, from.month, from.day)
  );
}

/** The next holiday that has NOT passed yet (never a stale past holiday). */
export function nextHolidayAfter(from: GregorianDate): SaudiEvent | undefined {
  return upcomingEvents(from, SAUDI_EVENTS.length + schoolCalendar.events.length).find((e) => e.isHoliday);
}

/** Hijri text for an event, derived from the Umm Al-Qura table (never hardcoded). */
export function eventHijriText(event: SaudiEvent): string {
  return formatHijri(gregorianToHijri(event.date.year, event.date.month, event.date.day));
}

/** Arabic-correct duration label: «يوم واحد»، «يومان»، «4 أيام»، «12 يوماً». */
export function holidayDurationText(days: number): string {
  if (days === 1) return 'يوم واحد';
  if (days === 2) return 'يومان';
  if (days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  religious: 'دينية',
  national: 'وطنية',
  school: 'دراسية',
  salary: 'الرواتب',
  seasonal: 'موسمية',
};

export const CATEGORY_STYLES: Record<EventCategory, string> = {
  religious: 'bg-brand-50 text-brand-700 ring-brand-200',
  national: 'bg-gold-50 text-gold-700 ring-gold-200',
  school: 'bg-sky-50 text-sky-700 ring-sky-200',
  salary: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  seasonal: 'bg-rose-50 text-rose-700 ring-rose-200',
};
