import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCountdowns, occurrences } from '../countdowns.mjs';
const faq = JSON.parse(readFileSync(new URL('../../src/data/faq.json', import.meta.url)));
const guide = JSON.parse(readFileSync(new URL('../../src/data/holiday-guide.json', import.meta.url)));
const page = (path) => readFileSync(new URL(`../../dist/${path}/index.html`, import.meta.url), 'utf8');
test('every FAQ answer appears in prerendered HTML and has no FAQ schema', () => {
  const html = page('faq');
  for (const group of faq) for (const item of group.items) { assert.ok(html.includes(item.q)); assert.ok(html.includes(item.a)); }
  assert.doesNotMatch(html, /"@type":"FAQPage"/);
});
test('holiday guide serves reviewed rows and links without false holiday claims', () => {
  const html = page('holidays');
  for (const item of guide.items) assert.ok(html.includes(item.detail));
  for (const source of guide.sources) assert.ok(html.includes(source.url));
  assert.doesNotMatch(html, /رأس السنة الهجرية.*إجازة رسمية/);
});
test('no live fixed Laylat al-Qadr countdown and no Event schema on countdown pages', () => {
  const event = loadCountdowns().find(c => c.slug === 'laylat-alqadr');
  assert.deepEqual(occurrences(event, { year: 2026, month: 10, day: 28 }), []);
  assert.doesNotMatch(page('countdown/ramadan'), /"@type":"Event"/);
  assert.doesNotMatch(page('today'), /"@type":"FAQPage"/);
});
test('calendar and converter state limitations without promising official or complete results', () => {
  const calendar = page('hijri-calendar');
  const converter = page('date-converter');
  assert.match(calendar, /القائمة ليست جدولاً رسمياً شاملاً/);
  assert.doesNotMatch(calendar, /التحميل PDF|جميع المناسبات الدينية والوطنية والإجازات الرسمية/);
  assert.match(converter, /وتتوقف الأداة إذا لم يتوفر/);
  const events = readFileSync(new URL('../../src/lib/events.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(events, /armed-forces-day|انتصارات حرب أكتوبر/);
});

test('countdown detail disclosures reflect the kind of date and school review date', async () => {
  const { countdownNotice } = await import('../../src/lib/countdown-notice.mjs');
  const school = JSON.parse(readFileSync(new URL('../../src/data/school-calendar.json', import.meta.url)));
  for (const slug of ['ramadan', 'eid-fitr', 'eid-adha', 'hijri-new-year', 'fall-break', 'national-day', 'new-year', 'suhail']) {
    const def = loadCountdowns().find(c => c.slug === slug);
    assert.ok(page(`countdown/${slug}`).includes(countdownNotice(def, school.verifiedAt)), slug);
  }
  assert.match(page('countdown/ramadan'), /موعد حسابي غير نهائي/);
  assert.match(page('countdown/fall-break'), /موعد بانتظار التحقق والاعتماد/);
  assert.doesNotMatch(page('countdown/school-end'), new RegExp(`حسب صفحة وزارة التعليم عند آخر تحقق في ${school.verifiedAt}`));
  assert.match(page('countdown/new-year'), /لا تعني إجازة رسمية تلقائية/);
  assert.doesNotMatch(page('articles/citizen-account-payment-dates'), /إذا صادف اليوم العاشر يوم جمعة أو سبت/);
});

test('all article FAQ and text come from one shared dataset and match static schema', () => {
  const articles = JSON.parse(readFileSync(new URL('../../src/data/articles.json', import.meta.url), 'utf8'));
  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  for (const article of articles) {
    const html = page(`articles/${article.slug}`);
    for (const section of article.sections) {
      assert.ok(html.includes(escape(section.heading)), article.slug);
      assert.ok(html.includes(escape(section.body)), article.slug);
    }
    const scripts = [...html.matchAll(/<script type="application\/ld\+json" data-page-jsonld>(.*?)<\/script>/gs)];
    const structured = JSON.parse(scripts[0][1]);
    const schema = structured.find(item => item['@type'] === 'FAQPage');
    assert.deepEqual(schema.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), article.faq.map(item => [item.q, item.a]));
    for (const faq of article.faq) {
      assert.ok(html.includes(escape(faq.q)), article.slug);
      assert.ok(html.includes(escape(faq.a)), article.slug);
    }
    const articleSchema = structured.find(item => item['@type'] === 'Article');
    assert.equal(articleSchema.datePublished, undefined);
    assert.equal(articleSchema.dateModified, undefined);
    assert.equal(articleSchema.author, undefined);
  }
});

test('privacy notice is present without JavaScript and reflects tracking limitations', () => {
  const privacy = JSON.parse(readFileSync(new URL('../../src/data/privacy-notice.json', import.meta.url)));
  const html = page('privacy');
  for (const section of privacy.sections) {
    assert.ok(html.includes(section.heading));
    assert.ok(html.includes(section.body));
    for (const link of section.links) assert.ok(html.includes(link.url));
  }
  assert.doesNotMatch(html, /بيانات مجهولة الهوية ولا تكشف هويتك|لا نجمع بيانات شخصية إلا/);
});

test('variable holiday terms do not assert unsupported durations or automatic closure', () => {
  const fitr = page('countdown/eid-fitr');
  const adha = page('countdown/eid-adha');
  const newYear = page('countdown/new-year');
  const founding = page('countdown/founding-day');
  assert.doesNotMatch(fitr, /تتراوح إجازة عيد الفطر في القطاع الحكومي بين أربعة وعشرة/);
  assert.match(fitr, /تختلف مدة الإجازة بحسب النظام والفئة/);
  assert.match(adha, /تختلف مدة الإجازة بحسب النظام والفئة/);
  assert.doesNotMatch(newYear, /يستمر العمل والدراسة كالمعتاد/);
  assert.doesNotMatch(founding, /أول مرة يقع فيها يوم التأسيس داخل شهر رمضان/);
  assert.doesNotMatch(page('articles/hijri-to-gregorian-conversion'), /أضف 621\.6 لتحويل تقريبي/);
});
