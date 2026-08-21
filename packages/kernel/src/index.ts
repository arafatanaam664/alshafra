export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export { newId, isUuid, systemId } from './id';

export function nowUtc(): Date {
  return new Date();
}

export function nowIso(): string {
  return new Date().toISOString();
}
