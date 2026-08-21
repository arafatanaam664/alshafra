import type { GregorianDate } from './hijri';
import {
  gregorianToHijri,
  hijriToGregorian,
  formatHijri,
  formatGregorian,
  weekdayName,
  gregorianToJdn,
} from './hijri';
import { applyWeekendRule } from '@alshafra/calendar';

export { applyWeekendRule };

/**
 * Gregorian date of a Hijri date, resolved through the Umm Al-Qura table.
 *
 * Religious dates used to be hand-typed Gregorian values here and several of
 * them were wrong by weeks (Eid Al-Adha 1448 was listed as 19 July 2027 while
 * 10 Dhul-Hijjah 1448 is 16 May 2027). Deriving them from the Hijri date makes
 * that class of error impossible: the Hijri day is the fact, the Gregorian day
 * is computed.
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
  holidayDays?: number;
  emoji?: string;
}

export const SAUDI_EVENTS: SaudiEvent[] = [
  {
    id: 'hijri-new-year-1448',
    title: 'رأس السنة الهجرية 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 1, 1),
    description:
      'بداية العام الهجري الجديد 1448هـ ومناسبة دينية وتقويمية. ليست إجازة عامة تلقائية في أنظمة العمل السعودية.',
    isHoliday: false,
    emoji: '📅',
  },
  {
    id: 'school-return-1448',
    title: 'عودة المعلمين والمعلمات',
    category: 'school',
    date: { year: 2026, month: 8, day: 16 },
    description: 'موعد عودة المعلمين والمعلمات إلى المدارس لبداية العام الدراسي 1448-1449هـ.',
    isHoliday: false,
    emoji: '🏫',
  },
  {
    id: 'school-start-1448',
    title: 'بداية العام الدراسي 1448-1449هـ',
    category: 'school',
    date: { year: 2026, month: 8, day: 23 },
    description:
      'بداية الدراسة للعام الدراسي 1448-1449هـ لجميع مراحل التعليم العام في المملكة العربية السعودية وفق تقويم وزارة التعليم.',
    isHoliday: false,
    emoji: '🎒',
  },
  {
    id: 'national-day-2026',
    title: 'اليوم الوطني السعودي',
    category: 'national',
    date: { year: 2026, month: 9, day: 23 },
    description:
      'يصادف 23 سبتمبر من كل عام ذكرى توحيد المملكة العربية السعودية على يد الملك عبدالعزيز آل سعود عام 1351هـ/1932م. عطلة رسمية وطنية.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '🇸🇦',
  },
  {
    id: 'fall-break-1448',
    title: 'إجازة الخريف',
    category: 'school',
    date: { year: 2026, month: 11, day: 20 },
    description: 'بداية إجازة الخريف للعام الدراسي 1448-1449هـ، ويُراجع موعد العودة في تقويم وزارة التعليم والمدرسة.',
    isHoliday: true,
    holidayDays: 9,
    emoji: '🍂',
  },
  {
    id: 'midyear-break-1448',
    title: 'إجازة منتصف العام الدراسي',
    category: 'school',
    date: { year: 2027, month: 1, day: 8 },
    description: 'إجازة منتصف العام الدراسي 1448-1449هـ بين الفصلين الأول والثاني.',
    isHoliday: true,
    holidayDays: 9,
    emoji: '✈️',
  },
  {
    id: 'flag-day-1448',
    title: 'يوم العلم السعودي',
    category: 'national',
    date: { year: 2027, month: 3, day: 11 },
    description:
      'يُحتفل باليوم الوطني للعلم السعودي في 11 مارس من كل عام، إحياءً لذكرى توحيد العلم السعودي على شكله الحالي عام 1937م.',
    isHoliday: false,
    emoji: '🏁',
  },
  {
    id: 'founders-day-1448',
    title: 'يوم التأسيس السعودي',
    category: 'national',
    date: { year: 2027, month: 2, day: 22 },
    description:
      'يصادف 22 فبراير من كل عام ميلادي ذكرى تأسيس الدولة السعودية الأولى عام 1139هـ على يد الإمام محمد بن سعود. يوم وطني وإجازة رسمية يُحيي فيها السعوديون إرثهم التاريخي، ويوافق هذا العام 15 رمضان 1448هـ.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '🇸🇦',
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
      'يبدأ عيد الفطر المبارك في 1 شوال 1448هـ بعد صيام شهر رمضان. تُقام صلاة العيد في المساجد والمصليات وتستمر الإجازة الرسمية عدة أيام.',
    isHoliday: true,
    holidayDays: 4,
    emoji: '🎉',
  },
  {
    id: 'arafat-1448',
    title: 'وقفة عرفة 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 12, 9),
    description:
      'يوم عرفة، أعظم أيام السنة عند المسلمين، يقف فيه حجاج بيت الله الحرام على عرفات. يُستحب صيامه لغير الحجاج.',
    isHoliday: false,
    emoji: '🕋',
  },
  {
    id: 'eid-adha-1448',
    title: 'عيد الأضحى المبارك 1448هـ',
    category: 'religious',
    date: hijriEvent(1448, 12, 10),
    description:
      'يبدأ عيد الأضحى المبارك في 10 ذو الحجة 1448هـ، ويستمر أربعة أيام. تُقام صلاة العيد ويُضحى بالأضاحي تقرّباً إلى الله.',
    isHoliday: true,
    holidayDays: 4,
    emoji: '🐏',
  },
  {
    id: 'hijri-new-year-1449',
    title: 'رأس السنة الهجرية 1449هـ',
    category: 'religious',
    date: hijriEvent(1449, 1, 1),
    description:
      'بداية العام الهجري الجديد 1449هـ وفق تقويم أم القرى. مناسبة تقويمية وليست إجازة عامة تلقائية في السعودية.',
    isHoliday: false,
    emoji: '📅',
  },
  {
    id: 'school-end-1448',
    title: 'نهاية العام الدراسي 1448-1449هـ',
    category: 'school',
    date: { year: 2027, month: 6, day: 24 },
    description: 'نهاية الإطار العام للعام الدراسي بنظام الفصلين وبداية الإجازة الصيفية؛ ويُراجع تقويم المنطقة والمدرسة للتأكيد.',
    isHoliday: true,
    holidayDays: 75,
    emoji: '☀️',
  },
];

export interface SalarySchedule {
  id: string;
  title: string;
  description: string;
  dayOfMonth: number;
  category: 'employee' | 'citizen' | 'retiree' | 'pension' | 'housing';
  accent: string;
  icon: string;
  /** Official reference the date is based on — an E-E-A-T signal for Google. */
  source?: { label: string; url: string };
}

