'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

/**
 * A link to a page of this site (/installation). Next.js opens it without
 * reloading the page. Use a plain <a> for other sites and for #sections.
 *
 * The playground opens in the same tab, like every other page (2026-11-27, the
 * user's choice; from 2026-11-26 it opened a new tab). Its logo button goes back.
 */
export function SiteLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  return <Link href={href} {...props} />;
}
