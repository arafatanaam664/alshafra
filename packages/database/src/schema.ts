import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'article',
  'guide',
  'solution',
  'news',
  'trend',
  'faq_page',
  'comparison',
  'opportunity',
  'job',
  'scholarship',
  'tool_page',
  'calendar_content',
  'service_info',
  'collection',
  'legal',
]);

export const documentStatusSchema = z.enum([
  'idea',
  'draft',
  'review',
  'scheduled',
  'published',
  'unpublished',
  'archived',
]);

export const robotsDirectiveSchema = z.enum([
  'index_follow',
  'noindex_follow',
  'index_nofollow',
  'noindex_nofollow',
]);

export const handlerKindSchema = z.enum([
  'document',
  'tool',
  'countdown',
  'prices',
  'static',
  'gone',
  'redirect',
]);

export const publicPathSchema = z
  .string()
  .min(1)
  .refine((p) => p === '/' || (p.startsWith('/') && !p.endsWith('/')), {
    message: 'path must have a leading slash and no trailing slash',
  })
  .refine((p) => !p.startsWith('/category/') && !p.startsWith('/languages/') && !p.startsWith('/news/'), {
    message: 'forbidden legacy prefix',
  });

export const localeSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);

export const documentRowSchema = z.object({
  id: z.string().uuid(),
  type: documentTypeSchema,
  status: documentStatusSchema,
  locale: localeSchema,
  title: z.string().min(1),
  slug: z.string().min(1),
  path: publicPathSchema,
  legacy_path: z.string().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  body_json: z.unknown(),
  type_data_json: z.unknown(),
  author_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  indexable: z.boolean(),
  published_at: z.string().nullable().optional(),
});

export const documentSeoSchema = z.object({
  document_id: z.string().uuid(),
  seo_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  canonical_url: z.string().url(),
  robots: robotsDirectiveSchema,
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  h1_override: z.string().nullable().optional(),
  schema_type: z.string().nullable().optional(),
});

export const routeRowSchema = z.object({
  id: z.string().uuid(),
  path: publicPathSchema,
  handler_kind: handlerKindSchema,
  http_status: z.number().int(),
  is_legacy: z.boolean(),
  canonical_url: z.string().nullable().optional(),
  status: z.enum(['active', 'gone', 'redirect']),
});

export const featureFlagSchema = z.object({
  key: z.string().min(1),
  is_enabled: z.boolean(),
  description: z.string().nullable().optional(),
  environment: z.string(),
  rollout_percent: z.number().int().min(0).max(100),
});

export const analyticsEventSchema = z.object({
  name: z.string().min(1),
  path: z.string().nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  tool_id: z.string().uuid().nullable().optional(),
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  occurred_at: z.string().optional(),
  session_hash: z.string().nullable().optional(),
});

export const priceSnapshotSchema = z.object({
  captured_at: z.string(),
  asset: z.string().min(1),
  quote_currency: z.string().min(1),
  value: z.number(),
  source: z.string().nullable().optional(),
});

export const sourceCatalogSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().nullable().optional(),
  source_type: z.string().default('web'),
  notes: z.string().nullable().optional(),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type RobotsDirective = z.infer<typeof robotsDirectiveSchema>;
export type HandlerKind = z.infer<typeof handlerKindSchema>;
