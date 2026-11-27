// index.html is a whole document whose skeleton (<!doctype html>, <html>,
// <head>, <body>) can't be deleted, only what's inside it; and Clear all.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const URL = 'http://localhost:5176/playground';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);

const ed = '.cm-editor:visible .cm-content';
/** the html editor's whole text (saved code lags typing by 400ms) */
const code = async () => {
  await p.waitForTimeout(600);
  return p.evaluate(() => localStorage.getItem('kbach-playground-code'));
};
// (the <html>, <head> and <body> tags may have attributes)
const skeletonOk = (s) => /^\s*<!doctype html>\s*<html\b[^>]*>\s*<head\b[^>]*>[\s\S]*<\/head>\s*<body\b[^>]*>[\s\S]*<\/body>\s*<\/html>\s*$/i.test(s ?? '');
const bodyOf = (s) => /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(s)?.[1] ?? null;
const headOf = (s) => /<head\b[^>]*>([\s\S]*)<\/head>/i.exec(s)?.[1] ?? null;
const frame = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
const inCanvas = async (fn) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await frame().evaluate(fn);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
/** the cursor right after the first occurrence of `text` in the editor */
const cursorAfter = (text) =>
  p.evaluate((t) => {
    const content = [...document.querySelectorAll('.cm-editor .cm-content')].find((c) => c.offsetParent);
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let acc = '';
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const i = (acc + n.textContent).indexOf(t);
      if (i >= 0 && i + t.length > acc.length) {
        const sel = getSelection();
        const r = document.createRange();
        r.setStart(n, i + t.length - acc.length);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        return true;
      }
      acc += n.textContent;
    }
    return false;
  }, text);

// --- the example is a whole document, its skeleton dimmed
const first = await p.$eval('.cm-editor:visible .cm-line', (e) => e.textContent);
check(first === '<!doctype html>', 'index.html starts with <!doctype html> (' + first + ')');
const locked = await p.$$eval('.cm-editor:visible .cm-kb-locked', (els) => els.map((e) => e.textContent));
check(['<!doctype', '<html', '<head', '</head>', '<body', '>'].every((t) => locked.includes(t)) && !locked.some((t) => t.includes('lang')), 'the skeleton’s fixed text is marked (not the attributes): ' + locked.join(' '));
check(await p.$eval('.cm-editor:visible .cm-kb-locked', (e) => Number(getComputedStyle(e).opacity) < 1), 'and shown dimmed');

// --- select all + Delete: the content goes, the skeleton stays
await p.click(ed);
await p.keyboard.press('Control+A');
await p.keyboard.press('Delete');
let s = await code();
check(skeletonOk(s) && !bodyOf(s).trim() && !headOf(s).trim(), 'select all + Delete empties <head> and <body> but keeps the skeleton:\n' + s);
check(/<html>/.test(s) && /<body>/.test(s), 'and the tags’ attributes it took in (the example’s lang and classes) go too');

// --- typing in a tag's name does nothing; Backspace at the start of <body> does nothing
await cursorAfter('<htm');
await p.keyboard.type('x');
await p.keyboard.press('Backspace');
s = await code();
check(skeletonOk(s) && s.includes('<html>'), 'typing inside the name <html and Backspace there change nothing');
await cursorAfter('<body>');
for (let i = 0; i < 3; i++) await p.keyboard.press('Backspace');
s = await code();
check(skeletonOk(s) && /<body>/.test(s), 'Backspace right after <body> doesn’t eat into it');

// --- typing inside <body> works, and shows on the page
await cursorAfter('<body>');
await p.keyboard.press('Enter');
await p.keyboard.type('<p class="text-sky-7">hello</p>', { delay: 5 });
await p.waitForTimeout(900);
s = await code();
check(skeletonOk(s) && bodyOf(s).includes('<p class="text-sky-7">hello</p>'), 'typing inside <body> goes into the body');
const shownText = await inCanvas(() => document.querySelector('p.text-sky-7')?.textContent);
check(shownText === 'hello', 'and the page shows it (' + JSON.stringify(shownText) + ')');

// --- select all + typing: the text lands in <body>, the skeleton stays
await p.click(ed);
await p.keyboard.press('Control+A');
await p.keyboard.insertText('<h2>replaced</h2>');
await p.waitForTimeout(900);
s = await code();
check(skeletonOk(s) && bodyOf(s).includes('<h2>replaced</h2>') && !bodyOf(s).includes('hello'), 'select all + typing replaces the content, inside <body>');
check((await inCanvas(() => document.querySelector('h2')?.textContent)) === 'replaced', 'and the page shows it');

