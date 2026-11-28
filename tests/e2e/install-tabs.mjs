// The Installation page's setup tabs: each with its logo; when the bar is too
// narrow for every name, the others show just their logo, and nothing is cut off.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const URL = 'http://localhost:5176/installation';
const b = await chromium.launch();

/** The bar: does it overflow, and which tabs show their name (sr-only hides it). */
const state = (p) =>
  p.$eval('[role="tablist"][aria-label="Choose your setup"]', (t) => ({
    overflows: t.scrollWidth > t.clientWidth + 1,
    tabs: [...t.querySelectorAll('[role="tab"]')].map((tab) => ({
      label: tab.textContent.trim(),
      on: tab.getAttribute('aria-selected') === 'true',
      named: getComputedStyle(tab.querySelector('span')).position !== 'absolute',
      logo: !!tab.querySelector('svg'),
      title: tab.title,
    })),
  }));

const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
let s = await state(p);
check(!s.overflows && s.tabs.length === 4 && s.tabs.every((t) => t.named && t.logo), 'wide: every tab has its logo and its name ' + JSON.stringify(s.tabs.map((t) => t.label)));
// flex-1: the tabs share the bar equally, end to end
const widths = await p.$eval('[role="tablist"][aria-label="Choose your setup"]', (t) => {
  const tabs = [...t.querySelectorAll('[role="tab"]')].map((x) => x.getBoundingClientRect());
  return { tabs: tabs.map((r) => Math.round(r.width)), filled: Math.round(tabs.at(-1).right - tabs[0].left), bar: Math.round(t.clientWidth) };
});
check(Math.max(...widths.tabs) - Math.min(...widths.tabs) <= 1 && Math.abs(widths.filled - widths.bar) <= 1, 'wide: the four tabs are the same width and fill the bar ' + JSON.stringify(widths));

for (const width of [500, 390, 320]) {
  await p.setViewportSize({ width, height: 800 });
  await p.waitForTimeout(400);
  s = await state(p);
  const on = s.tabs.find((t) => t.on);
  check(
    !s.overflows && on.named && s.tabs.filter((t) => !t.on).every((t) => !t.named && t.logo),
    width + 'px: nothing cut off; the chosen tab keeps its name, the others show their logo ' + JSON.stringify(s),
  );
}
// the logo-only ones still say what they are
check(s.tabs.every((t) => t.title.startsWith(t.label)), 'a logo-only tab’s tooltip has its name');

// choosing another tab: its name shows, still nothing cut off
await p.click('[role="tab"]:has-text("React Native")');
await p.waitForTimeout(400);
s = await state(p);
check(!s.overflows && s.tabs.find((t) => t.on)?.label === 'React Native' && s.tabs.find((t) => t.on).named, 'choosing React Native: its name shows, nothing cut off');

// bigger text (a reader's font size or zoom): measured, not a breakpoint
await p.setViewportSize({ width: 640, height: 800 });
await p.waitForTimeout(300);
const before = (await state(p)).tabs.every((t) => t.named);
await p.evaluate(() => (document.documentElement.style.fontSize = '22px'));
await p.waitForTimeout(500);
s = await state(p);
check(before && !s.overflows && s.tabs.some((t) => !t.named), '640px fits every name, until the text is bigger: then the others drop to their logo ' + JSON.stringify(s.tabs.map((t) => t.named)));
await p.evaluate(() => (document.documentElement.style.fontSize = ''));

// wide again: every name comes back
await p.setViewportSize({ width: 1280, height: 900 });
await p.waitForTimeout(500);
s = await state(p);
check(!s.overflows && s.tabs.every((t) => t.named), 'wide again: every name is back');

// --- a code block's npm / pnpm / yarn / bun tabs on a phone (2026-11-28: they ran past the edge,
// cutting off bun and the copy button): every tab fits its row, the copy button stays in the box,
// and the logos show when there's room for them (from 360px), words alone below
for (const [w, logos] of [[320, false], [360, true], [390, true]]) {
  const phone = await b.newPage({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
  await phone.goto(URL, { waitUntil: 'networkidle' });
  await phone.waitForTimeout(500);
  const rows = await phone.$$eval('main [role="tabpanel"]:not([hidden]) [role="tablist"]', (lists) =>
    lists
      .filter((l) => l.querySelector('button[aria-label*="opy"]'))
      .map((l) => {
        const box = l.getBoundingClientRect();
        const row = l.firstElementChild;
        const copy = l.querySelector('button[aria-label*="opy"]').getBoundingClientRect();
        const icons = [...l.querySelectorAll('[role="tab"] svg')].filter((svg) => svg.getBoundingClientRect().width > 0).length;
        return { tabs: l.querySelectorAll('[role="tab"]').length, fits: row.scrollWidth <= row.clientWidth, copyIn: copy.left >= box.left && copy.right <= box.right + 0.5, icons };
      }),
  );
  const pm = rows.find((r) => r.tabs === 4);
  check(!!pm && rows.every((r) => r.fits && r.copyIn), w + 'px: every code block’s tabs fit their row, the copy button inside the box ' + JSON.stringify(rows));
  check(!!pm && (logos ? pm.icons === 4 : pm.icons === 0), w + 'px: npm, pnpm, yarn and bun ' + (logos ? 'with their logos' : 'as words (no room for the logos)') + ' (' + pm?.icons + ' logos)');
  await phone.close();
}

await b.close();
process.exit(failures ? 1 : 0);
