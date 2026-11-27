// The playground's three bars (header / editor / preview), the fresh start on reload, Restore, Reset.
import { chromium } from 'playwright';
import { cursorAfter, hasLine } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const URL = 'http://localhost:5176/playground';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1200);

// the header names the one example (there is no examples menu)
const exampleName = () => p.evaluate(() => document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling.querySelector('.truncate.font-semibold')?.textContent.trim() ?? '');
const firstLine = () => p.$eval('.cm-editor:visible .cm-line', (e) => e.textContent);
const statusText = () => p.$eval('section[aria-label="Code"] > div:last-of-type', (e) => e.textContent);
const openMore = async () => {
  await p.click('button[aria-label="More"]');
  return p.$$eval('[role="menu"][aria-label="More"] [role="menuitem"]', (els) => els.map((e) => e.textContent.trim()));
};

// --- where each control lives
const where = await p.evaluate(() => {
  const inSec = (label, sel) => !!document.querySelector('section[aria-label="' + label + '"] ' + sel);
  const header = document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling;
  const inHeader = (sel) => !!header.querySelector(sel);
  return {
    headerName: !!inHeader('.truncate.font-semibold'),
    headerExamplesMenu: inHeader('button[aria-haspopup="menu"]:not([aria-label="More"]):not([aria-label="Layout"])'),
    headerRun: inHeader('button[aria-label^="Run"]'),
    headerAuto: inHeader('[role="switch"]'),
    outputAuto: inSec('Output', '[role="switch"]'),
    outputReload: inSec('Output', 'button[aria-label="Reload"]'),
    headerLayout: inHeader('button[aria-label="Layout"]'),
    headerFull: inHeader('button[aria-label="Full screen"]'),
    headerMore: inHeader('button[aria-label="More"]'),
    headerShare: inHeader('button[aria-label="Share"]'),
    codeExamples: inSec('Code', 'button[aria-haspopup="menu"]'),
    outputRun: inSec('Output', 'button[aria-label^="Run"]'),
    outputShare: inSec('Output', 'button[aria-label="Share"]'),
    outputMore: inSec('Output', 'button[aria-label="More"]'),
    outputFooter: document.querySelector('section[aria-label="Output"]').lastElementChild.querySelector('iframe, .font-mono.leading-5, [role="log"], textarea, input') === null && !document.querySelector('section[aria-label="Output"]').lastElementChild.className.includes('bg-code'),
    outputInspect: inSec('Output', 'button[aria-label="Inspect"]'),
  };
});
check(where.headerName && !where.headerExamplesMenu && !where.headerRun && !where.headerAuto && where.headerLayout && !where.headerFull && where.headerMore && where.headerShare, 'the header holds the project controls: the example’s name, Layout, ⋯, Share (no Run, Auto-run, examples menu or full-screen toggle) ' + JSON.stringify(where));
check(!where.codeExamples && !where.outputShare && !where.outputMore && where.outputInspect && where.outputAuto && where.outputReload && !where.outputRun, 'the editor bar has no examples menu; the preview bar has Inspect, Auto-run and Reload (Run only while Auto-run is off), no Share or ⋯');
check(!where.outputFooter, 'the preview has no footer under it');

// --- a fresh start every visit
check((await exampleName()) === 'Landing page' && (await firstLine()) === '<!doctype html>' && (await hasLine(p, '<title>Landing page: a hero, a class builder, numbers that count up</title>')), 'a first visit opens the Landing page, under its name, Landing page (' + (await exampleName()) + ')');
await p.click('.cm-editor:visible .cm-content');
// the end of the <body …> line (its attributes vary)
await cursorAfter(p, '<body');
await p.keyboard.press('End');
await p.keyboard.type('\n<!-- mine -->', { delay: 10 });
await p.waitForTimeout(900);
check((await p.$('[aria-label="(edited)"]')) !== null, 'editing marks the code as edited');
let items = await openMore();
check(items.some((t) => t === 'Reset Landing page') && !items.some((t) => t.startsWith('Restore')), 'the ⋯ menu offers Reset Landing page (and nothing to restore yet): ' + items.join(' / '));
await p.keyboard.press('Escape');

await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1200);
check(!(await hasLine(p, '<!-- mine -->')) && (await exampleName()) === 'Landing page' && (await p.$('[aria-label="(edited)"]')) === null, 'a reload starts again from the untouched Landing page (first line: ' + (await firstLine()) + ')');
const st = await statusText();
check(st.includes('Started fresh') && st.includes('Restore my last code'), 'the status bar says so, and offers the last code back: ' + st.trim());
items = await openMore();
check(items.includes('Restore your last code') && !items.some((t) => t.startsWith('Reset')), 'the ⋯ menu has Restore (and no Reset: nothing is edited): ' + items.join(' / '));
await p.click('[role="menuitem"]:has-text("Restore your last code")');
await p.waitForTimeout(800);
check(await hasLine(p, '<!-- mine -->'), 'Restore brings back the edited code');

// a second reload without editing still finds the last code (a pristine example never overwrites it)
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
check((await statusText()).includes('Restore my last code'), 'two reloads later the last code is still there to restore');
await p.click('button:has-text("Restore my last code")');
await p.waitForTimeout(800);
check(await hasLine(p, '<!-- mine -->'), 'the notice\u2019s Restore button works too');

