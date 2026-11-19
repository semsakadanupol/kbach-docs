import type { Metadata } from 'next';
import { SITE } from './content';
import { localHref, stripLocale, type Locale } from './locale';

// Each page's <title>, description and share tags (Open Graph, Twitter),
// and, when the site's address is known (KBACH_DOCS_URL), its canonical
// address and its other-language version. Used by every page.tsx.

const SITE_NAME: Record<Locale, string> = { en: 'Kbach Docs', km: 'ឯកសារ Kbach' };

export function pageMetadata({ title, description, locale, path, noindex = false }: { title: string; description: string; locale: Locale; path: string; noindex?: boolean }): Metadata {
  const en = localHref(stripLocale(path), 'en');
  const km = localHref(stripLocale(path), 'km');
  // The share picture (public/og.png) needs a full address: sites that show a
  // link's preview ignore a relative one. So it's there once KBACH_DOCS_URL is.
  const image = SITE ? { url: SITE + '/og.png', width: 1200, height: 630, alt: 'Kbach: one set of classes, every platform.' } : null;
  return {
    title,
    description,
    ...(SITE && { metadataBase: new URL(SITE) }),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME[locale],
      title,
      description,
      locale: locale === 'km' ? 'km_KH' : 'en_US',
      ...(image && { images: [image], url: SITE + path }),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image && { images: [image.url] }) },
    ...(SITE && {
      alternates: { canonical: SITE + path, languages: { en: SITE + en, km: SITE + km, 'x-default': SITE + en } },
    }),
    ...(noindex && { robots: { index: false } }),
  };
}

/** A docs page's title: "Installation · Kbach Docs". */
export function docTitle(title: string, locale: Locale): string {
  return title + ' · ' + SITE_NAME[locale];
}

export const HOME_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Kbach: one set of classes for web, native and HTML',
    description: 'Style React, React Native and plain HTML with short class names, from one Rust engine.',
  },
  km: {
    title: 'Kbach៖ class តែមួយសម្រាប់ web, native និង HTML',
    description: 'រចនា React, React Native និង HTML ធម្មតា ដោយឈ្មោះ class ខ្លីៗ ពី Rust engine តែមួយ។',
  },
};
