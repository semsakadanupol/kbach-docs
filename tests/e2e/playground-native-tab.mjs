// native-styles.js: the React Native style objects Kbach makes from the same classes, as a read-only editor tab.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 }, colorScheme: 'light', permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1200);

const tab = (name) => p.locator('[role="tablist"][aria-label="Files"] [role="tab"]', { hasText: name });
const shown = '.cm-editor:visible';
const setHtml = async (html) => {
  await tab('index.html').click();
  await p.fill(shown + ' .cm-content', html);
  await p.waitForTimeout(900);
};
// the whole file, through Copy (the editor only draws the lines in view)
const file = async () => {
  await p.click('section[aria-label="Code"] button[aria-label="Copy code"]');
  await p.waitForTimeout(200);
  return (await p.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
};
const status = () => p.$eval('section[aria-label="Code"]', (s) => s.textContent);

const files = await p.$$eval('[role="tablist"][aria-label="Files"] [role="tab"] .sr-only', (ts) => ts.map((t) => t.textContent.trim()));
check(files.join(',').endsWith('kbach.css,native-styles.js'), 'the editor has a native-styles.js tab after kbach.css (' + files.join(', ') + ')');

await setHtml(
  [
    '<div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10 md:p-10">',
    '  <h2 class="text-lg font-semibold text-gray-12 dark:text-white">Kbach</h2>',
    '  <a class="text-sky-7 transition hover:underline">one</a>',
    '  <a class="text-sky-7 transition hover:underline">two</a>',
    '  <div class="grid grid-cols-3 gap-4 bg-surface">x</div>',
    '</div>',
  ].join('\n'),
);
await tab('native-styles.js').click();
await p.waitForTimeout(300);
let js = await file();
check(js.includes('As on a screen 390 wide, in light mode'), 'it says what it shows: a phone, 390 wide, light mode');
check(
  js.includes('  // <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-10 md:p-10">\n  div: {\n') &&
    js.includes("    backgroundColor: '#ffffff',") &&
    js.includes('    borderRadius: 16,') &&
    js.includes('    padding: 24,') &&
    js.includes('    shadowOffset: { height: 10, width: 0 },') &&
    js.includes('    elevation: 8,'),
  'each element gets the style object the engine resolves for it, as JavaScript',
);
check(js.includes("  // <a class=\"text-sky-7 transition hover:underline\"> ×2\n"), 'elements with the same classes show once, with a count');
check(/\/\/ web only: [^\n]*\btransition\b/.test(js) && /\/\/ web only: [^\n]*grid-cols-3/.test(js), 'classes with no React Native style are marked web only');
// hover: (like focus:, disabled:, data-*, aria-*) is applied by @kbach/react-native from the element's props, not by the engine
check(js.includes('×2\n  // web only: transition\n'), 'hover:underline is not web only: React Native applies it on hover (only transition is listed)');
check(js.includes('active:, hover:, focus:, disabled:, data-*: and aria-*: apply on a phone'), 'the header says which variants depend on the element (not shown in the objects)');
check(js.includes("// React Native ignores: display: 'grid'") && !/\n {4}display: 'grid'/.test(js), "a property React Native doesn't have (display: grid) is listed as ignored, not in the object");
// bg-surface: the example's kbach.config.js defines it (white in light mode), so a phone has it too
const surfaceEntry = () => {
  const from = js.slice(js.indexOf('<div class="grid grid-cols-3 gap-4 bg-surface">'));
  return from.slice(0, from.indexOf('},') + 2);
};
check(surfaceEntry().includes("backgroundColor: '#ffffff',"), 'a color from kbach.config.js works on a phone too: ' + JSON.stringify(surfaceEntry()));
check((await status()).includes('React Native · 390 wide · light · read-only'), 'the status bar names the width and mode');
check((await p.$$eval(shown + ' .cm-content span', (s) => s.length)) > 5, 'with JavaScript syntax colors');

// dark: the preview theme switch changes it
await p.click('button[aria-label="Preview in dark mode"]');
await p.waitForTimeout(400);
js = await file();
check(js.includes('in dark mode') && js.includes("backgroundColor: '#111827',") && js.includes("color: '#ffffff',"), 'switching the preview to dark gives the dark: styles');
await p.click('button[aria-label="Preview in light mode"]');

// width: a picked device's width brings in md:
await p.click('button[aria-label="Tablet"]');
await p.waitForTimeout(400);
js = await file();
check(js.includes('As on a screen 768 wide') && js.includes('    padding: 40,'), 'picking Tablet (768 wide) applies md:p-10');
await p.click('button[aria-label="Fill"]');

// read-only, and Format does nothing
await p.waitForTimeout(300);
const before = await file();
await p.click(shown + ' .cm-content');
await p.keyboard.press('Control+End');
await p.keyboard.type('hello');
await p.keyboard.press('Shift+Alt+F');
await p.waitForTimeout(400);
check((await file()) === before, 'it is read-only');

// with no colors of its own in kbach.config.js, bg-surface does nothing on a phone:
// the web defaults add a surface color, @kbach/react-native's don't
await tab('kbach.config.js').click();
await p.fill(shown + ' .cm-content', 'module.exports = {};');
await p.waitForTimeout(900);
await tab('native-styles.js').click();
await p.waitForTimeout(300);
js = await file();
check(surfaceEntry().includes('gap: 16,') && !surfaceEntry().includes('backgroundColor'), "with an empty config, bg-surface has no color, as in @kbach/react-native: " + JSON.stringify(surfaceEntry()));

// it follows the HTML
await setHtml('<p class="text-center">Hi</p>');
await tab('native-styles.js').click();
await p.waitForTimeout(300);
js = await file();
check(js.includes('  p: {\n') && js.includes("    textAlign: 'center',") && !js.includes('rounded-2xl'), 'it follows index.html as it changes');
// no class problems are reported for the generated file
check(!(await p.$(shown + ' .cm-lintRange')), 'no class checks run on it');

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
