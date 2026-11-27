// The playground's examples gallery (the header's example name, the gallery and its pictures,
// tags, picking one, Blank page), every example opening clean (no unknown class, no console
// error), the edited dot and Reset, the wrap toggle and the right-edge gap, in real Chromium.
import { existsSync, readFileSync } from 'fs';
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message)); // the canvas runs the reader's code: its errors are theirs
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content >> visible=true');
await p.waitForTimeout(800);
const firstLine = () => p.$eval('.cm-line', (l) => l.textContent);
const canvasStart = () => p.evaluate(() => document.querySelector('iframe[title="Playground canvas"]').contentDocument.body.innerHTML.trim().slice(0, 40));
// the header's example name (the gallery button)
const label = () => p.$eval('button[aria-haspopup="dialog"] .truncate.font-semibold', (e) => e.textContent.trim());
const edited = () => p.$('[aria-label="(edited)"]');

// 1. the header names the example; the gallery lists every one, with its pictures
const ids = [...readFileSync(new URL('../../src/playground/examples.ts', import.meta.url), 'utf-8').matchAll(/\bid: '([\w-]+)'/g)].map((m) => m[1]);
check((await label()) === 'Landing page', 'the header names the example the page starts from: ' + (await label()));
const missing = ids.filter((id) => !existsSync(new URL('../../public/playground/' + id + '.jpg', import.meta.url)) || !existsSync(new URL('../../public/playground/' + id + '-dark.jpg', import.meta.url)));
check(ids.length >= 10 && missing.length === 0, ids.length + ' examples, each with a light and a dark picture (scripts/example-thumbnails.mjs)' + (missing.length ? ', missing: ' + missing : ''));
await p.click('button[aria-haspopup="dialog"]');
await p.waitForSelector('[role="dialog"][aria-label="Examples"]');
await p.waitForTimeout(600);
const cards = await p.$$eval('[role="dialog"] ul li button:not(:has-text("Blank page"))', (bs) => bs.map((b) => b.textContent));
const pictures = await p.$$eval('[role="dialog"] img', (imgs) => imgs.filter((i) => i.offsetParent).map((i) => i.complete && i.naturalWidth > 0));
check(cards.length === ids.length && pictures.length === ids.length && pictures.every(Boolean), 'the gallery lists every example with its picture loaded (' + cards.length + ' cards, ' + pictures.filter(Boolean).length + ' pictures)');
check(!!(await p.$('[role="dialog"] button[aria-current="true"]:has-text("Open now")')), 'the open example is marked "Open now"');
// every card says what it shows, and they're all one height (the hint is two lines at most)
const sizes = await p.$$eval('[role="dialog"] ul li button:not(:has-text("Blank page"))', (bs) => bs.map((b) => ({ h: Math.round(b.getBoundingClientRect().height), hint: b.querySelector('.line-clamp-2')?.textContent.trim() ?? '' })));
const heights = sizes.map((x) => x.h);
check(sizes.every((x) => x.hint) && Math.max(...heights) - Math.min(...heights) <= 1, 'every card has a description, and every card is the same height (' + [...new Set(heights)].join(', ') + 'px)');
await p.click('[role="dialog"] button[aria-pressed]:has-text("Dark mode")');
const darkOnes = await p.$$eval('[role="dialog"] ul li button:not(:has-text("Blank page"))', (bs) => bs.length);
check(darkOnes > 0 && darkOnes < ids.length, 'a tag narrows the list (Dark mode: ' + darkOnes + ')');
// and the cards keep their height, however few are left (regression: with one row, the rows
// shared out the dialog's height, and the cards stretched to fill it)
await p.click('[role="dialog"] button[aria-pressed]:has-text("TypeScript")');
await p.waitForTimeout(300);
const oneLeft = await p.$$eval('[role="dialog"] ul li button:not(:has-text("Blank page"))', (bs) => bs.map((b) => Math.round(b.getBoundingClientRect().height)));
check(oneLeft.length === 1 && Math.abs(oneLeft[0] - heights[0]) <= 1, 'with one card left (TypeScript), it keeps its height (' + oneLeft[0] + 'px, all: ' + heights[0] + 'px)');
await p.click('[role="dialog"] button[aria-pressed]:has-text("All")');
await p.click('[role="dialog"] ul button:has-text("Navbar")');
await p.waitForTimeout(1200);
const canvasFrame = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
const navbar = await canvasFrame().evaluate(() => !!document.querySelector('#menu-button'));
check(!(await p.$('[role="dialog"]')) && (await label()) === 'Navbar' && navbar, 'picking Navbar closes the gallery and opens it (header: ' + (await label()) + ')');
await p.click('button[aria-haspopup="dialog"]');
await p.click('[role="dialog"] button:has-text("Blank page") >> visible=true');
await p.waitForTimeout(800);
const starterHeading = () => canvasFrame().evaluate(() => document.querySelector('h1')?.textContent.trim() ?? '');
check((await label()) === 'Your page' && (await starterHeading()) === 'Write something here', 'Blank page opens a new page with "Write something here" to type over (header: ' + (await label()) + ')');

