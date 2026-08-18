import cmsData from '../data/cms-content.json';

export type CmsContentType = 'article' | 'fault_code' | 'maintenance_guide' | 'tool_guide' | 'landing_page';
export type CmsContentStatus = 'draft' | 'review' | 'published' | 'archived';

export interface CmsSource {
  label: string;
  url: string;
  sourceType?: string;
  pageReference?: string;
}

export interface CmsContentItem {
  id: string;
  type: CmsContentType;
  status: CmsContentStatus;
  locale: string;
  canonical_path: string;
  slug: string;
  title: string;
  seo_title?: string | null;
  description: string;
  body_markdown: string;
  keywords?: string[] | null;
  sources?: CmsSource[] | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  author_name?: string | null;
  reviewer_name?: string | null;
  indexable: boolean;
  published_at?: string | null;
  scheduled_for?: string | null;
  reviewed_at?: string | null;
  updated_at: string;
  metadata?: Record<string, unknown> | null;
}

const cached = cmsData as {
  generatedAt: string | null;
  source: string;
  items: CmsContentItem[];
};

export const CMS_CONTENT = cached.items.filter(
  (item) => item.status === 'published' && item.indexable,
);

export function cmsItemByPath(path: string): CmsContentItem | undefined {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return CMS_CONTENT.find((item) => item.canonical_path === normalized);
}

export function cmsContentPath(item: CmsContentItem): string {
  return item.canonical_path.startsWith('/') ? item.canonical_path : `/${item.canonical_path}`;
}

export interface MarkdownBlock {
  type: 'heading' | 'paragraph' | 'list';
  level?: 2 | 3;
  text?: string;
  items?: string[];
}

/**
 * A deliberately small, safe Markdown subset for CMS content. Raw HTML is
 * never interpreted, so editor content cannot inject scripts into public pages.
 */
export function parseSafeMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list });
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: 3, text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: 2, text: line.slice(3).trim() });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}
