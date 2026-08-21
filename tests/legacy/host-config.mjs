#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const netlify = readFileSync(join(root, 'netlify.toml'), 'utf8');

const errors = [];

if (vercel.buildCommand !== 'npm run build:legacy') {
  errors.push(`vercel.json buildCommand must be npm run build:legacy, got ${JSON.stringify(vercel.buildCommand)}`);
}
if (vercel.outputDirectory !== 'apps/web-legacy/dist') {
  errors.push(`vercel.json outputDirectory must stay on Vite until cutover, got ${JSON.stringify(vercel.outputDirectory)}`);
}
if (vercel.buildCommand === 'npm run build') {
  errors.push('vercel.json must not run the Astro build while outputDirectory is the Vite folder');
}

const gone = new Set(
  (vercel.routes || [])
    .filter((route) => route.status === 410)
    .map((route) => route.src),
);
for (const src of ['^/category(?:/.*)?$', '^/languages(?:/.*)?$', '^/news(?:/.*)?$']) {
  if (!gone.has(src)) {
    errors.push(`vercel.json missing 410 route for ${src}`);
  }
}

if (!/command\s*=\s*"npm run build:legacy"/.test(netlify)) {
  errors.push('netlify.toml build command must be npm run build:legacy');
}
if (!/publish\s*=\s*"apps\/web-legacy\/dist"/.test(netlify)) {
  errors.push('netlify.toml publish must be apps/web-legacy/dist');
}
if (/command\s*=\s*"npm run build"/.test(netlify)) {
  errors.push('netlify.toml must not run Astro while publishing the Vite folder');
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log('Host config ok: Vercel/Netlify stay on Vite; 410 routes present.');
