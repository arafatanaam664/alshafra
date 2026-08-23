import { useEffect, useState } from 'react';
import { Shell } from './layouts/Shell';
import { api, type SessionUser } from './lib/api';
import { match, navigate, useRoute } from './lib/hash';
import {
  AnalyticsView,
  ContentEditor,
  ContentList,
  DashboardView,
  FlagsView,
  HealthView,
  LoginView,
  SettingsView,
  SimpleList,
} from './pages/views';
import { MediaView } from './pages/MediaView';
import { CommunityView } from './pages/CommunityView';
import { NavigationView, SectionsView } from './pages/SectionsView';
import {
  AdsView,
  AutomationView,
  NotificationsAdminView,
  OpportunitiesView,
  SitePublishBar,
  SocialQueueView,
} from './pages/EnginesView';

export function App() {
  const route = useRoute();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  useEffect(() => {
    api<{ user: SessionUser }>('/api/v1/admin/auth/session')
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="empty">…</div>;
  const path = route.split('?')[0];
  if (!user) return <LoginView onDone={setUser} />;

  let page = <DashboardView />;
  if (path === '/content/new') page = <ContentEditor isNew user={user} />;
  else if (match(path, '/content/:id/analytics')) {
    const id = match(path, '/content/:id/analytics')!.id;
    page = <SimpleList title="تحليلات المحتوى" path={`/api/v1/admin/documents/${id}/analytics`} />;
  } else if (match(path, '/content/:id')) {
    page = <ContentEditor id={match(path, '/content/:id')!.id} user={user} />;
  } else if (path === '/content') page = <ContentList route={route} />;
  else if (path === '/taxonomy') page = <SimpleList title="التصنيفات" path="/api/v1/admin/categories" />;
  else if (path === '/sections') page = <SectionsView user={user} />;
  else if (path === '/navigation') page = <NavigationView user={user} />;
  else if (path === '/opportunities') page = <OpportunitiesView user={user} />;
  else if (path === '/tools') page = <SimpleList title="الأدوات" path="/api/v1/admin/tools" />;
  else if (path === '/media') page = <MediaView user={user} />;
  else if (path === '/seo') page = <SimpleList title="التحويلات و410" path="/api/v1/admin/redirects" />;
  else if (path === '/analytics') page = <AnalyticsView />;
  else if (path === '/users') page = <SimpleList title="المستخدمون" path="/api/v1/admin/users" />;
  else if (path === '/flags') page = <FlagsView />;
  else if (path === '/settings') page = <SettingsView />;
  else if (path === '/audit') page = <SimpleList title="سجل التدقيق" path="/api/v1/admin/audit" />;
  else if (path === '/health') page = <HealthView />;
  else if (path === '/community') page = <CommunityView user={user} />;
  else if (path === '/social') page = <SocialQueueView user={user} />;
  else if (path === '/automation') page = <AutomationView user={user} />;
  else if (path === '/notifications') page = <NotificationsAdminView />;
  else if (path === '/ads') page = <AdsView />;
  else if (path === '/') page = (
    <>
      <SitePublishBar user={user} />
      <DashboardView />
    </>
  );

  return (
    <Shell
      user={user}
      route={route}
      theme={theme}
      onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onLogout={async () => {
        await api('/api/v1/admin/auth/logout', { method: 'POST' });
        setUser(null);
        navigate('/login');
      }}
    >
      {page}
    </Shell>
  );
}
