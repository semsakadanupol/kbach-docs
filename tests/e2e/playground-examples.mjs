// Every playground example, end to end in Chromium, plus Kbach help inside the script editor.
import { readFileSync } from 'fs';
import { strFromU8, unzipSync } from 'fflate';
import { chromium } from 'playwright';
import { openExample } from './example-link.js';
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
const p = await ctx.newPage();
const pageErrors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && pageErrors.push(e.message));
await p.goto('http://localhost:5176/playground', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.cm-content');
await p.waitForTimeout(1200);

const frame = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
const inCanvas = async (fn, arg) => {
  for (let i = 0; i < 50; i++) {
    try {
      return await frame().evaluate(fn, arg);
    } catch {
      await p.waitForTimeout(100);
    }
  }
};
// the editor's status bar: its problem count covers unknown classes in the HTML
const status = () => p.$eval('section[aria-label="Code"] button[title$="problems"], section[aria-label="Code"] button[title="No problems"]', (e) => e.textContent.replace(/\s+/g, ''));
const consoleErrors = () => p.$eval('button:has-text("Console")', (e) => e.querySelector('.bg-red-6')?.textContent ?? '0');
// the playground's example (the landing page), opened as a share link
const load = async () => {
  await openExample(p, 'http://localhost:5176', '1-landing');
  await p.waitForTimeout(700);
};

await load();
const problems = await status();
check(problems === '⚠0✕0problems' && (await consoleErrors()) === '0', 'Landing page: every class is a Kbach class and the script runs without errors (' + problems + ')');

// landing: switch package, copy
await frame().click('button:has-text("React Native")');
await frame().click('#copy');
await p.waitForTimeout(300);
const landing = await inCanvas(() => ({ cmd: document.getElementById('command').textContent, copy: document.getElementById('copy').textContent.trim(), pressed: document.querySelector('[data-cmd*="react-native"]').getAttribute('aria-pressed') }));
check(landing.cmd === 'npm install @kbach/react-native' && landing.pressed === 'true' && (landing.copy === 'Copied' || landing.copy === 'Ctrl+C'), 'landing: picking React Native changes the command, Copy answers (' + JSON.stringify(landing) + ')');
// landing on a phone: the links hide behind the menu button, which opens and closes them
await p.click('button[aria-label="Phone"]');
await p.waitForTimeout(900);
const menuState = () => inCanvas(() => ({ button: !!document.querySelector('#menu-button').offsetParent, open: !!document.querySelector('#mobile-menu').offsetParent, expanded: document.querySelector('#menu-button').getAttribute('aria-expanded') }));
const closed = await menuState();
await frame().click('#menu-button');
await p.waitForTimeout(300);
const opened = await menuState();
await frame().click('#mobile-menu a:has-text("Docs")');
await p.waitForTimeout(300);
const afterLink = await menuState();
check(closed.button && !closed.open && opened.open && opened.expanded === 'true' && !afterLink.open, 'landing on a phone: the menu button opens the links, a link closes them ' + JSON.stringify({ closed, opened, afterLink }));
await p.click('button[aria-label="Fill"]');
await p.waitForTimeout(900);
check(!(await menuState()).button, 'landing, wide: no menu button (the links are in the bar)');
// regression: "Back to top" pointed at the sticky bar, which is always in view, so nothing scrolled
await inCanvas(() => document.querySelector('footer').scrollIntoView());
await p.waitForTimeout(800);
const scrolledTo = await inCanvas(() => scrollY);
await frame().click('footer a:has-text("Back to top")');
await p.waitForTimeout(1500);
const backAt = await inCanvas(() => scrollY);
check(scrolledTo > 500 && backAt === 0, 'landing: Back to top scrolls back to the top (' + scrolledTo + ' → ' + backAt + ')');

// the official logo: it loads in the preview, the light one in light mode and the dark one in dark
const logo = () =>
  inCanvas(() =>
    [...document.querySelectorAll('header img')].map((i) => ({ src: i.getAttribute('src'), loaded: i.naturalWidth > 0, shown: !!i.offsetParent })),
  );
const lightLogo = await logo();
check(lightLogo.length === 2 && lightLogo.every((l) => l.loaded) && lightLogo.find((l) => l.shown)?.src === '/kbach-logo-light-64.png', 'landing: the header has the official logo, the light one in light mode ' + JSON.stringify(lightLogo));
await p.click('button[aria-label="Preview in dark mode"]');
await p.waitForTimeout(1500);
const darkLogo = await logo();
check(darkLogo.find((l) => l.shown)?.src === '/kbach-logo-64.png', 'landing: and the dark one in dark mode ' + JSON.stringify(darkLogo));
await p.click('button[aria-label="Preview in light mode"]');
await p.waitForTimeout(800);
// the works-with strip: each one's official logo, loaded (its own items and the script's copies)
const marks = await inCanvas(() => [...document.querySelectorAll('#marquee img')].map((i) => ({ src: i.getAttribute('src'), loaded: i.naturalWidth > 0 })));
check(marks.length === 14 && marks.every((m) => m.loaded), 'landing: the works-with strip shows each official logo ' + JSON.stringify(marks.slice(0, 7).map((m) => m.src)));
// Download: a .zip, each file on its own (2026-11-27); a downloaded copy can't load
// "/kbach-logo-64.png" from a disk, so its URLs are made full
await p.click('button[aria-label="More"]');
const download = p.waitForEvent('download');
await p.click('[role="menuitem"]:has-text("Download")');
const zipFile = await download;
const zipped = Object.fromEntries(Object.entries(unzipSync(readFileSync(await zipFile.path()))).map(([k, v]) => [k, strFromU8(v)]));
const saved = zipped['landing/index.html'] ?? '';
check(zipFile.suggestedFilename() === 'landing.zip' && ['index.html', 'kbach.config.js', 'kbach.css', 'script.js', 'style.css', 'README.md'].every((f) => ('landing/' + f) in zipped), 'landing: Download gives landing.zip, its files apart: ' + Object.keys(zipped).join(', '));
check(saved.includes('src="http://localhost:5176/kbach-logo-64.png"') && saved.includes('href="#top"'), 'landing: the downloaded page has the logo’s full URL (and #top left as it is)');
check(saved.includes('<link rel="stylesheet" href="kbach.css" />') && saved.includes('<link rel="stylesheet" href="style.css" />') && saved.includes('<script src="kbach.config.js"></script>') && saved.includes('<script type="module" src="script.js"></script>') && zipped['landing/kbach.config.js'].includes('window.kbachConfig = {'), 'landing: index.html loads kbach.css, style.css, kbach.config.js (window.kbachConfig) and script.js, each a file of its own');
// kbach.css is the generated CSS, the same as the kbach.css tab (2026-11-27: the zip had none for an HTML page)
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("kbach.css")');
await p.waitForTimeout(300);
await p.click('section[aria-label="Code"] button[aria-label="Copy code"]');
await p.waitForTimeout(200);
const tabCss = (await p.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
const zipCss = zipped['landing/kbach.css'];
check(zipCss.startsWith('/* kbach:start */') && zipCss.includes('.bg-brand') && zipCss.trimEnd() === tabCss.trimEnd(), 'landing: the zip’s kbach.css is the generated CSS, exactly the kbach.css tab (' + zipCss.length + ' bytes, .bg-brand in it)');
check(!zipped['landing/style.css'].includes('.bg-brand') && zipped['landing/style.css'].includes('padding: 1.5rem'), 'landing: style.css is only the preview’s page basics');
await p.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("index.html")');

// Kbach help in the script editor: completion and checks inside classList.add('…')
await p.click('button[role="tab"]:has-text("script")');
await p.click('.cm-editor:visible .cm-content');
await p.keyboard.press('Control+End');
await p.keyboard.type("\nbutton.classList.add('bg-ro", { delay: 30 });
await p.waitForSelector('.cm-tooltip-autocomplete li', { timeout: 4000 }).catch(() => {});
const opts = await p.$$eval('.cm-tooltip-autocomplete li', (ls) => ls.slice(0, 3).map((l) => l.textContent));
check(opts[0]?.startsWith('bg-rose-'), 'script: typing in classList.add(\'…\') offers Kbach classes (' + opts.join(', ') + ')');
await p.keyboard.press('Escape');
await p.keyboard.type("', 'text-blue-500');", { delay: 10 });
await p.waitForSelector('.cm-editor:visible .cm-lintRange-warning', { timeout: 4000 }).catch(() => {});
const flagged = await p.$$eval('.cm-editor:visible .cm-lintRange-warning', (els) => els.map((e) => e.textContent));
check(flagged.includes('text-blue-500') && flagged.includes('bg-ro'), 'script: unknown classes in classList.add are underlined (' + flagged.join(', ') + ')');
await p.keyboard.type('\ndocument.query', { delay: 30 });
await p.waitForSelector('.cm-tooltip-autocomplete li', { timeout: 4000 }).catch(() => {});
const domOpts = await p.$$eval('.cm-tooltip-autocomplete li', (ls) => ls.map((l) => l.textContent));
check(domOpts.includes('querySelector'), 'script: document. offers DOM methods (' + domOpts.slice(0, 3).join(', ') + ' …)');
await p.keyboard.press('Escape');

// wrapping: every row break is at a space, and continuation rows sit under the code
await p.click('button[role="tab"]:has-text("index.html")');
await p.click('button[aria-label="Wrap long lines"]'); // remembered across the reload below
await load();
const breaks = await p.evaluate(() => {
  const bad = [];
  let wrapped = 0;
  const r = document.createRange();
  for (const line of document.querySelectorAll('.cm-editor:not(.hidden) .cm-line')) {
    if (!line.offsetParent) continue;
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let lastTop = null;
    let prevChar = '';
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      for (let i = 0; i < n.length; i++) {
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const top = Math.round(r.getBoundingClientRect().top);
        if (lastTop !== null && top > lastTop + 2) {
          wrapped++;
          if (prevChar !== ' ') bad.push(prevChar + '|' + n.data[i]);
        }
        lastTop = top;
        prevChar = n.data[i];
      }
    }
  }
  return { wrapped, bad };
});
check(breaks.wrapped > 0 && breaks.bad.length === 0, 'wrap: ' + breaks.wrapped + ' row breaks, all at a space' + (breaks.bad.length ? ' (bad: ' + breaks.bad.join(' ') + ')' : ''));
await p.click('button[aria-label="Wrap long lines"]');

// the right edge: a fade sits at the scroller's right, clear of the scrollbar
const edge = await p.evaluate(() => {
  const ed = document.querySelector('.cm-editor:not([class*="hidden"])');
  const s = ed.querySelector('.cm-scroller');
  const fade = ed.querySelector('.cm-kb-edge');
  const fr = fade.getBoundingClientRect();
  // the editor draws its own scrollbar at the right edge: the fade ends where it starts
  const vbar = ed.querySelector('.cm-kb-vbar');
  const barLeft = getComputedStyle(vbar).display === 'none' ? s.getBoundingClientRect().right : vbar.getBoundingClientRect().left;
  return { fadeRight: Math.round(fr.right), scrollbarLeft: Math.round(barLeft), width: Math.round(fr.width) };
});
check(edge.width >= 20 && Math.abs(edge.fadeRight - edge.scrollbarLeft) <= 1, 'edge: the fade ends where the scrollbar begins (' + JSON.stringify(edge) + ')');

check(pageErrors.length === 0, 'no docs-page errors ' + pageErrors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
