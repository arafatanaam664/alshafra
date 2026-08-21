import { systemId } from '@alshafra/kernel';
import { FEATURE_FLAG_SEEDS } from './flags';
import type { SqlClient } from './sql';

export const IDS = {
  roleUser: systemId(0x101),
  roleTrusted: systemId(0x102),
  roleModerator: systemId(0x103),
  roleEditor: systemId(0x104),
  roleSeo: systemId(0x105),
  roleSocial: systemId(0x106),
  roleAnalyst: systemId(0x107),
  roleAdmin: systemId(0x108),
  roleSuper: systemId(0x109),
  roleAuthor: systemId(0x10a),
  authorAlshafra: systemId(0x201),
  catHome: systemId(0x301),
  catCalendar: systemId(0x302),
  catSalaries: systemId(0x303),
  catHolidays: systemId(0x304),
  catTools: systemId(0x305),
  catSupport: systemId(0x306),
  catTrending: systemId(0x307),
  catGold: systemId(0x308),
  catUsd: systemId(0x309),
  catLegal: systemId(0x310),
  catCountdown: systemId(0x311),
  catArticles: systemId(0x312),
  toolCatCalendar: systemId(0x401),
  toolCatMarket: systemId(0x402),
  toolCatText: systemId(0x403),
};

const ROLES: [string, string, string][] = [
  [IDS.roleUser, 'user', 'User'],
  [IDS.roleTrusted, 'trusted_user', 'Trusted User'],
  [IDS.roleModerator, 'moderator', 'Moderator'],
  [IDS.roleEditor, 'editor', 'Editor'],
  [IDS.roleSeo, 'seo_manager', 'SEO Manager'],
  [IDS.roleSocial, 'social_manager', 'Social Manager'],
  [IDS.roleAnalyst, 'analyst', 'Analyst'],
  [IDS.roleAdmin, 'admin', 'Admin'],
  [IDS.roleSuper, 'super_admin', 'Super Admin'],
  [IDS.roleAuthor, 'author', 'Author'],
];

const PERMISSIONS: [string, string, string][] = [
  ['documents.create', 'content', 'Create editorial drafts'],
  ['documents.read_draft', 'content', 'Read unpublished documents'],
  ['documents.publish', 'content', 'Publish / unpublish'],
  ['documents.seo_edit', 'seo', 'Edit SEO on published pages'],
  ['documents.restore', 'content', 'Restore revisions'],
  ['seo.redirects_manage', 'seo', 'Manage redirects and 410'],
  ['seo.force_index_ugc', 'seo', 'Force-index UGC'],
  ['seo.edit_high_intent', 'seo', 'Edit HIGH-intent titles'],
  ['media.upload', 'media', 'Upload editorial media'],
  ['social.connect', 'social', 'Connect social accounts'],
  ['social.publish', 'social', 'Approve social jobs'],
  ['automation.edit', 'automation', 'Edit automation rules'],
  ['flags.toggle', 'flags', 'Toggle feature flags'],
  ['settings.write', 'settings', 'Edit site settings'],
  ['users.roles_grant', 'users', 'Grant roles'],
  ['audit.read', 'audit', 'Read audit logs'],
  ['moderation.handle', 'moderation', 'Handle reports'],
  ['analytics.read', 'analytics', 'Read analytics'],
  ['community.bypass_new_user', 'community', 'Bypass new-user limits'],
  ['documents.read', 'content', 'List/read documents in admin'],
  ['documents.update', 'content', 'Update document body'],
  ['documents.delete', 'content', 'Soft-delete documents'],
  ['taxonomy.read', 'taxonomy', 'Read taxonomy'],
  ['taxonomy.create', 'taxonomy', 'Create taxonomy'],
  ['taxonomy.update', 'taxonomy', 'Update taxonomy'],
  ['taxonomy.delete', 'taxonomy', 'Delete taxonomy'],
  ['media.read', 'media', 'Read media library'],
  ['media.delete', 'media', 'Delete media metadata'],
  ['flags.read', 'flags', 'Read feature flags'],
  ['settings.read', 'settings', 'Read site settings'],
  ['users.read', 'users', 'List users'],
  ['roles.read', 'users', 'List roles'],
  ['health.read', 'system', 'System health'],
];

