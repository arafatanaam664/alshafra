import { z } from 'zod';

export const snapshotRouteSchema = z.object({
  path: z.string(),
  slug: z.string(),
  title: z.string(),
  h1: z.string(),
  description: z.string(),
  robots: z.enum(['index, follow', 'noindex, follow']),
  canonicalUrl: z.string(),
  documentType: z.string(),
  status: z.string(),
  handlerKind: z.string(),
  indexable: z.boolean(),
  kind: z.string(),
});

export const contentSnapshotSchema = z.object({
  generatedAt: z.string(),
  siteUrl: z.string(),
  routes: z.array(snapshotRouteSchema),
  counts: z.record(z.number()),
});

export type SnapshotRoute = z.infer<typeof snapshotRouteSchema>;
export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;
