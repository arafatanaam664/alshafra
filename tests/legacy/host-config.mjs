#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const netlify = readFileSync(join(root, 'netlify.toml'), 'utf8');

const errors = [];

if (vercel.buildCommand !== 'npm run build') {
  errors.push(`vercel.json buildCommand must be npm run build (Astro), got ${JSON.stringify(vercel.buildCommand)}`);
}
if (vercel.outputDirectory !== 'apps/web/dist') {
  errors.push(`vercel.json outputDirectory must be the Astro app, got ${JSON.stringify(vercel.outputDirectory)}`);
}
if (vercel.buildCommand === 'npm run build:legacy') {
  errors.push('This branch must not publish Vite as the public renderer (chat: Astro SSG)');
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

if (!/command\s*=\s*"npm run build"/.test(netlify)) {
  errors.push('netlify.toml build command must be npm run build (Astro)');
}
if (!/publish\s*=\s*"apps\/web\/dist"/.test(netlify)) {
  errors.push('netlify.toml publish must be apps/web/dist');
}
if (/command\s*=\s*"npm run build:legacy"/.test(netlify)) {
  errors.push('netlify.toml must not publish the Vite rollback app');
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log('Host config ok: this branch publishes Astro SSG; 410 routes present.');
