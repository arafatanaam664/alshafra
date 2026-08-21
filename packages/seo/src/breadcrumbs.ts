import { SITE_URL } from './site';
import { normalizePublicPath, selfCanonical } from './canonical';

export interface Crumb {
  name: string;
  path?: string;
}

const CALENDAR = new Set([
  '/today',
  '/date-converter',
  '/hijri-calendar',
  '/salaries',
  '/school-calendar',
  '/holidays',
  '/age-calculator',
]);

export function breadcrumbsFor(path: string, h1: string): Crumb[] {
  const home: Crumb = { name: 'الرئيسية', path: '/' };
  const p = normalizePublicPath(path);
  if (p === '/') return [home];
  if (p === '/articles') return [home, { name: 'المقالات' }];
  if (p.startsWith('/articles/')) return [home, { name: 'المقالات', path: '/articles' }, { name: h1 }];
  if (p === '/trending') return [home, { name: 'الأدلة' }];
  if (p.startsWith('/trending/')) return [home, { name: 'الأدلة', path: '/trending' }, { name: h1 }];
  if (p === '/countdown') return [home, { name: 'كم باقي' }];
  if (p.startsWith('/countdown/')) return [home, { name: 'كم باقي', path: '/countdown' }, { name: h1 }];
  if (p === '/gold-price') return [home, { name: 'الذهب' }];
  if (p.startsWith('/gold-price/')) return [home, { name: 'الذهب', path: '/gold-price' }, { name: h1 }];
  if (p === '/usd-rate') return [home, { name: 'الدولار' }];
  if (p.startsWith('/usd-rate/')) return [home, { name: 'الدولار', path: '/usd-rate' }, { name: h1 }];
  if (p.startsWith('/solution/')) return [home, { name: 'الحلول' }, { name: h1 }];
  if (p.startsWith('/guide/')) return [home, { name: 'الأدلة' }, { name: h1 }];
  if (p.startsWith('/compare/')) return [home, { name: 'المقارنات' }, { name: h1 }];
  if (CALENDAR.has(p)) return [home, { name: 'المواعيد والتقويم' }, { name: h1 }];
  if (p === '/faq') return [home, { name: 'الأسئلة الشائعة' }];
  if (p === '/about') return [home, { name: 'عن المنصة' }];
  return [home, { name: h1 }];
}

export function breadcrumbListJsonLd(crumbs: Crumb[], canonical: string, siteUrl = SITE_URL) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.path ? selfCanonical(crumb.path, siteUrl) : isLast ? canonical : undefined,
      };
    }),
  };
}
