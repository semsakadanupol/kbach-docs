import type { ReactNode } from 'react';
import { pageInfos } from '../../lib/content';
import { RootDocument } from '../../components/site/RootDocument';
import { SiteDataProvider } from '../../components/site/SiteData';
import { Shell } from '../../components/site/Shell';

/**
 * Everything around a page: <html>, the docs' page names for the components,
 * and the site's header, menu and search (Shell). app/layout.tsx is this.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument>
      <SiteDataProvider pages={pageInfos()}>
        <Shell>{children}</Shell>
      </SiteDataProvider>
    </RootDocument>
  );
}
