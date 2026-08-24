import { useEffect } from 'react';

const SESSION_KEY = 'alshafra_sid';

function sessionHash(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const next = `sess-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return `sess-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export default function AnalyticsBeacon({ path }: { path: string }) {
  useEffect(() => {
    void fetch('/api/v1/public/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', path, sessionHash: sessionHash() }),
      keepalive: true,
    }).catch(() => {
      /* ingest is optional when the host has no function or database */
    });
  }, [path]);
  return null;
}
