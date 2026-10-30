import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCountdowns, occurrences } from '../countdowns.mjs';
import { schoolEventApproved } from '../../src/lib/school-trust.mjs';
const calendar = JSON.parse(readFileSync(new URL('../../src/data/school-calendar.json', import.meta.url)));
const defs = loadCountdowns();
test('school countdown dates come from the reviewed school calendar', () => {
  for (const [slug, id] of [['school-start', 'school-start-1448'], ['fall-break', 'fall-break-1448'], ['midyear-break', 'midyear-break-1448']]) {
    const def = defs.find(d => d.slug === slug);
    assert.deepEqual(def.schedule.dates, [calendar.events.find(e => e.id === id).date]);
  }
  assert.equal(calendar.events.find(e => e.id === 'school-eid-adha-1448').date, '2027-05-07');
});
test('unverified salary schedules and school dates have no computed future occurrence', () => {
  for (const slug of ['employee-salaries', 'citizen-account', 'social-security', 'retiree-salaries', 'school-start', 'fall-break', 'midyear-break', 'school-end', 'second-term-break']) {
    assert.deepEqual(occurrences(defs.find(d => d.slug === slug), { year: 2026, month: 10, day: 28 }), [], slug);
  }
});
test('prerendered school and salary pages reflect the safe content', () => {
  const school = readFileSync(new URL('../../dist/school-calendar/index.html', import.meta.url), 'utf8');
  const salary = readFileSync(new URL('../../dist/salaries/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(school, /2027-05-07/); assert.match(school, /بانتظار التحقق والاعتماد/); assert.match(school, /2026-10-29/); assert.match(salary, /بانتظار التحقق/);
  assert.doesNotMatch(school, /ثلاثة فصول دراسية/);
});

test('national countdowns use the reviewed government source from the holiday guide', () => {
  const guide = JSON.parse(readFileSync(new URL('../../src/data/holiday-guide.json', import.meta.url)));
  for (const slug of ['national-day', 'founding-day']) {
    const def = defs.find(d => d.slug === slug);
    assert.equal(def.source.url, guide.sources[0].url);
    assert.equal(def.source.verifiedAt, guide.verifiedAt);
    const html = readFileSync(new URL(`../../dist/countdown/${slug}/index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(guide.sources[0].url));
    assert.ok(html.includes(guide.verifiedAt));
  }
});

test('calendar countdown links are unique and use the same reviewed events', () => {
  const links = calendar.events.filter(e => e.countdownSlug);
  assert.equal(new Set(links.map(e => e.countdownSlug)).size, links.length);
  const html = readFileSync(new URL('../../dist/school-calendar/index.html', import.meta.url), 'utf8');
  for (const event of links) {
    const def = defs.find(d => d.slug === event.countdownSlug);
    assert.ok(def);
    assert.deepEqual(def.schedule.dates, [event.date]);
    assert.ok(!html.includes(event.date));
  }
});


test('each school event needs editor approval, a current review, and the verified ministry source', () => {
  const original = calendar.events.find(e => e.countdownSlug === 'fall-break');
  const today = { year:2026, month:10, day:30 };
  assert.equal(schoolEventApproved(calendar, original, today), false);
  const event = { ...original, verification: { status:'official', editorApproved:true, approvedBy:'محرر اختباري', approvedAt:'2026-10-29', verifiedAt:'2026-10-29', reviewDue:'2026-11-01', sourceUrl:calendar.source } };
  assert.equal(schoolEventApproved(calendar, event, today), true);
  assert.equal(schoolEventApproved(calendar, {...event, verification:{...event.verification,approvedBy:''}}, today), false);
  assert.equal(schoolEventApproved(calendar, {...event, verification:{...event.verification,approvedAt:'2026-10-31'}}, today), false);
  assert.equal(schoolEventApproved(calendar, event, { year:2026, month:11, day:2 }), false);
  assert.equal(schoolEventApproved(calendar, {...event, verification:{...event.verification,sourceUrl:'https://moe.gov.sa.evil.test'}}, today), false);
  assert.equal(schoolEventApproved(calendar, {...event, verification:{...event.verification,verifiedAt:'2026-02-30'}}, today), false);
  const def = defs.find(d => d.slug === 'fall-break');
  assert.deepEqual(occurrences({...def,schoolEvent:event},today), [{year:2026,month:11,day:20}]);
  assert.deepEqual(occurrences({...def,schoolEvent:event},{year:2026,month:11,day:2}), []);
});


test('pending school dates do not leak into any static page or structured data', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  for (const path of urls) {
    const html = readFileSync(join('dist', path === '/' ? '' : path, 'index.html'), 'utf8');
    for (const event of calendar.events) assert.ok(!html.includes(event.date), `${path}: pending date ${event.date}`);
    assert.doesNotMatch(html, /7 مايو 2027|20 نوفمبر 2026|8 يناير 2027|23 أغسطس 2026/, path);
  }
});
