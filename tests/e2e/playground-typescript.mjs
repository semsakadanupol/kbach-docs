// The playground's TypeScript service (2026-11-27), as VS Code's: completion with auto-imports,
// hover with docs, type errors in .tsx, signature help, F2 rename, F12 go to definition, members
// after a dot, and kbach.config.js's keys from @kbach/react's KbachConfig type. All from the
// real TypeScript, the real @types/react and @kbach/react's own .d.ts (src/playground/ts/).
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

const page = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>React page</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n';
const app = `import { clsx } from '@kbach/react';

function double(n: number) {
  return n * 2;
}

export default function App() {
  const count = double(2);
  const wrong: number = 'four';
  return <p className={clsx('p-6')}>{count + count}</p>;
}
`;
await p.goto('http://localhost:5176/playground?typescript#code=' + encode(page) + '&js=' + encode(app) + '&lang=ts&mode=react', { waitUntil: 'networkidle' });
// auto-run off: what's typed half-way doesn't run (and throw) while the checks type
await p.click('[role="switch"]');
await p.waitForTimeout(7000);

const lines = () => p.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent));
const list = () => p.$$eval('.cm-tooltip-autocomplete li', (ls) => ls.map((l) => l.textContent));
/** Puts the cursor at the end of the line that has `text`, on a new line under it. */
async function newLineAfter(text) {
  await p.click(`.cm-editor:visible .cm-line:has-text("${text}")`);
  await p.keyboard.press('End');
  await p.keyboard.press('Enter');
}
const waitFor = async (fn, ms = 6000) => {
  for (let t = 0; t < ms; t += 200) {
    const v = await fn();
    if (v) return v;
    await p.waitForTimeout(200);
  }
  return fn();
};

// --- a type error in App.tsx, underlined with TypeScript's message
const marked = await waitFor(() => p.$$eval('.cm-editor:visible .cm-lintRange-error', (els) => els.map((e) => e.textContent)).then((m) => (m.length ? m : null)));
check(JSON.stringify(marked) === '["wrong"]', 'a type error is underlined: ' + JSON.stringify(marked));

// --- hover: clsx's signature and its docs, from @kbach/react's own .d.ts
const clsxBox = await (await p.$('.cm-editor:visible .cm-line:has-text("className") >> text=clsx')).boundingBox();
await p.mouse.move(clsxBox.x + 10, clsxBox.y + clsxBox.height / 2);
const hover = await waitFor(() => p.$eval('.cm-tooltip .cm-ts-info', (e) => e.textContent).catch(() => null));
check(/clsx\(\.\.\.inputs: ClassValue\[\]\): string/.test(hover ?? '') && /truthy/.test(hover ?? ''), 'hover shows clsx’s signature and docs: ' + (hover ?? '').slice(0, 80));
await p.mouse.move(5, 5);

// --- completion with an auto-import: useTheme from @kbach/react, added to the import line
await newLineAfter('const count');
await p.keyboard.type('const theme = useThe', { delay: 50 });
const offered = await waitFor(() => list().then((l) => (l.some((x) => x.startsWith('useTheme')) ? l : null)));
check(offered && /from @kbach\/react/.test(offered.find((x) => x.startsWith('useTheme'))), 'typing useThe suggests useTheme, from @kbach/react: ' + JSON.stringify((offered ?? []).slice(0, 3)));
await p.keyboard.press('Enter');
await p.waitForTimeout(1500);
const imported = (await lines())[0];
check(imported === "import { clsx, useTheme } from '@kbach/react';" && (await lines()).some((l) => l.includes('const theme = useTheme')), 'picking it adds useTheme to the import, as VS Code does: ' + imported);

// --- signature help while typing a call's arguments
await p.keyboard.type('();', { delay: 40 });
await newLineAfter('const theme');
await p.keyboard.type('const n = double(', { delay: 50 });
const sig = await waitFor(() => p.$eval('.cm-ts-signature', (e) => e.textContent).catch(() => null));
check(/double\(n: number\): number/.test(sig ?? '') && (await p.$eval('.cm-ts-signature b', (e) => e.textContent).catch(() => '')) === 'n: number', 'signature help shows double(n: number): number, the argument in bold: ' + sig);
await p.keyboard.press('Escape');
await p.keyboard.type('1);', { delay: 40 });

// --- members after a dot
await newLineAfter('const n = double');
await p.keyboard.type('document.querySelector("p")?.cla', { delay: 50 });
const members = await waitFor(() => list().then((l) => (l.some((x) => x.startsWith('classList')) ? l : null)));
check(!!members, 'after a dot: the element’s members (classList): ' + JSON.stringify((members ?? []).slice(0, 3)));
await p.keyboard.press('Escape');
await p.keyboard.press('Control+z');
await p.waitForTimeout(300);

// --- F12: from a use of double to where it's defined
await p.click('.cm-editor:visible .cm-line:has-text("const count") >> text=double');
await p.keyboard.press('F12');
await p.waitForTimeout(1200);
const def = await p.evaluate(() => getSelection().toString());
check(def === 'double', 'F12 selects the definition of double (' + JSON.stringify(def) + ')');

// --- F2: rename count everywhere in the file
await p.click('.cm-editor:visible .cm-line:has-text("const count") >> text=count');
await p.keyboard.press('F2');
await p.waitForSelector('.cm-ts-rename input', { timeout: 5000 }).catch(() => {});
await p.fill('.cm-ts-rename input', 'total');
await p.keyboard.press('Enter');
await p.waitForTimeout(800);
const renamed = (await lines()).join('\n');
check(/const total = double\(2\)/.test(renamed) && /\{total \+ total\}/.test(renamed) && !/\bcount\b/.test(renamed), 'F2 renames count to total everywhere in the file');

// --- kbach.config.js: its keys come from @kbach/react's KbachConfig type
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("Config")');
await p.waitForTimeout(800);
await p.click('.cm-editor:visible .cm-line:has-text("extend: {")');
await p.keyboard.press('End');
await p.keyboard.press('Enter');
await p.keyboard.type('keyf', { delay: 60 });
const keys = await waitFor(() => list().then((l) => (l.some((x) => x.startsWith('keyframes')) ? l : null)));
check(!!keys, 'in kbach.config.js, extend’s keys complete from KbachConfig (keyframes): ' + JSON.stringify((keys ?? []).slice(0, 3)));

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
