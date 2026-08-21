// fetch-prices.mjs — يجلب سعر أونصة الذهب (XAU) وأسعار صرف الدولار من مصادر مفتوحة
// ويكتب src/data/prices.json تلقائياً. يُشغَّل يومياً في GitHub Actions قبل البناء.
// عند فشل الجلب (لا إنترنت) يحتفظ بالملف الحالي ويخرج بنجاح.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pricesPath = join(__dirname, '..', 'src', 'data', 'prices.json');

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchJson(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'shafra-prices/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const prev = existsSync(pricesPath) ? JSON.parse(readFileSync(pricesPath, 'utf-8')) : null;
  let xauUsd = prev?.xauUsd ?? 2410;
  let rates = prev?.rates ?? {};
  let source = prev?.source ?? 'fallback';
  let ok = false;

  // 1) سعر الذهب — gold-api.com (مجاني بلا مفتاح)
  try {
    const gold = await fetchJson('https://api.gold-api.com/price/XAU');
    if (gold && gold.price) {
      xauUsd = Number(gold.price);
      source = 'gold-api.com';
      ok = true;
      console.log(`[prices] XAU = $${xauUsd} (${source})`);
    }
  } catch (e) {
    console.log(`[prices] gold fetch failed: ${e.message}`);
  }

  // 2) أسعار الصرف — open.er-api.com (مجاني بلا مفتاح)
  try {
    const fx = await fetchJson('https://open.er-api.com/v6/latest/USD');
    if (fx && fx.result === 'success' && fx.rates) {
      rates = fx.rates;
      source = ok ? `${source} + open.er-api.com` : 'open.er-api.com';
      ok = true;
      console.log(`[prices] rates: ${Object.keys(rates).length} currencies`);
    }
  } catch (e) {
    console.log(`[prices] rates fetch failed: ${e.message}`);
  }

  if (!ok && prev) {
    console.log('[prices] keeping previous values (no network).');
    return;
  }

  const out = { updated: todayStr(), xauUsd: Math.round(xauUsd * 100) / 100, source, rates };
  writeFileSync(pricesPath, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.log(`[prices] written ${pricesPath} (updated ${out.updated}).`);
}

main().catch((e) => {
  console.error('[prices] fatal:', e);
  process.exit(0); // لا نفشل البناء أبداً بسبب الأسعار
});
