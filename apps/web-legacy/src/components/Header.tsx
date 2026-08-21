import { useState } from 'react';
import { Calendar, Menu, X, Clock, Coins, BookOpen, CalendarDays, Sparkles, Flag, HelpCircle, FileText, Wand2, Timer, Sun, TrendingUp, Gem, BadgeDollarSign } from 'lucide-react';
import { useRoute, parseRoute } from '../lib/router';
import { useLang } from '../lib/i18n';
import Link from './Link';
import LangSwitcher from './LangSwitcher';
import toolSlugsData from '../data/toolslugs.json';

const TOOL_SLUGS = (toolSlugsData as { slugs: Record<string, Record<string, string>> }).slugs;

const NAV = [
  { to: '/', label: 'الرئيسية', icon: Calendar },
  { to: '/countdown', label: 'كم باقي على…', icon: Timer },
  { to: '/today', label: 'التاريخ اليوم', icon: Sun },
  { to: '/salaries', label: 'مواعيد الرواتب', icon: Coins },
  { to: '/gold-price', label: 'أسعار الذهب', icon: Gem },
  { to: '/usd-rate', label: 'أسعار الدولار', icon: BadgeDollarSign },
  { to: '/trending', label: 'المواضيع الرائجة', icon: TrendingUp },
  { to: '/hijri-calendar', label: 'التقويم الهجري', icon: CalendarDays },
  { to: '/school-calendar', label: 'التقويم الدراسي', icon: BookOpen },
  { to: '/holidays', label: 'الإجازات الرسمية', icon: Flag },
  { to: '/date-converter', label: 'تحويل التاريخ', icon: Clock },
  { to: '/age-calculator', label: 'حاسبة العمر', icon: Sparkles },
  { to: '/name-decoration', label: 'زخرفة الأسماء', icon: Wand2 },
  { to: '/articles', label: 'مقالات', icon: FileText },
  { to: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
];

export default function Header() {
  const [path] = useRoute();
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const info = parseRoute(path);
  // نفس منطق App.tsx: المقالات السعودية (/articles و /articles/*) والمواضيع
  // الرائجة (/trending*) صفحات عربية مستقلة ولا تُعتبر «عالمية»، أما المقالات
  // العالمية بالعربية (/world/*) فتُعرض بتصميم اللغات العالمي.
  const isGlobal =
    lang !== 'ar' ||
    (['hub', 'tool', 'tools-hub', 'gold-hub', 'usd-hub', 'gold', 'usd', 'date-today', 'letter', 'name', 'list', 'article', 'world-article', 'articles-list'].includes(info.kind) &&
      info.kind !== 'article' &&
      info.kind !== 'articles-list');
  const brand = isGlobal ? t('siteName') : 'تقويم السعودية';
  const tagline = isGlobal ? t('siteTagline') : 'بوابة المواعيد الرسمية';
  const prefix = lang === 'ar' ? '' : `/${lang}`;

  // مسار «كل الأدوات» الموضعي حسب اللغة (مثل /adawat للعربية و /tools للإنجليزية)
  const toolsSlug = TOOL_SLUGS.tools && TOOL_SLUGS.tools[lang] ? TOOL_SLUGS.tools[lang] : 'tools';
  const globalNav = [
    { to: `${prefix || '/'}`, label: t('nav.home'), icon: Calendar },
    { to: `${prefix}/${toolsSlug}`, label: t('nav.tools'), icon: Wand2 },
    { to: `${prefix}/gold-price`, label: lang === 'ar' ? 'أسعار الذهب' : 'Gold', icon: Gem },
    { to: `${prefix}/usd-rate`, label: lang === 'ar' ? 'أسعار الدولار' : 'USD', icon: BadgeDollarSign },
    { to: `${prefix}/articles`, label: t('nav.articles'), icon: FileText },
  ];

  const navItems = isGlobal ? globalNav : NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/5 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to={prefix || '/'}
          onClick={close}
          className="group flex items-center gap-2.5"
          aria-label={brand}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-soft transition-transform group-hover:scale-105">
            <Calendar className="h-5 w-5" />
          </span>
          <span className="text-right leading-tight">
            <span className="block font-display text-base font-bold text-brand-900">{brand}</span>
            <span className="block max-w-[160px] truncate text-[11px] text-brand-600/70">{tagline}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = path === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link flex items-center gap-1.5 ${active ? 'nav-link-active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <LangSwitcher />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-700 ring-1 ring-brand-200 lg:hidden"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-900/5 bg-white lg:hidden">
          <nav className="container-page grid gap-1 py-3">
            {navItems.map((item) => {
              const active = path === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active ? 'bg-brand-600 text-white' : 'text-brand-800 hover:bg-brand-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
