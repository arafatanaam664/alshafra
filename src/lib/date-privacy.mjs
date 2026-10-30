// These pages accept arbitrary dates, including birth dates. Keep in sync with
// prerender, routing, and advertising behavior via this single allowlist.
const PRIVATE_DATE_PATHS = new Set(['/age-calculator', '/date-converter', '/countdown']);
export function isPrivateDatePath(path) {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return PRIVATE_DATE_PATHS.has(normalized);
}
