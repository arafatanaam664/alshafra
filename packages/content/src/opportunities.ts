import { z } from 'zod';

export const OPPORTUNITY_KINDS = ['job', 'scholarship', 'training', 'other'] as const;
export type OpportunityKind = (typeof OPPORTUNITY_KINDS)[number];

export const listingDataSchema = z.object({
  kind: z.enum(OPPORTUNITY_KINDS).default('other'),
  sourceName: z.string().trim().min(2),
  sourceUrl: z.string().optional(),
  company: z.string().trim().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  remote: z.boolean().optional(),
  deadline: z.string().optional(),
  applyUrl: z.string().optional(),
  listingStatus: z.enum(['open', 'closed', 'expired']).default('open'),
});

export type ListingData = z.infer<typeof listingDataSchema>;

export function parseListingData(value: unknown): ListingData | null {
  const parsed = listingDataSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : null;
}

export function listingIsExpired(data: ListingData, now = new Date()): boolean {
  if (data.listingStatus === 'expired' || data.listingStatus === 'closed') return true;
  if (!data.deadline) return false;
  const deadline = new Date(`${data.deadline}T23:59:59.000Z`);
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < now.getTime();
}

export function listingFlagFor(kind: OpportunityKind): string {
  if (kind === 'job') return 'jobs_enabled';
  if (kind === 'scholarship') return 'scholarships_enabled';
  return 'opportunities_enabled';
}

export function listingCanAppearPublic(input: {
  published: boolean;
  data: ListingData | null;
  flags: Record<string, boolean>;
  now?: Date;
}): boolean {
  if (!input.published || !input.data) return false;
  if (listingIsExpired(input.data, input.now)) return false;
  const specific = input.flags[listingFlagFor(input.data.kind)];
  const umbrella = input.flags.opportunities_enabled;
  return Boolean(specific || umbrella);
}

export const OPPORTUNITY_HUB_PATH = '/opportunity';