// 1b. every example opens clean, as HTML and as React: no class the engine doesn't know,
// nothing in the console, and the two versions are the same page (heading, background)
const openClean = async (id, kind) => {
  await p.goto('about:blank');
  await p.goto('http://localhost:5176/playground?e=' + id + '-' + kind + '#example=' + id + (kind === 'react' ? '&mode=react' : ''), { waitUntil: 'networkidle' });
  await p.waitForSelector('.cm-content >> visible=true');
  await p.waitForTimeout(kind === 'react' ? 3000 : 1500);
  const problems = await p.$eval('section[aria-label="Code"] button[title$="problems"], section[aria-label="Code"] button[title="No problems"]', (e) => e.textContent.replace(/\s+/g, ''));
  const consoleErrors = await p.$eval('button:has-text("Console")', (e) => e.querySelector('.bg-red-6')?.textContent ?? '0');
  const page = await canvasFrame().evaluate(() => ({
    h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
    bg: getComputedStyle(document.body).backgroundColor,
    root: document.getElementById('root')?.children.length ?? null,
    height: document.documentElement.scrollHeight,
    // the browser's own look, where the reset should have taken it off (regression: a React
    // page's tags weren't in the reset, so its links were blue and underlined, its buttons grey)
    raw: [...document.querySelectorAll('a, button')].filter((el) => {
      const c = getComputedStyle(el);
      return (el.tagName === 'A' && c.textDecorationLine === 'underline' && !/underline/.test(el.className)) || (el.tagName === 'BUTTON' && /^rgb\((?:239, 239, 239|240, 240, 240)\)$/.test(c.backgroundColor));
    }).length,
  }));
  return { problems, consoleErrors, page };
};
for (const id of ids) {
  const html = await openClean(id, 'html');
  const react = await openClean(id, 'react');
  check(html.problems === '⚠0✕0problems' && html.consoleErrors === '0', id + ' (HTML): opens with no problems and no console errors (' + html.problems + ', ' + html.consoleErrors + ' errors)');
  check(react.problems === '⚠0✕0problems' && react.consoleErrors === '0' && react.page.root > 0, id + ' (React): React mounts it, no problems and no console errors (' + react.problems + ', ' + react.consoleErrors + ' errors)');
  const sameHeight = Math.abs(html.page.height - react.page.height) <= Math.max(8, html.page.height * 0.02);
  check(
    html.page.h1 !== '' && html.page.h1 === react.page.h1 && html.page.bg === react.page.bg && sameHeight && html.page.raw === 0 && react.page.raw === 0,
    id + ': the HTML and React versions are the same page (heading, background, height, no unstyled links or buttons) ' +
      JSON.stringify({ h1: [html.page.h1, react.page.h1], height: [html.page.height, react.page.height], raw: [html.page.raw, react.page.raw] }),
  );
}