export const SALARY_SCHEDULES: SalarySchedule[] = [
  {
    id: 'employee-salaries',
    title: 'رواتب الموظفين الحكوميين',
    description:
      'تُصرف رواتب موظفي الدولة في اليوم 27 من كل شهر ميلادي وفق جدول وزارة المالية المعتمد. إذا صادف يوم 27 يوم الجمعة يُصرف الراتب يوم الخميس الذي قبله، وإذا صادف يوم السبت يُصرف يوم الأحد الذي بعده.',
    dayOfMonth: 27,
    category: 'employee',
    accent: 'from-brand-600 to-brand-500',
    icon: 'Briefcase',
    source: { label: 'وزارة المالية', url: 'https://www.mof.gov.sa/mediacenter/Payroll/Pages/default.aspx' },
  },
  {
    id: 'citizen-account',
    title: 'حساب المواطن',
    description:
      'يُصرف دعم حساب المواطن في اليوم العاشر من كل شهر ميلادي للأسر المستحقة. إذا صادف اليوم العاشر يوم جمعة يُصرف الخميس الذي قبله، وإذا صادف السبت يُصرف الأحد الذي بعده.',
    dayOfMonth: 10,
    category: 'citizen',
    accent: 'from-gold-600 to-gold-500',
    icon: 'Users',
    source: { label: 'بوابة حساب المواطن', url: 'https://ca.gov.sa/' },
  },
  {
    id: 'retiree-salaries',
    title: 'رواتب المتقاعدين',
    description:
      'وحّدت المؤسسة العامة للتأمينات الاجتماعية موعد صرف معاشات المتقاعدين (المدني والعسكري والتأمينات) ليكون اليوم الأول من كل شهر ميلادي. إذا صادف يوم جمعة يُصرف الخميس الذي قبله، وإذا صادف يوم سبت يُصرف الأحد الذي بعده.',
    dayOfMonth: 1,
    category: 'retiree',
    accent: 'from-brand-700 to-brand-600',
    icon: 'HandCoins',
    source: { label: 'التأمينات الاجتماعية', url: 'https://www.gosi.gov.sa/' },
  },
  {
    id: 'social-security',
    title: 'الضمان الاجتماعي المطوّر',
    description:
      'يُصرف معاش الضمان الاجتماعي المطوّر في اليوم الأول من كل شهر ميلادي للمستفيدين المستحقين وفق وزارة الموارد البشرية والتنمية الاجتماعية، مع التقديم إلى آخر يوم عمل إذا صادف عطلة نهاية الأسبوع.',
    dayOfMonth: 1,
    category: 'pension',
    accent: 'from-emerald-700 to-emerald-500',
    icon: 'ShieldCheck',
    source: { label: 'وزارة الموارد البشرية', url: 'https://hrsd.gov.sa/' },
  },
  {
    id: 'housing-support',
    title: 'الدعم السكني',
    description:
      'يُصرف الدعم السكني لمستفيدي برنامج «سكني» في اليوم 24 من كل شهر ميلادي. إذا صادف يوم جمعة يُصرف الخميس الذي قبله، وإذا صادف السبت يُصرف الأحد الذي بعده.',
    dayOfMonth: 24,
    category: 'housing',
    accent: 'from-amber-700 to-amber-500',
    icon: 'Home',
    source: { label: 'منصة سكني', url: 'https://sakani.sa/' },
  },
];

