'use client';

import { useEffect } from 'react';
import { clsx } from '@kbach/react';
import { GITHUB } from '../../lib/site';
import { useT } from '../../lib/i18n';
import { LanguageSwitch } from '../LanguageSwitch';
import { Sidebar } from '../Sidebar';
import { SiteLink } from '../SiteLink';
import { ThemeSwitch } from '../ThemeSwitch';
import { ArrowRightIcon, ChevronRightIcon, CloseIcon, GitHubIcon } from '../icons';
import { Brand } from './Header';
import { HOME_LINKS, PLACES, type Place } from './places';

/** The phone menu: slides in from the left. On the home page it lists where to go; in the docs, the docs' pages. */
export function MobileNav({ open, current, at, onClose }: { open: boolean; current: string; at: Place; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={clsx('fixed inset-0 z-40 lg:hidden', open ? 'visible' : 'invisible pointer-events-none')} aria-hidden={!open}>
      <div className={clsx('absolute inset-0 bg-scrim/50 backdrop-blur-sm transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div
        className={clsx(
          'absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-line bg-page shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <Brand at="home" />
          <button type="button" onClick={onClose} aria-label={t('Close navigation')} className="grid size-9 place-items-center rounded-lg text-xl text-muted hover:bg-raised hover:text-ink">
            <CloseIcon />
          </button>
        </div>
        {at === 'home' ? (
          <HomeMenu onClose={onClose} />
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-5">
            {/* the main places first, the current one marked */}
            <nav aria-label={t('Site')} className="mb-6 grid grid-cols-3 gap-1.5">
              {[{ id: 'home', label: 'Home', href: '/' }, ...PLACES].map((p) => {
                const on = p.id === at;
                return (
                  <SiteLink
                    key={p.id}
                    href={p.href}
                    onClick={onClose}
                    aria-current={on ? 'page' : undefined}
                    className={clsx(
                      'rounded-lg border px-2 py-2 text-center text-[13px] font-medium transition-colors',
                      on ? 'border-gold/50 bg-gold/12 text-accent' : 'border-line text-muted hover:text-ink',
                    )}
                  >
                    {t(p.label)}
                  </SiteLink>
                );
              })}
            </nav>
            <Sidebar current={current} onPick={onClose} />
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-sm text-muted">{t('Language')}</span>
          <LanguageSwitch />
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-sm text-muted">{t('Theme')}</span>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}

/**
 * The phone menu on the home page: where to go, not the docs' 34 pages.
 * The same links as the wide header, each with what it's for, then Get
 * started and GitHub.
 */
function HomeMenu({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
      <nav aria-label={t('Main')} className="space-y-1">
        {HOME_LINKS.map((l) => (
          <SiteLink key={l.href} href={l.href} onClick={onClose} className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-raised">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f5ead2] dark:bg-logo text-base text-bronze dark:text-gold shadow-sm ring-1 ring-gold/25">
              <l.icon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">{t(l.label)}</span>
              <span className="block text-xs leading-5 text-muted">{t(l.note)}</span>
            </span>
            <ChevronRightIcon className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
          </SiteLink>
        ))}
      </nav>
      <div className="mt-auto space-y-2 pt-6">
        <SiteLink
          href="/introduction"
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90"
        >
          {t('Get started')} <ArrowRightIcon />
        </SiteLink>
        <a
          href={GITHUB}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold/60"
        >
          <GitHubIcon /> GitHub
        </a>
      </div>
    </div>
  );
}
