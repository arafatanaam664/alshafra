import { ExternalLink, Megaphone, Sparkles } from 'lucide-react';
import { ADSTERRA } from '../lib/ads';

/**
 * Adsterra smartlink.
 *
 * The unit is a plain hyperlink, so it is rendered as a real <a href> — never
 * as a button — and it always carries rel="sponsored nofollow" plus a visible
 * "إعلان" label, which keeps it distinguishable from editorial content (a
 * requirement for both AdSense and Adsterra).
 */
const LINK_PROPS = {
  href: ADSTERRA.smartlinkUrl,
  target: '_blank',
  rel: 'sponsored nofollow noopener noreferrer',
} as const;

interface SmartlinkCardProps {
  variant?: 'card' | 'inline';
  className?: string;
  title?: string;
  description?: string;
  cta?: string;
}

export default function SmartlinkCard({
  variant = 'card',
  className = '',
  title = 'عرض من شريكنا',
  description = 'عرض مختار من شبكة إعلاناتنا — يُفتح في نافذة جديدة.',
  cta = 'مشاهدة العرض',
}: SmartlinkCardProps) {
  if (variant === 'inline') {
    return (
      <a
        {...LINK_PROPS}
        className={`group flex items-center justify-between gap-3 rounded-xl bg-sand-50 p-4 ring-1 ring-brand-900/5 transition-all hover:bg-brand-50 hover:ring-brand-200 ${className}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
            <Megaphone className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-brand-800 group-hover:text-brand-700">
              {title}
            </span>
            <span className="block text-[11px] text-brand-600/70">إعلان مدعوم · يفتح في نافذة جديدة</span>
          </span>
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-brand-600/60 transition-colors group-hover:text-brand-700" />
      </a>
    );
  }

  return (
    <aside className={`my-8 ${className}`} aria-label="إعلان مدعوم">
      <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 text-white shadow-soft sm:p-7">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-52 w-52 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="chip bg-white/15 text-white ring-1 ring-white/25">
                <Megaphone className="h-3.5 w-3.5 text-gold-300" />
                إعلان مدعوم
              </span>
              <span className="flex items-center gap-1 text-[11px] text-brand-50/70">
                <Sparkles className="h-3 w-3 text-gold-300" />
                من شبكة Adsterra
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white sm:text-xl">
              {title}
            </h3>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-brand-50/85">{description}</p>
          </div>
          <a
            {...LINK_PROPS}
            className="btn shrink-0 bg-white text-brand-800 shadow-soft hover:bg-brand-50 active:scale-[0.98]"
          >
            {cta}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}

/** Compact site-wide link used in the footer. */
export function SmartlinkFooterLink() {
  return (
    <a
      {...LINK_PROPS}
      className="inline-flex items-center gap-1 text-brand-100/80 transition-colors hover:text-white"
    >
      عروض الشركاء
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
