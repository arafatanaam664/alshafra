'use strict';
let token = null, role = null, articles = [], editing = null, editingUpdatedAt = null;
const $ = (id) => document.getElementById(id);
const form = $('article-form');
function message(text) { $('message').textContent = text; }
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'حدث خطأ.');
  return data;
}
function clearEditor() { editing = null; editingUpdatedAt = null; form.reset(); $('form-title').textContent = 'مقال جديد'; updateStatus(); }
function updateStatus() { $('publish-label').hidden = form.elements.status.value !== 'published'; form.elements.published_at.required = form.elements.status.value === 'published'; }
function renderList() {
  const list = $('list'); list.replaceChildren();
  if (!articles.length) { list.textContent = 'لا توجد مقالات متاحة بعد.'; return; }
  for (const article of articles) {
    const row = document.createElement('div'); row.className = 'article';
    const title = document.createElement('h3'); title.textContent = article.title;
    const meta = document.createElement('p'); meta.textContent = `${article.slug} · ${{ draft: 'مسودة', review: 'مراجعة', published: 'منشور / مجدول', archived: 'مؤرشف' }[article.status] || article.status}`;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'تعديل';
    button.addEventListener('click', () => {
      // Refuse to overwrite rich content created outside this text-only prototype.
      if (!Array.isArray(article.body) || article.body.some(b => b.type !== 'text' || typeof b.text !== 'string') || article.body.length > 1) { message('لا يدعم المحرر النصي تعديل بنية هذا المقال.'); return; }
      editing = article.id; editingUpdatedAt = article.updated_at; form.elements.title.value = article.title; form.elements.slug.value = article.slug; form.elements.description.value = article.description; form.elements.text.value = article.body[0]?.text || ''; form.elements.status.value = article.status;
      form.elements.published_at.value = article.published_at ? new Date(new Date(article.published_at).getTime() + 3 * 3600000).toISOString().slice(0, 16) : '';
      $('form-title').textContent = 'تعديل المقال'; updateStatus(); form.elements.title.focus();
    });
    const history = document.createElement('button'); history.type = 'button'; history.className = 'secondary'; history.textContent = 'سجل النسخ';
    const historyArea = document.createElement('div');
    history.addEventListener('click', async () => {
      try {
        const result = await api(`/api/revisions?article=${article.id}`); historyArea.replaceChildren();
        if (!result.revisions.length) { historyArea.textContent = 'لا توجد نسخ متاحة.'; return; }
        for (const revision of result.revisions) {
          const entry = document.createElement('p');
          const label = document.createElement('span'); label.textContent = `${new Date(revision.changed_at).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })} — ${revision.snapshot?.title || 'نسخة'}`;
          const restore = document.createElement('button'); restore.type = 'button'; restore.className = 'secondary'; restore.textContent = 'استعادة كمسودة';
          restore.addEventListener('click', async () => {
            if (!window.confirm('استعادة العنوان والوصف والمحتوى كمسودة؟ سيتوقف النشر التجريبي حتى إعادة المراجعة، ولن يتغير الرابط.')) return;
            try { await api('/api/restore', { method: 'POST', body: JSON.stringify({ revision_id: revision.id, updated_at: article.updated_at }) }); clearEditor(); await refresh(); message('استُعيد المحتوى كمسودة بانتظار المراجعة.'); } catch (error) { message(error.message); }
          });
          entry.append(label, ' ', restore); historyArea.append(entry);
        }
      } catch (error) { message(error.message); }
    });
    row.append(title, meta, button, ' ', history, historyArea); list.append(row);
  }
}
async function refresh() { const result = await api('/api/articles'); role = result.role; articles = result.articles; $('role').textContent = `الدور: ${{admin:'مدير',editor:'محرر',writer:'كاتب'}[role]}`; for (const option of form.elements.status.options) option.disabled = role === 'writer' && ['published','archived'].includes(option.value); renderList(); }
$('login-form').addEventListener('submit', async event => { event.preventDefault(); message('جارٍ تسجيل الدخول…'); const f = event.currentTarget; try { const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ email: f.elements.email.value, password: f.elements.password.value }) }); token = result.token; f.reset(); await refresh(); await refreshRegister(); $('login').hidden = true; $('workspace').hidden = false; message('تم تسجيل الدخول.'); } catch (error) { token = null; f.elements.password.value = ''; articles = []; sources = []; events = []; $('list').replaceChildren(); $('source-list').replaceChildren(); $('event-list').replaceChildren(); message(error.message); } });
$('logout').addEventListener('click', () => { token = null; role = null; articles = []; sources = []; events = []; clearEditor(); clearSource(); clearEvent(); $('list').replaceChildren(); $('source-list').replaceChildren(); $('event-list').replaceChildren(); $('event-source').replaceChildren(new Option('لم يحدد', '')); $('workspace').hidden = true; $('login').hidden = false; message('تم إنهاء الجلسة في هذه الصفحة.'); });
$('new').addEventListener('click', clearEditor);
form.elements.status.addEventListener('change', updateStatus); updateStatus();
form.addEventListener('submit', async event => { event.preventDefault(); message('جارٍ الحفظ…'); const f = event.currentTarget; const value = { ...(editing ? { id: editing, updated_at: editingUpdatedAt } : {}), title: f.elements.title.value, slug: f.elements.slug.value, description: f.elements.description.value, text: f.elements.text.value, status: f.elements.status.value, published_at: f.elements.status.value === 'published' ? `${f.elements.published_at.value}:00+03:00` : null }; try { await api('/api/articles', { method: 'POST', body: JSON.stringify(value) }); clearEditor(); await refresh(); message('حُفظ المقال في قاعدة بيانات التطوير فقط.'); } catch (error) { message(error.message); } });

