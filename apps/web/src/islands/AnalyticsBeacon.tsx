import { useEffect } from 'react';

export default function AnalyticsBeacon({ path }: { path: string }) {
  useEffect(() => {
    const sessionHash = `sess-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    void fetch('/api/v1/public/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', path, sessionHash }),
      keepalive: true,
    }).catch(() => {
      /* ingest is optional on static hosts */
    });
  }, [path]);
  return null;
}
