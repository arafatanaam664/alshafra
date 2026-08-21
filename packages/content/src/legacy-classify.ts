import type { DocumentType } from './types';

export type HandlerKind = 'document' | 'tool' | 'countdown' | 'prices' | 'static' | 'gone' | 'redirect';

const TREND_CATS = new Set([
  '/trending/economy',
  '/trending/technology',
  '/trending/social',
  '/trending/education',
  '/trending/religion',
  '/trending/travel',
]);

export function classify(path: string, kind: string): { type: DocumentType; handler: HandlerKind } {
  if (path.startsWith('/articles/') && path !== '/articles') return { type: 'article', handler: 'document' };
  if (path.startsWith('/countdown/') && path !== '/countdown') return { type: 'tool_page', handler: 'countdown' };
  if (path.startsWith('/gold-price/') || path.startsWith('/usd-rate/')) return { type: 'tool_page', handler: 'prices' };
  if (path === '/gold-price' || path === '/usd-rate') return { type: 'tool_page', handler: 'prices' };
  if (path === '/trending/today') return { type: 'collection', handler: 'document' };
  if (TREND_CATS.has(path)) return { type: 'collection', handler: 'document' };
  if (path.startsWith('/trending/') && path !== '/trending') return { type: 'guide', handler: 'document' };
  if (path === '/faq') return { type: 'faq_page', handler: 'static' };
  if (path === '/about' || path === '/contact') return { type: 'service_info', handler: 'static' };
  if (path === '/privacy' || path === '/terms') return { type: 'legal', handler: 'static' };
  if (['/today', '/salaries', '/hijri-calendar', '/school-calendar', '/holidays'].includes(path)) {
    return { type: 'calendar_content', handler: 'tool' };
  }
  if (path === '/date-converter' || path === '/age-calculator') return { type: 'tool_page', handler: 'tool' };
  if (['/', '/articles', '/countdown', '/trending'].includes(path)) return { type: 'collection', handler: 'document' };
  if (kind === 'article') return { type: 'article', handler: 'document' };
  return { type: 'collection', handler: 'document' };
}
