// Opens a page in the playground as a share link (#code=…&js=…), the same
// thing a reader gets from Share. The pages: the playground's own example
// (content/playground/1-landing/, a folder) and the test pages in ./fixtures (navbar,
// colors, toasts, checklist), each a body's markup plus an optional .js or
// .ts file. A .js file, so run.mjs (which runs every .mjs here) doesn't
// treat it as a suite.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const dirs = [join(here, 'fixtures'), join(here, '..', '..', 'content', 'playground')];
const encode = (text) => Buffer.from(text, 'utf-8').toString('base64url');

/**
 * The files of a page such as 'navbar' (a fixture: navbar.html, navbar.js or .ts, navbar.config.js)
 * or '1-landing' (an example's folder: index.html, script.js or .ts, kbach.config.js).
 */
function pageFiles(id) {
  for (const d of dirs) {
    const folder = join(d, id);
    if (existsSync(join(folder, 'index.html')))
      return { html: join(folder, 'index.html'), ts: join(folder, 'script.ts'), js: join(folder, 'script.js'), config: join(folder, 'kbach.config.js') };
    if (existsSync(join(d, id + '.html')))
      return { html: join(d, id + '.html'), ts: join(d, id + '.ts'), js: join(d, id + '.js'), config: join(d, id + '.config.js') };
  }
  throw new Error('no test page named ' + id);
}

/**
 * A whole page as HTML mode has one (2026-11-27): it loads kbach.config.js (the playground's
 * Config tab, window.kbachConfig), then Kbach's CDN script, and its script (script.js, or
 * script.ts with lang 'ts') before </body>; `body` is its body. For a test that types a page in:
 * a snippet alone has no Kbach and runs no script, as a plain page without the tags.
 */
export function cdnPage(body, lang = 'js') {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <title>Test</title>',
    '    <script src="kbach.config.js"></script>',
    '    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>',
    '  </head>',
    '  <body>',
    '    ' + body,
    '    <script type="module" src="script.' + lang + '"></script>',
    '  </body>',
    '</html>',
    '',
  ].join('\n');
}

/** `/playground#code=…` for a page such as 'navbar' or '1-landing', its script and language included. */
export function exampleLink(base, id) {
  const files = pageFiles(id);
  const html = readFileSync(files.html, 'utf-8').replace(/\r\n/g, '\n').replace(/^<!--.*?-->\s*\n?/, '');
  const scriptPath = existsSync(files.ts) ? files.ts : existsSync(files.js) ? files.js : null;
  let hash = '#code=' + encode(html);
  if (scriptPath) {
    const script = readFileSync(scriptPath, 'utf-8').replace(/\r\n/g, '\n');
    if (script.trim()) hash += '&js=' + encode(script) + (scriptPath === files.ts ? '&lang=ts' : '');
  }
  // its own kbach.config.js (the theme its classes use), as Share includes it
  if (existsSync(files.config)) hash += '&config=' + encode(readFileSync(files.config, 'utf-8').replace(/\r\n/g, '\n'));
  return base + '/playground' + hash;
}

/**
 * Puts the shown editor's cursor right after the first `text` on screen (Ctrl+Home and arrow
 * keys would land in index.html's fixed <!doctype html>/<head> lines). From the top: a long
 * page's lines are only drawn near where the editor is scrolled to.
 */
export async function cursorAfter(page, text) {
  await page.focus('.cm-editor:not(.hidden) .cm-content');
  await page.keyboard.press('Control+Home');
  await page.waitForTimeout(100);
  return page.evaluate((t) => {
    const content = [...document.querySelectorAll('.cm-editor .cm-content')].find((c) => c.offsetParent);
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let acc = '';
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const i = (acc + n.textContent).indexOf(t);
      if (i >= 0 && i + t.length > acc.length) {
        const r = document.createRange();
        r.setStart(n, i + t.length - acc.length);
        r.collapse(true);
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        return true;
      }
      acc += n.textContent;
    }
    return false;
  }, text);
}

/** Whether the shown editor has a line (on screen) that is `text`, indentation aside. */
export function hasLine(page, text) {
  return page.$$eval('.cm-editor:not(.hidden) .cm-line', (ls, t) => ls.some((l) => l.offsetParent && l.textContent.trim() === t), text);
}

/** Opens a page in `page`, fresh (a link that only differs by its #hash would not reload). */
export async function openExample(page, base, id) {
  await page.goto('about:blank');
  await page.goto(exampleLink(base, id), { waitUntil: 'networkidle' });
  await page.waitForSelector('.cm-content');
  await page.waitForTimeout(800);
}
