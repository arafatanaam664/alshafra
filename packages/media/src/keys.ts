import type { MediaVariantName, MediaVisibility } from './types';

export function mediaObjectKey(
  id: string,
  variant: MediaVariantName,
  ext: string,
  at = new Date(),
  visibility: MediaVisibility = 'public',
): string {
  const safeExt = ext.replace(/^\./, '').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'bin';
  if (visibility === 'private') return `private/${id}/${variant}.${safeExt}`;
  const y = at.getUTCFullYear();
  const m = String(at.getUTCMonth() + 1).padStart(2, '0');
  return `media/${y}/${m}/${id}/${variant}.${safeExt}`;
}

export function extForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'application/pdf') return 'pdf';
  return 'bin';
}
