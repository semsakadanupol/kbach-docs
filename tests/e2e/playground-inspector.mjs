// The inspector's state through realistic flows: nothing stale, nothing lost, nothing reordered.
import { chromium } from 'playwright';
import { cursorAfter, openExample } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const toOutput = () => p.$eval('section[aria-label="Output"]', (el) => el.scrollIntoView({ block: 'end' }));
await toOutput();
const f = () => p.frames().find((x) => x !== p.mainFrame() && x.url() === 'about:srcdoc');
const inCanvas = async (fn, arg) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await f().evaluate(fn, arg);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
const overlay = () =>
  inCanvas(() => {
    const r = document.querySelector('kb-inspector').shadowRoot;
    const vis = (s) => r.querySelector(s).style.display === 'block';
    return { hover: vis('.c') || vis('.m') || vis('.bd'), label: vis('.l'), selected: vis('.sel'), lit: vis('.hl') };
  });
const at = async (sel) => {
  const r = await inCanvas((s) => {
    const e = document.querySelector(s).getBoundingClientRect();
    return { x: e.left + Math.min(20, e.width / 2), y: e.top + Math.min(10, e.height / 2) };
  }, sel);
  const fb = await (await p.$('iframe[title="Playground canvas"]')).boundingBox();
  return { x: fb.x + r.x, y: fb.y + r.y };
};
// look now, don't wait: a locator would wait (up to 30s) for a panel that isn't there
const panelText = async () => { const el = await p.$('aside[aria-label="Inspector"]'); return el ? el.textContent() : null; };
const classOrder = () => p.$$eval('aside[aria-label="Inspector"] li input[type="checkbox"]', (ins) => ins.map((i) => i.getAttribute('aria-label').replace(/^Turn (off|on) /, '').replace(/ \(.*$/, '') + (i.checked ? '' : ':off')));
const inspect = 'button[aria-label="Inspect"]';
const toggleInspect = async () => {
  await p.click(inspect);
  const on = (await p.getAttribute(inspect, 'aria-pressed')) === 'true';
  for (let i = 0; i < 50; i++) {
    if ((await inCanvas(() => document.documentElement.style.cursor === 'crosshair')) === on) return;
    await p.waitForTimeout(20);
  }
};
const setFiles = async (htmlCode, scriptCode) => {
  await p.click('button[role="tab"]:has-text("script")');
  await p.fill('.cm-editor:visible .cm-content', scriptCode);
  await p.click('button[role="tab"]:has-text("index.html")');
  await p.fill('.cm-editor:visible .cm-content', htmlCode);
  await p.waitForTimeout(1200);
};

// --- no stray boxes ---
await toggleInspect();
await p.waitForTimeout(250);
check(!(await overlay()).lit, 'turning Inspect on draws nothing until you point at something (no dashed box around the page)');
let pt = await at('h1');
await p.mouse.move(pt.x, pt.y);
await p.waitForTimeout(150);
check((await overlay()).hover && (await overlay()).label, 'hovering draws the box model and label');
await p.mouse.move(5, 500);
await p.waitForTimeout(150);
check(!(await overlay()).hover && !(await overlay()).label, 'leaving the preview clears them');
await p.mouse.click(pt.x, pt.y);
await p.waitForTimeout(400);
check((await overlay()).selected && (await panelText()) !== null, 'clicking selects: outline and panel');
await p.click('aside[aria-label="Inspector"] button[aria-label="Close the inspector"]');
await p.waitForTimeout(200);
check(!(await overlay()).selected, 'closing the panel clears the outline (it used to stay)');
await p.mouse.move(pt.x, pt.y);
await p.waitForTimeout(150);
await toggleInspect(); // off, with the mouse still over the page
await p.waitForTimeout(200);
const offState = await overlay();
check(!offState.hover && !offState.label && !offState.selected && !offState.lit, 'turning Inspect off clears every box (' + JSON.stringify(offState) + ')');

// --- class order, and switches that survive edits (HTML only: the page updates live) ---
await setFiles('<section class="p-6">\n  <h2 class="mt-2 text-2xl font-bold text-sky-7 underline">Title</h2>\n  <p class="text-gray-8">Body</p>\n</section>', '');
await toOutput();
await toggleInspect();
pt = await at('h2');
await p.mouse.click(pt.x, pt.y);
await p.waitForTimeout(400);
const o1 = await classOrder();
await p.locator('aside[aria-label="Inspector"] input[aria-label^="Turn off text-2xl"]').click();
await p.waitForTimeout(300);
const o2 = await classOrder();
check(o1.join() === 'mt-2,text-2xl,font-bold,text-sky-7,underline' && o2.join() === 'mt-2,text-2xl:off,font-bold,text-sky-7,underline', 'a switched-off class keeps its place in the list (' + o2.join(' ') + ')');
await p.locator('aside[aria-label="Inspector"] input[aria-label^="Turn on text-2xl"]').click();
await p.waitForTimeout(300);
check((await inCanvas(() => document.querySelector('h2').getAttribute('class'))) === 'mt-2 text-2xl font-bold text-sky-7 underline', 'switching it back on puts it back where it was in the element');
await p.locator('aside[aria-label="Inspector"] input[aria-label^="Turn off underline"]').click();
await p.waitForTimeout(300);
// edit the code somewhere else: the live update rewrites classes from the code
await p.click('.cm-editor:visible .cm-content');
await cursorAfter(p, '</section>');
await p.keyboard.type('\n<p class="text-sm">More</p>', { delay: 10 });
await p.waitForTimeout(900);
check((await inCanvas(() => document.querySelectorAll('p.text-sm').length)) === 1, 'the edit after </section> is in the page');
const afterEdit = await inCanvas(() => document.querySelector('h2').classList.contains('underline'));
const o3 = await classOrder();
check(!afterEdit && o3.includes('underline:off'), 'after a code edit, the switched-off class stays off in the preview and the panel (' + o3.join(' ') + ')');
// add a class through the panel: it goes into the code; the switch stays
await p.locator('aside[aria-label="Inspector"] input[aria-label="Add a class to this element in the code"]').fill('tracking-tight');
await p.keyboard.press('Enter');
await p.waitForTimeout(900);
const o4 = await classOrder();
check(o4.join() === 'mt-2,text-2xl,font-bold,text-sky-7,underline:off,tracking-tight', 'adding a class appends it, and the switch stays off (' + o4.join(' ') + ')');
// the code cursor lights its element only while you're in the code
await p.click('.cm-editor:visible .cm-content');
// (in the <section>: the picked <h2> has its outline, not the highlight)
await cursorAfter(p, '<section');
await p.waitForTimeout(300);
const cursorAt = await p.locator('text=/Ln \\d+, Col \\d+/').first().textContent();
check((await overlay()).lit, 'with the cursor in the code, its element lights up (' + cursorAt + ')');
await p.click('aside[aria-label="Inspector"] h3 >> nth=0'); // somewhere outside the editor
await p.waitForTimeout(300);
check(!(await overlay()).lit, 'and stops once you leave the code');

// --- the script removes the picked element ---
await openExample(p, 'http://localhost:5176', 'toasts');
await p.waitForTimeout(700);
await toOutput();
if ((await p.getAttribute(inspect, 'aria-pressed')) !== 'true') await toggleInspect();
pt = await at('#toasts li');
await p.mouse.click(pt.x, pt.y);
await p.waitForTimeout(400);
check((await panelText()) !== null, 'a toast can be picked');
// the toast leaves about 4s after it appeared: wait for the panel to close, then look at once
await p.waitForFunction(() => !document.querySelector('aside[aria-label="Inspector"]'), null, { timeout: 7000 }).catch(() => {});
check((await panelText()) === null && (await p.locator('text=The element you picked left the page').isVisible()), 'when the script removes it, the panel closes and says why');
check(!(await overlay()).selected, 'and no outline is left behind');

// --- a re-run (script pages reload): the pick is found again ---
await openExample(p, 'http://localhost:5176', '1-landing');
await p.waitForTimeout(700);
await toOutput();
if ((await p.getAttribute(inspect, 'aria-pressed')) !== 'true') await toggleInspect();
pt = await at('h1');
await p.mouse.click(pt.x, pt.y);
await p.waitForTimeout(400);
await p.click('button[aria-label="Run again"]');
await p.waitForTimeout(1200);
check((await panelText())?.includes('<h1>') && (await overlay()).selected, 'after Run again, the same element is still picked and outlined');

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
