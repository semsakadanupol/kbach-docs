import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failures++; };
const b = await chromium.launch();
for (const [w, h] of [[320, 700], [360, 740], [390, 844], [768, 1024], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
  await p.waitForSelector('.cm-content'); await p.waitForTimeout(800);
  for (const tab of ['html', 'script']) {
    await p.click(tab === 'html' ? 'button[role="tab"] >> nth=0' : 'button[role="tab"] >> nth=1');
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bar = document.querySelector('section:has(.cm-editor) > div');
      const barRight = bar.getBoundingClientRect().right;
      const controls = [...bar.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => Math.round(x.getBoundingClientRect().right));
      const boxes = [...bar.querySelectorAll('button')].filter((x) => x.offsetParent && !x.closest('[role=menu]')).map((x) => x.getBoundingClientRect());
      const overlap = boxes.some((a, i) => boxes.some((c, j) => j > i && a.left < c.right - 0.5 && c.left < a.right - 0.5 && !(a.left >= c.left && a.right <= c.right) && !(c.left >= a.left && c.right <= a.right)));
      // the example's name, in the playground's header above the editor, is readable
      const header = document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling;
      const name = header.querySelector('.truncate.font-semibold');
      return { vw, scrollW: document.documentElement.scrollWidth, maxControl: Math.max(...controls), barRight: Math.round(barRight), overlap, nameFits: name.scrollWidth <= name.clientWidth };
    });
    check(r.scrollW <= r.vw && r.maxControl <= r.barRight && !r.overlap && r.nameFits, w + 'px, ' + tab + ' tab: no sideways scroll, every button inside the bar, the example name not cut off (' + JSON.stringify(r) + ')');
  }
  await p.click('button[aria-label="More"]');
  await p.waitForTimeout(250);
  const menu = await p.$eval('[role="menu"][aria-label="More"]', (m) => { const r = m.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw: document.documentElement.clientWidth }; });
  check(menu.left >= 0 && menu.right <= menu.vw, w + 'px: the open ⋯ menu fits on screen (' + JSON.stringify(menu) + ')');
  if (w === 390) await p.screenshot({ path: 'shots/phone-bar.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  await p.close();
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
