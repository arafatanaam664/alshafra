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
    if (page.density !== 'high') return null;
    return <FooterAd key={page.path} className={className} />;
  }

  if (name === 'sidebar') {
    if (page.density === 'light' || page.density === 'minimal') return null;
    return <SidebarAd key={page.path} density={page.density} className={className} />;
  }

  if (unit === 'native') {
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
    if (page.density === 'light' || page.density === 'minimal') return null;
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
      const next = pickLeaderboardSize(el.clientWidth);
      // Footer never reuses the header leaderboard. 728 is header-only;
      // footer takes 468 when the slot is wide enough that header already
      // took 728. If the slot is mid-width, header owns 468, so we skip.
      setSize((prev) => {
        const candidate = next === '728x90' ? '468x60' : null;
        if (!candidate) return null;
        if (!prev) return candidate;
        const prevWidth = ADSTERRA.displayBanners[prev].width;
        if (el.clientWidth < prevWidth) return candidate;
        return prev;
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
