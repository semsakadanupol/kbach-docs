// The playground's one example (its label, the edited dot, Reset), wrap toggle and right-edge gap, in real Chromium.
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
await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(800);
const firstLine = () => p.$eval('.cm-line', (l) => l.textContent);
const canvasStart = () => p.evaluate(() => document.querySelector('iframe[title="Playground canvas"]').contentDocument.body.innerHTML.trim().slice(0, 40));
// the header label: the playground has one example, the landing page
const label = () => p.$eval('section[aria-label="Code"]', () => document.querySelector('.truncate.font-semibold').closest('div').textContent.trim());
const edited = () => p.$('[aria-label="(edited)"]');

// 1. it names the one example, with no menu to pick another
check((await label()) === 'Playground', 'the header names the playground: ' + (await label()));
check(!(await p.$('button[aria-haspopup="menu"]:not([aria-label="More"]):not([aria-label="Layout"])')), 'there is no examples menu');

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
await p.waitForSelector('.cm-content');
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
