// The playground's editor works like VS Code (2026-11-27): the command palette (Ctrl+Shift+P, F1)
// and the file list (Ctrl+P, ">" to switch), Alt+Z word wrap, Ctrl+G go to line, the shortcut
// sheet listing them, and the color picker on an arbitrary color's swatch (bg-[#ff6600]), which
// writes the picked color into the code. TypeScript's own features are playground-typescript.mjs.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const encode = (t) => Buffer.from(t, 'utf-8').toString('base64url');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
const canvas = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');

const html = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>Page</title>\n  </head>\n  <body>\n    <p id="x" class="bg-[#ff6600] p-4 text-white">Orange</p>\n  </body>\n</html>\n';
await p.goto('http://localhost:5176/playground?vscode#code=' + encode(html), { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.click('.cm-editor:visible .cm-content');

// --- Ctrl+Shift+P: the commands, filtered by what's typed; Enter runs one
await p.keyboard.press('Control+Shift+P');
await p.waitForSelector('[role="dialog"][aria-label="Command palette"]');
check((await p.inputValue('[role="dialog"] input')) === '>', 'Ctrl+Shift+P opens the command palette, with ">"');
await p.keyboard.type('wrap');
const wrapItem = await p.$eval('[role="listbox"] [role="option"][aria-selected="true"]', (o) => o.textContent);
check(/word wrap/.test(wrapItem), 'typing filters the commands: ' + wrapItem);
const before = await p.getAttribute('button[aria-label="Wrap long lines"]', 'aria-pressed');
await p.keyboard.press('Enter');
await p.waitForTimeout(400);
const after = await p.getAttribute('button[aria-label="Wrap long lines"]', 'aria-pressed');
check(!(await p.$('[role="dialog"][aria-label="Command palette"]')) && before !== after, 'Enter runs it (word wrap ' + before + ' → ' + after + ') and closes the palette');

// --- Alt+Z: word wrap back, as VS Code
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Alt+z');
await p.waitForTimeout(300);
check((await p.getAttribute('button[aria-label="Wrap long lines"]', 'aria-pressed')) === before, 'Alt+Z toggles word wrap');

// --- Ctrl+P: the files; ">" turns them into the commands, and back
await p.keyboard.press('Control+p');
await p.waitForSelector('[role="dialog"][aria-label="Go to file"]');
const files = await p.$$eval('[role="listbox"] [role="option"]', (os) => os.map((o) => o.textContent));
check(files.some((f) => f.includes('index.html')) && files.some((f) => f.includes('script.js')) && files.some((f) => f.includes('kbach.config.js')) && files.some((f) => f.includes('kbach.css')), 'Ctrl+P lists the files: ' + files.map((f) => f.split(/\s/)[0]).join(', '));
await p.keyboard.type('>');
await p.waitForTimeout(150);
const asCommands = !!(await p.$('[role="dialog"][aria-label="Command palette"]'));
await p.keyboard.press('Backspace');
await p.keyboard.type('native');
await p.keyboard.press('Enter');
await p.waitForTimeout(500);
const tab = await p.$eval('[role="tablist"][aria-label="Files"] [role="tab"][aria-selected="true"]', (t) => t.textContent);
check(asCommands && /Native/.test(tab), '">" switches to the commands, deleting it back; Enter on native-styles.js opens its tab (' + tab + ')');

// --- F1 opens the commands too, Esc closes
await p.keyboard.press('F1');
const f1 = !!(await p.waitForSelector('[role="dialog"][aria-label="Command palette"]', { timeout: 2000 }).catch(() => null));
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
check(f1 && !(await p.$('[role="dialog"][aria-label="Command palette"]')), 'F1 opens the palette, Esc closes it');

// --- Ctrl+G: the Go to line box
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("HTML")');
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+g');
await p.waitForTimeout(300);
check(!!(await p.$('.cm-editor:visible .cm-panel input[name="line"], .cm-editor:visible .cm-gotoLine input')), 'Ctrl+G opens Go to line');
await p.keyboard.press('Escape');

// --- the shortcut sheet lists them
await p.click('button[aria-label="Keyboard shortcuts"]');
const sheet = await p.$eval('[role="dialog"][aria-label="Keyboard shortcuts"]', (d) => d.textContent);
check(/Ctrl\+Shift\+P/.test(sheet) && /Ctrl\+P/.test(sheet) && /F12/.test(sheet) && /F2/.test(sheet) && /Alt\+click/.test(sheet), 'the shortcut sheet lists the palette, F12, F2 and Alt+click');
await p.keyboard.press('Escape');

// --- the color picker: bg-[#ff6600]'s swatch opens it; a picked color goes into the code and the page
const swatch = await p.$('.cm-editor:visible .cm-kb-swatch-pick');
check(!!swatch && (await swatch.getAttribute('aria-label')) === 'Pick a color for #ff6600', 'an arbitrary color’s swatch is a color picker');
await swatch.click();
await p.waitForTimeout(200);
await p.evaluate(() => {
  const picker = document.querySelector('input[type="color"][aria-label="Pick a color"]');
  picker.value = '#22c55e';
  picker.dispatchEvent(new Event('input', { bubbles: true }));
  picker.dispatchEvent(new Event('change', { bubbles: true }));
});
await p.waitForTimeout(1200);
const code = await p.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent).join('\n'));
const bg = await canvas().evaluate(() => getComputedStyle(document.getElementById('x')).backgroundColor);
check(code.includes('bg-[#22c55e]') && !code.includes('#ff6600') && bg === 'rgb(34, 197, 94)', 'picking #22c55e writes bg-[#22c55e] into the code, and the page shows it (' + bg + ')');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
