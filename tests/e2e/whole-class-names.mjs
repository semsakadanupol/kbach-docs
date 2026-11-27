// Small-screen polish (2026-11-27): a class name never breaks across lines on a phone (bg- / blue-6
// reads as two classes), in a page's inline code, its description and the home page's sentences
// and class pill; the home page's docs list has finger-sized rows on a phone; and the playground's
// preview toolbar at tablet width is two tidy rows (run controls up top, canvas controls below),
// not one row that wraps Auto-run onto a line of its own.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const U = 'http://localhost:5176';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });

/** Elements matching `selector` whose text is drawn on more than one line. */
const split = (selector) =>
  p.$$eval(selector, (els) =>
    els
      .filter((e) => {
        const r = document.createRange();
        r.selectNodeContents(e);
        const tops = new Set([...r.getClientRects()].filter((c) => c.width > 0).map((c) => Math.round(c.top)));
        return tops.size > 1;
      })
      .map((e) => e.textContent),
  );

// --- docs pages: short inline code stays whole; the description's hyphenated words too
for (const page of ['/introduction', '/colors', '/variants', '/spacing', '/quick-start']) {
  await p.goto(U + page, { waitUntil: 'networkidle' });
  const broken = (await split('[data-prose] p code, [data-prose] li code')).filter((t) => t.length <= 24 && !/\s/.test(t));
  check(broken.length === 0, page + ': no short inline code split across lines ' + JSON.stringify(broken.slice(0, 5)));
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(over <= 0, page + ': no sideways scroll (' + over + ')');
}
await p.goto(U + '/introduction', { waitUntil: 'networkidle' });
const lead = await split('main h1 ~ p .whitespace-nowrap');
const leadWords = await p.$$eval('main h1 ~ p .whitespace-nowrap', (s) => s.map((x) => x.textContent));
check(leadWords.includes('bg-blue-6.') && lead.length === 0, 'the description keeps bg-blue-6 on one line ' + JSON.stringify(leadWords));

// --- home: the class pill wraps between classes only; the palette sentence's class names are whole
await p.goto(U + '/', { waitUntil: 'networkidle' });
const pill = await split('[data-hero-class] .whitespace-nowrap');
check(pill.length === 0 && (await p.$$('[data-hero-class] .whitespace-nowrap')).length === 4, 'the hero class pill never splits a class (' + JSON.stringify(pill) + ')');
const words = await p.$$eval('main code.whitespace-nowrap', (c) => c.map((x) => x.textContent));
check(words.includes('bg-blue-1') && words.includes('npm run dev') && (await split('main code.whitespace-nowrap')).length === 0, 'the home page’s class names and commands are code, each on one line: ' + words.join(', '));
const rows = await p.$$eval('[data-part] ul a', (as) => as.filter((a) => a.offsetParent).map((a) => Math.round(a.getBoundingClientRect().height)));
check(rows.length > 10 && Math.min(...rows) >= 32, 'the docs list’s links are at least 32px tall on a phone (smallest ' + Math.min(...rows) + ')');

// --- the playground at tablet width: the preview toolbar is two rows, Auto-run beside Preview / Console
await p.setViewportSize({ width: 900, height: 1100 });
await p.goto(U + '/playground', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const bar = async () =>
  p.evaluate(() => {
    const top = (sel) => Math.round(document.querySelector('section[aria-label="Output"] ' + sel).getBoundingClientRect().top);
    return { view: top('[role="group"][aria-label="View"]'), autorun: top('[role="switch"], button[aria-pressed][title^="Auto-run"]'), reload: top('button[aria-label="Reload"]'), devices: top('[role="group"][aria-label="Canvas size"]') };
  });
let t = await bar();
check(t.autorun === t.view && t.reload === t.view && t.devices > t.view, 'tablet: Auto-run and Reload share the first row with Preview / Console, the devices a row below ' + JSON.stringify(t));
await p.click('section[aria-label="Output"] [role="switch"]');
await p.waitForTimeout(300);
t = await bar();
const run = await p.evaluate(() => Math.round(document.querySelector('section[aria-label="Output"] button[aria-label^="Run"]').getBoundingClientRect().top));
check(run === t.view && t.autorun === t.view, 'with Auto-run off, Run joins them on the first row ' + JSON.stringify({ ...t, run }));
await p.click('section[aria-label="Output"] [role="switch"]');
// wide: still one row
await p.setViewportSize({ width: 1600, height: 1000 });
await p.waitForTimeout(500);
t = await bar();
check(t.view === t.devices && t.view === t.autorun, 'wide: the whole toolbar is one row ' + JSON.stringify(t));

await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
