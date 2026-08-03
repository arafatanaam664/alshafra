// Hijri (Umm Al-Qura) date conversion utilities.
//
// Primary engine: the ICU `islamic-umalqura` calendar exposed through
// `Intl.DateTimeFormat`. This is the SAME data table used by the official Umm
// Al-Qura calendar (KACST) and is available in every modern browser and in
// Node 18+ (full-icu). It is exact, not an approximation.
//
// Fallback engine: the Kuwaiti/arithmetical tabular algorithm, used only when
// ICU is unavailable (very old browsers / small-icu Node builds). The tabular
// algorithm drifts up to ±2 days from Umm Al-Qura, which is why it must never
// be the primary source for a Saudi calendar site.

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

// --- Umm Al-Qura (ICU) engine -----------------------------------------------

let umFormatter: Intl.DateTimeFormat | null | undefined;

/** Returns an ICU formatter bound to the Umm Al-Qura calendar, or null. */
function getUmFormatter(): Intl.DateTimeFormat | null {
  if (umFormatter !== undefined) return umFormatter;
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    });
    // Sanity check against a known Umm Al-Qura anchor:
    // 1 Muharram 1448 AH === 16 June 2026 CE.
    const probe = readUmParts(f, new Date(Date.UTC(2026, 5, 16)));
    if (probe && probe.year === 1448 && probe.month === 1 && probe.day === 1) {
      umFormatter = f;
      return f;
    }
    umFormatter = null;
  } catch {
    umFormatter = null;
  }
  return umFormatter;
}

function readUmParts(f: Intl.DateTimeFormat, date: Date): HijriDate | null {
  const parts = f.formatToParts(date);
  const pick = (type: string) => {
    const raw = parts.find((p) => p.type === type)?.value ?? '';
    const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : NaN;
  };
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return { year, month, day };
}

/** True when the exact Umm Al-Qura table is being used (not the approximation). */
export function isUmmAlQuraExact(): boolean {
  return getUmFormatter() !== null;
}

// Convert Julian Day Number to Hijri Y/M/D using the arithmetical (tabular) algorithm.
export function jdnToHijri(jdn: number): HijriDate {
  const days = jdn - 1948440;
  let year = Math.floor(days / 354.367) + 1;

  while (hijriToJdn({ year, month: 1, day: 1 }) > jdn) year--;
  while (hijriToJdn({ year: year + 1, month: 1, day: 1 }) <= jdn) year++;

  const dayOfYear = jdn - hijriToJdn({ year, month: 1, day: 1 });
  const monthLengths = hijriMonthLengths(year);
  let month = 1;
  let day = dayOfYear + 1;
  for (let i = 0; i < 12; i++) {
    if (day <= monthLengths[i]) {
      month = i + 1;
      break;
    }
    day -= monthLengths[i];
  }

  return { year, month, day };
}

// Length of each Hijri month for a given year — tabular (fallback) rule only.
function tabularMonthLengths(year: number): number[] {
  // Common: odd months 30, even months 29; leap year adds 1 to last month.
  const isLeap = isHijriLeapYear(year);
  return [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isLeap ? 30 : 29];
}

export function isHijriLeapYear(year: number): boolean {
  return (year * 11 + 14) % 30 < 11;
}

/** Real length (29 or 30) of a Hijri month, from the Umm Al-Qura table. */
export function hijriMonthLength(year: number, month: number): number {
  if (!getUmFormatter()) return tabularMonthLengths(year)[month - 1];
  const start = hijriToJdn({ year, month, day: 1 });
  const next =
    month === 12
      ? { year: year + 1, month: 1, day: 1 }
      : { year, month: month + 1, day: 1 };
  const len = hijriToJdn(next) - start;
  return len === 29 || len === 30 ? len : tabularMonthLengths(year)[month - 1];
}

export function hijriMonthLengths(year: number): number[] {
  return Array.from({ length: 12 }, (_, i) => hijriMonthLength(year, i + 1));
}

export function gregorianToHijri(year: number, month: number, day: number): HijriDate {
  const f = getUmFormatter();
  if (f) {
    const h = readUmParts(f, new Date(Date.UTC(year, month - 1, day)));
    if (h) return h;
  }
  return jdnToHijri(gregorianToJdn(year, month, day));
}

/** Tabular (approximate) Hijri -> JDN, used as a search seed and as fallback. */
function tabularHijriToJdn(h: HijriDate): number {
  // Arithmetical epoch: 1 Muharram 1 AH = JDN 1948440.
  let jdn = 1948440;
  // Add full years prior.
  for (let y = 1; y < h.year; y++) {
    jdn += isHijriLeapYear(y) ? 355 : 354;
  }
  const lengths = tabularMonthLengths(h.year);
  for (let m = 1; m < h.month; m++) {
    jdn += lengths[m - 1];
  }
  jdn += h.day - 1;
  return jdn;
}

export function hijriToJdn(h: HijriDate): number {
  const seed = tabularHijriToJdn(h);
  if (!getUmFormatter()) return seed;
  // The tabular value is within a few days of Umm Al-Qura; search outwards
  // until the round-trip conversion matches exactly.
  for (let delta = 0; delta <= 20; delta++) {
    const candidates = delta === 0 ? [seed] : [seed - delta, seed + delta];
    for (const jdn of candidates) {
      const g = jdnToGregorian(jdn);
      const back = gregorianToHijri(g.year, g.month, g.day);
      if (back.year === h.year && back.month === h.month && back.day === h.day) return jdn;
    }
  }
  return seed;
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

/** Saudi Arabia is the reference timezone for every date shown on the site. */
export const SITE_TIMEZONE = 'Asia/Riyadh';

/**
 * "Today" in Riyadh, not in the visitor's timezone. A user in Morocco or
 * Indonesia must see the same Saudi date as a user in Riyadh, otherwise
 * countdowns and payday dates are off by a day.
 */
export function todayGregorian(): GregorianDate {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: SITE_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const pick = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const year = pick('year');
    const month = pick('month');
    const day = pick('day');
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return { year, month, day };
    }
  } catch {
    // fall through to local time
  }
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
