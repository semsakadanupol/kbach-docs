// Makes the playground examples' pictures for the examples gallery
// (components/ExamplesGallery.tsx): public/playground/<id>.jpg and <id>-dark.jpg, each
// example as the real playground shows it on a 1280×800 desktop, at half size. Run it after
// adding or changing an example, on a fresh build:
//
//   npm run build && node scripts/example-thumbnails.mjs
//
// It serves out/ itself (port 5179) and loads the examples' fonts from Google Fonts, so it
// needs the network. tests/e2e/playground-examples.mjs fails when an example has no picture.
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'playground');
mkdirSync(outDir, { recursive: true });
const PORT = 5179;
const server = await serve(join(root, 'out'), PORT);

// the example ids, from the gallery's own list (the order doesn't matter here)
const { readFileSync } = await import('fs');
const ids = [...readFileSync(join(root, 'src', 'playground', 'examples.ts'), 'utf8').matchAll(/\bid: '([\w-]+)'/g)].map((m) => m[1]);

const browser = await chromium.launch();
// wide and tall enough that the preview shows a 1280×800 desktop at full size; half-size pictures
const page = await browser.newPage({ viewport: { width: 2700, height: 1150 }, deviceScaleFactor: 0.5 });
for (const id of ids) {
  // (a query of its own: changing only the #hash would keep the page that is already open)
  await page.goto(`http://localhost:${PORT}/playground?thumbnail=${id}#example=${id}`, { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="Desktop"]').click();
  for (const dark of [false, true]) {
    const toggle = page.locator(dark ? 'button[aria-label="Preview in dark mode"]' : 'button[aria-label="Preview in light mode"]');
    if (await toggle.count()) await toggle.click();
    // the page's entrance animations and its script (the color explorer builds its grid)
    await page.waitForTimeout(2500);
    const frame = page.locator('iframe[title="Playground canvas"]');
    const box = await frame.boundingBox();
    if (Math.round(box.width) !== 1280) console.warn(`${id}: the preview is ${Math.round(box.width)}px wide, not 1280`);
    await frame.screenshot({ path: join(outDir, id + (dark ? '-dark' : '') + '.jpg'), type: 'jpeg', quality: 78, scale: 'device' });
    console.log('wrote public/playground/' + id + (dark ? '-dark' : '') + '.jpg');
  }
}
await browser.close();
server.close();
