import type { APIRoute } from 'astro';
import { getAllPages } from '../content/provider';

export const GET: APIRoute = () => {
  const documents = getAllPages()
    .filter((page) => page.robots.startsWith('index') && page.path !== '/search')
    .map((page) => ({
      path: page.path,
      title: page.title,
      h1: page.h1,
      description: page.description,
      kind: page.kind,
    }));
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), documents }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
