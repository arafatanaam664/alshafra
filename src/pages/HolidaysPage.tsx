import { useSeo } from '../lib/seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Link from '../components/Link';
import guide from '../data/holiday-guide.json';

export default function HolidaysPage() {
  useSeo({
    title: 'الإجازات الرسمية في السعودية والمدارس | تقويم السعودية',
    description: 'دليل الإجازات بحسب الفئة ومصادر الأنظمة، مع التمييز بين المناسبات وإجازات المدارس.',
    canonical: 'https://alshafra.com/holidays',
  });
  return <div className="container-page py-10">
    <Breadcrumbs items={[{ name: 'الرئيسية', path: '/' }, { name: 'الإجازات الرسمية' }]} />
    <header className="mt-4 max-w-3xl"><h1 className="section-title">الإجازات الرسمية في السعودية</h1><p className="mt-3 leading-relaxed text-brand-700/80">دليل يفرق بين أيام المناسبات وإجازات العمل والمدارس.</p></header>
    <p className="mt-6 rounded-xl bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">{guide.notice} آخر مراجعة للمصادر: {guide.verifiedAt}.</p>
    <section className="mt-8" aria-labelledby="holiday-table"><h2 id="holiday-table" className="text-xl font-bold">الإجازات بحسب الفئة</h2>
      <div className="mt-4 overflow-x-auto rounded-xl bg-white ring-1 ring-brand-900/10"><table className="w-full min-w-[36rem] text-right text-sm">
        <caption className="sr-only">الإجازات وتفاصيلها بحسب الفئة</caption>
        <thead className="bg-brand-50"><tr><th scope="col" className="p-4">المناسبة</th><th scope="col" className="p-4">الفئة</th><th scope="col" className="p-4">التفاصيل</th></tr></thead>
        <tbody>{guide.items.map(item => <tr key={item.title} className="border-t border-brand-900/10"><th scope="row" className="p-4">{item.title}</th><td className="p-4">{item.audience}</td><td className="p-4">{item.detail}</td></tr>)}</tbody>
      </table></div>
    </section>
    <section className="mt-8 card p-6"><h2 className="text-lg font-bold">المصادر الرسمية</h2><ul className="mt-3 space-y-3">{guide.sources.map(source => <li key={source.url}><a className="text-brand-700 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul><p className="mt-4 text-sm"><Link to="/school-calendar" className="underline">جدول إجازات المدارس</Link> · <Link to="/countdown" className="underline">عدادات المناسبات</Link></p></section>
  </div>;
}
