import { LocalDiskStorage, MemoryStorage } from './storage';
import { R2Storage, type R2Config } from './r2';
import { readPublicMediaBase } from './public';
import type { MediaDriver, StorageProvider } from './types';

export interface MediaEnv {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET?: string;
  R2_ENDPOINT?: string;
  R2_REGION?: string;
  PUBLIC_R2_PUBLIC_BASE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  MEDIA_DRIVER?: string;
  MEDIA_LOCAL_DIR?: string;
}

export function readMediaEnv(env: Record<string, string | undefined> = process.env): MediaEnv {
  return {
    R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: env.R2_BUCKET,
    R2_ENDPOINT: env.R2_ENDPOINT,
    R2_REGION: env.R2_REGION,
    PUBLIC_R2_PUBLIC_BASE_URL: env.PUBLIC_R2_PUBLIC_BASE_URL,
    R2_PUBLIC_BASE_URL: env.R2_PUBLIC_BASE_URL,
    MEDIA_DRIVER: env.MEDIA_DRIVER,
    MEDIA_LOCAL_DIR: env.MEDIA_LOCAL_DIR,
  };
}

export function r2ConfigFromEnv(env: MediaEnv = readMediaEnv()): R2Config | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET) {
    return null;
  }
  return {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    endpoint: env.R2_ENDPOINT,
    region: env.R2_REGION || 'auto',
    publicBaseUrl: readPublicMediaBase(env) || undefined,
  };
}

export function isR2Configured(env: MediaEnv = readMediaEnv()): boolean {
  return r2ConfigFromEnv(env) !== null;
}

export function resolveMediaDriver(env: MediaEnv = readMediaEnv()): MediaDriver {
  const forced = (env.MEDIA_DRIVER || '').toLowerCase();
  if (forced === 'memory' || forced === 'local' || forced === 'r2') {
    if (forced === 'r2' && !isR2Configured(env)) return 'local';
    return forced;
  }
  return isR2Configured(env) ? 'r2' : 'local';
}

export function createStorageFromEnv(env: MediaEnv = readMediaEnv()): StorageProvider {
  const driver = resolveMediaDriver(env);
  if (driver === 'memory') return new MemoryStorage();
  if (driver === 'r2') {
    const config = r2ConfigFromEnv(env);
    if (config) return new R2Storage(config);
  }
  return new LocalDiskStorage(env.MEDIA_LOCAL_DIR || '.data/media');
}

export function mediaStatus(env: MediaEnv = readMediaEnv()): {
  driver: MediaDriver;
  r2Configured: boolean;
  publicBaseConfigured: boolean;
  bucket: string | null;
  label: string;
} {
  const driver = resolveMediaDriver(env);
  const r2 = isR2Configured(env);
  return {
    driver,
    r2Configured: r2,
    publicBaseConfigured: Boolean(readPublicMediaBase(env)),
    bucket: env.R2_BUCKET || null,
    label:
      driver === 'r2'
        ? 'R2 جاهز'
        : r2
          ? 'R2 مُعرَّف لكن MEDIA_DRIVER محلي'
          : 'تخزين محلي — ضع مفاتيح R2 قبل الإطلاق',
  };
}
