// Every playground example works, the same way in its HTML and its React version (added
// 2026-11-26, when each example became a pair): its main controls do what they say, at a desktop
// width and, where the layout changes, a phone's. Opening clean (no unknown class, no console
// error, the same page twice) is tests/e2e/playground-examples-menu.mjs.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const b = await chromium.launch();

/** Opens an example in one kind of page; returns the canvas frame and a helper or two. */
async function open(p, id, kind) {
  await p.goto('about:blank');
  await p.goto(BASE + '/playground?work=' + id + '-' + kind + '#example=' + id + (kind === 'react' ? '&mode=react' : ''), { waitUntil: 'networkidle' });
  // a desktop: the preview as a 1280px desktop (md, lg and xl all apply)
  if (p.viewportSize().width > 1000) await p.click('button[aria-label="Desktop"]');
  await p.waitForTimeout(kind === 'react' ? 3200 : 1600);
  const f =p.frames().find((x) => x !== p.mainFrame() && x.url() === 'about:srcdoc');
  const shown = (text) => f.getByText(text, { exact: false }).first().isVisible().catch(() => false);
  const errors = async () => p.$eval('button:has-text("Console")', (e) => e.querySelector('.bg-red-6')?.textContent ?? '0');
  return { f, shown, errors };
}

// what to do in each example, and what must happen (the same selectors serve both versions)
const DESKTOP = {
  '1-landing': async ({ f, shown }) => {
    await f.click('button:has-text("React Native")');
    await f.click('button[title="violet"]');
    await f.waitForTimeout(300);
    return (await shown('npm install @kbach/react-native')) && (await f.locator('text=bg-violet-6').count()) > 0;
  },
  '2-product': async ({ f, shown }) => {
    await f.click('button[aria-label="Sand"]');
    await f.click('button:has-text("Read more")');
    await f.click('button[aria-label="One more"]');
    await f.waitForTimeout(300);
    return (await shown('Color: Sand')) && (await shown('Show less')) && (await shown('$498'));
  },
  '3-navbar': async ({ f, shown }) => {
    await f.click('button:has-text("Products")');
    await f.waitForTimeout(300);
    const open = await shown('Connect the tools you already use');
    await f.press('body', 'Escape');
    await f.waitForTimeout(200);
    return open && !(await shown('Connect the tools you already use'));
  },
  '4-pricing': async ({ f, shown }) => {
    await f.click('button:has-text("Yearly")');
    await f.waitForTimeout(400);
    return (await shown('$15')) && (await shown('Billed $180 a year'));
  },
  '5-signup': async ({ f, shown }) => {
    // empty: the browser marks the fields, and the email's message shows
    await f.click('button:has-text("Create account")');
    await f.waitForTimeout(500);
    const said = await shown('Enter an email address');
    await f.fill('input[name="name"]', 'Sokha Kim');
    await f.fill('input[name="email"]', 'sokha@example.com');
    await f.fill('input[name="password"]', 'Kbach-2026!');
    const strong = await shown('Strong');
    await f.click('text=I agree to the');
    await f.click('button:has-text("Create account")');
    await f.waitForTimeout(1300);
    return said && strong && (await shown('Check your inbox')) && (await shown('sokha@example.com'));
  },
  '6-dashboard': async ({ f }) => {
    await f.click('button:has-text("2025")');
    await f.waitForTimeout(700);
    return f.evaluate(() => document.body.textContent.includes('$18k') && !document.body.textContent.includes('$26k'));
  },
  '7-blog': async ({ f }) => {
    await f.click('button:has-text("Engineering")');
    await f.waitForTimeout(500);
    const shownPosts = await f.$$eval('article', (a) => a.filter((x) => x.offsetParent).length);
    await f.click('button[aria-label="Save"] >> nth=0');
    return shownPosts === 2 && (await f.locator('button[aria-label="Saved"]').count()) === 1;
  },
  '8-todo': async ({ f, shown }) => {
    await f.fill('input[placeholder^="Add a task"]', 'Water the plants');
    await f.press('input[placeholder^="Add a task"]', 'Enter');
    await f.click('button[aria-label="Mark as done"] >> nth=0');
    await f.waitForTimeout(300);
    const added = (await shown('Water the plants')) && (await shown('2 of 5 done'));
    await f.click('button:has-text("Done")');
    await f.waitForTimeout(200);
    return added && (await f.$$eval('li button[aria-label="Mark as to do"]', (x) => x.length)) === 2;
  },
  '9-tabs': async ({ f, shown }) => {
    await f.click('[role="tab"]:has-text("Billing")');
    await f.waitForTimeout(300);
    const billing = (await shown('Card ending in 4242')) && !(await f.locator('input[value="Sokha Kim"], input >> nth=0').first().isVisible());
    await f.press('[role="tab"]:has-text("Billing")', 'ArrowLeft');
    await f.waitForTimeout(300);
    const arrow = await shown('Weekly digest');
    await f.click('button:has-text("What happens to my work")');
    await f.waitForTimeout(400);
    const faq = await f.getAttribute('button:has-text("What happens to my work")', 'aria-expanded');
    return billing && arrow && faq === 'true' && (await shown('It stays yours'));
  },
  '10-chat': async ({ f, shown }) => {
    await f.fill('input[placeholder="Write a message"]', 'See you at three');
    await f.press('input[placeholder="Write a message"]', 'Enter');
    await f.waitForTimeout(2400);
    const replied = await f.evaluate(() => ['Love it.', 'Ha, same here.', 'Let me check and get back to you.', 'Sounds good to me 👍'].some((t) => document.body.textContent.includes(t)));
    return (await shown('See you at three')) && replied;
  },
  '11-theme': async ({ f }) => {
    const bg = () => f.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await bg();
    await f.click('button:has-text("Dark")');
    await f.waitForTimeout(500);
    const dark = await f.evaluate(() => document.documentElement.classList.contains('dark'));
    const darkBg = await bg();
    await f.click('button:has-text("Light")');
    await f.waitForTimeout(500);
    return dark && darkBg !== light && !(await f.evaluate(() => document.documentElement.classList.contains('dark')));
  },
  '12-animations': async ({ f }) => {
    await f.click('button:has-text("Replay the entrance")');
    await f.waitForTimeout(900);
    // the cards are as wide as their column (no figure margin) and back in place
    return f.$$eval('figure', (fs) => fs.length === 9 && fs.every((x) => getComputedStyle(x).marginLeft === '0px' && getComputedStyle(x).opacity === '1'));
  },
  '13-colors': async ({ f, shown }) => {
    await f.click('button[aria-label="rose 6"]');
    await f.waitForTimeout(900);
    return (await shown('rose-6')) && (await shown('#f43f5e'));
  },
};

