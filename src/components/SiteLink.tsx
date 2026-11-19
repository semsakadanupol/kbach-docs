'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useHref } from '../lib/i18n';

/**
 * A link to a page of this site, written the English way (/installation):
 * on a Khmer page it goes to the Khmer one (/km/installation). Next.js opens
 * it without reloading the page. `exact` takes the address as written (the
 * language switch). Use a plain <a> for other sites and for #sections.
 */
export function SiteLink({ href, exact = false, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; exact?: boolean }) {
  const toLocal = useHref();
  return <Link href={exact ? href : toLocal(href)} {...props} />;
}
