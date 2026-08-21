/** Defaults from Phase 0 §34 and Phase 1 §35. Do not enable community/social here. */

export interface FlagSeed {
  key: string;
  isEnabled: boolean;
  description: string;
}

export const FEATURE_FLAG_SEEDS: readonly FlagSeed[] = [
  { key: 'community_enabled', isEnabled: false, description: 'Questions/answers/comments' },
  { key: 'comments_enabled', isEnabled: false, description: 'Editorial comments' },
  { key: 'questions_enabled', isEnabled: false, description: 'Q&A' },
  { key: 'registration_enabled', isEnabled: false, description: 'Public sign-up' },
  { key: 'tools_enabled', isEnabled: true, description: 'Legacy tools' },
  { key: 'ai_enabled', isEnabled: false, description: 'AI content section' },
  { key: 'ai_assist_enabled', isEnabled: false, description: 'AI in CMS' },
  { key: 'jobs_enabled', isEnabled: false, description: 'Jobs board' },
  { key: 'scholarships_enabled', isEnabled: false, description: 'Scholarships' },
  { key: 'travel_enabled', isEnabled: false, description: 'New travel hub (does not 404 old URLs)' },
  { key: 'opportunities_enabled', isEnabled: false, description: 'Opportunities' },
  { key: 'comparisons_enabled', isEnabled: false, description: 'Comparisons' },
  { key: 'solutions_enabled', isEnabled: false, description: 'Solutions' },
  { key: 'social_auto_publish_enabled', isEnabled: false, description: 'Social auto-publish' },
  { key: 'notifications_enabled', isEnabled: false, description: 'Notification dispatch' },
  { key: 'advanced_search_enabled', isEnabled: false, description: 'Advanced search UI' },
  { key: 'ads_enabled', isEnabled: false, description: 'AdSense slots' },
  { key: 'analytics_ga_enabled', isEnabled: false, description: 'GA4 snippet' },
  { key: 'trends_enabled', isEnabled: true, description: 'Existing /trending' },
  { key: 'calendar_enabled', isEnabled: true, description: 'Calendar section — must stay on' },
  { key: 'seo.ugc_auto_index', isEnabled: false, description: 'Never auto-index UGC in v1' },
  { key: 'email_enabled', isEnabled: false, description: 'Transactional email' },
];

export function flagDefault(key: string): boolean {
  return FEATURE_FLAG_SEEDS.find((f) => f.key === key)?.isEnabled ?? false;
}
