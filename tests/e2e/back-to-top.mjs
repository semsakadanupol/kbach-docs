// The home page's Back to top button (2026-11-27): hidden (and out of the tab order) at the top,
// shown once the reader is a screen down, its ring filling as they scroll; a click goes back up
// and puts the focus on the header. Fixed in the corner on a phone too, without covering the page's
// width. Docs pages don't get it (their "On this page" column has its own Back to top).
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const U = 'http://localhost:5176';
const b = await chromium.launch();
const errors = [];

for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport, hasTouch: name === 'phone' });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(U + '/', { waitUntil: 'networkidle' });
  const btn = 'button[aria-label="Back to top"]';
  const state = () =>
    p.$eval(btn, (el) => {
      const r = el.getBoundingClientRect();
      const ring = el.querySelector('circle');
      return {
        opacity: Number(getComputedStyle(el).opacity),
        tab: el.tabIndex,
        hidden: el.getAttribute('aria-hidden'),
        position: getComputedStyle(el).position,
        right: Math.round(window.innerWidth - r.right),
        bottom: Math.round(window.innerHeight - r.bottom),
        size: Math.round(r.width),
        dash: Number(ring.style.strokeDashoffset || ring.getAttribute('stroke-dashoffset')),
        full: Number(ring.getAttribute('stroke-dasharray')),
      };
    });

  let s = await state();
  check(s.opacity === 0 && s.tab === -1 && s.hidden === 'true', name + ': at the top the button is hidden and out of the tab order ' + JSON.stringify(s));

  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await p.waitForTimeout(600);
  const half = await state();
  check(half.opacity === 1 && half.tab === 0 && half.hidden === 'false' && half.position === 'fixed', name + ': two screens down it shows, fixed ' + JSON.stringify(half));
  check(half.size >= 44 && half.right >= 16 && half.right <= 24 && half.bottom >= 16 && half.bottom <= 24, name + ': 44px, in the bottom-right corner ' + JSON.stringify({ size: half.size, right: half.right, bottom: half.bottom }));

  // hovered, it lifts as one piece: the ring and the arrow stay centered on the button (Kbach's
  // transform variables are inherited, and a ring with -rotate-90 took the lift twice, sliding off)
  if (name === 'desktop') {
    const borderAtRest = await p.$eval(btn, (el) => getComputedStyle(el).borderTopColor);
    await p.hover(btn);
    await p.waitForTimeout(500);
    const h = await p.$eval(btn, (el) => {
      const mid = (r) => [r.left + r.width / 2, r.top + r.height / 2];
      const b = el.getBoundingClientRect();
      const [bx, by] = mid(b);
      const [rx, ry] = mid(el.querySelector('svg').getBoundingClientRect());
      const [ix, iy] = mid(el.querySelector('svg:last-child').getBoundingClientRect());
      return { lift: Math.round(window.innerHeight - b.bottom), ring: Math.hypot(rx - bx, ry - by), icon: Math.hypot(ix - bx, iy - by), border: getComputedStyle(el).borderTopColor };
    });
    check(h.lift > half.bottom && h.ring < 0.5 && h.icon < 0.5, name + ': hovered it lifts, the ring and arrow still centered on it ' + JSON.stringify(h));
    // the ring is the only gold edge: a border turning gold on hover, just outside it, read as a second ring
    check(h.border === borderAtRest, name + ': hover leaves the border as it was, so there is one ring, not two (' + borderAtRest + ' → ' + h.border + ')');
    await p.mouse.move(10, 10);
  }

  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(600);
  const end = await state();
  check(half.dash < half.full && half.dash > 0 && end.dash < 1, name + ': its ring fills as the page scrolls (' + Math.round(half.dash) + ' → ' + Math.round(end.dash) + ' of ' + Math.round(half.full) + ' left)');

  await p.click(btn);
  await p.waitForFunction(() => window.scrollY === 0, null, { timeout: 3000 }).catch(() => {});
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ y: window.scrollY, focus: !!document.activeElement?.closest('header') }));
  s = await state();
  check(after.y === 0 && after.focus && s.opacity === 0, name + ': a click goes back to the top, focus on the header, and the button hides ' + JSON.stringify(after));
  await p.close();
}

// reduced motion: straight to the top
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(U + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(400);
  await p.click('button[aria-label="Back to top"]');
  check((await p.evaluate(() => window.scrollY)) === 0, 'with reduced motion it jumps to the top at once');
  // a docs page has none
  await p.goto(U + '/colors', { waitUntil: 'networkidle' });
  check(!(await p.$('button[aria-label="Back to top"].fixed')), 'a docs page has no floating button (its "On this page" column has Back to top)');
  await p.close();
}

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
