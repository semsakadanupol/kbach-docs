// While the playground's code loads, its outline shows: laid out as the
// playground will be (the reader's layout and split), so nothing jumps.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const URL = 'http://localhost:5176/playground';
const b = await chromium.launch();

/** The placeholder's panes, then the real ones, for a window size and saved layout. */
async function compare(viewport, saved) {
  const ctx = await b.newContext({ viewport });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate((s) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
  }, saved);
  // hold the playground's own code back, so the placeholder stays up
  let release;
  const held = new Promise((r) => (release = r));
  await p.route(/\/assets\/Playground-[^/]*\.js$/, async (route) => {
    await held;
    await route.continue();
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[role="status"][aria-label="Loading the playground"]', { timeout: 10000 });
  const boxes = (sel) =>
    p.$$eval(sel, (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      }),
    );
  const loading = await p.evaluate(() => {
    const root = document.querySelector('[aria-label="Loading the playground"]');
    const [header, body] = root.children;
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const code = root.querySelector('[data-pane="code"]');
    const bar = root.querySelector('[data-pane="phone-bar"]');
    return { header: r(header), code: r(code), output: r(root.querySelector('[data-pane="output"]')), bar: bar && r(bar), status: getComputedStyle(code.lastElementChild).backgroundColor, lines: [...code.children[1].children].map((l) => Math.round(l.lastElementChild.getBoundingClientRect().width)) };
  });
  release();
  await p.waitForSelector('section[aria-label="Code"]', { timeout: 15000 });
  await p.waitForTimeout(800);
  const [code] = await boxes('section[aria-label="Code"]');
  const [output] = await boxes('section[aria-label="Output"]');
  const [bar] = await boxes('nav[aria-label="Playground view"]');
  await ctx.close();
  return { loading, code, output, bar };
}
const near = (a, b, px = 1) => Math.abs(a.x - b.x) <= px && Math.abs(a.y - b.y) <= px && Math.abs(a.w - b.w) <= px && Math.abs(a.h - b.h) <= px;

for (const [name, viewport, saved] of [
  ['wide, the default (code left)', { width: 1440, height: 900 }, {}],
  ['wide, code right at 60%', { width: 1440, height: 900 }, { 'kbach-playground-panes': 'right', 'kbach-playground-split': '60' }],
  ['narrow (stacked)', { width: 720, height: 900 }, {}],
  ['phone (the preview alone, the Code / Preview bar under it)', { width: 390, height: 844 }, {}],
]) {
  const r = await compare(viewport, saved);
  // a phone opens on the preview: no editor in either, and the bar where the real one lands
  const phone = viewport.width < 640;
  const hiddenBox = { x: 0, y: 0, w: 0, h: 0 };
  check(
    (phone ? near(r.loading.code, hiddenBox) && near(r.code, hiddenBox) && r.loading.bar && r.bar && Math.abs(r.loading.bar.y + 8 - r.bar.y) <= 1 && Math.abs(r.loading.bar.h - 8 - r.bar.h) <= 1 : near(r.loading.code, r.code)) && near(r.loading.output, r.output),
    name + ': the placeholder’s editor and preview sit where the real ones land ' + JSON.stringify(r),
  );
}

// and it looks like the playground: the gold status bar, on the page's background
const r = await compare({ width: 1280, height: 800 }, {});
check(r.loading.status === 'rgb(199, 162, 93)', 'the placeholder’s editor has the gold status bar (' + r.loading.status + ')');
// regression: lines sized by w-2/5-style classes kept in a plain array never got their CSS, so they didn't show
check(r.loading.lines.length === 10 && r.loading.lines.every((w) => w > 20), 'every code line in the placeholder is drawn (' + r.loading.lines.join(', ') + ')');

await b.close();
process.exit(failures ? 1 : 0);
