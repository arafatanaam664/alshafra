import { useEffect, useState } from 'react';

export type RoutePath = string;

export function useRoute(): [RoutePath, (path: RoutePath) => void] {
  const [path, setPath] = useState<RoutePath>(() => normalize(window.location.hash));

  useEffect(() => {
    const onChange = () => setPath(normalize(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (next: RoutePath) => {
    const target = next.startsWith('/') ? next : `/${next}`;
    if (normalize(window.location.hash) === target) {
      setPath(target);
    } else {
      window.location.hash = target;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [path, navigate];
}

function normalize(hash: string): RoutePath {
  if (!hash || hash === '#') return '/';
  const stripped = hash.startsWith('#') ? hash.slice(1) : hash;
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function parseRoute(path: RoutePath): { name: string; param?: string } {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return { name: 'home' };
  return { name: segments[0], param: segments[1] };
}
