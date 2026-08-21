export function decodeBase64Upload(raw: string): Uint8Array {
  const trimmed = raw.includes(',') ? raw.slice(raw.indexOf(',') + 1) : raw;
  const clean = trimmed.replace(/\s+/g, '');
  if (!clean) throw new Error('empty_file');
  return Uint8Array.from(Buffer.from(clean, 'base64'));
}
