import { useEffect, useState } from 'react';
import toolSlugsData from '../data/toolslugs.json';

export type RoutePath = string;

export interface RouteInfo {
  lang: string; // 'ar' | 'en' | 'tr' | ...
  kind: string; // 'home' | 'tool' | 'gold' | 'usd' | 'date-today' | 'letter' | 'name' | 'list' | 'article' | 'world-article' | 'trending' | 'trending-hub' | 'trending-today' | 'trending-category' | 'tools-hub' | existing saudi kinds
  param?: string; // tool key / country slug / letter slug / name slug / list key / article slug / trending slug / category
}

const LANGS = ['ar', 'en', 'tr', 'fa', 'fr', 'es', 'pt', 'id', 'ms', 'ur', 'de', 'ru', 'it', 'hi', 'bn', 'sw'];

// عكس جداول المسارات: slug → مفتاح الأداة
function reverseSlugs(): Record<string, string> {
  const map: Record<string, string> = {};
  const slugs = (toolSlugsData as { slugs: Record<string, Record<string, string>> }).slugs;
  for (const [key, byLang] of Object.entries(slugs)) {
    for (const slug of Object.values(byLang)) map[slug] = key;
  }
  return map;
}
const SLUG_TO_TOOL = reverseSlugs();
export const AR_EXISTING_TOOLS = (toolSlugsData as { arExisting: string[] }).arExisting;

// مفتاح الأداة (إن وُجد) في مسار عربي — مع تمييز الأدوات ذات الصفحات السعودية القائمة
// حتى لا تختطف صفحات «حاسبة العمر / تحويل التاريخ / اليوم / العدّادات» العالمية
// صفحاتَها السعودية الأصلية.
const AR_TOOL_KIND: Record<string, string> = {
  'age-calculator': 'age-calculator',
  'date-converter': 'date-converter',
  today: 'today',
  countdown: 'countdown',
  tools: 'tools-hub',
};

// فئات المواضيع الرائجة (تُستخدم في تحليل مسارات /trending/<category>)
const TRENDING_CATEGORIES = new Set([
  'economy',
  'technology',
  'social',
  'education',
  'religion',
  'travel',
]);

export const ROUTE_CHANGE_EVENT = 'alshafra:routechange';

export function useRoute(): [RoutePath, (path: RoutePath) => void] {
  const [path, setPath] = useState<RoutePath>(() => normalize(window.location.pathname));

  useEffect(() => {
    const onChange = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, onChange);
    onChange();
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(ROUTE_CHANGE_EVENT, onChange);
    };
  }, []);

  const navigate = (next: RoutePath) => {
    const target = next.startsWith('/') ? next : `/${next}`;
    if (normalize(window.location.pathname) !== target) {
      window.history.pushState({}, '', target);
    }
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [path, navigate];
}

