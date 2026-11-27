// The playground's ease-of-use features, in real Chromium.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { strFromU8, unzipSync } from 'fflate';
import { cdnPage, openExample } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);

const f = () => p.frames().find((x) => x !== p.mainFrame() && x.url() === 'about:srcdoc');
const inCanvas = async (fn, arg) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await f().evaluate(fn, arg);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
const box = (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
const code = 'section[aria-label="Code"]';
const out = 'section[aria-label="Output"]';
const doc = () => p.evaluate(() => localStorage.getItem('kbach-playground-code'));
const setFiles = async (htmlCode, scriptCode) => {
  await p.click('button[role="tab"]:has-text("script")');
  await p.fill('.cm-editor:visible .cm-content', scriptCode);
  await p.click('button[role="tab"]:has-text("index.html")');
  // a whole page, as HTML mode has one: Kbach from its CDN script (a snippet alone would have none)
  await p.fill('.cm-editor:visible .cm-content', cdnPage(htmlCode));
  await p.waitForTimeout(1300);
};
const statusText = () => p.$$eval('[role="status"]', (els) => els.map((e) => e.textContent).join(' | '));

// --- always full screen, the code beside the preview ---
let c = await box(code);
let o = await box(out);
check(o.x > c.x + c.w - 1 && Math.abs(o.y - c.y) <= 1 && Math.abs(o.h - c.h) <= 1 && c.y + c.h >= 1000 - 16, 'side by side: code and preview next to each other, both down to the bottom of the window (' + JSON.stringify({ c, o }) + ')');
check(!(await p.$('button[aria-label="Side by side"], button[aria-label="Stacked"]')), 'no old Stacked / Side by side buttons (the Layout menu has the choices)');
const handle = await p.$('[role="separator"]');
const hb = await handle.boundingBox();
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.down();
await p.mouse.move(hb.x + hb.width / 2 + 120, hb.y + hb.height / 2, { steps: 5 });
await p.mouse.up();
const c2 = await box(code);
check(Math.abs(c2.w - c.w - 120) <= 3, 'dragging the bar widens the code (' + c.w + ' → ' + c2.w + ')');
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(800);
// saved as a whole percent of the window, so within 1% of it
check(Math.abs((await box(code)).w - c2.w) <= 15, 'the width is remembered');
const narrow = await b.newPage({ viewport: { width: 700, height: 900 } });
await narrow.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await narrow.waitForTimeout(800);
const n = await narrow.evaluate(() => {
  const cd = document.querySelector('section[aria-label="Code"]').getBoundingClientRect();
  const op = document.querySelector('section[aria-label="Output"]').getBoundingClientRect();
  return { stacked: op.top >= cd.bottom, fits: Math.round(op.bottom) <= innerHeight };
});
check(n.stacked && n.fits, 'on a narrow window the preview goes under the code, still within the window (' + JSON.stringify(n) + ')');
await narrow.close();

// --- scroll memory ---
const long = '<main class="space-y-6 p-6">' + Array.from({ length: 30 }, (_, i) => `<p id="p${i}" class="text-lg">Paragraph ${i}</p>`).join('') + '</main>';
await setFiles(long, 'console.log("run");');
await p.$eval(out, (el) => el.scrollIntoView({ block: 'end' }));
await inCanvas(() => document.getElementById('p20').scrollIntoView());
await p.waitForTimeout(300);
// (the CDN script styles the page as it loads: wait for the paragraphs' spacing, then scroll)
for (let i = 0; i < 60 && (await inCanvas(() => getComputedStyle(document.getElementById('p1')).marginTop)) === '0px'; i++) await p.waitForTimeout(100);
await inCanvas(() => document.getElementById('p20').scrollIntoView());
await p.waitForTimeout(300);
const y1 = await inCanvas(() => Math.round(scrollY));
await p.click('button[role="tab"]:has-text("script")');
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+End');
await p.keyboard.type('\n// a comment');
await p.waitForTimeout(1600);
const y2 = await inCanvas(() => Math.round(scrollY));
check(y1 > 300 && Math.abs(y2 - y1) <= 2, 'a re-run keeps the preview where it was scrolled (' + y1 + ' → ' + y2 + ')');

// --- inline errors ---
await p.fill('.cm-editor:visible .cm-content', 'const a = 1;\nconst b = 2;\nnotThere();\nconsole.log(a + b);');
await p.waitForTimeout(1600);
const errLine = await p.$$eval('.cm-editor:visible .cm-kb-errline', (ls) => ls.map((l) => l.textContent));
const errMsg = await p.$$eval('.cm-editor:visible .cm-kb-errmsg', (ms) => ms.map((m) => m.textContent));
check(errLine.length === 1 && errLine[0].startsWith('notThere();') && /ReferenceError: notThere is not defined/.test(errMsg[0]), 'a script error shows on its line in the editor: ' + errMsg[0]);
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+Home');
await p.keyboard.type('function notThere() {}\n');
await p.waitForTimeout(1600);
check((await p.$$('.cm-editor:visible .cm-kb-errline')).length === 0, 'and it goes once the next run has no error');
await p.fill('.cm-editor:visible .cm-content', '');
await p.click('button[role="tab"]:has-text("index.html")');

// --- fix all ---
await setFiles('<div class="bg-blue-500 p-4 text-red-600 rounded-xl">x</div>', '');
const fixBtn = p.locator('button:has-text("Fix all 2")');
check((await fixBtn.count()) === 1, 'two Tailwind CSS shades: a "Fix all 2" button');
await fixBtn.click();
await p.waitForTimeout(700);
check((await doc()).includes('bg-blue-6 p-4 text-red-7'), 'Fix all replaces both: ' + (await doc()));

// --- auto-run off ---
await p.click('[role="switch"]:has-text("Auto")');
await p.waitForTimeout(200);
await setFiles('<h1 id="t" class="text-3xl">Before</h1>', '');
await p.click('button[aria-label^="Run"]'); // show it
await p.waitForTimeout(800);
await p.fill('.cm-editor:visible .cm-content', '<h1 id="t" class="text-3xl">After</h1>');
await p.waitForTimeout(1200);
check((await inCanvas(() => document.getElementById('t')?.textContent)) === 'Before', 'auto-run off: typing leaves the preview as it was');
check((await p.getAttribute('button[aria-label^="Run"]', 'aria-label')) === 'Run (there are changes)', 'and Run says there are changes waiting');
// Reload: the page as it last ran, fresh; the waiting change still waits
await p.click('button[aria-label="Reload"]');
await p.waitForTimeout(900);
check((await inCanvas(() => document.getElementById('t')?.textContent)) === 'Before' && (await p.getAttribute('button[aria-label^="Run"]', 'aria-label')) === 'Run (there are changes)', 'Reload runs the page as it was; the change still waits for Run');
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+Enter');
await p.waitForTimeout(900);
check((await inCanvas(() => document.getElementById('t')?.textContent)) === 'After' && (await p.getAttribute('button[aria-label^="Run"]', 'aria-label')) === 'Run', 'Ctrl+Enter runs it, and the waiting mark goes');
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(800);
check((await p.getAttribute('[role="switch"]', 'aria-checked')) === 'false', 'the setting is remembered');
await p.click('[role="switch"]:has-text("Auto")'); // back on
await p.waitForTimeout(200);

// --- undo after resetting to the example ---
await setFiles('<p class="text-sky-7">My own work</p>', '');
await p.click('button[aria-label="More"]');
await p.click('[role="menuitem"]:has-text("Reset")');
await p.waitForTimeout(400);
const st = await statusText();
check(st.includes('Loaded Landing page') && (await p.locator('[role="status"] button:has-text("Undo")').count()) === 1, 'resetting your code to the example says so, with Undo: ' + st);
await p.click('[role="status"] button:has-text("Undo")');
await p.waitForTimeout(700);
check((await doc()).includes('My own work'), 'Undo puts your code back');

// --- export (a TypeScript test page, opened as a shared link) ---
await openExample(p, 'http://localhost:5176', 'checklist');
await p.waitForTimeout(700);
await p.click('button[aria-label="More"]');
const dl = p.waitForEvent('download');
await p.click('[role="menuitem"]:has-text("Download")');
const file = await dl;
// Download is a .zip, each file on its own (2026-11-27): a plain page's index.html, kbach.config.js,
// the script and style.css; TypeScript as script.ts and the script.js it compiles to (index.html loads that)
const unzipped = async (download) => Object.fromEntries(Object.entries(unzipSync(readFileSync(await download.path()))).map(([k, v]) => [k, strFromU8(v)]));
const zip = await unzipped(file);
const inZip = (name) => zip['kbach-playground/' + name] ?? '';
// not one of the playground's examples (it came from a link): a general name
check(file.suggestedFilename() === 'kbach-playground.zip', 'Download names the file (' + file.suggestedFilename() + ')');
check(['index.html', 'kbach.config.js', 'kbach.css', 'script.ts', 'script.js', 'style.css', 'README.md'].every((n) => ('kbach-playground/' + n) in zip), 'the .zip has the page’s files apart, in one folder: ' + Object.keys(zip).join(', '));
check(
  inZip('index.html').includes('<script src="kbach.config.js"></script>') && inZip('index.html').includes('<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>') && inZip('index.html').includes('<script type="module" src="script.js"></script>') && inZip('index.html').includes('<link rel="stylesheet" href="style.css" />') && inZip('index.html').includes('<ul id="list"'),
  'index.html loads kbach.config.js, Kbach’s CDN script, style.css and script.js (what script.ts compiles to)',
);
check(inZip('kbach.config.js').includes('window.kbachConfig = {') && inZip('index.html').includes('<link rel="stylesheet" href="kbach.css" />'), 'kbach.config.js sets window.kbachConfig, and index.html loads kbach.css');
check(inZip('kbach.css').startsWith('/* kbach:start */') && inZip('kbach.css').includes('.bg-amber-6') && !inZip('style.css').includes('.bg-amber-6') && inZip('style.css').includes('padding: 1.5rem'), 'kbach.css has the CSS Kbach generated for the page’s classes (.bg-amber-6); style.css only the preview’s page basics');
check(inZip('script.ts').includes('interface Step') && !inZip('script.js').includes('__kbLoop') && !inZip('script.js').includes('interface Step') && inZip('script.js').includes('function render()'), 'script.ts as written, and script.js compiled from it, without the playground\'s loop guard');
// a React page: a Vite project, as the Installation page sets one up
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("React")');
await p.waitForTimeout(2500);
await p.click('button[aria-label="More"]');
const reactDl = p.waitForEvent('download');
await p.click('[role="menuitem"]:has-text("Download")');
const vite = await unzipped(await reactDl);
const v = (name) => vite['kbach-playground/' + name] ?? '';
const pkg = JSON.parse(v('package.json') || '{}');
check(['package.json', 'vite.config.ts', 'index.html', 'src/main.tsx', 'src/App.tsx', 'src/kbach.css', 'kbach.config.js', '.gitignore', 'README.md'].every((n) => ('kbach-playground/' + n) in vite), 'a React page downloads as a Vite project: ' + Object.keys(vite).join(', '));
check(pkg.scripts?.dev === 'vite' && /^\^1\./.test(pkg.dependencies?.['@kbach/react'] ?? '') && pkg.dependencies?.react && pkg.devDependencies?.vite && pkg.devDependencies?.['@vitejs/plugin-react'], 'its package.json: npm run dev, @kbach/react, React and Vite ' + JSON.stringify(pkg.dependencies));
check(v('vite.config.ts').includes("import { kbach } from '@kbach/react/vite'") && v('vite.config.ts').includes('plugins: [kbach(), react()]') && v('src/main.tsx').includes("import './kbach.css';") && v('index.html').includes('<script type="module" src="/src/main.tsx"></script>'), 'the plugin in vite.config.ts, kbach.css imported in src/main.tsx, which index.html loads');
check(v('src/kbach.css').startsWith('/* kbach:start */') && v('kbach.config.js').includes('module.exports = {') && v('src/App.tsx').includes('export default function App'), 'src/kbach.css as the plugin writes it, kbach.config.js the plugin’s kind, src/App.tsx the page');
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("HTML")');
await p.waitForTimeout(1500);
await p.click('button[aria-label="More"]');
const popup = p.waitForEvent('popup');
await p.click('[role="menuitem"]:has-text("Open in a new tab")');
const tab = await popup;
await tab.waitForLoadState();
await tab.waitForTimeout(1200);
const inner = tab.frames().find((x) => x !== tab.mainFrame());
const tabInfo = {
  sandbox: await tab.$eval('iframe', (fr) => fr.getAttribute('sandbox')),
  title: await inner.evaluate(() => document.querySelector('h1')?.textContent),
  ranScript: await inner.evaluate(() => document.querySelectorAll('#list li').length),
  outerScripts: await tab.$$eval('script', (s) => s.length),
};
check(tabInfo.title === 'Set up Kbach' && tabInfo.ranScript === 5, 'Open in a new tab shows the page, its script running (' + JSON.stringify(tabInfo) + ')');
check(!tabInfo.sandbox.includes('allow-same-origin') && tabInfo.outerScripts === 0, 'inside a sandboxed frame: the script can\'t reach this site');
await tab.close();

// --- copy the CSS ---
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("kbach.css")');
await p.click('section[aria-label="Code"] button[aria-label="Copy code"]');
await p.waitForTimeout(200);
const clip = await p.evaluate(() => navigator.clipboard.readText());
check(clip.includes('.bg-amber-6') && clip.startsWith('/* kbach:start */'), 'the kbach.css tab copies the file, as the build plugin writes it');

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
