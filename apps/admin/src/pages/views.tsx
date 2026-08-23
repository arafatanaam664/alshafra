import { useEffect, useMemo, useState } from 'react';
import { api, type SessionUser, can } from '../lib/api';
import { match, navigate } from '../lib/hash';

function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fn()
      .then((d) => live && setData(d))
      .catch((e: Error) => live && setErr(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, err, loading, setData };
}

export function DashboardView() {
  const { data, err, loading } = useLoad(() => api<Record<string, unknown>>('/api/v1/admin/dashboard'), []);
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err || !data) return <div className="empty crit">{err || 'empty'}</div>;
  const d = data as unknown as {
    content: Record<string, number>;
    traffic: { pageViews: number; hasData: boolean; events: number };
    system: { routes: number; missingSeo: number };
    topPages: { path: string; title: string; views: number }[];
  };
  return (
    <>
      <div className="page-h"><div><div className="crumbs">نظرة عامة</div><h2>لوحة التحكم</h2></div></div>
      <div className="grid grid-4">
        <div className="card stat"><span>منشور</span><b>{d.content.published}</b></div>
        <div className="card stat"><span>مسودات</span><b>{d.content.draft}</b></div>
        <div className="card stat"><span>مراجعة</span><b>{d.content.review}</b></div>
        <div className="card stat"><span>مسارات نشطة</span><b>{d.system.routes}</b></div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>الزيارات</h3>
          {d.traffic.hasData ? <p>{d.traffic.pageViews} مشاهدة · {d.traffic.events} حدث</p> : <p className="empty">No data yet — لا توجد بيانات تحليلات بعد.</p>}
        </div>
        <div className="card">
          <h3>أعلى الصفحات</h3>
          {d.topPages.every((p) => p.views === 0) ? (
            <p className="empty">Not enough data</p>
          ) : (
            <ul>{d.topPages.map((p) => <li key={p.path}>{p.title} — {p.views}</li>)}</ul>
          )}
        </div>
      </div>
    </>
  );
}

export function ContentList({ route }: { route: string }) {
  const status = new URLSearchParams(route.split('?')[1] || '').get('status') || '';
  const { data, err, loading } = useLoad(
    () => api<Record<string, unknown>[]>(`/api/v1/admin/documents${status ? `?status=${status}` : ''}`),
    [status],
  );
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  const rows = data || [];
  return (
    <>
      <div className="page-h">
        <div><div className="crumbs">المحتوى</div><h2>إدارة المحتوى</h2></div>
        <button className="btn" onClick={() => navigate('/content/new')}>محتوى جديد</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>العنوان</th><th>النوع</th><th>الحالة</th><th>المسار</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)} style={{ cursor: 'pointer' }} onClick={() => navigate(`/content/${r.id}`)}>
                <td>{String(r.title)}</td>
                <td>{String(r.type)}</td>
                <td><span className={`badge b-${r.status}`}>{String(r.status)}</span></td>
                <td><code>{String(r.path)}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">لا توجد عناصر</div>}
      </div>
    </>
  );
}