function normalize(pathname: string): RoutePath {
  if (!pathname || pathname === '#') return '/';
  const stripped = pathname.startsWith('#') ? pathname.slice(1) : pathname;
  const withSlash = stripped.startsWith('/') ? stripped : `/${stripped}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

export function langPrefix(lang: string): string {
  return lang === 'ar' ? '' : `/${lang}`;
}

/**
 * تحليل المسار: يكتشف بادئة اللغة ثم نوع الصفحة.
 * للعربية (بدون بادئة) يحافظ على كل المسارات السعودية القائمة ويميّز بين
 * المقالات السعودية (/articles/*) والمقالات العالمية (/world/*) وصفحات
 * المواضيع الرائجة (/trending و /trending/*).
 */
export function parseRoute(path: RoutePath): RouteInfo {
  const segments = path.split('/').filter(Boolean);

  let lang = 'ar';
  let rest = segments;
  if (segments.length > 0 && LANGS.includes(segments[0]) && segments[0] !== 'ar') {
    lang = segments[0];
    rest = segments.slice(1);
  }

  const first = rest[0];
  const second = rest[1];

  if (lang !== 'ar') {
    if (!first) return { lang, kind: 'hub' };
    // صفحات /trending عربية فقط — أي مسار بادئ بـ trending في لغة أخرى يسقط على محور اللغة
    if (first === 'trending') return { lang, kind: 'hub' };
    if (SLUG_TO_TOOL[first]) return { lang, kind: 'tool', param: SLUG_TO_TOOL[first] };
    if (first === 'gold-price') return second ? { lang, kind: 'gold', param: second } : { lang, kind: 'gold-hub' };
    if (first === 'usd-rate') return second ? { lang, kind: 'usd', param: second } : { lang, kind: 'usd-hub' };
    if (first === 'date-today' && second) return { lang, kind: 'date-today', param: second };
    if (first === 'fancy-letter' && second) return { lang, kind: 'letter', param: second };
    if (first === 'name' && second) return { lang, kind: 'name', param: second };
    if (first === 'names' && second) return { lang, kind: 'list', param: second };
    if (first === 'articles' && second) return { lang, kind: 'article', param: second };
    if (first === 'articles') return { lang, kind: 'articles-list' };
    if (first === 'adawat' || first === 'araclar' || first === 'abzarha' || first === 'outils' || first === 'herramientas' || first === 'ferramentas' || first === 'alat' || first === 'alatan' || first === 'toolz' || first === 'tools' || first === 'instrumenty' || first === 'strumenti' || first === 'zana') return { lang, kind: 'tools-hub' };
    return { lang, kind: 'hub' };
  }

  // === العربية (الجذر) ===
  if (!first) return { lang: 'ar', kind: 'home' };

  // المسارات السعودية القائمة (لها الأولوية على أدوات الكتالوج العالمية)
  if (first === 'salaries') return { lang: 'ar', kind: 'salaries' };
  if (first === 'date-converter') return { lang: 'ar', kind: 'date-converter' };
  if (first === 'age-calculator') return { lang: 'ar', kind: 'age-calculator' };
  if (first === 'hijri-calendar') return { lang: 'ar', kind: 'hijri-calendar' };
  if (first === 'school-calendar') return { lang: 'ar', kind: 'school-calendar' };
  if (first === 'holidays') return { lang: 'ar', kind: 'holidays' };
  if (first === 'countdown') return { lang: 'ar', kind: 'countdown', param: second };
  if (first === 'today') return { lang: 'ar', kind: 'today' };
  if (first === 'faq') return { lang: 'ar', kind: 'faq' };
  // المقالات السعودية: /articles و /articles/<slug>
  if (first === 'articles') return { lang: 'ar', kind: 'article', param: second };
  // المقالات العالمية بالعربية: /world/<slug>
  if (first === 'world' && second) return { lang: 'ar', kind: 'world-article', param: second };
  if (first === 'name-decoration') return { lang: 'ar', kind: 'name-decoration', param: second };
  if (first === 'privacy') return { lang: 'ar', kind: 'privacy' };
  if (first === 'terms') return { lang: 'ar', kind: 'terms' };
  if (first === 'about') return { lang: 'ar', kind: 'about' };
  if (first === 'contact') return { lang: 'ar', kind: 'contact' };

  // المواضيع الرائجة: /trending و /trending/today و /trending/<فئة أو موضوع>
  if (first === 'trending') {
    if (!second) return { lang: 'ar', kind: 'trending-hub' };
    if (second === 'today') return { lang: 'ar', kind: 'trending-today' };
    if (TRENDING_CATEGORIES.has(second)) return { lang: 'ar', kind: 'trending-category', param: second };
    return { lang: 'ar', kind: 'trending', param: second };
  }

  // الأدوات العالمية: الأدوات العربية القائمة تُوجَّه لصفحاتها السعودية أولاً
  if (SLUG_TO_TOOL[first]) {
    const key = SLUG_TO_TOOL[first];
    const saudiKind = AR_TOOL_KIND[key];
    if (saudiKind) {
      if (key === 'countdown') return { lang: 'ar', kind: 'countdown', param: second };
      return { lang: 'ar', kind: saudiKind };
    }
    return { lang: 'ar', kind: 'tool', param: key };
  }

  if (first === 'gold-price') return second ? { lang: 'ar', kind: 'gold', param: second } : { lang: 'ar', kind: 'gold-hub' };
  if (first === 'usd-rate') return second ? { lang: 'ar', kind: 'usd', param: second } : { lang: 'ar', kind: 'usd-hub' };
  if (first === 'date-today' && second) return { lang: 'ar', kind: 'date-today', param: second };
  if (first === 'fancy-letter' && second) return { lang: 'ar', kind: 'letter', param: second };
  if (first === 'name' && second) return { lang: 'ar', kind: 'name', param: second };
  if (first === 'names' && second) return { lang: 'ar', kind: 'list', param: second };

  return { lang: 'ar', kind: 'home' };
}
