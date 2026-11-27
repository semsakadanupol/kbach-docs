import type { Metadata } from 'next';
import { SITE } from './content';

// Each page's <title>, description and share tags (Open Graph, Twitter),
// and, when the site's address is known (KBACH_DOCS_URL), its canonical
// address. Used by every page.tsx.

export const SITE_NAME = 'Kbach Docs';

export function pageMetadata({ title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  // The share picture (public/og.png) needs a full address: sites that show a
  // link's preview ignore a relative one. So it's there once KBACH_DOCS_URL is.
  const image = SITE ? { url: SITE + '/og.png', width: 1200, height: 630, alt: 'Kbach: one set of classes, every platform.' } : null;
  return {
    title,
    description,
    ...(SITE && { metadataBase: new URL(SITE) }),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      locale: 'en_US',
      ...(image && { images: [image], url: SITE + path }),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image && { images: [image.url] }) },
    ...(SITE && { alternates: { canonical: SITE + path } }),
    ...(noindex && { robots: { index: false } }),
  };
}

/** A docs page's title: "Installation · Kbach Docs". */
export function docTitle(title: string): string {
  return title + ' · ' + SITE_NAME;
}

export const HOME_META = {
  title: 'Kbach: one set of classes for web, native and HTML',
  description: 'Style React, React Native and plain HTML with short class names, from one Rust engine.',
};
