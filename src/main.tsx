import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installAnalyticsWatcher } from './lib/analytics';

// Watch the dataLayer from the very first tick: a history change that happens
// before the watcher exists would be counted twice (once by GA4, once by us).
installAnalyticsWatcher();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
