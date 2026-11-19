import type { ReactNode } from 'react';
import { SiteLayout, langParams, toLocale } from '../_site/layout';

// The root layout of every page: /en/… and /km/… (the language is the
// address's first part, and the <html lang> of the built page).
export const dynamicParams = false;
export const generateStaticParams = langParams;

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  return <SiteLayout locale={toLocale((await params).lang)}>{children}</SiteLayout>;
}
