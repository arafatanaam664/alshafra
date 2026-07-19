import type { GregorianDate } from './hijri';
import { gregorianToHijri, formatHijri, formatGregorian, weekdayName, gregorianToJdn } from './hijri';

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
  hijriNote?: string;
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
    date: { year: 2026, month: 6, day: 15 },
    hijriNote: '1 محرم 1448هـ',
    description:
      'بداية العام الهجري الجديد 1448هـ. عطلة رسمية في المملكة تُحيي ذكرى هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '📅',
  },
  {
    id: 'school-return-1448',
    title: 'عودة المعلمين والمعلمات',
    category: 'school',
    date: { year: 2026, month: 8, day: 16 },
    hijriNote: '3 ربيع الأول 1448هـ',
    description: 'موعد عودة المعلمين والمعلمات إلى المدارس لبداية العام الدراسي 1448-1449هـ.',
    isHoliday: false,
    emoji: '🏫',
  },
  {
    id: 'school-start-1448',
    title: 'بداية العام الدراسي 1448-1449هـ',
    category: 'school',
    date: { year: 2026, month: 8, day: 23 },
    hijriNote: '10 ربيع الأول 1448هـ',
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
    hijriNote: '23 ربيع الأول 1448هـ',
    description:
      'يصادف 23 سبتمبر من كل عام ذكرى توحيد المملكة العربية السعودية على يد الملك عبدالعزيز آل سعود عام 1351هـ/1932م. عطلة رسمية وطنية.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '🇸🇦',
  },
  {
    id: 'fall-break-1448',
    title: 'إجازة منتصف الفصل الدراسي الأول',
    category: 'school',
    date: { year: 2026, month: 10, day: 25 },
    hijriNote: '14 ربيع الآخر 1448هـ',
    description: 'إجازة منتصف الفصل الدراسي الأول للعام الدراسي 1448-1449هـ وفق تقويم وزارة التعليم.',
    isHoliday: true,
    holidayDays: 4,
    emoji: '🍂',
  },
  {
    id: 'armed-forces-day',
    title: 'يوم القوات المسلحة السعودية',
    category: 'national',
    date: { year: 2026, month: 10, day: 6 },
    hijriNote: '24 ربيع الآخر 1448هـ',
    description:
      'يُصادف 6 أكتوبر من كل عام ذكرى انتصارات حرب أكتوبر 1973م. يُحتفل به تكريماً للقوات المسلحة السعودية.',
    isHoliday: false,
    emoji: '🎖️',
  },
  {
    id: 'midyear-break-1448',
    title: 'إجازة منتصف العام الدراسي',
    category: 'school',
    date: { year: 2027, month: 1, day: 24 },
    hijriNote: '15 جمادى الأولى 1448هـ',
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
    hijriNote: '11 ذو القعدة 1448هـ',
    description:
      'يُحتفل باليوم الوطني للعلم السعودي في 11 مارس من كل عام، إحياءً لذكرى توحيد العلم السعودي على شكله الحالي عام 1937م.',
    isHoliday: false,
    emoji: '🏁',
  },
  {
    id: 'spring-break-1448',
    title: 'إجازة منتصف الفصل الدراسي الثاني',
    category: 'school',
    date: { year: 2027, month: 3, day: 28 },
    hijriNote: '18 ذو القعدة 1448هـ',
    description: 'إجازة منتصف الفصل الدراسي الثاني للعام الدراسي 1448-1449هـ.',
    isHoliday: true,
    holidayDays: 4,
    emoji: '🌸',
  },
  {
    id: 'founders-day-1448',
    title: 'يوم التأسيس السعودي',
    category: 'national',
    date: { year: 2027, month: 2, day: 22 },
    hijriNote: '22 شوال 1448هـ',
    description:
      'يصادف 22 شوال من كل عام هجري ذكرى تأسيس الدولة السعودية الأولى عام 1139هـ على يد الإمام محمد بن سعود. يوم وطني يُحيي فيه السعوديون إرثهم التاريخي.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '🇸🇦',
  },
  {
    id: 'ramadan-start-1448',
    title: 'مطلع شهر رمضان المبارك 1448هـ',
    category: 'religious',
    date: { year: 2027, month: 2, day: 18 },
    hijriNote: '1 رمضان 1448هـ',
    description:
      'بداية شهر رمضان المبارك للعام الهجري 1448هـ، شهر الصيام والقيام وتلاوة القرآن. تُعلن رؤية الهلال رسمياً من قبل المحكمة العليا.',
    isHoliday: false,
    emoji: '🌙',
  },
  {
    id: 'eid-fitr-1448',
    title: 'عيد الفطر المبارك 1448هـ',
    category: 'religious',
    date: { year: 2027, month: 3, day: 19 },
    hijriNote: '1 شوال 1448هـ',
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
    date: { year: 2027, month: 7, day: 18 },
    hijriNote: '9 ذو الحجة 1448هـ',
    description:
      'يوم عرفة، أعظم أيام السنة عند المسلمين، يقف فيه حجاج بيت الله الحرام على عرفات. يُستحب صيامه لغير الحجاج.',
    isHoliday: true,
    holidayDays: 1,
    emoji: '🕋',
  },
  {
    id: 'eid-adha-1448',
    title: 'عيد الأضحى المبارك 1448هـ',
    category: 'religious',
    date: { year: 2027, month: 7, day: 19 },
    hijriNote: '10 ذو الحجة 1448هـ',
    description:
      'يبدأ عيد الأضحى المبارك في 10 ذو الحجة 1448هـ، ويستمر أربعة أيام. تُقام صلاة العيد ويُضحى بالأضاحي تقرّباً إلى الله.',
    isHoliday: true,
    holidayDays: 4,
    emoji: '🐏',
  },
  {
    id: 'school-end-1448',
    title: 'نهاية العام الدراسي 1448-1449هـ',
    category: 'school',
    date: { year: 2027, month: 5, day: 27 },
    hijriNote: '21 محرم 1449هـ',
    description: 'نهاية اختبارات الفصل الدراسي الثالث وبداية إجازة الصيف للعام الدراسي 1448-1449هـ.',
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
}

