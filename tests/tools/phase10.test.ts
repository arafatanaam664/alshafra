import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  applyDiscount,
  bodyMassIndex,
  collidingToolPaths,
  convertLength,
  convertTemperature,
  countText,
  encodeUrl,
  formatJson,
  generateUuid,
  LEGACY_TOOLS,
  loanPayment,
  NEW_TOOLS,
  percentChange,
  percentIs,
  percentOf,
} from '@alshafra/tools';
import { sitemapBucket } from '@alshafra/seo';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (Math.abs(percentOf(15, 200) - 30) > 1e-9) fail('percentOf');
if (Math.abs(percentIs(40, 200) - 20) > 1e-9) fail('percentIs');
if (Math.abs(percentChange(100, 80) + 20) > 1e-9) fail('percentChange');
if (Math.abs(applyDiscount(200, 25).final - 150) > 1e-9) fail('discount');
if (bodyMassIndex(70, 175).category !== 'وزن مناسب') fail('bmi category');
const loan = loanPayment(120000, 0, 12);
if (Math.abs(loan.monthly - 10000) > 1e-6) fail('zero-interest loan');
if (Math.abs(convertLength(1, 'm', 'cm') - 100) > 1e-9) fail('length');
if (Math.abs(convertTemperature(0, 'C', 'F') - 32) > 1e-9) fail('temp');
if (countText('مرحبا بك').words !== 2) fail('word count');
if (encodeUrl('أ') !== '%D8%A3') fail('url encode');
if (formatJson('{"a":1}') !== '{\n  "a": 1\n}') fail('json format');
const uuid = generateUuid(Uint8Array.from({ length: 16 }, (_, i) => i));
if (!/^........-....-4...-[89ab]/.test(uuid)) fail(`uuid format ${uuid}`);

const published = JSON.parse(readFileSync(join(process.cwd(), 'apps/web-legacy/public/published.json'), 'utf8')) as {
  published: { path: string }[];
};
const reserved = published.published.map((row) => row.path);
const collisions = collidingToolPaths([...reserved, ...LEGACY_TOOLS.map((tool) => tool.path)]);
if (collisions.length) fail(`new tools collide: ${collisions.join(',')}`);
if (NEW_TOOLS.some((tool) => !tool.path.startsWith('/tool/'))) fail('new tools must use /tool/:slug');
if (sitemapBucket('/tool/percentage') !== 'tools') fail('sitemap bucket');
if (LEGACY_TOOLS.find((tool) => tool.path === '/date-converter')?.path !== '/date-converter') fail('legacy path moved');

console.log(JSON.stringify({ ok: true, newTools: NEW_TOOLS.length, reserved: reserved.length }, null, 2));
