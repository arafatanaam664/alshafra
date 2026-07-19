// Hijri (Umm Al-Qura) date conversion utilities.
// Uses the Kuwaiti/arithmetical algorithm (a well-known tabular approximation
// of the Umm Al-Qura calendar) for deterministic, offline conversion. This is
// the same family of arithmetical rules used by many Saudi calendar sites and
// is accurate to within ±1 day for the vast majority of dates. For official
// legal matters, always cross-check with the official Umm Al-Qura calendar.

export interface HijriDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..30
}

export interface GregorianDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const GREGORIAN_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

// Convert Gregorian Y/M/D to a Julian Day Number (integer).
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Convert Julian Day Number to Gregorian Y/M/D.
export function jdnToGregorian(jdn: number): GregorianDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// Convert Julian Day Number to Hijri Y/M/D using the arithmetical (tabular) algorithm.
export function jdnToHijri(jdn: number): HijriDate {
  const l1 = jdn - 1948440;
  const cycles = Math.floor(l1 / 10631);
  const remaining = l1 - 10631 * cycles;
  let year = 30 * cycles + 1;
  let month = 1;
  let day = 1;

  if (remaining < 354) {
    year += Math.floor(remaining / 355);
    day = (remaining % 355) + 1;
  } else {
    year += 10;
    const l2 = remaining - 354;
    const extraCycles = Math.floor(l2 / 10631);
    const extraRemaining = l2 - 10631 * extraCycles;
    year += 30 * extraCycles;
    if (extraRemaining < 354) {
      year += Math.floor(extraRemaining / 355);
      day = (extraRemaining % 355) + 1;
    } else {
      year += 10;
      const l3 = extraRemaining - 354;
      const c2 = Math.floor(l3 / 10631);
      const r2 = l3 - 10631 * c2;
      year += 30 * c2;
      year += Math.floor(r2 / 355);
      day = (r2 % 355) + 1;
    }
  }

  // Determine month by accumulating month lengths.
  const monthLengths = hijriMonthLengths(year);
  let cumulative = 0;
  for (let i = 0; i < 12; i++) {
    if (cumulative + monthLengths[i] >= day) {
      month = i + 1;
      day = day - cumulative;
      break;
    }
    cumulative += monthLengths[i];
  }

  return { year, month, day };
}

// Length of each Hijri month for a given year (arithmetical rule).
export function hijriMonthLengths(year: number): number[] {
  // Common: odd months 30, even months 29; leap year adds 1 to last month.
  const isLeap = isHijriLeapYear(year);
  return [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isLeap ? 30 : 29];
}

export function isHijriLeapYear(year: number): boolean {
  return (year * 11 + 14) % 30 < 11;
}

export function gregorianToHijri(year: number, month: number, day: number): HijriDate {
  return jdnToHijri(gregorianToJdn(year, month, day));
}

export function hijriToJdn(h: HijriDate): number {
  // Arithmetical epoch: 1 Muharram 1 AH = JDN 1948440.
  let jdn = 1948440;
  // Add full years prior.
  for (let y = 1; y < h.year; y++) {
    jdn += isHijriLeapYear(y) ? 355 : 354;
  }
  const lengths = hijriMonthLengths(h.year);
  for (let m = 1; m < h.month; m++) {
    jdn += lengths[m - 1];
  }
  jdn += h.day - 1;
  return jdn;
}

export function hijriToGregorian(h: HijriDate): GregorianDate {
  return jdnToGregorian(hijriToJdn(h));
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year}هـ`;
}

export function formatHijriShort(h: HijriDate): string {
  return `${h.year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
}

export function formatGregorian(g: GregorianDate): string {
  return `${g.day} ${GREGORIAN_MONTHS[g.month - 1]} ${g.year}م`;
}

export function formatGregorianShort(g: GregorianDate): string {
  return `${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
}

export function weekdayIndex(g: GregorianDate): number {
  const jdn = gregorianToJdn(g.year, g.month, g.day);
  // JDN 0 was a Monday; (jdn + 1) % 7 => 0=Sunday..6=Saturday
  return (jdn + 1) % 7;
}

export function weekdayName(g: GregorianDate): string {
  return ARABIC_WEEKDAYS[weekdayIndex(g)];
}

export function todayGregorian(): GregorianDate {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function todayHijri(): HijriDate {
  return gregorianToHijriFromToday();
}

export function gregorianToHijriFromToday(): HijriDate {
  const t = todayGregorian();
  return gregorianToHijri(t.year, t.month, t.day);
}

export function parseGregorianShort(s: string): GregorianDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

export function parseHijriShort(s: string): HijriDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

// Days between two Gregorian dates (b - a).
export function daysBetween(a: GregorianDate, b: GregorianDate): number {
  return gregorianToJdn(b.year, b.month, b.day) - gregorianToJdn(a.year, a.month, a.day);
}

// Add days to a Gregorian date.
export function addDays(g: GregorianDate, days: number): GregorianDate {
  return jdnToGregorian(gregorianToJdn(g.year, g.month, g.day) + days);
}
