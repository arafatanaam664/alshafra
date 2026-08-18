import { ArrowRight, Home, SearchX } from 'lucide-react';
import Link from '../components/Link';
import { useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'الصفحة غير موجودة | الشفرة',
    description: 'تعذر العثور على الصفحة المطلوبة.',
    canonical: `https://alshafra.com${window.location.pathname}`,
    robots: 'noindex, nofollow, noarchive',
  });
  return (
    <div className="container-page py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600"><SearchX className="h-8 w-8" /></span>
      <div className="mt-5 font-mono text-sm font-bold text-brand-500">404</div>
      <h1 className="mt-2 font-display text-3xl font-bold text-brand-900">هذه الصفحة غير موجودة</h1>
      <p className="mx-auto mt-3 max-w-lg leading-relaxed text-brand-600/80">ربما تغيّر الرابط أو كُتب بطريقة غير صحيحة. لم نوجّهك تلقائيًا إلى صفحة غير مكافئة حفاظًا على دقة الموقع.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="btn-primary"><Home className="h-4 w-4" />الرئيسية</Link><Link to="/fault-codes" className="btn-ghost">دليل أكواد الأعطال<ArrowRight className="h-4 w-4" /></Link></div>
    </div>
  );
}
