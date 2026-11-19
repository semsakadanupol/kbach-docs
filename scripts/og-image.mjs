// Makes public/og.png, the picture a link to the docs shows when it's shared
// (Open Graph / Twitter card, 1200×630), in the site's own look: the logo,
// the headline and the colors from kbach.config.js. Run it again after
// changing any of those:
//
//   node scripts/og-image.mjs
//
// It loads Fraunces and Geist from Google Fonts, so it needs the network.
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = 'data:image/png;base64,' + readFileSync(join(root, 'public', 'kbach-logo-256.png')).toString('base64');

const chips = ['flex items-center', 'md:grid-cols-3', 'dark:bg-gray-11', 'hover:scale-105', 'rounded-2xl'];

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #faf7f0; font-family: Geist, sans-serif; color: #1f272b; position: relative; }
  .glow { position: absolute; inset: 0; background:
      radial-gradient(60% 70% at 85% 10%, rgb(199 162 93 / .28), transparent 70%),
      radial-gradient(40% 50% at 0% 100%, rgb(199 162 93 / .14), transparent 70%); }
  .grid { position: absolute; inset: 0; background-image:
      linear-gradient(rgb(199 162 93 / .10) 1px, transparent 1px),
      linear-gradient(90deg, rgb(199 162 93 / .10) 1px, transparent 1px);
    background-size: 48px 48px; mask-image: radial-gradient(70% 80% at 70% 30%, #000, transparent); }
  .wrap { position: absolute; inset: 0; padding: 72px 80px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand img { width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 6px 20px rgb(135 100 47 / .25), 0 0 0 1px rgb(199 162 93 / .4); }
  .brand span { font-family: Fraunces, serif; font-size: 40px; font-weight: 600; letter-spacing: -.01em; }
  .brand em { margin-left: 6px; font-style: normal; font-family: Geist; font-size: 22px; color: #5b676d; font-weight: 500; }
  h1 { margin-top: 44px; max-width: 760px; font-family: Fraunces, serif; font-weight: 600; font-size: 68px; line-height: 1.04; letter-spacing: -.035em; }
  h1 b { display: block; font-weight: 600; color: #b08a45; }
  p { margin-top: 22px; font-size: 25px; line-height: 1.45; color: #5b676d; max-width: 820px; }
  .chips { position: absolute; right: 64px; top: 150px; display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
  .chip { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: 500; padding: 9px 16px; border-radius: 12px; background: #fff; border: 1px solid #e4dccb; box-shadow: 0 4px 14px rgb(31 39 43 / .06); color: #2e393f; }
  .chip:nth-child(odd) { transform: rotate(-3deg) translateX(-24px); }
  .chip:nth-child(even) { transform: rotate(2.5deg); }
  .foot { margin-top: auto; display: flex; gap: 14px; font-size: 21px; color: #87642f; font-weight: 500; }
  .foot span { padding: 6px 14px; border-radius: 999px; background: rgb(199 162 93 / .14); border: 1px solid rgb(199 162 93 / .35); }
</style></head>
<body>
  <div class="glow"></div><div class="grid"></div>
  <div class="chips">${chips.map((c) => `<div class="chip">${c}</div>`).join('')}</div>
  <div class="wrap">
    <div class="brand"><img src="${logo}" alt=""><span>Kbach</span><em>Docs</em></div>
    <h1>Write a class once.<b>Style web, iOS, Android and HTML.</b></h1>
    <p>Short class names for React, React Native and plain HTML pages, read by one Rust engine.</p>
    <div class="foot"><span>React</span><span>React Native</span><span>Expo</span><span>Plain HTML</span></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await Promise.all(['600 68px Fraunces', '500 21px Geist', '500 20px "Geist Mono"'].map((f) => document.fonts.load(f)));
  await document.fonts.ready;
});
await page.screenshot({ path: join(root, 'public', 'og.png') });
await browser.close();
console.log('wrote public/og.png');
