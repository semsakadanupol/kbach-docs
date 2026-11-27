// The scroll reveal (components/scrollReveal.ts, 2026-11-26) at every kind of screen: a small
// phone, a phone, a phone on its side, a tablet, a laptop and a tall monitor, in Chromium and
// Firefox (the same code runs in both). Every call to element.animate is recorded, so the
// checks know which blocks played their rise.
//
// - before the page's script runs, the first screen is held hidden (no show-then-hide flash)
// - on load, every block on the first screen plays its rise and ends fully shown
// - only what's on screen plays, but anything on screen does, even a sliver at the bottom: a
//   block below the screen is hidden and never animated, all the way down the page; once any
//   of it shows it's played and shown
// - at the very bottom of the page, everything is shown
// - a block reaching the screen is mid-rise, then nothing is left on it but data-revealed
// - a #section link lands on a visible heading; another page starts over
// - with reduced motion nothing is hidden and nothing plays
import { chromium, firefox } from 'playwright';

const BASE = 'http://localhost:5176';
const DONE = 1500; // a rise is 0.8s, after at most 150 + 8 × 70ms on load or 4 × 90ms later
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

const SCREENS = [
  { name: 'small phone 320×568', viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
  { name: 'phone 390×844', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'phone on its side 844×390', viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
  { name: 'tablet 768×1024', viewport: { width: 768, height: 1024 }, hasTouch: true },
  { name: 'laptop 1440×900', viewport: { width: 1440, height: 900 } },
  { name: 'tall monitor 2560×1440', viewport: { width: 2560, height: 1440 } },
];
const PAGES = ['/', '/variants'];

// counts element.animate calls on each element (before the page's own scripts)
const recordAnimations = () => {
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    this.__rose = (this.__rose || 0) + 1;
    // whether it moved as it came in (a translate in its keyframes)
    if ([].concat(args[0]).some((k) => k && k.translate && k.translate !== '0 0')) this.__moved = true;
    return animate.apply(this, args);
  };
};
// (in the page) every revealed block: its place on screen, how shown it is, whether it rose
const blocks = () =>
  [...document.querySelectorAll('[data-prose] > *, [data-reveal]')].map((e) => {
    const r = e.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, opacity: Number(getComputedStyle(e).opacity), rose: e.__rose || 0, tag: e.tagName + (e.id ? '#' + e.id : '') };
  });

