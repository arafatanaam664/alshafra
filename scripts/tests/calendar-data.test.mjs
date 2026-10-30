import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCountdowns, occurrences } from '../countdowns.mjs';
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
  for (const slug of ['employee-salaries', 'citizen-account', 'social-security', 'retiree-salaries', 'school-end', 'second-term-break']) {
    assert.deepEqual(occurrences(defs.find(d => d.slug === slug), { year: 2026, month: 10, day: 28 }), [], slug);
  }
});
test('prerendered school and salary pages reflect the safe content', () => {
  const school = readFileSync(new URL('../../dist/school-calendar/index.html', import.meta.url), 'utf8');
  const salary = readFileSync(new URL('../../dist/salaries/index.html', import.meta.url), 'utf8');
  assert.match(school, /2027-05-07/); assert.match(school, /2026-10-29/); assert.match(salary, /بانتظار التحقق/);
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
    assert.ok(html.includes(`href="/countdown/${event.countdownSlug}"`));
  }
});
