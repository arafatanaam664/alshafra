import { useEffect } from 'react';
import Link from '../components/Link';
import { SITE_URL, useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'الصفحة غير موجودة | تقويم السعودية',
    description: 'لم نعثر على الصفحة المطلوبة. يمكنك العودة إلى الصفحة الرئيسية.',
    canonical: `${SITE_URL}${window.location.pathname}`,
  });
  useEffect(() => {
    const tags = ['robots', 'googlebot'].map((name) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      const element = existing ?? document.createElement('meta');
      const old = element.getAttribute('content');
      if (!existing) { element.name = name; document.head.appendChild(element); }
      element.content = 'noindex, follow';
      return { element, existing, old };
    });
    return () => tags.forEach(({ element, existing, old }) => {
      if (!existing) element.remove();
      else if (old === null) element.removeAttribute('content');
      else element.content = old;
    });
  }, []);
  return (
    <div className="container-page py-20 text-center">
      <h1 className="section-title">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm text-brand-700/80">لم نعثر على الصفحة المطلوبة. تحقق من الرابط أو عُد إلى الرئيسية.</p>
      <Link to="/" className="btn-primary mt-6">العودة للرئيسية</Link>
    </div>
  );
}
