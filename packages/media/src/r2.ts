import { signAwsV4 } from './aws4';
import { publicObjectUrl } from './public';
import type { MediaDriver, StorageObject, StorageProvider } from './types';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
  region?: string;
  publicBaseUrl?: string;
}

export function r2Endpoint(config: Pick<R2Config, 'accountId' | 'endpoint'>): string {
  return (config.endpoint || `https://${config.accountId}.r2.cloudflarestorage.com`).replace(/\/+$/, '');
}

export function r2ObjectUrl(config: R2Config, key: string): URL {
  const encoded = key
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return new URL(`${r2Endpoint(config)}/${config.bucket}/${encoded}`);
}

export function buildR2Request(
  config: R2Config,
  method: 'PUT' | 'DELETE' | 'GET',
  key: string,
  body: Uint8Array = new Uint8Array(),
  extraHeaders: Record<string, string> = {},
  now?: Date,
): { url: string; headers: Record<string, string> } {
  const url = r2ObjectUrl(config, key);
  const signed = signAwsV4({
    method,
    url,
    headers: extraHeaders,
    body,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region || 'auto',
    service: 's3',
    now,
  });
  return { url: url.toString(), headers: signed.headers };
}

export class R2Storage implements StorageProvider {
  readonly driver: MediaDriver = 'r2';

  constructor(private readonly config: R2Config) {}

  async put(obj: StorageObject): Promise<void> {
    const req = buildR2Request(this.config, 'PUT', obj.key, obj.bytes, {
      'content-type': obj.contentType,
    });
    const res = await fetch(req.url, { method: 'PUT', headers: req.headers, body: obj.bytes });
    if (!res.ok) throw new Error(`r2_put_failed:${res.status}`);
  }

  async get(key: string): Promise<Uint8Array | null> {
    const req = buildR2Request(this.config, 'GET', key);
    const res = await fetch(req.url, { method: 'GET', headers: req.headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`r2_get_failed:${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  async delete(key: string): Promise<void> {
    const req = buildR2Request(this.config, 'DELETE', key);
    const res = await fetch(req.url, { method: 'DELETE', headers: req.headers });
    if (!res.ok && res.status !== 404) throw new Error(`r2_delete_failed:${res.status}`);
  }

  publicUrl(key: string): string | null {
    return publicObjectUrl(key, this.config.publicBaseUrl);
  }
}
