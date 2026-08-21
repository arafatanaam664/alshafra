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
