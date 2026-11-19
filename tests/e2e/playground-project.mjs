// The playground as a project: Back, the Explorer, kbach.config.js, the real
// kbach.css, inline <script>/<style> in index.html, the VS Code look.
import { chromium } from 'playwright';
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

// --- Back: to the page you came from on this site, else home
await p.goto(BASE + '/en/colors', { waitUntil: 'networkidle' });
await p.click('header a[href="/en/playground"]');
await p.waitForSelector('.cm-content');
await p.waitForTimeout(600);
await p.click('button[aria-label="Back"]');
await p.waitForURL(BASE + '/en/colors');
check(new URL(p.url()).pathname === '/en/colors', 'Back returns to the docs page the playground was opened from');
// the browser's own Back too, after a few runs (an iframe navigated by srcdoc used to fill the history)
await p.click('header a[href="/en/playground"]');
await p.waitForSelector('.cm-content');
await p.waitForTimeout(800);
for (const n of [1, 2, 3]) {
  await p.click('button[aria-label^="Run"]');
  await p.waitForTimeout(500);
}
await p.goBack();
await p.waitForTimeout(500);
check(new URL(p.url()).pathname === '/en/colors', 'after three runs, the browser’s Back still leaves the playground (' + new URL(p.url()).pathname + ')');
await p.goto(BASE + '/en/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1000);
await p.click('button[aria-label="Back"]');
await p.waitForURL(BASE + '/en');
check(new URL(p.url()).pathname === '/en', 'opened directly, Back goes to the home page');
await p.goto(BASE + '/en/playground', { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1000);

// --- the header names the playground
const title = await p.evaluate(() => document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling.querySelector('.truncate.font-semibold').textContent);
check(title === 'Playground', 'the header says Playground (' + title + ')');

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

// --- kbach.config.js: a color of your own
await openFile('index.html');
await setEditor('<div id="brand" class="bg-brand p-4">brand</div>');
// the landing page's kbach.config.js has a brand color (amber-6): bg-brand is a class
check((await lintFlags()).length === 0, 'bg-brand, from the example\u2019s kbach.config.js, is a known class');
const brandBg = await inCanvas(() => getComputedStyle(document.getElementById('brand')).backgroundColor);
check(brandBg === 'rgb(245, 158, 11)', 'and it has the config\u2019s color, amber-6 (' + brandBg + ')');
await openFile('kbach.config.js');
await setEditor("module.exports = {\n  darkMode: 'class',\n  extend: { colors: { brand: '#ff0000', tide: '#0e7490' } },\n};");
const red = await inCanvas(() => getComputedStyle(document.getElementById('brand')).backgroundColor);
check(red === 'rgb(255, 0, 0)', 'a brand color in kbach.config.js styles bg-brand on the page (' + red + ')');
await openFile('index.html');
await setEditor('<div id="brand" class="bg-brand bg-tide p-4">brand</div>');
check((await lintFlags()).length === 0, 'a color added in kbach.config.js is known at once (bg-tide)');
// a config that isn't a plain object: an error on its line, the last good theme kept
await openFile('kbach.config.js');
await setEditor('module.exports = {\n  extend: { colors: { brand: pick() } },\n};');
const cfgError = await p.$$eval('.cm-editor:visible .cm-kb-errmsg', (ms) => ms.map((m) => m.textContent));
check(cfgError.some((m) => m.includes('plain object')), 'code in kbach.config.js shows an error on its line: ' + cfgError.join(' | '));
check(!!(await p.$('[role="tab"] [aria-label="(has an error)"]')), 'and its tab marks the file');
const kept = await inCanvas(() => getComputedStyle(document.getElementById('brand')).backgroundColor);
check(kept === 'rgb(14, 116, 144)', 'the page keeps the last good config meanwhile (' + kept + ')');

// --- darkMode 'media' follows the moon button (the frame's color-scheme)
await setEditor("module.exports = {\n  darkMode: 'media',\n};");
await openFile('index.html');
await setEditor('<div id="d" class="bg-white dark:bg-black p-4">d</div>');
const light = await inCanvas(() => getComputedStyle(document.getElementById('d')).backgroundColor);
const moon = await p.getAttribute('button[aria-label^="Preview in"]', 'aria-label');
await p.click('button[aria-label^="Preview in"]');
await p.waitForTimeout(600);
const darkBg = await inCanvas(() => getComputedStyle(document.getElementById('d')).backgroundColor);
check(light !== darkBg && darkBg === 'rgb(0, 0, 0)', "darkMode 'media': the moon button switches dark: classes too (" + moon + ': ' + light + ' → ' + darkBg + ')');
await p.click('button[aria-label^="Preview in"]');
await openFile('kbach.config.js');
await setEditor("module.exports = {\n  darkMode: 'attribute',\n};");
await p.click('button[aria-label^="Preview in"]');
await p.waitForTimeout(600);
const attrDark = await inCanvas(() => getComputedStyle(document.getElementById('d')).backgroundColor);
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
await setEditor('<style>.mine { color: rgb(255, 0, 0); }</style>\n<p id="a" class="mine p-4">styled</p>\n<p id="b">not run</p>\n<script>const b = document.getElementById("b"); b.textContent = "ran"; b.classList.add("bg-blue-6");</script>');
await p.waitForTimeout(800);
const inline = await inCanvas(() => ({
  color: getComputedStyle(document.getElementById('a')).color,
  text: document.getElementById('b').textContent,
  bg: getComputedStyle(document.getElementById('b')).backgroundColor,
}));
check(inline.color === 'rgb(255, 0, 0)' && inline.text === 'ran', 'an inline <style> styles the page and an inline <script> runs ' + JSON.stringify(inline));
check(inline.bg === 'rgb(59, 130, 246)', 'a class the inline script adds gets its CSS (' + inline.bg + ')');
check(!(await lintFlags()).includes('mine'), 'a class an inline <style> defines is not flagged as unknown');

// --- Share carries kbach.config.js
await openFile('kbach.config.js');
await setEditor("module.exports = {\n  extend: { colors: { brand: '#123456' } },\n};");
await p.click('button[aria-label="Share"]');
await p.waitForTimeout(300);
const hash = await p.evaluate(() => location.hash);
check(hash.includes('&config='), 'a changed kbach.config.js travels in the shared link');
await p.goto('about:blank');
await p.goto(BASE + '/en/playground' + hash, { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(800);
await openFile('kbach.config.js');
check((await editorText()).includes('#123456'), 'opening the link brings the config back');

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
