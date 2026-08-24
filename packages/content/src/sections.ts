export interface PlatformNavChild {
  key: string;
  name: string;
  path: string;
  enabled: boolean;
  sort: number;
  lockedPath: boolean;
}

export interface PlatformSection {
  key: string;
  name: string;
  path: string;
  description: string;
  icon: string;
  enabled: boolean;
  showInNav: boolean;
  showInHome: boolean;
  showInFooter: boolean;
  showInMobile: boolean;
  featured: boolean;
  sort: number;
  children: PlatformNavChild[];
  featureFlag: string | null;
  hasPublicPage: boolean;
  lockedPath: boolean;
  system: boolean;
  seoTitle: string;
  seoDescription: string;
  parentKey: string | null;
}

export interface SectionChildOverride {
  key: string;
  name?: string;
  enabled?: boolean;
  sort?: number;
}

export interface SectionOverride {
  key: string;
  name?: string;
  description?: string;
  path?: string;
  icon?: string;
  enabled?: boolean;
  showInNav?: boolean;
  showInHome?: boolean;
  showInFooter?: boolean;
  showInMobile?: boolean;
  featured?: boolean;
  sort?: number;
  seoTitle?: string;
  seoDescription?: string;
  children?: SectionChildOverride[];
}

export interface SectionOverridesState {
  version: 1;
  sections: SectionOverride[];
}

export const SECTIONS_SETTING_KEY = 'platform.sections';

/** Phrases that must never appear in public UI copy. */
export const FORBIDDEN_PUBLIC_PHRASES = [
  'شركة عالمية',
  'الموقع السابق',
  'الموقع القديم',
  'الهوية القديمة',
  'تم تحويل الموقع',
  'لا مواقع متفرقة',
  'قسم داخلها',
  'التقويم كان موقعاً سابقاً',
  'التقويم كان موقعًا سابقًا',
  'صار قسماً',
  'صار قسمًا',
  'ليست هوية منفصلة',
  'لماذا تغيّر الشكل',
  'ما جلب الزيارات',
  'المسارات القديمة',
  'لم تُمس',
  'ثمانية أعمدة',
  'Feature flag',
  'Feature Flag',
  'Modular Monolith',
  'URL preservation',
  'SEO strategy',
  '127 URL',
  '127 URLs',
  'Phase 0',
  'Phase 1',
  'Phase 4',
  'Phase 5',
  'Legacy',
  'Migration',
  'Architecture',
  'Repository',
  'Monorepo',
  'Vite',
  'Astro',
  'Supabase',
  'Cloudflare',
  'Database',
] as const;

function child(
  key: string,
  name: string,
  path: string,
  sort: number,
  extra: Partial<PlatformNavChild> = {},
): PlatformNavChild {
  return { key, name, path, enabled: true, sort, lockedPath: true, ...extra };
}

function section(input: PlatformSection): PlatformSection {
  return input;
}

/**
 * Seed catalog. CMS overrides live in site_settings.platform.sections.
 * Disabled / no-page sections stay in architecture and stay off the public UI.
 */
