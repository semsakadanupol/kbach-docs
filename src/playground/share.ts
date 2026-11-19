import { EXAMPLES } from './examples';
import type { ScriptLang } from './script';
import { DEFAULT_CONFIG } from './config';

// The playground's code travels in the URL (#code=…&js=…&lang=ts, and
// &config=… once kbach.config.js differs from the default). Every
// visit starts from the first example; the reader's last edited code is
// kept in localStorage, to bring back with Restore.

export interface PlaygroundFiles {
  html: string;
  script: string;
  lang: ScriptLang;
  /** kbach.config.js */
  config: string;
}

const CONFIG_KEY = 'kbach-playground-config';
const HTML_KEY = 'kbach-playground-code';
const SCRIPT_KEY = 'kbach-playground-script';
const LANG_KEY = 'kbach-playground-lang';
const EXAMPLE_KEY = 'kbach-playground-example';

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

/** The URL fragment for these files. */
export function shareHash(files: PlaygroundFiles): string {
  let hash = '#code=' + encode(files.html);
  if (files.script.trim()) hash += '&js=' + encode(files.script) + (files.lang === 'ts' ? '&lang=ts' : '');
  if (files.config !== DEFAULT_CONFIG) hash += '&config=' + encode(files.config);
  return hash;
}

/** The first example: where every visit starts. */
export function defaultFiles(): PlaygroundFiles {
  const first = EXAMPLES[0];
  return { html: first?.html ?? '', script: first?.script ?? '', lang: first?.lang ?? 'js', config: first?.config ?? DEFAULT_CONFIG };
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
  return {
    html,
    script: (js && decode(js)) ?? '',
    lang: params.get('lang') === 'ts' ? 'ts' : 'js',
    config: (config && decode(config)) ?? DEFAULT_CONFIG,
  };
}

/**
 * A shared link's files, else the first example. A reload always starts
 * clean; the reader's last code is kept apart (savedFiles) to restore.
 */
export function initialFiles(): PlaygroundFiles {
  return sharedFiles() ?? defaultFiles();
}

/** The code the reader last edited, from an earlier visit (null if none), and the example it began as. */
export function savedFiles(): (PlaygroundFiles & { example: string | null }) | null {
  try {
    const html = window.localStorage.getItem(HTML_KEY);
    const script = window.localStorage.getItem(SCRIPT_KEY) ?? '';
    if (!html && !script) return null;
    const example = window.localStorage.getItem(EXAMPLE_KEY);
    return {
      html: html ?? '',
      script,
      lang: window.localStorage.getItem(LANG_KEY) === 'ts' ? 'ts' : 'js',
      config: window.localStorage.getItem(CONFIG_KEY) ?? DEFAULT_CONFIG,
      example: EXAMPLES.some((e) => e.id === example) ? example : null,
    };
  } catch {
    return null; // storage blocked
  }
}

/** Whether these files are one of the examples, untouched. */
export function isPristineExample(files: PlaygroundFiles): boolean {
  return EXAMPLES.some((e) => e.html === files.html && e.script === files.script && e.lang === files.lang && e.config === files.config);
}

export function saveFiles(files: PlaygroundFiles, example: string | null): void {
  try {
    window.localStorage.setItem(HTML_KEY, files.html);
    window.localStorage.setItem(SCRIPT_KEY, files.script);
    window.localStorage.setItem(LANG_KEY, files.lang);
    window.localStorage.setItem(CONFIG_KEY, files.config);
    if (example) window.localStorage.setItem(EXAMPLE_KEY, example);
    else window.localStorage.removeItem(EXAMPLE_KEY);
  } catch {
    // storage blocked
  }
}
