import type { GregorianDate } from './hijri';
import { gregorianToJdn, jdnToGregorian, weekdayIndex } from './hijri';

/**
 * Official Saudi disbursement rule: Friday → previous Thursday;
 * Saturday → following Sunday.
 */
export function applyWeekendRule(date: GregorianDate): GregorianDate {
  const jdn = gregorianToJdn(date.year, date.month, date.day);
  const wd = weekdayIndex(date);
  if (wd === 5) return jdnToGregorian(jdn - 1);
  if (wd === 6) return jdnToGregorian(jdn + 1);
  return date;
}
