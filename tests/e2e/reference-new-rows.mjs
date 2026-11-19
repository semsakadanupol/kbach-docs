// The reference tables show CSS for the forms added in core-engine 1.0.0-beta.19.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const rows = {
  typography: [['text-sm/6', 'line-height: 1.5rem'], ['text-lg/tight', 'line-height: 1.25'], ['font-[550]', 'font-weight: 550'], ['align-[4px]', 'vertical-align: 4px']],
  layout: [['object-[25%_75%]', 'object-position: 25% 75%']],
  'transitions-animation': [['duration-initial', 'initial']],
};
for (const [page, want] of Object.entries(rows)) {
  await p.goto('http://localhost:5176/en/' + page, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  // tables longer than 8 rows fold behind "Show all N classes"
  for (const more of await p.$$('button:has-text("Show all")')) await more.click();
  await p.waitForTimeout(300);
  const table = await p.$$eval('table tr', (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td, i) => (i === 0 ? [...td.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('') : td.textContent).trim())));
  for (const [cls, css] of want) {
    const row = table.find((cells) => cells[0] === cls);
    check(!!row && row.slice(1).join(' ').includes(css), page + ': ' + cls + ' shows ' + css + (row ? '' : ' (no row)'));
  }
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
