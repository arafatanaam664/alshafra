export interface RateLimiter {
  hit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; remaining: number; retryAfter: number }>;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  async hit(key: string, limit: number, windowSec: number) {
    const now = Date.now();
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
      return { ok: true, remaining: Math.max(0, limit - 1), retryAfter: windowSec };
    }
    current.count += 1;
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    if (current.count > limit) return { ok: false, remaining: 0, retryAfter };
    return { ok: true, remaining: Math.max(0, limit - current.count), retryAfter };
  }
}

const shared = new MemoryRateLimiter();

export function defaultRateLimiter(): RateLimiter {
  return shared;
}

export function postLimit(isTrusted: boolean): { limit: number; windowSec: number } {
  return isTrusted ? { limit: 30, windowSec: 3600 } : { limit: 10, windowSec: 3600 };
}

export function voteLimit(): { limit: number; windowSec: number } {
  return { limit: 60, windowSec: 60 };
}
