import type { ReactNode } from 'react';
import { SiteLayout } from './_site/layout';

// The root layout of every page: / (the home page), /<slug> and /playground.
export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
