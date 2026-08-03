import { useEffect, useState } from 'react';

export type RoutePath = string;

/**
 * Every component that calls `useRoute()` gets its own piece of state, so a
 * `history.pushState()` performed by one component (e.g. the header nav) used
 * to be invisible to the others (e.g. <App/>, which decides which page to
 * render). The result was a header whose links changed the URL without ever
 * changing the page. Broadcasting an event on navigation keeps every instance
 * in sync.
 */
const ROUTE_CHANGE_EVENT = 'alshafra:routechange';

export function useRoute(): [RoutePath, (path: RoutePath) => void] {
  const [path, setPath] = useState<RoutePath>(() => normalize(window.location.pathname));

  useEffect(() => {
    const onChange = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, onChange);
    // Sync once on mount in case the URL changed before this listener existed.
    onChange();
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(ROUTE_CHANGE_EVENT, onChange);
    };
  }, []);

  const navigate = (next: RoutePath) => {
    const target = next.startsWith('/') ? next : `/${next}`;
    if (normalize(window.location.pathname) !== target) {
      window.history.pushState({}, '', target);
    }
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [path, navigate];
}

function normalize(pathname: string): RoutePath {
  if (!pathname || pathname === '#') return '/';
  const stripped = pathname.startsWith('#') ? pathname.slice(1) : pathname;
  const withSlash = stripped.startsWith('/') ? stripped : `/${stripped}`;
  // Treat "/salaries" and "/salaries/" as the same route.
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

export function parseRoute(path: RoutePath): { name: string; param?: string } {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return { name: 'home' };
  return { name: segments[0], param: segments[1] };
}