export function ContentEditor({ id, isNew, user }: { id?: string; isNew?: boolean; user: SessionUser }) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [type, setType] = useState('article');
  const [body, setBody] = useState('[{"type":"p","text":""}]');
  const [seoTitle, setSeoTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [status, setStatus] = useState('draft');
  const [path, setPath] = useState('');
  const [docId, setDocId] = useState(id);
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState('');
  const [audit, setAudit] = useState<{ id: string; level: string; label: string; ok: boolean }[]>([]);
  const [revisions, setRevisions] = useState<{ version: number; title: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('edit');
  const [preview, setPreview] = useState(false);
  const [createRedirect, setCreateRedirect] = useState(false);
  const [featuredMediaId, setFeaturedMediaId] = useState('');

  useEffect(() => {
    if (!docId || isNew) return;
    const t = window.setTimeout(() => {
      void save(true);
    }, 2000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, body, seoTitle, meta]);

  useEffect(() => {
    if (!id || isNew) return;
    api<{ document: Record<string, unknown>; faq: { question: string; answer: string }[]; revisions: { version: number; title: string }[]; seoAudit: typeof audit }>(
      `/api/v1/admin/documents/${id}`,
    ).then((row) => {
      const d = row.document;
      setTitle(String(d.title || ''));
      setExcerpt(String(d.excerpt || ''));
      setType(String(d.type || 'article'));
      setStatus(String(d.status || 'draft'));
      setPath(String(d.path || ''));
      setSeoTitle(String(d.seo_title || ''));
      setMeta(String(d.meta_description || ''));
      setBody(JSON.stringify(d.body_json || [], null, 2));
      setFaq((row.faq || []).map((f) => ({ q: f.question, a: f.answer })));
      setRevisions(row.revisions || []);
      setAudit(row.seoAudit || []);
      setFeaturedMediaId(String(d.featured_media_id || ''));
    }).catch((e: Error) => setMsg(e.message));
  }, [id, isNew]);

  const blocks = useMemo(() => {
    try {
      return JSON.parse(body) as { type: string; text?: string; items?: string[] }[];
    } catch {
      return [];
    }
  }, [body]);

  async function save(autosave = false) {
    const payload = {
      title,
      excerpt,
      body: blocks,
      seoTitle,
      metaDescription: meta,
      autosave,
      createRedirect,
      path: path || undefined,
      featuredMediaId: featuredMediaId || undefined,
    };
    if (isNew && !docId) {
      const created = await api<{ id: string; path: string }>('/api/v1/admin/documents', {
        method: 'POST',
        body: JSON.stringify({ type, title, excerpt }),
      });
      setDocId(created.id);
      setPath(created.path);
      await api(`/api/v1/admin/documents/${created.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setMsg('أُنشئ كمسودة');
      navigate(`/content/${created.id}`);
      return created.id;
    }
    await api(`/api/v1/admin/documents/${docId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    if (tags) await api(`/api/v1/admin/documents/${docId}/tags`, { method: 'POST', body: JSON.stringify({ slugs: tags.split(',') }) });
    await api(`/api/v1/admin/documents/${docId}/faq`, { method: 'POST', body: JSON.stringify({ items: faq }) });
    setMsg(autosave ? 'حفظ تلقائي' : 'تم الحفظ');
    return docId;
  }

  async function go(to: string) {
    const current = await save(false);
    await api(`/api/v1/admin/documents/${current}/transition`, { method: 'POST', body: JSON.stringify({ to }) });
    setStatus(to);
    setMsg(`الانتقال إلى ${to}`);
  }

  return (
    <>
      <div className="page-h">
        <div><div className="crumbs">المحتوى / محرر</div><h2>{isNew ? 'محتوى جديد' : title || 'تحرير'}</h2></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => save(false)}>حفظ</button>
          {status === 'draft' && <button className="btn secondary" onClick={() => go('review')}>إرسال للمراجعة</button>}
          {can(user, 'documents.publish') && status === 'review' && <button className="btn" onClick={() => go('published')}>نشر</button>}
          {can(user, 'documents.publish') && status === 'published' && <button className="btn danger" onClick={() => go('unpublished')}>إلغاء النشر</button>}
          {can(user, 'documents.publish') && <button className="btn secondary" onClick={() => go('archived')}>أرشفة</button>}
          <button className="btn secondary" onClick={() => setPreview((v) => !v)}>معاينة</button>
        </div>
      </div>
      {msg && <div className="toast">{msg}</div>}
      <div className="tabs">
        {['edit', 'seo', 'faq', 'source', 'history'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {preview && (
        <div className="preview" style={{ marginBottom: 16 }}>
          <meta name="robots" />
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Preview · noindex</p>
          <h1>{title}</h1>
          {blocks.map((b, i) => b.type === 'ul' ? <ul key={i}>{(b.items || []).map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{b.text}</p>)}
        </div>
      )}
      {tab === 'edit' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="field"><label>النوع</label>
              <select value={type} onChange={(e) => setType(e.target.value)} disabled={!isNew}>
                {['article', 'guide', 'solution', 'news', 'trend', 'faq_page', 'comparison', 'opportunity', 'job', 'scholarship'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>العنوان</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="field"><label>المقتطف</label><textarea rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
            <div className="field"><label>المسار</label><input value={path} onChange={(e) => setPath(e.target.value)} /></div>
            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={createRedirect} onChange={(e) => setCreateRedirect(e.target.checked)} />
              إنشاء تحويل عند تغيير المسار
            </label>
            <div className="field"><label>وسوم (فاصلة)</label><input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="field"><label>معرّف صورة بارزة (من مكتبة الوسائط)</label><input value={featuredMediaId} onChange={(e) => setFeaturedMediaId(e.target.value)} /></div>
            <p>الحالة: <span className={`badge b-${status}`}>{status}</span></p>
          </div>
          <div className="card">
            <div className="field"><label>المحتوى (blocks JSON)</label>
              <textarea rows={16} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          </div>
        </div>
      )}
      {tab === 'seo' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="field"><label>SEO title</label><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></div>
            <div className="field"><label>Meta description</label><textarea rows={4} value={meta} onChange={(e) => setMeta(e.target.value)} /></div>
          </div>
          <div className="card">
            <h3>تدقيق SEO</h3>
            {audit.map((c) => (
              <div className="check" key={c.id}>
                <span>{c.label}</span>
                <strong className={c.ok ? 'ok' : c.level === 'critical' ? 'crit' : 'warn'}>{c.ok ? 'Good' : c.level}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'faq' && (
        <div className="card">
          {faq.map((f, i) => (
            <div key={i} className="grid grid-2">
              <input placeholder="سؤال" value={f.q} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
              <input placeholder="جواب" value={f.a} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
            </div>
          ))}
          <button className="btn secondary" onClick={() => setFaq([...faq, { q: '', a: '' }])}>إضافة سؤال</button>
        </div>
      )}
      {tab === 'source' && (
        <div className="card">
          <div className="field"><label>اسم المصدر</label><input value={sourceName} onChange={(e) => setSourceName(e.target.value)} /></div>
          <div className="field"><label>رابط</label><input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} /></div>
          <button className="btn" onClick={async () => {
            if (!docId) await save(false);
            await api(`/api/v1/admin/documents/${docId}/source`, { method: 'POST', body: JSON.stringify({ name: sourceName, url: sourceUrl }) });
            setMsg('أُضيف المصدر');
          }}>ربط المصدر</button>
        </div>
      )}
      {tab === 'history' && (
        <div className="card">
          {revisions.map((r) => (
            <div className="check" key={r.version}>
              <span>v{r.version} — {r.title}</span>
              <button className="btn secondary" onClick={() => api(`/api/v1/admin/documents/${docId}/restore`, { method: 'POST', body: JSON.stringify({ version: r.version }) }).then(() => setMsg('تمت الاستعادة'))}>استعادة</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function SimpleList({ title, path }: { title: string; path: string }) {
  const { data, err, loading } = useLoad(() => api<unknown[]>(path), [path]);
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  const rows = (data || []) as Record<string, unknown>[];
  const keys = rows[0] ? Object.keys(rows[0]).slice(0, 6) : [];
  return (
    <>
      <div className="page-h"><div><h2>{title}</h2></div></div>
      <div className="card">
        <table className="table">
          <thead><tr>{keys.map((k) => <th key={k}>{k}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{keys.map((k) => <td key={k}>{String(r[k] ?? '')}</td>)}</tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">No data yet</div>}
      </div>
    </>
  );
}

export function FlagsView() {
  const { data, err, loading } = useLoad(() => api<Record<string, unknown>[]>('/api/v1/admin/flags'), []);
  const [msg, setMsg] = useState('');
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  return (
    <>
      <div className="page-h"><h2>Feature Flags</h2></div>
      {msg && <div className="toast">{msg}</div>}
      <div className="card">
        {(data || []).map((f) => (
          <div className="check" key={String(f.key)}>
            <div>
              <strong>{String(f.key)}</strong>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>{String(f.description || '')} · {String(f.environment)}</div>
            </div>
            <button className="btn secondary" onClick={async () => {
              await api(`/api/v1/admin/flags/${encodeURIComponent(String(f.key))}`, { method: 'PATCH', body: JSON.stringify({ enabled: !f.is_enabled }) });
              setMsg('تم التحديث ويُسجَّل في التدقيق');
            }}>{f.is_enabled ? 'مفعّل' : 'متوقف'}</button>
          </div>
        ))}
      </div>
    </>
  );
}

export function SettingsView() {
  const { data, err, loading } = useLoad(() => api<Record<string, unknown>[]>('/api/v1/admin/settings'), []);
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  return (
    <>
      <div className="page-h"><h2>إعدادات الموقع</h2></div>
      <div className="card">
        {(data || []).map((s) => (
          <div className="check" key={String(s.key)}>
            <span>{String(s.key)}</span>
            <code>{JSON.stringify(s.value_json)}</code>
          </div>
        ))}
      </div>
    </>
  );
}

export function HealthView() {
  const { data, err, loading } = useLoad(() => api<Record<string, unknown>>('/api/v1/admin/health'), []);
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  const d = data as {
    database: string;
    routes: { label: string };
    seo: { label: string };
    analytics: string;
    media?: { label?: string; driver?: string };
  };
  return (
    <>
      <div className="page-h"><h2>صحة النظام</h2></div>
      <div className="grid grid-2">
        <div className="card stat"><span>Database</span><b>{d.database}</b></div>
        <div className="card stat"><span>Routes</span><b>{d.routes.label}</b></div>
        <div className="card stat"><span>SEO</span><b>{d.seo.label}</b></div>
        <div className="card stat"><span>Analytics</span><b>{d.analytics}</b></div>
      </div>
    </>
  );
}

export function AnalyticsView() {
  const { data, err, loading } = useLoad(() => api<{ hasData: boolean; events: number; social: { hasData: boolean }; pages: unknown[] }>('/api/v1/admin/analytics'), []);
  if (loading) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;
  return (
    <>
      <div className="page-h"><h2>التحليلات</h2></div>
      <div className="card">
        {data?.hasData ? <p>{data.events} حدثًا</p> : <p className="empty">No data yet</p>}
        <p>Social: {data?.social.hasData ? 'available' : 'No data yet'}</p>
      </div>
    </>
  );
}

export function LoginView({ onDone }: { onDone: (u: SessionUser) => void }) {
  const [email, setEmail] = useState('editor@local.test');
  const [err, setErr] = useState('');
  return (
    <div className="login">
      <form className="card" onSubmit={async (e) => {
        e.preventDefault();
        try {
          const r = await api<{ user: SessionUser }>('/api/v1/admin/auth/login', { method: 'POST', body: JSON.stringify({ email }) });
          onDone(r.user);
          navigate('/');
        } catch (ex) {
          setErr(ex instanceof Error ? ex.message : 'login_failed');
        }
      }}>
        <h2>دخول الإدارة</h2>
        <p style={{ color: 'var(--muted)' }}>تطوير محلي فقط عندما ADMIN_DEV_LOGIN=true. الإنتاج = Supabase Auth.</p>
        <div className="field"><label>البريد</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {err && <p className="crit">{err}</p>}
        <button className="btn" type="submit">دخول</button>
      </form>
    </div>
  );
}

export function ComingSoon({ name }: { name: string }) {
  return <div className="empty">{name} — Coming soon. لا توجد endpoints مفعّلة.</div>;
}

export function routeParams(route: string) {
  return match(route.split('?')[0], '/content/:id');
}