// Reset puts the example back, with Undo
items = await openMore();
await p.click('[role="menuitem"]:has-text("Reset Landing page")');
await p.waitForTimeout(800);
check(!(await hasLine(p, '<!-- mine -->')) && (await statusText()).includes('Undo'), 'Reset Landing page puts the example back, and offers Undo');
await p.click('button:has-text("Undo")');
await p.waitForTimeout(800);
check(await hasLine(p, '<!-- mine -->'), 'Undo brings the edit back');

// --- a shared link still opens its code; picking an example then clears the address
await p.goto(URL + '#code=' + Buffer.from('<p class="p-4">shared</p>').toString('base64url'), { waitUntil: 'networkidle' });
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
check((await hasLine(p, '<p class="p-4">shared</p>')) && !(await statusText()).includes('Started fresh'), 'a shared link opens its own code (no "Started fresh")');
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);

// --- Auto off: changes wait, Run shows it
await p.click('[role="switch"]:has-text("Auto")');
check((await p.getAttribute('[role="switch"]', 'aria-checked')) === 'false', 'Auto switches off');
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+End');
await p.keyboard.type('\n<p>later</p>', { delay: 10 });
await p.waitForTimeout(700);
check((await p.$('button[aria-label="Run (there are changes)"]')) !== null, 'with Auto off, Run shows there are changes waiting');
await p.click('button[aria-label="Run (there are changes)"]');
await p.waitForTimeout(700);
check((await p.$('button[aria-label="Run"]')) !== null && (await p.$('section[aria-label="Output"] button[aria-label="Run"]')) !== null, 'Run (in the preview bar) runs them');
await p.click('[role="switch"]:has-text("Auto")');

// --- Fix all sits in the editor's status bar
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+A');
await p.keyboard.insertText('<p class="text-gray-500 bg-blue-500 p-4">x</p>');
await p.waitForTimeout(900);
const fixBtn = await p.$('section[aria-label="Code"] button:has-text("Fix all 2")');
check(!!fixBtn, 'two Tailwind CSS classes: the status bar offers Fix all 2');
await fixBtn?.click();
await p.waitForTimeout(500);
const fixed = await firstLine();
check(!fixed.includes('-500'), 'Fix all replaces them (' + fixed + ')');

// --- rotate only with a device
check((await p.$('button[aria-label^="Rotate"]')) === null, 'Fill: no rotate button');
await p.click('button[aria-label="Phone"]');
check((await p.$('button[aria-label="Rotate to landscape"]')) !== null, 'Phone: rotate shows up');
await p.click('button[aria-label="Fill"]');

// --- kbach.css tab: rule count in the status bar
await p.click('[role="tab"]:has-text("CSS")');
await p.waitForTimeout(300);
check(/CSS · \d+ rules · read-only/.test(await statusText()), 'kbach.css: the status bar counts its rules');
await p.click('[role="tab"]:has-text("index.html")');

// --- fits, at every width (full screen: a phone's one pane at a time below 640px, stacked below
// 768px, side by side from there)
for (const w of [320, 390, 700, 768, 1024, 1280, 1440]) {
  const layout = w < 640 ? 'phone' : w < 768 ? 'stacked' : 'side by side';
  await p.setViewportSize({ width: w, height: 900 });
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  const measure = () => p.evaluate(() => {
    const header = document.querySelector('section[aria-label="Code"]').parentElement.previousElementSibling;
    const hb = header.getBoundingClientRect();
    const rows = (el) => {
      const tops = new Set();
      for (const c of el.querySelectorAll('button, [role="switch"]')) {
        const r = c.getBoundingClientRect();
        if (r.width && c.offsetParent && !c.closest('[role="menu"]')) tops.add(Math.round(r.top + r.height / 2));
      }
      return tops.size;
    };
    const out = document.querySelector('section[aria-label="Output"]');
    const bar = out.firstElementChild;
    const over = [...header.querySelectorAll('*'), ...document.querySelectorAll('section[aria-label] *')].filter((e) => {
      if (e.closest('.cm-scroller, [role="menu"], iframe') || getComputedStyle(e).visibility === 'hidden') return false;
      const r = e.getBoundingClientRect();
      return r.width && (r.right > innerWidth + 0.5 || r.left < -0.5);
    }).map((e) => e.tagName + '.' + String(e.className).slice(0, 40));
    return {
      pageScroll: document.documentElement.scrollWidth - innerWidth,
      headerRows: rows(header),
      headerH: Math.round(hb.height),
      barRows: new Set([...bar.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => Math.round(x.getBoundingClientRect().top))).size,
      // the editor's tab bar (VS Code's: the open files and the file's buttons)
      editorBarRows: rows(document.querySelector('section[aria-label="Code"] [role="tablist"]').parentElement),
      over,
      split: getComputedStyle(document.querySelector('section[aria-label="Code"]').parentElement).flexDirection,
      name: header.querySelector('.truncate.font-semibold').getBoundingClientRect().width,
    };
  });
  let m = await measure();
  // a phone opens on the preview; the editor's bar is measured once Code is picked
  if (w < 640) {
    await p.click('nav[aria-label="Playground view"] button:has-text("Code")');
    await p.waitForTimeout(300);
    const code = await measure();
    m = { ...m, editorBarRows: code.editorBarRows, over: [...m.over, ...code.over], pageScroll: Math.max(m.pageScroll, code.pageScroll) };
  }
  check(
    m.pageScroll <= 0 && m.over.length === 0 && m.headerRows === 1 && m.editorBarRows === 1 && m.name >= 60,
    w + 'px ' + layout + ': no overflow, header and editor bar on one row each, preview bar ' + m.barRows + ' row(s) ' + JSON.stringify(m),
  );
  await p.screenshot({ path: 'shots/layout-' + w + '.png' });
}

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
