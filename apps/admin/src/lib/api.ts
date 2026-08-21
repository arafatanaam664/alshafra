export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(res.status, data.error || res.statusText);
  return data as T;
}

export type SessionUser = {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
};

export function can(user: SessionUser | null, key: string): boolean {
  if (!user) return false;
  if (user.roles.includes('super_admin')) return true;
  const aliases: Record<string, string> = {
    'content.publish': 'documents.publish',
    'content.create': 'documents.create',
  };
  const resolved = aliases[key] || key;
  return user.permissions.includes(resolved) || user.permissions.includes(key);
}
