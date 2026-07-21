import { Calendar, Mail, Github, Shield } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'الرئيسية' },
  { to: '/salaries', label: 'مواعيد الرواتب' },
  { to: '/hijri-calendar', label: 'التقويم الهجري' },
  { to: '/school-calendar', label: 'التقويم الدراسي' },
  { to: '/holidays', label: 'الإجازات الرسمية' },
  { to: '/date-converter', label: 'تحويل التاريخ' },
  { to: '/age-calculator', label: 'حاسبة العمر' },
  { to: '/name-decoration', label: 'زخرفة الأسماء' },
  { to: '/articles', label: 'مقالات' },
  { to: '/faq', label: 'الأسئلة الشائعة' },
];

export default function Footer({ navigate }: { navigate: (to: string) => void }) {
  return (
    <footer className="mt-20 border-t border-brand-900/10 bg-brand-900 text-brand-50">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-lg font-bold">تقويم السعودية</div>
                <div className="text-xs text-brand-200/80">بوابة المواعيد الرسمية</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-100/80">
              منصة سعودية شاملة تجمع مواعيد الرواتب وحساب المواطن والمتقاعدين والضمان الاجتماعي،
              التقويم الهجري والميلادي، التقويم الدراسي، والإجازات الرسمية، وأدوات تحويل التاريخ
              وحاسبة العمر — وفق تقويم أم القرى الرسمي.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white">روابط سريعة</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <button
                    onClick={() => navigate(l.to)}
                    className="text-brand-100/80 transition-colors hover:text-white"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white">معلومات ومسؤولية</h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>
                  التواريخ محسوبة وفق تقويم أم القرى التقريبي. للمسائل القانونية الرجاء الرجوع
                  للتقويم الرسمي الصادر عن المملكة العربية السعودية.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400" />
                <span>info@alshafra.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4 text-gold-400" />
                <span>تحديثات يومية تلقائية</span>
              </li>
            </ul>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-200/70">
              <li><button onClick={() => navigate('/about')} className="hover:text-white">عن الموقع</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white">اتصل بنا</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white">سياسة الخصوصية</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white">شروط الاستخدام</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-brand-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} تقويم السعودية — جميع الحقوق محفوظة.</p>
          <p>صُمّم بشغف لخدمة المواطن والمقيم في المملكة العربية السعودية.</p>
        </div>
      </div>
    </footer>
  );
}
