import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Database,
  FileImage,
  FileText,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useSeo } from '../lib/seo';
import { getSupabaseBrowserClient, supabaseConfigured } from '../lib/supabase';
import type { CmsContentItem, CmsContentStatus, CmsContentType, CmsSource } from '../lib/cms';

const EMPTY_ITEM: CmsContentItem = {
  id: '',
  type: 'article',
  status: 'draft',
  locale: 'ar',
  canonical_path: '/articles/',
  slug: '',
  title: '',
  seo_title: '',
  description: '',
  body_markdown: '',
  keywords: [],
  sources: [],
  cover_image_url: '',
  cover_image_alt: '',
  author_name: 'فريق تحرير الشفرة',
  reviewer_name: '',
  indexable: false,
  published_at: null,
  scheduled_for: null,
  reviewed_at: null,
  updated_at: new Date().toISOString(),
  metadata: {},
};

const TYPE_LABELS: Record<CmsContentType, string> = {
  article: 'مقال',
  fault_code: 'كود عطل',
  maintenance_guide: 'دليل صيانة',
  tool_guide: 'دليل أداة',
  landing_page: 'صفحة قسم',
};

interface CmsRevision {
  id: number;
  revision_number: number;
  snapshot: CmsContentItem;
  change_note?: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<CmsContentStatus, string> = {
  draft: 'مسودة',
  review: 'بانتظار المراجعة',
  published: 'منشور',
  archived: 'مؤرشف',
};

function datetimeLocalValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function normalizePath(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, '-').replace(/\/{2,}/g, '/');
  if (!cleaned) return '/';
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

function parseSources(value: string): CmsSource[] {
  if (!value.trim()) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('المصادر يجب أن تكون مصفوفة JSON.');
  return parsed.map((source) => {
    if (!source || typeof source !== 'object') throw new Error('صيغة أحد المصادر غير صحيحة.');
    const candidate = source as Record<string, unknown>;
    if (typeof candidate.label !== 'string' || typeof candidate.url !== 'string') {
      throw new Error('كل مصدر يحتاج label وurl.');
    }
    return {
      label: candidate.label,
      url: candidate.url,
      sourceType: typeof candidate.sourceType === 'string' ? candidate.sourceType : undefined,
      pageReference: typeof candidate.pageReference === 'string' ? candidate.pageReference : undefined,
    };
  });
}

export default function AdminPage() {
  useSeo({
    title: 'لوحة تحرير الشفرة',
    description: 'لوحة خاصة لإدارة محتوى موقع الشفرة.',
    canonical: 'https://alshafra.com/admin',
    robots: 'noindex, nofollow, noarchive',
  });

  const configured = supabaseConfigured();
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(configured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<CmsContentItem[]>([]);
  const [selected, setSelected] = useState<CmsContentItem | null>(null);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [sourcesText, setSourcesText] = useState('[]');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaLicense, setMediaLicense] = useState('');
  const [mediaAttribution, setMediaAttribution] = useState('');

  useEffect(() => {
    if (!client) {
      setAuthLoading(false);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [client]);

  const loadItems = useCallback(async () => {
    if (!client || !session) return;
    setLoading(true);
    setNotice(null);
    const { data, error } = await client
      .from('content_items')
      .select('*')
      .order('updated_at', { ascending: false });
    setLoading(false);
    if (error) {
      setNotice({ type: 'error', text: error.message });
      return;
    }
    setItems((data || []) as CmsContentItem[]);
  }, [client, session]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.title} ${item.canonical_path} ${item.type} ${item.status}`.toLowerCase().includes(needle),
    );
  }, [items, query]);

  const stats = useMemo(() => ({
    all: items.length,
    draft: items.filter((item) => item.status === 'draft').length,
    review: items.filter((item) => item.status === 'review').length,
    published: items.filter((item) => item.status === 'published').length,
  }), [items]);

  const loadRevisions = async (contentId: string) => {
    if (!client || !session) return;
    const { data, error } = await client
      .from('content_revisions')
      .select('id,revision_number,snapshot,change_note,created_at')
      .eq('content_id', contentId)
      .order('revision_number', { ascending: false })
      .limit(20);
    if (error) {
      setNotice({ type: 'error', text: `تعذر تحميل سجل المراجعات: ${error.message}` });
      return;
    }
    setRevisions((data || []) as CmsRevision[]);
  };

  const openEditor = (item: CmsContentItem) => {
    const clone = { ...item, keywords: item.keywords || [], sources: item.sources || [], metadata: item.metadata || {} };
    setSelected(clone);
    setSourcesText(JSON.stringify(clone.sources, null, 2));
    setMediaUrl(clone.cover_image_url || '');
    setMediaLicense(typeof clone.metadata?.cover_media_license === 'string' ? clone.metadata.cover_media_license : '');
    setMediaAttribution(typeof clone.metadata?.cover_media_attribution === 'string' ? clone.metadata.cover_media_attribution : '');
    setRevisions([]);
    setNotice(null);
    void loadRevisions(clone.id);
  };

  const createItem = () => {
    openEditor({ ...EMPTY_ITEM, id: crypto.randomUUID(), updated_at: new Date().toISOString() });
  };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setLoading(true);
    setNotice(null);
    const { error } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setNotice({ type: 'error', text: 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور والصلاحية.' });
  };

  const saveItem = async () => {
    if (!client || !selected) return;
    setLoading(true);
    setNotice(null);
    try {
      const path = normalizePath(selected.canonical_path);
      if (path === '/' || path === '/admin' || path.startsWith('/admin/')) {
        throw new Error('هذا المسار محجوز ولا يمكن استخدامه للمحتوى.');
      }
      if (selected.title.trim().length < 10) throw new Error('العنوان قصير جداً.');
      if (selected.description.trim().length < 50) throw new Error('الوصف يحتاج إلى 50 حرفاً على الأقل.');
      if (selected.body_markdown.trim().length < 100) throw new Error('المحتوى يحتاج إلى 100 حرف مفيد على الأقل قبل الحفظ.');
      const sources = parseSources(sourcesText);
      if (selected.status === 'published' && sources.length === 0) {
        throw new Error('لا يمكن نشر محتوى بلا مصدر واحد على الأقل.');
      }
      if (selected.status === 'published' && !selected.reviewer_name?.trim()) {
        throw new Error('اكتب اسم المراجع قبل النشر.');
      }
      if (mediaUrl && !selected.cover_image_alt?.trim()) {
        throw new Error('أضف وصفاً بديلاً للصورة قبل الحفظ.');
      }
      const now = new Date().toISOString();
      const scheduledPublication = selected.scheduled_for && new Date(selected.scheduled_for) > new Date()
        ? new Date(selected.scheduled_for).toISOString()
        : null;
      const payload: CmsContentItem = {
        ...selected,
        canonical_path: path,
        slug: selected.slug.trim() || path.split('/').filter(Boolean).pop() || '',
        sources,
        cover_image_url: mediaUrl || null,
        indexable: selected.status === 'published' ? selected.indexable : false,
        published_at: selected.status === 'published' ? scheduledPublication || selected.published_at || now : selected.published_at,
        scheduled_for: scheduledPublication || selected.scheduled_for,
        reviewed_at: selected.status === 'published' ? selected.reviewed_at || now : selected.reviewed_at,
        updated_at: now,
        metadata: {
          ...(selected.metadata || {}),
          ...(mediaLicense ? { cover_media_license: mediaLicense } : {}),
          ...(mediaAttribution ? { cover_media_attribution: mediaAttribution } : {}),
        },
      };
      const { data, error } = await client.from('content_items').upsert(payload).select().single();
      if (error) throw error;
      const saved = data as CmsContentItem;
      setSelected(saved);
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      await loadRevisions(saved.id);
      setNotice({
        type: 'success',
        text: saved.status === 'published'
          ? scheduledPublication
            ? `حُفظ وجدولت إتاحته بعد ${new Date(scheduledPublication).toLocaleString('ar')}. يلزم أن يعمل بناء نشر مراجع بعد الموعد.`
            : 'حُفظ المحتوى. سيظهر في النسخة العامة بعد تشغيل بناء النشر المتصل بقاعدة البيانات.'
          : 'حُفظت المسودة بنجاح.',
      });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'تعذر حفظ المحتوى.' });
    } finally {
      setLoading(false);
    }
  };

  const restoreRevision = (revision: CmsRevision) => {
    if (!selected || !window.confirm(`استعادة محتوى المراجعة رقم ${revision.revision_number} كمسودة غير مفهرسة؟`)) return;
    const restored: CmsContentItem = {
      ...revision.snapshot,
      id: selected.id,
      status: 'draft',
      indexable: false,
      published_at: selected.published_at,
      scheduled_for: null,
      updated_at: new Date().toISOString(),
    };
    setSelected(restored);
    setSourcesText(JSON.stringify(restored.sources || [], null, 2));
    setMediaUrl(restored.cover_image_url || '');
    setMediaLicense(typeof restored.metadata?.cover_media_license === 'string' ? restored.metadata.cover_media_license : '');
    setMediaAttribution(typeof restored.metadata?.cover_media_attribution === 'string' ? restored.metadata.cover_media_attribution : '');
    setNotice({ type: 'success', text: 'حُمّلت المراجعة داخل المحرر كمسودة. راجعها ثم اضغط حفظ لإنشاء مراجعة جديدة.' });
  };

  const archiveItem = async () => {
    if (!client || !selected || !window.confirm('هل تريد أرشفة هذا المحتوى وإيقاف فهرسته؟')) return;
    setLoading(true);
    const { error } = await client
      .from('content_items')
      .update({ status: 'archived', indexable: false, updated_at: new Date().toISOString() })
      .eq('id', selected.id);
    setLoading(false);
    if (error) {
      setNotice({ type: 'error', text: error.message });
      return;
    }
    setSelected(null);
    await loadItems();
  };

  const uploadMedia = async (file: File) => {
    if (!client) return;
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']);
    if (!allowedTypes.has(file.type)) {
      setNotice({ type: 'error', text: 'المسموح JPEG أو PNG أو WebP أو GIF أو AVIF أو PDF فقط.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'حجم الملف يتجاوز 8 ميجابايت.' });
      return;
    }
    if (file.type.startsWith('image/') && (!selected?.cover_image_alt?.trim() || !mediaLicense.trim())) {
      setNotice({ type: 'error', text: 'أضف وصف الصورة واسم ترخيصها أو ملكيتها قبل الرفع.' });
      return;
    }
    let imageDimensions: { width: number; height: number } | null = null;
    if (file.type.startsWith('image/')) {
      try {
        const bitmap = await createImageBitmap(file);
        imageDimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
      } catch {
        setNotice({ type: 'error', text: 'تعذر قراءة أبعاد الصورة أو أن الملف تالف.' });
        return;
      }
      if (imageDimensions.width < 1200) {
        setNotice({ type: 'error', text: 'صورة الغلاف تحتاج عرض 1200 بكسل على الأقل لتناسب نتائج البحث وDiscover.' });
        return;
      }
    }
    setLoading(true);
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await client.storage.from('media').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      setLoading(false);
      setNotice({ type: 'error', text: error.message });
      return;
    }
    const { data } = client.storage.from('media').getPublicUrl(path);
    const { error: metadataError } = await client.from('media_assets').insert({
      storage_path: path,
      public_url: data.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      original_name: file.name,
      width: imageDimensions?.width || null,
      height: imageDimensions?.height || null,
      alt_text: selected?.cover_image_alt || '',
      license_name: file.type === 'application/pdf' ? null : mediaLicense,
      attribution: mediaAttribution || null,
    });
    if (metadataError) {
      await client.storage.from('media').remove([path]);
      setLoading(false);
      setNotice({ type: 'error', text: `أُلغي الرفع لأن حفظ بيانات الحقوق فشل: ${metadataError.message}` });
      return;
    }
    if (file.type.startsWith('image/')) setMediaUrl(data.publicUrl);
    setLoading(false);
    setNotice({
      type: 'success',
      text: file.type === 'application/pdf'
        ? `رُفع ملف PDF إلى المكتبة: ${data.publicUrl}`
        : 'رُفعت الصورة وحُفظ وصفها وترخيصها في مكتبة الوسائط.',
    });
  };

  if (!configured) return <AdminSetup />;

  if (authLoading) {
    return <div className="container-page py-20 text-center text-brand-700">جارٍ التحقق من الجلسة…</div>;
  }

  if (!session) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-md p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">دخول لوحة التحرير</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-700/75">لا يوجد تسجيل عام. الدخول متاح للحسابات التي يمنحها المالك صلاحية داخل قاعدة البيانات.</p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-brand-900">
              البريد الإلكتروني
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 outline-none focus:border-brand-500" />
            </label>
            <label className="block text-sm font-semibold text-brand-900">
              كلمة المرور
              <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 outline-none focus:border-brand-500" />
            </label>
            {notice && <Notice notice={notice} />}
            <button type="submit" disabled={loading} className="btn-primary w-full"><LogIn className="h-4 w-4" />{loading ? 'جارٍ الدخول…' : 'دخول'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8">
      <div className="container-page">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Database className="h-4 w-4" />قاعدة المحتوى</div>
            <h1 className="mt-1 font-display text-3xl font-bold text-brand-900">لوحة تحرير الشفرة</h1>
            <p className="mt-1 text-sm text-brand-700/70">إدارة المقالات وأكواد الأعطال والمصادر والملفات من مكان واحد.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void loadItems()} className="btn-ghost"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تحديث</button>
            <button onClick={createItem} className="btn-primary"><Plus className="h-4 w-4" />محتوى جديد</button>
            <button onClick={() => void client?.auth.signOut()} className="btn-ghost"><LogOut className="h-4 w-4" />خروج</button>
          </div>
        </header>

        {notice && <div className="mt-5"><Notice notice={notice} /></div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <StatCard label="كل المحتوى" value={stats.all} icon={FileText} />
          <StatCard label="مسودات" value={stats.draft} icon={BookOpen} />
          <StatCard label="بانتظار المراجعة" value={stats.review} icon={RefreshCw} />
          <StatCard label="منشور" value={stats.published} icon={CheckCircle2} />
        </section>

        <section className="card mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-900/5 p-4">
            <h2 className="font-display text-lg font-bold text-brand-900">المحتوى</h2>
            <label className="relative block w-full max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-brand-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالعنوان أو المسار…" className="w-full rounded-xl border border-brand-200 py-2 pr-9 pl-3 text-sm outline-none focus:border-brand-500" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-brand-50/60 text-brand-700"><tr><th className="p-3">العنوان</th><th className="p-3">النوع</th><th className="p-3">الحالة</th><th className="p-3">المسار</th><th className="p-3">آخر تحديث</th></tr></thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} onClick={() => openEditor(item)} className="cursor-pointer border-t border-brand-900/5 hover:bg-brand-50/50">
                    <td className="p-3 font-semibold text-brand-900">{item.title}</td>
                    <td className="p-3">{TYPE_LABELS[item.type]}</td>
                    <td className="p-3"><StatusChip status={item.status} /></td>
                    <td className="p-3 font-mono text-xs text-brand-600" dir="ltr">{item.canonical_path}</td>
                    <td className="p-3 text-brand-600/75">{new Date(item.updated_at).toLocaleDateString('ar')}</td>
                  </tr>
                ))}
                {!filteredItems.length && <tr><td colSpan={5} className="p-10 text-center text-brand-600/70">لا يوجد محتوى بعد. أنشئ أول مسودة من الزر أعلاه.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selected && (
        <ContentEditor
          item={selected}
          setItem={setSelected}
          sourcesText={sourcesText}
          setSourcesText={setSourcesText}
          mediaUrl={mediaUrl}
          setMediaUrl={setMediaUrl}
          mediaLicense={mediaLicense}
          setMediaLicense={setMediaLicense}
          mediaAttribution={mediaAttribution}
          setMediaAttribution={setMediaAttribution}
          loading={loading}
          revisions={revisions}
          onRestoreRevision={restoreRevision}
          onClose={() => setSelected(null)}
          onSave={() => void saveItem()}
          onArchive={() => void archiveItem()}
          onUpload={(file) => void uploadMedia(file)}
        />
      )}
    </div>
  );
}

function AdminSetup() {
  return (
    <div className="container-page py-14">
      <div className="card mx-auto max-w-3xl p-7 sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700"><Settings className="h-6 w-6" /></div>
        <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">لوحة التحكم جاهزة للربط</h1>
        <p className="mt-3 leading-relaxed text-brand-700/80">لم تُضبط بيانات مشروع Supabase في بيئة النشر بعد. الكود ومخطط قاعدة البيانات ولوحة التحرير موجودة، ولن تُعرض أي بيانات أو نموذج دخول قبل إكمال الربط الآمن.</p>
        <ol className="mt-6 list-decimal space-y-3 pr-6 text-sm leading-relaxed text-brand-800">
          <li>أنشئ مشروع Supabase مجانيًا وشغّل ملف <code className="rounded bg-brand-50 px-1.5 py-0.5">supabase/migrations/202608180001_content_platform.sql</code>.</li>
          <li>أضف <code>VITE_SUPABASE_URL</code> و<code>VITE_SUPABASE_ANON_KEY</code> إلى متغيرات بيئة الاستضافة، ولا تضف Service Role إلى المتصفح.</li>
          <li>أنشئ مستخدم الإدارة من Supabase Auth ثم غيّر دوره إلى <code>admin</code> في جدول <code>profiles</code>.</li>
          <li>أعد البناء؛ ستظهر شاشة تسجيل الدخول بدل هذه الرسالة.</li>
        </ol>
        <p className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm leading-relaxed text-gold-900">تعمدنا عدم توفير تسجيل عام أو كلمة مرور افتراضية. راجع ملف <strong>docs/CMS_SETUP.md</strong> قبل توصيل قاعدة الإنتاج.</p>
      </div>
    </div>
  );
}

interface ContentEditorProps {
  item: CmsContentItem;
  setItem: (item: CmsContentItem) => void;
  sourcesText: string;
  setSourcesText: (value: string) => void;
  mediaUrl: string;
  setMediaUrl: (value: string) => void;
  mediaLicense: string;
  setMediaLicense: (value: string) => void;
  mediaAttribution: string;
  setMediaAttribution: (value: string) => void;
  loading: boolean;
  revisions: CmsRevision[];
  onRestoreRevision: (revision: CmsRevision) => void;
  onClose: () => void;
  onSave: () => void;
  onArchive: () => void;
  onUpload: (file: File) => void;
}

function ContentEditor(props: ContentEditorProps) {
  const { item, setItem } = props;
  const update = <K extends keyof CmsContentItem>(key: K, value: CmsContentItem[K]) => setItem({ ...item, [key]: value });
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-950/45 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-900/10 bg-white/95 px-5 py-4 backdrop-blur">
          <div><div className="text-xs font-semibold text-brand-500">{TYPE_LABELS[item.type]}</div><h2 className="font-display text-xl font-bold text-brand-900">{item.title || 'محتوى جديد'}</h2></div>
          <button onClick={props.onClose} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-brand-50" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </header>
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px] lg:p-7">
          <div className="space-y-5">
            <Field label="العنوان"><input value={item.title} onChange={(event) => update('title', event.target.value)} className="field-input" /></Field>
            <Field label="عنوان SEO"><input value={item.seo_title || ''} onChange={(event) => update('seo_title', event.target.value)} className="field-input" /></Field>
            <Field label="الوصف"><textarea value={item.description} onChange={(event) => update('description', event.target.value)} rows={3} className="field-input" /></Field>
            <Field label="المحتوى" hint="يدعم ## للعناوين، ### للعناوين الفرعية، و- للقوائم. لا يُسمح بـHTML الخام."><textarea value={item.body_markdown} onChange={(event) => update('body_markdown', event.target.value)} rows={20} dir="rtl" className="field-input font-sans leading-loose" /></Field>
            <Field label="المصادر بصيغة JSON" hint={'مثال: [{"label":"دعم الشركة","url":"https://...","sourceType":"manufacturer-support"}]'}><textarea value={props.sourcesText} onChange={(event) => props.setSourcesText(event.target.value)} rows={8} dir="ltr" className="field-input font-mono text-xs" /></Field>
          </div>
          <aside className="space-y-5">
            <Field label="النوع"><select value={item.type} onChange={(event) => update('type', event.target.value as CmsContentType)} className="field-input">{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="الحالة"><select value={item.status} onChange={(event) => update('status', event.target.value as CmsContentStatus)} className="field-input">{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="موعد الإتاحة (اختياري)" hint="يجب تشغيل بناء نشر مراجع بعد الموعد."><input type="datetime-local" value={datetimeLocalValue(item.scheduled_for)} onChange={(event) => update('scheduled_for', event.target.value ? new Date(event.target.value).toISOString() : null)} className="field-input" /></Field>
            <Field label="المسار"><input value={item.canonical_path} onChange={(event) => update('canonical_path', event.target.value)} dir="ltr" className="field-input font-mono text-xs" /></Field>
            <Field label="اللغة"><select value={item.locale} onChange={(event) => update('locale', event.target.value)} className="field-input"><option value="ar">العربية</option><option value="en">English</option></select></Field>
            <Field label="الكلمات المساعدة" hint="افصل بفاصلة"><input value={(item.keywords || []).join(', ')} onChange={(event) => update('keywords', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} className="field-input" /></Field>
            <Field label="المؤلف"><input value={item.author_name || ''} onChange={(event) => update('author_name', event.target.value)} className="field-input" /></Field>
            <Field label="المراجع"><input value={item.reviewer_name || ''} onChange={(event) => update('reviewer_name', event.target.value)} className="field-input" /></Field>
            <div className="rounded-2xl border border-brand-100 p-4">
              <div className="flex items-center gap-2 font-semibold text-brand-900"><FileImage className="h-4 w-4" />الصورة أو الملف</div>
              {props.mediaUrl && <input value={props.mediaUrl} onChange={(event) => props.setMediaUrl(event.target.value)} dir="ltr" className="field-input mt-3 font-mono text-xs" />}
              <input value={item.cover_image_alt || ''} onChange={(event) => update('cover_image_alt', event.target.value)} placeholder="وصف الصورة وموضوعها" className="field-input mt-3" />
              <input value={props.mediaLicense} onChange={(event) => props.setMediaLicense(event.target.value)} placeholder="الترخيص أو: ملكية الشفرة" className="field-input mt-3" />
              <input value={props.mediaAttribution} onChange={(event) => props.setMediaAttribution(event.target.value)} placeholder="نَسب الصورة للمصور/الجهة (إن لزم)" className="field-input mt-3" />
              <label className="btn-ghost mt-3 w-full cursor-pointer"><Upload className="h-4 w-4" />رفع صورة أو PDF<input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onUpload(file); }} /></label>
            </div>
            <details className="rounded-2xl border border-brand-100 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-brand-900">سجل المراجعات ({props.revisions.length})</summary>
              <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                {props.revisions.map((revision) => (
                  <button key={revision.id} type="button" onClick={() => props.onRestoreRevision(revision)} className="w-full rounded-xl bg-brand-50 p-3 text-right text-xs hover:bg-brand-100">
                    <strong className="block text-brand-900">مراجعة {revision.revision_number}</strong>
                    <span className="text-brand-600/75">{new Date(revision.created_at).toLocaleString('ar')}</span>
                  </button>
                ))}
                {!props.revisions.length && <p className="text-xs leading-relaxed text-brand-500">يُنشأ سجل قبل كل تعديل بعد الحفظ الأول.</p>}
              </div>
            </details>
            <label className="flex items-start gap-3 rounded-2xl border border-brand-100 p-4 text-sm"><input type="checkbox" checked={item.indexable} disabled={item.status !== 'published'} onChange={(event) => update('indexable', event.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" /><span><strong className="block text-brand-900">السماح بالفهرسة</strong><span className="text-xs text-brand-600/75">لا يتاح إلا بعد اختيار «منشور».</span></span></label>
          </aside>
        </div>
        <footer className="sticky bottom-0 flex flex-wrap justify-between gap-3 border-t border-brand-900/10 bg-white/95 px-5 py-4 backdrop-blur">
          <button onClick={props.onArchive} disabled={props.loading} className="btn-ghost text-red-700"><Archive className="h-4 w-4" />أرشفة</button>
          <div className="flex gap-2"><button onClick={props.onClose} className="btn-ghost">إلغاء</button><button onClick={props.onSave} disabled={props.loading} className="btn-primary"><Save className="h-4 w-4" />{props.loading ? 'جارٍ الحفظ…' : 'حفظ'}</button></div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-brand-900">{label}{hint && <span className="mt-1 block text-xs font-normal leading-relaxed text-brand-500">{hint}</span>}<div className="mt-2">{children}</div></label>;
}

function Notice({ notice }: { notice: { type: 'success' | 'error'; text: string } }) {
  return <div className={`rounded-xl border p-3 text-sm ${notice.type === 'success' ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return <div className="card flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span><div><div className="font-display text-2xl font-bold text-brand-900">{value}</div><div className="text-xs text-brand-600/70">{label}</div></div></div>;
}

function StatusChip({ status }: { status: CmsContentStatus }) {
  const styles: Record<CmsContentStatus, string> = { draft: 'bg-slate-100 text-slate-700', review: 'bg-amber-100 text-amber-800', published: 'bg-emerald-100 text-emerald-800', archived: 'bg-red-100 text-red-700' };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}
