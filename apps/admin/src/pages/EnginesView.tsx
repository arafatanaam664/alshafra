import { useEffect, useState } from 'react';
import { api, can, type SessionUser } from '../lib/api';

export function SitePublishBar({ user }: { user: SessionUser }) {
  const [last, setLast] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    api<{ last: Record<string, unknown> | null }>('/api/v1/admin/site-publish')
      .then((row) => setLast(row.last))
      .catch(() => setLast(null));
  }, []);
  if (!can(user, 'documents.publish')) return null;
  const stages = (last?.stages || {}) as { snapshot?: string; upload?: string; deploy?: string };
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <strong>حفظ → نشر → لقطة → بناء</strong>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '8px 0' }}>
        الحفظ يبقي المسودة. النشر يغيّر حالة المستند. اللقطة تجهّز الملفات العامة. البناء هو ما يراه الزائر.
      </p>
      <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>
        {last?.at
          ? `آخر لقطة: ${String(last.at)} · ${String(last.routes || 0)} مسار · رفع: ${stages.upload || '—'} · بناء: ${stages.deploy || '—'}`
          : 'لا توجد لقطة بعد'}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn secondary"
          type="button"
          onClick={async () => {
            const out = await api<{ routes: number; note?: string; live?: boolean; stages?: Record<string, string> }>(
              '/api/v1/admin/site-publish',
              { method: 'POST', body: JSON.stringify({ deploy: false }) },
            );
            setMsg(out.note || 'تم تجهيز اللقطة. الموقع الحي لم يُحدَّث.');
            setLast({ at: new Date().toISOString(), routes: out.routes, stages: out.stages, live: false });
          }}
        >
          تحديث اللقطة
        </button>
        <button
          className="btn"
          type="button"
          onClick={async () => {
            const out = await api<{ routes: number; note?: string; live?: boolean; stages?: Record<string, string> }>(
              '/api/v1/admin/site-publish',
              { method: 'POST', body: JSON.stringify({ deploy: true }) },
            );
            setMsg(out.note || 'طُلب البناء. الزائر لا يرى التغيير قبل اكتمال البناء.');
            setLast({ at: new Date().toISOString(), routes: out.routes, stages: out.stages, live: Boolean(out.live) });
          }}
        >
          إطلاق بناء الإنتاج
        </button>
      </div>
      {msg && <p style={{ margin: '8px 0 0' }}>{msg}</p>}
    </div>
  );
}

export function OpportunitiesView({ user }: { user: SessionUser }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [title, setTitle] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [kind, setKind] = useState('job');
  const [msg, setMsg] = useState('');
  async function reload() {
    setRows(await api<Record<string, unknown>[]>('/api/v1/admin/opportunities'));
  }
  useEffect(() => {
    void reload();
  }, []);
  return (
    <>
      <div className="page-h"><div><div className="crumbs">الفرص</div><h2>الوظائف والمنح</h2></div></div>
      <p>لا تظهر للزائر إلا بعد التفعيل ووجود مصدر وتاريخ ساري. الصفحات المنتهية لا تُفهرس.</p>
      {msg && <div className="toast">{msg}</div>}
      {can(user, 'documents.create') && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="grid grid-2">
            <div className="field"><label>العنوان</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="field"><label>المصدر</label><input value={sourceName} onChange={(e) => setSourceName(e.target.value)} /></div>
            <div className="field">
              <label>النوع</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="job">وظيفة</option>
                <option value="scholarship">منحة</option>
                <option value="training">تدريب</option>
                <option value="other">فرصة</option>
              </select>
            </div>
          </div>
          <button
            className="btn"
            type="button"
            onClick={async () => {
              await api('/api/v1/admin/opportunities', {
                method: 'POST',
                body: JSON.stringify({ title, kind, listing: { kind, sourceName } }),
              });
              setMsg('أُنشئت كمسودة');
              setTitle('');
              await reload();
            }}
          >
            إنشاء مسودة
          </button>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>العنوان</th><th>النوع</th><th>الحالة</th><th>منتهية</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)}>
                <td>{String(row.title)}<div><code>{String(row.path)}</code></div></td>
                <td>{String(row.type)}</td>
                <td>{String(row.status)}</td>
                <td>{row.expired ? 'نعم' : 'لا'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">لا فرص بعد</div>}
      </div>
    </>
  );
}