// --- a selection across </head> <body>: only the parts inside them go
await cursorAfter('<head>');
await p.keyboard.type('<title>T</title>', { delay: 5 });
await p.waitForTimeout(300);
await cursorAfter('<title>T');
await p.keyboard.down('Shift');
for (let i = 0; i < 30; i++) await p.keyboard.press('ArrowRight');
await p.keyboard.up('Shift');
await p.keyboard.press('Delete');
s = await code();
check(skeletonOk(s), 'deleting a selection that crosses </head> and <body> keeps both tags');

// --- the head is the page's head: a <style> in it applies
await p.click(ed);
await p.keyboard.press('Control+A');
await p.keyboard.press('Delete');
await cursorAfter('<head>');
await p.keyboard.insertText('<style>.mine{color:rgb(1, 2, 3)}</style>');
await cursorAfter('<body>');
await p.keyboard.insertText('<p class="mine">styled</p>');
await p.waitForTimeout(1200);
const styled = await inCanvas(() => ({ color: getComputedStyle(document.querySelector('.mine')).color, inHead: !!document.head.querySelector('style:not(#kb-css)') }));
check(styled?.color === 'rgb(1, 2, 3)' && styled.inHead, 'a <style> in <head> is in the page’s head and applies ' + JSON.stringify(styled));
const editedStyle = async () => {
  await cursorAfter('color:rgb(1, 2, 3');
  for (let i = 0; i < 1; i++) await p.keyboard.press('Backspace');
  await p.keyboard.type('9');
  await p.waitForTimeout(1200);
  return inCanvas(() => getComputedStyle(document.querySelector('.mine')).color);
};
check((await editedStyle()) === 'rgb(1, 2, 9)', 'changing the head’s <style> updates the page (no Run needed)');

// --- Undo
await p.click(ed);
await p.keyboard.press('Control+z');
await p.waitForTimeout(300);
check(skeletonOk(await code()), 'Undo keeps a whole document');

