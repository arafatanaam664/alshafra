/**
 * Compatibility re-export. Hijri math lives in `@alshafra/calendar`.
 * Existing app imports (`./hijri`) stay valid — URLs and calculations unchanged.
 */
export type { HijriDate, GregorianDate } from '@alshafra/calendar';
export {
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  ARABIC_WEEKDAYS,
  SITE_TIMEZONE,
  gregorianToJdn,
  jdnToGregorian,
  jdnToHijri,
  isUmmAlQuraExact,
  hijriMonthLength,
  hijriMonthLengths,
  isHijriLeapYear,
  gregorianToHijri,
  hijriToJdn,
  hijriToGregorian,
  formatHijri,
  formatHijriShort,
  formatGregorian,
  formatGregorianShort,
  weekdayIndex,
  weekdayName,
  todayGregorian,
  todayHijri,
  gregorianToHijriFromToday,
  parseGregorianShort,
  parseHijriShort,
  daysBetween,
  addDays,
} from '@alshafra/calendar';