// 1c. HTML or React: the header's switch turns the open example into its other version, App.jsx
// first; the gallery's "Open as" picks the version a card opens; a share link keeps the mode
await p.goto('about:blank');
await p.goto('http://localhost:5176/playground?mode-switch', { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content >> visible=true');
await p.waitForTimeout(1000);
const tabs = () => p.$$eval('[aria-label="Files"] [role="tab"]', (b) => b.map((x) => x.textContent.trim()).filter(Boolean));
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("React")');
await p.waitForTimeout(3500);
const reactRoot = await canvasFrame().evaluate(() => document.getElementById('root')?.children.length ?? 0);
check((await label()) === 'Landing page' && /App\.jsx/.test((await tabs())[0]) && reactRoot > 0 && !(await edited()), 'React turns the Landing page into its React version, App.jsx first, untouched (' + (await label()) + ', ' + (await tabs())[0] + ')');
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("HTML")');
await p.waitForTimeout(1500);
check((await label()) === 'Landing page' && /index\.html/.test((await tabs())[0]), 'and HTML turns it back (' + (await tabs())[0] + ')');
await p.click('button[aria-haspopup="dialog"]');
await p.waitForSelector('[role="dialog"][aria-label="Examples"]');
check((await p.$eval('[role="dialog"] [aria-label="Open as"] [aria-pressed="true"]', (b) => b.textContent)) === 'HTML', 'the gallery opens on the kind of page open now');
await p.click('[role="dialog"] [aria-label="Open as"] button:has-text("React")');
await p.click('[role="dialog"] ul button:has-text("Pricing")');
await p.waitForTimeout(3500);
check((await label()) === 'Pricing' && /App\.jsx/.test((await tabs())[0]) && (await canvasFrame().evaluate(() => document.getElementById('root')?.children.length ?? 0)) > 0, 'with Open as React, a card opens its React version (' + (await label()) + ', ' + (await tabs())[0] + ')');
// Blank page: the first card, in the kind "Open as" picks; and New blank page at the top of ⋯
await p.click('button[aria-haspopup="dialog"]');
await p.waitForSelector('[role="dialog"][aria-label="Examples"]');
const firstCard = await p.$eval('[role="dialog"] ul li button', (b) => b.textContent);
check(/Blank page/.test(firstCard) && /App\.jsx/.test(firstCard), "the gallery's first card is Blank page, here a fresh App.jsx (" + firstCard + ')');
await p.click('[role="dialog"] ul li button:has-text("Blank page")');
await p.waitForTimeout(2500);
const kindNow = await p.$eval('[role="group"][aria-label="Kind of page"] button[aria-pressed="true"]', (b) => b.textContent);
const code = () => p.$eval('.cm-editor:visible .cm-content', (c) => c.textContent);
const selected = await p.evaluate(() => getSelection().toString());
check(
  (await label()) === 'Your page' && /App\.jsx/.test((await tabs())[0]) && kindNow === 'React' && (await starterHeading()) === 'Write something here' && /className="bg-linear-to-r/.test(await code()) && selected === 'Write something here',
  'it opens the starter as React, its words selected to type over (' + (await label()) + ', ' + (await tabs())[0] + ', selected: ' + JSON.stringify(selected) + ')',
);
// a page that isn't an example is converted (2026-11-27): React → HTML is what React drew
const headingClass = () => canvasFrame().evaluate(() => document.querySelector('h1')?.className ?? '');
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("HTML")');
await p.waitForTimeout(1500);
check(
  (await label()) === 'Your page' && /index\.html/.test((await tabs())[0]) && (await starterHeading()) === 'Write something here' && /bg-clip-text/.test(await headingClass()) && /class="/.test(await code()) && !/className/.test(await code()),
  'HTML on it: index.html made from what React drew, the same classes as class="…" (' + (await tabs())[0] + ')',
);
// HTML → React: markup as JSX (style, for, value); the script's listener on #b becomes its
// onClick, the inline onclick on #c too, its `let n` moves to the top of the file, and what's
// left (document.title) runs in a useEffect
await p.fill(
  '.cm-editor:visible .cm-content',
  '<label for="n" class="text-sm">Name</label> <input id="n" value="Kbach" class="rounded border px-2" />\n<p style="margin-top: 8px; font-weight: 700">Styled</p>\n<button id="b" class="rounded-lg bg-sky-6 px-4 py-2 text-white">Count 0</button>\n<button id="c" class="rounded-lg border px-4 py-2" onclick="this.textContent = \'Clicked\'">Click me</button>',
);
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("JS")');
await p.fill('.cm-editor:visible .cm-content', "let n = 0;\nconst button = document.getElementById('b');\nbutton.addEventListener('click', (e) => {\n  e.target.textContent = 'Count ' + ++n;\n});\ndocument.title = 'Converted';");
await p.waitForTimeout(1200);
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("React")');
await p.waitForTimeout(3500);
const app = await code();
await canvasFrame().click('#b');
await canvasFrame().click('#c');
await p.waitForTimeout(300);
const made = await canvasFrame().evaluate(() => ({
  inline: document.getElementById('c')?.textContent,
  title: document.title,
  count: document.getElementById('b')?.textContent,
  input: document.getElementById('n')?.value,
  label: document.querySelector('label')?.htmlFor,
  style: getComputedStyle(document.querySelector('p')).marginTop + ' ' + getComputedStyle(document.querySelector('p')).fontWeight,
  bg: getComputedStyle(document.getElementById('b')).backgroundColor,
  root: !!document.getElementById('root')?.children.length,
}));
check(
  /App\.jsx/.test((await tabs())[0]) && /className=/.test(app) && /htmlFor="n"/.test(app) && /defaultValue="Kbach"/.test(app) && /marginTop: "8px"|marginTop: '8px'/.test(app) &&
    made.root && made.count === 'Count 1' && made.input === 'Kbach' && made.label === 'n' && made.style === '8px 700' && made.bg === 'rgb(14, 165, 233)',
  'React on an HTML page: App.jsx with className, htmlFor, defaultValue and a style object, and it works ' + JSON.stringify(made),
);
check(
  /onClick=\{/.test(app) && !/addEventListener/.test(app) && /let n = 0/.test(app) && /useEffect/.test(app) && made.title === 'Converted' && made.inline === 'Clicked' && /event\.currentTarget/.test(app),
  "the script's listener and the inline onclick become onClick props, its variable moves up, the rest runs in a useEffect (" + app.slice(0, 160) + '…)',
);
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("HTML")');
await p.waitForTimeout(1500);
const back = await canvasFrame().evaluate(() => ({ count: document.getElementById('b')?.textContent, bg: getComputedStyle(document.getElementById('b')).backgroundColor }));
check(/index\.html/.test((await tabs())[0]) && back.count === 'Count 1' && back.bg === 'rgb(14, 165, 233)', 'and HTML again: the page as React left it, same classes ' + JSON.stringify(back));
// the logic stayed in App.jsx, and script.js says so (comments only: the HTML still morphs live)
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("JS")');
await p.waitForTimeout(300);
check(/This page was made from a React app/.test(await code()) && /App\.jsx/.test(await code()), 'script.js says the logic stayed in App.jsx');
await p.click('[role="tablist"][aria-label="Files"] [role="tab"] >> nth=0');
await p.click('button[aria-label="More"]');
const firstItem = await p.$eval('[role="menu"][aria-label="More"] [role="menuitem"]', (b) => b.textContent.trim());
await p.click('[role="menu"][aria-label="More"] [role="menuitem"]:has-text("New blank page")');
await p.waitForTimeout(800);
check(firstItem === 'New blank page' && (await label()) === 'Your page' && (await starterHeading()) === 'Write something here', '⋯ starts with New blank page, and it opens the starter');
// back to React (a blank React page), for the share link below
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("React")');
await p.waitForTimeout(2500);
await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
// (Share goes to the new link: the page loads again from it)
await Promise.all([p.waitForEvent('load'), p.click('button[aria-label="Share"]')]);
await p.waitForTimeout(400);
const link = await p.evaluate(() => navigator.clipboard.readText());
check(link.includes('&mode=react'), 'a share link of a React page carries mode=react');
await p.goto('about:blank');
await p.goto(link, { waitUntil: 'networkidle' });
await p.waitForTimeout(3500);
check((await p.$eval('[role="group"][aria-label="Kind of page"] button[aria-pressed="true"]', (b) => b.textContent)) === 'React' && (await canvasFrame().evaluate(() => document.getElementById('root')?.children.length ?? 0)) > 0, 'the link opens as a React page, running');
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content >> visible=true');
await p.waitForTimeout(800);

// 2. editing marks it; ⋯ resets it to the example
await p.click('.cm-content');
await p.keyboard.press('Control+End');
await p.keyboard.type(String.fromCharCode(10) + 'my-own-line');
await p.waitForTimeout(300);
check(!!(await edited()), 'an edit shows the edited dot');
await p.click('button[aria-label="More"]');
await p.click('[role="menuitem"]:has-text("Reset")');
await p.waitForTimeout(500);
check(!(await edited()) && (await firstLine()).startsWith('<'), 'Reset in the ⋯ menu brings back the example, without the dot');

// 6. gap after the longest line
const gap = await p.evaluate(() => {
  const s = document.querySelector('.cm-scroller');
  s.scrollLeft = 99999;
  const right = s.getBoundingClientRect().right;
  let max = 0;
  for (const line of document.querySelectorAll('.cm-line')) {
    const r = document.createRange();
    r.selectNodeContents(line);
    max = Math.max(max, r.getBoundingClientRect().right);
  }
  return Math.round(right - max);
});
check(gap >= 24, 'scrolled to the end, the longest line stops ' + gap + 'px short of the edge');
await p.screenshot({ path: 'shots/gap.png', clip: { x: 300, y: 260, width: 1140, height: 380 } });

// 7. wrap: no sideways scroll, remembered after reload
const wrapBtn = 'button[aria-label="Wrap long lines"]';
await p.click(wrapBtn);
await p.waitForTimeout(300);
const sideways = await p.$eval('.cm-scroller', (s) => s.scrollWidth - s.clientWidth);
check((await p.getAttribute(wrapBtn, 'aria-pressed')) === 'true' && sideways <= 1, 'wrap on: no sideways scroll (overflow ' + sideways + 'px)');
await p.screenshot({ path: 'shots/wrap.png', clip: { x: 300, y: 260, width: 1140, height: 380 } });
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content >> visible=true');
await p.waitForTimeout(500);
check((await p.getAttribute(wrapBtn, 'aria-pressed')) === 'true' && !!(await p.$('.cm-lineWrapping')), 'wrap is remembered after a reload');
await p.click(wrapBtn);
await p.waitForTimeout(300);
check((await p.getAttribute(wrapBtn, 'aria-pressed')) === 'false' && !(await p.$('.cm-lineWrapping')), 'wrap off: long lines no longer wrap');

// 8. a chip fix doesn't jump the cursor to the top
check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
