// trendingData.ts — واجهة منسّقة للوصول إلى بيانات src/data/trending.json
// (مواضيع رائجة منسّقة وغنية: 35 موضوعاً +1000 كلمة لكل موضوع)
import trendingRaw from '../data/trending.json';

export interface TrendingCategory {
  ar: string;
  en: string;
  emoji: string;
}

export interface TrendingFaq {
  q: string;
  a: string;
}

export interface TrendingSection {
  heading: string;
  paragraphs: string[];
}

export interface TrendingTopic {
  slug: string;
  category: string;
  emoji: string;
  title: string;
  description: string;
  keywords: string;
  intro: string[];
  sections: TrendingSection[];
  /** صفوف [المفتاح, القيمة] لجدول «معلومات سريعة». */
  facts: string[][];
  faq: TrendingFaq[];
  related: string[];
}

interface TrendingData {
  categories: Record<string, TrendingCategory>;
  topics: TrendingTopic[];
}

export const TRENDING = trendingRaw as TrendingData;

export const TRENDING_CATEGORIES = TRENDING.categories;
export const TRENDING_TOPICS = TRENDING.topics;

const TOPIC_BY_SLUG = new Map(TRENDING_TOPICS.map((t) => [t.slug, t]));

export function topicBySlug(slug: string): TrendingTopic | undefined {
  return TOPIC_BY_SLUG.get(slug);
}

export function topicsByCategory(category: string): TrendingTopic[] {
  return TRENDING_TOPICS.filter((t) => t.category === category);
}

export function categoryBySlug(slug: string): TrendingCategory | undefined {
  return TRENDING_CATEGORIES[slug];
}

/** عدد كلمات موضوع (مقدّراً من الفقرات والعناوين) — لعرض زمن القراءة. */
export function topicWordCount(topic: TrendingTopic): number {
  let n = 0;
  for (const p of topic.intro) n += p.split(/\s+/).filter(Boolean).length;
  for (const s of topic.sections) {
    n += s.heading.split(/\s+/).filter(Boolean).length;
    for (const p of s.paragraphs) n += p.split(/\s+/).filter(Boolean).length;
  }
  return n;
}

export function topicReadMinutes(topic: TrendingTopic): number {
  return Math.max(2, Math.round(topicWordCount(topic) / 200));
}

export function keywordsList(topic: TrendingTopic): string[] {
  return String(topic.keywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

/** مواضيع ذات صلة: المرتبطة صراحةً ثم من نفس الفئة. */
export function relatedTopics(topic: TrendingTopic, limit = 8): TrendingTopic[] {
  const out: TrendingTopic[] = [];
  const seen = new Set<string>([topic.slug]);
  for (const slug of topic.related || []) {
    const t = topicBySlug(slug);
    if (t && !seen.has(t.slug)) {
      seen.add(t.slug);
      out.push(t);
    }
  }
  for (const t of TRENDING_TOPICS) {
    if (out.length >= limit) break;
    if (t.category === topic.category && !seen.has(t.slug)) {
      seen.add(t.slug);
      out.push(t);
    }
  }
  return out.slice(0, limit);
}

export interface TrendingSnapshot {
  date?: string;
  countries?: Record<
    string,
    { country?: string; date?: string; titles?: string[] }
  >;
}

// لقطة Google Trends اليومية (src/data/trending-snapshot.json) — مولّدة بواسطة
// scripts/fetch-trending.mjs وقت البناء. نستخدم import.meta.glob حتى لا يفشل
// البناء إن كان الملف غير موجود (لا يضمّن المسار إلا إذا وُجد فعلاً).
// ملاحظة: الحارس typeof يحمي السيناريوهات خارج Vite (اختبارات SSR) مع بقاء
// الاستدعاء نصياً كما هو ليحوّله Vite وقت البناء.
const snapshotModules =
  typeof import.meta !== 'undefined' && typeof (import.meta as { glob?: unknown }).glob === 'function'
    ? (import.meta as { glob: (p: string, o?: { eager?: boolean }) => Record<string, () => Promise<{ default?: TrendingSnapshot }>> }).glob('../data/trending-snapshot.json', { eager: false })
    : {};

export async function loadTrendingSnapshot(): Promise<TrendingSnapshot | null> {
  const key = Object.keys(snapshotModules)[0];
  if (!key) return null;
  try {
    const mod = await snapshotModules[key]();
    return (mod.default as TrendingSnapshot) ?? null;
  } catch {
    return null;
  }
}
