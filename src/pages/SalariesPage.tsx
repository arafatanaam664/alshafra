import { useSeo } from '../lib/seo';
import Link from '../components/Link';

const programs = [
  { title: 'رواتب الموظفين الحكوميين', href: '/countdown/employee-salaries', source: 'https://www.mof.gov.sa/mediacenter/Payroll/Pages/2026.aspx', label: 'وزارة المالية' },
  { title: 'حساب المواطن', href: '/countdown/citizen-account', source: 'https://portal.ca.gov.sa/', label: 'بوابة حساب المواطن' },
  { title: 'معاشات المتقاعدين', href: '/countdown/retiree-salaries', source: 'https://beta.gosi.gov.sa/pension-disbursement-date', label: 'التأمينات الاجتماعية' },
  { title: 'الضمان الاجتماعي المطور', href: '/countdown/social-security', source: 'https://www.hrsd.gov.sa/', label: 'وزارة الموارد البشرية والتنمية الاجتماعية' },
];

export default function SalariesPage() {
  useSeo({ title: 'مواعيد صرف الرواتب والدعم في السعودية | تقويم السعودية', description: 'اختر برنامج الرواتب أو الدعم وراجع مصدر الجهة المعنية لمعرفة موعد الصرف.', canonical: 'https://alshafra.com/salaries' });
  return <div className="container-page py-10">
    <header className="max-w-3xl"><h1 className="section-title">مواعيد صرف الرواتب والدعم في السعودية</h1>
      <p className="mt-3 leading-relaxed text-brand-700/80">اختر البرنامج ثم راجع إعلان الجهة المعنية. لا نعرض موعداً قادماً هنا قبل التحقق من الجدول أو الإعلان الرسمي لكل دفعة.</p></header>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{programs.map(program => <section key={program.href} className="card p-6">
      <h2 className="font-display text-lg font-bold">{program.title}</h2><p className="mt-2 text-sm text-brand-700/80">الموعد القادم: بانتظار التحقق.</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><Link className="underline" to={program.href}>صفحة البرنامج</Link><a className="underline" href={program.source} target="_blank" rel="noopener noreferrer">{program.label}</a></div>
    </section>)}</div>
    <p className="mt-8 text-sm leading-relaxed text-brand-700/80">لا يُستعاض عن الجدول السنوي لوزارة المالية بقاعدة شهرية عامة، وقد تتغير مواعيد الدعم بإعلان الجهة المعنية. <Link className="underline" to="/articles/salary-dates-saudi-arabia">اقرأ دليل رواتب الموظفين الحكوميين</Link>.</p>
  </div>;
}
