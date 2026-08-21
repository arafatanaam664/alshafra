import type { FaqItem } from '@alshafra/seo';

export interface PageModel {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  h1: string;
  robots: 'index, follow' | 'noindex, follow';
  kind: string;
  island?: 'date-converter' | 'age-calculator' | 'countdown' | 'hijri-calendar' | 'today' | 'salaries';
  countdownSlug?: string;
  isoDate?: string;
  html: string;
  faq?: FaqItem[];
  datePublished?: string;
  dateModified?: string;
  itemList?: { name: string; path: string }[];
  imageAlt?: string;
  related?: { path: string; title: string; reason: string; kind: string }[];
}

export interface ContentProvider {
  getAll(): PageModel[];
  get(path: string): PageModel | undefined;
}
