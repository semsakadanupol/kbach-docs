// React mode (2026-11-26): the reader writes App.jsx (or App.tsx), a React component with
// className, and the canvas runs real React. Kbach styles it the same way as HTML: classes
// in the source get their CSS up front (scriptCandidates reads every quoted string), and
// classes React puts on the page later are reported by the canvas and get theirs then.
//
// React itself comes from esm.sh, pinned, through an import map in the canvas (the canvas
// is sandboxed without allow-same-origin, but it can load scripts). The compiled App is the
// canvas's module script, as a script file is in HTML mode, so error lines map the same way;
// a few lines added at its end mount the component the file exports into #root.

export const REACT_VERSION = '19.2.0';

const IMPORTS = {
  react: `https://esm.sh/react@${REACT_VERSION}`,
  'react/': `https://esm.sh/react@${REACT_VERSION}/`,
  'react-dom': `https://esm.sh/react-dom@${REACT_VERSION}`,
  'react-dom/': `https://esm.sh/react-dom@${REACT_VERSION}/`,
};

/**
 * The import map that lets `import { useState } from 'react'` work in the canvas (and in an
 * exported file); with `kbach` (kbachModule.ts's data: URL), `from '@kbach/react'` too.
 */
export function importMap(kbach?: string): string {
  return '<script type="importmap">' + JSON.stringify({ imports: kbach ? { ...IMPORTS, '@kbach/react': kbach } : IMPORTS }) + '</script>';
}

/** index.html for a React page: the element the App is mounted in. */
export const REACT_INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React page</title>
  </head>
  <body>
    <!-- App.jsx is mounted here -->
    <div id="root"></div>
  </body>
</html>
`;

/**
 * A React page's index.html for an example: REACT_INDEX_HTML with the HTML version's <html>,
 * <title> and <body> tags (its body's classes, its language), so both versions look the same.
 */
export function reactIndexFor(html: string): string {
  const tag = (name: string) => new RegExp('<' + name + '(?:\\s[^>]*)?>', 'i').exec(html)?.[0];
  const title = /<title>[\s\S]*?<\/title>/i.exec(html)?.[0];
  let page = REACT_INDEX_HTML;
  const htmlTag = tag('html');
  const bodyTag = tag('body');
  if (htmlTag) page = page.replace('<html lang="en">', htmlTag);
  if (title) page = page.replace('<title>React page</title>', title);
  if (bodyTag) page = page.replace('<body>', bodyTag);
  return page;
}

/**
 * The compiled App, with the lines that mount it. The component is what the file exports by
 * default: a named one (export default function App) keeps its name; an unnamed default
 * export (an arrow function) is given one. Added on the last line, so line numbers don't move.
 */
export function withMount(code: string): { code: string; error?: string } {
  let name: string | null = null;
  const named = /\bexport\s+default\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/.exec(code) ?? /\bexport\s+default\s+class\s+([A-Za-z_$][\w$]*)/.exec(code);
  if (named) name = named[1];
  else {
    const ident = /\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/m.exec(code);
    if (ident && !['function', 'class', 'async'].includes(ident[1])) name = ident[1];
  }
  if (!name && /\bexport\s+default\b/.test(code)) {
    code = code.replace(/\bexport\s+default\b/, 'const __KbachApp =');
    name = '__KbachApp';
  }
  if (!name) return { code, error: 'App.jsx needs a component to show: export default function App() { … }' };
  const mount =
    "import { createRoot as __kbCreateRoot } from 'react-dom/client'; import { jsx as __kbJsx } from 'react/jsx-runtime'; " +
    "__kbCreateRoot(document.getElementById('root') ?? document.body.appendChild(document.createElement('div'))).render(__kbJsx(" + name + ', {}));';
  return { code: code.replace(/\s*$/, '') + '\n' + mount + '\n' };
}

/**
 * Where App.jsx writes exactly these classes as one className="…" (or className={'…'})
 * value: the Inspector's way to change a React element's classes in the code. Null when no
 * literal has them (classes built with cn(), a variable or state) or more than one does
 * (it can't tell which element is which).
 */
export function classLiteralFor(source: string, classes: string[]): { from: number; to: number } | null {
  const want = [...classes].sort().join(' ');
  if (!want) return null;
  let found: { from: number; to: number } | null = null;
  for (const m of source.matchAll(/\bclassName\s*=\s*(?:\{\s*)?(["'`])((?:(?!\1)[^\\$])*)\1/g)) {
    if (m[2].split(/\s+/).filter(Boolean).sort().join(' ') !== want) continue;
    if (found) return null;
    const from = m.index! + m[0].length - 1 - m[2].length;
    found = { from, to: from + m[2].length };
  }
  return found;
}

/**
 * The class lists written in JSX (className="…", className={'…'}, className={`…`} without
 * ${…}, and the string arguments of clsx() / cn()), as <div class="…"> markup: what the React
 * Native tab turns into style objects, one per distinct list.
 */
export function jsxClassMarkup(source: string): string {
  const lists: string[] = [];
  for (const m of source.matchAll(/\bclassName\s*=\s*(?:\{\s*)?(["'`])((?:(?!\1)[^\\$]|\\.)*)\1/g)) lists.push(m[2]);
  for (const m of source.matchAll(/\b(?:clsx|cn)\(([^)]*)\)/g)) for (const s of m[1].matchAll(/(["'`])((?:(?!\1)[^\\$])*)\1/g)) lists.push(s[2]);
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return lists
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((l) => '<div class="' + esc(l) + '"></div>')
    .join('\n');
}
