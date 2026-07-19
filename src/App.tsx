import { useMemo } from 'react';
import { useRoute, parseRoute } from './lib/router';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DateConverterPage from './pages/DateConverterPage';
import AgeCalculatorPage from './pages/AgeCalculatorPage';
import SalariesPage from './pages/SalariesPage';
import HijriCalendarPage from './pages/HijriCalendarPage';
import SchoolCalendarPage from './pages/SchoolCalendarPage';
import HolidaysPage from './pages/HolidaysPage';
import FaqPage from './pages/FaqPage';
import ArticlePage, { ArticlesListPage } from './pages/ArticlePage';

export default function App() {
  const [path, navigate] = useRoute();
  const { name, param } = useMemo(() => parseRoute(path), [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {name === 'salaries' && <SalariesPage />}
        {name === 'date-converter' && <DateConverterPage />}
        {name === 'age-calculator' && <AgeCalculatorPage />}
        {name === 'hijri-calendar' && <HijriCalendarPage />}
        {name === 'school-calendar' && <SchoolCalendarPage />}
        {name === 'holidays' && <HolidaysPage />}
        {name === 'faq' && <FaqPage />}
        {name === 'articles' && param && <ArticlePage slug={param} />}
        {name === 'articles' && !param && <ArticlesListPage />}
        {name === 'home' && <HomePage navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}
