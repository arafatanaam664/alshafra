import { z } from 'zod';

export const ANALYTICS_EVENTS = [
  'page_view',
  'content_view',
  'article_view',
  'tool_used',
  'search',
  'share',
  'copy_link',
  'download',
  'question_created',
  'answer_created',
  'comment_created',
  'login',
  'signup',
  'social_click',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export const analyticsEventContract = z.object({
  name: z.enum(ANALYTICS_EVENTS),
  path: z.string().optional(),
  documentId: z.string().uuid().optional(),
  toolId: z.string().uuid().optional(),
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  occurredAt: z.string().optional(),
  sessionHash: z.string().min(8).optional(),
});

export type AnalyticsEvent = z.infer<typeof analyticsEventContract>;

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
}

export function isAllowedEvent(name: string): name is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(name);
}

/** Reject payloads that look like raw PII. Contract only — ingestion is later. */
export function assertAnalyticsPrivacy(event: AnalyticsEvent): void {
  const blob = JSON.stringify(event.props ?? {});
  if (/"ip"/i.test(blob) || /password/i.test(blob) || /email/i.test(blob)) {
    throw new Error('analytics props must not include ip, password, or email');
  }
}

export const contentMetricsShape = z.object({
  documentId: z.string().uuid(),
  views: z.number().int().nonnegative(),
  unique_views: z.number().int().nonnegative(),
  shares: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
  bookmarks: z.number().int().nonnegative(),
  search_impressions: z.number().int().nonnegative(),
  search_clicks: z.number().int().nonnegative(),
  social_clicks: z.number().int().nonnegative(),
});

export const toolMetricsShape = z.object({
  toolId: z.string().uuid(),
  uses: z.number().int().nonnegative(),
  unique_users: z.number().int().nonnegative(),
  completions: z.number().int().nonnegative(),
  shares: z.number().int().nonnegative(),
});
