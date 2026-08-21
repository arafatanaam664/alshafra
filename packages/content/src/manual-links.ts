import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type ManualLinks = Record<string, string[]>;

export function defaultManualLinksPath(repoRoot: string): string {
  return join(repoRoot, 'apps/web/src/data/manual-links.json');
}

export function resolveManualLinksPath(): string {
  if (process.env.ALSHAFRA_MANUAL_LINKS_PATH) return process.env.ALSHAFRA_MANUAL_LINKS_PATH;
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'apps/web/src/data/manual-links.json'),
    join(cwd, 'src/data/manual-links.json'),
    join(cwd, '../web/src/data/manual-links.json'),
  ];
  return candidates.find((file) => existsSync(file)) || candidates[0];
}

export function loadManualLinks(file = resolveManualLinksPath()): ManualLinks {
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as ManualLinks;
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

export function writeManualLink(fromPath: string, toPath: string, file = resolveManualLinksPath()): void {
  if (fromPath === toPath) return;
  const current = loadManualLinks(file);
  const list = new Set(current[fromPath] || []);
  list.add(toPath);
  current[fromPath] = [...list];
  if (existsSync(dirname(file)) || process.env.ALSHAFRA_MANUAL_LINKS_PATH) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(current, null, 2)}\n`);
  }
}
