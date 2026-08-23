import { useEffect, useMemo, useState } from 'react';
import { api, can, type SessionUser } from '../lib/api';
import { navigate } from '../lib/hash';

type Child = {
  key: string;
  name: string;
  path: string;
  enabled: boolean;
  sort: number;
  lockedPath: boolean;
};

type Section = {
  key: string;
  name: string;
  path: string;
  description: string;
  enabled: boolean;
  showInNav: boolean;
  showInHome: boolean;
  showInFooter: boolean;
  showInMobile: boolean;
  featured: boolean;
  sort: number;
  children: Child[];
  featureFlag: string | null;
  hasPublicPage: boolean;
  lockedPath: boolean;
  system: boolean;
  seoTitle: string;
  seoDescription: string;
};

type Catalog = {
  sections: Section[];
  note?: string;
  contract?: Record<string, unknown>;
};

function useCatalog() {
  const [data, setData] = useState<Catalog | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api<Catalog>('/api/v1/admin/sections')
      .then(setData)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
  }, []);
  return { data, err, loading, reload, setData };
}

export function SectionsView({ user }: { user: SessionUser }) {
  const { data, err, loading, reload } = useCatalog();
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<string | null>('calendar');
  const writable = can(user, 'settings.write');

  const sections = data?.sections || [];
  const visible = useMemo(
    () => sections.filter((section) => section.enabled && section.hasPublicPage && section.showInNav),
    [sections],
  );

  async function save(key: string, patch: Record<string, unknown>) {
    const row = await api<Section>(`/api/v1/admin/sections/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setMsg(`حُفظ قسم «${row?.name || key}». يظهر للزائر بعد تصدير اللقطة وبناء الموقع.`);
    reload();
  }

  async function move(key: string, dir: -1 | 1) {
    const keys = sections.map((section) => section.key);
    const index = keys.indexOf(key);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= keys.length) return;
    const copy = [...keys];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    await api('/api/v1/admin/sections/reorder', { method: 'PATCH', body: JSON.stringify({ keys: copy }) });
    setMsg('تم تحديث الترتيب');
    reload();
  }

  if (loading) return <div className="empty">جارٍ تحميل الأقسام…</div>;
  if (err || !data) return <div className="empty crit">{err || 'تعذر التحميل'}</div>;

  return (
    <>
      <div className="page-h">
        <div>
          <div className="crumbs">المنصة / الأقسام</div>
          <h2>أقسام المنصة</h2>
        </div>
        <button className="btn secondary" onClick={() => navigate('/navigation')}>معاينة التنقل</button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, lineHeight: 1.8 }}>
          من هنا تُدار أسماء الأقسام وظهورها وترتيبها. اسم القسم يفتح صفحة القسم، والسهم يفتح الفروع.
          القسم بلا صفحة عامة يبقى في البنية ولا يُفعَّل للزائر. المسارات المقفلة لا تتغير.
        </p>
        {data.note && <p style={{ color: 'var(--muted)', margin: '8px 0 0' }}>{data.note}</p>}
      </div>
      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card stat"><span>كل الأقسام</span><b>{sections.length}</b></div>
        <div className="card stat"><span>ظاهرة للزائر</span><b>{visible.length}</b></div>
        <div className="card stat"><span>مخفية / غير جاهزة</span><b>{sections.length - visible.length}</b></div>
      </div>
      {msg && <div className="toast">{msg}</div>}
      {sections.map((section) => {
        const expanded = open === section.key;
        return (
          <div className="card" key={section.key} style={{ marginBottom: 12 }}>
            <div className="check" style={{ border: 0 }}>
              <div>
                <strong>{section.name}</strong>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                  <code>{section.path}</code>
                  {section.lockedPath ? ' · مسار مقفل' : ''}
                  {section.featureFlag ? ` · ${section.featureFlag}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${section.enabled && section.hasPublicPage ? 'b-published' : 'b-draft'}`}>
                  {section.enabled && section.hasPublicPage ? 'ظاهر عند الجاهزية' : section.hasPublicPage ? 'مخفي' : 'بلا صفحة عامة'}
                </span>
                <button className="btn secondary" onClick={() => setOpen(expanded ? null : section.key)}>
                  {expanded ? 'إغلاق' : 'تحرير'}
                </button>
                {writable && (
                  <>
                    <button className="btn secondary" onClick={() => move(section.key, -1)}>أعلى</button>
                    <button className="btn secondary" onClick={() => move(section.key, 1)}>أسفل</button>
                  </>
                )}
              </div>
            </div>
            {expanded && (
              <SectionEditor
                section={section}
                writable={writable}
                onSave={(patch) => save(section.key, patch)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

function SectionEditor({
  section,
  writable,
  onSave,
}: {
  section: Section;
  writable: boolean;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState(section.name);
  const [description, setDescription] = useState(section.description);
  const [seoTitle, setSeoTitle] = useState(section.seoTitle);
  const [seoDescription, setSeoDescription] = useState(section.seoDescription);
  const [enabled, setEnabled] = useState(section.enabled);
  const [showInNav, setShowInNav] = useState(section.showInNav);
  const [showInHome, setShowInHome] = useState(section.showInHome);
  const [showInFooter, setShowInFooter] = useState(section.showInFooter);
  const [showInMobile, setShowInMobile] = useState(section.showInMobile);
  const [featured, setFeatured] = useState(section.featured);
  const [children, setChildren] = useState(section.children);

  return (
    <div style={{ marginTop: 12 }}>
      <div className="grid grid-2">
        <div className="field"><label>الاسم</label><input value={name} disabled={!writable} onChange={(e) => setName(e.target.value)} /></div>
        <div className="field"><label>عنوان SEO</label><input value={seoTitle} disabled={!writable} onChange={(e) => setSeoTitle(e.target.value)} /></div>
      </div>
      <div className="field"><label>الوصف</label><textarea rows={3} value={description} disabled={!writable} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="field"><label>وصف SEO</label><textarea rows={2} value={seoDescription} disabled={!writable} onChange={(e) => setSeoDescription(e.target.value)} /></div>
      <div className="grid grid-2">
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={enabled} disabled={!writable || !section.hasPublicPage} onChange={(e) => setEnabled(e.target.checked)} />
          تفعيل القسم للجمهور
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showInNav} disabled={!writable} onChange={(e) => setShowInNav(e.target.checked)} />
          القائمة الرئيسية
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showInHome} disabled={!writable} onChange={(e) => setShowInHome(e.target.checked)} />
          الصفحة الرئيسية
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showInFooter} disabled={!writable} onChange={(e) => setShowInFooter(e.target.checked)} />
          التذييل
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showInMobile} disabled={!writable} onChange={(e) => setShowInMobile(e.target.checked)} />
          قائمة الجوال
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={featured} disabled={!writable} onChange={(e) => setFeatured(e.target.checked)} />
          مميّز
        </label>
      </div>
      {!section.hasPublicPage && (
        <p className="warn">لا يمكن تفعيل هذا القسم للزائر قبل وجود صفحة عامة جاهزة.</p>
      )}
      {children.length > 0 && (
        <div className="card" style={{ boxShadow: 'none', marginTop: 8 }}>
          <h3>الفروع</h3>
          {children.map((child, index) => (
            <div className="check" key={child.key}>
              <div>
                <strong>{child.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}><code>{child.path}</code></div>
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={child.enabled}
                  disabled={!writable}
                  onChange={(e) => setChildren(children.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item))}
                />
                ظاهر
              </label>
            </div>
          ))}
        </div>
      )}
      {writable && (
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={() => onSave({
            name,
            description,
            seoTitle,
            seoDescription,
            enabled,
            showInNav,
            showInHome,
            showInFooter,
            showInMobile,
            featured,
            children: children.map((child) => ({ key: child.key, name: child.name, enabled: child.enabled, sort: child.sort })),
          })}
        >
          حفظ القسم
        </button>
      )}
    </div>
  );
}

export function NavigationView({ user }: { user: SessionUser }) {
  const [data, setData] = useState<{ items: SectionPreview[] } | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const writable = can(user, 'settings.write');

  useEffect(() => {
    api<{ items: SectionPreview[] }>('/api/v1/admin/navigation')
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) return <div className="empty crit">{err}</div>;
  if (!data) return <div className="empty">جارٍ التحميل…</div>;

  const visible = data.items.filter((item) => item.visibleToUsers);

  async function toggle(key: string, showInNav: boolean) {
    const next = await api<{ items: SectionPreview[] }>('/api/v1/admin/navigation', {
      method: 'PATCH',
      body: JSON.stringify({ items: [{ key, showInNav }] }),
    });
    setData(next);
    setMsg('حُفظ ظهور القائمة. يظهر للزائر بعد البناء التالي.');
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="crumbs">المنصة / التنقل</div>
          <h2>التنقل العام</h2>
        </div>
        <button className="btn secondary" onClick={() => navigate('/sections')}>إدارة الأقسام</button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, lineHeight: 1.8 }}>
          الضغط على اسم القسم يفتح صفحة القسم. الضغط على السهم يفتح الفروع فقط.
          الأقسام غير الجاهزة لا تظهر للزائر.
        </p>
      </div>
      {msg && <div className="toast">{msg}</div>}
      <div className="grid grid-2">
        <div className="card">
          <h3>كما يراها الزائر</h3>
          {!visible.length && <p className="empty">لا توجد أقسام ظاهرة</p>}
          {visible.map((item) => (
            <div key={item.key} style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
              <strong>{item.name}</strong>
              {item.children.filter((child) => child.enabled).length > 0 && (
                <ul>
                  {item.children.filter((child) => child.enabled).map((child) => (
                    <li key={child.key}>{child.name}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="card">
          <h3>التحكم بالظهور</h3>
          {data.items.map((item) => (
            <div className="check" key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {item.hasPublicPage ? item.path : 'بلا صفحة عامة'}
                </div>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={item.showInNav}
                  disabled={!writable || !item.hasPublicPage}
                  onChange={(e) => toggle(item.key, e.target.checked)}
                />
                {' '}قائمة
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

type SectionPreview = {
  key: string;
  name: string;
  path: string;
  showInNav: boolean;
  hasPublicPage: boolean;
  visibleToUsers: boolean;
  children: { key: string; name: string; enabled: boolean }[];
};
