import { useEffect, useRef, useState } from 'react';
import {
  ADSTERRA,
  adDensityForRoute,
  ownerOfDisplayKey,
  subscribeAdInventory,
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
  size?: AdsterraDisplaySize;
  /** Add a 160x300 below the desktop 160x600, never on mobile. */
  includeCompactSidebar?: boolean;
  className?: string;
  lazy?: boolean;
}

/**
 * Central ad slot. Pages ask for a named placement; this component picks the
 * size that fits, loads only that unit, and refuses to mount a key that is
 * already live elsewhere on the page.
 */
export default function AdPlacement({
  name,
  unit,
  size,
  includeCompactSidebar = false,
  className = '',
  lazy,
}: AdPlacementProps) {
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
    return (
      <SidebarAd
        key={page.path}
        density={page.density}
        includeCompact={includeCompactSidebar}
        className={className}
      />
    );
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

  if (unit === 'rectangle' || size) {
    if (page.density === 'minimal') return null;
    return (
      <ContentDisplay
        key={page.path}
        size={size ?? '300x250'}
        className={className}
        lazy={lazy ?? true}
      />
    );
  }

  return null;
}

/** Measure the content box: do not request hidden or oversized units. */
function ContentDisplay({ size, className, lazy }: {
  size: AdsterraDisplaySize;
  className?: string;
  lazy: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const apply = () => setFits(el.clientWidth >= ADSTERRA.displayBanners[size].width);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  return (
    <div ref={hostRef} className={`w-full min-w-0 ${className ?? ''}`}>
      {fits && <AdsterraDisplay size={size} placement="content" className="!my-0" lazy={lazy} />}
    </div>
  );
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
      const candidates: AdsterraDisplaySize[] =
        w >= 728 ? ['728x90', '468x60', '320x50', '300x250', '160x300'] :
        w >= 468 ? ['468x60', '320x50', '300x250', '160x300'] :
        w >= 320 ? ['320x50', '300x250', '160x300'] :
        w >= 300 ? ['300x250', '160x300', '320x50'] :
        w >= 160 ? ['160x300', '160x600'] : [];
      const preferred: AdsterraDisplaySize = w >= 728 ? '468x60' : w >= 468 ? '320x50' : '300x250';
      const ordered = [preferred, ...candidates.filter((candidate) => candidate !== preferred)];
      const available = (candidate: AdsterraDisplaySize) => {
        const banner = ADSTERRA.displayBanners[candidate];
        const owner = ownerOfDisplayKey(banner.key);
        return candidates.includes(candidate) && banner.width <= w && (!owner || owner === 'footer');
      };

      // Keep the reservation stable; header may reclaim it after a resize.
      setSize((prev) => prev && available(prev) ? prev : ordered.find(available) ?? null);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const unsubscribe = subscribeAdInventory(apply);
    return () => {
      ro.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <div ref={hostRef} className={`w-full overflow-x-hidden ${className}`}>
      {size && (
        <div className="flex justify-center py-2">
          <AdsterraDisplay
            size={size}
            placement="footer"
            reserve
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
  includeCompact,
  className,
}: {
  density: AdDensity;
  includeCompact: boolean;
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
    <div className={`flex flex-col items-center gap-6 ${className ?? ''}`}>
      <AdsterraDisplay size={size} placement="sidebar" className="!my-0" lazy />
      {includeCompact && <AdsterraDisplay size="160x300" placement="sidebar" className="!my-0" lazy />}
    </div>
  );
}
