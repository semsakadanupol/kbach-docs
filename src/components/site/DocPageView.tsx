'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from '@kbach/react';
import { NAV, hrefFor, type DocPage } from '../../lib/docs';
import { editUrl, issueUrl } from '../../lib/site';
import { useLocale, useT } from '../../lib/i18n';
import { RenderBlocks } from '../../markdown/render';
import { Pager } from '../Pager';
import { Sidebar } from '../Sidebar';
import { SiteLink } from '../SiteLink';
import { Toc } from '../Toc';
import { SECTION_INFO } from '../sections';
import { BugIcon, ChevronRightIcon, PencilIcon } from '../icons';
import { Footer } from './Footer';

/**
 * The docs' three columns: the sidebar, the page, and "On this page". A page
 * with `toc: false` in its front matter uses the third column's room too.
 */
export function DocsLayout({ current, wide = false, toc, children }: { current: string; wide?: boolean; toc?: ReactNode; children: ReactNode }) {
  return (
    <div className={clsx('mx-auto max-w-[90rem] px-4 sm:px-6 lg:grid lg:px-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10', !wide && 'xl:grid-cols-[15.5rem_minmax(0,1fr)_13.5rem]')}>
      <aside className="hidden lg:block">
        <div className="sticky top-16 -ml-3 h-[calc(100dvh-4rem)] overflow-y-auto py-8 pr-2 [scrollbar-width:thin]">
          <Sidebar current={current} />
        </div>
      </aside>

      <main id="content" className="relative isolate min-w-0 py-8 lg:py-10">
        {/* a soft gold light behind the page title, running up behind the see-through bar. Its size
            is a share of the column (not a fixed 30rem), so it fades out before the column's edges
            on a phone too, instead of being cut off there. */}
        <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[22rem] bg-[radial-gradient(50%_80%_at_50%_0%,rgb(199_162_93/0.13),transparent)]" aria-hidden="true" />
        {children}
      </main>

      {!wide && (
        <aside className="hidden xl:block">
          <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto py-10 [scrollbar-width:thin]">{toc}</div>
        </aside>
      )}
    </div>
  );
}

/** A docs page: its title, its text from content/<slug>.md, when it changed, and the pages around it. */
export function DocPageView({ page, movedFrom }: { page: DocPage; movedFrom?: string }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const wide = page.meta.toc === 'false';

  // an old address (REDIRECTS in lib/docs.ts) shows its new page right away, then the URL catches up
  useEffect(() => {
    if (movedFrom) router.replace(hrefFor(page.slug, locale) + window.location.search + window.location.hash, { scroll: false });
  }, [movedFrom, page.slug, locale, router]);

  return (
    <DocsLayout current={page.slug} wide={wide} toc={<Toc page={page} />}>
      <article key={page.slug} lang={page.fallback ? 'en' : undefined} className={clsx('mx-auto animate-[kbd-fade_350ms_ease-out_both]', wide ? 'max-w-none' : 'max-w-3xl')}>
        <PageHeader section={page.section} nav={page.meta.nav ?? page.title} />
        <h1 className="font-display text-[2.1rem] font-semibold leading-tight tracking-tight text-balance text-ink sm:text-[2.75rem]">{page.title}</h1>
        {/* asked for in Khmer, not translated yet: say so (in Khmer), then the English page */}
        {page.fallback && (
          <p lang="km" className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-accent">
            {t("This page isn't in Khmer yet: here it is in English.")}
          </p>
        )}
        {page.description && <p className="mt-4 max-w-2xl text-lg leading-8 text-pretty text-muted">{page.description}</p>}
        <div className="mt-8 h-px bg-linear-to-r from-gold/50 via-line to-transparent" />
        <div className="mt-10" data-prose="">
          <RenderBlocks blocks={page.blocks} />
        </div>
        <PageMeta page={page} />
        <Pager slug={page.slug} />
        <Footer />
      </article>
    </DocsLayout>
  );
}

/** Above a page title: its section, with the section's icon, then the page. */
function PageHeader({ section, nav }: { section: string; nav: string }) {
  const t = useT();
  const Icon = SECTION_INFO[section]?.icon;
  const first = NAV.find((s) => s.title === section)?.pages[0];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
      <SiteLink
        href={first ? '/' + first : '/'}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 py-0.5 pr-2.5 pl-1 font-medium text-accent transition-colors hover:border-gold/60"
      >
        {Icon && (
          <span className="grid size-5 place-items-center rounded-full bg-[#f5ead2] dark:bg-logo text-[11px] text-bronze dark:text-gold">
            <Icon />
          </span>
        )}
        {t(section)}
      </SiteLink>
      <ChevronRightIcon className="text-xs text-faint" />
      <span className="text-muted">{nav}</span>
    </div>
  );
}

const KHMER_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

/** "November 8, 2026", or in Khmer "8 វិច្ឆិកា 2026" (written out here: browsers may have no Khmer month names). */
function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (locale === 'km') return d.getUTCDate() + ' ' + KHMER_MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(d);
}

/** Under a page: when it last changed, and where to fix it or report a mistake in it. */
function PageMeta({ page }: { page: DocPage }) {
  const t = useT();
  const locale = useLocale();
  const link = 'inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
  return (
    <div className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-6 text-[13px] text-muted">
      {page.updated ? (
        <p>
          {t('Last updated')}{' '}
          <time dateTime={page.updated} className="font-medium text-ink">
            {formatDate(page.updated, locale)}
          </time>
        </p>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a href={editUrl(page)} target="_blank" rel="noreferrer" className={link}>
          <PencilIcon className="text-[15px]" /> {t('Edit this page on GitHub')}
        </a>
        <a href={issueUrl(page)} target="_blank" rel="noreferrer" className={link}>
          <BugIcon className="text-[15px]" /> {t('Report an issue')}
        </a>
      </div>
    </div>
  );
}
