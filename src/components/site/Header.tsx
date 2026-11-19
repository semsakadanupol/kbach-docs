'use client';

import { useEffect, useState } from 'react';
import { clsx } from '@kbach/react';
import { KBACH_VERSION } from '../../lib/docs';
import { GITHUB } from '../../lib/site';
import { useT } from '../../lib/i18n';
import { useModKey } from '../../lib/browser';
import { LanguageSwitch } from '../LanguageSwitch';
import { Logo } from '../Logo';
import { SearchButton } from '../Search';
import { SiteLink } from '../SiteLink';
import { ThemeSwitch } from '../ThemeSwitch';
import { ArrowRightIcon, GitHubIcon, MenuIcon, SearchIcon } from '../icons';
import { HOME_LINKS, PLACES, type Place } from './places';

export const iconButton = 'grid size-9 shrink-0 place-items-center rounded-lg text-lg text-muted transition-colors hover:bg-raised hover:text-ink';

/** The logo always goes home. Inside the docs it also says which part you're in. */
export function Brand({ at }: { at: Place }) {
  const t = useT();
  const part = PLACES.find((p) => p.id === at);
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <SiteLink href="/" aria-label={t('Kbach home')} className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
        <Logo source={64} shown={32} className="size-8 rounded-lg shadow-sm ring-1 ring-gold/30" />
        <span className="font-display text-[1.35rem] leading-none font-semibold tracking-tight text-ink">Kbach</span>
      </SiteLink>
      {part && (
        <>
          <span className="hidden text-[1.35rem] leading-none font-light text-line sm:block" aria-hidden="true">
            /
          </span>
          <SiteLink href={part.href} className="hidden truncate text-sm font-medium text-muted transition-colors hover:text-ink sm:block">
            {t(part.label)}
          </SiteLink>
        </>
      )}
    </div>
  );
}

export function GitHubLink() {
  const t = useT();
  return (
    <a href={GITHUB} target="_blank" rel="noreferrer" aria-label={t('Kbach on GitHub')} title="GitHub" className={iconButton}>
      <GitHubIcon />
    </a>
  );
}

/**
 * Two headers in one, by place:
 *  - home: the brand, the docs' main parts in the middle, and on the right
 *    search, GitHub, the theme and a Get started button.
 *  - docs: the brand with the part you're in, the version, a wide search in
 *    the middle (the docs are what you search), and a Docs | Playground
 *    switch that shows where you are.
 * On a phone both have the menu button (the menu differs by place too).
 *
 * On every page the bar is see-through until the page scrolls: no
 * background, border or blur. On the home page the hero's light runs up
 * behind it.
 */
export function Header({ onMenu, onSearch, at }: { onMenu: () => void; onSearch: () => void; at: Place }) {
  const t = useT();
  const home = at === 'home';
  const mod = useModKey();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const clear = !scrolled;

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        clear ? 'border-transparent bg-transparent' : 'border-line bg-page/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} aria-label={t('Open navigation')} className={clsx(iconButton, '-ml-1.5 text-xl lg:hidden')}>
          <MenuIcon />
        </button>
        <Brand at={at} />

        {home ? (
          <>
            <nav aria-label={t('Main')} className="mx-auto hidden items-center gap-1 lg:flex">
              {HOME_LINKS.map((l) => (
                // (the wide-screen-only ones make room below 1280px)
                <SiteLink key={l.href} href={l.href} className={clsx('rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted transition-colors hover:text-ink', l.wide && 'hidden xl:block')}>
                  {t(l.label)}
                </SiteLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <button
                type="button"
                onClick={onSearch}
                aria-label={t('Search the docs')}
                title={t('Search the docs') + ' (' + mod + ' K)'}
                className="flex h-9 items-center gap-2 rounded-lg px-2 whitespace-nowrap text-muted transition-colors hover:bg-raised hover:text-ink xl:border xl:border-line xl:pr-1.5 xl:pl-2.5"
              >
                <SearchIcon className="text-lg xl:text-base" />
                <span className="hidden text-sm xl:inline">{t('Search')}</span>
                <kbd className="hidden rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted xl:inline">{mod} K</kbd>
              </button>
              <GitHubLink />
              <LanguageSwitch className="ml-1 hidden sm:flex" />
              <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
              <div className="hidden sm:block">
                <ThemeSwitch />
              </div>
              <SiteLink
                href="/introduction"
                className="ml-2 hidden items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-accent-ink shadow-sm transition hover:opacity-90 active:scale-[0.98] md:inline-flex"
              >
                {t('Get started')} <ArrowRightIcon className="text-sm" />
              </SiteLink>
            </div>
          </>
        ) : (
          <>
            <a
              href="https://www.npmjs.com/package/@kbach/react"
              target="_blank"
              rel="noreferrer"
              title={t('The latest release on npm')}
              className="hidden shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-medium text-accent transition-colors hover:bg-gold/20 md:inline-flex"
            >
              v{KBACH_VERSION}
            </a>
            <div className="hidden flex-1 justify-center px-6 md:flex">
              <SearchButton onOpen={onSearch} />
            </div>
            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <button type="button" onClick={onSearch} aria-label={t('Search')} className={clsx(iconButton, 'md:hidden')}>
                <SearchIcon />
              </button>
              <nav aria-label={t('Site')} className="mr-1 hidden items-center rounded-full border border-line bg-panel p-0.5 lg:flex">
                {PLACES.map((p) => (
                  <SiteLink
                    key={p.id}
                    href={p.href}
                    aria-current={at === p.id ? 'page' : undefined}
                    className={clsx(
                      'rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
                      at === p.id ? 'bg-card text-ink shadow-xs ring-1 ring-line' : 'text-muted hover:text-ink',
                    )}
                  >
                    {t(p.label)}
                  </SiteLink>
                ))}
              </nav>
              <GitHubLink />
              <LanguageSwitch className="ml-1 hidden sm:flex" />
              <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
              <div className="hidden sm:block">
                <ThemeSwitch />
              </div>
            </div>
          </>
        )}
      </div>
      {/* a thin gold line, like the gilt edge of the logo (once the page scrolls) */}
      <div className={clsx('h-px bg-linear-to-r from-transparent via-gold/50 to-transparent transition-opacity duration-300', clear && 'opacity-0')} />
    </header>
  );
}
