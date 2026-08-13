// GlobalPage.tsx — يعرض كل الصفحات العالمية المولّدة (أدوات × لغة، دول، حروف، أسماء، قوائم، مقالات)
import { useEffect, useMemo, useState } from 'react';
import { useSeo } from '../lib/seo';
import { useLang, fillTemplate } from '../lib/i18n';
import { allStyles, FancyStyle } from '../lib/fancy';
import { COUNTRIES, NAMES, TRIVIA, PRICES, countryBySlug, nameBySlug, countryName, rateFor, fmtNum, articleData, WORLD_ARTICLES, DHIKR_ARTICLES, ISLAMIC_LANGS } from '../lib/globalData';
import { langPrefix } from '../lib/router';
import type { RouteInfo } from '../lib/router';
import { gregorianToHijri } from '../lib/hijri';
import Link from '../components/Link';
import toolSlugsData from '../data/toolslugs.json';
import priceGuidesData from '../data/price-guides.json';

const TOOL_SLUGS = (toolSlugsData as { slugs: Record<string, Record<string, string>> }).slugs;
const TOOL_ORDER = (toolSlugsData as { order: string[] }).order;
const AR_EXISTING = (toolSlugsData as { arExisting: string[] }).arExisting;

const SITE = 'https://alshafra.com';
type PriceGuideKind = 'gold' | 'usd';
type PriceGuideSection = { heading: string; paragraphs: string[] };
const PRICE_GUIDES = priceGuidesData as Record<PriceGuideKind, PriceGuideSection[]>;
function fillGuide(text: string, values: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}
function PriceGuide({ kind, country }: { kind: PriceGuideKind; country: (typeof COUNTRIES)[number] }) {
  const rate = rateFor(country.cur);
  const gram21 = (PRICES.xauUsd * rate * 0.875) / 31.1034768;
  const number = (value: number) => fmtNum(value, country.cur);
  const values = { country: country.ar || country.en, currency: country.curName, code: country.cur, rate: number(rate), ten: number(rate * 10), hundred: number(rate * 100), reverseBase: number(rate * 100), gram21: number(gram21), five21: number(gram21 * 5), updated: PRICES.updated };
  return <div className="mt-8 space-y-5">{PRICE_GUIDES[kind].map((section) => <section key={section.heading} className="card p-6 text-sm leading-loose text-brand-700/85"><h2 className="font-display text-lg font-bold text-brand-900">{fillGuide(section.heading, values)}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3">{fillGuide(paragraph, values)}</p>)}</section>)}</div>;
}

// ---------- أدوات مساعدة ----------
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  const { t } = useLang();
  return (
    <button
      type="button"
      className="btn-ghost !px-3 !py-1 text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* ignore */
        }
      }}
    >
      {ok ? t('ui.copied') : label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-display text-lg font-bold text-brand-900">{title}</h2>
      {children}
    </section>
  );
}

// ---------- الأدوات التفاعلية ----------
function FancyTextTool() {
  const { t, lang } = useLang();
  const [text, setText] = useState('');
  const styles = useMemo(() => allStyles(text, lang), [text, lang]);
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('ui.typeHere')}
        className="min-h-[90px] w-full rounded-xl border border-brand-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none"
      />
      <div className="mt-4 space-y-2">
        {styles.length === 0 && <p className="text-sm text-brand-500">{t('ui.typeHere')}</p>}
        {styles.map((s: FancyStyle, i) => (
          <div key={i} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <span className="min-w-0 flex-1 truncate text-sm" dir="auto">{s.value}</span>
            <CopyBtn text={s.value} label={t('ui.copy')} />
          </div>
        ))}
      </div>
    </div>
  );
}

