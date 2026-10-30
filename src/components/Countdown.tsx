import { useNow } from '../lib/useNow';
import { countdownRemaining } from '../lib/countdown-clock.mjs';
import type { GregorianDate } from '../lib/hijri';

interface CountdownProps {
  target: GregorianDate;
  compact?: boolean;
}

export default function Countdown({ target, compact = false }: CountdownProps) {
  const now = useNow(1000);
  const remaining = countdownRemaining(target, now.getTime());

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-display tabular-nums text-brand-700">
        <span className="text-lg font-bold">{remaining.days}</span>
        <span className="text-xs text-brand-600/70">يوم كامل</span>
        <span className="text-lg font-bold">{String(remaining.hours).padStart(2, '0')}</span>
        <span className="text-xs text-brand-600/70">س</span>
        <span className="text-lg font-bold">{String(remaining.minutes).padStart(2, '0')}</span>
        <span className="text-xs text-brand-600/70">د</span>
        <span className="text-lg font-bold">{String(remaining.seconds).padStart(2, '0')}</span>
        <span className="text-xs text-brand-600/70">ث</span>
      </div>
    );
  }

  const units = [
    { label: 'يوم كامل', value: remaining.days },
    { label: 'ساعة', value: remaining.hours },
    { label: 'دقيقة', value: remaining.minutes },
    { label: 'ثانية', value: remaining.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-xl bg-gradient-to-b from-white to-sand-50 p-3 text-center ring-1 ring-brand-900/5"
        >
          <div className="font-display text-2xl font-bold tabular-nums text-brand-700 sm:text-3xl">
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[11px] font-medium text-brand-600/70 sm:text-xs">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
