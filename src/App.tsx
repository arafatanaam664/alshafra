import { lazy, Suspense, useMemo } from 'react';
import { useRoute, parseRoute } from './lib/router';
import { useSeo } from './lib/seo';
import { cmsItemByPath } from './lib/cms';
import Header from './components/Header';
import Footer from './components/Footer';
import AdSenseScript from './components/AdSenseScript';

const HomePage = lazy(() => import('./pages/HomePage'));
const GlobalPage = lazy(() => import('./pages/GlobalPage'));
const EditorialGuide = lazy(() => import('./components/EditorialGuide'));
const DateConverterPage = lazy(() => import('./pages/DateConverterPage'));
const AgeCalculatorPage = lazy(() => import('./pages/AgeCalculatorPage'));
const SalariesPage = lazy(() => import('./pages/SalariesPage'));
const HijriCalendarPage = lazy(() => import('./pages/HijriCalendarPage'));
const SchoolCalendarPage = lazy(() => import('./pages/SchoolCalendarPage'));
const HolidaysPage = lazy(() => import('./pages/HolidaysPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const NameDecorationPage = lazy(() => import('./pages/NameDecorationPage'));
const CountdownDetailPage = lazy(() => import('./pages/CountdownPage'));
const CountdownHubPage = lazy(() =>
  import('./pages/CountdownPage').then((m) => ({ default: m.CountdownHubPage }))
);
const TodayPage = lazy(() => import('./pages/TodayPage'));
const ArticlesListPage = lazy(() =>
  import('./pages/ArticlePage').then((m) => ({ default: m.ArticlesListPage }))
);
const NameDecorationHubPage = lazy(() =>
  import('./pages/NameDecorationPage').then((m) => ({ default: m.NameDecorationHubPage }))
);
const TrendingHubPage = lazy(() =>
  import('./pages/TrendingPage').then((m) => ({ default: m.TrendingHubPage }))
);
const TrendingCategoryPage = lazy(() =>
  import('./pages/TrendingPage').then((m) => ({ default: m.TrendingCategoryPage }))
);
const TrendingTopicPage = lazy(() =>
  import('./pages/TrendingPage').then((m) => ({ default: m.TrendingTopicPage }))
);
const TrendingTodayPage = lazy(() =>
  import('./pages/TrendingPage').then((m) => ({ default: m.TrendingTodayPage }))
);
const PrivacyPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.ContactPage })));
const FaultCodesPage = lazy(() => import('./pages/FaultCodesPage'));
const CmsContentPage = lazy(() => import('./pages/CmsContentPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="container-page flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}

// الصفحات العالمية (غير العربية) تُعرض عبر GlobalPage.
// ملاحظة: المقالات السعودية (/articles و /articles/*) والمقالات العالمية
// العربية (/world/*) والمواضيع الرائجة (/trending*) ليست «عالمية» — لكل منها
// صفحاتها العربية الأصلية الخاصة، فلا تُوجَّه خطأً إلى GlobalPage.
const GLOBAL_KINDS = new Set(['hub', 'tool', 'tools-hub', 'gold-hub', 'usd-hub', 'gold', 'usd', 'date-today', 'letter', 'name', 'list', 'article', 'world-article', 'articles-list']);
const EDITORIAL_GUIDE_PATHS = new Set([
  '/', '/salaries', '/hijri-calendar', '/school-calendar', '/holidays', '/date-converter',
  '/age-calculator', '/today', '/faq', '/articles', '/privacy', '/terms', '/about', '/contact',
]);

export default function App() {
  const [path] = useRoute();
  const info = useMemo(() => parseRoute(path), [path]);
  const cmsItem = useMemo(() => cmsItemByPath(path), [path]);
  const { lang, kind, param } = info;
  const isAdmin = kind === 'admin';

  // الصفحات العالمية (غير العربية) تُعرض عبر GlobalPage:
  //  - أي صفحة بلغة غير العربية
  //  - الصفحات العالمية بالعربية: الأدوات، الذهب، الدولار، تاريخ اليوم،
  //    الحروف، الأسماء، القوائم، والمقالات العالمية (/world/*)
  // تُستثنى: المقالات السعودية (/articles و /articles/*) وصفحات المواضيع
  // الرائجة (/trending و /trending/*) التي لها تصميم عربي مستقل.
  const isGlobal =
    lang !== 'ar' ||
    (GLOBAL_KINDS.has(kind) && kind !== 'article' && kind !== 'articles-list');
  const qualityReadyGlobal = lang === 'ar' && ['gold-hub', 'usd-hub', 'gold', 'usd'].includes(kind);
  useSeo({
    jsonLdId: 'app-shell-jsonld',
    robots: isAdmin || (kind === 'not-found' && !cmsItem)
      ? 'noindex, nofollow, noarchive'
      : !isGlobal || qualityReadyGlobal
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, follow',
  });

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && kind !== 'not-found' && <AdSenseScript />}
      {!isAdmin && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {isAdmin && <AdminPage />}
          {!isAdmin && cmsItem && kind !== 'fault-codes' && <CmsContentPage item={cmsItem} />}
          {!isAdmin && !cmsItem && isGlobal && <GlobalPage info={info} />}
          {!isAdmin && !cmsItem && !isGlobal && lang === 'ar' && kind === 'salaries' && <SalariesPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'date-converter' && <DateConverterPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'age-calculator' && <AgeCalculatorPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'hijri-calendar' && <HijriCalendarPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'school-calendar' && <SchoolCalendarPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'holidays' && <HolidaysPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'countdown' && param && <CountdownDetailPage slug={param} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'countdown' && !param && <CountdownHubPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'today' && <TodayPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'faq' && <FaqPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'article' && param && <ArticlePage slug={param} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'article' && !param && <ArticlesListPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'name-decoration' && param && <NameDecorationPage slug={param} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'name-decoration' && !param && <NameDecorationHubPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'trending-hub' && <TrendingHubPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'trending-today' && <TrendingTodayPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'trending-category' && param && <TrendingCategoryPage category={param} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'trending' && param && <TrendingTopicPage slug={param} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'privacy' && <PrivacyPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'terms' && <TermsPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'about' && <AboutPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'contact' && <ContactPage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'fault-codes' && <FaultCodesPage device={info.device} brand={info.brand} code={info.code} path={path} />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'home' && <HomePage />}
          {!isAdmin && !cmsItem && !isGlobal && kind === 'not-found' && <NotFoundPage />}
          {!isAdmin && !cmsItem && EDITORIAL_GUIDE_PATHS.has(path) && <EditorialGuide route={path} />}
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
