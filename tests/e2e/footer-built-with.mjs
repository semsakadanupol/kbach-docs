// The footer's "Built with" row (2026-11-27): what the site is made with, each with its mark and a
// tooltip saying what it does here; on a phone it wraps, never scrolls.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const U = 'http://localhost:5176';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const row = () =>
  p.$$eval('footer ul[aria-label] li a', (as) =>
    as.map((a) => ({ name: a.textContent.trim(), title: a.title, href: a.getAttribute('href'), icon: !!a.querySelector('svg, img'), newTab: a.target === '_blank' })),
  );

await p.goto(U + '/introduction', { waitUntil: 'networkidle' });
const items = await row();
const names = items.map((i) => i.name);
check(['Kbach', 'Next.js', 'React', 'TypeScript', 'CodeMirror', 'Prettier', 'Vercel'].every((n) => names.includes(n)), 'the footer lists what the site is built with: ' + names.join(', '));
check(items.every((i) => i.icon && i.title.startsWith(i.name + ': ')), 'each has its mark and a tooltip saying what it does (' + items[3]?.title + ')');
check(items.filter((i) => i.name !== 'Kbach').every((i) => /^https:/.test(i.href) && i.newTab) && items.find((i) => i.name === 'Kbach').href === '/introduction', 'the tools open their sites in a new tab; Kbach opens its own docs');

await p.setViewportSize({ width: 390, height: 844 });
await p.goto(U + '/', { waitUntil: 'networkidle' });
const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const fits = await p.$eval('footer ul[aria-label]', (u) => u.getBoundingClientRect().right <= window.innerWidth);
check(over <= 0 && fits, 'on a phone the row wraps inside the page');

await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
