// LangSwitcher.tsx — مبدّل اللغة (16 لغة) مع حفظ الاختيار
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { LANGS, useLang } from '../lib/i18n';
import { parseRoute, useRoute } from '../lib/router';
import { countryBySlug } from '../lib/globalData';

const SAME_SLUG_TOOLS = ['fancy-text', 'symbols', 'word-counter', 'percentage-calculator', 'case-converter', 'number-converter', 'age-calculator', 'date-converter', 'today', 'countdown'];

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [, navigate] = useRoute();

  const switchTo = (code: string) => {
    setOpen(false);
    if (code === lang) return;
    setLang(code);
    const info = parseRoute(window.location.pathname);
    const prefix = code === 'ar' ? '' : `/${code}`;
    let target = prefix || '/';
    if (info.kind === 'tool' && info.param && SAME_SLUG_TOOLS.includes(info.param)) {
      target = `${prefix}/fancy-text-generator`; // slugs تختلف بين اللغات — نستخدم الصفحة الرئيسية للأداة
    } else if ((info.kind === 'gold' || info.kind === 'usd' || info.kind === 'date-today') && info.param) {
      const c = countryBySlug(info.param);
      if (c && (c.langs || []).includes(code)) {
        const seg = info.kind === 'gold' ? 'gold-price' : info.kind === 'usd' ? 'usd-rate' : 'date-today';
        target = `${prefix}/${seg}/${info.param}`;
      }
    } else if (info.kind === 'letter' && info.param) {
      target = `${prefix}/fancy-letter/${info.param}`;
    } else if (info.kind === 'name' && info.param) {
      target = `${prefix}/name/${info.param}`;
    } else if (info.kind === 'list' && info.param) {
      target = `${prefix}/names/${info.param}`;
    } else if (info.kind === 'article' && info.param) {
      target = code === 'ar' ? `/world/${info.param}` : `${prefix}/articles/${info.param}`;
    }
    navigate(target);
  };

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="nav-link flex items-center gap-1.5"
        aria-label="Language"
      >
        <Globe className="h-4 w-4" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-brand-900/10">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchTo(l.code)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-brand-50 ${l.code === lang ? 'bg-brand-50 font-bold text-brand-700' : 'text-brand-800'}`}
              >
                <span>{l.flag}</span>
                <span className="flex-1 text-right">{l.native}</span>
                <span className="text-[10px] text-brand-400">{l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
