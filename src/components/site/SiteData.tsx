'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PageInfo } from '../../lib/docs';

// The docs' page names in the page's language (lib/content.ts pageInfos),
// handed down by the language's root layout. The sidebar, the pager, the
// home page and the 404 page read them from here.

const SiteDataContext = createContext<PageInfo[]>([]);

export function SiteDataProvider({ pages, children }: { pages: PageInfo[]; children: ReactNode }) {
  return <SiteDataContext.Provider value={pages}>{children}</SiteDataContext.Provider>;
}

/** Every docs page, in sidebar order. */
export function usePages(): PageInfo[] {
  return useContext(SiteDataContext);
}

/** One page's names, if it exists. */
export function usePageInfo(slug: string): PageInfo | undefined {
  return usePages().find((p) => p.slug === slug);
}

/** The pages before and after one, in sidebar order. */
export function useNeighbors(slug: string): { prev?: PageInfo; next?: PageInfo } {
  const pages = usePages();
  const i = pages.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? pages[i - 1] : undefined, next: i >= 0 ? pages[i + 1] : undefined };
}