const ROLE_PERMS: Record<string, string[]> = {
  [IDS.roleAuthor]: [
    'documents.read',
    'documents.read_draft',
    'documents.create',
    'documents.update',
  ],
  [IDS.roleEditor]: [
    'documents.read',
    'documents.create',
    'documents.read_draft',
    'documents.update',
    'documents.publish',
    'documents.restore',
    'media.upload',
    'media.read',
    'taxonomy.read',
    'taxonomy.create',
    'taxonomy.update',
    'health.read',
  ],
  [IDS.roleSeo]: [
    'documents.read',
    'documents.read_draft',
    'documents.seo_edit',
    'seo.redirects_manage',
    'seo.edit_high_intent',
    'analytics.read',
    'settings.read',
  ],
  [IDS.roleSocial]: ['social.connect', 'social.publish', 'automation.edit', 'media.upload', 'media.read'],
  [IDS.roleAnalyst]: ['analytics.read', 'health.read', 'documents.read'],
  [IDS.roleModerator]: ['moderation.handle', 'audit.read', 'community.bypass_new_user'],
  [IDS.roleAdmin]: [
    'documents.create',
    'documents.read_draft',
    'documents.publish',
    'documents.seo_edit',
    'documents.restore',
    'seo.redirects_manage',
    'media.upload',
    'social.connect',
    'social.publish',
    'automation.edit',
    'flags.toggle',
    'settings.write',
    'audit.read',
    'moderation.handle',
    'analytics.read',
  ],
  [IDS.roleSuper]: [
    'documents.create',
    'documents.read_draft',
    'documents.publish',
    'documents.seo_edit',
    'documents.restore',
    'seo.redirects_manage',
    'seo.force_index_ugc',
    'seo.edit_high_intent',
    'media.upload',
    'social.connect',
    'social.publish',
    'automation.edit',
    'flags.toggle',
    'settings.write',
    'users.roles_grant',
    'audit.read',
    'moderation.handle',
    'analytics.read',
    'community.bypass_new_user',
  ],
};

const CONTENT_TYPES: [string, string, string][] = [
  ['article', 'مقالة', 'Editorial article'],
  ['guide', 'دليل', 'Practical guide'],
  ['solution', 'حل', 'How-to solution'],
  ['news', 'خبر', 'News item'],
  ['trend', 'ترند', 'Trend snapshot'],
  ['faq_page', 'أسئلة شائعة', 'FAQ page'],
  ['comparison', 'مقارنة', 'Comparison'],
  ['opportunity', 'فرصة', 'Opportunity'],
  ['job', 'وظيفة', 'Job listing'],
  ['scholarship', 'منحة', 'Scholarship'],
  ['tool_page', 'صفحة أداة', 'Tool landing page'],
  ['calendar_content', 'محتوى تقويم', 'Calendar/salary/holiday page'],
  ['service_info', 'صفحة تعريفية', 'About/contact'],
  ['collection', 'مجموعة', 'Hub / index'],
  ['legal', 'قانوني', 'Legal page'],
];

const CATEGORIES: [string, string, string, string | null, string | null, number][] = [
  [IDS.catHome, 'home', 'الرئيسية', '/', null, 0],
  [IDS.catCalendar, 'calendar', 'التقويم', '/hijri-calendar', null, 10],
  [IDS.catSalaries, 'salaries', 'الرواتب', '/salaries', null, 20],
  [IDS.catHolidays, 'holidays', 'الإجازات', '/holidays', null, 30],
  [IDS.catTools, 'tools', 'الأدوات', '/date-converter', null, 40],
  [IDS.catSupport, 'support', 'الدعم', null, null, 50],
  [IDS.catTrending, 'trending', 'الأدلة العملية', '/trending', null, 60],
  [IDS.catGold, 'gold', 'الذهب', '/gold-price', null, 70],
  [IDS.catUsd, 'usd', 'الدولار', '/usd-rate', null, 80],
  [IDS.catLegal, 'legal', 'قانوني', '/privacy', null, 90],
  [IDS.catCountdown, 'countdown', 'العدّادات', '/countdown', null, 100],
  [IDS.catArticles, 'articles', 'المقالات', '/articles', null, 15],
];

