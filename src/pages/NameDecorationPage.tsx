import { useMemo, useState } from 'react';
import { Sparkles, Copy, Check, Type, ArrowLeft, Wand2 } from 'lucide-react';
import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { DECORATION_TOOLS, decorationToolBySlug, type DecorationTool } from '../lib/decoration';

// --- Hub page: /name-decoration ---------------------------------------------

export function NameDecorationHubPage() {
  useSeo({
    title: 'زخرفة الأسماء أونلاين | 5 أدوات زخرفة مجانية | تقويم السعودية',
    description:
      'زخرف اسمك أونلاين مجاناً بأكثر من 75 نمط زخرفة: زخرفة الأسماء عربي، ببجي، بالإنجليزي، فري فاير، وبالفرنسية. أدوات زخرفة سريعة مع نسخ مباشر لكل نمط.',
    canonical: 'https://alshafra.com/name-decoration',
    keywords:
      'زخرفة الأسماء, زخرفة الأسماء عربي, زخرفة الأسماء ببجي, زخرفة الأسماء بالانجليزي, زخرفة الأسماء فري فاير, زخرفة الأسماء بالفرنسية, أدوات زخرفة, زخرفة أسماء أونلاين',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'زخرفة الأسماء',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'ar-SA',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alshafra.com/' },
          { '@type': 'ListItem', position: 2, name: 'زخرفة الأسماء', item: 'https://alshafra.com/name-decoration' },
        ],
      },
    ],
  });

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'زخرفة الأسماء' }]} />

      <header className="mt-4 max-w-2xl">
        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          <Sparkles className="h-3.5 w-3.5" />
          أدوات الزخرفة
        </span>
        <h1 className="mt-3 section-title">زخرفة الأسماء أونلاين</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          مجموعة من 5 أدوات مجانية لزخرفة الأسماء أونلاين — زخرف اسمك بأكثر من 75 نمط زخرفة مختلف
          لكل اللغات والألعاب. اختر الأداة المناسبة لك وابدأ الزخرفة فوراً مع نسخ مباشر لكل نمط.
        </p>
      </header>

      {/* Tools grid */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DECORATION_TOOLS.map((tool) => (
          <a
            key={tool.slug}
            href={`/name-decoration/${tool.slug}`}
            className="card group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <Wand2 className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-brand-900 group-hover:text-brand-700">
              {tool.shortTitle}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-700/75 line-clamp-3">{tool.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
              ابدأ الزخرفة
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </a>
        ))}
      </section>

      {/* SEO content */}
      <section className="mt-12 card p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-brand-900">عن زخرفة الأسماء</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-700/85">
          <p>
            <strong className="text-brand-900">زخرفة الأسماء</strong> هي فن تحويل الاسم العادي إلى شكل
            جذاب ومميز باستخدام رموز يونيكود والحروف المزخرفة. تُستخدم زخرفة الأسماء على نطاق واسع في
            منصات التواصل الاجتماعي والألعاب الإلكترونية لإبراز الشخصية وجذب الانتباه. توفر بوابة
            تقويم السعودية 5 أدوات مجانية لزخرفة الأسماء بأكثر من 75 نمط مختلف.
          </p>
          <p>
            تشمل أدواتنا: <strong>زخرفة الأسماء عربي</strong> لأسمائك بالعربية مع زخرفة الحروف
            العربية الأصيلة والرموز، <strong>زخرفة الأسماء ببجي</strong> لأسماء ببجي موبايل (PUBG
            Mobile) مع أنماط مخصصة للاعبي ببجي، <strong>زخرفة الأسماء بالإنجليزي</strong> للخطوط
            الإنجليزية المزخرفة مثل Script وBold وItalic وDouble وCircle، <strong>زخرفة الأسماء فري
            فاير</strong> لأسماء فري فاير (Free Fire) مع أنماط مخصصة للاعبي فري فاير، و<strong>زخرفة
            الأسماء بالفرنسية</strong> للأسماء الفرنسية بنفس الخطوط والرموز الأنيقة.
          </p>
          <p>
            كل أداة توفر أكثر من 15 نمط زخرفة مختلف، مع زر نسخ مباشر لكل نمط لتسهيل نسخ الاسم المزخرف
            واستخدامه في أي مكان — وسائل التواصل الاجتماعي، الألعاب، الرسائل، أو أي تطبيق آخر. أدواتنا
            مجانية بالكامل ولا تتطلب تسجيل دخول، وتعمل على جميع الأجهزة (الجوال والحاسوب).
          </p>
          <p>
            ابدأ الآن باختيار الأداة المناسبة لك من الأدوات أعلاه، واكتب اسمك للحصول على عشرات النماذج
            المزخرفة الجاهزة للنسخ المباشر. يمكنك تجربة عدة أدوات ومقارنة النتائج لاختيار الزخرفة
            المثالية لاسمك.
          </p>
        </div>
      </section>
    </div>
  );
}