// at a phone's width, where the layout changes
const PHONE = {
  '3-navbar': async ({ f, shown }) => {
    await f.click('button[aria-label="Menu"]');
    await f.waitForTimeout(500);
    return shown('Sign out');
  },
  '6-dashboard': async ({ f, shown }) => {
    const hidden = !(await shown('Wholesale portal'));
    await f.click('button[aria-label="Open the menu"]');
    await f.waitForTimeout(400);
    return hidden && (await shown('Wholesale portal'));
  },
  '10-chat': async ({ f, shown }) => {
    const chatFirst = !(await shown('Mony Ouk'));
    await f.click('button[aria-label="Back to messages"]');
    await f.waitForTimeout(300);
    return chatFirst && (await shown('Mony Ouk'));
  },
};

for (const [size, steps] of [['desktop', DESKTOP], ['phone', PHONE]]) {
  // a phone: the playground shows the preview alone, the canvas as wide as the phone
  const ctx = await b.newContext(size === 'phone' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 2200, height: 1100 } });
  const p = await ctx.newPage();
  if (size === 'desktop') {
    await p.goto(BASE + '/playground', { waitUntil: 'networkidle' });
  }
  for (const [id, run] of Object.entries(steps)) {
    for (const kind of ['html', 'react']) {
      const page = await open(p, id, kind);
      let ok = false;
      let why = '';
      try {
        ok = await run(page);
      } catch (e) {
        why = ' (' + e.message.split('\n')[0] + ')';
      }
      const errors = await page.errors();
      check(ok && errors === '0', `${size}, ${id} (${kind === 'react' ? 'React' : 'HTML'}): works${why}${errors !== '0' ? ', console errors: ' + errors : ''}`);
    }
  }
  await ctx.close();
}

await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
