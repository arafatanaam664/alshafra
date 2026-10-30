export interface Article {
  slug: string;
  title: string;
  description: string;
  category: 'salaries' | 'calendar' | 'holidays' | 'tools' | 'support';
  readMinutes: number;
  keywords: string[];
  sections: { heading: string; body: string }[];
  faq?: { q: string; a: string }[];
}

import rawArticles from '../data/articles.json';

export const ARTICLES: Article[] = rawArticles.map((article) => {
  const words = [article.title, article.description, ...article.sections.flatMap((section) => [section.heading, section.body]), ...article.faq.flatMap((item) => [item.q, item.a])].join(' ').trim().split(/\s+/).length;
  return { ...article, category: article.category as Article['category'], readMinutes: Math.max(1, Math.ceil(words / 200)) };
});

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export const CATEGORY_LABELS_ARTICLE: Record<Article['category'], string> = {
  salaries: 'الرواتب',
  calendar: 'التقويم',
  holidays: 'الإجازات',
  tools: 'أدوات',
  support: 'الدعم الاجتماعي',
};
