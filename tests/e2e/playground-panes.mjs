// The playground's Layout menu (where the code and the preview go), the
// Auto-run switch's wording, and the rotate button's icon.
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
await p.waitForTimeout(1000);

const box = (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
/** where the code is, next to the preview */
const where = async () => {
  const c = await box('section[aria-label="Code"]');
  const o = await box('section[aria-label="Output"]');
  if (Math.abs(c.y - o.y) < 2) return c.x < o.x ? 'left' : 'right';
  if (Math.abs(c.x - o.x) < 2) return c.y < o.y ? 'top' : 'bottom';
  return 'overlapping ' + JSON.stringify({ c, o });
};
const pick = async (label) => {
  await p.click('button[aria-label="Layout"]');
  await p.click('[role="menu"][aria-label="Layout"] [role="menuitemradio"]:has-text("' + label + '")');
  await p.waitForTimeout(300);
};
const separatorTo = async (dx, dy) => {
  const h = await box('[role="separator"]');
  await p.mouse.move(h.x + h.w / 2, h.y + h.h / 2);
  await p.mouse.down();
  await p.mouse.move(h.x + h.w / 2 + dx, h.y + h.h / 2 + dy, { steps: 6 });
  await p.mouse.up();
  await p.waitForTimeout(200);
};

// --- the default: the code on the left
check((await where()) === 'left', 'by default the code is on the left of the preview');
await p.click('button[aria-label="Layout"]');
const items = await p.$$eval('[role="menu"][aria-label="Layout"] [role="menuitemradio"]', (els) => els.map((e) => ({ text: e.textContent.trim(), on: e.getAttribute('aria-checked') === 'true' })));
check(items.length === 4 && items[0].on && items.filter((i) => i.on).length === 1, 'the Layout menu has four layouts, the current one checked: ' + items.map((i) => (i.on ? '✓ ' : '') + i.text).join(' / '));
await p.keyboard.press('Escape');
check(!(await p.$('[role="menu"][aria-label="Layout"]')), 'Esc closes it');

// --- each layout puts the panes where it says
for (const [label, want] of [['Preview left', 'right'], ['Code on top', 'top'], ['Preview on top', 'bottom'], ['Code left', 'left']]) {
  await pick(label);
  check((await where()) === want, '"' + label + '…": the code goes ' + want + ' (' + (await where()) + ')');
}

// --- the code on the right: dragging the bar left makes the code wider
await pick('Preview left');
const before = (await box('section[aria-label="Code"]')).w;
await separatorTo(-120, 0);
const after = (await box('section[aria-label="Code"]')).w;
check(after > before + 60, 'code on the right: dragging the bar left widens the code (' + Math.round(before) + ' → ' + Math.round(after) + ')');

// --- remembered on the next visit
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(800);
check((await where()) === 'right', 'the layout is remembered on the next visit');

// --- a narrow window: side by side isn't offered, a side-by-side choice shows stacked
await p.setViewportSize({ width: 700, height: 900 });
await p.waitForTimeout(400);
check((await where()) === 'bottom', 'narrow: code on the right shows as code below (' + (await where()) + ')');
await p.click('button[aria-label="Layout"]');
const narrow = await p.$$eval('[role="menu"][aria-label="Layout"] [role="menuitemradio"]', (els) => els.map((e) => e.disabled));
check(narrow.join() === 'true,true,false,false', 'narrow: the two side-by-side layouts are disabled (' + narrow + ')');
check(!!(await p.$('[role="menu"][aria-label="Layout"] p:has-text("wider window")')), 'and the menu says why');
await p.keyboard.press('Escape');
await p.setViewportSize({ width: 1440, height: 900 });
await p.waitForTimeout(400);
check((await where()) === 'right', 'wide again: back to the code on the right');
await pick('Code left');

// --- Auto-run says what it does
const sw = await p.$('[role="switch"]');
const swText = (await sw.textContent()).trim();
const swTitle = await sw.getAttribute('title');
check(swText === 'Auto-run' && /updates as you type/.test(swTitle) && /Run \(Ctrl\+Enter\)/.test(swTitle), 'the switch is labelled Auto-run and its tooltip explains it: ' + swTitle);
await sw.click();
await p.waitForTimeout(150);
const note = await p.$$eval('[role="status"]', (els) => els.map((e) => e.textContent).join(' | '));
check(/Auto-run off/.test(note), 'turning it off says what changes: ' + note);
await sw.click();

// --- rotate: a device turning, not the refresh arrows
await p.click('button[aria-label="Phone"]');
const icon = await p.$eval('button[aria-label="Rotate to landscape"] svg', (s) => ({ rects: s.querySelectorAll('rect').length, paths: s.querySelectorAll('path').length }));
check(icon.rects === 1, 'the rotate button shows a phone with a turning arrow ' + JSON.stringify(icon));
await p.click('button[aria-label="Rotate to landscape"]');
await p.waitForTimeout(600);
const frame = await box('iframe[title="Playground canvas"]');
check(frame.w > frame.h, 'and it turns the phone to landscape (' + Math.round(frame.w) + '×' + Math.round(frame.h) + ')');
await p.click('button[aria-label="Fill"]');

// --- a phone: one pane at a time (the Code / Preview bar), so no layouts at all, in the header or ⋯
await p.setViewportSize({ width: 320, height: 760 });
await p.waitForTimeout(400);
check(!(await p.isVisible('button[aria-label="Layout"]')), 'phone: no Layout button in the header');
const nameShown = await p.$eval('button[aria-haspopup="dialog"] .truncate.font-semibold', (n) => n.clientWidth >= 40);
check(nameShown, 'phone: the example name still shows beside Run, ⋯ and Share');
await p.click('button[aria-label="More"]');
const phoneItems = await p.$$eval('[role="menu"][aria-label="More"] [role="menuitemradio"]', (els) => els.filter((e) => e.offsetParent).map((e) => e.textContent.trim()));
check(phoneItems.length === 2 && /HTML/.test(phoneItems[0]) && /React/.test(phoneItems[1]), 'phone: ⋯ has HTML / React, and no layouts: ' + phoneItems.join(' / '));
await p.keyboard.press('Escape');
check((await p.isVisible('nav[aria-label="Playground view"]')) && !(await p.isVisible('[role="separator"]')), 'phone: the Code / Preview bar instead of a splitter');
await p.setViewportSize({ width: 1440, height: 900 });
await p.waitForTimeout(400);
check(!(await p.isVisible('[role="menu"][aria-label="More"] [role="menuitemradio"]')), 'wide: the layouts are not under ⋯ (the Layout button has them)');
await pick('Code left');

await p.screenshot({ path: 'shots/playground-panes.png' });
check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
