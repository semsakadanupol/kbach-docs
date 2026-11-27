import { EXAMPLES, exampleOf } from './examples';
import type { ScriptLang } from './script';
import { DEFAULT_CONFIG } from './config';
import { configAsScript, upgradeHtmlPage } from './cdn';
import { ensureDocument } from './document';

// The playground's code travels in the URL (#code=…&js=…&lang=ts, &mode=react for a React
// page, and &config=… once kbach.config.js differs from the default for its kind of page). #example=<id> opens
// one of the examples (a link from the docs, the gallery's thumbnails), its React version
// with &mode=react.
// Otherwise every visit starts from the first example; the reader's last
// edited code is kept in localStorage, to bring back with Restore.

/** html: index.html and a script; react: index.html and App.jsx (react.ts). */
export type PlaygroundMode = 'html' | 'react';

export interface PlaygroundFiles {
  html: string;
  script: string;
  lang: ScriptLang;
  /** kbach.config.js: React's `module.exports = { … }`, a plain HTML page's `window.kbachConfig = { … }` (cdn.ts) */
  config: string;
  mode: PlaygroundMode;
}

const CONFIG_KEY = 'kbach-playground-config';
const HTML_KEY = 'kbach-playground-code';
const SCRIPT_KEY = 'kbach-playground-script';
const LANG_KEY = 'kbach-playground-lang';
const EXAMPLE_KEY = 'kbach-playground-example';
const MODE_KEY = 'kbach-playground-mode';

function encode(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(text: string): string | null {
  try {
    const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** kbach.config.js as it starts for a kind of page: the build plugin's for React, a plain page's for HTML (cdn.ts). */
export function defaultConfigFor(mode: PlaygroundMode): string {
  return mode === 'react' ? DEFAULT_CONFIG : configAsScript(DEFAULT_CONFIG);
}

/** The URL fragment for these files. */
export function shareHash(files: PlaygroundFiles): string {
  let hash = '#code=' + encode(files.html);
  if (files.script.trim()) hash += '&js=' + encode(files.script) + (files.lang === 'ts' ? '&lang=ts' : '');
  if (files.config !== defaultConfigFor(files.mode)) hash += '&config=' + encode(files.config);
  if (files.mode === 'react') hash += '&mode=react';
  return hash;
}

/** The first example: where every visit starts. */
export function defaultFiles(): PlaygroundFiles {
  return EXAMPLES[0]?.html ?? { html: '', script: '', lang: 'js', config: defaultConfigFor('html'), mode: 'html' };
}

/** The files in a shared link (#code=…), if the URL has one. */
export function sharedFiles(): PlaygroundFiles | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const shared = params.get('code');
  if (shared === null) return null;
  const html = decode(shared);
  if (html === null) return null;
  const js = params.get('js');
  const config = params.get('config');
  const mode: PlaygroundMode = params.get('mode') === 'react' ? 'react' : 'html';
  // An HTML link from before 2026-11-27 had the build plugin's config and no CDN script: its
  // config becomes a plain page's, and the page loads it and the script. (A newer link whose
  // reader deleted the script gets it back too: old links are far more common.)
  // (a whole document first: an older link may hold only the body's markup, with no <head> to put the setup in)
  return upgradeHtmlPage<PlaygroundFiles>({
    html: ensureDocument(html),
    script: (js && decode(js)) ?? '',
    lang: params.get('lang') === 'ts' ? 'ts' : 'js',
    config: (config && decode(config)) ?? defaultConfigFor(mode),
    mode,
  });
}

/** The example a link names (#example=3-navbar, &mode=react for its React version), if it names one that exists. */
export function linkedExample(): (PlaygroundFiles & { id: string }) | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const id = params.get('example');
  const ex = id ? EXAMPLES.find((e) => e.id === id) : null;
  return ex ? { id: ex.id, ...ex[params.get('mode') === 'react' ? 'react' : 'html'] } : null;
}

/**
 * A shared link's files, else a linked example (#example=…), else the first example. A reload always starts
 * clean; the reader's last code is kept apart (savedFiles) to restore.
 */
export function initialFiles(): PlaygroundFiles {
  return sharedFiles() ?? linkedExample() ?? defaultFiles();
}

/** The code the reader last edited, from an earlier visit (null if none), and the example it began as. */
export function savedFiles(): (PlaygroundFiles & { example: string | null }) | null {
  try {
    const html = window.localStorage.getItem(HTML_KEY);
    const script = window.localStorage.getItem(SCRIPT_KEY) ?? '';
    if (!html && !script) return null;
    const example = window.localStorage.getItem(EXAMPLE_KEY);
    // (HTML code saved before 2026-11-27 had the build plugin's config and no CDN script: upgraded)
    return upgradeHtmlPage<PlaygroundFiles & { example: string | null }>({
      html: html ? ensureDocument(html) : '',
      script,
      lang: window.localStorage.getItem(LANG_KEY) === 'ts' ? 'ts' : 'js',
      config: window.localStorage.getItem(CONFIG_KEY) ?? defaultConfigFor(window.localStorage.getItem(MODE_KEY) === 'react' ? 'react' : 'html'),
      mode: window.localStorage.getItem(MODE_KEY) === 'react' ? 'react' : 'html',
      example: EXAMPLES.some((e) => e.id === example) ? example : null,
    });
  } catch {
    return null; // storage blocked
  }
}

/** Whether these files are one of the examples, untouched. */
export function isPristineExample(files: PlaygroundFiles): boolean {
  return exampleOf(files) !== null;
}

export function saveFiles(files: PlaygroundFiles, example: string | null): void {
  try {
    window.localStorage.setItem(HTML_KEY, files.html);
    window.localStorage.setItem(SCRIPT_KEY, files.script);
    window.localStorage.setItem(LANG_KEY, files.lang);
    window.localStorage.setItem(CONFIG_KEY, files.config);
    window.localStorage.setItem(MODE_KEY, files.mode);
    if (example) window.localStorage.setItem(EXAMPLE_KEY, example);
    else window.localStorage.removeItem(EXAMPLE_KEY);
  } catch {
    // storage blocked
  }
}
