import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

/**
 * Real ad unit ids, once they exist in your AdSense account.
 * An <ins> with a placeholder slot ("0000000000") never fills, and repeatedly
 * requesting an unknown slot is a policy/quality risk during AdSense review —
 * so we render nothing at all until a real id is configured here.
 */
const VALID_SLOT = /^\d{8,}$/;
const PLACEHOLDER_SLOT = '0000000000';

export default function AdSlot({
  slot = PLACEHOLDER_SLOT,
  format = 'auto',
  className = '',
  label = 'إعلان',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const enabled = slot !== PLACEHOLDER_SLOT && VALID_SLOT.test(slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      // @ts-expect-error adsbygoogle is injected by external script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — silent fail
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`my-6 ${className}`}>
      <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">{label}</div>
      <div className="overflow-hidden rounded-xl border border-brand-900/5 bg-brand-50/40">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 100 }}
          data-ad-client="ca-pub-9822552442964714"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
