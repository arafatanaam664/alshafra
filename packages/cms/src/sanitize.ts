const ALLOWED = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'blockquote']);

export function sanitizeHtml(input: string): string {
  let html = String(input ?? '');
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '');
  html = html.replace(/<embed[\s\S]*?>/gi, '');
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/javascript:/gi, '');
  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED.has(name)) return '';
    if (name === 'br') return '<br />';
    if (name === 'a') {
      const href = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
      const url = (href?.[2] || href?.[3] || '').trim();
      if (!url || /^javascript:/i.test(url)) return full.startsWith('</') ? '</a>' : '<a>';
      return full.startsWith('</') ? '</a>' : `<a href="${url.replace(/"/g, '&quot;')}" rel="noopener noreferrer">`;
    }
    return full.startsWith('</') ? `</${name}>` : `<${name}>`;
  });
  return html;
}

export type BodyBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'callout'; text: string };

export function sanitizeBlocks(blocks: unknown): BodyBlock[] {
  if (!Array.isArray(blocks)) return [];
  const out: BodyBlock[] = [];
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue;
    const b = raw as Record<string, unknown>;
    if (b.type === 'p' || b.type === 'h2' || b.type === 'h3' || b.type === 'callout') {
      out.push({ type: b.type, text: sanitizeHtml(String(b.text ?? '')) });
    } else if (b.type === 'ul' && Array.isArray(b.items)) {
      out.push({ type: 'ul', items: b.items.map((i) => sanitizeHtml(String(i))) });
    }
  }
  return out;
}