// --- the tags' attributes are the reader's: <html lang="kh" class="scroll-smooth">, <body class=…>
// (from Clear all's document: <html lang="en">, a bare <body>; the example's own tags have classes)
await p.click('section[aria-label="Code"] button[aria-label="Clear all"]');
await p.waitForTimeout(600);
await p.keyboard.insertText('<p id="tall" class="h-[3000px]">tall</p>');
await p.waitForTimeout(600);
await cursorAfter('<html lang="');
await p.keyboard.press('Delete');
await p.keyboard.press('Delete');
await p.keyboard.type('kh');
await cursorAfter('<html lang="kh"');
await p.keyboard.type(' class="scroll-smooth"', { delay: 10 });
await cursorAfter('<body');
await p.keyboard.type(' class="bg-amber-1"', { delay: 10 });
await p.waitForTimeout(1500);
s = await code();
check(skeletonOk(s) && s.includes('<html lang="kh" class="scroll-smooth">') && s.includes('<body class="bg-amber-1">'), 'attributes can be written in <html> and <body>: ' + /<html[^>]*>/.exec(s)?.[0] + ' ' + /<body[^>]*>/.exec(s)?.[0]);
const tags = await inCanvas(() => ({
  lang: document.documentElement.lang,
  cls: document.documentElement.className,
  smooth: getComputedStyle(document.documentElement).scrollBehavior,
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));
check(tags?.lang === 'kh' && tags.cls.split(' ').includes('scroll-smooth') && tags.smooth === 'smooth' && tags.bodyBg !== 'rgba(0, 0, 0, 0)', 'the page gets them, and their classes their CSS ' + JSON.stringify(tags));
const lints = await p.$$eval('.cm-editor:visible .cm-lintRange-warning', (els) => els.map((e) => e.textContent));
check(lints.length === 0, 'Kbach classes on <html> and <body> are known classes (' + lints.join(', ') + ')');
// dark mode keeps them
await p.click('button[aria-label="Preview in dark mode"]');
await p.waitForTimeout(1200);
const darkCls = await inCanvas(() => document.documentElement.className.split(' '));
check(darkCls?.includes('dark') && darkCls.includes('scroll-smooth'), 'the dark preview adds dark beside them (' + darkCls?.join(' ') + ')');
await p.click('button[aria-label="Preview in light mode"]');
// the tag itself stays: its name, the space after it, its brackets
await cursorAfter('<htm');
await p.keyboard.type('x');
await cursorAfter('<html');
await p.keyboard.press('Delete');
await cursorAfter('<body class="bg-amber-1"');
await p.keyboard.press('Delete');
s = await code();
check(skeletonOk(s) && s.includes('<html lang="kh" class="scroll-smooth">') && s.includes('<body class="bg-amber-1">'), 'the tag’s name, the space after it and its > can’t be changed');
await cursorAfter('<head');
await p.keyboard.type('data-x="1"', { delay: 10 });
s = await code();
check(s.includes('<head data-x="1">'), 'typing straight after <head adds the space: an attribute, not a longer tag name');
// selecting a whole start tag and deleting it: only its attributes go
await cursorAfter('<body');
await p.keyboard.press('Home');
await p.keyboard.press('Shift+End');
await p.keyboard.press('Delete');
s = await code();
check(skeletonOk(s) && /\n\s*<body>\n/.test(s), 'deleting the whole <body …> line leaves <body> (' + JSON.stringify(/[^\n]*\n[^\n]*<body[^\n]*\n[^\n]*/.exec(s)?.[0]) + ')');

// --- Clear all: empties index.html and the script, resets kbach.config.js, Undo brings them back
await p.click('button[aria-label="Back"]').catch(() => {});
await p.goto(URL, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const clear = 'section[aria-label="Code"] button[aria-label="Clear all"]';
check(!(await p.$eval(clear, (b) => b.disabled)), 'Clear all is in the editor’s bar, ready with code there');
await p.click(clear);
await p.waitForTimeout(800);
s = await code();
const scriptAfter = await p.evaluate(() => localStorage.getItem('kbach-playground-script'));
// (an empty body, but for the tag that loads script.js: a plain page loads its script, 2026-11-27)
const scriptTag = '<script type="module" src="script.js"></script>';
check(skeletonOk(s) && bodyOf(s).includes(scriptTag) && !bodyOf(s).replace(scriptTag, '').trim() && /<title>/.test(headOf(s)), 'Clear all leaves the skeleton (with its meta tags and title) and an empty body, but for the tag that loads script.js');
check(scriptAfter === '' && (await inCanvas(() => document.body.children.length)) === 0, 'it empties the script too, and the page');
// kbach.config.js goes back to the default too (2026-11-27: the example's brand colors and keyframes stayed behind)
// kbach.config.js goes back to the default too (2026-11-27: the example's brand colors and keyframes
// stayed behind), and the page still loads it and the CDN script
const configAfter = (await p.evaluate(() => localStorage.getItem('kbach-playground-config'))) ?? '';
const codeAfter = (await p.evaluate(() => localStorage.getItem('kbach-playground-code'))) ?? '';
check(/window\.kbachConfig = \{/.test(configAfter) && !/amber-6/.test(configAfter) && /REPLACES a whole section of the defaults/.test(configAfter) && codeAfter.includes('<script src="kbach.config.js"></script>') && codeAfter.includes('cdn.jsdelivr.net/npm/@kbach/browser'), 'and puts kbach.config.js back to the default (no example colors left), the page still loading it and the CDN script');
check(await p.$eval(clear, (b) => b.disabled), 'with nothing left, Clear all is greyed out');
await p.keyboard.type('<p>typed</p>');
await p.waitForTimeout(600);
check(bodyOf(await code())?.includes('<p>typed</p>'), 'the cursor is left in the empty body: typing goes there');
const undo = p.locator('[role="status"] button:has-text("Undo")');
await p.click(clear);
await p.waitForTimeout(300);
await undo.click();
await p.waitForTimeout(900);
check(bodyOf(await code())?.includes('<p>typed</p>'), 'Clear all’s Undo brings the code back');

// --- an older link (just the body's markup) opens in a whole document
await p.goto(URL + '#code=' + Buffer.from('<p class="p-4">old link</p>').toString('base64url'), { waitUntil: 'networkidle' });
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.click(ed);
await p.keyboard.press('End');
await p.keyboard.type(' ');
await p.keyboard.press('Backspace');
s = await code();
check(skeletonOk(s) && bodyOf(s).includes('<p class="p-4">old link</p>'), 'a link from before (no skeleton) opens with its markup in <body>');
check((await inCanvas(() => document.querySelector('p')?.textContent)) === 'old link', 'and the page shows it');

// --- regression: a document with a comment between </head> and <body> opened as a document
// inside another one's <body>; it's rebuilt around its own head and body instead
const odd = '<!doctype html>\n<html lang="kh">\n  <head><title>Odd</title></head>\n  <!-- a note -->\n  <body class="p-4">\n    <p>odd one</p>\n  </body>\n</html>\n';
await p.goto(URL + '#code=' + Buffer.from(odd).toString('base64url'), { waitUntil: 'networkidle' });
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.click(ed);
await cursorAfter('odd one');
await p.keyboard.type('!');
s = await code();
check(skeletonOk(s) && (s.match(/<html\b/gi) || []).length === 1 && s.includes('<html lang="kh">') && s.includes('<body class="p-4">') && /<body[^>]*>\s*<!-- a note -->/.test(s), 'a document with a comment before <body> stays one document (the comment moves into the body):\n' + s);

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
