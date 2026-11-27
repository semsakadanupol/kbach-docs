// The preview toolbar: exactly one row wherever one row is meant to fit, never more than two.
import { chromium } from 'playwright';
let failures = 0;
const b = await chromium.launch();
// the playground is always full screen: the code beside the preview, at any split
const cases = [];
for (const w of [1024, 1280, 1366, 1440, 1920]) for (const split of [25, 45, 75]) cases.push({ w, layout: 'left', split });
for (const c of cases) {
  const p = await b.newPage({ viewport: { width: c.w, height: 900 } });
  await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
  await p.evaluate((c) => { localStorage.setItem('kbach-playground-panes', c.layout); localStorage.setItem('kbach-playground-split', String(c.split)); }, c);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const out = document.querySelector('section[aria-label="Output"]');
    const bar = out.firstElementChild;
    const btns = [...bar.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => x.getBoundingClientRect());
    const rows = new Set(btns.map((x) => Math.round(x.top))).size;
    const br = bar.getBoundingClientRect();
    const outside = btns.some((x) => x.right > br.right + 0.5 || x.left < br.left - 0.5);
    const code = document.querySelector('section[aria-label="Code"]').offsetWidth;
    return { width: out.offsetWidth, inner: out.clientWidth, rows, outside, code, labels: !!document.querySelector('section[aria-label="Output"] button[aria-label="Desktop"] span:not(.hidden)')?.offsetParent };
  });
  const oneRowMeant = r.inner >= 43 * 16; // container queries measure the inside of the box
  const ok = !r.outside && (oneRowMeant ? r.rows === 1 : r.rows <= 2) && r.code >= 360 && r.width >= 420;
  if (!ok) failures++;
  console.log((ok ? 'OK   ' : 'FAIL ') + `${c.w}px ${c.layout} ${c.split}%: preview ${r.width}px, code ${r.code}px → ${r.rows} row(s)${r.labels ? ', with labels' : ''}${r.outside ? ', BUTTON OUTSIDE' : ''}`);
  await p.close();
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
