import type { ReactNode } from 'react';
import { brand } from '@alshafra/ui';
import { can, type SessionUser } from '../lib/api';
import { navigate } from '../lib/hash';

const NAV: { href?: string; label: string; perm?: string; soon?: boolean; group: string }[] = [
  { group: 'عام', href: '/', label: 'لوحة التحكم' },
  { group: 'المحتوى', href: '/content', label: 'كل المحتوى', perm: 'documents.read' },
  { group: 'المحتوى', href: '/content/new', label: 'محتوى جديد', perm: 'documents.create' },
  { group: 'المحتوى', href: '/content?status=draft', label: 'مسودات', perm: 'documents.read' },
  { group: 'المحتوى', href: '/content?status=review', label: 'قيد المراجعة', perm: 'documents.read' },
  { group: 'التصنيف', href: '/taxonomy', label: 'التصنيفات والوسوم', perm: 'taxonomy.read' },
  { group: 'الأدوات', href: '/tools', label: 'الأدوات' },
  { group: 'الوسائط', href: '/media', label: 'مكتبة الوسائط', perm: 'media.read' },
  { group: 'SEO', href: '/seo', label: 'نظرة SEO', perm: 'documents.read' },
  { group: 'التحليلات', href: '/analytics', label: 'التحليلات', perm: 'analytics.read' },
  { group: 'المجتمع', href: '/community', label: 'إشراف المجتمع', perm: 'moderation.handle' },
  { group: 'اجتماعي', label: 'قريبًا', soon: true },
  { group: 'أتمتة', label: 'قريبًا', soon: true },
  { group: 'الوصول', href: '/users', label: 'المستخدمون', perm: 'users.read' },
  { group: 'النظام', href: '/flags', label: 'Feature Flags', perm: 'flags.read' },
  { group: 'النظام', href: '/settings', label: 'الإعدادات', perm: 'settings.read' },
  { group: 'النظام', href: '/audit', label: 'سجل التدقيق', perm: 'audit.read' },
  { group: 'النظام', href: '/health', label: 'صحة النظام', perm: 'health.read' },
];

export function Shell({
  user,
  route,
  theme,
  onTheme,
  onLogout,
  children,
}: {
  user: SessionUser;
  route: string;
  theme: string;
  onTheme: () => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const path = route.split('?')[0];
  let group = '';
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <small>ADMIN CMS</small>
          <h1>{brand.name}</h1>
        </div>
        <nav className="nav">
          {NAV.map((item) => {
            const showGroup = item.group !== group;
            group = item.group;
            const allowed = !item.perm || can(user, item.perm);
            const active = item.href && (item.href === '/' ? path === '/' : path === item.href.split('?')[0]);
            return (
              <div key={item.label + (item.href || '')}>
                {showGroup && <div className="nav-group">{item.group}</div>}
                {item.soon || !allowed ? (
                  <span className="disabled">{item.label}</span>
                ) : (
                  <a className={active ? 'active' : ''} href={`#${item.href}`} onClick={(e) => { e.preventDefault(); navigate(item.href!); }}>
                    {item.label}
                  </a>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <div className="crumbs">Alshafra / لوحة التحكم</div>
            <strong>{user.displayName}</strong>
            <span style={{ color: 'var(--muted)', marginInlineStart: 8, fontSize: 12 }}>{user.roles.join(' · ')}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn secondary" onClick={onTheme}>{theme === 'dark' ? 'نهاري' : 'ليلي'}</button>
            <button className="btn secondary" onClick={onLogout}>خروج</button>
          </div>
        </header>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
