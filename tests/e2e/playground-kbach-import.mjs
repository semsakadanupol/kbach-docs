// `import … from '@kbach/react'` in the playground (2026-11-27): in React mode the canvas gets the
// package's own code (src/playground/kbachModule.ts) through its import map, with the playground's
// kbach.config.js applied. An HTML page is a plain page: no packages (an import is flagged), Kbach is
// its CDN script's window.Kbach. A sandboxed page gets an in-memory localStorage (canvas-storage.js),
// which Kbach's dark mode store uses.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const encode = (text) => Buffer.from(text, 'utf-8').toString('base64url');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const canvas = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
const status = async () => ({
  problems: await p.$eval('section[aria-label="Code"] button[title$="problems"], section[aria-label="Code"] button[title="No problems"]', (e) => e.textContent.replace(/\s+/g, '')),
  errors: await p.$eval('button:has-text("Console")', (e) => e.querySelector('.bg-red-6')?.textContent ?? '0'),
});
const open = async (hash) => {
  await p.goto('about:blank');
  await p.goto(BASE + '/playground?kbach-import' + hash, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
};

const config = "module.exports = { darkMode: 'class', extend: { colors: { brand: '#123456' } } };\n";

// --- React: clsx, kb, useTheme, useColors and the dark mode toggle, from the real package
const reactPage = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>React page</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n';
const app = `import { useState } from 'react';
import { clsx, kb, useColors, useTheme } from '@kbach/react';

export default function App() {
  const [on, setOn] = useState(false);
  const { isDark, toggle } = useTheme();
  const colors = useColors();
  return (
    <main className={kb('p-6')}>
      <button id="t" onClick={() => setOn(!on)} className={clsx('rounded-lg px-4 py-2', on ? 'bg-emerald-6 text-white' : 'bg-gray-2', { 'font-bold': on })}>Toggle</button>
      <button id="d" onClick={toggle}>Dark</button>
      <p id="mode">{isDark ? 'dark' : 'light'}</p>
      <p id="brand">{String(colors.brand)}</p>
    </main>
  );
}
`;
await open('#code=' + encode(reactPage) + '&js=' + encode(app) + '&config=' + encode(config) + '&mode=react');
let s = await status();
await canvas().click('#t');
await p.waitForTimeout(800);
const r = await canvas().evaluate(() => {
  const t = document.getElementById('t');
  return { cls: t.className, bg: getComputedStyle(t).backgroundColor, weight: getComputedStyle(t).fontWeight, pad: getComputedStyle(document.querySelector('main')).paddingTop, brand: document.getElementById('brand').textContent, mode: document.getElementById('mode').textContent };
});
check(
  s.problems === '⚠0✕0problems' && s.errors === '0' && r.cls === 'rounded-lg px-4 py-2 bg-emerald-6 text-white font-bold' && r.bg === 'rgb(16, 185, 129)' && r.weight === '700' && r.pad === '24px',
  'React: clsx and kb from @kbach/react give the classes, and the playground styles them ' + JSON.stringify({ ...s, ...r }),
);
check(r.brand.toLowerCase() === '#123456' && r.mode === 'light', "useColors() sees kbach.config.js's brand, useTheme() the mode " + JSON.stringify({ brand: r.brand, mode: r.mode }));
await canvas().click('#d');
await p.waitForTimeout(400);
const dark = await canvas().evaluate(() => ({ mode: document.getElementById('mode').textContent, html: document.documentElement.classList.contains('dark'), saved: localStorage.getItem('kbach-theme') }));
check(dark.mode === 'dark' && dark.html && dark.saved !== null, "useTheme().toggle() turns the page dark (the dark class on <html>), and the store saves it in the canvas's localStorage " + JSON.stringify(dark));

// --- the moon button above the preview and the package's dark mode store agree (regression: the
// store applied the system's mode as it loaded, so the moon button stopped working on React pages)
await open('#code=' + encode(reactPage) + '&js=' + encode(app) + '&config=' + encode(config) + '&mode=react');
await p.click('button[aria-label="Preview in dark mode"]');
await p.waitForTimeout(500);
const moon = await canvas().evaluate(() => ({ mode: document.getElementById('mode').textContent, html: document.documentElement.classList.contains('dark') }));
await p.click('button[aria-label="Reload"]');
await p.waitForTimeout(3000);
const reloaded = await canvas().evaluate(() => ({ mode: document.getElementById('mode')?.textContent, html: document.documentElement.classList.contains('dark') }));
check(moon.mode === 'dark' && moon.html && reloaded.mode === 'dark' && reloaded.html, 'the moon button turns the page dark and useTheme() follows; a reload stays dark ' + JSON.stringify({ moon, reloaded }));
await p.click('button[aria-label="Preview in light mode"]');

// --- an HTML page is a plain page (2026-11-27): no packages, Kbach from its CDN script as
// window.Kbach. An import is flagged on its line (and gets no @kbach/react); window.Kbach works.
// (An older link: its &config= goes into the page's <head>, before the CDN script.)
const htmlPage = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>Page</title>\n  </head>\n  <body>\n    <p id="x">…</p>\n  </body>\n</html>\n';
const importing = "import { clsx } from '@kbach/react';\n\ndocument.getElementById('x').className = clsx('text-rose-6');\n";
await open('#code=' + encode(htmlPage) + '&js=' + encode(importing) + '&config=' + encode(config));
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("script.js")');
await p.waitForTimeout(400);
const flagged = await p.$$eval('.cm-editor:visible .cm-kb-errmsg', (ms) => ms.map((m) => m.textContent));
const map = await canvas().evaluate(() => document.querySelector('script[type="importmap"]')?.textContent ?? '');
check(flagged.some((m) => /no packages/.test(m) && /window\.Kbach/.test(m)) && !map.includes('@kbach/react'), "HTML: an import from @kbach/react is flagged on its line (use window.Kbach), and the page gets none: " + flagged.join(' | '));
const script = "await Kbach.ready;\nconst x = document.getElementById('x');\nx.className = 'text-brand font-semibold';\nx.textContent = 'from the CDN';\nKbach.setMode('dark');\nlocalStorage.setItem('seen', 'yes');\nx.dataset.seen = localStorage.getItem('seen');\n";
await open('#code=' + encode(htmlPage) + '&js=' + encode(script) + '&config=' + encode(config));
s = await status();
let h;
for (let i = 0; i < 60; i++) {
  h = await canvas().evaluate(() => {
    const x = document.getElementById('x');
    return { text: x.textContent, color: getComputedStyle(x).color, dark: document.documentElement.classList.contains('dark'), seen: x.dataset.seen, kbach: typeof window.Kbach };
  });
  if (h.color === 'rgb(18, 52, 86)') break;
  await p.waitForTimeout(100);
}
check(s.problems === '⚠0✕0problems' && s.errors === '0' && h.kbach === 'object' && h.text === 'from the CDN' && h.color === 'rgb(18, 52, 86)', "HTML: the page's script uses window.Kbach; a class it sets gets the config's brand (#123456, from the old link's &config) " + JSON.stringify({ ...s, ...h }));
check(h.dark, 'Kbach.setMode(\'dark\') puts the page in dark mode (darkMode: \'class\')');
check(h.seen === 'yes', 'localStorage works in the canvas (in memory, canvas-storage.js: the CDN script needs it too)');

// --- without the import, no @kbach/react in the page (the import map stays as small as it was)
await open('#code=' + encode(htmlPage) + '&js=' + encode("document.getElementById('x').textContent = 'plain';"));
const plain = await canvas().evaluate(() => ({ map: document.querySelector('script[type="importmap"]')?.textContent ?? '', text: document.getElementById('x').textContent }));
check(plain.text === 'plain' && !plain.map.includes('@kbach/react'), 'a page that doesn’t import it gets no @kbach/react');

await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
