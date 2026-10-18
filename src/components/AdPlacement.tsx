import { useEffect, useRef, useState } from 'react';
import {
  ADSTERRA,
  adDensityForRoute,
  pickLeaderboardSize,
  pickSidebarSize,
  type AdDensity,
  type AdPlacementName,
  type AdsterraDisplaySize,
} from '../lib/ads';
import { parseRoute, useRoute } from '../lib/router';
import AdsterraBanner from './AdsterraBanner';
import AdsterraDisplay from './AdsterraDisplay';

interface AdPlacementProps {
  name: AdPlacementName;
  unit?: 'native' | 'rectangle';
  className?: string;
  lazy?: boolean;
}

/**
 * Central ad slot. Pages ask for a named placement; this component picks the
 * size that fits, loads only that unit, and refuses to mount a key that is
 * already live elsewhere on the page.
 */
export default function AdPlacement({ name, unit, className = '', lazy }: AdPlacementProps) {
  const [path] = useRoute();
  const { name: routeName } = parseRoute(path);
  const page = {
    path,
    density: adDensityForRoute(routeName),
  };

  if (page.density === 'minimal' && name !== 'content') return null;

  if (name === 'header') {
    if (page.density === 'minimal') return null;
    return <HeaderAd key={page.path} className={className} />;
  }

  if (name === 'footer') {
    if (page.density === 'minimal') return null;
    return <FooterAd key={page.path} className={className} />;
  }

  if (name === 'sidebar') {
    if (page.density === 'minimal') return null;
    return <SidebarAd key={page.path} density={page.density} className={className} />;
  }

  if (unit === 'native') {
    if (page.density === 'minimal') return null;
    return (
      <AdsterraBanner
        key={page.path}
        className={className}
        placement="content"
        lazy={lazy ?? true}
      />
    );
  }

  if (unit === 'rectangle') {
    if (page.density === 'minimal') return null;
    return (
      <AdsterraDisplay
        key={page.path}
        size="300x250"
        placement="content"
        className={className}
        lazy={lazy ?? true}
      />
    );
  }

  return null;
}

function HeaderAd({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<AdsterraDisplaySize | null>(() =>
    typeof window === 'undefined' ? null : pickLeaderboardSize(window.innerWidth)
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const apply = () => {
      const next = pickLeaderboardSize(el.clientWidth);
      setSize((prev) => {
        if (!next) return null;
        if (!prev) return next;
        const prevWidth = ADSTERRA.displayBanners[prev].width;
        if (el.clientWidth < prevWidth) return next;
        return prev;
      });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`w-full overflow-x-hidden border-b border-brand-900/5 bg-white ${className}`}
    >
      <div className="flex justify-center px-0 py-2">
        {size && (
          <AdsterraDisplay
            size={size}
            placement="header"
            className="!my-0"
            lazy={false}
          />
        )}
      </div>
    </div>
  );
}

function FooterAd({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<AdsterraDisplaySize | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const apply = () => {
      const w = el.clientWidth;
      const candidates: AdsterraDisplaySize[] = [];
      if (w >= 728) candidates.push('728x90', '468x60', '320x50');
      else if (w >= 468) candidates.push('468x60', '320x50');
      else if (w >= 320) candidates.push('320x50');

      if (candidates.length === 0) {
        setSize(null);
        return;
      }

      // Prefer the largest that is not already taken by header.
      // If all are taken, fall back to the smallest that fits.
      setSize((prev) => {
        // If container shrank below previous size, downgrade.
        if (prev) {
          const prevWidth = ADSTERRA.displayBanners[prev].width;
          if (w < prevWidth) {
            // Find first candidate that fits and is <= previous width
            const next = candidates.find((c) => ADSTERRA.displayBanners[c].width <= w) ?? null;
            return next;
          }
          // If container grew, allow upgrade only if it fits and not blocked logic handled by AdsterraDisplay.
          // Keep current to avoid flicker unless width grew significantly.
          return prev;
        }
        // Initial pick: try 468 when 728 is available (header likely took 728), otherwise first free.
        // To maximize footer visibility, if width >=728 we start with 468 (header owns 728).
        if (w >= 728) return '468x60';
        return candidates[0];
      });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={`w-full overflow-x-hidden ${className}`}>
      {size && (
        <div className="flex justify-center py-2">
          <AdsterraDisplay
            size={size}
            placement="footer"
            className="!my-0"
            lazy
          />
        </div>
      )}
    </div>
  );
}

function SidebarAd({
  density,
  className,
}: {
  density: AdDensity;
  className?: string;
}) {
  const [wide, setWide] = useState(false);
  const size = pickSidebarSize(density);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!wide || !size) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <AdsterraDisplay size={size} placement="sidebar" className="!my-0" lazy />
    </div>
  );
}