export const PLATFORM_SECTIONS: readonly PlatformSection[] = [
  section({
    key: 'calendar',
    name: 'التقويم والمواعيد',
    path: '/calendar',
    description: 'التاريخ الهجري والميلادي، تحويل التاريخ، مواعيد الرواتب، التقويم الدراسي والإجازات.',
    icon: 'calendar',
    enabled: true,
    showInNav: true,
    showInHome: true,
    showInFooter: true,
    showInMobile: true,
    featured: true,
    sort: 10,
    featureFlag: 'calendar_enabled',
    hasPublicPage: true,
    lockedPath: true,
    system: true,
    seoTitle: 'التقويم والمواعيد',
    seoDescription: 'التاريخ الهجري والميلادي، تحويل التاريخ، مواعيد الرواتب، التقويم الدراسي والإجازات.',
    parentKey: null,
    children: [
      child('today', 'التاريخ اليوم', '/today', 10),
      child('converter', 'تحويل التاريخ', '/date-converter', 20),
      child('hijri', 'التقويم الهجري', '/hijri-calendar', 30),
      child('salaries', 'مواعيد الرواتب', '/salaries', 40),
      child('school', 'التقويم الدراسي', '/school-calendar', 50),
      child('holidays', 'الإجازات الرسمية', '/holidays', 60),
      child('countdown', 'كم باقي على…', '/countdown', 70),
    ],
  }),
  section({
    key: 'tools',
    name: 'الأدوات',
    path: '/tools',
    description: 'حاسبات ومحوّلات عربية للاستخدام اليومي: النسبة، الخصم، العمر، الذهب والدولار.',
    icon: 'tools',
    enabled: true,
    showInNav: true,
    showInHome: true,
    showInFooter: true,
    showInMobile: true,
    featured: true,
    sort: 20,
    featureFlag: 'tools_enabled',
    hasPublicPage: true,
    lockedPath: true,
    system: true,
    seoTitle: 'الأدوات',
    seoDescription: 'حاسبات ومحوّلات عربية للاستخدام اليومي.',
    parentKey: null,
    children: [
      child('percentage', 'النسبة المئوية', '/tool/percentage', 10, { lockedPath: true }),
      child('discount', 'حاسبة الخصم', '/tool/discount', 20, { lockedPath: true }),
      child('age', 'حاسبة العمر', '/age-calculator', 30),
      child('bmi', 'مؤشر الكتلة', '/tool/bmi', 40, { lockedPath: true }),
      child('gold', 'أسعار الذهب', '/gold-price', 50),
      child('usd', 'سعر الدولار', '/usd-rate', 60),
    ],
  }),
  section({
    key: 'guides',
    name: 'الأدلة',
    path: '/trending',
    description: 'شروحات عملية في المال والتقنية والتعليم والسفر.',
    icon: 'guides',
    enabled: true,
    showInNav: true,
    showInHome: true,
    showInFooter: true,
    showInMobile: true,
    featured: false,
    sort: 30,
    featureFlag: 'trends_enabled',
    hasPublicPage: true,
    lockedPath: true,
    system: true,
    seoTitle: 'الأدلة العملية',
    seoDescription: 'شروحات عملية في المال والتقنية والتعليم والسفر.',
    parentKey: null,
    children: [
      child('economy', 'الاقتصاد', '/trending/economy', 10),
      child('technology', 'التقنية', '/trending/technology', 20),
      child('education', 'التعليم', '/trending/education', 30),
      child('travel-guides', 'السفر', '/trending/travel', 40),
    ],
  }),
  section({
    key: 'articles',
    name: 'المقالات',
    path: '/articles',
    description: 'مقالات تحريرية عن المواعيد والتحويل والإجازات والرواتب.',
    icon: 'articles',
    enabled: true,
    showInNav: true,
    showInHome: true,
    showInFooter: true,
    showInMobile: true,
    featured: false,
    sort: 40,
    featureFlag: null,
    hasPublicPage: true,
    lockedPath: true,
    system: true,
    seoTitle: 'المقالات',
    seoDescription: 'مقالات تحريرية عن المواعيد والتحويل والإجازات والرواتب.',
    parentKey: null,
    children: [
      child('conversion', 'تحويل التاريخ', '/articles/hijri-to-gregorian-conversion', 10),
      child('salaries-article', 'مواعيد الرواتب', '/articles/salary-dates-saudi-arabia', 20),
      child('holidays-article', 'الإجازات الرسمية', '/articles/official-holidays-saudi-arabia', 30),
    ],
  }),
  section({
    key: 'news',
    name: 'الأخبار',
    path: '/update',
    description: 'تغطية تحريرية عند جاهزية المصادر.',
    icon: 'news',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 50,
    featureFlag: 'news_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'الأخبار',
    seoDescription: 'تغطية تحريرية عند جاهزية المصادر.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'solutions',
    name: 'الحلول',
    path: '/solution',
    description: 'حلول عملية لمشكلات يومية.',
    icon: 'solutions',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 60,
    featureFlag: 'solutions_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'الحلول',
    seoDescription: 'حلول عملية لمشكلات يومية.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'opportunities',
    name: 'الفرص',
    path: '/opportunity',
    description: 'وظائف ومنح وتدريب.',
    icon: 'opportunities',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 70,
    featureFlag: 'opportunities_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'الفرص',
    seoDescription: 'وظائف ومنح وتدريب.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'apps',
    name: 'التطبيقات',
    path: '/apps',
    description: 'أدلة تطبيقات وخدمات رقمية.',
    icon: 'apps',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 80,
    featureFlag: 'apps_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'التطبيقات',
    seoDescription: 'أدلة تطبيقات وخدمات رقمية.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'ai',
    name: 'الذكاء الاصطناعي',
    path: '/ai',
    description: 'أدوات وشروحات الذكاء الاصطناعي.',
    icon: 'ai',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 90,
    featureFlag: 'ai_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'الذكاء الاصطناعي',
    seoDescription: 'أدوات وشروحات الذكاء الاصطناعي.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'travel',
    name: 'السفر',
    path: '/travel',
    description: 'وجهات وأدلة سفر.',
    icon: 'travel',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 100,
    featureFlag: 'travel_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'السفر',
    seoDescription: 'وجهات وأدلة سفر.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'comparisons',
    name: 'المقارنات',
    path: '/compare',
    description: 'مقارنة منتجات وخدمات.',
    icon: 'comparisons',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 110,
    featureFlag: 'comparisons_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'المقارنات',
    seoDescription: 'مقارنة منتجات وخدمات.',
    parentKey: null,
    children: [],
  }),
  section({
    key: 'community',
    name: 'المجتمع',
    path: '/question',
    description: 'أسئلة وإجابات.',
    icon: 'community',
    enabled: false,
    showInNav: false,
    showInHome: false,
    showInFooter: false,
    showInMobile: false,
    featured: false,
    sort: 120,
    featureFlag: 'community_enabled',
    hasPublicPage: false,
    lockedPath: true,
    system: true,
    seoTitle: 'المجتمع',
    seoDescription: 'أسئلة وإجابات.',
    parentKey: null,
    children: [],
  }),
];