for (const engine of [chromium, firefox]) {
  const b = await engine.launch();
  // Firefox: 4 of the sizes (the same code as Chromium); Chromium all of them
  const screens = engine === firefox ? SCREENS.filter((_, i) => [0, 2, 4, 5].includes(i)) : SCREENS;
  for (const screen of screens) {
    const ctx = await b.newContext(engine === firefox ? { viewport: screen.viewport, hasTouch: screen.hasTouch } : screen);
    await ctx.addInitScript(recordAnimations);
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const problems = [];
    let onLoad = 0;
    let waiting = 0;
    for (const path of PAGES) {
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      await p.waitForTimeout(DONE);
      const vh = await p.evaluate(() => innerHeight);
      for (const k of await p.evaluate(blocks)) {
        const onScreen = k.bottom > 0 && k.top < vh - 1;
        if (onScreen && (k.opacity < 0.99 || !k.rose)) problems.push(`${path} first screen: ${k.tag} at ${Math.round(k.top)}px is ${k.opacity.toFixed(2)}, rose ${k.rose}`);
        if (onScreen) onLoad++;
        if (k.top > vh && (k.opacity !== 0 || k.rose)) problems.push(`${path} below the first screen: ${k.tag} at ${Math.round(k.top)}px is ${k.opacity.toFixed(2)}, rose ${k.rose}`);
        if (k.top > vh) waiting++;
      }
      // a screen at a time: what's on screen has played and is shown; what's below never played
      const height = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = vh; y <= height; y += vh) {
        await p.evaluate((y) => window.scrollTo(0, y), y);
        await p.waitForTimeout(DONE);
        for (const k of await p.evaluate(blocks)) {
          if (k.bottom > 0 && k.top < vh - 1 && (k.opacity < 0.99 || !k.rose)) problems.push(`${path} scrolled to ${y}: ${k.tag} at ${Math.round(k.top)}px is ${k.opacity.toFixed(2)}, rose ${k.rose}`);
          if (k.top > vh && k.rose) problems.push(`${path} scrolled to ${y}: ${k.tag} below the screen played already`);
        }
      }
      await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(DONE);
      for (const k of await p.evaluate(blocks)) {
        if (k.opacity < 0.99) problems.push(`${path} at the bottom: ${k.tag} at ${Math.round(k.top)}px stays ${k.opacity.toFixed(2)}`);
      }
    }
    check(problems.length === 0, `${engine.name()} ${screen.name}: the first screen rises in on load, the rest only once on screen, nothing left faded (${PAGES.length} pages)` + (problems.length ? '\n     ' + problems.slice(0, 6).join('\n     ') : ''));
    check(onLoad > 0 && waiting > 0, `${engine.name()} ${screen.name}: ${onLoad} blocks rose in on load, ${waiting} waited below the screen`);
    check(errors.length === 0, `${engine.name()} ${screen.name}: no page errors ${JSON.stringify(errors)}`);
    await ctx.close();
  }

  // before the page's script runs: the page is marked and its first screen held hidden
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.route('**/*.js', (route) => route.abort()); // the page's scripts never run
    await p.goto(BASE + '/variants', { waitUntil: 'domcontentloaded' });
    const held = await p.evaluate(() => ({
      mark: document.documentElement.getAttribute('data-kb-reveal'),
      shown: [...document.querySelectorAll('[data-prose] > *')].filter((e) => e.getBoundingClientRect().top < innerHeight && getComputedStyle(e).opacity !== '0').length,
    }));
    // ... and if the reveal never takes over, everything shows after 3s
    await p.waitForTimeout(3300);
    const later = await p.evaluate(() => ({
      mark: document.documentElement.getAttribute('data-kb-reveal'),
      hidden: [...document.querySelectorAll('[data-prose] > *')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    }));
    check(held.mark === 'wait' && held.shown === 0 && later.mark === null && later.hidden === 0, `${engine.name()}: before the page runs, the first screen is held hidden (no flash); without its script, everything shows after 3s ${JSON.stringify({ held, later })}`);
    await p.close();
  }

  // a block reaching the screen plays its rise: moving at first, then fully in, nothing left on it
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto(BASE + '/variants', { waitUntil: 'networkidle' });
    await p.waitForTimeout(DONE);
    const y = await p.evaluate(() => {
      const el = [...document.querySelectorAll('[data-prose] > p')].find((e) => e.getBoundingClientRect().top > innerHeight + 200);
      el.setAttribute('data-follow', '');
      return Math.round(el.getBoundingClientRect().top + scrollY - innerHeight * 0.5);
    });
    await p.evaluate((y) => window.scrollTo(0, y), y);
    // (blocks that arrive together follow each other, up to 360ms apart: past that, it's moving)
    await p.waitForTimeout(500);
    const moving = await p.evaluate(() => {
      const el = document.querySelector('[data-follow]');
      return { animations: el.getAnimations().length, opacity: Number(getComputedStyle(el).opacity) };
    });
    await p.waitForTimeout(DONE);
    const done = await p.evaluate(() => {
      const el = document.querySelector('[data-follow]');
      return { animations: el.getAnimations().length, opacity: Number(getComputedStyle(el).opacity), style: el.getAttribute('style') };
    });
    check(
      moving.animations === 1 && moving.opacity > 0 && moving.opacity < 0.95 && done.animations === 0 && done.opacity === 1 && !done.style,
      `${engine.name()}: a block reaching the screen rises in, then nothing is left on it ${JSON.stringify({ moving, done })}`,
    );
    await p.close();
  }

  // another page by a sidebar link (it starts over: its first screen rises, the rest waits), then a far #section jump
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(recordAnimations);
    const p = await ctx.newPage();
    await p.goto(BASE + '/variants', { waitUntil: 'networkidle' });
    await p.locator('aside a[href="/colors"]').first().click();
    await p.waitForURL('**/colors');
    await p.waitForTimeout(DONE);
    const all = await p.evaluate(blocks);
    const onScreen = all.filter((k) => k.bottom > 0 && k.top < 900 - 1);
    const waiting = all.filter((k) => k.top > 900 && k.opacity === 0 && !k.rose).length;
    check(onScreen.length > 0 && onScreen.every((k) => k.opacity > 0.99 && k.rose) && waiting > 0, `${engine.name()}: after a link to another page, its first screen rises in and the rest waits (${onScreen.length} rose, ${waiting} waiting)`);
    const last = p.locator('nav[aria-label] a[href^="#"]').last();
    const id = (await last.getAttribute('href')).slice(1);
    await last.click();
    await p.waitForTimeout(DONE + 300);
    const target = await p.evaluate((id) => {
      const h = document.getElementById(id);
      const r = h.getBoundingClientRect();
      return { top: Math.round(r.top), opacity: Number(getComputedStyle(h).opacity) };
    }, id);
    const shown = (await p.evaluate(blocks)).filter((k) => k.bottom > 0 && k.top < 900 - 1);
    check(target.opacity > 0.99 && target.top >= 0 && target.top < 200 && shown.every((k) => k.opacity > 0.99), `${engine.name()}: the table of contents' last link (#${id}) lands on a visible section ${JSON.stringify(target)}`);
    await ctx.close();
  }

  // a page opened at a #heading: its first screen fades in where it is, so the heading lands
  // where the link points (regression: rising 40px moved it, and it ended 40px too high)
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(recordAnimations);
    const p = await ctx.newPage();
    await p.goto(BASE + '/dark-mode#avoid-a-flash-on-load', { waitUntil: 'networkidle' });
    await p.waitForTimeout(DONE + 300);
    const r = await p.evaluate(() => {
      const onScreen = [...document.querySelectorAll('[data-prose] > *')].filter((e) => e.__rose);
      return { top: Math.round(document.getElementById('avoid-a-flash-on-load').getBoundingClientRect().top), faded: onScreen.length, moved: onScreen.filter((e) => e.__moved).length };
    });
    check(r.top === 72 && r.faded > 0 && r.moved === 0, `${engine.name()}: opened at a #heading, the first screen fades in without moving and the heading lands under the header ${JSON.stringify(r)}`);
    await ctx.close();
  }

  // reduced motion: nothing hidden, nothing plays
  const rm = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await rm.addInitScript(recordAnimations);
  const still = await rm.newPage();
  await still.goto(BASE + '/variants', { waitUntil: 'networkidle' });
  await still.waitForTimeout(500);
  const all = await still.evaluate(blocks);
  check(all.every((k) => k.opacity > 0.99 && !k.rose), `${engine.name()}: with reduced motion nothing is hidden and nothing plays (${all.filter((k) => k.opacity < 0.99).length} hidden)`);
  await rm.close();
  await b.close();
}
process.exit(failures ? 1 : 0);
