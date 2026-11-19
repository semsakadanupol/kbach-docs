import type { MouseEvent } from 'react';

// "The address changed": for the few things that read the URL themselves
// (the ?tab= of a tab group). The browser's Back and Forward fire popstate;
// a link inside the site goes through Next.js, so components/site/Shell.tsx
// calls notifyLocation() after every navigation; and code that changes the
// URL by hand (selectTab) calls it too.

const listeners = new Set<() => void>();

export function notifyLocation() {
  listeners.forEach((l) => l());
}

export function subscribeLocation(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

const USER_SCROLL = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * Scrolls `target` to the top of the view and keeps it there while a page
 * that just opened finishes loading (previews and reference tables can still
 * change size above it). Stops after a few seconds, or as soon as the reader
 * scrolls, taps or presses a key themselves.
 */
export function scrollToHashTarget(target: Element) {
  target.scrollIntoView({ block: 'start' });
  const stop = () => {
    clearTimeout(timer);
    ro.disconnect();
    for (const e of USER_SCROLL) window.removeEventListener(e, stop, true);
  };
  const ro = new ResizeObserver(() => target.scrollIntoView({ block: 'start' }));
  ro.observe(document.body);
  const timer = setTimeout(stop, 3000);
  for (const e of USER_SCROLL) window.addEventListener(e, stop, { capture: true, passive: true });
}

/** Click handler for a #section link on the same page: scrolls there smoothly and puts the #section in the address. */
export function onHashLinkClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const hash = e.currentTarget.hash;
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!target) return;
  e.preventDefault();
  if (window.location.hash !== hash) history.pushState(history.state, '', hash);
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// The site page this one was opened from, for the playground's Back button.
let previousPage: string | null = null;

/** Called on every navigation inside the site (Shell.tsx) with the page being left. */
export function rememberPreviousPage(path: string) {
  previousPage = path;
}

/**
 * The site page this one was opened from (path, query and hash), else null.
 * A full page load counts a link from this site too.
 */
export function previousSitePage(): string | null {
  if (previousPage !== null) return previousPage;
  if (!document.referrer.startsWith(window.location.origin + '/')) return null;
  const from = new URL(document.referrer);
  return from.pathname === window.location.pathname ? null : from.pathname + from.search + from.hash;
}
