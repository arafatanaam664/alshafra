export type SeoLevel = 'critical' | 'warning' | 'good';

export interface SeoCheck {
  id: string;
  level: SeoLevel;
  label: string;
  ok: boolean;
}

export interface SeoAuditInput {
  title: string;
  seoTitle?: string | null;
  description?: string | null;
  canonical?: string | null;
  h1?: string | null;
  path: string;
  hasImage?: boolean;
  imageAlt?: boolean;
  hasInternalLink?: boolean;
  indexable?: boolean;
  robots?: string | null;
  faqCount?: number;
}

export function auditSeo(input: SeoAuditInput): SeoCheck[] {
  const title = (input.seoTitle || input.title || '').trim();
  const desc = (input.description || '').trim();
  const h1 = (input.h1 || input.title || '').trim();
  const checks: SeoCheck[] = [
    { id: 'title', level: 'critical', label: 'عنوان موجود', ok: title.length > 0 },
    { id: 'title_length', level: 'warning', label: 'طول العنوان 15–70', ok: title.length >= 15 && title.length <= 70 },
    { id: 'description', level: 'critical', label: 'وصف meta موجود', ok: desc.length > 0 },
    { id: 'description_length', level: 'warning', label: 'طول الوصف 50–160', ok: desc.length >= 50 && desc.length <= 160 },
    { id: 'canonical', level: 'critical', label: 'Canonical مطلق', ok: Boolean(input.canonical?.startsWith('https://')) },
    { id: 'h1', level: 'critical', label: 'H1 موجود', ok: h1.length > 0 },
    { id: 'path', level: 'critical', label: 'مسار صالح', ok: input.path.startsWith('/') },
    { id: 'image', level: 'warning', label: 'صورة بارزة', ok: Boolean(input.hasImage) },
    { id: 'alt', level: 'warning', label: 'نص بديل للصورة', ok: !input.hasImage || Boolean(input.imageAlt) },
    { id: 'internal_links', level: 'warning', label: 'روابط داخلية', ok: Boolean(input.hasInternalLink) },
    { id: 'indexability', level: 'good', label: 'قابل للفهرسة أو noindex صريح', ok: input.indexable !== undefined },
    { id: 'robots', level: 'good', label: 'توجيه robots', ok: Boolean(input.robots) },
  ];
  return checks;
}

export function seoSummary(checks: SeoCheck[]): { critical: number; warning: number; good: number } {
  return {
    critical: checks.filter((c) => c.level === 'critical' && !c.ok).length,
    warning: checks.filter((c) => c.level === 'warning' && !c.ok).length,
    good: checks.filter((c) => c.ok).length,
  };
}
