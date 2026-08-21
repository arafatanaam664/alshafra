export type MediaVariantName = 'original' | 'thumbnail' | 'medium' | 'large' | 'social' | 'og';

export interface StorageObject {
  key: string;
  bytes: Uint8Array;
  contentType: string;
}

export interface StorageProvider {
  put(obj: StorageObject): Promise<void>;
  delete(key: string): Promise<void>;
  publicUrl?(key: string): string;
}

export function mediaObjectKey(id: string, variant: MediaVariantName, ext: string, at = new Date()): string {
  const y = at.getUTCFullYear();
  const m = String(at.getUTCMonth() + 1).padStart(2, '0');
  return `media/${y}/${m}/${id}/${variant}.${ext.replace(/^\./, '')}`;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