export const SALARY_SCHEDULES: SalarySchedule[] = [
  {
    id: 'employee-salaries',
    title: 'رواتب الموظفين الحكوميين',
    description:
      'تصرف رواتب موظفي الحكومة في المملكة عادةً في اليوم الأخير من كل شهر ميلادي أو بداية الشهر التالي، وفق تقويم وزارة المالية.',
    dayOfMonth: 27,
    category: 'employee',
    accent: 'from-brand-600 to-brand-500',
    icon: 'Briefcase',
  },
  {
    id: 'citizen-account',
    title: 'حساب المواطن',
    description:
      'يُصرف دعم حساب المواطن في اليوم العاشر من كل شهر ميلادي. يهدف البرنامج إلى إعادة توجيه الدعم الحكومي للأسر المستحقة.',
    dayOfMonth: 10,
    category: 'citizen',
    accent: 'from-gold-600 to-gold-500',
    icon: 'Users',
  },
  {
    id: 'retiree-salaries',
    title: 'رواتب المتقاعدين',
    description:
      'تُودع رواتب المتقاعدين في اليوم الخامس والعشرين من كل شهر ميلادي وفق المؤسسة العامة للتقاعد.',
    dayOfMonth: 25,
    category: 'retiree',
    accent: 'from-brand-700 to-brand-600',
    icon: 'HandCoins',
  },
  {
    id: 'social-security',
    title: 'الضمان الاجتماعي المطوّر',
    description:
      'يُصرف راتب الضمان الاجتماعي المطوّر في اليوم الأول من كل شهر ميلادي للمستفيدين المستحقين وفق وزارة الموارد البشرية والتنمية الاجتماعية.',
    dayOfMonth: 1,
    category: 'pension',
    accent: 'from-emerald-700 to-emerald-500',
    icon: 'ShieldCheck',
  },
  {
    id: 'housing-support',
    title: 'الدعم السكني',
    description:
      'يُصرف الدعم السكني في الرابع والعشرين من كل شهر ميلادي للمستفيدين من برنامج سكني.',
    dayOfMonth: 24,
    category: 'housing',
    accent: 'from-amber-700 to-amber-500',
    icon: 'Home',
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

export function nextSalaryDate(schedule: SalarySchedule, from: GregorianDate): GregorianDate {
  if (from.day > schedule.dayOfMonth) {
    return {
      year: from.month === 12 ? from.year + 1 : from.year,
      month: from.month === 12 ? 1 : from.month + 1,
      day: schedule.dayOfMonth,
    };
  }
  return { year: from.year, month: from.month, day: schedule.dayOfMonth };
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
  return Math.max(
    0,
    gregorianToJdn(event.date.year, event.date.month, event.date.day) -
      gregorianToJdn(from.year, from.month, from.day),
  );
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
