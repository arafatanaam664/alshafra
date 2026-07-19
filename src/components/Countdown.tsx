import { useEffect, useState } from 'react';
import type { GregorianDate } from '../lib/hijri';
import { gregorianToJdn } from '../lib/hijri';

interface CountdownProps {
  target: GregorianDate;
  compact?: boolean;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function compute(targetJdn: number, now: Date): Remaining {
  // Compute diff in ms from now to target midnight using a fixed epoch:
  // jdn -> days since 1970-01-01 (jdn 2440588)
  const daysSinceEpoch = targetJdn - 2440588;
  const targetMs = daysSinceEpoch * 86400000;
  const nowMs = now.getTime();
  let diff = targetMs - nowMs;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

export default function Countdown({ target, compact = false }: CountdownProps) {
  const targetJdn = gregorianToJdn(target.year, target.month, target.day);
  const [remaining, setRemaining] = useState<Remaining>(() => compute(targetJdn, new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(compute(targetJdn, new Date())), 1000);
    return () => window.clearInterval(id);
  }, [targetJdn]);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-display tabular-nums text-brand-700">
        <span className="text-lg font-bold">{remaining.days}</span>
        <span className="text-xs text-brand-600/70">يوم</span>
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
    { label: 'يوم', value: remaining.days },
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
