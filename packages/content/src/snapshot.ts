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
  html: z.string().optional(),
  isLegacy: z.boolean().optional(),
  uniqueTextWordCount: z.number().optional(),
  qualityPass: z.boolean().optional(),
  image: z.string().optional(),
});

const snapshotSectionChildSchema = z.object({
  key: z.string(),
  name: z.string(),
  path: z.string(),
  enabled: z.boolean(),
  sort: z.number(),
  lockedPath: z.boolean(),
});

const snapshotSectionSchema = z.object({
  key: z.string(),
  name: z.string(),
  path: z.string(),
  description: z.string(),
  icon: z.string(),
  enabled: z.boolean(),
  showInNav: z.boolean(),
  showInHome: z.boolean(),
  showInFooter: z.boolean(),
  showInMobile: z.boolean(),
  featured: z.boolean(),
  sort: z.number(),
  children: z.array(snapshotSectionChildSchema),
  featureFlag: z.string().nullable(),
  hasPublicPage: z.boolean(),
  lockedPath: z.boolean(),
  system: z.boolean(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  parentKey: z.string().nullable(),
});

export const contentSnapshotSchema = z.object({
  generatedAt: z.string(),
  siteUrl: z.string(),
  routes: z.array(snapshotRouteSchema),
  counts: z.record(z.number()),
  sections: z.array(snapshotSectionSchema).optional(),
  flags: z.record(z.boolean()).optional(),
  opportunities: z
    .array(
      z.object({
        path: z.string(),
        title: z.string(),
        description: z.string(),
        html: z.string(),
        kind: z.string(),
        sourceName: z.string(),
        country: z.string().optional(),
        deadline: z.string().optional(),
        applyUrl: z.string().optional(),
      }),
    )
    .optional(),
  questions: z
    .array(
      z.object({
        path: z.string(),
        title: z.string(),
        body: z.string(),
        robots: z.enum(['index, follow', 'noindex, follow']),
      }),
    )
    .optional(),
  ads: z
    .object({
      enabled: z.boolean(),
      client: z.string().optional(),
      slots: z.array(z.object({ key: z.string(), slotId: z.string() })),
    })
    .optional(),
});

export type SnapshotRoute = z.infer<typeof snapshotRouteSchema>;
export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;

export interface PublicPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  robots: 'index, follow' | 'noindex, follow';
  kind: string;
  html: string;
  image?: string;
}

/**
 * Chat Phase 6: JSON fallback stays. Do not rewrite the identity of the 127
 * legacy URLs. New published CMS routes are appended. `database` mode uses
 * the snapshot only and is rejected unless every legacy path is present.
 */
export function mergeLegacyAndSnapshot(
  legacyPages: PublicPage[],
  snapshot: ContentSnapshot | null,
  source: 'legacy' | 'database' | 'composite',
): PublicPage[] {
  if (!snapshot || source === 'legacy') return legacyPages;

  const legacyByPath = new Map(legacyPages.map((page) => [page.path, page]));
  const snapByPath = new Map(snapshot.routes.map((route) => [route.path, route]));

  if (source === 'database') {
    const missing = legacyPages.filter((page) => !snapByPath.has(page.path)).map((page) => page.path);
    if (missing.length) {
      throw new Error(`database source missing legacy paths: ${missing.slice(0, 8).join(', ')}`);
    }
    return snapshot.routes.filter((route) => route.status === 'published').map(snapshotRouteToPage);
  }

  const merged = legacyPages.map((page) => page);
  for (const route of snapshot.routes) {
    if (route.status !== 'published') continue;
    if (legacyByPath.has(route.path) || route.isLegacy) continue;
    if (!route.html?.trim()) continue;
    merged.push(snapshotRouteToPage(route));
  }
  return merged;
}

export function snapshotRouteToPage(route: SnapshotRoute): PublicPage {
  const indexable = Boolean(route.indexable && route.qualityPass && route.robots.startsWith('index'));
  return {
    path: route.path,
    title: route.title,
    description: route.description,
    h1: route.h1,
    robots: indexable ? 'index, follow' : 'noindex, follow',
    kind: route.documentType || route.kind,
    html: route.html || '',
    image: route.image,
  };
}
