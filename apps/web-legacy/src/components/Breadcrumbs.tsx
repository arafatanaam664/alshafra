import { ChevronLeft, Home } from 'lucide-react';
import { useSeo, SITE_URL } from '../lib/seo';

export interface Crumb {
  name: string;
  path?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path ? `${SITE_URL}${item.path}` : `${SITE_URL}/`,
    })),
  };
  // Own a dedicated JSON-LD node so the page-level useSeo() call cannot
  // overwrite (or delete) the BreadcrumbList.
  useSeo({ jsonLd, jsonLdId: 'breadcrumb-jsonld' });

  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1 text-xs text-brand-600/70">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i === 0 && <Home className="h-3.5 w-3.5" />}
            {item.path && !isLast ? (
              <a href={item.path} className="hover:text-brand-700 hover:underline">
                {item.name}
              </a>
            ) : (
              <span className="font-medium text-brand-800">{item.name}</span>
            )}
            {!isLast && <ChevronLeft className="h-3 w-3 opacity-50" />}
          </span>
        );
      })}
    </nav>
  );
}
