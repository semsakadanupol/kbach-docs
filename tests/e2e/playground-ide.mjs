// The playground's CodeMirror editor and the canvas link fix, in real Chromium.
import { chromium } from 'playwright';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message)); // the canvas runs the reader's code: its errors are theirs
await p.goto('http://localhost:5176/en/playground', { waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(800);
const editorText = () => p.$$eval('.cm-line', (ls) => ls.map((l) => l.textContent).join('\n'));
// the canvas is an opaque origin: reach it through Playwright's frame API
const inCanvas = async (fn) => {
  for (let i = 0; i < 50; i++) {
    try {
      const f = p.frames().find((x) => x !== p.mainFrame() && x.url() === 'about:srcdoc');
      return await f.evaluate(fn);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
const setCode = async (code) => {
  await p.click('.cm-content');
  await p.keyboard.press('Control+a');
  await p.keyboard.press('Delete');
  await p.evaluate((c) => navigator.clipboard?.writeText?.(c), code).catch(() => {});
  await p.fill('.cm-content', code);
  await p.waitForTimeout(500);
};

// 1. links in the canvas don't navigate it (the style used to break)
await p.click('button[role="tab"]:has-text("script")');
await p.fill('.cm-editor:visible .cm-content', '');
await p.click('button[role="tab"]:has-text("index.html")');
await setCode('<div id="keep" class="p-4 bg-rose-6 text-white">kept</div><a id="hash" href="#">hash link</a> <a id="page" href="/installation">docs link</a><form id="f"><button id="go">submit</button></form>');
const frame = p.frameLocator('iframe[title="Playground canvas"]');
await frame.locator('#hash').click();
await frame.locator('#page').click();
await frame.locator('#go').click();
await p.waitForTimeout(1200);
const after = await inCanvas(() => ({
  url: location.href,
  keep: !!document.getElementById('keep'),
  bg: document.getElementById('keep') ? getComputedStyle(document.getElementById('keep')).backgroundColor : null,
}));
check(after.keep && after.bg === 'rgb(244, 63, 94)' && after.url.startsWith('about:srcdoc'), 'clicking links and submitting in the canvas keeps it (and its style): ' + JSON.stringify(after));

// 2. completion inside class="…", with the CSS beside it
await setCode('<div class=""></div>');
// the cursor is at the end of it: back into class=""
await p.focus('.cm-content');
await p.keyboard.press('End');
for (let i = 0; i < 8; i++) await p.keyboard.press('ArrowLeft');
await p.keyboard.type('bg-ro', { delay: 40 });
await p.waitForSelector('.cm-tooltip-autocomplete li', { timeout: 4000 }).catch(() => {});
const opts = await p.$$eval('.cm-tooltip-autocomplete li', (ls) => ls.slice(0, 6).map((l) => l.textContent));
check(opts.some((o) => o.startsWith('bg-rose-')) && opts.indexOf('bg-rose-2') < opts.indexOf('bg-rose-10') + (opts.includes('bg-rose-10') ? 0 : 99), 'typing bg-ro in class="" offers ' + opts.slice(0, 3).join(', '));
await p.waitForSelector('.cm-completionInfo .cm-kb-css', { timeout: 3000 }).catch(() => {});
const info = await p.$eval('.cm-completionInfo .cm-kb-css', (e) => e.textContent).catch(() => '');
check(info.includes('background-color'), 'the selected completion shows its CSS (' + info.split('\n')[1]?.trim() + ')');
// CodeMirror ignores Enter for 75ms after the list changes; a person is slower than that
await p.waitForTimeout(150);
await p.keyboard.press('Enter');
await p.waitForTimeout(300);
check(/class="bg-rose-\d+"/.test(await editorText()), 'Enter inserts the class: ' + (await editorText()));

// 3. an unknown class is underlined, with the engine's fix one click away
await setCode('<div class="p-4 bg-blue-500 text-white">x</div>');
await p.waitForSelector('.cm-lintRange-warning', { timeout: 4000 }).catch(() => {});
const under = await p.$eval('.cm-lintRange-warning', (e) => e.textContent).catch(() => null);
check(under === 'bg-blue-500', 'bg-blue-500 is underlined (' + under + ')');
await p.hover('.cm-lintRange-warning');
await p.waitForSelector('.cm-diagnosticAction', { timeout: 4000 }).catch(() => {});
const msg = await p.$eval('.cm-diagnostic', (e) => e.textContent).catch(() => '');
check(msg.includes('Did you mean "bg-blue-6"'), 'the warning names the fix: ' + msg.replace(/\s+/g, ' ').slice(0, 70));
await p.click('.cm-diagnosticAction');
await p.waitForTimeout(400);
check((await editorText()).includes('bg-blue-6 '), 'the action applies it');

// 4. hover a class to see its CSS
await p.mouse.move(0, 0);
await p.waitForTimeout(300);
// hover exactly over the "p-4" characters
const at = await p.evaluate(() => {
  const walker = document.createTreeWalker(document.querySelector('.cm-content'), NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const i = n.textContent.indexOf('p-4');
    if (i >= 0) {
      const r = document.createRange();
      r.setStart(n, i + 1);
      r.setEnd(n, i + 2);
      const box = r.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    }
  }
  return null;
});
await p.mouse.move(at.x, at.y);
await p.waitForSelector('.cm-kb-hover', { timeout: 4000 }).catch(() => {});
const hover = await p.$eval('.cm-kb-hover', (e) => e.textContent).catch(() => '');
check(hover.includes('padding'), 'hovering p-4 shows its CSS (' + hover.replace(/\s+/g, ' ').trim().slice(0, 40) + ')');

// 5. tags close themselves
await setCode('');
// (the cursor is in the empty <body>)
await p.focus('.cm-content');
await p.keyboard.type('<section>', { delay: 30 });
await p.waitForTimeout(200);
check((await editorText()).includes('<section></section>'), 'typing <section> adds </section>');

await p.screenshot({ path: 'shots/ide.png' });
check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
