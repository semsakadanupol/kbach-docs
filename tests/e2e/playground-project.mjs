// The playground as a project: the same-tab link and its logo button, the Explorer, kbach.config.js (a
// plain HTML page's window.kbachConfig, loaded before the CDN script; React's module.exports), the real kbach.css, inline
// <script>/<style> in index.html, the VS Code look.
import { chromium } from 'playwright';
import { cdnPage } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));

const frame = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
const inCanvas = async (fn, arg) => {
  for (let i = 0; i < 60; i++) {
    try {
      return await frame().evaluate(fn, arg);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
const openFile = (name) => p.click(`[role="tablist"][aria-label="Files"] [role="tab"]:has-text("${name}")`);
const editorText = () => p.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent).join('\n'));
const setEditor = async (text) => {
  await p.fill('.cm-editor:visible .cm-content', text);
  await p.waitForTimeout(1200);
};
const lintFlags = () => p.$$eval('.cm-editor:visible .cm-lintRange-warning', (els) => els.map((e) => e.textContent));

// --- the docs open the playground in the same tab (2026-11-27; a new tab from 2026-11-26); its
// logo button goes back to the docs page it came from, else home
await p.goto(BASE + '/colors', { waitUntil: 'networkidle' });
const link = await p.$eval('header a[href="/playground"]', (a) => ({ target: a.target, rel: a.rel }));
check(!link.target && !link.rel, 'the header’s Playground link opens in the same tab ' + JSON.stringify(link));
const pagesBefore = await p.evaluate(() => history.length);
await p.click('header a[href="/playground"]');
await p.waitForURL(BASE + '/playground');
await p.waitForSelector('.cm-editor:visible .cm-content');
await p.waitForTimeout(800);
check(ctx.pages().length === 1 && new URL(p.url()).pathname === '/playground', 'the playground opens where the docs page was (one tab)');
const pagesThere = await p.evaluate(() => history.length);
// a few runs add nothing to the tab's history (an iframe navigated by srcdoc used to)
for (const n of [1, 2, 3]) {
  await p.click('button[aria-label="Reload"]');
  await p.waitForTimeout(500);
}
check((await p.evaluate(() => history.length)) === pagesThere && pagesThere === pagesBefore + 1, 'the playground is one step in the history, and three runs add none (' + pagesBefore + ' → ' + pagesThere + ')');
const logo = await p.$eval('button[aria-label="Back to the docs"]', (b) => ({ img: !!b.querySelector('img'), text: b.textContent.trim() }));
check(logo.img && logo.text === 'Playground', 'the header starts with Kbach’s logo and “Playground” ' + JSON.stringify(logo));
await p.click('button[aria-label="Back to the docs"]');
await p.waitForURL(BASE + '/colors');
await p.waitForTimeout(300);
check(new URL(p.url()).pathname === '/colors', 'the logo button goes back to the docs page the playground was opened from');
await p.goForward();
await p.waitForURL(BASE + '/playground');
check(new URL(p.url()).pathname === '/playground', 'a real step back: the browser’s Forward returns to the playground');
await p.goto(BASE + '/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1000);
await p.click('button[aria-label="Back to the docs"]');
await p.waitForURL(BASE + '/');
check(new URL(p.url()).pathname === '/', 'opened directly, the logo button goes to the home page');
await p.goto(BASE + '/playground', { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1000);

// --- the header names the example the code came from (the gallery button)
const title = await p.evaluate(() => document.querySelector('button[aria-haspopup="dialog"] .truncate.font-semibold').textContent);
check(title === 'Landing page', 'the gallery button names the example: Landing page (' + title + ')');

// --- VS Code: the tabs, the status bar in Kbach's gold (no Explorer side panel)
check(!(await p.$('nav[aria-label="Explorer"]')), 'there is no Explorer side panel');
const tabs = await p.$$eval('[role="tablist"][aria-label="Files"] [role="tab"]', (ts) => ts.map((x) => x.textContent.trim()));
check(tabs.length === 5 && tabs[2].includes('kbach.config.js') && tabs[3].includes('kbach.css') && tabs[4].includes('native-styles.js'), 'the tabs show the three files, then kbach.css and native-styles.js: ' + tabs.join(' / '));
const look = await p.evaluate(() => ({
  status: getComputedStyle(document.querySelector('section[aria-label="Code"] > div:last-of-type')).backgroundColor,
  color: getComputedStyle(document.querySelector('section[aria-label="Code"] > div:last-of-type')).color,
  editor: getComputedStyle(document.querySelector('.cm-editor:not([class*="hidden"])')).backgroundColor,
  activeTab: getComputedStyle(document.querySelector('[role="tab"][aria-selected="true"]')).backgroundColor,
}));
check(look.status === 'rgb(199, 162, 93)' && look.color === 'rgb(31, 26, 16)' && look.editor === 'rgb(255, 255, 255)' && look.activeTab === 'rgb(255, 255, 255)', 'the gold status bar with dark text; in light mode the Light editor and its open tab ' + JSON.stringify(look));
// dark mode: VS Code's Dark+ (the editor follows the site's mode)
await p.emulateMedia({ colorScheme: 'dark' });
await p.waitForTimeout(400);
const darkLook = await p.evaluate(() => ({
  editor: getComputedStyle(document.querySelector('.cm-editor:not([class*="hidden"])')).backgroundColor,
  activeTab: getComputedStyle(document.querySelector('[role="tab"][aria-selected="true"]')).backgroundColor,
  tag: getComputedStyle(document.querySelector('.cm-editor:not([class*="hidden"]) .cm-content')).color,
}));
check(darkLook.editor === 'rgb(30, 30, 30)' && darkLook.activeTab === 'rgb(30, 30, 30)', 'in dark mode the Dark+ editor and its open tab ' + JSON.stringify(darkLook));
await p.emulateMedia({ colorScheme: 'light' });
await p.waitForTimeout(300);
await openFile('kbach.config.js');
check((await p.getAttribute('[role="tab"][aria-selected="true"]', 'title'))?.startsWith('kbach.config.js'), 'clicking a tab opens its file');
// an HTML page's kbach.config.js is a plain page's script (2026-11-27): it sets window.kbachConfig,
// and index.html loads it before Kbach's CDN script
check((await editorText()).includes('window.kbachConfig = {'), 'an HTML page’s kbach.config.js sets window.kbachConfig');
await openFile('index.html');
const head = (await editorText()).split('</head>')[0];
check(head.indexOf('<script src="kbach.config.js"></script>') > 0 && head.indexOf('<script src="kbach.config.js"></script>') < head.indexOf('<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>'), 'and index.html loads it, then Kbach’s CDN script');

// --- kbach.css is the file a project gets
await openFile('kbach.css');
await p.waitForTimeout(300);
// the whole file, through Copy (the editor only draws the lines in view)
await p.click('section[aria-label="Code"] button[aria-label="Copy code"]');
await p.waitForTimeout(200);
const css = await p.evaluate(() => navigator.clipboard.readText());
check(css.startsWith('/* kbach:start */') && css.trimEnd().endsWith('/* kbach:end */') && css.includes('/* Generated by Kbach — do not edit */'), 'kbach.css has the plugin’s markers and header');
check(css.includes(':root {') && css.includes('--kb-dark-mode: class;') && /--spacing-[\w.]+: \d+px;/.test(css) && /--color-[\w-]+-rgb: \d+,\d+,\d+;/.test(css), 'kbach.css has :root with --kb-dark-mode and the spacing and color variables');
check(/var\(--spacing-[\w.]+\)/.test(css) && /rgba\(var\(--color-[\w-]+-rgb\)/.test(css), 'and the rules use them, as the build plugin writes them');
check(css.includes('box-sizing: border-box'), 'it starts with Kbach’s reset');

// --- kbach.config.js: a color of your own. The preview runs the CDN script (from jsDelivr), with
// kbach.config.js in place of its tag: a value that waits for its style polls for it.
const until = async (fn, ok, arg) => {
  let v;
  for (let i = 0; i < 80; i++) {
    v = await inCanvas(fn, arg);
    if (ok(v)) return v;
    await p.waitForTimeout(100);
  }
  return v;
};
const bgOf = (id) => getComputedStyle(document.getElementById(id)).backgroundColor;
await openFile('index.html');
await setEditor(cdnPage('<div id="brand" class="bg-brand p-4">brand</div>'));
// the landing page's kbach.config.js has a brand color (amber-6): bg-brand is a class
check((await lintFlags()).length === 0, 'bg-brand, from the example’s kbach.config.js, is a known class');
const brandBg = await until(bgOf, (v) => v === 'rgb(245, 158, 11)', 'brand');
check(brandBg === 'rgb(245, 158, 11)', 'and the CDN script gives it the config’s color, amber-6 (' + brandBg + ')');
await openFile('kbach.config.js');
await setEditor("window.kbachConfig = {\n  darkMode: 'class',\n  extend: { colors: { brand: '#ff0000', tide: '#0e7490' } },\n};");
const red = await until(bgOf, (v) => v === 'rgb(255, 0, 0)', 'brand');
check(red === 'rgb(255, 0, 0)', 'a brand color in kbach.config.js styles bg-brand on the page: a fresh page runs the file (' + red + ')');
await openFile('index.html');
await setEditor(cdnPage('<div id="brand" class="bg-brand bg-tide p-4">brand</div>'));
check((await lintFlags()).length === 0, 'a color added in kbach.config.js is known at once (bg-tide)');
// a config that isn't a plain object: an error on its line, the last good theme kept
await openFile('kbach.config.js');
const errMsgs = () => p.$$eval('.cm-editor:visible .cm-kb-errmsg', (ms) => ms.map((m) => m.textContent));
await setEditor('window.kbachConfig = {\n  extend: { colors: { brand: pick() } },\n};');
const cfgError = await errMsgs();
check(cfgError.some((m) => m.includes('plain object')), 'code in kbach.config.js shows an error on its line: ' + cfgError.join(' | '));
check(!!(await p.$('[role="tab"] [aria-label="(has an error)"]')), 'and its tab marks the file');
await setEditor("window.kbachConfig = {\n  darkMode: 'class',\n  extend: { colors: { brand: '#ff0000', tide: '#0e7490' } },\n};");
// the setup's mistakes, on their lines: no CDN script; no kbach.config.js; the config after the script
await openFile('index.html');
await setEditor('<!doctype html>\n<html lang="en">\n  <head>\n    <title>No Kbach</title>\n  </head>\n  <body>\n    <div class="p-4">x</div>\n  </body>\n</html>\n');
check((await errMsgs()).some((m) => m.includes('Kbach isn’t loaded') && m.includes('cdn.jsdelivr.net/npm/@kbach/browser')), 'a page without the CDN script says so, naming the script: ' + (await errMsgs()).join(' | '));
await setEditor('<!doctype html>\n<html lang="en">\n  <head>\n    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>\n  </head>\n  <body>\n    <div class="p-4">x</div>\n  </body>\n</html>\n');
check((await errMsgs()).some((m) => /kbach\.config\.js isn’t loaded/.test(m)), 'a page that doesn’t load kbach.config.js says so');
await setEditor('<!doctype html>\n<html lang="en">\n  <head>\n    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>\n    <script src="kbach.config.js"></script>\n  </head>\n  <body>\n    <div class="p-4">x</div>\n  </body>\n</html>\n');
check((await errMsgs()).some((m) => /before the Kbach script/.test(m)), 'kbach.config.js loaded after the script is flagged: it’s read once, as the script loads');

// --- darkMode 'media' follows the moon button: the CDN's prefers-color-scheme rules are switched
await openFile('kbach.config.js');
await setEditor("window.kbachConfig = {\n  darkMode: 'media',\n};");
await openFile('index.html');
await setEditor(cdnPage('<div id="d" class="bg-white dark:bg-black p-4">d</div>'));
const light = await until(bgOf, (v) => v === 'rgb(255, 255, 255)', 'd');
const moon = await p.getAttribute('button[aria-label^="Preview in"]', 'aria-label');
await p.click('button[aria-label^="Preview in"]');
const darkBg = await until(bgOf, (v) => v === 'rgb(0, 0, 0)', 'd');
check(light !== darkBg && darkBg === 'rgb(0, 0, 0)', "darkMode 'media': the moon button switches dark: classes too (" + moon + ': ' + light + ' → ' + darkBg + ')');
await p.click('button[aria-label^="Preview in"]');
await openFile('kbach.config.js');
await setEditor("window.kbachConfig = {\n  darkMode: 'attribute',\n};");
await until(bgOf, (v) => v === 'rgb(255, 255, 255)', 'd');
await p.click('button[aria-label^="Preview in"]');
const attrDark = await until(bgOf, (v) => v === 'rgb(0, 0, 0)', 'd');
check(attrDark === 'rgb(0, 0, 0)', "darkMode 'attribute' too (" + attrDark + ')');
await p.click('button[aria-label^="Preview in"]');

// --- Tab takes the highlighted suggestion
await openFile('index.html');
await setEditor('<div class=""></div>');
// the cursor is at the end of it (in <body>): back into class=""
await p.focus('.cm-editor:visible .cm-content');
await p.keyboard.press('End');
for (let i = 0; i < '"></div>'.length; i++) await p.keyboard.press('ArrowLeft');
await p.keyboard.type('bg-ro', { delay: 40 });
await p.waitForSelector('.cm-tooltip-autocomplete li[aria-selected]', { timeout: 4000 }).catch(() => {});
const picked = await p.$eval('.cm-tooltip-autocomplete li[aria-selected]', (li) => li.textContent).catch(() => '');
await p.waitForTimeout(150); // as a person would: CodeMirror ignores a key in the first 75ms after the list changes
await p.keyboard.press('Tab');
await p.waitForTimeout(300);
const line = await p.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent).find((t) => t.includes('<div')) ?? '');
check(!!picked && line.includes('class="' + picked.match(/^\S+/)[0] + '"'), 'Tab takes the suggestion (' + picked + ' → ' + line + ')');

// --- the inspector's hover: a light tint, not a bright fill
await p.click('button[aria-label="Inspect"]');
await p.waitForTimeout(300);
const hoverLook = await inCanvas(() => {
  const root = document.querySelector('kb-inspector').shadowRoot;
  const alpha = (sel) => Number((getComputedStyle(root.querySelector(sel)).backgroundColor.match(/[\d.]+(?=\))/) || ['1'])[0]);
  return { margin: alpha('.m'), border: alpha('.bd'), padding: alpha('.p'), content: alpha('.c'), outline: getComputedStyle(root.querySelector('.c')).outlineStyle };
});
check(Object.values(hoverLook).slice(0, 4).every((a) => a <= 0.2) && hoverLook.outline === 'solid', 'the hover highlight is a light tint with an outline ' + JSON.stringify(hoverLook));
await p.click('button[aria-label="Inspect"]');

// --- inline <style> and <script> in index.html
await openFile('index.html');
await setEditor(cdnPage('<style>.mine { color: rgb(255, 0, 0); }</style>\n<p id="a" class="mine p-4">styled</p>\n<p id="b">not run</p>\n<script>const b = document.getElementById("b"); b.textContent = "ran"; b.classList.add("bg-blue-6");</script>'));
const inline = await until(() => ({ color: getComputedStyle(document.getElementById('a')).color, text: document.getElementById('b').textContent, bg: getComputedStyle(document.getElementById('b')).backgroundColor }), (v) => v && v.bg === 'rgb(59, 130, 246)');
check(inline.color === 'rgb(255, 0, 0)' && inline.text === 'ran', 'an inline <style> styles the page and an inline <script> runs ' + JSON.stringify(inline));
check(inline.bg === 'rgb(59, 130, 246)', 'a class the inline script adds gets its CSS, from the CDN script (' + inline.bg + ')');
check(!(await lintFlags()).includes('mine'), 'a class an inline <style> defines is not flagged as unknown');

// --- Share (2026-11-27): a new link, copied, and the browser goes to it (the page opens from the
// link, one step in the history); it carries kbach.config.js (an HTML page's, then React's)
const notices = () => p.$$eval('[role="status"]', (els) => els.map((e) => e.textContent).join(' | '));
const sharing = async () => {
  await Promise.all([p.waitForEvent('load'), p.click('button[aria-label="Share"]')]);
  await p.waitForSelector('.cm-editor:visible .cm-content');
  await p.waitForTimeout(800);
};
await openFile('kbach.config.js');
await setEditor("window.kbachConfig = {\n  extend: { colors: { brand: '#123456' } },\n};");
const beforeShare = await p.evaluate(() => ({ url: location.href, steps: history.length }));
await sharing();
const afterShare = await p.evaluate(() => ({ url: location.href, steps: history.length }));
let hash = new URL(afterShare.url).hash;
const copied = await p.evaluate(() => navigator.clipboard.readText());
check(hash.includes('&config=') && afterShare.url !== beforeShare.url && afterShare.steps === beforeShare.steps + 1 && copied === afterShare.url, 'Share makes a new link with kbach.config.js in it, copies it, and goes to it: one new step in the history ' + JSON.stringify({ steps: [beforeShare.steps, afterShare.steps], copied: copied === afterShare.url }));
check(/Link copied/.test(await notices()), 'opened from the link, the page says the link was copied: ' + (await notices()));
await openFile('kbach.config.js');
check((await editorText()).includes('#123456'), 'the page the link opens has the config');
// unchanged code: the same link, copied again, nowhere new to go
await p.click('button[aria-label="Share"]');
await p.waitForTimeout(500);
const again = await p.evaluate(() => ({ url: location.href, steps: history.length }));
check(again.url === afterShare.url && again.steps === afterShare.steps && /same as the last one/.test(await notices()), 'sharing unchanged code copies the same link and stays put');
// Back: the page before the link; Forward: the link again
await p.goBack({ waitUntil: 'networkidle' });
check(p.url() === beforeShare.url, 'Back returns to the page before Share (' + p.url().replace(BASE, '') + ')');
await p.goForward({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-editor:visible .cm-content');
await p.waitForTimeout(800);
check(p.url() === afterShare.url, 'Forward goes to the shared link again');
// React: kbach.config.js is the build plugin's kind, the same object
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("React")');
await p.waitForTimeout(1500);
await openFile('kbach.config.js');
const reactConfig = await editorText();
check(reactConfig.includes('module.exports = {') && reactConfig.includes('#123456') && !reactConfig.includes('window.kbachConfig'), 'switching to React makes kbach.config.js the build plugin’s kind (module.exports), the same colors');
await setEditor("module.exports = {\n  extend: { colors: { brand: '#abcdef' } },\n};");
await sharing();
hash = await p.evaluate(() => location.hash);
check(hash.includes('&config=') && hash.includes('&mode=react'), 'and it travels in a React page’s link too');
await p.goto('about:blank');
await p.goto(BASE + '/playground' + hash, { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-editor:visible .cm-content');
await p.waitForTimeout(800);
await openFile('kbach.config.js');
check((await editorText()).includes('#abcdef'), 'opening it brings that config back');
await p.click('[role="group"][aria-label="Kind of page"] button:has-text("HTML")');
await p.waitForTimeout(1500);
await openFile('kbach.config.js');
check((await editorText()).includes('window.kbachConfig = {') && (await editorText()).includes('#abcdef'), 'and back in HTML, kbach.config.js sets window.kbachConfig again');

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
