import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { occurrences as buildOccurrences } from '../countdowns.mjs';
import { countdownNotice, staticCountdownNotice } from '../../src/lib/countdown-notice.mjs';

const bundle = await build({ entryPoints:['src/lib/countdowns.ts'], bundle:true, write:false, format:'esm', platform:'node' });
const { occurrences: appOccurrences } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const today = { year:2026, month:10, day:28 };
const official = {
  category:'salary', slug:'example',
  schedule:{ type:'fixed', dates:['2026-11-27'] },
  source:{ label:'مصدر تجريبي', url:'https://www.mof.gov.sa/test-only' },
  verification:{ status:'official', editorApproved:true, approvedBy:'محرر اختباري', approvedAt:'2026-10-27', approvedSlug:'example', approvedDates:['2026-11-27'], verifiedAt:'2026-10-27', reviewDue:'2026-11-05', sourceUrl:'https://www.mof.gov.sa/test-only' },
};
const clone = () => structuredClone(official);
const assertBoth = (def, expected, from=today) => {
  assert.deepEqual(buildOccurrences(def, from), expected);
  assert.deepEqual(appOccurrences(def, from), expected);
};

test('salary dates require a fixed list, approved source and an unexpired review', () => {
  assertBoth(official, [{year:2026,month:11,day:27}]);
  assert.match(countdownNotice(official, '2026-10-28', today), /آخر تحقق 2026-10-27/);
  for (const edit of [
    d => delete d.verification,
    d => { d.verification.editorApproved = false; },
    d => { d.verification.approvedBy = ''; },
    d => { d.verification.approvedAt = '2026-10-29'; },
    d => { d.verification.approvedSlug = 'different'; },
    d => { d.schedule.dates.push('2026-12-27'); },
    d => { d.schedule.dates = ['2026-11-28']; },
    d => { d.schedule.dates.push('2026-11-27'); },
    d => { d.verification.status = 'estimated'; },
    d => { d.verification.verifiedAt = '2026-10-29'; },
    d => { d.verification.reviewDue = '2026-10-27'; },
    d => { d.verification.reviewDue = '2026-02-30'; },
    d => { d.verification.sourceUrl = 'http://www.mof.gov.sa/test-only'; d.source.url = d.verification.sourceUrl; },
    d => { d.source.url = 'https://www.mof.gov.sa/different'; },
    d => { d.verification.sourceUrl = 'https://gov.sa.evil.invalid/payroll'; d.source.url = d.verification.sourceUrl; },
    d => { d.schedule = {type:'monthly', dayOfMonth:27}; },
  ]) { const d=clone(); edit(d); assertBoth(d, []); }
  assertBoth(official, [], {year:2026,month:11,day:6});
});

test('fixed list rejects impossible dates instead of silently rolling them forward', () => {
  const d=clone(); d.schedule.dates=['2026-02-30','2026-13-01','2026-11-27'];
  d.verification.approvedDates = [...d.schedule.dates];
  assertBoth(d, []);
});


test('static salary and school disclosures never freeze a temporary approval', () => {
  assert.match(countdownNotice(official, '', today), /آخر تحقق/);
  for (const def of [official, { ...official, category:'school' }]) {
    const before = staticCountdownNotice(def, '', today);
    const after = staticCountdownNotice(def, '', {year:2027,month:1,day:1});
    assert.equal(before, after);
    assert.match(before, /تحقق من حالة الاعتماد الحالية/);
    assert.doesNotMatch(before, /آخر تحقق|2026-11-27/);
  }
});
