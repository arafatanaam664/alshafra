import { useEffect, useState } from 'react';
import { api, type SessionUser, can } from '../lib/api';

type MediaRow = {
  id: string;
  objectKey: string;
  mime: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  publicUrl: string | null;
};

type Status = {
  driver: string;
  r2Configured: boolean;
  publicBaseConfigured: boolean;
  bucket: string | null;
  label: string;
};

export function MediaView({ user }: { user: SessionUser }) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        api<MediaRow[]>('/api/v1/admin/media'),
        api<Status>('/api/v1/admin/media/status'),
      ]);
      setRows(list);
      setStatus(st);
      setErr('');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onFile(file: File) {
    if (!can(user, 'media.upload')) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      await api('/api/v1/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          base64,
          alt,
          caption,
          credit,
        }),
      });
      setMsg('تم الرفع');
      setAlt('');
      setCaption('');
      setCredit('');
      await reload();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'upload_failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading && !rows.length && !err) return <div className="empty">جارٍ التحميل…</div>;
  if (err) return <div className="empty crit">{err}</div>;

  return (
    <>
      <div className="page-h">
        <div>
          <div className="crumbs">الوسائط</div>
          <h2>مكتبة الوسائط</h2>
        </div>
      </div>
      {msg && <div className="toast">{msg}</div>}
      <div className="card" style={{ marginBottom: 16 }}>
        <p>
          الحالة: <strong>{status?.label}</strong>
          {status?.bucket ? ` · bucket=${status.bucket}` : ''}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          لا تلصق المفاتيح في المحادثة. ضعها في <code>.env.local</code> أو لوحة Vercel قبل الإطلاق.
        </p>
      </div>
      {can(user, 'media.upload') && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>نص بديل</label>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>تعليق</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div className="field">
              <label>المصدر / النسبة</label>
              <input value={credit} onChange={(e) => setCredit(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>ملف JPEG / PNG / WebP / GIF — حد 8MB</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
                e.currentTarget.value = '';
              }}
            />
          </div>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>معاينة</th>
              <th>المفتاح</th>
              <th>المقاس</th>
              <th>alt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <img
                    src={row.publicUrl || `/api/v1/admin/media/${row.id}/file`}
                    alt={row.alt || ''}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                  />
                </td>
                <td>
                  <code>{row.objectKey}</code>
                </td>
                <td>
                  {row.width}×{row.height} · {Math.round(row.byteSize / 1024)}kb
                </td>
                <td>{row.alt || '—'}</td>
                <td>
                  {can(user, 'media.delete') && (
                    <button
                      className="btn danger"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('حذف هذه الوسائط؟')) return;
                        await api(`/api/v1/admin/media/${row.id}`, { method: 'DELETE' });
                        setMsg('حُذفت');
                        await reload();
                      }}
                    >
                      حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">لا توجد وسائط بعد</div>}
      </div>
    </>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}
