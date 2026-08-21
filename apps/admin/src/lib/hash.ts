import { useEffect, useState } from 'react';

export function navigate(to: string) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

export function useRoute(): string {
  const read = () => (window.location.hash.replace(/^#/, '') || '/');
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function match(route: string, pattern: string): Record<string, string> | null {
  const ra = route.split('?')[0].split('/').filter(Boolean);
  const pa = pattern.split('/').filter(Boolean);
  if (ra.length !== pa.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pa.length; i++) {
    if (pa[i].startsWith(':')) params[pa[i].slice(1)] = decodeURIComponent(ra[i]);
    else if (pa[i] !== ra[i]) return null;
  }
  return params;
}
