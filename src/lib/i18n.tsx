import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ROUTE_CHANGE_EVENT } from './router';
import ar from '../i18n/ar.json';
import en from '../i18n/en.json';
import tr from '../i18n/tr.json';
import fa from '../i18n/fa.json';
import fr from '../i18n/fr.json';
import es from '../i18n/es.json';
import pt from '../i18n/pt.json';
import id from '../i18n/id.json';
import ms from '../i18n/ms.json';
import ur from '../i18n/ur.json';
import de from '../i18n/de.json';
import ru from '../i18n/ru.json';
import it from '../i18n/it.json';
import hi from '../i18n/hi.json';
import bn from '../i18n/bn.json';
import sw from '../i18n/sw.json';
import languagesData from '../data/languages.json';

export const LANGS = (languagesData as { languages: { code: string; name: string; native: string; flag: string; dir: string; script: string; islamic: boolean }[] }).languages;
export const LANG_BY_CODE = Object.fromEntries(LANGS.map((l) => [l.code, l]));

const STRINGS: Record<string, Record<string, unknown>> = { ar, en, tr, fa, fr, es, pt, id, ms, ur, de, ru, it, hi, bn, sw };

interface LangCtxValue {
  lang: string;
  setLang: (l: string) => void;
  /** نص مترجم (سلسلة). */
  t: (key: string) => string;
  /** مصفوفة نصوص مترجمة (مثل home.intro) — undefined إن لم تكن مصفوفة. */
  ta: (key: string) => string[] | undefined;
  /** كائن مترجم (مثل articles.slug) — undefined إن لم يكن كائناً. */
  tj: (key: string) => Record<string, unknown> | undefined;
  dir: string;
  prefix: string;
}

const LangCtx = createContext<LangCtxValue>({
  lang: 'ar',
  setLang: () => {},
  t: (k) => k,
  ta: () => undefined,
  tj: () => undefined,
  dir: 'rtl',
  prefix: '',
});

function resolve(obj: unknown, parts: string[]): unknown {
  let v: unknown = obj;
  for (const p of parts) {
    if (v == null) return undefined;
    v = (v as Record<string, unknown>)[p];
  }
  return v;
}

/** القيمة الخام بأي نوع (سلسلة، مصفوفة، كائن) مع سلسلة السقوط: اللغة ← en ← ar. */
function lookupRaw(lang: string, parts: string[]): unknown {
  let v = resolve(STRINGS[lang], parts);
  if (v !== undefined && v !== null && v !== '') return v;
  v = resolve(STRINGS.en, parts);
  if (v !== undefined && v !== null && v !== '') return v;
  v = resolve(STRINGS.ar, parts);
  return v !== undefined && v !== null && v !== '' ? v : undefined;
}

function lookup(lang: string, parts: string[]): string | undefined {
  const v = lookupRaw(lang, parts);
  return typeof v === 'string' ? v : undefined;
}

/** بحث يرجع مصفوفة نصوص (مثل home.intro) — عادياً كانت المصفوفات تُفقد تماماً. */
function lookupArray(lang: string, parts: string[]): string[] | undefined {
  const v = lookupRaw(lang, parts);
  return Array.isArray(v) ? (v as string[]) : undefined;
}

/** بحث يرجع كائناً (مثل articles.slug) — عادياً كان الكائن يتحول إلى المفتاح نفسه. */
function lookupObject(lang: string, parts: string[]): Record<string, unknown> | undefined {
  const v = lookupRaw(lang, parts);
  return typeof v === 'object' && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

/**
 * تحديد اللغة من عنوان URL نفسه (الرابط هو مصدر الحقيقة الوحيد):
 *  - مسار بادئة من لغتين (مثل /en/… أو /tr/…) => اللغة المقابلة
 *  - أي مسار آخر (مثل /articles/… أو /salaries أو /trending/…) => العربية
 * لا نستخدم localStorage هنا إطلاقاً: كان حفظ لغة سابقة يتسبب في عرض الصفحات
 * العربية القائمة (بدون بادئة) باللغة الإنجليزية المختزنة — خلط لغات واضح.
 */
function detectLang(): string {
  const m = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (m && m[1] !== 'ar' && LANG_BY_CODE[m[1]]) return m[1];
  return 'ar';
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(detectLang);

  const setLang = (l: string) => {
    setLangState(l);
    try {
      localStorage.setItem('alshafra-lang', l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const dir = LANG_BY_CODE[lang]?.dir || 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  // اللغة تُستنتج من الرابط دائماً: عند التنقل عبر زر الرجوع/التقدم أو أي
  // تغيير للمسار، نعيد مزامنة اللغة مع بادئة المسار حتى لا تبقى لغة قديمة
  // معروضة على صفحة من لغة أخرى (سبب خلط اللغات عند التنقل).
  useEffect(() => {
    const syncLangFromPath = () => {
      const detected = detectLang();
      setLangState((cur) => (cur === detected ? cur : detected));
    };
    window.addEventListener('popstate', syncLangFromPath);
    window.addEventListener(ROUTE_CHANGE_EVENT, syncLangFromPath);
    return () => {
      window.removeEventListener('popstate', syncLangFromPath);
      window.removeEventListener(ROUTE_CHANGE_EVENT, syncLangFromPath);
    };
  }, []);

  const value = useMemo<LangCtxValue>(() => {
    const dir = LANG_BY_CODE[lang]?.dir || 'rtl';
    return {
      lang,
      setLang,
      t: (key: string) => {
        const parts = key.split('.');
        return lookup(lang, parts) ?? key;
      },
      ta: (key: string) => lookupArray(lang, key.split('.')),
      tj: (key: string) => lookupObject(lang, key.split('.')),
      dir,
      prefix: lang === 'ar' ? '' : `/${lang}`,
    };
  }, [lang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang(): LangCtxValue {
  return useContext(LangCtx);
}

export function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
