const singlePages = new Set(['salaries', 'date-converter', 'age-calculator', 'hijri-calendar', 'school-calendar', 'holidays', 'today', 'faq', 'privacy', 'terms', 'about', 'contact']);
const decorationSlugs = new Set(['arabic', 'pubg', 'english', 'free-fire', 'french']);

/** Match the full path, not just its first segments. */
export function matchRoute(path, articleSlugs, countdownSlugs) {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path;
  if (clean === '/') return { name: 'home' };
  const match = /^\/([a-z-]+)(?:\/([a-z0-9-]+))?$/.exec(clean);
  if (!match) return { name: 'not-found' };
  const [, name, param] = match;
  if (!param && (singlePages.has(name) || ['articles', 'countdown', 'name-decoration'].includes(name))) return { name };
  if (param && ((name === 'articles' && articleSlugs.includes(param)) || (name === 'countdown' && countdownSlugs.includes(param)) || (name === 'name-decoration' && decorationSlugs.has(param)))) return { name, param };
  return { name: 'not-found' };
}
