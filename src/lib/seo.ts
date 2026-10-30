import { useEffect } from 'react';

export const SITE_URL = 'https://alshafra.com';
export const SITE_NAME = 'تقويم السعودية';

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /**
   * Id of the <script type="application/ld+json"> node this call owns.
   * Different callers on the same page MUST use different ids, otherwise the
   * last effect to run silently deletes the other one's structured data
   * (this is what used to drop every BreadcrumbList on the site).
   */
  jsonLdId?: string;
  keywords?: string;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useSeo(opts: SeoOptions) {
  const jsonLdKey = opts.jsonLd ? JSON.stringify(opts.jsonLd) : '';
  const jsonLdId = opts.jsonLdId ?? 'page-jsonld';
  useEffect(() => {
    if (opts.title) {
      document.title = opts.title;
      setMeta('og:title', opts.title, 'property');
      setMeta('twitter:title', opts.title);
    }
    if (opts.description) {
      setMeta('description', opts.description);
      setMeta('og:description', opts.description, 'property');
      setMeta('twitter:description', opts.description);
    }
    if (opts.keywords) setMeta('keywords', opts.keywords);
    else if (jsonLdId === 'page-jsonld') document.head.querySelector('meta[name="keywords"]')?.remove();
    if (opts.canonical) {
      setLink('canonical', opts.canonical);
      setMeta('og:url', opts.canonical, 'property');
    }
    // Replace the prerendered page payload rather than leaving a duplicate after navigation.
    if (jsonLdId === 'page-jsonld') document.querySelector('script[data-page-jsonld]')?.remove();
    if (jsonLdKey) {
      setJsonLd(jsonLdId, JSON.parse(jsonLdKey));
    } else {
      const existing = document.getElementById(jsonLdId);
      if (existing) existing.remove();
    }
    return () => { document.getElementById(jsonLdId)?.remove(); };
  }, [opts.title, opts.description, opts.canonical, opts.keywords, jsonLdKey, jsonLdId]);
}
