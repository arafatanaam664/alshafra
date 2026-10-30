import { gregorianToHijri, gregorianToJdn, hijriMonthLength, hijriToJdn, isValidGregorianDate, type GregorianDate, type HijriDate } from './hijri';

type DateParts = { year: number; month: number; day: number };
type Span = { years: number; months: number; days: number };

function gregorianMonthLength(year: number, month: number): number {
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** Count complete calendar months from the birth date, clamping short months to their last day. */
function span(start: DateParts, end: DateParts, endJdn: number, monthLength: (year: number, month: number) => number, toJdn: (d: DateParts) => number): Span {
  let months = (end.year - start.year) * 12 + end.month - start.month;
  const anchor = (n: number): DateParts => {
    const index = start.year * 12 + start.month - 1 + n;
    const year = Math.floor(index / 12);
    const month = index % 12 + 1;
    return { year, month, day: Math.min(start.day, monthLength(year, month)) };
  };
  if (toJdn(anchor(months)) > endJdn) months--;
  return { years: Math.floor(months / 12), months: months % 12, days: endJdn - toJdn(anchor(months)) };
}

export function calculateAge(birth: GregorianDate, today: GregorianDate) {
  if (!isValidGregorianDate(birth) || !isValidGregorianDate(today)) return null;
  const toGregorianJdn = (d: DateParts) => gregorianToJdn(d.year, d.month, d.day);
  const birthJdn = toGregorianJdn(birth);
  const todayJdn = toGregorianJdn(today);
  if (birthJdn > todayJdn) return null;
  const birthHijri = gregorianToHijri(birth.year, birth.month, birth.day);
  const todayHijri = gregorianToHijri(today.year, today.month, today.day);
  const gregorian = span(birth, today, todayJdn, gregorianMonthLength, toGregorianJdn);
  const hijri = span(birthHijri, todayHijri, todayJdn, hijriMonthLength, (d: HijriDate) => hijriToJdn(d));
  // For 29 February birthdays, use 28 February in non-leap years.
  const birthdayIn = (year: number) => ({ year, month: birth.month, day: Math.min(birth.day, gregorianMonthLength(year, birth.month)) });
  let nextBirthday = birthdayIn(today.year);
  if (toGregorianJdn(nextBirthday) < todayJdn) nextBirthday = birthdayIn(today.year + 1);
  const totalDays = todayJdn - birthJdn;
  return { gregorian, hijri, totalDays, totalWeeks: Math.floor(totalDays / 7), daysToBirthday: toGregorianJdn(nextBirthday) - todayJdn, nextBirthday };
}

/** Inclusive endpoints are not counted twice: the same date has a difference of zero days. */
export function calculateGregorianInterval(start: GregorianDate, end: GregorianDate) {
  if (!isValidGregorianDate(start) || !isValidGregorianDate(end)) return null;
  const toJdn = (d: DateParts) => gregorianToJdn(d.year, d.month, d.day);
  const startJdn = toJdn(start);
  const endJdn = toJdn(end);
  if (endJdn < startJdn) return null;
  return { totalDays: endJdn - startJdn, span: span(start, end, endJdn, gregorianMonthLength, toJdn) };
}
