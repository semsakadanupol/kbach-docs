// The editor's own scrollbars (VS Code style, with marks) and tooltips that never overflow.
import { chromium } from 'playwright';
import { cdnPage } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('kbach-playground-panes', 'left'); });
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1200);

const ed = '.cm-editor:visible';
const tab = (name) => p.locator('[role="tablist"][aria-label="Files"] [role="tab"]', { hasText: name });
const bars = () =>
  p.$eval(ed, (e) => {
    const s = e.querySelector('.cm-scroller');
    const v = e.querySelector('.cm-kb-vbar');
    const vt = v.querySelector('.cm-kb-thumb');
    const h = e.querySelector('.cm-kb-hbar');
    const ht = h.querySelector('.cm-kb-thumb');
    const r = (x) => x.getBoundingClientRect();
    return {
      native: s.offsetWidth - s.clientWidth,
      v: getComputedStyle(v).display,
      vTop: Math.round(r(v).top), vBottom: Math.round(r(v).bottom), vRight: Math.round(r(v).right),
      thumbTop: Math.round(r(vt).top), thumbBottom: Math.round(r(vt).bottom), thumbH: Math.round(r(vt).height),
      h: getComputedStyle(h).display,
      hLeft: Math.round(r(h).left), hthumbLeft: Math.round(r(ht).left), hthumbRight: Math.round(r(ht).right), hRight: Math.round(r(h).right),
      editorRight: Math.round(r(e).right),
      st: Math.round(s.scrollTop), sl: Math.round(s.scrollLeft),
      marks: [...v.querySelectorAll('.cm-kb-mark')].map((m) => m.style.background + (m.classList.contains('cm-kb-mark-line') ? ' line' : '')),
      fadeRight: Math.round(r(e.querySelector('.cm-kb-edge')).right),
    };
  });

// a long file, with a warning near the end
const lines = Array.from({ length: 80 }, (_, i) => `<p class="p-1">Line ${i + 1}</p>`);
lines[70] = '<p class="bg-blue-500">a warning on line 71</p>';
await p.fill(ed + ' .cm-content', lines.join('\n'));
await p.waitForTimeout(800);
await p.click(ed + ' .cm-content');
await p.keyboard.press('Control+Home');
await p.waitForTimeout(300);
let s = await bars();
check(s.native === 0 && s.v === 'block' && s.vRight === s.editorRight, 'a vertical scrollbar is drawn at the right edge (and the browser\'s own is gone)');
check(s.thumbH > 20 && s.thumbH < (s.vBottom - s.vTop) / 2 && s.thumbTop - s.vTop <= 6, 'its thumb is at the top, sized to the visible part (' + s.thumbH + 'px)');
// (the warning color is the editor's: --ed-warn, #bf8803 in light mode)
check(s.marks.some((m) => m.includes('191, 136, 3') || m.includes('--ed-warn')) && s.marks.some((m) => m.endsWith('line')), 'it marks the warning (amber) and the cursor (gold line): ' + s.marks.join(', '));
check(s.fadeRight <= s.editorRight - 14, 'the right-edge fade stays left of it');

// drag the thumb half way
const t = await p.$(ed + ' .cm-kb-vbar .cm-kb-thumb');
const tb = await t.boundingBox();
await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
await p.mouse.down();
await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2 + 150, { steps: 6 });
await p.mouse.up();
await p.waitForTimeout(200);
s = await bars();
check(s.st > 200 && Math.abs(s.thumbTop - (tb.y + 150)) <= 3, 'dragging the thumb scrolls the code with it (scrollTop ' + s.st + ', thumb at ' + s.thumbTop + ')');
// click the track below the thumb: a page down
const before = s.st;
const vb = await (await p.$(ed + ' .cm-kb-vbar')).boundingBox();
await p.mouse.click(vb.x + vb.width / 2, vb.y + vb.height - 10);
await p.waitForTimeout(600);
s = await bars();
check(s.st > before + 150, 'clicking the track below the thumb pages down (' + before + ' → ' + s.st + ')');
// wheel scrolling moves the thumb too
await p.mouse.move(vb.x - 200, vb.y + 100);
await p.mouse.wheel(0, -400);
await p.waitForTimeout(400);
const afterWheel = await bars();
check(afterWheel.st < s.st && afterWheel.thumbTop < s.thumbTop, 'scrolling with the wheel moves the thumb');

