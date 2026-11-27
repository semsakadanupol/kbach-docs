'use client';

import { useEffect, useRef, useState, type RefObject, type TouchEvent } from 'react';
import { clsx } from '@kbach/react';
import { GITHUB } from '../../lib/site';
import { Sidebar } from '../Sidebar';
import { SiteLink } from '../SiteLink';
import { ThemeSwitch } from '../ThemeSwitch';
import { ChevronRightIcon, CloseIcon, GitHubIcon } from '../icons';
import { Brand } from './Header';
import { HOME_LINKS, PLACES, type Place } from './places';

/**
 * The phone menu: slides in from the left, and a finger can drag it back out (useSwipeToClose).
 * On the home page it lists where to go; in the docs, the docs' pages.
 */
export function MobileNav({ open, current, at, onClose }: { open: boolean; current: string; at: Place; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const swipe = useSwipeToClose(panel, onClose);
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
      <div
        className={clsx('absolute inset-0 bg-scrim/50 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none', open ? 'opacity-100' : 'opacity-0')}
        style={swipe.backdropStyle}
        onClick={onClose}
      />
      <div
        ref={panel}
        {...swipe.handlers}
        style={swipe.panelStyle}
        className={clsx(
          // touch-pan-y: the page list still scrolls up and down; a sideways drag is the swipe's
          'absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] touch-pan-y flex-col border-r border-line bg-page shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <Brand at="home" />
          <button type="button" onClick={onClose} aria-label="Close navigation" className="grid size-9 pointer-coarse:size-11 place-items-center rounded-lg text-xl text-muted hover:bg-raised hover:text-ink active:bg-raised active:text-ink">
            <CloseIcon />
          </button>
        </div>
        {at === 'home' ? (
          <HomeMenu onClose={onClose} />
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-5">
            {/* the main places first, the current one marked */}
            <nav aria-label="Site" className="mb-6 grid grid-cols-3 gap-1.5">
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
                      on ? 'border-gold/50 bg-gold/12 text-accent' : 'border-line text-muted hover:text-ink active:text-ink',
                    )}
                  >
                    {p.label}
                  </SiteLink>
                );
              })}
            </nav>
            <Sidebar current={current} onPick={onClose} />
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-sm text-muted">Theme</span>
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
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
      <nav aria-label="Main" className="space-y-1">
        {HOME_LINKS.map((l) => (
          <SiteLink key={l.href} href={l.href} onClick={onClose} className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-raised active:bg-raised">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f5ead2] dark:bg-logo text-base text-bronze dark:text-gold shadow-sm ring-1 ring-gold/25">
              <l.icon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">{l.label}</span>
              <span className="block text-xs leading-5 text-muted">{l.note}</span>
            </span>
            <ChevronRightIcon className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
          </SiteLink>
        ))}
      </nav>
      {/* no Get started here (2026-11-27, as in the header): the hero right behind the menu has it */}
      <div className="mt-auto pt-6">
        <a
          href={GITHUB}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold/60 active:border-gold/60"
        >
          <GitHubIcon /> GitHub
        </a>
      </div>
    </div>
  );
}

/**
 * Drag the open menu to the left to close it. The panel follows the finger; let go past a third
 * of its width (or with a quick flick) and it closes, else it springs back. A gesture that starts
 * up or down is left to the browser, so the page list scrolls as usual.
 */
function useSwipeToClose(panel: RefObject<HTMLDivElement | null>, onClose: () => void) {
  const start = useRef<{ x: number; y: number; time: number; width: number; axis?: 'x' | 'y' } | null>(null);
  // while a finger drags the panel: how far it has moved (0 or less), and the panel's width
  const [drag, setDrag] = useState<{ offset: number; width: number } | null>(null);

  const handlers = {
    onTouchStart(e: TouchEvent) {
      const p = e.touches[0];
      start.current = { x: p.clientX, y: p.clientY, time: e.timeStamp, width: panel.current?.offsetWidth ?? 320 };
    },
    onTouchMove(e: TouchEvent) {
      const s = start.current;
      if (!s) return;
      const p = e.touches[0];
      const dx = p.clientX - s.x;
      const dy = p.clientY - s.y;
      // decide once the finger has moved a little: sideways is ours, up or down is a scroll
      if (!s.axis && Math.hypot(dx, dy) > 8) s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (s.axis === 'x') setDrag({ offset: Math.min(0, dx), width: s.width });
    },
    onTouchEnd(e: TouchEvent) {
      const s = start.current;
      start.current = null;
      if (!drag || !s) return;
      const speed = drag.offset / Math.max(1, e.timeStamp - s.time); // px per ms, negative to the left
      setDrag(null);
      if (drag.offset < -drag.width / 3 || speed < -0.5) onClose();
    },
    onTouchCancel() {
      start.current = null;
      setDrag(null);
    },
  };

  // while dragging: no transition (the panel sticks to the finger), the backdrop fading with it
  const panelStyle = drag && { transform: `translateX(${drag.offset}px)`, transition: 'none' };
  const backdropStyle = drag && { opacity: Math.max(0, 1 + drag.offset / drag.width), transition: 'none' };
  return { handlers, panelStyle: panelStyle || undefined, backdropStyle: backdropStyle || undefined };
}
