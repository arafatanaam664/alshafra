import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

export default function AdSlot({
  slot = '0000000000',
  format = 'auto',
  className = '',
  label = 'إعلان',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by external script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — silent fail
    }
  }, []);

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
