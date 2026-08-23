import {
  FORBIDDEN_PUBLIC_PHRASES,
  PLATFORM_SECTIONS,
  applySectionOverrides,
  assertSectionMutation,
  findLeakedPublicPhrase,
  footerSections,
  homeSections,
  navSections,
  publicSections,
} from '@alshafra/content';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const files = [
  'apps/web/src/components/HomePlatform.astro',
  'apps/web/src/components/Header.astro',
  'apps/web/src/components/Footer.astro',
  'apps/web/src/content/provider.ts',
  'apps/web/src/pages/index.astro',
];

function publicFacingText(file: string, source: string): string {
  if (file.endsWith('.astro')) {
    const parts = source.split('---');
    return parts.slice(2).join('---');
  }
  return [...source.matchAll(/['"`]([^'"`]{8,})['"`]/g)]
    .map((match) => match[1])
    .filter((value) => /[\u0600-\u06FF]/.test(value))
    .join('\n');
}

for (const file of files) {
  const text = publicFacingText(file, readFileSync(join(process.cwd(), file), 'utf8'));
  const hit = findLeakedPublicPhrase(text);
  if (hit) fail(`${file} leaks “${hit}”`);
}

const nav = navSections();
if (nav.some((section) => !section.enabled || !section.hasPublicPage)) fail('disabled section in public nav');
if (!nav.some((section) => section.path === '/calendar')) fail('calendar section missing');
if (!nav.some((section) => section.path === '/tools')) fail('tools section missing');
if (nav.some((section) => section.key === 'opportunities' || section.key === 'community')) {
  fail('future sections must stay off public nav');
}
if (PLATFORM_SECTIONS.find((section) => section.key === 'opportunities')?.enabled) {
  fail('opportunities must stay disabled');
}
if (PLATFORM_SECTIONS.find((section) => section.key === 'news')?.hasPublicPage) {
  fail('news must not have a public page yet');
}

const home = homeSections();
if (home.length < 3) fail('home sections too few');
if (home.some((section) => section.children.some((child) => !child.path.startsWith('/')))) fail('bad child path');
if (footerSections().some((section) => !section.enabled)) fail('disabled footer section');

const hidden = applySectionOverrides(PLATFORM_SECTIONS, {
  version: 1,
  sections: [{ key: 'tools', enabled: false, showInNav: false }],
});
if (navSections(hidden).some((section) => section.key === 'tools')) fail('override did not hide tools');

const blocked = applySectionOverrides(PLATFORM_SECTIONS, {
  version: 1,
  sections: [{ key: 'opportunities', enabled: true, showInNav: true }],
});
if (publicSections(blocked).some((section) => section.key === 'opportunities')) {
  fail('section without public page must not become public');
}

try {
  assertSectionMutation(
    PLATFORM_SECTIONS.find((section) => section.key === 'calendar'),
    { key: 'calendar', path: '/saudi-calendar' },
  );
  fail('locked calendar path should throw');
} catch (error) {
  if (!(error instanceof Error) || error.message !== 'locked_path') fail(`expected locked_path, got ${error}`);
}

try {
  assertSectionMutation(
    PLATFORM_SECTIONS.find((section) => section.key === 'news'),
    { key: 'news', enabled: true },
  );
  fail('news enable should throw');
} catch (error) {
  if (!(error instanceof Error) || error.message !== 'section_has_no_public_page') {
    fail(`expected section_has_no_public_page, got ${error}`);
  }
}

if (!FORBIDDEN_PUBLIC_PHRASES.includes('شركة عالمية')) fail('forbidden list incomplete');

console.log(
  JSON.stringify(
    {
      ok: true,
      nav: nav.map((section) => section.key),
      home: home.length,
      catalog: PLATFORM_SECTIONS.length,
    },
    null,
    2,
  ),
);