export interface SalaryInstance {
  schedule: SalarySchedule;
  date: GregorianDate;
  hijriText: string;
  gregorianText: string;
  weekdayText: string;
  daysRemaining: number;
}

/** The scheduled (pre-adjustment) date for a given month. */
function scheduledDate(schedule: SalarySchedule, year: number, month: number): GregorianDate {
  return { year, month, day: schedule.dayOfMonth };
}

export function nextSalaryDate(schedule: SalarySchedule, from: GregorianDate): GregorianDate {
  const fromJdn = gregorianToJdn(from.year, from.month, from.day);
  // Check this month, then the next two, and return the first adjusted date
  // that has not already passed (the weekend rule can pull a date backwards).
  for (let offset = 0; offset < 3; offset++) {
    const month = ((from.month - 1 + offset) % 12) + 1;
    const year = from.year + Math.floor((from.month - 1 + offset) / 12);
    const adjusted = applyWeekendRule(scheduledDate(schedule, year, month));
    if (gregorianToJdn(adjusted.year, adjusted.month, adjusted.day) >= fromJdn) return adjusted;
  }
  return applyWeekendRule(scheduledDate(schedule, from.year, from.month));
}

export function buildSalaryInstances(from: GregorianDate): SalaryInstance[] {
  return SALARY_SCHEDULES.map((s) => {
    const date = nextSalaryDate(s, from);
    const hijri = gregorianToHijri(date.year, date.month, date.day);
    const daysRemaining = Math.max(
      0,
      gregorianToJdn(date.year, date.month, date.day) - gregorianToJdn(from.year, from.month, from.day),
    );
    return {
      schedule: s,
      date,
      hijriText: formatHijri(hijri),
      gregorianText: formatGregorian(date),
      weekdayText: weekdayName(date),
      daysRemaining,
    };
  });
}

export function eventsByCategory(category: EventCategory): SaudiEvent[] {
  return SAUDI_EVENTS.filter((e) => e.category === category);
}

export function upcomingEvents(from: GregorianDate, limit = 6): SaudiEvent[] {
  const fromJdn = gregorianToJdn(from.year, from.month, from.day);
  return [...SAUDI_EVENTS]
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
  return upcomingEvents(from, SAUDI_EVENTS.length).find((e) => e.isHoliday);
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
