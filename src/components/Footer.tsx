import { CalendarDays, Mail, Shield, Wrench } from 'lucide-react';
import Link from './Link';

const CALENDAR_LINKS = [
  { to: '/today', label: 'التاريخ اليوم' },
  { to: '/countdown', label: 'كم باقي على…' },
  { to: '/salaries', label: 'مواعيد الرواتب' },
  { to: '/hijri-calendar', label: 'التقويم الهجري' },
  { to: '/school-calendar', label: 'التقويم الدراسي' },
  { to: '/holidays', label: 'الإجازات الرسمية' },
  { to: '/date-converter', label: 'تحويل التاريخ' },
  { to: '/age-calculator', label: 'حاسبة العمر' },
];

const REPAIR_LINKS = [
  { to: '/fault-codes', label: 'دليل أكواد الأعطال' },
  { to: '/fault-codes/washing-machines', label: 'أكواد أعطال الغسالات' },
  { to: '/fault-codes/washing-machines/samsung', label: 'أكواد غسالات Samsung' },
  { to: '/fault-codes/washing-machines/lg', label: 'أكواد غسالات LG' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-900/10 bg-brand-900 text-brand-50">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15"><Wrench className="h-5 w-5" /></span>
              <div><div className="font-display text-lg font-bold">الشفرة</div><div className="text-xs text-brand-200/80">حلول وأدوات ومراجع عملية</div></div>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-loose text-brand-100/80">نحافظ على خدمات «تقويم السعودية» المفيدة ونضيف إليها «الشفرة إصلاح»: دليل عربي لفهم أكواد الأعطال والفحوص الآمنة بالرجوع إلى مصدر الشركة ورقم الموديل.</p>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-brand-100/75"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /><span>المعلومات العامة لا تستبدل كتيب جهازك أو تشخيص فني مؤهل، ولا نوصي بفتح الأجهزة أو تجاوز وسائل الأمان.</span></div>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white"><CalendarDays className="h-4 w-4 text-gold-400" />تقويم السعودية</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">{CALENDAR_LINKS.map((link) => <li key={link.to}><Link to={link.to} className="text-brand-100/80 transition-colors hover:text-white">{link.label}</Link></li>)}</ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white"><Wrench className="h-4 w-4 text-gold-400" />الشفرة إصلاح</h2>
            <ul className="mt-4 space-y-2 text-sm">{REPAIR_LINKS.map((link) => <li key={link.to}><Link to={link.to} className="text-brand-100/80 transition-colors hover:text-white">{link.label}</Link></li>)}</ul>
            <div className="mt-5 flex items-center gap-2 text-sm text-brand-100/80"><Mail className="h-4 w-4 text-gold-400" /><span>info@alshafra.com</span></div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-brand-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} الشفرة — جميع الحقوق محفوظة.</p>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <li><Link to="/about" className="hover:text-white">عن الموقع</Link></li>
            <li><Link to="/contact" className="hover:text-white">اتصل بنا</Link></li>
            <li><Link to="/privacy" className="hover:text-white">سياسة الخصوصية</Link></li>
            <li><Link to="/terms" className="hover:text-white">شروط الاستخدام</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
