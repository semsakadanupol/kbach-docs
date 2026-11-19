import { useEffect, useMemo, useRef, useState } from 'react';
import { useBrowserValue } from '../lib/browser';
import { clsx } from '@kbach/react';
import { NAV } from '../lib/docs';
import { ChevronRightIcon } from './icons';
import { SECTION_INFO } from './sections';
import { useT } from '../lib/i18n';
import { SiteLink } from './SiteLink';
import { usePages } from './site/SiteData';

const STORAGE_KEY = 'kbach-docs-collapsed';

/** The folded groups the reader saved, as stored (a JSON list). */
function saved(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function parse(json: string): Set<string> {
  try {
    return new Set(JSON.parse(json) as string[]);
  } catch {
    return new Set();
  }
}

/**
 * The docs navigation: one foldable group per section. Folded groups are
 * remembered; the group holding the current page always opens, and the
 * current page scrolls into view when it changes (e.g. after "Next").
 */
export function Sidebar({ current, onPick }: { current: string; onPick?: () => void }) {
  // every group open in the built page; the saved folds once the page starts in the browser,
  // then the reader's clicks
  const stored = useBrowserValue(saved, '[]');
  const [clicked, setClicked] = useState<Set<string> | null>(null);
  const collapsed = useMemo(() => clicked ?? parse(stored), [clicked, stored]);
  const t = useT();
  const pages = usePages();
  const nav = useRef<HTMLElement>(null);
  const currentSection = NAV.find((s) => s.pages.includes(current))?.title;

  const toggle = (title: string) => {
    const next = new Set(collapsed);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setClicked(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // storage blocked: folding still works for this visit
    }
  };

  // Keep the active link visible inside the sidebar's own scroll area
  // (only that area: scrollIntoView would also move the page itself).
  useEffect(() => {
    const link = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!link) return;
    let box = link.parentElement;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    if (!box) return;
    const linkRect = link.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const margin = 24;
    if (linkRect.top < boxRect.top + margin) box.scrollTop -= boxRect.top + margin - linkRect.top;
    else if (linkRect.bottom > boxRect.bottom - margin) box.scrollTop += linkRect.bottom - (boxRect.bottom - margin);
  }, [current, collapsed]);

  return (
    <nav ref={nav} aria-label={t('Documentation')} className="space-y-5 text-sm">
      {NAV.map((section) => {
        const open = section.title === currentSection || !collapsed.has(section.title);
        const id = 'nav-' + section.title.toLowerCase().replace(/\s+/g, '-');
        const Icon = SECTION_INFO[section.title]?.icon;
        return (
          <div key={section.title}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => toggle(section.title)}
              className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#f5ead2] dark:bg-logo text-[13px] text-bronze dark:text-gold shadow-sm ring-1 ring-gold/25" aria-hidden="true">
                {Icon && <Icon />}
              </span>
              <span className="flex-1">{t(section.title)}</span>
              <ChevronRightIcon className={clsx('text-sm text-faint transition-transform duration-200 group-hover:text-accent', open && 'rotate-90')} />
            </button>
            <ul id={id} hidden={!open} className="mt-2 ml-5 space-y-px border-l border-line">
              {section.pages.map((slug) => {
                const page = pages.find((p) => p.slug === slug);
                if (!page) return null;
                const active = slug === current;
                return (
                  <li key={slug}>
                    <SiteLink
                      href={'/' + slug}
                      aria-current={active ? 'page' : undefined}
                      onClick={onPick}
                      className={clsx(
                        'group -ml-px flex scroll-my-6 items-center border-l-2 py-1.5 pr-3 pl-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold',
                        active
                          ? 'rounded-r-lg border-gold bg-gold/12 font-semibold text-accent'
                          : 'border-transparent text-muted hover:border-faint hover:text-ink',
                      )}
                    >
                      {/* the text nudges on hover, not the link: the link's left border is part of the line */}
                      <span className={clsx('transition-transform duration-200', !active && 'group-hover:translate-x-0.5')}>{page.nav}</span>
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
