import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

test('admin UI keeps writer controls disabled and renders untrusted titles as text', async () => {
  const html = readFileSync('admin/index.html', 'utf8');
  const script = readFileSync('admin/admin.js', 'utf8');
  const dom = new JSDOM(html, { url: 'https://admin.example.test/admin', runScripts: 'outside-only' });
  const { window } = dom, doc = window.document;
  const requests = [];
  window.fetch = async (path, options = {}) => {
    requests.push({ path, options });
    let data;
    if (path === '/api/login') data = { token: 'test-only-token' };
    else if (path === '/api/articles') data = { role: 'writer', articles: [{ id:1, title:'<img src=x onerror=alert(1)>', slug:'test', status:'draft', description:'', body:[{type:'text', text:'نص'}], updated_at:'2026-01-01T00:00:00Z', published_at:null }] };
    else if (path === '/api/sources') data = { records: [{ id:1, name:'مصدر', organization:'جهة', is_verified:false, review_due:null }] };
    else if (path === '/api/events') data = { records: [] };
    else throw new Error(`Unexpected request ${path}`);
    return { ok:true, json:async () => data };
  };
  window.eval(script);
  const login = doc.getElementById('login-form');
  login.elements.email.value = 'test@example.test'; login.elements.password.value = 'not-a-real-password';
  login.dispatchEvent(new window.Event('submit', { bubbles:true, cancelable:true }));
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(doc.getElementById('workspace').hidden, false);
  assert.equal(doc.getElementById('source-fields').disabled, true);
  assert.equal(doc.getElementById('event-fields').disabled, true);
  assert.equal(doc.querySelector('#article-form option[value="published"]').disabled, true);
  assert.equal(doc.querySelector('#list img'), null);
  assert.match(doc.querySelector('#list h3').textContent, /<img/);
  assert.equal(login.elements.password.value, '');
  assert.ok(requests.filter(r => r.path !== '/api/login').every(r => r.options.headers.Authorization === 'Bearer test-only-token'));
  doc.getElementById('logout').click();
  assert.equal(doc.getElementById('workspace').hidden, true);
  assert.equal(doc.getElementById('list').children.length, 0);
  dom.window.close();
});
