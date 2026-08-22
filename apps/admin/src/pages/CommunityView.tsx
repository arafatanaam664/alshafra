import { useEffect, useState } from 'react';
import { api, can, type SessionUser } from '../lib/api';

type Question = { id: string; title: string; path: string; status: string; indexable: boolean };
type Report = { id: string; target_type: string; target_id: string; reason: string; status: string };
type Status = { community: boolean; questions: boolean; comments: boolean; registration: boolean; ugcAutoIndex: boolean };

export function CommunityView({ user }: { user: SessionUser }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function reload() {
    try {
      const [st, qs, rs] = await Promise.all([
        api<Status>('/api/v1/admin/community/status'),
        api<Question[]>('/api/v1/admin/community/questions'),
        api<Report[]>('/api/v1/admin/community/reports'),
      ]);
      setStatus(st);
      setQuestions(qs);
      setReports(rs);
      setErr('');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'load_failed');
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  if (err) return <div className="empty crit">{err}</div>;

  return (
    <>
      <div className="page-h">
        <div>
          <div className="crumbs">المجتمع</div>
          <h2>إشراف المجتمع</h2>
        </div>
      </div>
      {msg && <div className="toast">{msg}</div>}
      <div className="card" style={{ marginBottom: 16 }}>
        <p>
          الأعلام: مجتمع={String(status?.community)} · أسئلة={String(status?.questions)} · تعليقات=
          {String(status?.comments)} · تسجيل={String(status?.registration)} · فهرسة UGC=
          {String(status?.ugcAutoIndex)}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          الواجهة العامة تبقى 404 ما دامت الأعلام متوقفة. لا تفعّل المجتمع قبل Turnstile والإشراف. المفاتيح في{' '}
          <code>docs/phase12_community/01-owner-turnstile.md</code>.
        </p>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>الأسئلة</h3>
          <table className="table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    {q.title}
                    <div>
                      <code>{q.path}</code>
                    </div>
                  </td>
                  <td>{q.status}</td>
                  <td>
                    {can(user, 'moderation.handle') && q.status !== 'hidden' && (
                      <button
                        className="btn danger"
                        type="button"
                        onClick={async () => {
                          await api(`/api/v1/admin/community/questions/${q.id}/hide`, {
                            method: 'POST',
                            body: JSON.stringify({ reason: 'moderation' }),
                          });
                          setMsg('أُخفي السؤال');
                          await reload();
                        }}
                      >
                        إخفاء
                      </button>
                    )}
                    {can(user, 'moderation.handle') && q.status === 'hidden' && (
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={async () => {
                          await api(`/api/v1/admin/community/questions/${q.id}/restore`, { method: 'POST' });
                          setMsg('أُعيد السؤال');
                          await reload();
                        }}
                      >
                        استعادة
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!questions.length && <div className="empty">لا أسئلة بعد</div>}
        </div>
        <div className="card">
          <h3>البلاغات</h3>
          <table className="table">
            <thead>
              <tr>
                <th>السبب</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.reason} · {r.target_type}
                  </td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === 'open' && (
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={async () => {
                          await api(`/api/v1/admin/community/reports/${r.id}/resolve`, {
                            method: 'POST',
                            body: JSON.stringify({ status: 'accepted' }),
                          });
                          setMsg('أُغلق البلاغ');
                          await reload();
                        }}
                      >
                        قبول
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reports.length && <div className="empty">لا بلاغات</div>}
        </div>
      </div>
    </>
  );
}
