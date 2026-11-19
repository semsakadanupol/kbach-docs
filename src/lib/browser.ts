import { useSyncExternalStore } from 'react';

// A value only the browser knows (the platform, saved settings, the address):
// `server` while the page is built and while it starts, then `read()`. React
// switches to the browser's value right after the page starts, so the built
// HTML and the first render in the browser always agree.

const noSubscription = () => () => {};

/** `read()` must return the same value (a string, number or boolean) until it really changes. */
export function useBrowserValue<T extends string | number | boolean | null>(read: () => T, server: T): T {
  return useSyncExternalStore(noSubscription, read, () => server);
}

/** False while the page is built and while it starts, true once it runs in the browser. */
export function useStarted(): boolean {
  return useBrowserValue(() => true, false);
}

/** ⌘ on a Mac, Ctrl elsewhere (the built page says Ctrl). */
export function useModKey(): string {
  return useBrowserValue(() => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'), 'Ctrl');
}
