export function parseBlocks(value: unknown): BodyBlock[] {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? (raw as BodyBlock[]) : [];
}

export type BodyBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'source'; label: string; url: string }
  | { type: 'callout'; text: string };

export function blocksToPlainText(blocks: BodyBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.type === 'p' || b.type === 'h2' || b.type === 'h3' || b.type === 'callout') parts.push(b.text);
    else if (b.type === 'ul') parts.push(...b.items);
    else if (b.type === 'faq') parts.push(...b.items.flatMap((i) => [i.q, i.a]));
    else if (b.type === 'source') parts.push(b.label);
  }
  return parts.join(' ');
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build static HTML from CMS blocks. No React. Safe for Astro `set:html`. */
export function blocksToHtml(blocks: BodyBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === 'p') parts.push(`<p>${escapeHtml(block.text)}</p>`);
    else if (block.type === 'h2') parts.push(`<h2>${escapeHtml(block.text)}</h2>`);
    else if (block.type === 'h3') parts.push(`<h3>${escapeHtml(block.text)}</h3>`);
    else if (block.type === 'callout') parts.push(`<aside class="callout"><p>${escapeHtml(block.text)}</p></aside>`);
    else if (block.type === 'ul') {
      parts.push(`<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    } else if (block.type === 'faq') {
      parts.push(
        `<section><h2>الأسئلة الشائعة</h2>${block.items
          .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
          .join('')}</section>`,
      );
    } else if (block.type === 'source') {
      parts.push(
        `<p class="source"><a href="${escapeHtml(block.url)}" rel="noopener noreferrer">${escapeHtml(block.label)}</a></p>`,
      );
    }
  }
  return parts.join('');
}

/** Preferred unique length is ~800. Index only from this floor so we do not pad to 1500. */
export const QUALITY_INDEX_MIN_WORDS = 400;
export const QUALITY_PREFERRED_WORDS = 800;
export const QUALITY_MIN_DESCRIPTION = 70;

export function passesQualityGate(input: { uniqueTextWordCount: number; description: string; html: string }): boolean {
  return (
    input.uniqueTextWordCount >= QUALITY_INDEX_MIN_WORDS &&
    input.description.trim().length >= QUALITY_MIN_DESCRIPTION &&
    input.html.trim().length > 0
  );
}
