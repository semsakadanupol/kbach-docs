// Opens a page in the playground as a share link (#code=…&js=…), the same
// thing a reader gets from Share. The pages: the playground's own example
// (content/playground/1-landing) and the test pages in ./fixtures (navbar,
// colors, toasts, checklist), each a body's markup plus an optional .js or
// .ts file. A .js file, so run.mjs (which runs every .mjs here) doesn't
// treat it as a suite.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const dirs = [join(here, 'fixtures'), join(here, '..', '..', 'content', 'playground')];
const encode = (text) => Buffer.from(text, 'utf-8').toString('base64url');

/** `/en/playground#code=…` for a page such as 'navbar' or '1-landing', its script and language included. */
export function exampleLink(base, id) {
  const dir = dirs.find((d) => existsSync(join(d, id + '.html')));
  if (!dir) throw new Error('no test page named ' + id);
  const html = readFileSync(join(dir, id + '.html'), 'utf-8').replace(/\r\n/g, '\n').replace(/^<!--.*?-->\s*\n?/, '');
  const ts = join(dir, id + '.ts');
  const js = join(dir, id + '.js');
  const scriptPath = existsSync(ts) ? ts : existsSync(js) ? js : null;
  let hash = '#code=' + encode(html);
  if (scriptPath) {
    const script = readFileSync(scriptPath, 'utf-8').replace(/\r\n/g, '\n');
    if (script.trim()) hash += '&js=' + encode(script) + (scriptPath === ts ? '&lang=ts' : '');
  }
  // its own kbach.config.js (the theme its classes use), as Share includes it
  const config = join(dir, id + '.config.js');
  if (existsSync(config)) hash += '&config=' + encode(readFileSync(config, 'utf-8').replace(/\r\n/g, '\n'));
  return base + '/en/playground' + hash;
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
