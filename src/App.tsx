import { lazy, Suspense, useMemo } from 'react';
import { useRoute, parseRoute } from './lib/router';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

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

export default function App() {
  const [path] = useRoute();
  const { name, param } = useMemo(() => parseRoute(path), [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {name === 'salaries' && <SalariesPage />}
          {name === 'date-converter' && <DateConverterPage />}
          {name === 'age-calculator' && <AgeCalculatorPage />}
          {name === 'hijri-calendar' && <HijriCalendarPage />}
          {name === 'school-calendar' && <SchoolCalendarPage />}
          {name === 'holidays' && <HolidaysPage />}
          {name === 'countdown' && param && <CountdownDetailPage slug={param} />}
          {name === 'countdown' && !param && <CountdownHubPage />}
          {name === 'today' && <TodayPage />}
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
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
