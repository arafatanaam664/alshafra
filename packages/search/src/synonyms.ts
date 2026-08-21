import { normalizeArabic } from './normalize';

/** Bidirectional editorial synonyms. Used when the DB table is not available. */
export const DEFAULT_SYNONYMS: [string, string][] = [
  ['ام القرى', 'أم القرى'],
  ['ام القرى', 'umm al qura'],
  ['هجري', 'هجرى'],
  ['واتساب', 'واتس'],
  ['واتساب', 'whatsapp'],
  ['راتب', 'رواتب'],
  ['حساب المواطن', 'المواطن'],
  ['تقويم', 'تاريخ'],
  ['دولار', 'usd'],
  ['ذهب', 'الذهب'],
];

export function synonymMap(pairs: [string, string][] = DEFAULT_SYNONYMS): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const key = normalizeArabic(from).toLowerCase();
    const value = normalizeArabic(to).toLowerCase();
    if (!key || !value) return;
    const set = map.get(key) ?? new Set<string>();
    set.add(value);
    map.set(key, set);
  };
  for (const [term, synonym] of pairs) {
    add(term, synonym);
    add(synonym, term);
  }
  return map;
}

export function expandWithSynonyms(normalizedQuery: string, pairs: [string, string][] = DEFAULT_SYNONYMS): string {
  const map = synonymMap(pairs);
  let expanded = normalizedQuery;
  for (const [term, values] of map) {
    if (expanded.includes(term)) {
      for (const value of values) {
        if (!expanded.includes(value)) expanded += ` ${value}`;
      }
    }
  }
  return expanded.replace(/\s+/g, ' ').trim();
}
