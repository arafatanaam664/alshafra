import { useEffect, useState } from 'react';

export type RoutePath = string;

export function useRoute(): [RoutePath, (path: RoutePath) => void] {
  const [path, setPath] = useState<RoutePath>(() => normalize(window.location.pathname));

  useEffect(() => {
    const onChange = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  const navigate = (next: RoutePath) => {
    const target = next.startsWith('/') ? next : `/${next}`;
    if (normalize(window.location.pathname) === target) {
      setPath(target);
    } else {
      window.history.pushState({}, '', target);
      setPath(target);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [path, navigate];
}

function normalize(pathname: string): RoutePath {
  if (!pathname || pathname === '#') return '/';
  const stripped = pathname.startsWith('#') ? pathname.slice(1) : pathname;
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function parseRoute(path: RoutePath): { name: string; param?: string } {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return { name: 'home' };
  return { name: segments[0], param: segments[1] };
}
