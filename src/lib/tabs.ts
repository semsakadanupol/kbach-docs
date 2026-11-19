import { useSyncExternalStore } from 'react';
import { notifyLocation, subscribeLocation } from './location';

// The selected tab of a page's ":::tabs" group (the setup picker on
// Installation). It lives in the URL as ?tab=<id>, so a link can point at
// one setup, and is remembered for the next visit.
const STORAGE_KEY = 'kbach-docs-tab';

function remembered(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The tab to show, out of `ids`: the URL's, then the remembered one, then the first. */
export function useActiveTab(ids: string[]): string {
  // The built page shows the first tab (there's no URL or storage then); the
  // browser switches to the URL's or the remembered one as the page starts.
  const wanted = useSyncExternalStore(
    subscribeLocation,
    () => {
      const fromUrl = new URLSearchParams(window.location.search).get('tab');
      if (fromUrl && ids.includes(fromUrl)) return fromUrl;
      const saved = remembered();
      return saved && ids.includes(saved) ? saved : null;
    },
    () => null,
  );
  return wanted ?? ids[0] ?? '';
}

export function selectTab(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // storage blocked: the URL still carries the choice
  }
  const url = new URL(window.location.href);
  url.searchParams.set('tab', id);
  url.hash = '';
  history.replaceState(history.state, '', url.pathname + url.search);
  notifyLocation();
}
