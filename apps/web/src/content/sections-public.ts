import {
  PLATFORM_SECTIONS,
  applyFeatureFlags,
  applySectionOverrides,
  footerSections,
  homeSections,
  mobileSections,
  navSections,
  type PlatformSection,
} from '@alshafra/content';
import { loadContentSnapshot } from './load';

export function resolvedSections(): PlatformSection[] {
  const snap = loadContentSnapshot() as { sections?: PlatformSection[]; flags?: Record<string, boolean> } | null;
  const catalog = snap?.sections?.length
    ? applySectionOverrides(snap.sections, null)
    : applySectionOverrides(PLATFORM_SECTIONS, null);
  return applyFeatureFlags(catalog, snap?.flags ?? null);
}

export function publicNav() {
  return navSections(resolvedSections());
}

export function publicHome() {
  return homeSections(resolvedSections());
}

export function publicFooter() {
  return footerSections(resolvedSections());
}

export function publicMobile() {
  return mobileSections(resolvedSections());
}
