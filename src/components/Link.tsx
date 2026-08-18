import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import publishedPathData from '../data/published-paths.json';
import { useRoute } from '../lib/router';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

const PUBLISHED_PATHS = new Set((publishedPathData as { paths: string[] }).paths);

function normalizedTarget(target: string): string {
  const pathname = target.split(/[?#]/, 1)[0];
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

/**
 * A real internal anchor only when its target belongs to the reviewed
 * publication set. A generated-but-unpublished locale, filter, or catalog
 * target is rendered as inert text rather than emitting a crawlable broken
 * link. External URLs are unaffected.
 */
export default function Link({ to, children, onClick, className, title, ...rest }: LinkProps) {
  const [, navigate] = useRoute();
  const internal = to.startsWith('/');
  const published = !internal || PUBLISHED_PATHS.has(normalizedTarget(to));

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  if (!published) {
    return (
      <span className={className} title={title} aria-disabled="true" data-unpublished-link="">
        {children}
      </span>
    );
  }

  return (
    <a href={to} onClick={handleClick} className={className} title={title} {...rest}>
      {children}
    </a>
  );
}
