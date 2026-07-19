import { Calendar, Clock, ArrowLeft, FileText } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { articleBySlug, ARTICLES, CATEGORY_LABELS_ARTICLE, type Article } from '../lib/articles';

export default function ArticlePage({ slug }: { slug: string }) {
  const article = articleBySlug(slug);

  useSeo({
    title: article
      ? `${article.title} | تقويم السعودية`
      : 'مقال غير موجود | تقويم السعودية',
    description: article?.description,
    canonical: `https://alshafra.com/articles/${slug}`,
    keywords: article?.keywords.join(', '),
    jsonLd: article
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            datePublished: article.updatedAt,
            dateModified: article.updatedAt,
            inLanguage: 'ar-SA',
            author: { '@type': 'Organization', name: 'تقويم السعودية' },
            publisher: {
              '@type': 'Organization',
              name: 'تقويم السعودية',
              logo: { '@type': 'ImageObject', url: 'https://alshafra.com/favicon.svg' },
            },
          },
          ...(article.faq && article.faq.length > 0
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: article.faq.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
        ]
      : undefined,
  });

  if (!article) {
    return (
      <div className="container-page py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-brand-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">المقال غير موجود</h1>
        <p className="mt-2 text-sm text-brand-700/70">عذراً، المقال الذي تبحث عنه غير متوفر.</p>
        <a href="#/" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </a>
      </div>
    );
  }

  const related = ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'المقالات', path: '/articles' },
          { name: article.title },
        ]}
      />
      <article className="mt-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
            {CATEGORY_LABELS_ARTICLE[article.category]}
          </span>
          <span className="flex items-center gap-1 text-xs text-brand-600/70">
            <Clock className="h-3.5 w-3.5" />
            {article.readMinutes} دقائق قراءة
          </span>
          <span className="flex items-center gap-1 text-xs text-brand-600/70">
            <Calendar className="h-3.5 w-3.5" />
            تحديث {article.updatedAt}
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-brand-700/85">{article.description}</p>

        <div className="mt-8 space-y-6">
          {article.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-bold text-brand-900">{s.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-loose text-brand-800/90">{s.body}</p>
            </section>
          ))}
        </div>

        {article.faq && article.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-900">أسئلة شائعة</h2>
            <div className="mt-4 space-y-3">
              {article.faq.map((f, i) => (
                <div key={i} className="card p-4">
                  <h3 className="font-semibold text-brand-900">{f.q}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-700/85">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold text-brand-900">مقالات ذات صلة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((a) => (
              <a key={a.slug} href={`#/articles/${a.slug}`} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  {CATEGORY_LABELS_ARTICLE[a.category]}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold leading-snug text-brand-900 group-hover:text-brand-700">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-700/70 line-clamp-2">{a.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ArticlesListPage() {
  useSeo({
    title: 'مقالات عن المواعيد والتقويم في السعودية | تقويم السعودية',
    description:
      'مقالات ودلائل شاملة عن مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي والإجازات الرسمية وتحويل التاريخ في المملكة العربية السعودية.',
    canonical: 'https://alshafra.com/articles',
    keywords: 'مقالات, مواعيد الرواتب, التقويم الهجري, الإجازات الرسمية, تحويل التاريخ',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: ARTICLES.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.title,
      })),
    },
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'المقالات' }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="section-title">مقالات ودلائل</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          مقالات ودلائل شاملة عن مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي والإجازات
          الرسمية وتحويل التاريخ في المملكة العربية السعودية.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <a
            key={a.slug}
            href={`#/articles/${a.slug}`}
            className="card group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                {CATEGORY_LABELS_ARTICLE[a.category]}
              </span>
              <span className="flex items-center gap-1 text-xs text-brand-600/70">
                <Clock className="h-3.5 w-3.5" />
                {a.readMinutes} د
              </span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-900 group-hover:text-brand-700">
              {a.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/75 line-clamp-3">{a.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
              اقرأ المزيد
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export type { Article };
