import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright-core';

// Run separately with CHROMIUM_PATH pointing to a compatible browser. Network
// requests to third parties are blocked: this does not test live ad behavior.
test('Chromium desktop and mobile: routes, overflow and key tools', { timeout: 120000 }, async () => {
  assert.ok(process.env.CHROMIUM_PATH, 'Set CHROMIUM_PATH to a compatible Chromium executable');
  const server = await preview({ configFile: resolve('vite.config.ts'), preview: { host:'127.0.0.1', port:0 } });
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  after(async () => browser.close());
  const articles = JSON.parse(readFileSync('src/data/articles.json', 'utf8'));
  const countdowns = JSON.parse(readFileSync('src/data/countdowns.json', 'utf8')).countdowns;
  const paths = ['/', '/salaries', '/hijri-calendar', '/school-calendar', '/holidays', '/date-converter', '/age-calculator', '/name-decoration', '/articles', '/countdown', '/today', '/faq', '/about', '/contact', '/privacy', '/terms',
    ...['arabic', 'pubg', 'english', 'free-fire', 'french'].map(slug => `/name-decoration/${slug}`),
    ...articles.map(a => `/articles/${a.slug}`), ...countdowns.map(c => `/countdown/${c.slug}`)];
  assert.equal(paths.length, 47);
  for (const viewport of [{ width:320, height:568 }, { width:390, height:844 }, { width:768, height:1024 }, { width:1024, height:768 }, { width:1365, height:768 }, { width:1920, height:1080 }]) {
    const context = await browser.newContext({ viewport });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const exceptions = [];
    page.on('pageerror', e => exceptions.push(e.message));
    for (const path of paths) {
      const response = await page.goto(origin + path, { waitUntil:'domcontentloaded' });
      assert.equal(response.status(), 200, `${viewport.width} ${path}: HTTP`);
      await page.waitForFunction(() => !document.querySelector('.prerender-shell'));
      await page.waitForFunction(() => !document.querySelector('#main-content [role="status"][aria-label="جارٍ تحميل الصفحة"]'));
      await page.locator('main h1').waitFor();
      assert.equal(await page.locator('main h1').count(), 1, `${viewport.width} ${path}: h1`);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://alshafra.com${path}`, `${path}: canonical`);
      const sizes = await page.evaluate(() => ({ scroll:document.documentElement.scrollWidth, width:document.documentElement.clientWidth }));
      assert.ok(sizes.scroll <= sizes.width + 1, `${viewport.width} ${path}: document overflow ${JSON.stringify(sizes)}`);
    }
    assert.deepEqual(exceptions, [], `${viewport.width}: uncaught JS errors`);
    await page.goto(origin + '/date-converter');
    await page.getByLabel('السنة', { exact:true }).fill('2024');
    await page.getByRole('combobox', { name:'الشهر', exact:true }).selectOption('2');
    await page.getByRole('combobox', { name:'اليوم', exact:true }).selectOption('29');
    await page.getByRole('button', { name:'تبديل', exact:true }).click();
    assert.equal(await page.getByLabel('السنة', { exact:true }).inputValue(), '1445');
    await page.getByLabel('تاريخ البداية').fill('2024-02-28');
    await page.getByLabel('تاريخ النهاية').fill('2024-03-01');
    assert.match(await page.getByRole('status').last().textContent(), /٢ يوم/);
    await page.goto(origin + '/age-calculator');
    await page.getByLabel('السنة', { exact:true }).fill('2024');
    await page.getByRole('combobox', { name:'الشهر', exact:true }).selectOption('2');
    await page.getByRole('combobox', { name:'اليوم', exact:true }).selectOption('29');
    await page.getByRole('button', { name:'تبديل إلى الهجري' }).click();
    assert.equal(await page.getByLabel('السنة', { exact:true }).inputValue(), '1445');
    await page.getByRole('button', { name:'تبديل إلى الميلادي' }).click();
    assert.equal(await page.getByRole('combobox', { name:'اليوم', exact:true }).inputValue(), '29');
    await page.getByLabel('تاريخ ميلاد الشخص الثاني').fill('2024-03-01');
    assert.match(await page.getByRole('status').last().textContent(), /الشخص الأول أكبر سناً/);
    assert.match(await page.getByRole('status').last().textContent(), /0 شهر و1 يوم/);
    await page.goto(origin + '/countdown');
    await page.getByLabel('التاريخ المطلوب').fill('1900-01-01');
    assert.match(await page.getByRole('status').last().textContent(), /مضى/);
    await page.getByLabel('التاريخ المطلوب').fill('2100-12-31');
    assert.match(await page.locator('#custom-countdown-title').locator('..').textContent(), /يوم تقويمي/);
    await page.getByRole('button', { name:'الرواتب والدعم', exact:true }).click();
    assert.equal(await page.getByRole('button', { name:'الرواتب والدعم', exact:true }).getAttribute('aria-pressed'), 'true');
    if (viewport.width < 600) {
      const menu = page.locator('button[aria-controls="mobile-navigation"]');
      await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      await menu.click(); await page.locator('#mobile-navigation').getByRole('link', { name:'الأسئلة الشائعة' }).click();
      assert.equal(new URL(page.url()).pathname, '/faq'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    }
    assert.deepEqual(exceptions, [], `${viewport.width}: uncaught JS errors after tool interactions`);
    await context.close();
  }
  const noJs = await browser.newContext({ javaScriptEnabled:false, viewport:{ width:390, height:844 } });
  const staticPage = await noJs.newPage();
  for (const path of ['/date-converter', '/age-calculator', '/school-calendar']) {
    await staticPage.goto(origin + path, { waitUntil:'domcontentloaded' });
    assert.equal(await staticPage.locator('h1').count(), 1, `${path}: static H1 without JS`);
    assert.ok(await staticPage.locator('main a').count() > 0, `${path}: static links without JS`);
  }
  await noJs.close();

  // The visitor's own timezone must not control the Riyadh day.
  const differentZone = await browser.newContext({ timezoneId:'America/Los_Angeles', viewport:{ width:390, height:844 } });
  await differentZone.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const clockPage = await differentZone.newPage();
  await clockPage.clock.install({ time:new Date('2026-10-28T20:59:59Z') });
  await clockPage.goto(origin + '/today');
  await clockPage.getByText('28 أكتوبر 2026م', { exact:true }).waitFor();
  await clockPage.clock.fastForward(2000);
  await clockPage.getByText('29 أكتوبر 2026م', { exact:true }).waitFor();
  await differentZone.close();
});

test('automated accessibility checks on priority routes', { timeout: 60000 }, async () => {
  assert.ok(process.env.CHROMIUM_PATH, 'Set CHROMIUM_PATH to a compatible Chromium executable');
  const server = await preview({ configFile:resolve('vite.config.ts'), preview:{host:'127.0.0.1',port:0} });
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  after(async () => browser.close());
  // axe is injected by the test harness; bypass the page CSP only in this audit.
  const context = await browser.newContext({ viewport:{width:390,height:844}, bypassCSP:true });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const path of ['/', '/date-converter', '/age-calculator', '/today', '/school-calendar', '/countdown']) {
    await page.goto(origin + path);
    await page.waitForFunction(() => !document.querySelector('.prerender-shell'));
    await page.locator('main h1').waitFor();
    await page.addScriptTag({ path:resolve('node_modules/axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly:{ type:'tag', values:['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id:v.id, impact:v.impact, count:v.nodes.length })));
    assert.deepEqual(violations, [], `${path}: ${JSON.stringify(violations)}`);
  }
  await context.close();
});

