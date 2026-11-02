import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

// Synthetic approval only; no real date has been approved. Ads are stubbed.
test('school approval expires at Riyadh midnight in an open tab', async () => {
  const calendar = JSON.parse(await readFile('src/data/school-calendar.json', 'utf8'));
  const event = calendar.events.find(item => item.countdownSlug === 'fall-break');
  event.verification = { status:'official', editorApproved:true, approvedBy:'محرر اختباري',
    approvedAt:'2026-10-29', verifiedAt:'2026-10-29', reviewDue:'2026-10-30', sourceUrl:calendar.source,
    approvedDate:event.date, approvedTitle:event.title, approvedEventId:event.id,
    approvedHijri:event.hijri, approvedCountdownSlug:event.countdownSlug };
  const out = resolve('node_modules/.cache/ui-test/school-expiry.mjs');
  await mkdir(resolve('node_modules/.cache/ui-test'), { recursive:true });
  await build({ entryPoints:['src/App.tsx'], bundle:true, outfile:out, format:'esm', platform:'node', jsx:'automatic',
    external:['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'lucide-react'], plugins:[{
      name:'fixture', setup(b) {
        b.onResolve({filter:/school-calendar\.json$/}, () => ({path:'calendar', namespace:'fixture'}));
        b.onLoad({filter:/.*/, namespace:'fixture'}, () => ({contents:JSON.stringify(calendar), loader:'json'}));
        b.onResolve({filter:/\/components\/(AdPlacement|AdSlot|SmartlinkCard)$/}, () => ({path:'stub', namespace:'ads'}));
        b.onLoad({filter:/.*/, namespace:'ads'}, () => ({contents:'export default function Ad(){return null} export function SmartlinkFooterLink(){return null}', loader:'js'}));
      },
    }] });
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {url:'https://alshafra.com/school-calendar', pretendToBeVisual:true});
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const RealDate = globalThis.Date;
  let now = RealDate.parse('2026-10-30T20:59:59Z');
  class FakeDate extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.Date = FakeDate; dom.window.Date = FakeDate;
  Object.defineProperty(globalThis, 'navigator', {value:dom.window.navigator, configurable:true});
  globalThis.HTMLElement = dom.window.HTMLElement; globalThis.Event = dom.window.Event; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}});
  dom.window.scrollTo = () => {};
  const { createRoot } = await import('react-dom/client');
  const { default:App } = await import(pathToFileURL(out).href);
  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => {root.render(React.createElement(App)); await new Promise(r => setTimeout(r, 100));});
    assert.match(document.querySelector('main').textContent, /إجازة الخريف/);
    assert.match(document.querySelector('main').textContent, /2026-10-30/);
    now += 2000;
    await act(async () => {await new Promise(r => setTimeout(r, 1100));});
    assert.doesNotMatch(document.querySelector('main').textContent, /إجازة الخريف/);
    assert.match(document.querySelector('main').textContent, /المواعيد بانتظار التحقق والاعتماد/);
  } finally {
    await act(async () => root.unmount());
    globalThis.Date = RealDate; dom.window.close();
    delete globalThis.window; delete globalThis.document; delete globalThis.HTMLElement; delete globalThis.Event; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator); else delete globalThis.navigator;
  }
});
