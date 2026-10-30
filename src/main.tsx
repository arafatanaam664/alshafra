import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installAnalyticsWatcher } from './lib/analytics';
import { isPrivateDatePath } from './lib/date-privacy.mjs';

// Watch the dataLayer from the very first tick: a history change that happens
// before the watcher exists would be counted twice (once by GA4, once by us).
installAnalyticsWatcher();

// Preload high-use entry routes before replacing the useful static HTML. This
// avoids a visible Suspense-spinner intermediate frame on direct navigation;
// the home page and other routes keep their existing code splitting.
async function start() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const preload: Record<string, () => Promise<unknown>> = {
    '/date-converter': () => import('./pages/DateConverterPage'),
    '/age-calculator': () => import('./pages/AgeCalculatorPage'),
    '/today': () => import('./pages/TodayPage'),
    '/school-calendar': () => import('./pages/SchoolCalendarPage'),
  };
  // Never show birth inputs in the generic SPA shell: third-party scripts may
  // already have run there. The built age document carries this CSP marker.
  if (isPrivateDatePath(path) && !document.querySelector('meta[http-equiv="Content-Security-Policy"][data-date-isolation]')) {
    document.getElementById('root')!.textContent = 'أداة التاريخ غير متاحة حالياً لعدم تفعيل حماية الصفحة. حاول لاحقاً.';
    return;
  }
  let InitialPage: React.ComponentType | undefined;
  try { InitialPage = (await preload[path]?.() as { default: React.ComponentType } | undefined)?.default; } catch { /* React's lazy import reports a failed load normally. */ }
  createRoot(document.getElementById('root')!).render(<StrictMode><App initialPath={path} InitialPage={InitialPage} /></StrictMode>);
}
void start();
