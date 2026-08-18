import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Search,
  ShieldAlert,
  Tags,
  Wrench,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import Link from '../components/Link';
import { useSeo } from '../lib/seo';
import {
  FAULT_CODES,
  faultCodeBrands,
  faultCodeByRoute,
  faultCodeDevices,
  faultCodePath,
  faultCodesForBrand,
  faultCodesForDevice,
  type FaultCodeEntry,
} from '../lib/faultCodes';
import { cmsItemByPath } from '../lib/cms';
import CmsContentPage from './CmsContentPage';

interface FaultCodesPageProps {
  device?: string;
  brand?: string;
  code?: string;
  path: string;
}

export default function FaultCodesPage({ device, brand, code, path }: FaultCodesPageProps) {
  if (device && brand && code) {
    const entry = faultCodeByRoute(device, brand, code);
    if (entry) return <FaultCodeDetail entry={entry} />;
    const cmsItem = cmsItemByPath(path);
    if (cmsItem) return <CmsContentPage item={cmsItem} />;
  }
  if (device && brand) return <FaultCodeListing device={device} brand={brand} />;
  if (device) return <FaultCodeListing device={device} />;
  return <FaultCodesHub />;
}

function FaultCodesHub() {
  const [query, setQuery] = useState('');
  const devices = faultCodeDevices();
  const brands = faultCodeBrands();
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return FAULT_CODES;
    return FAULT_CODES.filter((entry) =>
      `${entry.code} ${entry.alternateCodes.join(' ')} ${entry.brandName} ${entry.deviceName} ${entry.title}`
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  useSeo({
    title: 'دليل أكواد الأعطال للأجهزة المنزلية | الشفرة',
    description: 'ابحث عن معنى كود العطل حسب الجهاز والعلامة التجارية، واقرأ الأسباب وخطوات الفحص الآمنة والمصادر الرسمية ومتى تحتاج إلى فني.',
    canonical: 'https://alshafra.com/fault-codes',
    keywords: 'أكواد الأعطال, رموز الأعطال, أعطال الغسالات, أعطال المكيفات, صيانة منزلية',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'دليل أكواد الأعطال',
      description: 'دليل عربي موثق لفهم أكواد أعطال الأجهزة المنزلية.',
      url: 'https://alshafra.com/fault-codes',
      inLanguage: 'ar',
    },
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container-page relative py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="chip bg-white/10 text-brand-50 ring-1 ring-white/15"><Wrench className="h-3.5 w-3.5" />الشفرة إصلاح</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">افهم كود العطل قبل أن تطلب الفني</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-50/80 sm:text-lg">اختر الجهاز والعلامة أو اكتب الرمز الظاهر على الشاشة. نشرح المعنى من المصدر الرسمي، والفحوص الخارجية الآمنة، وإشارات التوقف التي تستلزم فنيًا.</p>
            <label className="relative mt-7 block max-w-2xl">
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: Samsung 4E أو LG OE" className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-base text-brand-900 shadow-xl outline-none placeholder:text-brand-400 focus:ring-2 focus:ring-brand-400" />
            </label>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <TrustCard icon={BookOpen} title="مصادر أولية" text="دعم الشركة أو كتيب الموديل مرجع كل معنى." />
          <TrustCard icon={ShieldAlert} title="السلامة أولاً" text="نفصل الفحص الخارجي عن الإصلاح الذي يحتاج إلى فني." />
          <TrustCard icon={CheckCircle2} title="مراجعة واضحة" text="كل صفحة تحمل نطاق الموديل وتاريخ آخر مراجعة." />
        </div>

        {!query && (
          <>
            <section className="mt-12">
              <h2 className="section-title">تصفح حسب نوع الجهاز</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {devices.map((item) => (
                  <Link key={item.slug} to={`/fault-codes/${item.slug}`} className="card group flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div><h3 className="font-display text-lg font-bold text-brand-900 group-hover:text-brand-700">{item.name}</h3><p className="mt-1 text-xs text-brand-600/70">{item.count} كود موثق</p></div>
                    <ChevronLeft className="h-5 w-5 text-brand-400 transition-transform group-hover:-translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="section-title">العلامات المتاحة</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {brands.map((item) => (
                  <Link key={`${item.deviceSlug}:${item.slug}`} to={`/fault-codes/${item.deviceSlug}/${item.slug}`} className="chip bg-white px-4 py-2 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">{item.name} <span className="text-brand-400">{item.count}</span></Link>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4"><div><h2 className="section-title">{query ? 'نتائج البحث' : 'أحدث الأكواد المراجعة'}</h2><p className="mt-1 text-sm text-brand-600/70">{results.length} نتيجة متاحة</p></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {results.map((entry) => <FaultCodeCard key={faultCodePath(entry)} entry={entry} />)}
            {!results.length && <div className="card p-8 text-center md:col-span-2"><Search className="mx-auto h-9 w-9 text-brand-300" /><h3 className="mt-3 font-bold text-brand-900">لم نجد هذا الرمز بعد</h3><p className="mt-1 text-sm text-brand-600/75">جرّب كتابة الرمز وحده أو اسم العلامة بالإنجليزية. لا ننشر رمزًا قبل التحقق من مصدره.</p></div>}
          </div>
        </section>
      </section>
    </div>
  );
}

function FaultCodeListing({ device, brand }: { device: string; brand?: string }) {
  const entries = brand ? faultCodesForBrand(device, brand) : faultCodesForDevice(device);
  const deviceName = entries[0]?.deviceName || 'الجهاز';
  const brandName = entries[0]?.brandName;
  const title = brandName ? `أكواد أعطال ${deviceName} ${brandName}` : `أكواد أعطال ${deviceName}`;
  const canonical = `https://alshafra.com/fault-codes/${device}${brand ? `/${brand}` : ''}`;
  const brands = faultCodeBrands(device);

  useSeo({
    title: `${title} ومعاني الرموز | الشفرة`,
    description: `تصفح ${title} الموثقة بالمصادر، مع الأسباب المحتملة وخطوات الفحص الآمنة ومتى يحتاج الجهاز إلى فني.`,
    canonical,
    keywords: `${title}, رموز الأعطال, دليل الصيانة`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      url: canonical,
      inLanguage: 'ar',
    },
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[
        { name: 'الرئيسية', path: '/' },
        { name: 'أكواد الأعطال', path: '/fault-codes' },
        { name: deviceName, path: brand ? `/fault-codes/${device}` : undefined },
        ...(brandName ? [{ name: brandName }] : []),
      ]} />
      <header className="mt-5 max-w-3xl"><span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200"><Tags className="h-3.5 w-3.5" />دليل موثق</span><h1 className="mt-3 section-title">{title}</h1><p className="mt-3 leading-relaxed text-brand-700/80">اختر الرمز الظاهر على جهازك، ثم طابق نطاق الموديل قبل تطبيق أي فحص. لا تفترض أن الرمز نفسه يحمل المعنى ذاته في كل سلسلة.</p></header>
      {!brand && <div className="mt-6 flex flex-wrap gap-2">{brands.map((item) => <Link key={item.slug} to={`/fault-codes/${device}/${item.slug}`} className="chip bg-white px-4 py-2 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">{item.name} <span className="text-brand-400">{item.count}</span></Link>)}</div>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">{entries.map((entry) => <FaultCodeCard key={faultCodePath(entry)} entry={entry} />)}</div>
      {!entries.length && <div className="card mt-8 p-8 text-center"><AlertTriangle className="mx-auto h-9 w-9 text-gold-500" /><h2 className="mt-3 font-bold text-brand-900">هذا القسم قيد المراجعة</h2><p className="mt-1 text-sm text-brand-600/75">لا توجد صفحات منشورة لهذا التصنيف حتى الآن.</p></div>}
    </div>
  );
}

function FaultCodeDetail({ entry }: { entry: FaultCodeEntry }) {
  const path = faultCodePath(entry);
  useSeo({
    title: `${entry.seoTitle} | الشفرة`,
    description: entry.description,
    canonical: `https://alshafra.com${path}`,
    keywords: `${entry.code}, ${entry.brandName}, ${entry.deviceName}, كود عطل, حل آمن`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: entry.title,
      description: entry.description,
      datePublished: entry.publishedAt,
      dateModified: entry.reviewedAt,
      inLanguage: 'ar',
      author: { '@type': 'Organization', name: 'فريق تحرير الشفرة' },
      publisher: { '@type': 'Organization', name: 'الشفرة', url: 'https://alshafra.com/' },
      mainEntityOfPage: `https://alshafra.com${path}`,
    },
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[
        { name: 'الرئيسية', path: '/' },
        { name: 'أكواد الأعطال', path: '/fault-codes' },
        { name: entry.deviceName, path: `/fault-codes/${entry.deviceSlug}` },
        { name: entry.brandName, path: `/fault-codes/${entry.deviceSlug}/${entry.brandSlug}` },
        { name: entry.code },
      ]} />
      <article className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="chip bg-brand-900 text-white">{entry.brandName}</span><span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">{entry.deviceName}</span><span className="text-xs text-brand-500">مراجعة {entry.reviewedAt}</span></div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">{entry.title}</h1>
          <p className="mt-4 text-base leading-loose text-brand-700/85">{entry.description}</p>

          <section className="mt-7 rounded-2xl border border-brand-200 bg-brand-50 p-5"><h2 className="font-display text-lg font-bold text-brand-900">الإجابة المختصرة</h2><p className="mt-2 leading-loose text-brand-800">{entry.shortAnswer}</p></section>
          <section className="mt-5 rounded-2xl border border-gold-200 bg-gold-50 p-5"><div className="flex items-start gap-3"><ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-gold-700" /><div><h2 className="font-display text-lg font-bold text-gold-900">تنبيه سلامة</h2><p className="mt-1 leading-loose text-gold-900/85">{entry.warning}</p></div></div></section>

          <ContentSection title="على أي أجهزة ينطبق؟"><p>{entry.modelScope}</p></ContentSection>
          <ContentSection title="الأسباب المحتملة"><div className="space-y-4">{entry.causes.map((cause, index) => <div key={cause.title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{index + 1}</span><div><h3 className="font-bold text-brand-900">{cause.title}</h3><p className="mt-1 leading-loose text-brand-700/85">{cause.detail}</p></div></div>)}</div></ContentSection>
          <ContentSection title="خطوات الفحص الآمنة"><ol className="space-y-5">{entry.safeChecks.map((check, index) => <li key={check.title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">{index + 1}</span><div><h3 className="font-bold text-brand-900">{check.title}</h3><p className="mt-1 leading-loose text-brand-700/85">{check.detail}</p></div></li>)}</ol></ContentSection>

          <ContentSection title="جدول تشخيص سريع"><div className="overflow-x-auto rounded-2xl border border-brand-100"><table className="w-full min-w-[620px] text-right text-sm"><thead className="bg-brand-50 text-brand-900"><tr><th className="p-3">ما تلاحظه</th><th className="p-3">السبب الأقرب</th><th className="p-3">الإجراء الأول</th></tr></thead><tbody>{entry.diagnosis.map((row) => <tr key={row.observation} className="border-t border-brand-100"><td className="p-3 font-semibold text-brand-900">{row.observation}</td><td className="p-3 text-brand-700">{row.likelyCause}</td><td className="p-3 text-brand-700">{row.firstAction}</td></tr>)}</tbody></table></div></ContentSection>

          <ContentSection title="متى تتوقف وتطلب فنيًا؟"><ul className="space-y-2">{entry.stopConditions.map((condition) => <li key={condition} className="flex items-start gap-2 leading-loose text-brand-800"><AlertTriangle className="mt-1.5 h-4 w-4 shrink-0 text-red-600" />{condition}</li>)}</ul></ContentSection>
          <ContentSection title="أسئلة شائعة"><div className="space-y-3">{entry.faq.map((item) => <details key={item.q} className="card group p-4"><summary className="cursor-pointer font-semibold text-brand-900">{item.q}</summary><p className="mt-2 leading-loose text-brand-700/85">{item.a}</p></details>)}</div></ContentSection>
          <ContentSection title="المصادر الرسمية والتحقق"><p className="mb-3 text-sm leading-loose text-brand-600/80">لخّص فريق التحرير المعلومات ولم ينسخ الكتيبات. يبقى كتيب رقم الموديل والدعم المحلي للشركة المرجع النهائي.</p><ul className="space-y-2">{entry.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900">{source.label}</a></li>)}</ul></ContentSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><div className="card p-5"><div className="text-xs font-semibold text-brand-500">الكود</div><div className="mt-1 font-mono text-3xl font-bold text-brand-900" dir="ltr">{entry.code}</div><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-brand-500">العلامة</dt><dd className="font-semibold text-brand-900">{entry.brandName}</dd></div><div><dt className="text-brand-500">الجهاز</dt><dd className="font-semibold text-brand-900">{entry.deviceName}</dd></div><div><dt className="text-brand-500">آخر مراجعة</dt><dd className="font-semibold text-brand-900">{entry.reviewedAt}</dd></div></dl></div><Link to={`/fault-codes/${entry.deviceSlug}/${entry.brandSlug}`} className="btn-ghost w-full">كل أكواد {entry.brandName}<ArrowLeft className="h-4 w-4" /></Link></aside>
      </article>
    </div>
  );
}

function FaultCodeCard({ entry }: { entry: FaultCodeEntry }) {
  return <Link to={faultCodePath(entry)} className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-soft"><span className="flex min-w-20 items-center justify-center rounded-2xl bg-brand-900 px-3 py-4 font-mono text-lg font-bold text-white" dir="ltr">{entry.code}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-1.5 text-xs text-brand-500"><span>{entry.brandName}</span><span>•</span><span>{entry.deviceName}</span></div><h3 className="mt-1.5 font-display font-bold leading-snug text-brand-900 group-hover:text-brand-700">{entry.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-700/75">{entry.shortAnswer}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">عرض المعنى والخطوات<ChevronLeft className="h-3.5 w-3.5" /></span></div></Link>;
}

function TrustCard({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return <div className="card flex items-start gap-3 p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span><div><h3 className="font-bold text-brand-900">{title}</h3><p className="mt-1 text-sm leading-relaxed text-brand-600/80">{text}</p></div></div>;
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="font-display text-2xl font-bold text-brand-900">{title}</h2><div className="mt-4 text-[15px] leading-loose text-brand-800">{children}</div></section>;
}
