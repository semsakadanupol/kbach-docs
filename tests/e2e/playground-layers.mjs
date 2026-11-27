// The playground's ⋯ menu sits on top of the editor and the preview, on a desktop and on a phone.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failures++; };
const b = await chromium.launch();
const covered = (p) => p.$$eval('[role="menuitem"]', (items) => items.filter((it) => {
  const r = it.getBoundingClientRect();
  return !it.contains(document.elementFromPoint(r.left + 12, r.top + r.height / 2));
}).map((it) => it.textContent.trim().slice(0, 16)));

for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
  await p.waitForSelector('.cm-content', { state: 'attached' }); await p.waitForTimeout(800);
  await p.click('button[aria-label="More"]');
  await p.waitForTimeout(300);
  const hidden = await covered(p);
  const count = await p.$$eval('[role="menuitem"]', (items) => items.length);
  check(count > 0 && hidden.length === 0, label + ': every ⋯ menu item is on top' + (hidden.length ? ' (covered: ' + hidden.join(', ') + ')' : ''));
  await p.screenshot({ path: 'shots/z-' + label + '.png' });
  await p.close();
}
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