export function SocialQueueView({ user }: { user: SessionUser }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [msg, setMsg] = useState('');
  async function reload() {
    setRows(await api<Record<string, unknown>[]>('/api/v1/admin/social/jobs'));
  }
  useEffect(() => {
    void reload().catch(() => setRows([]));
  }, []);
  return (
    <>
      <div className="page-h"><div><div className="crumbs">اجتماعي</div><h2>طابور النشر</h2></div></div>
      <p>لا يتصل بمزود حقيقي في التطوير. الإنتاج بدون مفاتيح يفشل بأمان ويُعاد المحاولة.</p>
      {msg && <div className="toast">{msg}</div>}
      {can(user, 'automation.edit') && (
        <button
          className="btn secondary"
          type="button"
          onClick={async () => {
            const out = await api<{ social: { status: string }[] }>('/api/v1/admin/jobs/run', { method: 'POST' });
            setMsg(`شغّل العامل: ${out.social.length} مهمة`);
            await reload();
          }}
        >
          تشغيل العامل
        </button>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <table className="table">
          <thead><tr><th>المزود</th><th>الحالة</th><th>خطأ</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)}>
                <td>{String(row.provider)}</td>
                <td>{String(row.status)}</td>
                <td>{String(row.last_error || '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">الطابور فارغ</div>}
      </div>
    </>
  );
}

export function AutomationView({ user }: { user: SessionUser }) {
  const [rules, setRules] = useState<Record<string, unknown>[]>([]);
  const [runs, setRuns] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('نشر تيليغرام بعد النشر');
  useEffect(() => {
    api<Record<string, unknown>[]>('/api/v1/admin/automation/rules').then(setRules).catch(() => setRules([]));
    api<Record<string, unknown>[]>('/api/v1/admin/automation/runs').then(setRuns).catch(() => setRuns([]));
  }, []);
  return (
    <>
      <div className="page-h"><div><div className="crumbs">أتمتة</div><h2>القواعد والتشغيل</h2></div></div>
      {can(user, 'automation.edit') && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field"><label>اسم القاعدة</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <button
            className="btn"
            type="button"
            onClick={async () => {
              await api('/api/v1/admin/automation/rules', {
                method: 'POST',
                body: JSON.stringify({
                  name,
                  trigger: 'document.published',
                  isEnabled: false,
                  actions: [{ type: 'social.enqueue', provider: 'telegram' }],
                }),
              });
              setRules(await api<Record<string, unknown>[]>('/api/v1/admin/automation/rules'));
            }}
          >
            إنشاء قاعدة متوقفة
          </button>
        </div>
      )}
      <div className="grid grid-2">
        <div className="card">
          <h3>القواعد</h3>
          {rules.map((rule) => (
            <div className="check" key={String(rule.id)}>
              <span>{String(rule.name)} · {String(rule.trigger)}</span>
              <strong>{rule.is_enabled ? 'مفعّلة' : 'متوقفة'}</strong>
            </div>
          ))}
          {!rules.length && <div className="empty">لا قواعد</div>}
        </div>
        <div className="card">
          <h3>التشغيلات</h3>
          {runs.map((run) => (
            <div className="check" key={String(run.id)}>
              <span>{String(run.event_id)}</span>
              <span>{String(run.status)}</span>
            </div>
          ))}
          {!runs.length && <div className="empty">لا تشغيلات</div>}
        </div>
      </div>
    </>
  );
}

export function NotificationsAdminView() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    api<Record<string, unknown>[]>('/api/v1/admin/notifications').then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <>
      <div className="page-h"><h2>الإشعارات</h2></div>
      <div className="card">
        {rows.map((row) => (
          <div className="check" key={String(row.id)}>
            <span>{String(row.type)}</span>
            <span>{row.read_at ? 'مقروء' : 'جديد'}</span>
          </div>
        ))}
        {!rows.length && <div className="empty">لا توجد بيانات كافية بعد.</div>}
      </div>
    </>
  );
}

export function AdsView() {
  const [data, setData] = useState<{ enabled: boolean; client: string; slots: { key: string; slotId: string }[] } | null>(null);
  useEffect(() => {
    api<typeof data>('/api/v1/admin/ads').then(setData).catch(() => setData({ enabled: false, client: '', slots: [] }));
  }, []);
  return (
    <>
      <div className="page-h"><h2>الإعلانات</h2></div>
      <div className="card">
        <p>الواجهة العامة لا تعرض إعلاناً إذا كان العلم متوقفاً أو لا يوجد معرّف خانة.</p>
        <p>الحالة: {data?.enabled ? 'جاهز' : 'متوقف'}</p>
        <p>العميل: {data?.client || 'غير معيّن'}</p>
        {!data?.slots.length && <div className="empty">لا خانات مفعّلة</div>}
      </div>
    </>
  );
}
