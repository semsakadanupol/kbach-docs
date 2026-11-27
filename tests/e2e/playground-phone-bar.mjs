// The playground on phones and up (phone layout added 2026-11-26): below 640px it shows the code
// or the preview, one at a time, switched by the bar at the bottom, with a row of the keys a phone
// keyboard hides; nothing scrolls sideways, every header button fits, and the ⋯ menu fits on screen.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failures++; };
const b = await chromium.launch();
const header = () => document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling;
for (const [w, h] of [[320, 700], [360, 740], [390, 844], [768, 1024], [1440, 900]]) {
  const phone = w < 640;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: phone, isMobile: phone });
  const p = await ctx.newPage();
  await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
  await p.waitForSelector('.cm-content', { state: 'attached' });
  await p.waitForTimeout(800);
  const shown = (label) => p.isVisible('section[aria-label="' + label + '"]');
  const nav = await p.$('nav[aria-label="Playground view"]');
  if (phone) {
    check(!!nav && (await shown('Output')) && !(await shown('Code')), w + 'px: opens on the preview alone, with the Code / Preview bar');
    await p.click('nav[aria-label="Playground view"] button:has-text("Code")');
    await p.waitForTimeout(300);
    check((await shown('Code')) && !(await shown('Output')), w + 'px: Code shows the editor alone');
  } else {
    check(!nav && (await shown('Code')) && (await shown('Output')), w + 'px: the code and the preview side by side or stacked, no phone bar');
  }
  for (const tab of ['html', 'script']) {
    await p.click('[role="tablist"][aria-label="Files"] [role="tab"] >> nth=' + (tab === 'html' ? 0 : 1));
    await p.waitForTimeout(200);
    const r = await p.evaluate((h) => {
      const header = new Function('return (' + h + ')()')();
      const vw = document.documentElement.clientWidth;
      const right = (x) => Math.round(x.getBoundingClientRect().right);
      const buttons = [...header.querySelectorAll('button')].filter((x) => x.offsetParent && !x.closest('[role=menu]'));
      const boxes = buttons.map((x) => x.getBoundingClientRect());
      const overlap = boxes.some((a, i) => boxes.some((c, j) => j > i && a.left < c.right - 0.5 && c.left < a.right - 0.5 && !(a.left >= c.left && a.right <= c.right) && !(c.left >= a.left && c.right <= a.right)));
      const name = header.querySelector('button[aria-haspopup="dialog"] .truncate.font-semibold');
      return { vw, scrollW: document.documentElement.scrollWidth, maxButton: Math.max(...buttons.map(right)), overlap, nameShown: name.clientWidth >= 40 };
    }, header.toString());
    check(r.scrollW <= r.vw && r.maxButton <= r.vw && !r.overlap && r.nameShown, w + 'px, ' + tab + ' tab: no sideways scroll, every header button on screen and apart, the example name readable (' + JSON.stringify(r) + ')');
  }
  if (phone) {
    // the key row types into the editor, and keeps the keyboard's focus there
    await p.click('[role="tablist"][aria-label="Files"] [role="tab"] >> nth=0');
    // (at the end of the <meta charset> line, near the top and short enough not to wrap: the
    // doctype and the skeleton's tags can't be typed into, and <body> is below the head's CDN
    // setup, out of view on a phone)
    const line = '.cm-editor:visible .cm-line:has-text("<meta charset")';
    await p.click(line);
    await p.keyboard.press('End');
    const before = await p.$eval(line, (l) => l.textContent);
    await p.click('[role="toolbar"][aria-label="Keys"] button[aria-label="Type <"]');
    await p.click('[role="toolbar"][aria-label="Keys"] button[aria-label="Type /"]');
    const after = await p.$eval(line, (l) => l.textContent);
    const focused = await p.evaluate(() => !!document.activeElement?.closest('.cm-editor'));
    check(after === before + '</' && focused, w + 'px: the key row types < and / at the cursor, and the editor keeps focus (' + JSON.stringify(after) + ')');
    const keys = await p.$eval('[role="toolbar"][aria-label="Keys"]', (t) => ({ right: Math.round(t.getBoundingClientRect().right), vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }));
    check(keys.right <= keys.vw && keys.sw <= keys.vw, w + 'px: the key row scrolls inside itself, not the page');
    await p.click('nav[aria-label="Playground view"] button:has-text("Preview")');
    await p.waitForTimeout(300);
    check((await shown('Output')) && !(await p.isVisible('[role="toolbar"][aria-label="Keys"]')), w + 'px: Preview brings the page back and hides the keys');
  }
  await p.click('button[aria-label="More"]');
  await p.waitForTimeout(250);
  const menu = await p.$eval('[role="menu"][aria-label="More"]', (m) => {
    const r = m.getBoundingClientRect();
    const items = [...m.querySelectorAll('[role^="menuitem"]')].filter((e) => e.offsetParent).map((e) => e.textContent.trim());
    return { left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), vw: document.documentElement.clientWidth, vh: innerHeight, items };
  });
  check(menu.left >= 0 && menu.right <= menu.vw && menu.bottom <= menu.vh, w + 'px: the open ⋯ menu fits on screen (' + JSON.stringify({ ...menu, items: undefined }) + ')');
  // below 40rem the HTML/React switch moves from the header into ⋯ (the header's width: the
  // window less the playground's padding, p-2 / md:p-3); Auto-run and Reload are the preview
  // bar's at every width, on its first row, all of it on screen
  const room = (w - (w >= 768 ? 24 : 16)) / 16;
  const modeInMenu = menu.items.some((t) => /React app/.test(t));
  const modeInHeader = await p.isVisible('[role="group"][aria-label="Kind of page"] >> nth=0');
  await p.keyboard.press('Escape');
  const run = await p.evaluate(() => {
    const bar = document.querySelector('section[aria-label="Output"]').firstElementChild;
    const box = (el) => el && el.getBoundingClientRect();
    const sw = box(bar.querySelector('[role="switch"]'));
    const reload = box(bar.querySelector('button[aria-label="Reload"]'));
    const view = box(bar.querySelector('[role="group"][aria-label="View"]'));
    return { inBar: !!sw && !!reload, firstRow: !!sw && Math.abs(sw.top + sw.height / 2 - (view.top + view.height / 2)) < 4, onScreen: !!reload && reload.right <= document.documentElement.clientWidth };
  });
  check(modeInMenu === room < 40 && modeInHeader === room >= 40 && run.inBar && run.firstRow && run.onScreen && !menu.items.some((t) => /Auto-run/.test(t)), w + 'px: HTML/React ' + (room < 40 ? 'under ⋯' : 'in the header') + ', Auto-run and Reload on the preview bar’s first row ' + JSON.stringify(run) + ' (' + menu.items.join(' / ') + ')');
  if (w === 390) await p.screenshot({ path: 'shots/phone-bar.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  await ctx.close();
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
