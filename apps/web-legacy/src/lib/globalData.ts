// globalData.ts — بيانات مشتركة للتطبيق (دول، أسماء، أسعار، محتوى) + أدوات مساعدة
import countriesData from '../data/countries.json';
import namesData from '../data/names.json';
import triviaData from '../data/trivia.json';
import pricesData from '../data/prices.json';

export interface Country {
  slug: string;
  en: string;
  ar: string;
  local?: string;
  flag: string;
  cur: string;
  curName: string;
  cap: string;
  reg: string;
  popM: number;
  langs: string[];
}
export interface NameItem {
  slug: string;
  ar?: string;
  en: string;
  meaningAr?: string;
  meaningEn: string;
  gender: 'male' | 'female';
  origin: string;
}

export const COUNTRIES = (countriesData as { countries: Country[] }).countries;
export const NAMES = (namesData as { names: NameItem[] }).names;
export const TRIVIA = triviaData as {
  catNames: string[];
  dogNames: string[];
  companyNames: string[];
  funFacts: { ar: string[]; en: string[] };
  riddles: { ar: string[]; en: string[] };
  jokes: { ar: string[]; en: string[] };
  loveQuotes: { ar: string[]; en: string[] };
  sadQuotes: { ar: string[]; en: string[] };
  statuses: { ar: string[]; en: string[] };
  bios: { ar: string[]; en: string[] };
  dhikr: { morning: { text: string; detail: string }[]; evening: { text: string; detail: string }[]; dua: { text: string; detail: string }[] };
};
export const PRICES = pricesData as {
  updated: string;
  xauUsd: number;
  source: string;
  rates: Record<string, number>;
};

export function countryBySlug(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}
export function nameBySlug(slug: string): NameItem | undefined {
  return NAMES.find((n) => n.slug === slug);
}
export function countryName(lang: string, c: Country): string {
  if (lang === 'ar') return c.ar || c.en;
  if (lang === 'en') return c.en;
  return c.local || c.en;
}
export function rateFor(cur: string): number {
  return PRICES.rates[cur] || 1;
}
export function fmtNum(n: number, cur: string): string {
  const digits = ['IRR', 'VND', 'IDR', 'IQD', 'LBP', 'SYP', 'UZS', 'LAK', 'VES'].includes(cur) ? 0 : 2;
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export const WORLD_ARTICLES = ['smallest-country', 'biggest-country', 'messi-vs-ronaldo', 'pele', 'argentina', 'fun-facts', 'riddles', 'jokes', 'love-quotes', 'sad-quotes', 'whatsapp-statuses', 'instagram-bios'];
export const DHIKR_ARTICLES = ['morning-dhikr', 'evening-dhikr', 'daily-dua'];
export const ISLAMIC_LANGS = ['ar', 'tr', 'fa', 'ur', 'id', 'ms', 'hi', 'bn', 'sw', 'en'];

export function articleData(lang: string, slug: string): { items: string[]; itemsHtml?: never } {
  const key = slug === 'whatsapp-statuses' ? 'statuses' : slug === 'instagram-bios' ? 'bios' : slug;
  const pool = TRIVIA[key as keyof typeof TRIVIA] as { ar: string[]; en: string[] } | undefined;
  if (pool) return { items: lang === 'ar' ? pool.ar : pool.en };
  return { items: [] };
}
