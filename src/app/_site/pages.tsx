import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REDIRECTS, hrefFor } from '../../lib/docs';
import { allSlugs, getPage, redirectSlugs, searchEntries } from '../../lib/content';
import { HOME_META, docTitle, pageMetadata } from '../../lib/metadata';
import { DocPageView } from '../../components/site/DocPageView';
import { HomePage } from '../../components/site/HomePage';
import { PlaygroundPage } from '../../components/site/PlaygroundPage';
import { JsonLd, docJsonLd, siteJsonLd } from '../../lib/structuredData';

// What each kind of page is. The files in app/ are small: each is one of these.

// --- the home page: / ---

export function homeMetadata(): Metadata {
  return pageMetadata({ ...HOME_META, path: '/' });
}

export function HomeRoute() {
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <HomePage />
    </>
  );
}

// --- a docs page: /<slug>, one for every file in content/ ---

/** Every docs page, and the old addresses of pages that moved (REDIRECTS in lib/docs.ts). */
export function docParams(): { slug: string }[] {
  return [...allSlugs().filter((slug) => slug !== 'playground'), ...redirectSlugs()].map((slug) => ({ slug }));
}

export function docMetadata(slug: string): Metadata {
  const target = REDIRECTS[slug] ?? slug;
  const page = getPage(target);
  if (!page) return {};
  // a moved page's old address points search engines at the new one
  return pageMetadata({ title: docTitle(page.title), description: page.description, path: hrefFor(target), noindex: target !== slug });
}

export function DocRoute({ slug }: { slug: string }) {
  const target = REDIRECTS[slug] ?? slug;
  const page = getPage(target);
  if (!page) notFound();
  return (
    <>
      {target === slug && <JsonLd data={docJsonLd(page)} />}
      <DocPageView page={page} movedFrom={target !== slug ? slug : undefined} />
    </>
  );
}

// --- the playground: /playground ---

export function playgroundMetadata(): Metadata {
  const page = getPage('playground')!;
  return pageMetadata({ title: docTitle(page.title), description: page.description, path: '/playground' });
}

export function PlaygroundRoute() {
  return <PlaygroundPage title={getPage('playground')?.title ?? 'Playground'} />;
}

// --- what search looks through: /search.json ---

export function searchJson(): Response {
  return Response.json(searchEntries());
}
