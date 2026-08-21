import { createHash } from 'node:crypto';
import { readImageSize, stripJpegExif } from './dimensions';
import type { MediaLimits, ValidatedUpload } from './types';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const EDITORIAL_LIMITS: MediaLimits = { maxBytes: 8 * 1024 * 1024, maxPixels: 6000 };
export const UGC_LIMITS: MediaLimits = { maxBytes: 1 * 1024 * 1024, maxPixels: 2000 };

const MAGIC: Record<AllowedImageType, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (bytes) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) =>
    bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  'image/gif': (bytes) => {
    const header = String.fromCharCode(...bytes.subarray(0, 6));
    return header === 'GIF87a' || header === 'GIF89a';
  },
  'image/webp': (bytes) =>
    String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP',
};

export function looksLikeSvg(bytes: Uint8Array): boolean {
  const head = Buffer.from(bytes.subarray(0, 256)).toString('utf8').trim().toLowerCase();
  return head.includes('<svg') || (head.startsWith('<?xml') && head.includes('<svg'));
}

export function sniffImageMime(bytes: Uint8Array): AllowedImageType | null {
  for (const mime of ALLOWED_IMAGE_TYPES) {
    if (MAGIC[mime](bytes)) return mime;
  }
  return null;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function validateEditorialImage(
  bytes: Uint8Array,
  claimedType: string,
  limits: MediaLimits = EDITORIAL_LIMITS,
): ValidatedUpload {
  if (!bytes.byteLength) throw new Error('empty_file');
  if (bytes.byteLength > limits.maxBytes) throw new Error('file_too_large');
  if (looksLikeSvg(bytes) || claimedType === 'image/svg+xml') throw new Error('svg_forbidden');
  if (claimedType === 'application/pdf') throw new Error('pdf_not_enabled');

  const sniffed = sniffImageMime(bytes);
  if (!sniffed) throw new Error('unsupported_type');
  if (claimedType && claimedType !== 'application/octet-stream' && claimedType !== sniffed) {
    const jpegAlias = sniffed === 'image/jpeg' && (claimedType === 'image/jpg' || claimedType === 'image/pjpeg');
    if (!jpegAlias) throw new Error('mime_mismatch');
  }

  let payload = bytes;
  if (sniffed === 'image/jpeg') payload = stripJpegExif(bytes);

  const size = readImageSize(payload);
  if (!size || size.width < 1 || size.height < 1) throw new Error('invalid_dimensions');
  if (size.width > limits.maxPixels || size.height > limits.maxPixels) throw new Error('image_too_large');

  const ext = sniffed === 'image/jpeg' ? 'jpg' : sniffed.split('/')[1];
  return {
    bytes: payload,
    mime: sniffed,
    ext,
    width: size.width,
    height: size.height,
    sha256: sha256Hex(payload),
  };
}

export const VARIANT_PLAN = [
  { variant: 'original', maxWidth: 2000, format: 'original' },
  { variant: 'thumbnail', maxWidth: 320, format: 'webp' },
  { variant: 'medium', maxWidth: 768, format: 'webp' },
  { variant: 'large', maxWidth: 1280, format: 'webp' },
  { variant: 'social', maxWidth: 1200, maxHeight: 630, format: 'jpeg', crop: { width: 1200, height: 630 } },
  { variant: 'og', maxWidth: 1200, maxHeight: 630, format: 'jpeg', crop: { width: 1200, height: 630 } },
] as const;
