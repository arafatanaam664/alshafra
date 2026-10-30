import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countdownRemaining } from '../../src/lib/countdown-clock.mjs';
test('midnight of the date in Riyadh is 21:00 UTC on the previous day', () => {
  const target = { year: 2027, month: 1, day: 1 };
  assert.deepEqual(countdownRemaining(target, Date.parse('2026-12-31T20:59:59Z')), { total: 1000, days: 0, hours: 0, minutes: 0, seconds: 1 });
  assert.equal(countdownRemaining(target, Date.parse('2026-12-31T21:00:00Z')).total, 0);
  assert.equal(countdownRemaining(target, Date.parse('2027-01-01T01:00:00Z')).total, 0);
});
test('leap day and full-day units use the target date not local browser timezone', () => {
  assert.deepEqual(countdownRemaining({ year: 2028, month: 2, day: 29 }, Date.parse('2028-02-27T20:00:00Z')), { total: 90000000, days: 1, hours: 1, minutes: 0, seconds: 0 });
});
