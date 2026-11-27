// The "Web only" marks in the reference tables: worked out from the engine's
// React Native output (src/reference/native.ts), so a class that does nothing
// on a phone says so, one that works doesn't, and a table where nothing works
// says it once instead of on every row.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));

/** Each table on the page: its rows (class, marked?) and whether it has the all-web note. */
const tables = () =>
  p.evaluate(() =>
    [...document.querySelectorAll('article table')].map((t) => {
      const box = t.parentElement;
      return {
        note: box.firstElementChild?.tagName === 'P' && /React Native/.test(box.firstElementChild.textContent),
        rows: [...t.querySelectorAll('tbody tr')].map((tr) => {
          const cell = tr.querySelector('td');
          const mark = cell.querySelector('span[title]');
          return { cls: cell.firstChild?.textContent?.trim() || cell.textContent.replace('Web only', '').trim(), marked: !!mark };
        }),
      };
    }),
  );
// the engine has filled every row, and folded tables are open (a row past the 8th isn't drawn until then)
const waitForEngine = async () => {
  await p.waitForFunction(() => !document.querySelector('article table [aria-label="Loading"]'), null, { timeout: 15000 });
  for (const more of await p.$$('article button:has-text("Show all")')) await more.click();
  await p.waitForTimeout(200);
};

// --- a page with both kinds
await p.goto(BASE + '/flexbox-grid', { waitUntil: 'networkidle' });
await waitForEngine();
let all = (await tables()).flatMap((t) => t.rows);
const row = (cls) => all.find((r) => r.cls === cls);
check(row('flex-row') && !row('flex-row').marked, 'flex-row works on React Native: no mark');
check(row('gap-4') && !row('gap-4').marked, 'gap-4: no mark');
check(row('justify-between') && !row('justify-between').marked, 'justify-between: no mark');
const orderTable = (await tables()).find((t) => t.rows.some((r) => r.cls === 'order-1'));
check(orderTable?.note, 'order-1 (React Native has no order): its table is noted Web only');

// --- a table where nothing works on a phone: one note, no per-row marks
let ts = await tables();
const grid = ts.find((t) => t.rows.some((r) => r.cls === 'grid-cols-3'));
check(grid?.note && grid.rows.every((r) => !r.marked), 'the grid-cols table says "Web only" once, above it, not on each row');

// --- a whole page of web-only classes
await p.goto(BASE + '/filters', { waitUntil: 'networkidle' });
await waitForEngine();
ts = await tables();
check(ts.length > 3 && ts.every((t) => t.note), 'every table on Filters carries the web-only note (' + ts.length + ' tables)');

// --- values React Native can't read count as web only
await p.goto(BASE + '/spacing', { waitUntil: 'networkidle' });
await waitForEngine();
all = (await tables()).flatMap((t) => t.rows);
check(row('p-4') && !row('p-4').marked, 'p-4: no mark');
check(row('ps-4')?.marked, 'ps-4 (a "16px" string React Native ignores) is marked Web only');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
