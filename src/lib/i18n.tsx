'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { localHref, translate, type Locale } from './locale';

// The page's language, for components. The root layout (app/[lang]/layout.tsx)
// wraps the site in <LocaleProvider>, so every component below knows it, also
// while the page is built (there's no window then to read the address from).

export { LANGUAGES, LANGUAGE_KEY, localHref, localeOf, prefixOf, stripLocale, translate, type Locale } from './locale';

const LocaleContext = createContext<Locale>('en');

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The language of the page being read. */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The interface's words in the page's language: t('Search') is ស្វែងរក in Khmer. */
export function useT(): (english: string) => string {
  const locale = useLocale();
  return useCallback((english: string) => translate(english, locale), [locale]);
}

/** Internal links in the page's language: href('/installation') is /en/installation, or /km/installation in Khmer. */
export function useHref(): (href: string) => string {
  const locale = useLocale();
  return useCallback((href: string) => localHref(href, locale), [locale]);
}
