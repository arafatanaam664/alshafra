import type { SqlClient } from '@alshafra/database';
import {
  PLATFORM_SECTIONS,
  SECTION_VISIBILITY_CONTRACT,
  SECTIONS_CONTRACT,
  SECTIONS_SETTING_KEY,
  applySectionOverrides,
  assertSectionMutation,
  parseSectionOverrides,
  sectionVisibility,
  type PlatformSection,
  type SectionOverride,
  type SectionOverridesState,
} from '@alshafra/content';
import { writeAudit } from './audit';
import { flagMap } from './flags-settings';
import { hasPermission, requirePermission, type Actor } from './permissions';

function requireSectionsRead(actor: Actor | null) {
  if (hasPermission(actor, 'documents.read') || hasPermission(actor, 'settings.read') || hasPermission(actor, 'settings.write')) {
    return;
  }
  requirePermission(actor, 'documents.read');
}

export { SECTIONS_SETTING_KEY, SECTIONS_CONTRACT };

async function readOverrides(db: SqlClient): Promise<SectionOverridesState> {
  const rows = await db.query<{ value_json: unknown }>(
    `SELECT value_json FROM site_settings WHERE key = $1`,
    [SECTIONS_SETTING_KEY],
  );
  return parseSectionOverrides(rows.rows[0]?.value_json) ?? { version: 1, sections: [] };
}

async function writeOverrides(db: SqlClient, actor: Actor, state: SectionOverridesState): Promise<void> {
  await db.query(
    `INSERT INTO site_settings (key, value_json, updated_by) VALUES ($1,$2::jsonb,$3)
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_by = EXCLUDED.updated_by`,
    [SECTIONS_SETTING_KEY, JSON.stringify(state), actor.userId],
  );
}

export async function listResolvedSections(db: SqlClient): Promise<PlatformSection[]> {
  return applySectionOverrides(PLATFORM_SECTIONS, await readOverrides(db));
}

export async function getSectionsCatalog(db: SqlClient, actor: Actor | null) {
  requireSectionsRead(actor);
  const overrides = await readOverrides(db);
  const sections = applySectionOverrides(PLATFORM_SECTIONS, overrides);
  return {
    sections,
    defaults: PLATFORM_SECTIONS,
    overrides,
    contract: SECTIONS_CONTRACT,
    note: 'الظهور العام يتحدث بعد تصدير اللقطة ثم بناء الموقع. المسارات المقفلة لا تتغير.',
  };
}

export async function getNavigationCatalog(db: SqlClient, actor: Actor | null) {
  requireSectionsRead(actor);
  const sections = await listResolvedSections(db);
  const flags = await flagMap(db);
  return {
    contract: {
      nameOpensHub: true,
      arrowOpensChildren: true,
      visibility: SECTION_VISIBILITY_CONTRACT,
    },
    items: sections.map((section) => {
      const visibility = sectionVisibility(section, flags);
      return {
        key: section.key,
        name: section.name,
        path: section.path,
        enabled: section.enabled,
        showInNav: section.showInNav,
        showInHome: section.showInHome,
        showInFooter: section.showInFooter,
        showInMobile: section.showInMobile,
        hasPublicPage: section.hasPublicPage,
        sort: section.sort,
        visibleToUsers: visibility.navigationVisible,
        visibility,
        children: section.children.map((child) => ({
          key: child.key,
          name: child.name,
          path: child.path,
          enabled: child.enabled,
          sort: child.sort,
        })),
      };
    }),
  };
}

function upsertOverride(state: SectionOverridesState, patch: SectionOverride): SectionOverridesState {
  const sections = state.sections.filter((item) => item.key !== patch.key);
  const previous = state.sections.find((item) => item.key === patch.key) ?? { key: patch.key };
  sections.push({ ...previous, ...patch, key: patch.key });
  return { version: 1, sections };
}

export async function patchSection(db: SqlClient, actor: Actor, key: string, patch: SectionOverride) {
  requirePermission(actor, 'settings.write');
  const currentList = await listResolvedSections(db);
  const current = currentList.find((item) => item.key === key);
  assertSectionMutation(current, { ...patch, key }, { creating: false });
  const next = upsertOverride(await readOverrides(db), { ...patch, key });
  await writeOverrides(db, actor, next);
  await writeAudit(db, actor, 'settings.write', 'platform_section', null, { key }, { key, patch });
  return applySectionOverrides(PLATFORM_SECTIONS, next).find((item) => item.key === key);
}

export async function createSection(db: SqlClient, actor: Actor, patch: SectionOverride) {
  requirePermission(actor, 'settings.write');
  assertSectionMutation(undefined, patch, { creating: true });
  const existing = (await listResolvedSections(db)).find((item) => item.key === patch.key);
  if (existing) throw new Error('section_conflict');
  const next = upsertOverride(await readOverrides(db), {
    ...patch,
    enabled: false,
    showInNav: patch.showInNav ?? false,
    showInHome: patch.showInHome ?? false,
    showInFooter: patch.showInFooter ?? false,
  });
  await writeOverrides(db, actor, next);
  await writeAudit(db, actor, 'settings.write', 'platform_section', null, null, { created: patch.key });
  return applySectionOverrides(PLATFORM_SECTIONS, next).find((item) => item.key === patch.key);
}

export async function reorderSections(db: SqlClient, actor: Actor, keys: string[]) {
  requirePermission(actor, 'settings.write');
  if (!Array.isArray(keys) || keys.length === 0) throw new Error('invalid_order');
  const current = await listResolvedSections(db);
  const known = new Set(current.map((item) => item.key));
  if (keys.some((key) => !known.has(key))) throw new Error('unknown_section');
  let state = await readOverrides(db);
  keys.forEach((key, index) => {
    state = upsertOverride(state, { key, sort: (index + 1) * 10 });
  });
  await writeOverrides(db, actor, state);
  await writeAudit(db, actor, 'settings.write', 'platform_section', null, null, { reorder: keys });
  return applySectionOverrides(PLATFORM_SECTIONS, state);
}

export async function patchNavigation(
  db: SqlClient,
  actor: Actor,
  items: { key: string; showInNav?: boolean; showInHome?: boolean; showInFooter?: boolean; showInMobile?: boolean; sort?: number }[],
) {
  requirePermission(actor, 'settings.write');
  let state = await readOverrides(db);
  for (const item of items) {
    if (!item.key) continue;
    state = upsertOverride(state, item);
  }
  await writeOverrides(db, actor, state);
  await writeAudit(db, actor, 'settings.write', 'platform_navigation', null, null, { keys: items.map((item) => item.key) });
  return getNavigationCatalog(db, actor);
}
