import { KM } from './km';

// The site's two languages. Every page is under its language: /en/… and
// /km/…. Plain functions, for server and browser code alike; components use
// the hooks in i18n.tsx, which know the page's language.

export type Locale = 'en' | 'km';

export const LOCALES: Locale[] = ['en', 'km'];

/** Where the browser remembers the reader's language, for the site's root address (/). */
export const LANGUAGE_KEY = 'kbach-docs-language';

export const LANGUAGES: { locale: Locale; label: string; name: string }[] = [
  { locale: 'en', label: 'EN', name: 'English' },
  { locale: 'km', label: 'ខ្មែរ', name: 'ភាសាខ្មែរ' },
];

/** The language at the start of a path (/en/… or /km/…), or null when it has none. */
export function prefixOf(path: string): Locale | null {
  const m = /^\/(en|km)(?=$|[/?#])/.exec(path);
  return m ? (m[1] as Locale) : null;
}

/** The language a path is in: /km/… is Khmer, everything else English. */
export function localeOf(path: string): Locale {
  return prefixOf(path) ?? 'en';
}

/** The path without its language: /km/installation → /installation, /en → /. */
export function stripLocale(path: string): string {
  return prefixOf(path) ? path.slice(3) || '/' : path;
}

/**
 * An internal link in a language: /installation is /en/installation in
 * English and /km/installation in Khmer. Leaves alone links elsewhere,
 * links that already have a language, #sections and files (/logos/vite.svg).
 */
export function localHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const path = href.split(/[?#]/)[0];
  if (prefixOf(path) || /\.[a-z0-9]+$/i.test(path)) return href;
  return '/' + locale + (path === '/' ? href.slice(1) : href);
}

/** An interface word in a language: translate('Search', 'km') is ស្វែងរក. */
export function translate(english: string, locale: Locale): string {
  return (locale === 'km' && KM[english]) || english;
}
