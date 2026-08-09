// LangSwitcher.tsx — مبدّل اللغة (16 لغة) مع حفظ الاختيار
// يتنقل فقط للصفحات الموجودة فعلاً في اللغة الهدف (كل الملفات مولّدة)،
// ويسقط إلى محور اللغة إذا لم تكن الصفحة موجودة فيها.
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { LANGS, LANG_BY_CODE, useLang } from '../lib/i18n';
import { parseRoute, useRoute } from '../lib/router';
import { countryBySlug, nameBySlug, DHIKR_ARTICLES, ISLAMIC_LANGS } from '../lib/globalData';
import toolSlugsData from '../data/toolslugs.json';

const TOOL_SLUGS = (toolSlugsData as { slugs: Record<string, Record<string, string>> }).slugs;
const AR_EXISTING = (toolSlugsData as { arExisting: string[] }).arExisting;

function toolSlugFor(code: string, key: string): string | null {
  return TOOL_SLUGS[key] && TOOL_SLUGS[key][code] ? TOOL_SLUGS[key][code] : null;
}

/** هل توجد هذه الصفحة (نوع + معامل) في اللغة الهدف؟ */
function targetExists(code: string, kind: string, param?: string): boolean {
  if (kind === 'hub' || kind === 'home' || kind === 'articles-list') return true;
  if (kind === 'tool') {
    if (!param) return false;
    if (code === 'ar' && AR_EXISTING.includes(param)) return true; // الصفحات العربية القائمة
    return !!toolSlugFor(code, param);
  }
  if (kind === 'gold' || kind === 'usd' || kind === 'date-today') {
    const c = param ? countryBySlug(param) : undefined;
    return !!c && (c.langs || []).includes(code);
  }
  if (kind === 'letter') {
    const isLatin = !!param && /^[a-z]$/.test(param);
    return isLatin ? LANG_BY_CODE[code].script === 'latin' : LANG_BY_CODE[code].script !== 'latin';
  }
  if (kind === 'name') {
    const n = param ? nameBySlug(param) : undefined;
    if (!n) return false;
    if (code === 'ar' || code === 'ur') return n.origin === 'arabic';
    if (code === 'fa') return n.origin === 'arabic' || n.origin === 'persian';
    if (code === 'tr') return n.origin === 'turkish' || n.origin === 'arabic';
    if (code === 'en') return n.origin === 'english' || n.origin === 'arabic';
    return n.origin === 'english';
  }
  if (kind === 'list') return true;
  if (kind === 'article') {
    if (param && DHIKR_ARTICLES.includes(param)) return ISLAMIC_LANGS.includes(code);
    return true;
  }
  return false;
}

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

    if (info.kind === 'tool' && info.param && targetExists(code, 'tool', info.param)) {
      const slug = toolSlugFor(code, info.param);
      target = slug ? `${prefix}/${slug}` : (prefix || '/');
    } else if ((info.kind === 'gold' || info.kind === 'usd' || info.kind === 'date-today') && info.param && targetExists(code, info.kind, info.param)) {
      const seg = info.kind === 'gold' ? 'gold-price' : info.kind === 'usd' ? 'usd-rate' : 'date-today';
      target = `${prefix}/${seg}/${info.param}`;
    } else if (info.kind === 'letter' && info.param && targetExists(code, 'letter', info.param)) {
      target = `${prefix}/fancy-letter/${info.param}`;
    } else if (info.kind === 'name' && info.param && targetExists(code, 'name', info.param)) {
      target = `${prefix}/name/${info.param}`;
    } else if (info.kind === 'list' && info.param) {
      target = `${prefix}/names/${info.param}`;
    } else if (info.kind === 'article' && info.param && targetExists(code, 'article', info.param)) {
      target = code === 'ar' ? `/world/${info.param}` : `${prefix}/articles/${info.param}`;
    } else if (info.kind === 'articles-list') {
      target = `${prefix}/articles`;
    }
    // أي نوع غير مدعوم في اللغة الهدف → محور اللغة
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
