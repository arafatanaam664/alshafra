export type MediaVariantName = 'original' | 'thumbnail' | 'medium' | 'large' | 'social' | 'og';
export type MediaVisibility = 'public' | 'private';
export type MediaDriver = 'memory' | 'local' | 'r2';

export interface StorageObject {
  key: string;
  bytes: Uint8Array;
  contentType: string;
  sha256?: string;
  variant?: MediaVariantName;
}

export interface StorageProvider {
  readonly driver: MediaDriver;
  put(obj: StorageObject): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  publicUrl?(key: string): string | null;
}

export interface MediaLimits {
  maxBytes: number;
  maxPixels: number;
}

export interface ValidatedUpload {
  bytes: Uint8Array;
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  ext: string;
  width: number;
  height: number;
  sha256: string;
}

export interface MediaRecord {
  id: string;
  objectKey: string;
  mime: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  sha256: string | null;
  visibility: MediaVisibility;
  publicUrl: string | null;
  createdAt?: string;
}

export interface VariantPlan {
  variant: MediaVariantName;
  maxWidth: number;
  maxHeight?: number;
  format: 'webp' | 'jpeg' | 'original';
  crop?: { width: number; height: number };
}

export interface IngestInput {
  filename: string;
  contentType: string;
  bytes: Uint8Array;
  alt?: string;
  caption?: string;
  credit?: string;
  visibility?: MediaVisibility;
  uploadedBy?: string | null;
}

export interface IngestResult {
  media: MediaRecord;
  reused: boolean;
  variantsPlanned: VariantPlan[];
}