const TOPICS: [string, string][] = [
  ['saudi-calendar', 'التقويم السعودي'],
  ['umm-al-qura', 'تقويم أم القرى'],
  ['salaries', 'الرواتب والدعم'],
  ['holidays', 'الإجازات الرسمية'],
  ['school', 'التقويم الدراسي'],
  ['gold', 'أسعار الذهب'],
  ['usd', 'سعر الدولار'],
];

const ENTITIES: [string, string, string][] = [
  ['saudi-arabia', 'المملكة العربية السعودية', 'place'],
  ['umm-al-qura', 'تقويم أم القرى', 'org'],
  ['ministry-of-finance', 'وزارة المالية', 'org'],
  ['ministry-of-education', 'وزارة التعليم', 'org'],
  ['gosi', 'التأمينات الاجتماعية', 'org'],
  ['citizen-account', 'حساب المواطن', 'program'],
  ['gold', 'الذهب', 'product'],
  ['usd', 'الدولار الأمريكي', 'product'],
];

const REDIRECTS: [string, string | null, number, string][] = [
  ['/category/*', null, 410, 'Retired catalog identity'],
  ['/languages/*', null, 410, 'Unpublished i18n hubs'],
  ['/news/*', null, 410, 'Retired news prefix'],
  ['/index.html', '/', 301, 'Canonical homepage'],
];

const SETTINGS: [string, unknown][] = [
  ['site.name', 'Alshafra'],
  ['site.tagline', 'منصة عربية للمعلومات العملية والأدوات'],
  ['site.locale', 'ar'],
  ['site.timezone', 'Asia/Riyadh'],
  ['site.contact_email', 'info@alshafra.com'],
  ['seo.site_url', 'https://alshafra.com'],
  ['seo.min_unique_words', 800],
  ['seo.ugc_auto_index', false],
  ['ads.client', ''],
];

async function upsert(
  client: SqlClient,
  table: string,
  conflict: string,
  columns: string[],
  values: unknown[],
): Promise<void> {
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const updates = columns
    .filter((c) => c !== conflict && c !== 'id')
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');
  const sql = updates
    ? `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates}`
    : `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (${conflict}) DO NOTHING`;
  await client.query(sql, values);
}

