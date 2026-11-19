import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failures++; };
const b = await chromium.launch();
for (const w of [320, 360, 480, 640, 768, 1024, 1280, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
  await p.waitForSelector('.cm-content'); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const bar = document.querySelector('section:has(iframe) > div:first-child');
    const br = bar.getBoundingClientRect();
    const btns = [...bar.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => x.getBoundingClientRect());
    const rows = new Set(btns.map((x) => Math.round(x.top))).size;
    const outside = btns.filter((x) => x.left < br.left - 0.5 || x.right > br.right + 0.5).length;
    const overlap = btns.some((a, i) => btns.some((c, j) => j > i && a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5));
    return { rows, outside, overlap, scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth, h: Math.round(br.height) };
  });
  check(r.rows <= 2 && !r.outside && !r.overlap && !r.scroll, w + 'px: ' + r.rows + ' row(s), ' + r.h + 'px tall, nothing outside or overlapping');
  await p.close();
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