const SYMBOL_GROUPS: { name: string; items: string[] }[] = [
  { name: '❤️', items: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❣', '💔', '♥', '♦', '♣', '♠', '❥', '❦', '❧', '♡', 'ღ', '۵', '💟'] },
  { name: '⭐', items: ['★', '☆', '⋆', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '⭐', '🌟', '💫', '✨', '⚡', '🔥', '🌙', '☀', '🌈'] },
  { name: '➜', items: ['→', '←', '↑', '↓', '↔', '↕', '➔', '➜', '➤', '⇒', '⇐', '⇑', '⇓', '⇔', '⟶', '⟵', '↗', '↘', '↙', '↖', '➡', '⬅', '⬆', '⬇'] },
  { name: '◆', items: ['◆', '◇', '■', '□', '●', '○', '▲', '△', '▼', '▽', '◄', '►', '◀', '▶', '▪', '▫', '▬', '◈', '◉', '◊', '○', '◎', '●', '◐'] },
  { name: '♪', items: ['♪', '♫', '♬', '♩', '♭', '♮', '♯', '🎵', '🎶', '🎼', '🎧', '🎤', '🥁', '🎹', '🎸'] },
  { name: '☀', items: ['☀', '☁', '⛅', '🌈', '⚡', '❄', '☃', '💧', '🌊', '🌪', '🔥', '🌍', '🌎', '🌏', '🌙', '☄', '🌟'] },
  { name: '♈', items: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🜲', '☿', '♀', '♁', '♂', '♃', '♄'] },
  { name: '$', items: ['$', '€', '£', '¥', '₹', '₽', '₺', '﷼', '₩', '₴', '₫', '₦', '₱', '฿', '₲', '₡', '₭', '₮', '₸', '₼', '₾', '₿', '¢', '¤'] },
  { name: '☺', items: ['☺', '☻', '😀', '😁', '😂', '🤣', '😊', '😍', '🤩', '😎', '🤗', '🙃', '😉', '😜', '🤪', '😴', '🥳', '😇', '🙄', '😅'] },
  { name: '✎', items: ['✎', '✏', '✐', '✑', '✒', '📝', '📖', '📚', '✂', '📌', '📍', '📎', '🖇', '🔖', '✉', '📩', '📧', '💌'] },
  { name: '⚽', items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '🏏', '⛳', '🥊', '🥋', '⛸', '🎿', '⛷', '🏂', '🎯'] },
  { name: '🚀', items: ['🚀', '✈', '🚁', '🚂', '🚗', '🚕', '🚙', '🚌', '🏎', '🚓', '🚑', '🚒', '🚜', '🚲', '🏍', '⛵', '🚢', '🛸', '🛰', '🗺', '⏰', '⌚'] },
];

function SymbolsTool() {
  const { t } = useLang();
  const [copied, setCopied] = useState('');
  return (
    <div className="space-y-4">
      {SYMBOL_GROUPS.map((g) => (
        <div key={g.name} className="card p-4">
          <div className="mb-2 text-lg font-bold text-brand-700">{g.name}</div>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-lg border border-brand-100 bg-white px-2 py-1 text-lg hover:border-brand-400 hover:bg-brand-50"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(s);
                    setCopied(s);
                    setTimeout(() => setCopied(''), 1200);
                  } catch {
                    /* ignore */
                  }
                }}
                title={copied === s ? t('ui.copied') : t('ui.copy')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PasswordTool() {
  const { t } = useLang();
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pw, setPw] = useState('');
  const gen = () => {
    const sets = [upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '', lower ? 'abcdefghijklmnopqrstuvwxyz' : '', nums ? '0123456789' : '', syms ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : ''].filter(Boolean);
    if (!sets.length) return;
    let out = '';
    for (let i = 0; i < len; i++) out += sets[i % sets.length][Math.floor(Math.random() * sets[i % sets.length].length)];
    setPw(out);
  };
  useEffect(() => gen(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const strength = len >= 16 && upper && lower && nums && syms ? t('ui.strong') : len >= 10 ? t('ui.medium') : t('ui.weak');
  return (
    <div className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">{t('ui.length')}: <input type="number" min={4} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-20 rounded-lg border border-brand-200 p-1.5 text-center" /></label>
        {([['ui.uppercase', upper, setUpper], ['ui.lowercase', lower, setLower], ['ui.numbers', nums, setNums], ['ui.symbols', syms, setSyms]] as const).map(([label, val, set], i) => (
          <label key={i} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} /> {t(label)}</label>
        ))}
        <button type="button" className="btn-primary !px-4 !py-1.5 text-sm" onClick={gen}>{t('ui.generate')}</button>
      </div>
      {pw && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50 p-3">
          <code className="break-all font-mono text-base" dir="ltr">{pw}</code>
          <CopyBtn text={pw} label={t('ui.copy')} />
        </div>
      )}
      <p className="text-xs text-brand-600">{t('ui.strength')}: {strength}</p>
    </div>
  );
}

function WordCounterTool() {
  const { t } = useLang();
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text ? text.split(/[.!?؟。]+/).filter((s) => s.trim()).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('ui.typeHere')} className="min-h-[120px] w-full rounded-xl border border-brand-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none" />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [t('ui.words'), words],
          [t('ui.characters'), chars],
          [t('ui.sentences'), sentences],
          [`${t('ui.readingTime')}`, `${minutes} ${t('ui.minutes')}`],
        ].map(([k, v], i) => (
          <div key={i} className="card p-3 text-center">
            <div className="stat-num text-2xl">{v}</div>
            <div className="text-xs text-brand-600">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PercentageTool() {
  const { t } = useLang();
  const [a, setA] = useState('20');
  const [c, setC] = useState('50');
  const [e1, setE1] = useState('120');
  const [e2, setE2] = useState('150');
  const b = 200;
  const d = 40;
  const p2 = Number(c) && d ? ((Number(c) / d) * 100).toFixed(1) : '0';
  const p3 = Number(e1) ? (((Number(e2) - Number(e1)) / Number(e1)) * 100).toFixed(1) : '0';
  return (
    <div className="space-y-4">
      <div className="card space-y-2 p-4">
        <p className="text-sm font-bold text-brand-800">{t('tools.percentage.title')}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-20 rounded-lg border border-brand-200 p-1.5 text-center" /> %
          {t('ui.result')}: <b>{(Number(a) / 100) * Number(b) || 0}</b>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input type="number" value={c} onChange={(e) => setC(e.target.value)} className="w-20 rounded-lg border border-brand-200 p-1.5 text-center" />
          {t('ui.result')}: <b>{p2}%</b>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input type="number" value={e1} onChange={(e) => setE1(e.target.value)} className="w-20 rounded-lg border border-brand-200 p-1.5 text-center" />
          →
          <input type="number" value={e2} onChange={(e) => setE2(e.target.value)} className="w-20 rounded-lg border border-brand-200 p-1.5 text-center" />
          : <b>{p3}%</b>
        </div>
      </div>
    </div>
  );
}

function CaseConverterTool() {
  const { t } = useLang();
  const [text, setText] = useState('');
  const cases: [string, string][] = [
    ['UPPER', text.toUpperCase()],
    ['lower', text.toLowerCase()],
    ['Title', text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())],
    ['Sentence', text.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())],
    ['aLtErNaTiNg', text.split('').map((ch, i) => (i % 2 ? ch.toLowerCase() : ch.toUpperCase())).join('')],
  ];
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('ui.typeHere')} className="min-h-[90px] w-full rounded-xl border border-brand-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none" />
      <div className="mt-3 space-y-2">
        {cases.map(([name, val], i) => (
          <div key={i} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <span className="min-w-0 flex-1 truncate text-sm" dir="auto">{val || '—'}</span>
            <span className="text-xs font-bold text-brand-400">{name}</span>
            <CopyBtn text={val} label={t('ui.copy')} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberConverterTool() {
  const { t } = useLang();
  const [num, setNum] = useState('42');
  const n = Number(num);
  const toRoman = (x: number): string => {
    if (!x || x < 1 || x > 3999) return '—';
    const map: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, s] of map) while (x >= v) { out += s; x -= v; }
    return out;
  };
  const arabicIndic = String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
  const rows: [string, string][] = [
    ['Western (0123)', String(n)],
    ['Arabic-Indic (٠١٢٣)', arabicIndic],
    ['Roman (XII)', toRoman(n)],
    ['Binary', n ? n.toString(2) : '—'],
    ['Hex', n ? n.toString(16).toUpperCase() : '—'],
  ];
  return (
    <div>
      <input type="number" value={num} onChange={(e) => setNum(e.target.value)} className="w-40 rounded-xl border border-brand-200 bg-white p-2.5 text-center text-sm focus:border-brand-500 focus:outline-none" />
      <div className="mt-3 space-y-2">
        {rows.map(([name, val], i) => (
          <div key={i} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <span className="text-xs font-bold text-brand-400">{name}</span>
            <span className="min-w-0 flex-1 truncate text-sm" dir="ltr">{val}</span>
            <CopyBtn text={val} label={t('ui.copy')} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgeTool() {
  const { t } = useLang();
  const [birth, setBirth] = useState('');
  const result = useMemo(() => {
    if (!birth) return null;
    const b = new Date(birth);
    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const hijri = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { years, months, days, hijri };
  }, [birth]);
  return (
    <div>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="rounded-xl border border-brand-200 bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
      {result && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="card p-4 text-center"><div className="stat-num text-2xl">{result.years}</div><div className="text-xs text-brand-600">{t('ui.length')}</div></div>
          <div className="card p-4 text-center"><div className="stat-num text-2xl">{result.months}</div><div className="text-xs text-brand-600">Months</div></div>
          <div className="card p-4 text-center"><div className="stat-num text-2xl">{result.days}</div><div className="text-xs text-brand-600">Days</div></div>
        </div>
      )}
    </div>
  );
}

function DateConverterTool() {
  const [g, setG] = useState('2026-08-09');
  const [h, setH] = useState('1448-02-26');
  const toHijri = () => {
    if (!g) return;
    const [y, m, d] = g.split('-').map(Number);
    const r = gregorianToHijri(y, m, d);
    setH(`${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`);
  };
  return (
    <div className="card space-y-4 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-brand-600">Gregorian</label>
          <input type="date" value={g} onChange={(e) => setG(e.target.value)} className="mt-1 w-full rounded-xl border border-brand-200 bg-white p-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-brand-600">Hijri</label>
          <input type="date" value={h} onChange={(e) => setH(e.target.value)} className="mt-1 w-full rounded-xl border border-brand-200 bg-white p-2.5 text-sm" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary !px-4 !py-1.5 text-sm" onClick={toHijri}>Gregorian → Hijri</button>
      </div>
    </div>
  );
}

function TodayTool() {
  const { lang } = useLang();
  const now = new Date();
  void now;
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fa' ? 'fa-IR' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : lang === 'sw' ? 'sw-KE' : `${lang}-${lang.toUpperCase()}`;
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijri = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return (
    <div className="card space-y-2 p-6 text-center">
      <div className="stat-num text-xl">{dateStr}</div>
      <div className="text-brand-600" dir="rtl">{hijri.day} {['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'][hijri.month - 1]} {hijri.year} هـ</div>
    </div>
  );
}

function CountdownTool() {
  const { lang } = useLang();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const nowDate = new Date(now);
  const targets: { label: string; date: Date }[] = [
    { label: 'New Year', date: new Date(nowDate.getFullYear() + 1, 0, 1) },
  ];
  if (!['ar', 'tr', 'fa', 'ur', 'id', 'ms', 'hi', 'bn', 'sw'].includes(lang)) {
    const xmas = new Date(nowDate.getFullYear(), 11, 25);
    targets.push({ label: 'Christmas', date: xmas < nowDate ? new Date(nowDate.getFullYear() + 1, 11, 25) : xmas });
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {targets.map((tg) => {
        const diff = Math.max(0, tg.date.getTime() - now);
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return (
          <div key={tg.label} className="card p-4 text-center">
            <div className="font-bold text-brand-700">{tg.label}</div>
            <div className="mt-2 flex justify-center gap-1 text-lg font-bold tabular-nums" dir="ltr">
              <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">{d}d</span>
              <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">{h}h</span>
              <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">{m}m</span>
              <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">{s}s</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- صفحات الدول ----------
function PriceHubPage({ kind }: { kind: PriceGuideKind }) {
  const { lang, t } = useLang();
  const isGold = kind === 'gold';
  const prefix = langPrefix(lang);
  const countries = COUNTRIES.filter((country) => (country.langs || []).includes(lang)).sort((a, b) => b.popM - a.popM);
  const path = `${prefix}/${isGold ? 'gold-price' : 'usd-rate'}`;
  const title = lang === 'ar' ? (isGold ? 'أسعار الذهب اليوم في الدول العربية حسب العيار' : 'سعر الدولار اليوم في الدول العربية') : (isGold ? 'Gold prices by country' : 'US dollar rates by country');
  useSeo({ title: `${title} | ${t('siteName')}`, canonical: `${SITE}${path}` });
  const example = countries.find((country) => country.slug === 'saudi-arabia') || countries[0];
  return <div className="container-page py-10"><h1 className="section-title">{title}</h1><p className="mt-2 text-sm text-brand-700/85">{lang === 'ar' ? 'اختر الدولة لعرض الجدول الكامل وطريقة الحساب والمصادر والتنبيهات.' : 'Choose a country for the full table, method and sources.'}</p><div className="card mt-5 overflow-x-auto p-5"><table className="w-full text-sm"><thead><tr><th>{lang === 'ar' ? 'الدولة' : 'Country'}</th><th>{lang === 'ar' ? 'العملة' : 'Currency'}</th><th>{isGold ? '21K' : '1 USD'}</th></tr></thead><tbody>{countries.map((country) => { const rate = rateFor(country.cur); const value = isGold ? (PRICES.xauUsd * rate * 0.875) / 31.1034768 : rate; return <tr key={country.slug}><td><Link to={`${path}/${country.slug}`}>{country.flag} {countryName(lang, country)}</Link></td><td>{country.cur}</td><td>{fmtNum(value, country.cur)}</td></tr>; })}</tbody></table></div>{lang === 'ar' && <section className="card mt-5 p-6 text-sm leading-loose text-brand-700/85"><h2 className="font-display text-lg font-bold text-brand-900">طريقة استخدام جدول الدول</h2><p className="mt-3">ابدأ باسم الدولة ثم راجع رمز العملة وتاريخ اللقطة قبل قراءة الرقم. لا تقارن كبر الأرقام بين عملتين بوصفه حكمًا على قوة الاقتصاد؛ الوحدات الاسمية مختلفة. افتح صفحة الدولة لعرض التفاصيل والمصدر والرسوم غير الداخلة في الحساب.</p><p className="mt-3">كل صف مرتبط مباشرة بصفحته حتى لا تبقى أسعار الدول صفحات يتيمة. عند نسخ رقم اكتب الدولة ورمز العملة ونوع السعر والكمية، وأعد الحساب يوم التنفيذ واطلب عرضًا من جهة مرخصة.</p><p className="mt-3">للمقارنة بين يومين، سجل القيمة والوقت والمصدر في صفين منفصلين ولا تقارن لقطة صباحية بعرض مسائي من دون تنبيه. حدّد هل السؤال عن سعر نقدي أم تحويل مصرفي أم بطاقة أم بيع وشراء متجر، لأن الهامش والرسوم تختلف. استخدم البوابة للوصول إلى الدولة المناسبة ثم أكّد السعر القابل للتنفيذ من الجهة التي ستتعامل معها.</p></section>}{lang === 'ar' && example ? <PriceGuide kind={kind} country={example} /> : null}</div>;
}

function GoldPage({ slug }: { slug: string }) {
  const { t, ta, lang } = useLang();
  const c = countryBySlug(slug);
  useSeo({ title: `${fillTemplate(t('gold.title'), { country: c ? countryName(lang, c) : slug })} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/gold-price/${slug}` });
  if (!c) return null;
  const rate = rateFor(c.cur);
  const ozLocal = PRICES.xauUsd * rate;
  const rows: [string, number][] = [
    ['24K', 1],
    ['22K', 0.9166],
    ['21K', 0.875],
    ['18K', 0.75],
  ];
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{fillTemplate(t('gold.title'), { country: countryName(lang, c) })}</h1>
      <p className="updated mt-1 text-xs text-brand-500">🗓️ {t('ui.lastUpdated')}: {PRICES.updated}</p>
      <div className="card mt-4 overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-100 text-right text-brand-600"><th className="py-2">{c.flag} {countryName(lang, c)}</th><th>{t('gold.title').includes('{') ? c.cur : c.cur}</th><th>USD</th></tr></thead>
          <tbody>
            {rows.map(([carat, f]) => (
              <tr key={carat} className="border-b border-brand-50">
                <td className="py-2 font-bold">{carat}</td>
                <td className="py-2 tabular-nums">{fmtNum((ozLocal * f) / 31.1034768, c.cur)} {c.cur}</td>
                <td className="py-2 tabular-nums">${fmtNum((PRICES.xauUsd * f) / 31.1034768, 'USD')}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-bold">1 oz (XAU)</td>
              <td className="py-2 tabular-nums">{fmtNum(ozLocal, c.cur)} {c.cur}</td>
              <td className="py-2 tabular-nums">${fmtNum(PRICES.xauUsd, 'USD')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="disclaimer mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{t('ui.disclaimer')}</div>
      {(ta('gold.intro') || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{fillTemplate(p, { country: countryName(lang, c), currency: c.curName })}</p>)}
      {lang === 'ar' && <PriceGuide kind="gold" country={c} />}
      <div className="mt-6 flex flex-wrap gap-2"><Link className="chip bg-brand-50 text-brand-700" to={`${langPrefix(lang)}/gold-price`}>{lang === 'ar' ? 'كل دول الذهب' : 'All countries'}</Link><Link className="chip bg-brand-50 text-brand-700" to={`${langPrefix(lang)}/usd-rate/${slug}`}>{lang === 'ar' ? 'سعر الدولار في الدولة' : 'USD rate'}</Link></div>
    </div>
  );
}

function UsdPage({ slug }: { slug: string }) {
  const { t, ta, lang } = useLang();
  const c = countryBySlug(slug);
  useSeo({ title: `${fillTemplate(t('usd.title'), { country: c ? countryName(lang, c) : slug })} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/usd-rate/${slug}` });
  if (!c) return null;
  const rate = rateFor(c.cur);
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{fillTemplate(t('usd.title'), { country: countryName(lang, c) })}</h1>
      <p className="mt-1 text-xs text-brand-500">🗓️ {t('ui.lastUpdated')}: {PRICES.updated}</p>
      <div className="card mt-4 p-5">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-100 text-right text-brand-600"><th className="py-2">1 USD → {c.cur}</th><th>1 {c.cur} → USD</th></tr></thead>
          <tbody><tr><td className="py-2 text-xl font-bold tabular-nums">{fmtNum(rate, c.cur)}</td><td className="py-2 tabular-nums">${(1 / rate).toFixed(4)}</td></tr></tbody>
        </table>
      </div>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{t('ui.disclaimer')}</div>
      {(ta('usd.intro') || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{fillTemplate(p, { country: countryName(lang, c), currency: c.curName })}</p>)}
      {lang === 'ar' && <PriceGuide kind="usd" country={c} />}
      <div className="mt-6 flex flex-wrap gap-2"><Link className="chip bg-brand-50 text-brand-700" to={`${langPrefix(lang)}/usd-rate`}>{lang === 'ar' ? 'كل دول الدولار' : 'All countries'}</Link><Link className="chip bg-brand-50 text-brand-700" to={`${langPrefix(lang)}/gold-price/${slug}`}>{lang === 'ar' ? 'سعر الذهب في الدولة' : 'Gold price'}</Link></div>
    </div>
  );
}

function DateTodayPage({ slug }: { slug: string }) {
  const { t, ta, lang } = useLang();
  const c = countryBySlug(slug);
  useSeo({ title: `${fillTemplate(t('dateToday.title'), { country: c ? countryName(lang, c) : slug })} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/date-today/${slug}` });
  if (!c) return null;
  const now = new Date();
  const locale = lang === 'ar' ? 'ar-SA' : 'en-GB';
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{fillTemplate(t('dateToday.title'), { country: countryName(lang, c) })}</h1>
      <div className="card mt-4 grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <div className="text-xs font-bold text-brand-500">{t('ui.lastUpdated')}</div>
          <div className="mt-1 text-xl font-bold">{c.flag} {countryName(lang, c)}</div>
          <div className="text-brand-700">{dateStr}</div>
        </div>
        <div>
          <div className="text-xs font-bold text-brand-500">Capital</div>
          <div className="mt-1 text-lg font-bold">{c.cap}</div>
          <div className="text-brand-700">{c.cur} — {c.curName}</div>
          <div className="text-brand-700">👥 ~{c.popM}M</div>
        </div>
      </div>
      {(ta('dateToday.intro') || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{fillTemplate(p, { country: countryName(lang, c), capital: c.cap, currency: c.curName })}</p>)}
    </div>
  );
}

// ---------- حروف وأسماء وقوائم ومقالات ----------
function LetterPage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const display = slug;
  useSeo({ title: `${fillTemplate(t('letters.title'), { letter: display })} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/fancy-letter/${slug}` });
  const styles = allStyles(display, lang).slice(0, 24);
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{fillTemplate(t('letters.title'), { letter: display })}</h1>
      <div className="mt-4 space-y-2">
        {styles.map((s, i) => (
          <div key={i} className="card flex items-center justify-between gap-2 p-3">
            <span className="flex-1 truncate text-xl" dir="auto">{s.value}</span>
            <CopyBtn text={s.value} label={t('ui.copy')} />
          </div>
        ))}
      </div>
      <Section title="A-Z">
        <div className="flex flex-wrap gap-1.5">
          {letters.map((l) => <Link key={l} to={`${langPrefix(lang)}/fancy-letter/${l}`} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">{l.toUpperCase()}</Link>)}
        </div>
      </Section>
    </div>
  );
}

function NamePage({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const n = nameBySlug(slug);
  const displayName = n ? ((lang === 'ar' || lang === 'fa' || lang === 'ur') && n.ar ? n.ar : n.en) : slug;
  useSeo({ title: `${fillTemplate(t('names.title'), { name: displayName })} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/name/${slug}` });
  if (!n) return null;
  const display = (lang === 'ar' || lang === 'fa' || lang === 'ur') && n.ar ? n.ar : n.en;
  const meaning = lang === 'ar' || lang === 'fa' || lang === 'ur' ? n.meaningAr || n.meaningEn : n.meaningEn;
  const styles = allStyles(display, lang).slice(0, 30);
  const related = NAMES.filter((x) => x.slug !== slug && x.origin === n.origin).slice(0, 30);
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{fillTemplate(t('names.title'), { name: display })}</h1>
      <div className="card mt-4 flex flex-wrap gap-4 p-5">
        <div className="min-w-[200px] flex-1">
          <div className="text-xs font-bold text-brand-500">{t('ui.meaning')}</div>
          <div className="mt-1 text-lg font-bold">{meaning}</div>
          <div className="mt-2 text-xs text-brand-600">{t('ui.gender')}: {t(n.gender === 'male' ? 'ui.male' : 'ui.female')}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {styles.map((s, i) => (
          <div key={i} className="card flex items-center justify-between gap-2 p-3">
            <span className="flex-1 truncate text-lg" dir="auto">{s.value}</span>
            <CopyBtn text={s.value} label={t('ui.copy')} />
          </div>
        ))}
      </div>
      <Section title={t('ui.related')}>
        <div className="flex flex-wrap gap-1.5">
          {related.map((x) => <Link key={x.slug} to={`${langPrefix(lang)}/name/${x.slug}`} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">{lang === 'ar' || lang === 'fa' || lang === 'ur' ? (x.ar || x.en) : x.en}</Link>)}
        </div>
      </Section>
    </div>
  );
}

function ListPage({ slug }: { slug: string }) {
  const { t, tj, lang } = useLang();
  const s = (tj(`lists.${slug}`) as unknown as { title: string; intro: string[] } | undefined) || { title: slug, intro: [] };
  useSeo({ title: `${s.title} | ${t('siteName')}`, canonical: `${SITE}${langPrefix(lang)}/names/${slug}` });
  let items: string[] = [];
  if (slug === 'cat') items = TRIVIA.catNames;
  else if (slug === 'dog') items = TRIVIA.dogNames;
  else if (slug === 'company') items = TRIVIA.companyNames;
  else {
    const g = slug === 'boy' ? 'male' : 'female';
    const origins = lang === 'ar' ? ['arabic'] : lang === 'fa' ? ['arabic', 'persian'] : lang === 'tr' ? ['turkish', 'arabic'] : ['english'];
    items = NAMES.filter((n) => n.gender === g && origins.includes(n.origin)).slice(0, 120).map((n) => (lang === 'ar' || lang === 'fa' || lang === 'ur') && n.ar ? n.ar : n.en);
  }
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{s.title}</h1>
      {(s.intro || []).map((p, i) => <p key={i} className="mt-2 text-sm leading-relaxed text-brand-700/85">{p}</p>)}
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span key={i} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">{it}</span>
        ))}
      </div>
    </div>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const { t, tj, lang } = useLang();
  const s = (tj(`articles.${slug}`) as unknown as { title: string; intro: string[]; faq?: { q: string; a: string }[] } | undefined) || { title: slug, intro: [] };
  const basePath = lang === 'ar' ? '/world' : `${langPrefix(lang)}/articles`;
  useSeo({ title: `${s.title} | ${t('siteName')}`, canonical: `${SITE}${basePath}/${slug}` });
  const data = articleData(lang, slug);
  let extra: React.ReactNode = null;
  if (data.items.length) {
    extra = <ul className="mt-4 space-y-2">{data.items.map((it, i) => <li key={i} className="card p-3 text-sm">{it}</li>)}</ul>;
  } else if (slug === 'morning-dhikr' || slug === 'evening-dhikr' || slug === 'daily-dua') {
    const key = slug === 'morning-dhikr' ? 'morning' : slug === 'evening-dhikr' ? 'evening' : 'dua';
    extra = <div className="mt-4 grid gap-2 sm:grid-cols-2">{TRIVIA.dhikr[key].map((d, i) => <div key={i} className="card p-3"><div className="font-bold">{d.text}</div><div className="text-xs text-brand-600">{d.detail}</div></div>)}</div>;
  } else if (slug === 'smallest-country' || slug === 'biggest-country') {
    const sorted = [...COUNTRIES].sort((a, b) => (slug === 'smallest-country' ? a.popM - b.popM : b.popM - a.popM));
    extra = <table className="mt-4 w-full text-sm"><thead><tr className="border-b border-brand-100 text-right text-brand-600"><th className="py-2">#</th><th>Country</th><th>👥</th></tr></thead><tbody>{sorted.slice(0, 10).map((c, i) => <tr key={c.slug} className="border-b border-brand-50"><td className="py-2">{i + 1}</td><td className="py-2">{c.flag} {countryName(lang, c)}</td><td className="py-2">~{c.popM}M</td></tr>)}</tbody></table>;
  }
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{s.title}</h1>
      {(s.intro || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{p}</p>)}
      {extra}
      {s.faq && s.faq.length > 0 && (
        <Section title="FAQ">
          {s.faq.map((f, i) => <div key={i} className="mb-2 card p-3"><div className="font-bold text-brand-800">{f.q}</div><div className="mt-1 text-sm text-brand-700/85">{f.a}</div></div>)}
        </Section>
      )}
      <Section title={t('ui.related')}>
        <div className="flex flex-wrap gap-1.5">
          {WORLD_ARTICLES.filter((a) => a !== slug).slice(0, 8).map((a) => <Link key={a} to={`${basePath}/${a}`} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">{t(`articles.${a}.title`)}</Link>)}
        </div>
      </Section>
    </div>
  );
}

// ---------- فهرس المقالات لكل لغة (/{lang}/articles) ----------
function ArticlesListPage() {
  const { t, lang } = useLang();
  const prefix = langPrefix(lang);
  useSeo({ title: `${t('nav.articles')} | ${t('siteName')}`, canonical: `${SITE}${prefix}/articles` });
  const slugs = [...WORLD_ARTICLES, ...(ISLAMIC_LANGS.includes(lang) ? DHIKR_ARTICLES : [])];
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{t('nav.articles')}</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {slugs.map((a) => (
          <Link key={a} to={`${prefix}/articles/${a}`} className="card p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="font-bold text-brand-800">{t(`articles.${a}.title`)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------- صفحة «كل الأدوات» لكل لغة (/{lang}/tools أو /adawat بالعربية) ----------
function ToolsHubPage() {
  const { t, ta, lang } = useLang();
  const prefix = langPrefix(lang);
  const slug = window.location.pathname.split('/').filter(Boolean).pop() || 'tools';
  useSeo({ title: `${t('tools.hub.title')} | ${t('siteName')}`, canonical: `${SITE}${prefix}/${slug}` });
  const items = TOOL_ORDER.filter((k) => k !== 'tools' && !(lang === 'ar' && AR_EXISTING.includes(k))).map((key) => {
    const sk = STRING_KEY[key] || key;
    const toolSlug = TOOL_SLUGS[key] && TOOL_SLUGS[key][lang] ? TOOL_SLUGS[key][lang] : TOOL_SLUGS[key]?.en;
    return { key, slug: toolSlug, title: t(`tools.${sk}.title`) };
  });
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{t('tools.hub.title')}</h1>
      {(ta('tools.hub.intro') || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{p}</p>)}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link key={it.key} to={`${prefix}/${it.slug}`} className="card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <span className="font-bold text-brand-800">{it.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------- المحور (الصفحة الرئيسية لكل لغة) ----------
function HubPage() {
  const { t, ta, lang } = useLang();
  const prefix = langPrefix(lang);
  useSeo({ title: `${t('home.title')} | ${t('siteName')}`, canonical: `${SITE}${prefix || '/'}` });
  const tools = [
    ['fancy-text', '✨'],
    ['symbols', '🔣'],
    ['password-generator', '🔒'],
    ['word-counter', '📝'],
    ['percentage-calculator', '🧮'],
    ['case-converter', '🔠'],
    ['number-converter', '🔢'],
    ['age-calculator', '🎂'],
    ['date-converter', '📅'],
    ['today', '🗓️'],
    ['countdown', '⏳'],
  ] as const;
  const topCountries = COUNTRIES.filter((c) => (c.langs || []).includes(lang)).sort((a, b) => b.popM - a.popM).slice(0, 12);
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{t('home.title')}</h1>
      {(ta('home.intro') || []).map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-brand-700/85">{p}</p>)}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(([key, icon]) => {
          // روابط الأدوات بمساراتها الموضعية الصحيحة حسب اللغة (وليس بالإنجليزية دائماً)
          const toolSlug = TOOL_SLUGS[key] && TOOL_SLUGS[key][lang] ? TOOL_SLUGS[key][lang] : TOOL_SLUGS[key]?.en;
          const sk = STRING_KEY[key] || key;
          return (
            <Link key={key} to={`${prefix}/${toolSlug}`} className="card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <span className="text-2xl">{icon}</span>
              <span className="font-bold text-brand-800">{t(`tools.${sk}.title`)}</span>
            </Link>
          );
        })}
      </div>
      <Section title={t('nav.gold')}>
        <div className="flex flex-wrap gap-1.5">
          {topCountries.map((c) => <Link key={c.slug} to={`${prefix}/gold-price/${c.slug}`} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">{c.flag} {countryName(lang, c)}</Link>)}
        </div>
      </Section>
      <Section title={t('nav.articles')}>
        <div className="flex flex-wrap gap-1.5">
          {WORLD_ARTICLES.slice(0, 8).map((a) => <Link key={a} to={lang === 'ar' ? `/world/${a}` : `${prefix}/articles/${a}`} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100">{t(`articles.${a}.title`)}</Link>)}
        </div>
      </Section>
    </div>
  );
}

// ---------- الموجّه الرئيسي للصفحات العالمية ----------
export default function GlobalPage({ info }: { info: RouteInfo }) {
  const { t } = useLang();
  switch (info.kind) {
    case 'tool': {
      // صفحة «كل الأدوات» (مثل /en/tools أو /adawat) — قائمة بالأدوات لا أداة واحدة
      if (info.param === 'tools') return <ToolsHubPage />;
      const Tool = TOOL_COMPONENTS[info.param || 'fancy-text'] || FancyTextTool;
      const sk = STRING_KEY[info.param || 'fancy-text'] || info.param;
      return <ToolShell title={t(`tools.${sk}.title`)}>{<Tool />}</ToolShell>;
    }
    case 'tools-hub': return <ToolsHubPage />;
    case 'gold-hub': return <PriceHubPage kind="gold" />;
    case 'usd-hub': return <PriceHubPage kind="usd" />;
    case 'gold': return <GoldPage slug={info.param || ''} />;
    case 'usd': return <UsdPage slug={info.param || ''} />;
    case 'date-today': return <DateTodayPage slug={info.param || ''} />;
    case 'letter': return <LetterPage slug={info.param || 'a'} />;
    case 'name': return <NamePage slug={info.param || ''} />;
    case 'list': return <ListPage slug={info.param || 'boy'} />;
    case 'article':
    case 'world-article': return <ArticlePage slug={info.param || ''} />;
    case 'articles-list': return <ArticlesListPage />;
    case 'hub':
    case 'home':
    default:
      return <HubPage />;
  }
}

const STRING_KEY: Record<string, string> = {
  'fancy-text': 'fancy-text', symbols: 'symbols', 'password-generator': 'password', 'word-counter': 'word-counter',
  'percentage-calculator': 'percentage', 'case-converter': 'case-converter', 'number-converter': 'number-converter',
  'age-calculator': 'age-calculator', 'date-converter': 'date-converter', today: 'today', countdown: 'countdown', tools: 'hub',
};

const TOOL_COMPONENTS: Record<string, () => React.ReactElement> = {
  'fancy-text': FancyTextTool,
  symbols: SymbolsTool,
  'password-generator': PasswordTool,
  'word-counter': WordCounterTool,
  'percentage-calculator': PercentageTool,
  'case-converter': CaseConverterTool,
  'number-converter': NumberConverterTool,
  'age-calculator': AgeTool,
  'date-converter': DateConverterTool,
  today: TodayTool,
  countdown: CountdownTool,
};

function ToolShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t, lang } = useLang();
  const prefix = langPrefix(lang);
  const slug = window.location.pathname.split('/').filter(Boolean).pop() || 'tools';
  useSeo({ title: `${title} | ${t('siteName')}`, canonical: `${SITE}${prefix}/${slug}` });
  return (
    <div className="container-page py-10">
      <h1 className="section-title">{title}</h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}