export async function seedDatabase(client: SqlClient): Promise<{ roles: number; flags: number; redirects: number }> {
  for (const [id, key, name] of ROLES) {
    await upsert(client, 'roles', 'key', ['id', 'key', 'name', 'is_system'], [id, key, name, true]);
  }

  for (const [key, module, description] of PERMISSIONS) {
    const existing = await client.query<{ id: string }>('SELECT id FROM permissions WHERE key = $1', [key]);
    const id = existing.rows[0]?.id ?? systemId(0x500 + PERMISSIONS.findIndex((p) => p[0] === key));
    await client.query(
      `INSERT INTO permissions (id, key, module, description) VALUES ($1,$2,$3,$4)
       ON CONFLICT (key) DO UPDATE SET module = EXCLUDED.module, description = EXCLUDED.description`,
      [id, key, module, description],
    );
  }

  const permRows = await client.query<{ id: string; key: string }>('SELECT id, key FROM permissions');
  const permByKey = Object.fromEntries(permRows.rows.map((r) => [r.key, r.id]));

  for (const [roleId, keys] of Object.entries(ROLE_PERMS)) {
    for (const key of keys) {
      const pid = permByKey[key];
      if (!pid) continue;
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [roleId, pid],
      );
    }
  }

  for (const [key, name, description] of CONTENT_TYPES) {
    await client.query(
      `INSERT INTO content_types (key, name, description, is_editorial) VALUES ($1,$2,$3,true)
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [key, name, description],
    );
  }

  for (const [id, key, name, path, parent, sort] of CATEGORIES) {
    await client.query(
      `INSERT INTO categories (id, key, name, slug, path, parent_id, sort_order, is_published, status)
       VALUES ($1,$2,$3,$2,$4,$5,$6,true,'active')
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, path = EXCLUDED.path, sort_order = EXCLUDED.sort_order`,
      [id, key, name, path, parent, sort],
    );
  }

  for (const [key, name] of TOPICS) {
    await client.query(
      `INSERT INTO topics (id, key, name) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name`,
      [systemId(0x600 + TOPICS.findIndex((t) => t[0] === key)), key, name],
    );
  }

  for (const [key, name, kind] of ENTITIES) {
    await client.query(
      `INSERT INTO entities (id, key, name, kind) VALUES ($1,$2,$3,$4::entity_kind)
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, kind = EXCLUDED.kind`,
      [systemId(0x700 + ENTITIES.findIndex((e) => e[0] === key)), key, name, kind],
    );
  }

  await client.query(
    `INSERT INTO authors (id, name, slug, is_organization, bio, expertise)
     VALUES ($1,'Alshafra','alshafra',true,'المنصة التحريرية لـ Alshafra','التقويم، المواعيد، الأدوات')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio`,
    [IDS.authorAlshafra],
  );

  for (const [id, key, name] of [
    [IDS.toolCatCalendar, 'calendar', 'التقويم'],
    [IDS.toolCatMarket, 'market', 'الأسواق'],
    [IDS.toolCatText, 'text', 'نصوص'],
  ] as const) {
    await client.query(
      `INSERT INTO tool_categories (id, key, name) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name`,
      [id, key, name],
    );
  }

  const programs: [string, string, number, string, string][] = [
    ['employee-salaries', 'رواتب الموظفين الحكوميين', 27, 'وزارة المالية', 'https://www.mof.gov.sa/mediacenter/Payroll/Pages/default.aspx'],
    ['citizen-account', 'حساب المواطن', 10, 'بوابة حساب المواطن', 'https://ca.gov.sa/'],
    ['retiree-salaries', 'رواتب المتقاعدين', 1, 'التأمينات الاجتماعية', 'https://www.gosi.gov.sa/'],
    ['social-security', 'الضمان الاجتماعي المطوّر', 1, 'وزارة الموارد البشرية', 'https://hrsd.gov.sa/'],
    ['housing-support', 'الدعم السكني', 24, 'منصة سكني', 'https://sakani.sa/'],
  ];
  for (const [key, title, day, label, url] of programs) {
    await client.query(
      `INSERT INTO calendar_programs (id, key, title, day_of_month, weekend_rule, source_label, source_url)
       VALUES ($1,$2,$3,$4,true,$5,$6)
       ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, day_of_month = EXCLUDED.day_of_month`,
      [systemId(0x800 + programs.findIndex((p) => p[0] === key)), key, title, day, label, url],
    );
  }

  for (const flag of FEATURE_FLAG_SEEDS) {
    await client.query(
      `INSERT INTO feature_flags (id, key, is_enabled, description, environment, rollout_percent)
       VALUES ($1,$2,$3,$4,'all',100)
       ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description`,
      [systemId(0x900 + FEATURE_FLAG_SEEDS.findIndex((f) => f.key === flag.key)), flag.key, flag.isEnabled, flag.description],
    );
  }

  for (const [key, value] of SETTINGS) {
    await client.query(
      `INSERT INTO site_settings (key, value_json) VALUES ($1,$2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json`,
      [key, JSON.stringify(value)],
    );
  }

  for (const [pattern, dest, code, reason] of REDIRECTS) {
    await client.query(
      `INSERT INTO redirects (id, source_pattern, destination, status_code, reason, is_enabled)
       VALUES ($1,$2,$3,$4,$5,true)
       ON CONFLICT (source_pattern) DO UPDATE SET destination = EXCLUDED.destination, status_code = EXCLUDED.status_code, reason = EXCLUDED.reason`,
      [systemId(0xa00 + REDIRECTS.findIndex((r) => r[0] === pattern)), pattern, dest, code, reason],
    );
  }

  await client.query(
    `INSERT INTO ad_slots (id, key, adsense_slot_id) VALUES ($1,'in_article',NULL)
     ON CONFLICT (key) DO NOTHING`,
    [systemId(0xb01)],
  );

  await client.query(
    `INSERT INTO search_synonyms (id, term, synonym, locale) VALUES
      ($1,'ام القرى','أم القرى','ar'),
      ($2,'ام القرى','umm al qura','ar'),
      ($3,'هجري','هجرى','ar'),
      ($4,'واتساب','whatsapp','ar'),
      ($5,'راتب','رواتب','ar')
     ON CONFLICT DO NOTHING`,
    [systemId(0xc01), systemId(0xc02), systemId(0xc03), systemId(0xc04), systemId(0xc05)],
  );

  return { roles: ROLES.length, flags: FEATURE_FLAG_SEEDS.length, redirects: REDIRECTS.length };
}
