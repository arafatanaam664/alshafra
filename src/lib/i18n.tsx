import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  t: (key: string) => string;
  dir: string;
  prefix: string;
}

const LangCtx = createContext<LangCtxValue>({
  lang: 'ar',
  setLang: () => {},
  t: (k) => k,
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

function lookup(lang: string, parts: string[]): string | undefined {
  let v = resolve(STRINGS[lang], parts);
  if (typeof v === 'string' && v) return v;
  v = resolve(STRINGS.en, parts);
  if (typeof v === 'string' && v) return v;
  v = resolve(STRINGS.ar, parts);
  return typeof v === 'string' && v ? v : undefined;
}

function detectLang(): string {
  const m = window.location.pathname.match(/^\/([a-z]{2})\//);
  if (m && LANG_BY_CODE[m[1]]) return m[1];
  try {
    const saved = localStorage.getItem('alshafra-lang');
    if (saved && LANG_BY_CODE[saved]) return saved;
  } catch {
    /* ignore */
  }
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

  const value = useMemo<LangCtxValue>(() => {
    const dir = LANG_BY_CODE[lang]?.dir || 'rtl';
    return {
      lang,
      setLang,
      t: (key: string) => {
        const parts = key.split('.');
        return lookup(lang, parts) ?? key;
      },
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
