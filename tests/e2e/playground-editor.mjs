// The playground's IDE features and the preview inspector, in real Chromium.
import { chromium } from 'playwright';
import { cdnPage, openExample } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1200);

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
const htmlEd = '.cm-editor:visible .cm-content';
const doc = () => p.evaluate(() => localStorage.getItem('kbach-playground-code'));
// index.html is a whole document: markup filled in goes into <body> (indented under it)
const body = async () => {
  const m = /<body>\n?([\s\S]*?)\n?\s*<\/body>/.exec((await doc()) ?? '');
  return m ? m[1].replace(/^ {4}/gm, '') : '';
};
const flat = (t) => t.replace(/\s+/g, ' ');
// the HTML editor's lines on screen (an untouched example isn't saved to localStorage)
const shown = () => p.evaluate(() => [...document.querySelectorAll('.cm-editor:not(.hidden) .cm-line')].filter((l) => l.offsetParent).map((l) => l.textContent).join('\n'));
const statusText = () => p.locator('section[aria-label="Code"] > div:last-of-type').first().innerText();
const setHtml = async (code) => {
  await p.click('button[role="tab"]:has-text("script")');
  await p.fill(htmlEd, '');
  await p.click('button[role="tab"]:has-text("index.html")');
  await p.fill(htmlEd, code);
  await p.waitForTimeout(700);
};

// --- status bar ---
await setHtml('<div class="p-4">\n  <p class="text-sky-6">hi</p>\n</div>');
// (the cursor is at the end of what was filled in: </div>, line 7 of the document)
await p.focus(htmlEd);
await p.waitForTimeout(150);
const st = await p.locator('text=/Ln \\d+, Col \\d+/').first().textContent();
check(st.startsWith('Ln 7, Col 11'), 'status bar shows the cursor: ' + st);
await p.keyboard.press('Shift+Home');
await p.waitForTimeout(100);
check(/\((6|10) selected\)/.test(await p.locator('text=/Ln \\d+, Col \\d+/').first().textContent()), 'and the selection size');

// --- color swatches ---
const sw = await p.$$eval('.cm-editor:visible .cm-kb-swatch', (s) => s.map((e) => e.style.background));
check(sw.length === 1 && sw[0].includes('14, 165, 233'), 'a swatch sits in front of text-sky-6 (' + sw.join() + ')');

// --- format + class sorting ---
await setHtml('<div class="text-white flex p-4 bg-sky-6 hover:bg-sky-7 rounded-lg"><span>one</span><span>two</span></div>');
await p.click('button:has-text("Format")');
await p.waitForTimeout(2500);
const formatted = await doc();
check(/<div [^>]*>\n\s+<span>one<\/span>/.test(formatted), 'Format lays the HTML out:\n' + formatted);
const order = /class="([^"]+)"/.exec(formatted)[1];
check(order === 'flex rounded-lg bg-sky-6 p-4 text-white hover:bg-sky-7', 'and sorts the classes in engine order: ' + order);
check((await statusText()).includes('Formatted, classes sorted'), 'the status bar says so');
await p.click(htmlEd);
await p.keyboard.press('Control+z');
await p.waitForTimeout(600);
check((await body()).startsWith('<div class="text-white flex'), 'one Ctrl+Z undoes the whole format');
await p.click(htmlEd);
await p.keyboard.press('Shift+Alt+F');
await p.waitForTimeout(1500);
check((await doc()).includes('class="flex rounded-lg'), 'Shift+Alt+F formats too');

// --- emmet ---
await setHtml('');
await p.focus(htmlEd);
await p.keyboard.type('ul.list-disc>li.p-2*3', { delay: 25 });
await p.waitForTimeout(300);
await p.keyboard.press('Tab');
await p.waitForTimeout(700);
const em = await doc();
check((em.match(/<li class="p-2"><\/li>/g) || []).length === 3 && /<body>\s*<ul class="list-disc">/.test(em), 'Emmet: ul.list-disc>li.p-2*3 + Tab expands:\n' + em);
await setHtml('');
await p.focus(htmlEd);
await p.keyboard.press('Enter');
const col = async () => Number(/Col (\d+)/.exec(await p.locator('text=/Ln \\d+, Col \\d+/').first().textContent())[1]);
const colBefore = await col();
await p.keyboard.press('Tab');
await p.waitForTimeout(400);
check((await col()) === colBefore + 2, 'Tab with no abbreviation still indents (Col ' + colBefore + ' → ' + (await col()) + ')');

// --- problems ---
await setHtml('<div class="bg-blue-500 p-4">x</div>');
await p.waitForTimeout(500);
const probs = await p.locator('button:has(span.sr-only:text(" problems"))').innerText();
check(/⚠\s*1/.test(probs), 'the problem count shows 1 warning (' + probs.replace(/\s+/g, ' ') + ')');
await p.locator('button:has(span.sr-only:text(" problems"))').click();
await p.waitForTimeout(300);
check(await p.isVisible('.cm-editor:visible .cm-panel-lint'), 'clicking it opens the problems panel');
await p.keyboard.press('Escape');