test('age calculator boundary isolates third-party scripts and keeps birth input out of requests and storage', { timeout: 60000 }, async () => {
  assert.ok(process.env.CHROMIUM_PATH, 'Set CHROMIUM_PATH to a compatible Chromium executable');
  const server = await preview({ configFile:resolve('vite.config.ts'), preview:{host:'127.0.0.1',port:0} });
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  after(async () => browser.close());
  const context = await browser.newContext();
  // Simulated external resources only: do not contact live ad/analytics networks.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.fulfill({ status:200, contentType:'application/javascript', body:'window.externalScriptRan=true;' }));
  const page = await context.newPage();
  const requests = [];
  page.on('request', req => requests.push({ url:req.url(), body:req.postData() }));
  await page.goto(origin + '/');
  await page.locator('main h1').waitFor();
  await page.getByRole('link', { name:/حاسبة العمر/ }).first().click();
  await page.waitForURL('**/age-calculator');
  await page.locator('main h1').waitFor();
  assert.equal(await page.evaluate(() => !!window.externalScriptRan), false, 'fresh document must not retain previous page scripts');
  requests.length = 0;
  const before = await page.evaluate(() => ({local:JSON.stringify(localStorage), session:JSON.stringify(sessionStorage)}));
  await page.getByLabel('السنة', {exact:true}).fill('1987');
  await page.getByRole('combobox', {name:'الشهر',exact:true}).selectOption('7');
  await page.getByRole('combobox', {name:'اليوم',exact:true}).selectOption('19');
  await page.getByLabel('تاريخ ميلاد الشخص الثاني').fill('1992-04-23');
  await page.getByRole('status').last().waitFor();
  assert.equal(new URL(page.url()).search, '');
  assert.deepEqual(await page.evaluate(() => ({local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)})), before);
  assert.ok(requests.every(req => new URL(req.url).origin === origin), JSON.stringify(requests));
  assert.ok(requests.every(req => !/1987|1992-04-23/.test(req.url + (req.body || ''))), JSON.stringify(requests));
  const blocked = await page.evaluate(async () => {
    return await new Promise(resolve => {
      document.addEventListener('securitypolicyviolation', event => resolve(event.violatedDirective), {once:true});
      const script = document.createElement('script'); script.src = 'https://third-party.invalid/test.js'; document.head.append(script);
      setTimeout(() => resolve('no violation'), 1000);
    });
  });
  assert.match(blocked, /script-src/);
  await page.getByRole('link', {name:'تاريخ اليوم في السعودية'}).click();
  await page.waitForURL('**/today');
  await page.locator('main h1').waitFor();
  await page.goBack();
  await page.waitForURL('**/age-calculator');
  await page.locator('main h1').waitFor();
  assert.equal(await page.evaluate(() => !!window.externalScriptRan), false);
  await context.close();
});

