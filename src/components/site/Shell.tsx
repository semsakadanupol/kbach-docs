'use client';

import { createContext, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { applyKbachConfig, useTheme } from '@kbach/react';
import config from '../../../kbach.config.js';
import { notifyLocation, rememberPreviousPage, scrollToHashTarget } from '../../lib/location';
import { SearchDialog } from '../Search';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { placeOf } from './places';
import { startScrollReveal } from '../scrollReveal';

// The build already compiled the site's CSS from kbach.config.js. Applying
// it here too gives the runtime engine (live previews, the playground) the
// same theme, and puts the dark-mode class on <html> for the 'class' strategy.
applyKbachConfig(config);

const SearchContext = createContext<() => void>(() => {});

/** Opens the search dialog (the 404 page's button). */
export function useOpenSearch(): () => void {
  return useContext(SearchContext);
}

/**
 * Around every page: the header, the phone menu and search, and what the
 * whole site does on every page (the page-change bar, Ctrl+K, the browser
 * bar's color, jumping to a #section). The playground is its own full-screen
 * page: it gets none of the chrome.
 */
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const place = placeOf(path);
  const slug = path.replace(/^\/+|\/+$/g, '');
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);

  // iOS Safari applies :active only on a page that listens for touches, so without this the
  // press looks (active:, the touch twin of every hover: style) never show on an iPhone
  useEffect(() => {
    const none = () => {};
    document.addEventListener('touchstart', none, { passive: true });
    return () => document.removeEventListener('touchstart', none);
  }, []);

  // the scroll reveal (scrollReveal.ts), again for each page
  useEffect(() => startScrollReveal(), [path]);

  // the page-change bar: counts navigations, so the first load shows none
  const [navs, setNavs] = useState(0);
  const lastPath = useRef(path);
  const lastFull = useRef('');
  useEffect(() => {
    const here = () => window.location.pathname + window.location.search + window.location.hash;
    if (path !== lastPath.current) {
      lastPath.current = path;
      setNavs((n) => n + 1);
      rememberPreviousPage(lastFull.current);
      setMenu(false);
    }
    lastFull.current = here();
    // keep track of the address within the page too (a tab, a #section)
    const track = () => (lastFull.current = here());
    window.addEventListener('hashchange', track);
    window.addEventListener('popstate', track);
    // at /page#section, jump to the section (and stay there while the page finishes loading). The
    // section may not be there yet: in a tab (?tab=) that opens only once the page starts in the
    // browser, so look for it on every frame, for up to 2 seconds.
    let frame = 0;
    const id = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    if (id) {
      const until = performance.now() + 2000;
      const find = () => {
        const target = document.getElementById(id);
        if (target) scrollToHashTarget(target);
        else if (performance.now() < until) frame = requestAnimationFrame(find);
      };
      find();
    }
    notifyLocation();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', track);
      window.removeEventListener('popstate', track);
    };
  }, [path]);

  // The browser bar's color (on a phone) blends with the page, so it follows
  // the site's theme, also after a switch (the layout's script sets it before
  // the first paint). The tab icon doesn't: it follows the browser's theme.
  const { isDark } = useTheme();
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#1a2125' : '#faf7f0');
  }, [isDark]);

  // Ctrl+K / Cmd+K or "/" opens search
  useEffect(() => {
    if (place === 'playground') return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName));
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [place]);

  if (place === 'playground') return <>{children}</>;

  return (
    <SearchContext.Provider value={() => setSearching(true)}>
      <Suspense fallback={null}>
        <QueryWatcher />
      </Suspense>
      <div className="min-h-dvh bg-page font-sans text-ink antialiased">
        {navs > 0 && (
          <div
            key={navs}
            className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-bronze via-gold to-ember shadow-[0_0_8px_rgb(199_162_93/0.6)] animate-[kbd-progress_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
            aria-hidden="true"
          />
        )}
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
          Skip to content
        </a>
        <Header onMenu={() => setMenu(true)} onSearch={() => setSearching(true)} at={place} />
        <MobileNav open={menu} current={place === 'home' ? '' : slug} at={place} onClose={() => setMenu(false)} />
        <SearchDialog open={searching} onClose={() => setSearching(false)} />
        {children}
      </div>
    </SearchContext.Provider>
  );
}

/** Tells the tab groups when the ?query changes on the same page (a search result like /installation?tab=vite). */
function QueryWatcher() {
  const query = useSearchParams().toString();
  useEffect(() => notifyLocation(), [query]);
  return null;
}
