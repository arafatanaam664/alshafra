import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, AD_SLOTS, type AdSlotKey } from '../lib/ads';

interface AdSlotProps {
  /** Which configured ad unit to render. */
  slot: AdSlotKey;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

/** Real AdSense ad unit ids are long digit strings. */
const VALID_SLOT = /^\d{8,}$/;

export default function AdSlot({
  slot,
  format = 'auto',
  className = '',
  label = 'إعلان',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const slotId = AD_SLOTS[slot];
  const enabled = VALID_SLOT.test(slotId);

  useEffect(() => {
    if (!enabled) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense not loaded yet — silent fail
    }
  }, [enabled]);

  // No configured ad unit means no <ins> element at all: requesting a slot
  // that does not exist never fills and only wastes impressions.
  if (!enabled) return null;

  return (
    <div className={`my-6 ${className}`}>
      <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-brand-500/60">{label}</div>
      <div className="overflow-hidden rounded-xl border border-brand-900/5 bg-brand-50/40">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 100 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
