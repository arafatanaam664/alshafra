export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function p(text: string): string {
  return `<p>${esc(text)}</p>`;
}

export function h2(text: string): string {
  return `<h2>${esc(text)}</h2>`;
}

export function h3(text: string): string {
  return `<h3>${esc(text)}</h3>`;
}

export function ul(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

export function faqHtml(faq: { q: string; a: string }[]): string {
  if (!faq.length) return '';
  return `<section>${h2('الأسئلة الشائعة')}${faq
    .map((item) => `${h3(item.q)}${p(item.a)}`)
    .join('')}</section>`;
}

export function sourcesHtml(sources: { label: string; url: string }[]): string {
  if (!sources.length) return '';
  return `<section>${h2('المصادر')}${ul(
    sources.map((s) => `<a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.label)}</a>`),
  )}</section>`;
}

export function relatedHtml(links: { href: string; title: string }[]): string {
  const unique = links.filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i).slice(0, 8);
  if (!unique.length) return '';
  return `<section class="related-links">${h2('مواضيع ذات صلة')}<div class="grid gap-2 sm:grid-cols-2">${unique
    .map((l) => `<a class="card p-3 text-sm font-medium text-brand-800" href="${esc(l.href)}">${esc(l.title)}</a>`)
    .join('')}</div></section>`;
}
