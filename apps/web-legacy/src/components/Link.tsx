import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useRoute } from '../lib/router';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

/**
 * A real `<a href>` that navigates client-side.
 *
 * Search engines only follow `<a href>` — a `<button onClick>` is invisible to
 * them, which is why most of this site's internal links were never being
 * crawled. Using this component keeps SPA navigation while making every link
 * discoverable, middle-clickable and open-in-new-tab-able.
 */
export default function Link({ to, children, onClick, ...rest }: LinkProps) {
  const [, navigate] = useRoute();

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

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