// --- run shortcut ---
const genBefore = await p.$eval('iframe[title="Playground canvas"]', (f) => /data-gen="(\d+)"/.exec(f.srcdoc)?.[1]);
await p.click(htmlEd);
await p.keyboard.press('Control+Enter');
await p.waitForTimeout(500);
const genAfter = await p.$eval('iframe[title="Playground canvas"]', (f) => /data-gen="(\d+)"/.exec(f.srcdoc)?.[1]);
check(Number(genAfter) > Number(genBefore), 'Ctrl+Enter runs the page again (' + genBefore + ' → ' + genAfter + ')');

// --- console input ---
await setHtml('<div class="p-4"><button>a</button><button>b</button></div>');
await p.click('button:has-text("Console")');
const con = p.locator('input[aria-label="Run JavaScript in the page"]');
await con.fill('document.querySelectorAll("button").length * 21');
await con.press('Enter');
await con.fill('({ kbach: [1, 2], ok: true })');
await con.press('Enter');
await con.fill('nope(');
await con.press('Enter');
await p.waitForTimeout(500);
const out = await p.locator('section[aria-label="Output"] .font-mono.leading-5').innerText();
check(out.includes('42'), 'the console runs JavaScript in the page: 42');
check(out.includes('{ kbach: [1, 2], ok: true }'), 'and shows objects');
check(/SyntaxError/.test(out), 'and errors');
await con.press('ArrowUp');
check((await con.inputValue()) === 'nope(', '↑ brings back the last line');
// a script error links to its line (the page loads its script, as a real one has to: cdnPage's tag)
await setHtml(cdnPage('<p>x</p>'));
await p.click('button[role="tab"]:has-text("script")');
await p.fill(htmlEd, 'const a = 1;\nconst b = 2;\nmissing();');
await p.waitForTimeout(1600);
await p.locator('button:has-text("script.js:3")').click();
await p.waitForTimeout(300);
const selLine = await p.evaluate(() => getSelection()?.toString() ?? '');
check(selLine.includes('missing();'), 'clicking script.js:3 selects line 3 in the script (' + selLine + ')');
await p.fill(htmlEd, '');
await p.click('button[role="tab"]:has-text("index.html")');
await p.click('button:has-text("Preview")');

// --- shortcuts sheet ---
await p.click('button[aria-label="Keyboard shortcuts"]');
check(await p.isVisible('[role="dialog"][aria-label="Keyboard shortcuts"]'), 'the shortcut sheet opens');
await p.keyboard.press('Escape');
await p.waitForTimeout(150);
check(!(await p.isVisible('[role="dialog"][aria-label="Keyboard shortcuts"]')), 'and Esc closes it');

// --- resize: the playground is always full screen, the code beside the preview ---
const edBox = () => p.$eval('section[aria-label="Code"]', (s) => Math.round(s.getBoundingClientRect().width));
const w0 = await edBox();
const handle = await p.$('[role="separator"]');
const hb = await handle.boundingBox();
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.down();
await p.mouse.move(hb.x + hb.width / 2 + 150, hb.y + hb.height / 2, { steps: 6 });
await p.mouse.up();
const w1 = await edBox();
check(Math.abs(w1 - w0 - 150) <= 4, 'dragging the handle makes the code wider (' + w0 + ' → ' + w1 + ')');
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
// saved as a whole percent of the window, so within 1% of it
check(Math.abs((await edBox()) - w1) <= 15, 'and the width is remembered (' + (await edBox()) + ')');
await p.focus('[role="separator"]');
await p.keyboard.press('ArrowLeft');
check((await edBox()) < w1, 'arrow keys on the handle resize too');

// --- always full screen ---
const fs = await p.evaluate(() => {
  const code = document.querySelector('section[aria-label="Code"]').getBoundingClientRect();
  const out = document.querySelector('section[aria-label="Output"]').getBoundingClientRect();
  return { sideBySide: out.left > code.right - 1 && Math.abs(out.top - code.top) < 2, fills: Math.round(out.bottom) >= innerHeight - 16, noScroll: getComputedStyle(document.documentElement).overflow === 'hidden' };
});
check(fs.sideBySide && fs.fills && fs.noScroll, 'full screen: code and preview side by side, full height, page locked (' + JSON.stringify(fs) + ')');
await p.screenshot({ path: 'shots/ide-fullscreen.png' });
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
const stillFull = await p.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden' && !document.querySelector('button[aria-label="Leave full screen"], button[aria-label="Full screen"]'));
check(stillFull, 'Esc does not leave full screen, and there is no full-screen toggle');

