import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { MediaDriver, StorageObject, StorageProvider } from './types';
import { publicObjectUrl } from './public';

export class MemoryStorage implements StorageProvider {
  readonly driver: MediaDriver = 'memory';
  readonly objects = new Map<string, StorageObject>();

  async put(obj: StorageObject): Promise<void> {
    this.objects.set(obj.key, { ...obj, bytes: Uint8Array.from(obj.bytes) });
  }

  async get(key: string): Promise<Uint8Array | null> {
    const row = this.objects.get(key);
    return row ? Uint8Array.from(row.bytes) : null;
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }

  publicUrl(key: string): string | null {
    return publicObjectUrl(key);
  }
}

export class LocalDiskStorage implements StorageProvider {
  readonly driver: MediaDriver = 'local';

  constructor(private readonly root: string) {
    mkdirSync(root, { recursive: true });
  }

  private pathFor(key: string): string {
    if (key.includes('..') || key.startsWith('/') || key.includes('\\')) throw new Error('unsafe_key');
    return join(this.root, key);
  }

  async put(obj: StorageObject): Promise<void> {
    const dest = this.pathFor(obj.key);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, obj.bytes);
  }

  async get(key: string): Promise<Uint8Array | null> {
    try {
      return new Uint8Array(readFileSync(this.pathFor(key)));
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      rmSync(this.pathFor(key), { force: true });
    } catch {
      /* missing is fine */
    }
  }

  publicUrl(key: string): string | null {
    return publicObjectUrl(key);
  }
}
