'use client';

import type { PageInfo } from '../../lib/docs';
import { SiteLink } from '../SiteLink';
import { ArrowRightIcon, SearchIcon } from '../icons';
import { DocsLayout } from './DocPageView';
import { Footer } from './Footer';
import { SiteDataProvider, usePageInfo } from './SiteData';
import { Shell, useOpenSearch } from './Shell';

/** The pages most people come for, offered on the 404 page. */
const POPULAR = ['installation', 'utility-classes', 'colors', 'dark-mode', 'configuration', 'troubleshooting'];

/** The site's 404 page (app/global-not-found.tsx): 404.html, for every address that has no page. */
export function NotFoundSite({ pages }: { pages: PageInfo[] }) {
  return (
    <SiteDataProvider pages={pages}>
        <Shell>
          {/* the docs' columns, the last one empty: the text sits where a docs page's does */}
          <DocsLayout current="">
            <article className="mx-auto max-w-3xl">
              <NotFound />
              <Footer />
            </article>
          </DocsLayout>
        </Shell>
    </SiteDataProvider>
  );
}

function NotFound() {
  const openSearch = useOpenSearch();
  return (
    <div className="py-16 text-center sm:py-20">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn’t exist, or it moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={openSearch}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:opacity-90"
        >
          <SearchIcon /> Search the docs
        </button>
        <SiteLink
          href="/"
          className="inline-flex items-center rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:border-gold/60"
        >
          Go to the home page
        </SiteLink>
      </div>
      <div className="mx-auto mt-14 max-w-xl text-left">
        <p className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">Popular pages</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {POPULAR.map((slug) => (
            <PopularPage key={slug} slug={slug} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PopularPage({ slug }: { slug: string }) {
  const p = usePageInfo(slug);
  if (!p) return null;
  return (
    <li>
      <SiteLink
        href={'/' + p.slug}
        className="group flex items-center justify-between rounded-xl border border-line bg-card/60 px-4 py-3 text-sm transition hover:border-gold/60 hover:bg-card active:border-gold/60 active:bg-card"
      >
        <span>
          <span className="block font-medium text-ink group-hover:text-accent group-active:text-accent">{p.nav}</span>
          <span className="block text-xs text-faint">{p.section}</span>
        </span>
        <ArrowRightIcon className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent group-active:translate-x-0.5 group-active:text-accent" />
      </SiteLink>
    </li>
  );
}