// --- inspector ---
await openExample(p, 'http://localhost:5176', '1-landing');
await p.waitForTimeout(700);
await p.click('button[aria-label="Inspect"]');
// the preview in view (the editor was made taller above), as someone using it would have it
await p.$eval('section[aria-label="Output"]', (el) => el.scrollIntoView({ block: 'end' }));
await p.waitForTimeout(300);
const h1Box = await inCanvas(() => {
  const r = document.querySelector('h1').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
const fb = await (await p.$('iframe[title="Playground canvas"]')).boundingBox();
await p.mouse.move(fb.x + h1Box.x, fb.y + h1Box.y);
await p.waitForTimeout(250);
const hover = await inCanvas(() => {
  const root = document.querySelector('kb-inspector').shadowRoot;
  const label = root.querySelector('.l');
  return { label: label.textContent, shown: label.style.display, content: root.querySelector('.c').style.display };
});
check(hover.shown === 'block' && hover.label.startsWith('h1.mt-6.text-4xl.font-bold') && hover.content === 'block', 'hovering shows the box model and a label: ' + hover.label);
await p.mouse.click(fb.x + h1Box.x, fb.y + h1Box.y);
await p.waitForSelector('aside[aria-label="Inspector"]', { timeout: 4000 }).catch(() => {});
const panel = await p.locator('aside[aria-label="Inspector"]').textContent().catch(() => '');
check(panel.includes('<h1>') && panel.includes('tracking-tight') && panel.includes('Box model') && panel.includes('font-size'), 'clicking opens the inspector with its classes, box model and styles');
await p.locator('aside[aria-label="Inspector"] button:text-is("Code")').click();
await p.waitForTimeout(300);
check(flat(await p.evaluate(() => getSelection()?.toString() ?? '')).startsWith('<h1 class="mt-6 text-4xl'), 'Code selects the tag in the editor');
// (checked once Code has scrolled to it: the <h1> is far down the document, and the
// editor only draws the lines near where it's scrolled to)
check(flat(await p.$$eval('.cm-editor:visible .cm-kb-picked', (els) => els.map((e) => e.textContent).join(' ')).catch(() => '')).startsWith('<h1 class="mt-6'), 'the picked element\'s tag is marked in the code');
// the class switches are on Details (the Inspector opens on Design)
await p.click('[aria-label="Inspector view"] button:has-text("Details")');
await p.waitForTimeout(200);
// switch a class off, live (in the canvas only: the code keeps it)
const size = () => inCanvas(() => getComputedStyle(document.querySelector('h1')).fontWeight);
const before = await size();
await p.locator('aside[aria-label="Inspector"] input[aria-label^="Turn off font-bold"]').click();
await p.waitForTimeout(300);
const off = await size();
check(before === '700' && off === '400' && (await shown()).includes('font-bold tracking-tight'), 'switching font-bold off changes the canvas, not the code (' + before + ' → ' + off + ')');
await p.locator('aside[aria-label="Inspector"] input[aria-label^="Turn on font-bold"]').click();
await p.waitForTimeout(300);
check((await size()) === before, 'and back on');
// add a class in the code
await p.locator('aside[aria-label="Inspector"] input[aria-label="Add a class to this element in the code"]').fill('text-sky-7');
await p.keyboard.press('Enter');
await p.waitForTimeout(1600);
check((await shown()).includes('sm:text-6xl text-sky-7"') && (await doc()).includes('sm:text-6xl text-sky-7"'), 'adding a class writes it into the tag in the code');
check((await inCanvas(() => document.querySelector('h1').className)).includes('text-sky-7'), 'and the canvas has it');
check((await p.locator('aside[aria-label="Inspector"]').innerText()).includes('text-sky-7'), 'the inspector still shows the same element after the page reloaded');
// parent via the breadcrumb
await p.locator('aside[aria-label="Inspector"] button:has-text("↑ Parent")').click();
await p.waitForTimeout(400);
check((await p.locator('aside[aria-label="Inspector"]').innerText()).includes('<main>'), '↑ Parent selects the <main>');
// cursor in the code lights the element up
await p.click('button[aria-label="Inspect"]'); // off
await p.click('button[aria-label="Inspect"]'); // on again
await p.focus(htmlEd);
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(400);
const lit = await inCanvas(() => document.querySelector('kb-inspector').shadowRoot.querySelector('.hl').style.display);
check(lit === 'block', 'the cursor in the code highlights its element in the preview');
// an element the script made
await p.click('button[aria-label="Inspect"]'); // off: the page reloads with the example
await openExample(p, 'http://localhost:5176', 'colors');
await p.waitForTimeout(700);
await p.click('button[aria-label="Inspect"]');
await p.$eval('section[aria-label="Output"]', (el) => el.scrollIntoView({ block: 'end' }));
await p.waitForTimeout(200);
const sw2 = await inCanvas(() => {
  const r = document.querySelector('#families button').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
const fb2 = await (await p.$('iframe[title="Playground canvas"]')).boundingBox();
await p.mouse.click(fb2.x + sw2.x, fb2.y + sw2.y);
await p.waitForTimeout(500);
const made = await p.locator('aside[aria-label="Inspector"]').innerText();
check(made.includes('The script made this element') && (await p.locator('aside[aria-label="Inspector"] button:text-is("Code")').isDisabled()), 'a script-made element says so, and has no Code link');
check(!(await inCanvas(() => document.querySelector('#card').className)).includes('bg-gray'), 'inspect clicks don\'t reach the page (the swatch\'s own click didn\'t run)');
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
check((await p.getAttribute('button[aria-label="Inspect"]', 'aria-pressed')) === 'false', 'Esc stops inspecting');
await p.screenshot({ path: 'shots/ide-inspector.png' });

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
