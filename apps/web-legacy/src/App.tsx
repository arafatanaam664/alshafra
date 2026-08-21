import { lazy, Suspense, useMemo } from 'react';
import { useRoute, parseRoute } from './lib/router';
import { useSeo } from './lib/seo';
import Header from './components/Header';
import Footer from './components/Footer';

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
  const { lang, kind, param } = info;

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
    robots: !isGlobal || qualityReadyGlobal
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow',
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {isGlobal && <GlobalPage info={info} />}
          {!isGlobal && lang === 'ar' && kind === 'salaries' && <SalariesPage />}
          {!isGlobal && kind === 'date-converter' && <DateConverterPage />}
          {!isGlobal && kind === 'age-calculator' && <AgeCalculatorPage />}
          {!isGlobal && kind === 'hijri-calendar' && <HijriCalendarPage />}
          {!isGlobal && kind === 'school-calendar' && <SchoolCalendarPage />}
          {!isGlobal && kind === 'holidays' && <HolidaysPage />}
          {!isGlobal && kind === 'countdown' && param && <CountdownDetailPage slug={param} />}
          {!isGlobal && kind === 'countdown' && !param && <CountdownHubPage />}
          {!isGlobal && kind === 'today' && <TodayPage />}
          {!isGlobal && kind === 'faq' && <FaqPage />}
          {!isGlobal && kind === 'article' && param && <ArticlePage slug={param} />}
          {!isGlobal && kind === 'article' && !param && <ArticlesListPage />}
          {!isGlobal && kind === 'name-decoration' && param && <NameDecorationPage slug={param} />}
          {!isGlobal && kind === 'name-decoration' && !param && <NameDecorationHubPage />}
          {!isGlobal && kind === 'trending-hub' && <TrendingHubPage />}
          {!isGlobal && kind === 'trending-today' && <TrendingTodayPage />}
          {!isGlobal && kind === 'trending-category' && param && <TrendingCategoryPage category={param} />}
          {!isGlobal && kind === 'trending' && param && <TrendingTopicPage slug={param} />}
          {!isGlobal && kind === 'privacy' && <PrivacyPage />}
          {!isGlobal && kind === 'terms' && <TermsPage />}
          {!isGlobal && kind === 'about' && <AboutPage />}
          {!isGlobal && kind === 'contact' && <ContactPage />}
          {!isGlobal && kind === 'home' && <HomePage />}
          {EDITORIAL_GUIDE_PATHS.has(path) && <EditorialGuide route={path} />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
