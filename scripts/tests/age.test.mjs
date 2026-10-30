import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({ entryPoints: ['src/lib/age.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { calculateAge } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const date = (year, month, day) => ({ year, month, day });

test('invalid dates and future birthdays are rejected, but a newborn is valid', () => {
  assert.equal(calculateAge(date(2026, 2, 30), date(2026, 3, 1)), null);
  assert.equal(calculateAge(date(2027, 1, 1), date(2026, 12, 31)), null);
  const age = calculateAge(date(2026, 3, 1), date(2026, 3, 1));
  assert.equal(age.totalDays, 0);
  assert.deepEqual(age.gregorian, { years: 0, months: 0, days: 0 });
  assert.deepEqual(age.hijri, { years: 0, months: 0, days: 0 });
  assert.equal(age.daysToBirthday, 0);
  const oneDay = calculateAge(date(2026, 2, 28), date(2026, 3, 1));
  assert.equal(oneDay.totalDays, 1);
  assert.deepEqual(oneDay.gregorian, { years: 0, months: 0, days: 1 });
});

test('short months use the last day as the completed-month anniversary', () => {
  let age = calculateAge(date(2023, 1, 31), date(2023, 2, 28));
  assert.deepEqual(age.gregorian, { years: 0, months: 1, days: 0 });
  age = calculateAge(date(2023, 1, 31), date(2023, 3, 1));
  assert.deepEqual(age.gregorian, { years: 0, months: 1, days: 1 });
  age = calculateAge(date(2023, 1, 31), date(2023, 3, 30));
  assert.deepEqual(age.gregorian, { years: 0, months: 1, days: 30 });
});

test('29 February anniversary is 28 February in a non-leap year', () => {
  let age = calculateAge(date(2000, 2, 29), date(2023, 2, 28));
  assert.deepEqual(age.gregorian, { years: 23, months: 0, days: 0 });
  assert.equal(age.daysToBirthday, 0);
  age = calculateAge(date(2000, 2, 29), date(2023, 3, 1));
  assert.deepEqual(age.nextBirthday, date(2024, 2, 29));
  assert.equal(age.daysToBirthday, 365);
});

test('Gregorian and Hijri spans stay nonnegative across month and year boundaries', () => {
  for (const birth of [date(1900, 1, 31), date(2000, 2, 29), date(2024, 4, 30), date(2026, 1, 1)]) {
    for (const today of [date(2026, 1, 1), date(2026, 2, 28), date(2027, 3, 1)]) {
      const age = calculateAge(birth, today);
      for (const span of [age.gregorian, age.hijri]) {
        assert.ok(span.years >= 0 && span.months >= 0 && span.months < 12 && span.days >= 0, JSON.stringify({birth, today, span}));
      }
    }
  }
});

test('Hijri age respects the actual 29-day month rather than borrowing 30 days', async () => {
  const hBundle = await build({ entryPoints: ['src/lib/hijri.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { hijriToGregorian, isUmmAlQuraExact } = await import(`data:text/javascript;base64,${Buffer.from(hBundle.outputFiles[0].text).toString('base64')}`);
  assert.equal(isUmmAlQuraExact(), true, 'test requires Intl Umm al-Qura support');
  const born = hijriToGregorian({ year: 1448, month: 2, day: 30 });
  const before = hijriToGregorian({ year: 1448, month: 3, day: 28 });
  const anniversary = hijriToGregorian({ year: 1448, month: 3, day: 29 });
  assert.deepEqual(calculateAge(born, before).hijri, { years: 0, months: 0, days: 28 });
  assert.deepEqual(calculateAge(born, anniversary).hijri, { years: 0, months: 1, days: 0 });
});

test('date interval validates order and uses calendar month ends and leap days', async () => {
  const { calculateGregorianInterval } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
  assert.deepEqual(calculateGregorianInterval(date(2024, 2, 28), date(2024, 3, 1)), { totalDays: 2, span: { years: 0, months: 0, days: 2 } });
  assert.deepEqual(calculateGregorianInterval(date(2023, 1, 31), date(2023, 2, 28)), { totalDays: 28, span: { years: 0, months: 1, days: 0 } });
  assert.deepEqual(calculateGregorianInterval(date(2026, 1, 1), date(2026, 1, 1)), { totalDays: 0, span: { years: 0, months: 0, days: 0 } });
  assert.equal(calculateGregorianInterval(date(2025, 2, 29), date(2025, 3, 1)), null);
  assert.equal(calculateGregorianInterval(date(2026, 1, 2), date(2026, 1, 1)), null);
  assert.equal(calculateGregorianInterval(date(1899, 12, 31), date(1900, 1, 1)), null);
});