// The writer can read the editorial register but cannot change source or event records.
let sources = [], events = [], sourceEdit = null, eventEdit = null;
const sf = $('source-form'), ef = $('event-form');
const control = (formElement, name) => formElement.elements.namedItem(name);
function clearSource() { sourceEdit = null; sf.reset(); $('source-title').textContent = 'إضافة مصدر'; }
function clearEvent() { eventEdit = null; ef.reset(); $('event-title').textContent = 'إضافة موعد'; }
function dateInRiyadh() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts();
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function recordRow(parent, title, detail, onEdit) {
  const row = document.createElement('div'); row.className = 'article';
  const heading = document.createElement('h3'); heading.textContent = title;
  const text = document.createElement('p'); text.textContent = detail;
  row.append(heading, text);
  if (role !== 'writer') { const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'secondary'; edit.textContent = 'تعديل'; edit.addEventListener('click', onEdit); row.append(edit); }
  parent.append(row);
  return row;
}
function renderSources() {
  const list = $('source-list'), selection = $('event-source'), current = selection.value;
  list.replaceChildren(); selection.replaceChildren(new Option('لم يحدد', ''));
  if (!sources.length) list.textContent = 'لا توجد مصادر بعد.';
  for (const source of sources) {
    const status = !source.is_verified ? 'غير متحقق' : source.review_due < dateInRiyadh() ? 'المراجعة منتهية' : 'مراجع';
    const row = recordRow(list, source.name, `${source.organization} · ${status} · المراجعة التالية: ${source.review_due || 'غير محددة'}`, () => {
      sourceEdit = source; for (const name of ['name','organization','url','verified_on','review_due']) control(sf, name).value = source[name] || '';
      control(sf,'is_verified').checked = source.is_verified; $('source-title').textContent = 'تعديل مصدر'; control(sf,'name').focus();
    });
    const history = document.createElement('button'); history.type = 'button'; history.className = 'secondary'; history.textContent = 'سجل النسخ';
    const area = document.createElement('div');
    history.addEventListener('click', async () => {
      try {
        const result = await api(`/api/source-revisions?source=${source.id}`); area.replaceChildren();
        if (!result.revisions.length) { area.textContent = 'لا توجد نسخ متاحة.'; return; }
        for (const revision of result.revisions) {
          const entry = document.createElement('p'); const label = document.createElement('span');
          label.textContent = `${new Date(revision.changed_at).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })} — ${revision.snapshot?.name || 'نسخة'}`;
          entry.append(label);
          if (role !== 'writer') {
            const restore = document.createElement('button'); restore.type = 'button'; restore.className = 'secondary'; restore.textContent = 'استعادة دون اعتماد';
            restore.addEventListener('click', async () => {
              if (!window.confirm('ستُستعاد بيانات المصدر دون اعتماد، وستعود المواعيد المرتبطة المنشورة إلى مسودات للمراجعة. هل تتابع؟')) return;
              try { await api('/api/source-restore', { method:'POST', body:JSON.stringify({ revision_id:revision.id, updated_at:source.updated_at }) }); clearSource(); await refreshRegister(); message('استُعيد المصدر دون اعتماد، وبانتظار مراجعة جديدة.'); } catch (error) { message(error.message); }
            });
            entry.append(' ', restore);
          }
          area.append(entry);
        }
      } catch (error) { message(error.message); }
    });
    row.append(' ', history, area);
    selection.add(new Option(`${source.name} — ${status}`, String(source.id)));
  }
  selection.value = current || '';
}
function renderEvents() {
  const list = $('event-list'); list.replaceChildren();
  if (!events.length) { list.textContent = 'لا توجد مواعيد بعد.'; return; }
  const statusNames = { official:'رسمي', usual:'معتاد', estimated:'تقديري', pending:'بانتظار الإعلان', expired:'منتهي' };
  const publicationNames = { draft:'مسودة', published:'منشور تجريبياً', archived:'مؤرشف' };
  for (const event of events) {
    const stale = event.review_due && event.review_due < dateInRiyadh() ? ' · المراجعة منتهية' : '';
    const row = recordRow(list, event.title, `${event.event_date || 'لم يحدد التاريخ'} · ${statusNames[event.date_status]} · ${publicationNames[event.publication_status]}${stale}`, () => {
      eventEdit = event; for (const name of ['title','slug','program','event_date','audience','region','date_status','publication_status','verified_on','review_due']) control(ef,name).value = event[name] || '';
      control(ef,'source_id').value = event.source_id ? String(event.source_id) : ''; $('event-title').textContent = 'تعديل موعد'; control(ef,'title').focus();
    });
    const history = document.createElement('button'); history.type = 'button'; history.className = 'secondary'; history.textContent = 'سجل النسخ';
    const area = document.createElement('div');
    history.addEventListener('click', async () => {
      try {
        const result = await api(`/api/event-revisions?event=${event.id}`); area.replaceChildren();
        if (!result.revisions.length) { area.textContent = 'لا توجد نسخ متاحة.'; return; }
        for (const revision of result.revisions) {
          const entry = document.createElement('p'); const label = document.createElement('span');
          label.textContent = `${new Date(revision.changed_at).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })} — ${revision.snapshot?.title || 'نسخة'}`;
          entry.append(label);
          if (role !== 'writer') {
            const restore = document.createElement('button'); restore.type = 'button'; restore.className = 'secondary'; restore.textContent = 'استعادة كمسودة';
            restore.addEventListener('click', async () => {
              if (!window.confirm('استعادة محتوى الموعد كمسودة بانتظار المراجعة؟ يبقى الرابط الحالي دون تغيير.')) return;
              try { await api('/api/event-restore', { method:'POST', body:JSON.stringify({ revision_id:revision.id, updated_at:event.updated_at }) }); clearEvent(); await refreshRegister(); message('استُعيد الموعد كمسودة بانتظار مراجعة جديدة.'); } catch (error) { message(error.message); }
            });
            entry.append(' ', restore);
          }
          area.append(entry);
        }
      } catch (error) { message(error.message); }
    });
    row.append(' ', history, area);
  }
}
async function refreshRegister() {
  const [sourceResult, eventResult] = await Promise.all([api('/api/sources'), api('/api/events')]);
  sources = sourceResult.records; events = eventResult.records;
  $('source-fields').disabled = role === 'writer'; $('event-fields').disabled = role === 'writer';
  $('source-new').hidden = role === 'writer'; $('event-new').hidden = role === 'writer';
  renderSources(); renderEvents();
}
$('source-new').addEventListener('click', clearSource);
$('event-new').addEventListener('click', clearEvent);
sf.addEventListener('submit', async event => {
  event.preventDefault();
  const value = { ...(sourceEdit ? { id:sourceEdit.id, updated_at:sourceEdit.updated_at } : {}), name:control(sf,'name').value, organization:control(sf,'organization').value, url:control(sf,'url').value, verified_on:control(sf,'verified_on').value || null, review_due:control(sf,'review_due').value || null, is_verified:control(sf,'is_verified').checked };
  const sourceChanged = sourceEdit && ['name','organization','url','verified_on','review_due','is_verified'].some(name => (value[name] ?? null) !== (sourceEdit[name] ?? null));
  if (sourceChanged && !window.confirm('تعديل المصدر يعيد المواعيد المرتبطة إلى المراجعة وقد يوقف نشرها التجريبي. هل تريد المتابعة؟')) return;
  try { await api('/api/sources', { method:'POST', body:JSON.stringify(value) }); clearSource(); await refreshRegister(); message('حُفظ المصدر في بيئة التطوير.'); } catch (error) { message(error.message); }
});
ef.addEventListener('submit', async event => {
  event.preventDefault();
  const value = { ...(eventEdit ? { id:eventEdit.id, updated_at:eventEdit.updated_at } : {}), title:control(ef,'title').value, slug:control(ef,'slug').value, program:control(ef,'program').value, event_date:control(ef,'event_date').value || null, audience:control(ef,'audience').value, region:control(ef,'region').value, date_status:control(ef,'date_status').value, publication_status:control(ef,'publication_status').value, source_id:control(ef,'source_id').value ? Number(control(ef,'source_id').value) : null, verified_on:control(ef,'verified_on').value || null, review_due:control(ef,'review_due').value || null };
  if (value.publication_status === 'published' && !window.confirm('هل راجعت الموعد والمصدر وترغب في نشره داخل بيئة التطوير فقط؟')) return;
  try { await api('/api/events', { method:'POST', body:JSON.stringify(value) }); clearEvent(); await refreshRegister(); message('حُفظ الموعد في بيئة التطوير.'); } catch (error) { message(error.message); }
});
