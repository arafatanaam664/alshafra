import type { APIRoute } from 'astro';
import { entriesForBucket, SITEMAP_BUCKETS, urlsetXml, type SitemapBucket } from '@alshafra/seo';
import { getAllPages } from '../../content/provider';

export function getStaticPaths() {
  return SITEMAP_BUCKETS.map((name) => ({ params: { name } }));
}

export const GET: APIRoute = ({ params }) => {
  const bucket = params.name as SitemapBucket;
  const today = new Date().toISOString().slice(0, 10);
  const entries = getAllPages().map((page) => ({
    path: page.path,
    robots: page.robots,
    lastmod:
      page.dateModified ||
      page.datePublished ||
      (page.path === '/today' || page.path.startsWith('/gold-price') || page.path.startsWith('/usd-rate')
        ? today
        : undefined),
  }));
  return new Response(urlsetXml(entriesForBucket(entries, bucket)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
