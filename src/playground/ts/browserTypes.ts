// What an HTML page's script sees once Kbach's CDN script (@kbach/browser) has loaded, for the
// editor's TypeScript service (only while an HTML page is open: a React page has no window.Kbach).
// The shapes are @kbach/browser's own (packages/browser/src/index.ts and runtime.ts, 1.0.0),
// written out here because the package ships no type declarations.
export const BROWSER_TYPES_PATH = '/kbach-browser.d.ts';

export const BROWSER_TYPES = `import type { KbachConfig } from '@kbach/react';

declare global {
  /** What Kbach's CDN script (@kbach/browser) exposes as window.Kbach, once it has loaded. */
  interface KbachCdnApi {
    /** Resolves once the engine is loaded and the page's existing classes have been styled. */
    ready: Promise<void>;
    /** Replaces the active config (the same shape as kbach.config.js) and re-styles the whole page. */
    config(config: KbachConfig): void;
    /** Re-scans the whole page. Rarely needed: added elements and class changes are picked up automatically. */
    refresh(): void;
    /** 'light' | 'dark' | 'system', saved. Visible only with darkMode: 'class' or 'attribute' (under 'media', the OS setting decides). */
    setMode(mode: 'light' | 'dark' | 'system'): void;
    /** Flips light and dark. The same caveat as setMode. */
    toggle(): void;
  }
  interface Window {
    /** Read once by Kbach's CDN script as it loads: set it before the script tag. The same shape as kbach.config.js. */
    kbachConfig?: KbachConfig;
    /** Kbach's CDN script's API, once the script has loaded. */
    Kbach: KbachCdnApi;
  }
  /** Kbach's CDN script's API, once the script has loaded. */
  var Kbach: KbachCdnApi;
}

export {};
`;
