import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REDIRECTS } from '../../lib/docs';
import { allSlugs, getPage, redirectSlugs, searchEntries } from '../../lib/content';
import { localHref, type Locale } from '../../lib/locale';
import { HOME_META, docTitle, pageMetadata } from '../../lib/metadata';
import { DocPageView } from '../../components/site/DocPageView';
import { HomePage } from '../../components/site/HomePage';
import { PlaygroundPage } from '../../components/site/PlaygroundPage';
import { JsonLd, docJsonLd, siteJsonLd } from '../../lib/structuredData';

// What each kind of page is, for both languages. The files in app/ are
// small: each passes its language to one of these.

// --- the home page: /en and /km ---

export function homeMetadata(locale: Locale): Metadata {
  return pageMetadata({ ...HOME_META[locale], locale, path: localHref('/', locale) });
}

export function HomeRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd data={siteJsonLd(locale)} />
      <HomePage />
    </>
  );
}

// --- a docs page: /en/<slug> and /km/<slug>, one for every file in content/ ---

/** Every docs page, and the old addresses of pages that moved (REDIRECTS in lib/docs.ts). */
export function docParams(): { slug: string }[] {
  return [...allSlugs().filter((slug) => slug !== 'playground'), ...redirectSlugs()].map((slug) => ({ slug }));
}

export function docMetadata(slug: string, locale: Locale): Metadata {
  const target = REDIRECTS[slug] ?? slug;
  const page = getPage(target, locale);
  if (!page) return {};
  // a moved page's old address points search engines at the new one
  return pageMetadata({ title: docTitle(page.title, locale), description: page.description, locale, path: localHref('/' + target, locale), noindex: target !== slug });
}

export function DocRoute({ slug, locale }: { slug: string; locale: Locale }) {
  const target = REDIRECTS[slug] ?? slug;
  const page = getPage(target, locale);
  if (!page) notFound();
  return (
    <>
      {target === slug && <JsonLd data={docJsonLd(page)} />}
      <DocPageView page={page} movedFrom={target !== slug ? slug : undefined} />
    </>
  );
}

// --- the playground: /en/playground and /km/playground ---

export function playgroundMetadata(locale: Locale): Metadata {
  const page = getPage('playground', locale)!;
  return pageMetadata({ title: docTitle(page.title, locale), description: page.description, locale, path: localHref('/playground', locale) });
}

export function PlaygroundRoute({ locale }: { locale: Locale }) {
  return <PlaygroundPage title={getPage('playground', locale)?.title ?? 'Playground'} />;
}

// --- what search looks through: /en/search.json and /km/search.json ---

export function searchJson(locale: Locale): Response {
  return Response.json(searchEntries(locale));
}
