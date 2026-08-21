import articlesData from '../data/articles.json';

export interface ArticleSource {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  category: 'salaries' | 'calendar' | 'holidays' | 'tools' | 'support';
  updatedAt: string;
  reviewedAt?: string;
  readMinutes: number;
  keywords: string[];
  sections: { heading: string; body: string }[];
  faq?: { q: string; a: string }[];
  sources?: ArticleSource[];
}

/**
 * مصدر تحريري واحد للمحتوى. يقرأ React وسكربت الـprerender ملف JSON نفسه،
 * وبذلك لا يرى Google نسخة مختصرة تختلف عن النص الذي يراه المستخدم بعد تشغيل JS.
 */
export const ARTICLES = (articlesData as { articles: Article[] }).articles;

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export const SAUDI_ARTICLE_SLUGS = new Set(ARTICLES.map((article) => article.slug));

export const CATEGORY_LABELS_ARTICLE: Record<Article['category'], string> = {
  salaries: 'الرواتب',
  calendar: 'التقويم',
  holidays: 'الإجازات',
  tools: 'أدوات',
  support: 'الدعم الاجتماعي',
};
