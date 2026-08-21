import {
  Briefcase,
  Users,
  HandCoins,
  ShieldCheck,
  Home as HomeIcon,
  Coins,
  Calendar,
  Info,
} from 'lucide-react';
import { useSeo } from '../lib/seo';
import { todayGregorian, formatGregorian, formatHijri, gregorianToHijri, weekdayName } from '../lib/hijri';
import {
  SALARY_SCHEDULES,
  buildSalaryInstances,
  nextSalaryDate,
  type SalarySchedule,
} from '../lib/events';
import Countdown from '../components/Countdown';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Users,
  HandCoins,
  ShieldCheck,
  Home: HomeIcon,
};

export default function SalariesPage() {
  const today = todayGregorian();
  const instances = buildSalaryInstances(today);
  const sorted = [...instances].sort((a, b) => a.daysRemaining - b.daysRemaining);

  useSeo({
    title: 'مواعيد صرف الرواتب وحساب المواطن والمتقاعدين | تقويم السعودية',
    description:
      'مواعيد صرف رواتب الموظفين الحكوميين، حساب المواطن، رواتب المتقاعدين، الضمان الاجتماعي المطوّر، والدعم السكني في المملكة العربية السعودية مع عدّ تنازلي مباشر لكل موعد.',
    canonical: 'https://alshafra.com/salaries',
    keywords: 'مواعيد الرواتب, حساب المواطن, رواتب المتقاعدين, الضمان الاجتماعي, الدعم السكني, موعد الصرف',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: SALARY_SCHEDULES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.title,
      })),
    },
  });

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="section-title">مواعيد صرف الرواتب والدعم</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700/80">
          مواعيد صرف رواتب الموظفين الحكوميين، حساب المواطن، رواتب المتقاعدين، الضمان الاجتماعي
          المطوّر، والدعم السكني في المملكة العربية السعودية، مع عدّ تنازلي مباشر لكل موعد.
        </p>
      </header>

      {/* Next-up highlight */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-brand-900">أقرب موعد صرف</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 3).map((inst) => {
            const Icon = ICONS[inst.schedule.icon] ?? Coins;
            return (
              <div key={inst.schedule.id} className="card overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-l ${inst.schedule.accent}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${inst.schedule.accent} text-white`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-3xl font-bold tabular-nums text-brand-700">
                      {inst.daysRemaining}
                      <span className="mr-1 text-sm font-medium text-brand-600/70">يوم</span>
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-brand-900">{inst.schedule.title}</h3>
                  <p className="mt-1 text-xs text-brand-700/70">
                    {inst.gregorianText} — {inst.weekdayText}
                  </p>
                  <div className="mt-3">
                    <Countdown target={inst.date} compact />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full schedule */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-900">جدول مواعيد الصرف الشهرية</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {instances.map((inst) => (
            <SalaryCard key={inst.schedule.id} schedule={inst.schedule} instance={inst} />
          ))}
        </div>
      </section>

      {/* Upcoming 3 months for each */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-900">مواعيد الصرف للأشهر القادمة</h2>
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-brand-50 text-brand-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">البرنامج</th>
                  <th className="px-4 py-3 font-semibold">الشهر القادم</th>
                  <th className="px-4 py-3 font-semibold">التاريخ الميلادي</th>
                  <th className="px-4 py-3 font-semibold">التاريخ الهجري</th>
                  <th className="px-4 py-3 font-semibold">اليوم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
                {SALARY_SCHEDULES.map((s) => {
                  const next = nextSalaryDate(s, today);
                  const g1 = next;
                  const h1 = gregorianToHijri(g1.year, g1.month, g1.day);
                  const Icon = ICONS[s.icon] ?? Coins;
                  return (
                    <tr key={s.id} className="hover:bg-sand-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-brand-900">{s.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-brand-700/80">الشهر القادم</td>
                      <td className="px-4 py-3 tabular-nums">{formatGregorian(g1)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatHijri(h1)}</td>
                      <td className="px-4 py-3">{weekdayName(g1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
            <Info className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-brand-900">ملاحظة هامة</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-700/85">
              مواعيد الصرف المعروضة تقريبية بناءً على المواعيد الشهرية المعتادة لكل برنامج. قد تتغير
              المواعيد الفعلية بإعلان رسمي من الجهة المُصدرة (وزارة المالية، المؤسسة العامة للتقاعد،
              وزارة الموارد البشرية، برنامج سكني، إلخ). يُنصح بمتابعة الإعلانات الرسمية.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SalaryCard({
  schedule,
  instance,
}: {
  schedule: SalarySchedule;
  instance: ReturnType<typeof buildSalaryInstances>[number];
}) {
  const Icon = ICONS[schedule.icon] ?? Coins;
  return (
    <div className="card overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-l ${schedule.accent}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${schedule.accent} text-white`}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-brand-900">{schedule.title}</h3>
              <p className="mt-0.5 text-xs text-brand-700/70">
                <Calendar className="ml-1 inline h-3.5 w-3.5" />
                يُصرف يوم {schedule.dayOfMonth} من كل شهر ميلادي
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-brand-700/80">{schedule.description}</p>
        <div className="mt-5 rounded-xl bg-sand-50 p-4 ring-1 ring-brand-900/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-brand-600/70">أقرب موعد صرف</div>
              <div className="mt-0.5 font-display text-base font-bold text-brand-900">{instance.gregorianText}</div>
              <div className="text-xs text-brand-700/70">{instance.hijriText} — {instance.weekdayText}</div>
            </div>
            <div className="text-left">
              <div className="font-display text-3xl font-bold tabular-nums text-brand-700">{instance.daysRemaining}</div>
              <div className="text-[11px] text-brand-600/70">يوم متبقي</div>
            </div>
          </div>
          <div className="mt-4">
            <Countdown target={instance.date} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