// horizontal: a long line, wrap off
await p.fill(ed + ' .cm-content', '<p class="p-4">' + 'word '.repeat(60) + '</p>\n<p>short</p>');
await p.waitForTimeout(500);
s = await bars();
check(s.h === 'block' && s.hthumbRight - s.hthumbLeft < s.hRight - s.hLeft, 'a long line gets a horizontal scrollbar under the text');
const ht = await (await p.$(ed + ' .cm-kb-hbar .cm-kb-thumb')).boundingBox();
await p.mouse.move(ht.x + ht.width / 2, ht.y + ht.height / 2);
await p.mouse.down();
await p.mouse.move(ht.x + ht.width / 2 + 120, ht.y + ht.height / 2, { steps: 5 });
await p.mouse.up();
await p.waitForTimeout(200);
check((await bars()).sl > 100, 'dragging it scrolls sideways');
await p.click('button[aria-label="Wrap long lines"]');
await p.waitForTimeout(400);
check((await bars()).h === 'none', 'with wrap on there is nothing to scroll sideways, and no bar');
await p.click('button[aria-label="Wrap long lines"]');

// run errors show on the script's ruler (the page loads its script, as a real one has to: cdnPage's tag)
await tab('index.html').click();
await p.fill(ed + ' .cm-content', cdnPage('<p>x</p>'));
await tab('script').click();
// (distinct names: the script must be valid apart from the one error on line 31)
await p.fill(ed + ' .cm-content', Array.from({ length: 30 }, (_, i) => 'const a' + i + ' = ' + i + ';').join('\n') + '\nbroken();\n' + Array.from({ length: 20 }, (_, i) => 'const z' + i + ' = ' + i + ';').join('\n'));
await p.waitForTimeout(1700);
s = await bars();
// (the error color is the editor's: --ed-error, #c72e0f in light mode)
check(s.marks.some((m) => m.includes('199, 46, 15') || m.includes('--ed-error')), 'a script error from the last run is marked on the ruler (red)');
await p.fill(ed + ' .cm-content', '');
await tab('index.html').click();

// --- tooltips ---
await p.fill(ed + ' .cm-content', '<p class="shadow-lg font-sans transition bg-[url(/images/a-very-long-file-name-for-the-hero-background-image-of-the-landing-page.png)] p-4">x</p>');
await p.waitForTimeout(500);
await p.click(ed + ' .cm-content');
await p.keyboard.press('Control+Home');
await p.waitForTimeout(300); // the editor scrolls back on its next frame
const hover = async (word) => {
  const at = await p.evaluate((w) => {
    const root = [...document.querySelectorAll('.cm-content')].find((e) => e.offsetParent);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const i = n.textContent.indexOf(w);
      if (i >= 0) {
        const r = document.createRange();
        r.setStart(n, i + 1);
        r.setEnd(n, i + 2);
        const bx = r.getBoundingClientRect();
        return { x: bx.left + 1, y: bx.top + bx.height / 2 };
      }
    }
  }, word);
  await p.mouse.move(0, 0);
  await p.waitForTimeout(250);
  await p.mouse.move(at.x, at.y);
  await p.waitForSelector('.cm-kb-hover', { timeout: 4000 });
  await p.waitForTimeout(150);
  return p.$eval('.cm-kb-hover', (h) => {
    const tip = h.closest('.cm-tooltip').getBoundingClientRect();
    const pre = h.querySelector('pre');
    return { text: pre.textContent, left: Math.round(tip.left), right: Math.round(tip.right), width: Math.round(tip.width), overflowX: pre.scrollWidth - pre.clientWidth, vw: innerWidth };
  });
};
const sh = await hover('shadow-lg');
check(sh.text.startsWith('.shadow-lg {') && sh.text.includes('box-shadow:\n    0 10px 15px -3px') && !sh.text.includes('--kb-'), 'shadow-lg shows its effective CSS, one layer per line, no --kb-* plumbing:\n' + sh.text);
const tr = await hover('transition ');
check(tr.text.includes('transition-property:\n    color,') && tr.overflowX <= 0, 'transition lists its properties one per line, inside the tooltip');
const url = await hover('bg-[url');
check(url.overflowX <= 0 && url.width <= 34 * 16 + 2 && url.right <= url.vw, 'a very long value wraps inside a tooltip that fits the screen (' + url.width + 'px wide)');
await p.screenshot({ path: 'shots/tip-url.png' });

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
