import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

// A DOM integration test, not a substitute for a real browser. Ads are stubbed.
test('interactive routes, date tools, mobile menu and Riyadh midnight', async () => {
  const out = resolve('node_modules/.cache/ui-test/app.mjs');
  await mkdir(resolve('node_modules/.cache/ui-test'), { recursive: true });
  await build({ entryPoints: ['src/App.tsx'], bundle: true, outfile: out, format: 'esm', platform: 'node', jsx: 'automatic', external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'lucide-react'], plugins: [{
    name: 'stub-ads',
    setup(b) {
      b.onResolve({ filter: /\/components\/(AdPlacement|AdSlot|SmartlinkCard)$/ }, () => ({ path: 'stub', namespace: 'ads-stub' }));
      b.onLoad({ filter: /.*/, namespace: 'ads-stub' }, () => ({ contents: 'export default function Ad(){return null} export function SmartlinkFooterLink(){return null}', loader: 'js' }));
    },
  }] });
  const dom = new JSDOM('<!doctype html><html><head><meta name="robots" content="index, follow"><meta name="googlebot" content="index, follow"></head><body><div id="root"></div></body></html>', { url: 'https://alshafra.com/', pretendToBeVisual: true });
  const { window } = dom;
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  globalThis.window = window; globalThis.document = window.document; Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
  globalThis.HTMLElement = window.HTMLElement; globalThis.Event = window.Event; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  const RealDate = globalThis.Date;
  let now = RealDate.parse('2026-10-28T20:59:59Z');
  class FakeDate extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  globalThis.Date = FakeDate; window.Date = FakeDate;
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import(pathToFileURL(out).href + `?${Date.now()}`);
  const root = createRoot(document.getElementById('root'));
  const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
  const click = async el => { assert.ok(el); await act(async () => { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, button: 0 })); }); await flush(); };
  const navigate = async path => { await act(async () => { window.history.pushState({}, '', path); window.dispatchEvent(new window.PopStateEvent('popstate')); }); await flush(); };
  const setInput = async (el, value) => { await act(async () => { const proto = el.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value); el.dispatchEvent(new window.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }); };
  const labeled = text => [...document.querySelectorAll('label')].find(label => label.textContent.includes(text))?.querySelector('input, select');
  try {
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(App)))); await flush();
    const menu = document.querySelector('button[aria-controls="mobile-navigation"]');
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    await click(menu); assert.equal(menu.getAttribute('aria-expanded'), 'true');
    await act(async () => menu.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(menu.getAttribute('aria-expanded'), 'false'); assert.equal(document.activeElement, menu);

    const toolGuides = JSON.parse(await readFile('src/data/tool-guides.json', 'utf8'));
    await navigate('/date-converter');
    for (const qa of toolGuides.converter) { assert.ok(document.querySelector('main').textContent.includes(qa.question)); assert.ok(document.querySelector('main').textContent.includes(qa.answer)); }
    assert.match(document.querySelector('h1').textContent, /تحويل التاريخ/);
    await setInput(labeled('السنة'), '٢٠٢٤'); assert.equal(labeled('السنة').value, '2024');
    await setInput(labeled('السنة'), '۲۰۲۴'); assert.equal(labeled('السنة').value, '2024');
    await setInput(labeled('السنة'), '2024'); await setInput(labeled('الشهر'), '2'); await setInput(labeled('اليوم'), '29');
    const converted = [...document.querySelectorAll('div')].find(el => el.textContent === '2024-02-29');
    assert.ok(converted);
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('نسخ النتيجة')));
    assert.match(document.querySelector('[role="status"]').textContent, /تعذر النسخ/);
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل')));
    assert.match(document.body.textContent, /2024-02-29/);
    await setInput(labeled('السنة'), '1');
    assert.match(document.querySelector('[role="alert"]').textContent, /1900 و2100/);
    await setInput(labeled('السنة'), '1445');
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل')));
    await setInput(labeled('السنة'), '2025');
    assert.match(document.querySelector('[role="alert"]').textContent, /تاريخ صحيح/);
    assert.equal([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل')).disabled, true);
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('استخدام تاريخ اليوم')));
    assert.equal(labeled('السنة').value, '2026');
    assert.equal(document.querySelector('[role="alert"]'), null);

    await setInput(labeled('تاريخ البداية'), '2024-02-28'); await setInput(labeled('تاريخ النهاية'), '2024-03-01');
    assert.match(document.querySelector('[role="status"]').textContent, /٢ يوم/);
    await setInput(labeled('تاريخ النهاية'), '2024-02-01');
    assert.match([...document.querySelectorAll('[role="alert"]')].at(-1).textContent, /تاريخ النهاية/);

    await navigate('/age-calculator');
    for (const qa of toolGuides.age) { assert.ok(document.querySelector('main').textContent.includes(qa.question)); assert.ok(document.querySelector('main').textContent.includes(qa.answer)); }
    assert.match(document.querySelector('main').textContent, /يوم الميلاد/);
    assert.match(document.querySelector('main').textContent, /عيد الميلاد الميلادي القادم/);
    assert.match(document.querySelector('main').textContent, /يقابله:/);
    const comparison = document.getElementById('age-comparison-title').parentElement;
    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '2001-01-01');
    assert.match(comparison.textContent, /الشخص الأول أكبر سناً/);
    assert.match(comparison.textContent, /الفرق: 1 سنة و0 شهر و0 يوم/);
    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '1999-01-01');
    assert.match(comparison.textContent, /الشخص الثاني أكبر سناً/);
    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '2000-01-01');
    assert.match(comparison.textContent, /تاريخا الميلاد متساويان/);
    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '2027-01-01');
    assert.match(comparison.querySelector('[role="alert"]').textContent, /حتى اليوم/);
    assert.equal(comparison.querySelector('[role="status"]'), null);
    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '2001-01-01');
    await setInput(labeled('السنة'), '2026'); await setInput(labeled('الشهر'), '2'); await setInput(labeled('اليوم'), '30');
    assert.match(comparison.textContent, /أدخل تاريخاً صالحاً للشخص الأول/);
    assert.match(document.querySelector('[role="alert"]').textContent, /تاريخ ميلاد صحيح/);
    await setInput(labeled('السنة'), '2024'); await setInput(labeled('اليوم'), '29');
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل إلى الهجري')));
    assert.equal(labeled('السنة').value, '1445'); assert.equal(labeled('الشهر').value, '8'); assert.equal(labeled('اليوم').value, '19');
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل إلى الميلادي')));
    assert.equal(labeled('السنة').value, '2024'); assert.equal(labeled('الشهر').value, '2'); assert.equal(labeled('اليوم').value, '29');
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('تبديل إلى الهجري')));
    await setInput(labeled('السنة'), '1448'); await setInput(labeled('الشهر'), '3'); await setInput(labeled('اليوم'), '30');
    assert.match(document.querySelector('[role="alert"]').textContent, /تاريخ ميلاد صحيح/);
    await setInput(labeled('السنة'), '1200'); await setInput(labeled('اليوم'), '1');
    assert.match(document.querySelector('[role="alert"]').textContent, /1900/);
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('إعادة الإدخال')));
    assert.equal(labeled('السنة').value, '2000'); assert.equal(labeled('الشهر').value, '1');
    assert.equal(document.querySelector('[role="alert"]'), null);

    await setInput(labeled('تاريخ ميلاد الشخص الثاني'), '');
    assert.equal(comparison.querySelector('[role="status"]'), null);
    await setInput(labeled('السنة'), '١٩٩٨'); assert.equal(labeled('السنة').value, '1998');
    assert.equal(window.location.search, '');
    await navigate('/today'); await navigate('/age-calculator');
    assert.equal(labeled('السنة').value, '2000');
    assert.equal(labeled('تاريخ ميلاد الشخص الثاني').value, '');

    await navigate('/salaries');
    assert.equal(document.querySelector('meta[name="keywords"]'), null);
    await navigate('/school-calendar');
    assert.ok(document.querySelector('main a[href="/countdown/fall-break"]'));
    await navigate('/today');
    assert.match(document.body.textContent, /28 أكتوبر 2026/);
    await click([...document.querySelectorAll('button')].find(button => button.textContent.includes('2026-10-28')));
    assert.match(document.querySelector('[role="status"]').textContent, /تعذر النسخ/);
    now = RealDate.parse('2026-10-28T21:00:01Z');
    await act(async () => { await new Promise(r => setTimeout(r, 1100)); });
    assert.match(document.body.textContent, /29 أكتوبر 2026/);

    await navigate('/countdown');
    await setInput(labeled('التاريخ المطلوب'), '2026-10-28');
    assert.match(document.querySelector('[role="status"]').textContent, /مضى/);
    await setInput(labeled('التاريخ المطلوب'), '2026-10-29');
    assert.match(document.querySelector('[role="status"]').textContent, /بدأ هذا اليوم/);
    await setInput(labeled('التاريخ المطلوب'), '2026-10-30');
    assert.match(document.getElementById('custom-countdown-title').parentElement.textContent, /بعد 1 يوم تقويمي/);
    await setInput(labeled('التاريخ المطلوب'), '1900-01-01');
    assert.match(document.querySelector('[role="status"]').textContent, /مضى/);
    await setInput(labeled('التاريخ المطلوب'), '2100-12-31');
    assert.equal(document.querySelector('[role="alert"]'), null);
    await setInput(labeled('التاريخ المطلوب'), '');
    assert.equal(document.querySelector('[role="status"]'), null);
    await setInput(labeled('التاريخ المطلوب'), '2101-01-01');
    assert.match(document.querySelector('[role="alert"]').textContent, /1900 و2100/);
    const salaryFilter = [...document.querySelectorAll('button')].find(button => button.textContent === 'الرواتب والدعم');
    await click(salaryFilter); assert.equal(salaryFilter.getAttribute('aria-pressed'), 'true');
    const listSchema = JSON.parse(document.querySelector('#page-jsonld').textContent)[0];
    const visibleLinks = [...document.querySelectorAll('main article h3 a')].map(link => link.href);
    assert.deepEqual(listSchema.itemListElement.map(item => item.url), visibleLinks);

    await navigate('/hijri-calendar');
    await click(document.querySelector('button[aria-label="الشهر السابق"]'));
    const sharedDay = [...document.querySelectorAll('[title]')].find(el => el.title.includes('إجازة اليوم الوطني للمدارس') && el.title.includes('اليوم الوطني السعودي'));
    assert.ok(sharedDay, 'both events on the same day are preserved');
    await click(document.querySelector('button[aria-label="الشهر التالي"]'));
    await click(document.querySelector('button[aria-label="الشهر التالي"]'));
    const eventSection = [...document.querySelectorAll('h2')].find(h => h.textContent === 'مناسبات الشهر').parentElement;
    assert.match(eventSection.textContent, /إجازة الخريف/);
    assert.match(eventSection.textContent, /آخر تحقق 2026-10-29/);
    assert.ok(eventSection.querySelector('a[href="https://www.moe.gov.sa/ar/education/generaleducation/Pages/academicCalendar.aspx"]'));

    await navigate('/not-a-real-page');
    assert.match(document.querySelector('h1').textContent, /غير موجودة/);
    assert.match(document.querySelector('meta[name="robots"]').content, /noindex/);
    await navigate('/faq');
    assert.match(document.querySelector('meta[name="robots"]').content, /index/);
    assert.doesNotMatch(document.querySelector('meta[name="robots"]').content, /noindex/);
    assert.equal(document.activeElement.id, 'main-content');

    await navigate('/articles/citizen-account-payment-dates');
    const jsonld = JSON.parse(document.querySelector('#page-jsonld').textContent);
    const faqs = jsonld.find(item => item['@type'] === 'FAQPage').mainEntity;
    for (const item of faqs) {
      assert.ok(document.querySelector('main').textContent.includes(item.name));
      assert.ok(document.querySelector('main').textContent.includes(item.acceptedAnswer.text));
    }
    assert.equal(document.querySelectorAll('#page-jsonld').length, 1);
    assert.equal(document.querySelectorAll('#breadcrumb-jsonld').length, 1);
    assert.equal(document.querySelector('link[rel=canonical]').href, 'https://alshafra.com/articles/citizen-account-payment-dates');
    const contact = JSON.parse(await readFile('src/data/site-contact.json', 'utf8'));
    for (const path of ['/contact', '/about', '/faq', '/privacy']) {
      await navigate(path);
      assert.ok(document.querySelector('main').textContent.includes(contact.email), path);
      assert.ok(document.querySelector(`footer a[href="mailto:${contact.email}"]`));
      assert.doesNotMatch(document.body.textContent, /info@alshafra\.com/);
      if (path === '/about') assert.ok(document.querySelector('main').textContent.includes(contact.editorialTeam));
    }
    const privacy = JSON.parse(await readFile('src/data/privacy-notice.json', 'utf8'));
    for (const section of privacy.sections) assert.ok(document.querySelector('main').textContent.includes(section.body));
    // Exercise every currently built route after client navigation. This is a DOM
    // test with ad components stubbed, not a layout or network/browser test.
    const articleData = JSON.parse(await readFile('src/data/articles.json', 'utf8'));
    const countdownData = JSON.parse(await readFile('src/data/countdowns.json', 'utf8')).countdowns;
    const paths = ['/', '/salaries', '/hijri-calendar', '/school-calendar', '/holidays', '/date-converter', '/age-calculator', '/name-decoration', '/articles', '/countdown', '/today', '/faq', '/about', '/contact', '/privacy', '/terms',
      ...['arabic', 'pubg', 'english', 'free-fire', 'french'].map(slug => `/name-decoration/${slug}`),
      ...articleData.map(article => `/articles/${article.slug}`),
      ...countdownData.map(countdown => `/countdown/${countdown.slug}`)];
    assert.equal(paths.length, 47);
    for (const path of paths) {
      await navigate(path);
      assert.equal(document.querySelectorAll('main h1').length, 1, `${path}: h1`);
      assert.equal(document.querySelector('link[rel=canonical]').href, `https://alshafra.com${path}`, `${path}: canonical`);
      assert.doesNotMatch(document.querySelector('meta[name=robots]').content, /noindex/, `${path}: robots`);
      for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
        const payload = JSON.parse(node.textContent);
        for (const schema of Array.isArray(payload) ? payload : [payload]) {
          if (schema['@type'] !== 'FAQPage') continue;
          const visibleText = document.querySelector('main').textContent.replace(/\s+/g, ' ');
          for (const qa of schema.mainEntity) {
            assert.ok(visibleText.includes(qa.name.replace(/\s+/g, ' ')), `${path}: FAQ question`);
            assert.ok(visibleText.includes(qa.acceptedAnswer.text.replace(/\s+/g, ' ')), `${path}: FAQ answer`);
          }
        }
      }
    }

  } finally {
    await act(async () => root.unmount());
    window.close(); globalThis.Date = RealDate;
    delete globalThis.window; delete globalThis.document; if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor); else delete globalThis.navigator; delete globalThis.HTMLElement; delete globalThis.Event; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
