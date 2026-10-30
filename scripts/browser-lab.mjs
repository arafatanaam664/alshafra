import { chromium } from 'playwright-core';

// A local lab probe, not Core Web Vitals field data. Run against a local Vite
// preview, with third-party requests blocked; requires CHROMIUM_PATH and BASE_URL.
const origin = process.env.BASE_URL || 'http://127.0.0.1:4173';
if (!process.env.CHROMIUM_PATH) throw new Error('Set CHROMIUM_PATH to a Chromium executable');
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  for (const path of ['/', '/date-converter', '/age-calculator', '/today', '/school-calendar']) {
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({ viewport:{ width:390, height:844 } });
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.labMetrics = { lcp:0, shifts:0 };
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.labMetrics.lcp = e.startTime; }).observe({ type:'largest-contentful-paint', buffered:true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.labMetrics.shifts += e.value; }).observe({ type:'layout-shift', buffered:true });
      });
      await page.goto(origin + path, { waitUntil:'load' });
      await page.waitForTimeout(1000);
      samples.push(await page.evaluate(() => ({ lcpMs:Math.round(window.labMetrics.lcp), layoutShiftSum:Number(window.labMetrics.shifts.toFixed(4)), domContentLoadedMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd) })));
      await context.close();
    }
    console.log(JSON.stringify({ path, samples }));
  }
} finally { await browser.close(); }
