import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

test('age and converter refuse to display approximate results when calendar is unavailable', async () => {
  const out = resolve('node_modules/.cache/ui-test/unavailable-app.mjs');
  await mkdir(resolve('node_modules/.cache/ui-test'), { recursive: true });
  await build({ entryPoints: ['src/App.tsx'], bundle: true, outfile: out, format: 'esm', platform: 'node', jsx: 'automatic', external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'lucide-react'], plugins: [{ name: 'stub-ads', setup(b) {
    b.onResolve({ filter: /\/components\/(AdPlacement|AdSlot|SmartlinkCard)$/ }, () => ({ path: 'stub', namespace: 'ads-stub' }));
    b.onLoad({ filter: /.*/, namespace: 'ads-stub' }, () => ({ contents: 'export default function Ad(){return null} export function SmartlinkFooterLink(){return null}', loader: 'js' }));
  } }] });
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://alshafra.com/age-calculator', pretendToBeVisual: true });
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  globalThis.HTMLElement = dom.window.HTMLElement; globalThis.Event = dom.window.Event; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.scrollTo = () => {};
  const NativeFormatter = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function(locale, options) {
    if (String(locale).includes('islamic-umalqura')) throw new RangeError('unavailable');
    return new NativeFormatter(locale, options);
  };
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import(pathToFileURL(out).href);
  const root = createRoot(document.getElementById('root'));
  const flush = () => act(async () => { await new Promise(r => setTimeout(r, 80)); });
  try {
    await act(async () => root.render(React.createElement(App))); await flush();
    assert.match(document.querySelector('[role="alert"]').textContent, /تقويم أم القرى غير متاح/);
    assert.doesNotMatch(document.querySelector('main').textContent, /عيد الميلاد الميلادي القادم/);
    await act(async () => { window.history.pushState({}, '', '/date-converter'); window.dispatchEvent(new window.PopStateEvent('popstate')); }); await flush();
    assert.match(document.querySelector('[role="alert"]').textContent, /تقويم أم القرى غير متاح/);
    assert.equal([...document.querySelectorAll('button')].find(b => b.textContent.includes('تبديل')).disabled, true);
    await act(async () => { window.history.pushState({}, '', '/hijri-calendar'); window.dispatchEvent(new window.PopStateEvent('popstate')); }); await flush();
    assert.match(document.querySelector('main').textContent, /لا يتوفر تقويم أم القرى في هذا المتصفح/);
  } finally {
    await act(async () => root.unmount());
    Intl.DateTimeFormat = NativeFormatter;
    dom.window.close();
    delete globalThis.window; delete globalThis.document; delete globalThis.HTMLElement; delete globalThis.Event; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator); else delete globalThis.navigator;
  }
});
