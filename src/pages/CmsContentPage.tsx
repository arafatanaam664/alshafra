import { BookOpen, CalendarDays, ExternalLink, ShieldCheck, UserRound } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { parseSafeMarkdown, type CmsContentItem } from '../lib/cms';
import { useSeo } from '../lib/seo';

export default function CmsContentPage({ item }: { item: CmsContentItem }) {
  const blocks = parseSafeMarkdown(item.body_markdown);
  const publishedAt = item.published_at || item.updated_at;
  const modifiedAt = item.reviewed_at || item.updated_at;

  useSeo({
    title: `${item.seo_title || item.title} | الشفرة`,
    description: item.description,
    canonical: `https://alshafra.com${item.canonical_path}`,
    keywords: (item.keywords || []).join(', '),
    image: item.cover_image_url || undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': item.type === 'landing_page' ? 'WebPage' : 'Article',
      headline: item.title,
      description: item.description,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      inLanguage: item.locale,
      author: { '@type': 'Person', name: item.author_name || 'فريق تحرير الشفرة' },
      publisher: { '@type': 'Organization', name: 'الشفرة', url: 'https://alshafra.com/' },
      mainEntityOfPage: `https://alshafra.com${item.canonical_path}`,
      ...(item.cover_image_url ? { image: item.cover_image_url } : {}),
    },
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: item.title }]} />
      <article className="mx-auto mt-6 max-w-4xl">
        <header>
          <div className="flex flex-wrap gap-2 text-xs text-brand-500">
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200"><BookOpen className="h-3.5 w-3.5" />محتوى محرر</span>
            {item.reviewed_at && <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><ShieldCheck className="h-3.5 w-3.5" />مراجَع</span>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">{item.title}</h1>
          <p className="mt-4 text-lg leading-loose text-brand-700/85">{item.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-brand-100 py-4 text-sm text-brand-600/80">
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" />{item.author_name || 'فريق تحرير الشفرة'}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />آخر تحديث: {new Date(modifiedAt).toLocaleDateString('ar')}</span>
          </div>
          {item.cover_image_url && <img src={item.cover_image_url} alt={item.cover_image_alt || item.title} className="mt-7 aspect-[16/9] w-full rounded-3xl object-cover" width="1280" height="720" loading="eager" />}
        </header>

        <div className="mt-9 space-y-5 text-[16px] leading-[2.1] text-brand-800">
          {blocks.map((block, index) => {
            if (block.type === 'heading' && block.level === 2) return <h2 key={index} className="pt-5 font-display text-2xl font-bold text-brand-900">{block.text}</h2>;
            if (block.type === 'heading') return <h3 key={index} className="pt-3 font-display text-xl font-bold text-brand-900">{block.text}</h3>;
            if (block.type === 'list') return <ul key={index} className="list-disc space-y-2 pr-6">{block.items?.map((value) => <li key={value}>{value}</li>)}</ul>;
            return <p key={index}>{block.text}</p>;
          })}
        </div>

        {!!item.sources?.length && (
          <section className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold text-brand-900">المصادر والمراجع</h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-600/80">تُعرض المصادر التي اعتمدها المحرر لتسهيل التحقق والرجوع إلى المرجع الأصلي.</p>
            <ul className="mt-4 space-y-3">
              {item.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900">
                    {source.label}<ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {source.pageReference && <span className="mr-2 text-xs text-brand-500">{source.pageReference}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