export const SECTIONS_CONTRACT = {
  nameOpensHub: true,
  arrowOpensChildren: true,
  publicActivation: 'snapshot_then_build',
  cannotChangeLockedPaths: true,
  cannotEnableWithoutPublicPage: true,
  systemSectionsCannotBeDeleted: true,
  settingKey: SECTIONS_SETTING_KEY,
} as const;

/**
 * Four independent facts. Do not store a single collapsed boolean.
 * Missing flag keys do not hide beachhead sections (calendar/tools/guides).
 */
export const SECTION_VISIBILITY_CONTRACT = {
  sectionEnabled: 'CMS/catalog enabled',
  flagEnabled: 'feature_flags[section.featureFlag]; missing key = allow',
  publicPageAvailable: 'hasPublicPage in code',
  navigationVisible: 'sectionEnabled && flagEnabled && publicPageAvailable && showInNav',
  legacyUrlsImmune: true,
} as const;

export function flagAllowsSection(
  section: Pick<PlatformSection, 'featureFlag'>,
  flags: Record<string, boolean> | null | undefined,
): boolean {
  if (!section.featureFlag) return true;
  if (!flags || !(section.featureFlag in flags)) return true;
  return flags[section.featureFlag] === true;
}

export function sectionVisibility(
  section: PlatformSection,
  flags: Record<string, boolean> | null | undefined,
): {
  sectionEnabled: boolean;
  flagEnabled: boolean;
  publicPageAvailable: boolean;
  navigationVisible: boolean;
  homeVisible: boolean;
  footerVisible: boolean;
} {
  const flagEnabled = flagAllowsSection(section, flags);
  const sectionEnabled = section.enabled;
  const publicPageAvailable = section.hasPublicPage;
  const publiclyOn = sectionEnabled && flagEnabled && publicPageAvailable;
  return {
    sectionEnabled,
    flagEnabled,
    publicPageAvailable,
    navigationVisible: publiclyOn && section.showInNav,
    homeVisible: publiclyOn && section.showInHome,
    footerVisible: publiclyOn && section.showInFooter,
  };
}

/** Public surfaces only. Does not rewrite CMS catalog enabled. */
export function applyFeatureFlags(
  list: readonly PlatformSection[],
  flags: Record<string, boolean> | null | undefined,
): PlatformSection[] {
  return cloneSections(list).map((section) => ({
    ...section,
    enabled: section.enabled && flagAllowsSection(section, flags),
  }));
}

const RESERVED_SECTION_PATHS = ['/category', '/languages', '/news', '/admin', '/api', '/preview'];

export function cloneSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return list.map((sectionItem) => ({
    ...sectionItem,
    children: sectionItem.children.map((item) => ({ ...item })).sort((a, b) => a.sort - b.sort),
  }));
}