// --- Tool page: /name-decoration/:slug --------------------------------------

export default function NameDecorationToolPage({ slug }: { slug: string }) {
  const tool = decorationToolBySlug(slug);
  const [name, setName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useSeo({
    title: tool
      ? `${tool.title} أونلاين مجاناً | تقويم السعودية`
      : 'أداة زخرفة غير موجودة | تقويم السعودية',
    description: tool?.description,
    canonical: `https://alshafra.com/name-decoration/${slug}`,
    keywords: tool?.keywords.join(', '),
    jsonLd: tool
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tool.title,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            inLanguage: 'ar-SA',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://alshafra.com/' },
              { '@type': 'ListItem', position: 2, name: 'زخرفة الأسماء', item: 'https://alshafra.com/name-decoration' },
              { '@type': 'ListItem', position: 3, name: tool.shortTitle, item: `https://alshafra.com/name-decoration/${slug}` },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tool.about.map((s) => ({
              '@type': 'Question',
              name: s.heading,
              acceptedAnswer: { '@type': 'Answer', text: s.body },
            })),
          },
        ]
      : undefined,
  });

  if (!tool) {
    return (
      <div className="container-page py-20 text-center">
        <Type className="mx-auto h-12 w-12 text-brand-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">الأداة غير موجودة</h1>
        <p className="mt-2 text-sm text-brand-700/70">عذراً، أداة الزخرفة التي تبحث عنها غير متوفرة.</p>
        <a href="/name-decoration" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          العودة لزخرفة الأسماء
        </a>
      </div>
    );
  }

  const results = useMemo(() => {
    if (!name.trim()) return [];
    return tool.styles.map((style) => ({
      id: style.id,
      label: style.label,
      value: style.transform(name.trim()),
    }));
  }, [name, tool]);

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const otherTools = DECORATION_TOOLS.filter((t) => t.slug !== tool.slug);

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { name: 'الرئيسية', path: '/' },
          { name: 'زخرفة الأسماء', path: '/name-decoration' },
          { name: tool.shortTitle },
        ]}
      />

      <header className="mt-4 max-w-2xl">
        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          <Wand2 className="h-3.5 w-3.5" />
          {tool.shortTitle}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-brand-700/85">{tool.intro}</p>
      </header>

      {/* Input + Results */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Input card */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-brand-900">اكتب اسمك</h2>
          <p className="mt-1 text-xs text-brand-600/70">اكتب الاسم الذي تريد زخرفته</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tool.placeholder}
            className="mt-4 w-full rounded-xl bg-sand-50 px-4 py-3 text-base text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
            autoFocus
          />
          {name && (
            <button
              onClick={() => setName('')}
              className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              مسح
            </button>
          )}
          <div className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-700/80">
            <strong className="text-brand-900">{tool.styles.length}</strong> نمط زخرفة متاح — اكتب اسمك
            لعرضها جميعاً.
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!results.length ? (
            <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
              <Sparkles className="h-10 w-10 text-brand-300" />
              <p className="mt-3 text-sm text-brand-700/60">
                اكتب اسمك في الحقل المجاور لعرض {tool.styles.length} نمط زخرفة مختلف.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="card group flex items-center justify-between gap-3 p-4 transition-all hover:shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-brand-600/70">{r.label}</div>
                    <div className="mt-1 truncate font-display text-base font-bold text-brand-900" dir="auto">
                      {r.value}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(r.id, r.value)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                      copiedId === r.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
                    }`}
                    aria-label="نسخ"
                  >
                    {copiedId === r.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* About / SEO content */}
      <section className="mt-10 space-y-4">
        {tool.about.map((s, i) => (
          <div key={i} className="card p-6">
            <h2 className="font-display text-lg font-bold text-brand-900">{s.heading}</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-loose text-brand-800/90">{s.body}</p>
          </div>
        ))}
      </section>

      {/* Cross-links to other tools */}
      <section className="mt-10 card p-6">
        <h2 className="font-display text-lg font-bold text-brand-900">يمكنك أيضاً زخرفة اسمك باستخدام هذه الأدوات:</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {otherTools.map((t) => (
            <a
              key={t.slug}
              href={`/name-decoration/${t.slug}`}
              className="group flex items-center gap-2 rounded-xl bg-sand-50 p-3 ring-1 ring-brand-900/5 transition-all hover:bg-brand-50 hover:ring-brand-200"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white">
                <Wand2 className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-brand-800 group-hover:text-brand-700">{t.shortTitle}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
