import { breadcrumbListJsonLd, breadcrumbsFor, type Crumb } from './breadcrumbs';
import { selfCanonical } from './canonical';
import {
  DEFAULT_OG_IMAGE,
  LOGO_URL,
  ORGANIZATION_ID,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
} from './site';

export interface FaqItem {
  q: string;
  a: string;
}

export interface SeoPageInput {
  path: string;
  title: string;
  description: string;
  h1: string;
  kind: string;
  island?: string;
  faq?: FaqItem[];
  datePublished?: string;
  dateModified?: string;
  isoDate?: string;
  itemList?: { name: string; path: string }[];
  image?: string;
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: `${SITE_URL}/`,
    inLanguage: 'ar-SA',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function webPageNode(page: SeoPageInput, canonical: string, crumbs: Crumb[]) {
  return {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: page.title,
    description: page.description,
    inLanguage: 'ar-SA',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
    primaryImageOfPage: { '@type': 'ImageObject', url: page.image || DEFAULT_OG_IMAGE },
  };
}

function articleNode(page: SeoPageInput, canonical: string) {
  return {
    '@type': page.kind === 'news' ? 'NewsArticle' : 'Article',
    '@id': `${canonical}#article`,
    headline: page.h1,
    description: page.description,
    inLanguage: 'ar-SA',
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    datePublished: page.datePublished,
    dateModified: page.dateModified || page.datePublished,
    image: page.image || DEFAULT_OG_IMAGE,
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

function faqNode(faq: FaqItem[], canonical: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function webAppNode(page: SeoPageInput, canonical: string) {
  return {
    '@type': 'WebApplication',
    '@id': `${canonical}#app`,
    name: page.h1,
    description: page.description,
    url: canonical,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    inLanguage: 'ar-SA',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'SAR' },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

function eventNode(page: SeoPageInput, canonical: string) {
  return {
    '@type': 'Event',
    '@id': `${canonical}#event`,
    name: page.h1,
    description: page.description,
    startDate: page.isoDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: canonical,
    },
    organizer: { '@id': ORGANIZATION_ID },
  };
}

function itemListNode(items: { name: string; path: string }[], canonical: string) {
  return {
    '@type': 'ItemList',
    '@id': `${canonical}#list`,
    itemListElement: items.slice(0, 50).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: selfCanonical(item.path),
    })),
  };
}

const TOOL_ISLANDS = new Set(['date-converter', 'age-calculator', 'hijri-calendar']);
const TOOL_PATHS = new Set(['/date-converter', '/age-calculator', '/hijri-calendar']);

export function schemaTypesFor(page: SeoPageInput): string[] {
  const types = ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList'];
  if (page.kind === 'article' || page.kind === 'guide' || page.kind === 'solution') types.push('Article');
  if (page.kind === 'news') types.push('NewsArticle');
  if ((page.faq?.length || 0) >= 2) types.push('FAQPage');
  if (TOOL_ISLANDS.has(page.island || '') || TOOL_PATHS.has(page.path) || page.kind === 'gold' || page.kind === 'usd') {
    types.push('WebApplication');
  }
  if (page.kind === 'countdown' && page.isoDate) types.push('Event');
  if (page.itemList?.length) types.push('ItemList');
  return types;
}

export function buildJsonLdGraph(page: SeoPageInput): { '@context': string; '@graph': Record<string, unknown>[] } {
  const canonical = selfCanonical(page.path);
  const crumbs = breadcrumbsFor(page.path, page.h1);
  const graph: Record<string, unknown>[] = [
    organizationNode(),
    websiteNode(),
    webPageNode(page, canonical, crumbs),
    breadcrumbListJsonLd(crumbs, canonical),
  ];

  if (page.kind === 'article' || page.kind === 'guide' || page.kind === 'solution' || page.kind === 'news') {
    graph.push(articleNode(page, canonical));
  }
  if ((page.faq?.length || 0) >= 2) graph.push(faqNode(page.faq!, canonical));
  if (TOOL_ISLANDS.has(page.island || '') || TOOL_PATHS.has(page.path) || page.kind === 'gold' || page.kind === 'usd') {
    graph.push(webAppNode(page, canonical));
  }
  if (page.kind === 'countdown' && page.isoDate) graph.push(eventNode(page, canonical));
  if (page.itemList?.length) graph.push(itemListNode(page.itemList, canonical));

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function graphHasType(graph: { '@graph': Record<string, unknown>[] }, type: string): boolean {
  return graph['@graph'].some((node) => node['@type'] === type);
}

export function graphHasSearchAction(graph: { '@graph': Record<string, unknown>[] }): boolean {
  return JSON.stringify(graph).includes('SearchAction');
}