export function findLeakedPublicPhrase(text: string): string | null {
  for (const phrase of FORBIDDEN_PUBLIC_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

export function assertNoPublicLeak(text: string, source = 'copy'): void {
  const hit = findLeakedPublicPhrase(text);
  if (hit) throw new Error(`${source} leaks “${hit}”`);
}

export function applySectionOverrides(
  base: readonly PlatformSection[] = PLATFORM_SECTIONS,
  state: SectionOverridesState | null | undefined,
): PlatformSection[] {
  const list = cloneSections(base);
  if (!state?.sections?.length) return list.sort((a, b) => a.sort - b.sort);

  const byKey = new Map(list.map((item) => [item.key, item]));
  for (const override of state.sections) {
    if (!override?.key) continue;
    const existing = byKey.get(override.key);
    if (!existing) {
      if (!override.name || !override.path) continue;
      const created: PlatformSection = {
        key: override.key,
        name: override.name,
        path: override.path,
        description: override.description ?? '',
        icon: override.icon ?? 'section',
        enabled: false,
        showInNav: override.showInNav ?? false,
        showInHome: override.showInHome ?? false,
        showInFooter: override.showInFooter ?? false,
        showInMobile: override.showInMobile ?? false,
        featured: override.featured ?? false,
        sort: override.sort ?? 500,
        children: [],
        featureFlag: null,
        hasPublicPage: false,
        lockedPath: false,
        system: false,
        seoTitle: override.seoTitle ?? override.name,
        seoDescription: override.seoDescription ?? override.description ?? '',
        parentKey: null,
      };
      list.push(created);
      byKey.set(created.key, created);
      continue;
    }

    if (override.name != null) existing.name = override.name;
    if (override.description != null) existing.description = override.description;
    if (override.icon != null) existing.icon = override.icon;
    if (override.seoTitle != null) existing.seoTitle = override.seoTitle;
    if (override.seoDescription != null) existing.seoDescription = override.seoDescription;
    if (override.sort != null) existing.sort = override.sort;
    if (override.showInNav != null) existing.showInNav = override.showInNav;
    if (override.showInHome != null) existing.showInHome = override.showInHome;
    if (override.showInFooter != null) existing.showInFooter = override.showInFooter;
    if (override.showInMobile != null) existing.showInMobile = override.showInMobile;
    if (override.featured != null) existing.featured = override.featured;
    if (override.enabled != null) {
      existing.enabled = existing.hasPublicPage ? override.enabled : false;
    }
    if (override.path != null && override.path !== existing.path && !existing.lockedPath) {
      existing.path = override.path;
    }
    if (override.children?.length) {
      for (const childOverride of override.children) {
        const childItem = existing.children.find((item) => item.key === childOverride.key);
        if (!childItem) continue;
        if (childOverride.name != null) childItem.name = childOverride.name;
        if (childOverride.enabled != null) childItem.enabled = childOverride.enabled;
        if (childOverride.sort != null) childItem.sort = childOverride.sort;
      }
      existing.children.sort((a, b) => a.sort - b.sort);
    }
  }
  return list.sort((a, b) => a.sort - b.sort);
}

export function publicSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return cloneSections(list)
    .filter((item) => item.enabled && item.hasPublicPage)
    .map((item) => ({
      ...item,
      children: item.children.filter((childItem) => childItem.enabled).sort((a, b) => a.sort - b.sort),
    }))
    .sort((a, b) => a.sort - b.sort);
}

export function navSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return publicSections(list).filter((item) => item.showInNav);
}

export function homeSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return publicSections(list).filter((item) => item.showInHome);
}

export function footerSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return publicSections(list).filter((item) => item.showInFooter);
}

export function mobileSections(list: readonly PlatformSection[] = PLATFORM_SECTIONS): PlatformSection[] {
  return publicSections(list).filter((item) => item.showInMobile);
}

export function parseSectionOverrides(value: unknown): SectionOverridesState | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { version?: unknown; sections?: unknown };
  if (!Array.isArray(record.sections)) return null;
  return { version: 1, sections: record.sections as SectionOverride[] };
}

export function validateSectionPath(path: string): { ok: true } | { ok: false; error: string } {
  if (!path.startsWith('/') || path.includes('//') || path.endsWith('/') && path !== '/') {
    return { ok: false, error: 'invalid_path' };
  }
  if (RESERVED_SECTION_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return { ok: false, error: 'reserved_path' };
  }
  return { ok: true };
}

export function assertSectionMutation(
  current: PlatformSection | undefined,
  patch: SectionOverride,
  options: { creating?: boolean } = {},
): void {
  if (!current && !options.creating) throw new Error('section_not_found');
  if (!current) {
    if (!patch.key || !patch.name || !patch.path) throw new Error('section_incomplete');
    const pathCheck = validateSectionPath(patch.path);
    if (!pathCheck.ok) throw new Error(pathCheck.error);
    if (PLATFORM_SECTIONS.some((item) => item.path === patch.path || item.key === patch.key)) {
      throw new Error('section_conflict');
    }
    if (patch.enabled) throw new Error('section_has_no_public_page');
    return;
  }
  if (patch.path && patch.path !== current.path && current.lockedPath) {
    throw new Error('locked_path');
  }
  if (patch.path && patch.path !== current.path) {
    const pathCheck = validateSectionPath(patch.path);
    if (!pathCheck.ok) throw new Error(pathCheck.error);
  }
  if (patch.enabled && !current.hasPublicPage) {
    throw new Error('section_has_no_public_page');
  }
  const name = patch.name ?? current.name;
  const description = patch.description ?? current.description;
  assertNoPublicLeak(name, `section:${current.key}.name`);
  assertNoPublicLeak(description, `section:${current.key}.description`);
}
