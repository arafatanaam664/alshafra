import { useState } from 'react';
import { Calendar, Menu, X, Clock, Coins, BookOpen, CalendarDays, Sparkles, Flag, HelpCircle, FileText, Wand2, Timer, Sun } from 'lucide-react';
import { useRoute } from '../lib/router';
import Link from './Link';

const NAV = [
  { to: '/', label: 'الرئيسية', icon: Calendar },
  { to: '/countdown', label: 'كم باقي على…', icon: Timer },
  { to: '/today', label: 'التاريخ اليوم', icon: Sun },
  { to: '/salaries', label: 'مواعيد الرواتب', icon: Coins },
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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/5 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          onClick={close}
          className="group flex items-center gap-2.5"
          aria-label="تقويم السعودية - الصفحة الرئيسية"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-soft transition-transform group-hover:scale-105">
            <Calendar className="h-5 w-5" />
          </span>
          <span className="text-right leading-tight">
            <span className="block font-display text-base font-bold text-brand-900">تقويم السعودية</span>
            <span className="block text-[11px] text-brand-600/70">بوابة المواعيد الرسمية</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
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

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-700 ring-1 ring-brand-200 lg:hidden"
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-900/5 bg-white lg:hidden">
          <nav className="container-page grid gap-1 py-3">
            {NAV.map((item) => {
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
