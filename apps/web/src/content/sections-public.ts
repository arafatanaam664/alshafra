import {
  PLATFORM_SECTIONS,
  applySectionOverrides,
  footerSections,
  homeSections,
  mobileSections,
  navSections,
  type PlatformSection,
} from '@alshafra/content';
import { loadContentSnapshot } from './load';

export function resolvedSections(): PlatformSection[] {
  const snap = loadContentSnapshot() as { sections?: PlatformSection[] } | null;
  if (snap?.sections?.length) return applySectionOverrides(snap.sections, null);
  return applySectionOverrides(PLATFORM_SECTIONS, null);
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