test('direct age page has no third-party requests; generic fallback fails closed', { timeout: 60000 }, async () => {
  assert.ok(process.env.CHROMIUM_PATH, 'Set CHROMIUM_PATH to a compatible Chromium executable');
  const server = await preview({ configFile:resolve('vite.config.ts'), preview:{host:'127.0.0.1',port:0} });
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox', '--disable-dev-shm-usage'] });
  after(async () => browser.close());
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(origin + '/age-calculator');
  await page.locator('main h1').waitFor();
  await page.getByLabel('السنة', {exact:true}).fill('1987');
  await page.waitForTimeout(300);
  assert.ok(requests.every(url => new URL(url).origin === origin), JSON.stringify(requests));
  assert.ok(requests.every(url => !url.includes('1987')));
  await context.close();

  const fallback = await browser.newContext();
  const rootHtml = readFileSync(resolve('dist/index.html'), 'utf8');
  await fallback.route('**/*', route => {
    const request = route.request();
    if (request.isNavigationRequest() && ['/age-calculator','/date-converter','/countdown'].includes(new URL(request.url()).pathname)) return route.fulfill({status:200,contentType:'text/html',body:rootHtml});
    return new URL(request.url()).origin === origin ? route.continue() : route.abort();
  });
  const fallbackPage = await fallback.newPage();
  for (const path of ['/age-calculator','/date-converter','/countdown']) {
    await fallbackPage.goto(origin + path);
    await fallbackPage.getByText('أداة التاريخ غير متاحة حالياً لعدم تفعيل حماية الصفحة. حاول لاحقاً.').waitFor();
    assert.equal(await fallbackPage.locator('input, select').count(), 0);
  }
  await fallback.close();
});

test('converter and custom countdown isolate date inputs across navigation', { timeout:60000 }, async () => {
  assert.ok(process.env.CHROMIUM_PATH);
  const server = await preview({configFile:resolve('vite.config.ts'), preview:{host:'127.0.0.1',port:0}});
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
  after(async () => browser.close());
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests=[]; page.on('request', req=>requests.push({url:req.url(),body:req.postData()}));
  for (const path of ['/date-converter','/countdown']) {
    requests.length=0;
    await page.goto(origin+path);
    await page.locator('main h1').waitFor();
    const before=await page.evaluate(() => ({local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)}));
    if (path === '/date-converter') {
      await page.getByLabel('السنة',{exact:true}).fill('1987');
      await page.getByLabel('تاريخ البداية').fill('1987-07-19');
      await page.getByLabel('تاريخ النهاية').fill('1992-04-23');
    } else await page.getByLabel('التاريخ المطلوب').fill('1987-07-19');
    await page.waitForTimeout(250);
    assert.equal(new URL(page.url()).search,'');
    assert.deepEqual(await page.evaluate(() => ({local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)})),before);
    assert.ok(requests.every(r => new URL(r.url).origin === origin), JSON.stringify(requests));
    assert.ok(requests.every(r => !/1987|1992-04-23/.test(r.url+(r.body||''))),JSON.stringify(requests));
  }
  await page.goto(origin+'/age-calculator');
  await page.getByRole('link',{name:'تحويل تاريخ الميلاد بين الهجري والميلادي'}).click();
  await page.waitForURL('**/date-converter');
  await page.locator('main h1').waitFor();
  assert.equal(await page.locator('meta[data-date-isolation]').count(),1);
  await page.getByRole('link',{name:'حساب العمر بالهجري والميلادي'}).last().click();
  await page.waitForURL('**/age-calculator');
  await page.locator('main h1').waitFor();
  assert.equal(await page.locator('meta[data-date-isolation]').count(),1);
  await context.close();
});
