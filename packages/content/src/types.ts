export type DocumentType =
  | 'article'
  | 'guide'
  | 'solution'
  | 'news'
  | 'trend'
  | 'faq_page'
  | 'comparison'
  | 'opportunity'
  | 'job'
  | 'scholarship'
  | 'tool_page'
  | 'calendar_content'
  | 'service_info'
  | 'collection'
  | 'legal';

export type DocumentStatus =
  | 'idea'
  | 'draft'
  | 'review'
  | 'scheduled'
  | 'published'
  | 'unpublished'
  | 'archived';

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  locale: string;
  title: string;
  slug: string;
  path: string;
  excerpt?: string;
  indexable: boolean;
}

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  'idea',
  'draft',
  'review',
  'scheduled',
  'published',
  'unpublished',
  'archived',
];

export function canPublish(status: DocumentStatus): boolean {
  return status === 'draft' || status === 'review' || status === 'scheduled' || status === 'unpublished';
}

export function assertPublicPath(path: string): boolean {
  return path.startsWith('/') && (path === '/' || !path.endsWith('/'));
}
