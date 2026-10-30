import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// UI behavior with a mock API; not a real Supabase login or browser test.
test('editor restores source and event safely and sees article conflict', async () => {
  const dom = new JSDOM(readFileSync('admin/index.html', 'utf8'), { url:'https://admin.example.test/admin', runScripts:'outside-only' });
  const { window } = dom, doc = window.document;
  const version = '2026-10-28T10:00:00Z';
  const posts = [], confirmations = [];
  window.confirm = question => { confirmations.push(question); return true; };
  const records = {
    '/api/articles': { role:'editor', articles:[{ id:1, title:'مقال اختبار', slug:'test', status:'draft', description:'وصف', body:[{type:'text',text:'النص الأصلي'}], updated_at:version, published_at:null }] },
    '/api/sources': { records:[{ id:2, name:'مصدر اختبار', organization:'جهة', url:'https://example.invalid/', is_verified:true, verified_on:'2026-10-01', review_due:'2027-01-01', updated_at:version }] },
    '/api/events': { records:[{ id:3, title:'موعد اختبار', slug:'event', program:'برنامج', event_date:'2027-01-01', audience:'', region:'', source_id:2, date_status:'official', publication_status:'published', verified_on:'2026-10-01', review_due:'2027-01-01', updated_at:version }] },
    '/api/revisions?article=1': { revisions:[{ id:8, changed_at:version, snapshot:{title:'مقال سابق'} }] },
    '/api/source-revisions?source=2': { revisions:[{ id:9, changed_at:version, snapshot:{name:'مصدر سابق'} }] },
    '/api/event-revisions?event=3': { revisions:[{ id:10, changed_at:version, snapshot:{title:'موعد سابق'} }] },
  };
  window.fetch = async (path, options={}) => {
    if (path === '/api/login') return {ok:true,json:async()=>({token:'editor-token'})};
    if (options.method === 'POST') {
      posts.push({path, body:JSON.parse(options.body)});
      if (path === '/api/articles') return {ok:false,json:async()=>({error:'تعارض التعديل'})};
      return {ok:true,json:async()=>({id:1})};
    }
    if (records[path]) return {ok:true,json:async()=>records[path]};
    throw new Error(`Unexpected request ${path}`);
  };
  const settle = () => new Promise(resolve => setTimeout(resolve, 20));
  const click = async element => { assert.ok(element); element.click(); await settle(); };
  try {
    window.eval(readFileSync('admin/admin.js', 'utf8'));
    const login = doc.getElementById('login-form');
    login.elements.email.value='editor@example.test'; login.elements.password.value='test-only';
    login.dispatchEvent(new window.Event('submit', { bubbles:true, cancelable:true })); await settle();
    assert.equal(doc.getElementById('workspace').hidden, false);
    await click([...doc.querySelectorAll('#source-list button')].find(el=>el.textContent==='سجل النسخ'));
    await click([...doc.querySelectorAll('#source-list button')].find(el=>el.textContent==='استعادة دون اعتماد'));
    assert.deepEqual(posts.find(p=>p.path==='/api/source-restore').body, {revision_id:9,updated_at:version});
    assert.match(confirmations[0], /دون اعتماد/);
    await click([...doc.querySelectorAll('#event-list button')].find(el=>el.textContent==='سجل النسخ'));
    await click([...doc.querySelectorAll('#event-list button')].find(el=>el.textContent==='استعادة كمسودة'));
    assert.deepEqual(posts.find(p=>p.path==='/api/event-restore').body, {revision_id:10,updated_at:version});
    assert.match(confirmations[1], /كمسودة/);
    await click([...doc.querySelectorAll('#list button')].find(el=>el.textContent==='سجل النسخ'));
    await click([...doc.querySelectorAll('#list button')].find(el=>el.textContent==='استعادة كمسودة'));
    assert.deepEqual(posts.find(p=>p.path==='/api/restore').body, {revision_id:8,updated_at:version});
    assert.match(confirmations[2], /كمسودة/);
    await click([...doc.querySelectorAll('#source-list button')].find(el=>el.textContent==='تعديل'));
    const sourceForm = doc.getElementById('source-form'); sourceForm.elements.url.value = 'https://example.invalid/new';
    sourceForm.dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true})); await settle();
    assert.match(confirmations[3], /يعيد المواعيد المرتبطة/);
    assert.equal(posts.find(p=>p.path==='/api/sources').body.url, 'https://example.invalid/new');
    await click([...doc.querySelectorAll('#list button')].find(el=>el.textContent==='تعديل'));
    const form=doc.getElementById('article-form'); form.elements.text.value='تعديل غير محفوظ';
    form.dispatchEvent(new window.Event('submit', {bubbles:true,cancelable:true})); await settle();
    assert.match(doc.getElementById('message').textContent, /تعارض التعديل/);
    assert.equal(form.elements.text.value, 'تعديل غير محفوظ');
    assert.equal(posts.find(p=>p.path==='/api/articles').body.updated_at, version);
  } finally { dom.window.close(); }
});
