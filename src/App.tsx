import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { useRoute, parseRoute } from './lib/router';
import { trackPageView } from './lib/analytics';
import Header from './components/Header';
import Footer from './components/Footer';
import AdPlacement from './components/AdPlacement';
import { adDensityForRoute, PAGES_WITH_OWN_NATIVE } from './lib/ads';
import { isPrivateDatePath } from './lib/date-privacy.mjs';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const DateConverterPage = lazy(() => import('./pages/DateConverterPage'));
const AgeCalculatorPage = lazy(() => import('./pages/AgeCalculatorPage'));
const TodayPage = lazy(() => import('./pages/TodayPage'));
const SchoolCalendarPage = lazy(() => import('./pages/SchoolCalendarPage'));
const SalariesPage = lazy(() => import('./pages/SalariesPage'));
const HijriCalendarPage = lazy(() => import('./pages/HijriCalendarPage'));
const HolidaysPage = lazy(() => import('./pages/HolidaysPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const NameDecorationPage = lazy(() => import('./pages/NameDecorationPage'));
const CountdownDetailPage = lazy(() => import('./pages/CountdownPage'));
const CountdownHubPage = lazy(() =>
  import('./pages/CountdownPage').then((m) => ({ default: m.CountdownHubPage }))
);
const ArticlesListPage = lazy(() =>
  import('./pages/ArticlePage').then((m) => ({ default: m.ArticlesListPage }))
);
const NameDecorationHubPage = lazy(() =>
  import('./pages/NameDecorationPage').then((m) => ({ default: m.NameDecorationHubPage }))
);
const PrivacyPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.ContactPage })));

function PageLoader() {
  return (
    <div role="status" aria-label="جارٍ تحميل الصفحة" className="container-page flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}

export default function App({ initialPath, InitialPage }: { initialPath?: string; InitialPage?: React.ComponentType } = {}) {
  const [path] = useRoute();
  const { name, param } = useMemo(() => parseRoute(path), [path]);
  const trackedPath = useRef<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const density = isPrivateDatePath(path) ? 'minimal' : adDensityForRoute(name);
  const hasOwnNative = PAGES_WITH_OWN_NATIVE.has(name);

  useEffect(() => {
    // The landing page view is already reported by gtag('config') in
    // index.html — only navigations inside the app need to be reported.
    if (trackedPath.current === null) {
      trackedPath.current = path;
      return;
    }
    if (trackedPath.current === path) return;
    trackedPath.current = path;
    mainRef.current?.focus({ preventScroll: true });
    trackPageView(path);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-brand-900 focus:ring-2 focus:ring-brand-600">انتقل إلى المحتوى الرئيسي</a>
      <Header />
      {!isPrivateDatePath(path) && <AdPlacement name="header" />}
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoader />}>
          {name === 'salaries' && <SalariesPage />}
          {name === 'date-converter' && (InitialPage && path === initialPath ? <InitialPage /> : <DateConverterPage />)}
          {name === 'age-calculator' && (InitialPage && path === initialPath ? <InitialPage /> : <AgeCalculatorPage />)}
          {name === 'hijri-calendar' && <HijriCalendarPage />}
          {name === 'school-calendar' && (InitialPage && path === initialPath ? <InitialPage /> : <SchoolCalendarPage />)}
          {name === 'holidays' && <HolidaysPage />}
          {name === 'countdown' && param && <CountdownDetailPage slug={param} />}
          {name === 'countdown' && !param && <CountdownHubPage />}
          {name === 'today' && (InitialPage && path === initialPath ? <InitialPage /> : <TodayPage />)}
          {name === 'faq' && <FaqPage />}
          {name === 'articles' && param && <ArticlePage slug={param} />}
          {name === 'articles' && !param && <ArticlesListPage />}
          {name === 'name-decoration' && param && <NameDecorationPage slug={param} />}
          {name === 'name-decoration' && !param && <NameDecorationHubPage />}
          {name === 'privacy' && <PrivacyPage />}
          {name === 'terms' && <TermsPage />}
          {name === 'about' && <AboutPage />}
          {name === 'contact' && <ContactPage />}
          {name === 'home' && <HomePage />}
          {name === 'not-found' && <NotFoundPage />}
        </Suspense>
      </main>
      {!hasOwnNative && density !== 'minimal' && (
        <div className="container-page">
          <AdPlacement name="content" unit="native" />
        </div>
      )}
      {!isPrivateDatePath(path) && <AdPlacement name="footer" />}
      <Footer />
    </div>
  );
}
