// These pages accept arbitrary dates, including birth dates. Keep in sync with
// prerender, routing, and advertising behavior via this single allowlist.
const PRIVATE_DATE_PATHS = new Set(['/age-calculator', '/date-converter', '/countdown']);
export function isPrivateDatePath(path) {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return PRIVATE_DATE_PATHS.has(normalized);
}

// Trust, navigation, sensitive pending-date pages and interactive tools remain
// ad-free in the preview until individual placements are reviewed.
const QUIET_PATHS = new Set(['/about', '/contact', '/privacy', '/terms', '/faq', '/articles', '/salaries', '/school-calendar', '/holidays', '/today', '/hijri-calendar', '/name-decoration']);
export function isIsolatedPath(path) {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return isPrivateDatePath(normalized) || QUIET_PATHS.has(normalized) || normalized.startsWith('/countdown/') || normalized.startsWith('/name-decoration/');
}
