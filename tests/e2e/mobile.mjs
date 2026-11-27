// The site on a phone (added 2026-11-26): no browser tap flash, a press look on what
// you touch, touch targets of 44px, the menu closing with a swipe, and a docs page's
// header rising in (not for readers who ask for less motion).
//
// A press look is `active:`, the touch twin of each `hover:` style (Kbach's hover:
// only applies on devices that can hover, so a phone never sees it). Headless
// Chromium never sets :active from an emulated touch, even on a plain page, so the
// press is checked with a pointer press; on a real phone :active follows the
// finger (iOS Safari only with a touchstart listener on the page: Shell.tsx).
import { chromium } from 'playwright';

const BASE = 'http://localhost:5176';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

const b = await chromium.launch();
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const ctx = await b.newContext(phone);
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const cdp = await ctx.newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y }] });

await p.goto(BASE + '/variants', { waitUntil: 'networkidle' });
check(await p.evaluate(() => matchMedia('(pointer: coarse)').matches), 'the emulated phone has a coarse pointer');
check((await p.evaluate(() => getComputedStyle(document.documentElement).webkitTapHighlightColor)) === 'rgba(0, 0, 0, 0)', 'no browser tap flash');

// --- touch targets
const sizes = await p.evaluate(() =>
  [...document.querySelectorAll('header button, header a[aria-label]')]
    .filter((e) => e.getBoundingClientRect().width)
    .map((e) => [e.getAttribute('aria-label'), Math.round(e.getBoundingClientRect().height)]),
);
check(sizes.length >= 3 && sizes.every(([, h]) => h >= 44), 'the header’s buttons and logo are 44px tall on a touch screen ' + JSON.stringify(sizes));
const copy = await p
  .locator('button[aria-label*="Copy"]')
  .first()
  .evaluate((e) => ({ width: e.getBoundingClientRect().width, ring: getComputedStyle(e, '::before').inset }));
check(copy.width === 28 && copy.ring === '-10px', '"Copy code" looks the same (28px) but a finger can hit 48px ' + JSON.stringify(copy));

// --- the header rises in; the body only fades (a #section link lands where it measured)
const anim = await p.evaluate(() => ({
  h1: getComputedStyle(document.querySelector('article h1')).animationName,
  line: getComputedStyle(document.querySelector('article .h-px')).animationName,
  article: getComputedStyle(document.querySelector('article')).animationName,
}));
check(anim.h1 === 'kbd-fade-up' && anim.line === 'kbd-grow' && anim.article === 'kbd-fade', 'a docs page’s header rises in and its line grows ' + JSON.stringify(anim));

// --- the phone menu: a short drag springs back, a vertical one scrolls, a long one closes
const menu = p.locator('div.fixed.inset-0.z-40').first();
const isOpen = async () => (await menu.getAttribute('aria-hidden')) === 'false';
await p.locator('button[aria-label="Open navigation"]').click();
await p.waitForTimeout(400);
check(await isOpen(), 'the menu opens');
const panel = menu.locator(':scope > div').nth(1);
const box = await panel.boundingBox();
const drag = async (dx, dy) => {
  const x = box.x + box.width * 0.7;
  const y = box.y + 300;
  await touch('touchStart', x, y);
  for (let i = 1; i <= 8; i++) {
    await touch('touchMove', x + (dx * i) / 8, y + (dy * i) / 8);
    await p.waitForTimeout(30);
  }
  await touch('touchEnd', x + dx, y + dy);
  await p.waitForTimeout(450);
};
await drag(-60, 0);
check(await isOpen(), 'a short drag to the left springs back');
await drag(0, -200);
check(await isOpen(), 'an up-and-down drag scrolls the list and leaves the menu open');
await drag(-200, 0);
check(!(await isOpen()), 'a long drag to the left closes the menu');
check((await panel.evaluate((e) => e.style.transform)) === '', 'the panel is back on its own classes (no transform left from the drag)');

// --- the press look (see the note at the top: a pointer press stands in for a finger)
const desk = await b.newPage({ viewport: { width: 390, height: 844 } });
await desk.goto(BASE + '/variants', { waitUntil: 'networkidle' });
await desk.locator('button[aria-label="Open navigation"]').click();
await desk.waitForTimeout(400);
const link = desk.locator('[aria-hidden="false"] nav a[href="/colors"]').first();
const lb = await link.boundingBox();
const before = await link.evaluate((e) => getComputedStyle(e).color);
await desk.mouse.move(lb.x + 30, lb.y + lb.height / 2);
await desk.mouse.down();
await desk.waitForTimeout(250);
const pressed = await link.evaluate((e) => getComputedStyle(e).color);
await desk.mouse.up();
check(before !== pressed, 'a menu link takes its hover color while pressed (' + before + ' → ' + pressed + ')');

// --- a mouse keeps the compact header; reduced motion keeps the header still
const wide = await b.newPage({ viewport: { width: 1280, height: 800 } });
await wide.goto(BASE + '/variants', { waitUntil: 'networkidle' });
const wideH = await wide.evaluate(() => Math.round(document.querySelector('header a[aria-label*="GitHub"]').getBoundingClientRect().height));
check(wideH === 36, 'with a mouse the header buttons stay 36px (' + wideH + ')');
const still = await (await b.newContext({ ...phone, reducedMotion: 'reduce' })).newPage();
await still.goto(BASE + '/variants', { waitUntil: 'networkidle' });
check((await still.evaluate(() => getComputedStyle(document.querySelector('article h1')).animationName)) === 'none', 'with reduced motion the header doesn’t move');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
