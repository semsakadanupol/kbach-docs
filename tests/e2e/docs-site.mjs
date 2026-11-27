// End-to-end check of the docs site (this repository, kbach-docs) in real Chromium.
// Usage: node docs-e2e.mjs <base url> <screenshot dir> <playwright package dir>
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { cdnPage, openExample } from './example-link.js';

const [base = 'http://localhost:5176', shots = 'shots/docs-site'] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push('pageerror: ' + e.message));
// (the browser's "Failed to load resource" line repeats an HTTP error: the response check reports it)
page.on('console', (m) => m.type() === 'error' && m.location().url !== 'about:srcdoc' && !/^Failed to load resource/.test(m.text()) && errors.push('console: ' + m.text()));
// a file the site asks for and doesn't have; not the 404 page this suite opens on purpose (/nope)
page.on('response', (r) => r.status() >= 400 && !(r.request().isNavigationRequest() && r.url().endsWith('/nope')) && r.frame().url() !== 'about:srcdoc' && errors.push('http ' + r.status() + ': ' + r.url()));
// a request that broke; not one cancelled because the page moved on (Next.js prefetches the links it shows)
page.on('requestfailed', (r) => !r.url().includes('fonts.g') && r.failure()?.errorText !== 'net::ERR_ABORTED' && r.frame().url() !== 'about:srcdoc' && errors.push('requestfailed: ' + r.url() + ' (' + r.failure()?.errorText + ')'));

// Every element's classes must have CSS: the static sheet or runtime rules.
async function unstyled() {
  return page.evaluate(() => {
    const sel = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const walk = (rules) => {
          for (const r of Array.from(rules)) {
            if (r.selectorText) sel.push(r.selectorText);
            if (r.cssRules) walk(r.cssRules);
          }
        };
        walk(sheet.cssRules);
      } catch {}
    }
    const text = sel.join('\n');
    const IGNORE = new Set(['group', 'peer', 'light', 'dark', 'contents-root']);
    const tokens = new Set();
    document.querySelectorAll('[class]').forEach((el) => {
      const c = el.getAttribute('class');
      if (typeof c === 'string') c.split(/\s+/).forEach((t) => t && tokens.add(t));
    });
    // cm-* and ͼ* are CodeMirror's own classes, styled through adoptedStyleSheets
    return [...tokens].filter((t) => !IGNORE.has(t) && !t.startsWith('group/') && !/^(cm-|ͼ)/.test(t) && !text.includes('.' + CSS.escape(t)));
  });
}

const slugs = await (async () => {
  await page.goto(base + '/introduction', { waitUntil: 'networkidle' });
  return page.$$eval('aside nav[aria-label="Documentation"] a[href]', (as) => as.map((a) => a.getAttribute('href')));
})();
check(slugs.length === 41, 'sidebar lists ' + slugs.length + ' pages');

// visit every page: title, h1, no missing CSS
const missingAll = new Map();
for (const href of slugs) {
  await page.goto(base + href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const h1 = await page.textContent('main h1');
  const title = await page.title();
  if (!h1 || !title.includes('Kbach')) check(false, href + ' has h1 and title');
  for (const t of await unstyled()) missingAll.set(t, href);
}
check(missingAll.size === 0, 'every class on every page has CSS' + (missingAll.size ? ': ' + [...missingAll].map(([t, h]) => t + ' (' + h + ')').join(', ') : ''));

// computed theme colors: light
await page.goto(base + '/installation', { waitUntil: 'networkidle' });
const preH = await page.$eval('main pre', (el) => el.getBoundingClientRect().height + '/' + getComputedStyle(el).marginTop);
check(preH === '56/0px', 'one-line code block is 56px tall with no margin (' + preH + ')');
const bgLight = await page.evaluate(() => getComputedStyle(document.querySelector('.bg-page')).backgroundColor);
check(bgLight === 'rgb(250, 247, 240)', 'light page background is parchment (' + bgLight + ')');
await page.screenshot({ path: shots + '/installation-light.png' });

// theme switch -> dark
await page.click('[role="radio"][aria-label="Dark"]');
await page.waitForTimeout(100);
const isDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
const bgDark = await page.evaluate(() => getComputedStyle(document.querySelector('.bg-page')).backgroundColor);
check(isDarkClass && bgDark === 'rgb(26, 33, 37)', 'dark switch: html.dark and slate background (' + bgDark + ')');
const stored = await page.evaluate(() => localStorage.getItem('kbach-theme'));
check(stored === 'dark', 'theme choice saved (' + stored + ')');
await page.screenshot({ path: shots + '/installation-dark.png' });

// reload keeps dark, with no light flash: class is set before the app runs
await page.reload({ waitUntil: 'domcontentloaded' });
const earlyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
check(earlyDark, 'dark mode applied before the app loads (no flash)');
await page.waitForLoadState('networkidle');

// code tabs (inside the setup panel)
const codeTabs = page.locator('main [role="tabpanel"] [role="tablist"]').first().locator('[role="tab"]');
await codeTabs.nth(1).click();
const code = await page.locator('main [role="tabpanel"] [role="tablist"]').first().locator('xpath=..').locator('pre').textContent();
check((await codeTabs.nth(1).getAttribute('aria-selected')) === 'true' && code.includes('pnpm add'), 'code tabs switch (pnpm)');

// copy button
await page.locator('button[aria-label="Copy code"]').first().click();
const clip = await page.evaluate(() => navigator.clipboard.readText());
check(clip.includes('@kbach/'), 'copy button copies the code (' + clip.slice(0, 40) + ')');

// setup picker: one page, four setups
const setups = await page.$$eval('[role="tablist"][aria-label="Choose your setup"] [role="tab"]', (els) => els.map((e) => e.textContent));
check(setups.length === 4, 'setup picker has 4 tabs (' + setups.join(' | ') + ')');
const tocTexts = () => page.$$eval('nav[aria-label="On this page"] a', (as) => as.map((a) => a.textContent));
check((await tocTexts()).includes('Add the plugin') && !(await tocTexts()).includes('Add the Babel plugin'), 'TOC lists only the Vite tab headings');
await page.click('[role="tab"]#tab-nextjs');
await page.waitForTimeout(150);
check(page.url().endsWith('/installation?tab=nextjs'), 'picking Next.js puts ?tab=nextjs in the URL (' + page.url().replace(base, '') + ')');
check(!!(await page.$('#next-plugin')) && !(await page.$('#vite-plugin')), 'only the Next.js steps are shown');
const toc2 = await tocTexts();
check(toc2.includes('Add the PostCSS plugin') && !toc2.includes('Add the plugin') && toc2.includes('Check your setup'), 'TOC follows the tab and keeps shared sections (' + toc2.join(', ') + ')');
// keyboard: arrow right moves to React Native
await page.focus('#tab-nextjs');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
check(page.url().endsWith('?tab=react-native') && (await page.evaluate(() => document.activeElement.id)) === 'tab-react-native', 'arrow key moves to the next setup');
// remembered: visiting /installation again opens React Native
await page.goto(base + '/installation', { waitUntil: 'networkidle' });
check(!!(await page.$('#rn-babel')), 'the chosen setup is remembered on the next visit');
await page.screenshot({ path: shots + '/installation-rn-dark.png' });
// steps are numbered
const nums = await page.$$eval('[role="tabpanel"] > ol > li > a[aria-label^="Step"]', (as) => as.map((a) => a.textContent));
check(nums.join('') === '12345', 'React Native steps are numbered 1-5 (' + nums.join(',') + ')');
// the tab bar stays visible while reading the steps
await page.evaluate(() => document.getElementById('rn-use').scrollIntoView());
await page.waitForTimeout(300);
const bar = await page.$eval('[role="tablist"][aria-label="Choose your setup"]', (el) => Math.round(el.getBoundingClientRect().top));
const step = await page.$eval('#rn-use', (el) => Math.round(el.getBoundingClientRect().top));
check(bar === 64 && step >= 120, 'tab bar sticks under the header and the step shows below it (bar ' + bar + ', step ' + step + ')');
await page.screenshot({ path: shots + '/installation-sticky.png' });
// switching tabs from down the page goes back to the start of the new steps
await page.click('#tab-html');
await page.waitForTimeout(300);
const firstStep = await page.$eval('#html-script', (el) => Math.round(el.getBoundingClientRect().top));
check(firstStep > 100 && firstStep < 400, 'switching while scrolled shows the new first step (top ' + firstStep + ')');
await page.click('#tab-react-native');
await page.waitForTimeout(200);

// TOC scrollspy inside a tab
await page.goto(base + '/installation?tab=nextjs', { waitUntil: 'networkidle' });
await page.evaluate(() => document.getElementById('next-markers').scrollIntoView());
await page.waitForTimeout(300);
const activeToc = await page.$eval('nav[aria-label="On this page"] a.text-accent', (a) => a.textContent).catch(() => null);
check(activeToc === 'Mark where the CSS goes', 'TOC marks the section being read (' + activeToc + ')');

// old URLs redirect to the pages that replaced them, keeping a #section
for (const [from, to, h1] of [['/cdn', '/plain-html', 'Plain HTML'], ['/tailwind-differences#values-follow-tailwind-css-v43', '/coming-from-tailwind#values-follow-tailwind-css-v43', 'Coming from Tailwind CSS']]) {
  await page.goto(base + from, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  check(page.url().endsWith(to) && (await page.textContent('main h1')) === h1, from + ' redirects to ' + to);
}
// an address from before every page had its language gets the English page (through the 404
// page, whose 404 status the browser logs as an error: a tab that doesn't count errors)
{
  // old addresses: the pages were under /en and /km from 2026-11-19 to 2026-11-27 (the 404
  // page's script drops it; vercel.json redirects them live), and moved pages (REDIRECTS)
  const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const old = await fresh.newPage();
  for (const [from, to, h1] of [['/en/colors', '/colors', 'Colors'], ['/km/installation?tab=html#html-self-host', '/installation?tab=html#html-self-host', 'Installation'], ['/cdn', '/plain-html', 'Plain HTML'], ['/en', '/', null], ['/en/playground', '/playground', null]]) {
    await old.goto(base + from, { waitUntil: 'networkidle' });
    await old.waitForTimeout(150);
    check(old.url() === base + to && (h1 === null || (await old.textContent('main h1')) === h1), from + ' (an old address) goes to ' + to);
  }
  await fresh.close();
}
// a deep link into another tab opens that tab at the heading
await page.goto(base + '/installation?tab=html#html-self-host', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const dl = await page.$eval('#html-self-host', (el) => Math.round(el.getBoundingClientRect().top));
check(dl >= 125 && dl <= 145, 'deep link into a tab lands below the sticky tab bar (top ' + dl + ')');
// search finds a heading inside a tab and opens that tab
await page.goto(base + '/installation?tab=vite', { waitUntil: 'networkidle' });
await page.keyboard.press('Control+k');
await page.waitForSelector('[role="dialog"] input');
await page.keyboard.type('babel plugin');
await page.waitForTimeout(100);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
check(page.url().includes('tab=react-native') && !!(await page.$('#rn-babel')), 'search result inside a tab opens that tab (' + page.url().replace(base, '') + ')');
await page.goto(base + '/installation', { waitUntil: 'networkidle' });

// search: Ctrl+K, type, Enter
await page.keyboard.press('Control+k');
await page.waitForSelector('[role="dialog"] input');
await page.keyboard.type('safelist');
await page.waitForTimeout(100);
const hits = await page.$$eval('[role="option"]', (els) => els.map((e) => e.textContent));
check(hits.length > 0, 'search finds results for "safelist" (' + hits.length + ')');
await page.screenshot({ path: shots + '/search.png' });
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
check(!(await page.$('[role="dialog"]')) && page.url().includes('safelist'), 'Enter opens the result (' + page.url().replace(base, '') + ')');

// client-side navigation via sidebar keeps the SPA (no full reload)
await page.evaluate(() => (window.__spa = 1));
await page.click('aside a[href="/variants"]');
await page.waitForTimeout(200);
check((await page.evaluate(() => window.__spa)) === 1 && page.url().endsWith('/variants'), 'sidebar navigates without a reload');
check((await page.textContent('main h1')) === 'Variants', 'variants page rendered');

// live previews are styled: their classes are safelisted into kbach.css (kb() covers anything newer)
await page.waitForFunction(() => { const b = document.querySelector('main button.bg-indigo-6'); return b && getComputedStyle(b).backgroundColor !== 'rgba(0, 0, 0, 0)'; }, null, { timeout: 10000 });
const btnBg = await page.evaluate(() => {
  const b = document.querySelector('main button.bg-indigo-6');
  return b && getComputedStyle(b).backgroundColor;
});
check(btnBg === 'rgb(99, 102, 241)', 'preview button styled by runtime engine (' + btnBg + ')');
// regression: runtime rules from previews (".grid") used to beat kbach.css's lg:hidden
const chrome = await page.evaluate(() => ({
  menu: getComputedStyle(document.querySelector('button[aria-label="Open navigation"]')).display,
  search: getComputedStyle(document.querySelector('header button[aria-label="Search"]')).display,
}));
check(chrome.menu === 'none' && chrome.search === 'none', 'mobile-only header buttons stay hidden on desktop after the engine loads (' + JSON.stringify(chrome) + ')');
const surface = await page.goto(base + '/theme-colors', { waitUntil: 'networkidle' }).then(() =>
  page.waitForFunction(() => {
    const el = document.querySelector('main .bg-surface');
    return el && getComputedStyle(el).backgroundColor;
  }).then((h) => h.jsonValue()),
);
check(surface === 'rgb(17, 24, 39)', 'bg-surface preview uses the dark surface value (' + surface + ')');
await page.goBack({ waitUntil: 'networkidle' });
// peer switch toggles
const knob = page.locator('main label:has(input.peer) span').first();
const before = await knob.evaluate((el) => getComputedStyle(el).backgroundColor);
await page.locator('main label:has(input.peer)').first().click();
await page.waitForTimeout(400); // transition-colors runs 150ms
const after = await knob.evaluate((el) => getComputedStyle(el).backgroundColor);
check(before !== after, 'peer-checked switch changes color (' + before + ' -> ' + after + ')');
await page.locator('main h2#styling-from-a-sibling-peer').scrollIntoViewIfNeeded();
await page.screenshot({ path: shots + '/variants-dark.png' });

// a preview: the result, and its source one tab away
const canvasBox = page.locator('main [data-preview-canvas]').first();
const ex = canvasBox.locator('xpath=..');
const shownFirst = (await canvasBox.boundingBox()).height;
await ex.locator('[role="tab"]:has-text("Code")').click();
check(!(await canvasBox.isVisible()) && (await ex.locator('pre').textContent()).includes('<'), 'a preview\'s Code tab shows its source (' + Math.round(shownFirst) + 'px preview)');
await ex.locator('[role="tab"]:has-text("Preview")').click();

// utility reference: tables are made by the engine, with Kbach's default theme
await page.goto(base + '/spacing', { waitUntil: 'networkidle' });
await page.waitForFunction(() => [...document.querySelectorAll('main td')].some((t) => t.textContent === 'p-4'), null, { timeout: 15000 });
const p4 = await page.evaluate(() => [...document.querySelectorAll('main td')].find((t) => t.textContent === 'p-4').nextElementSibling.textContent);
check(p4 === 'padding: 16px;', 'the reference table gives p-4 its real CSS (' + p4 + ')');
await page.goto(base + '/effects', { waitUntil: 'networkidle' });
await page.waitForFunction(() => [...document.querySelectorAll('main td')].some((t) => t.textContent === 'shadow-lg'), null, { timeout: 15000 });
const lg = await page.evaluate(() => [...document.querySelectorAll('main td')].find((t) => t.textContent === 'shadow-lg').nextElementSibling.textContent);
check(lg === 'box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);', 'composed utilities show their effective CSS (' + lg + ')');
await page.goto(base + '/typography', { waitUntil: 'networkidle' });
await page.waitForFunction(() => [...document.querySelectorAll('main td')].some((t) => t.textContent === 'font-sans'), null, { timeout: 15000 });
const sans = await page.evaluate(() => [...document.querySelectorAll('main td')].find((t) => t.textContent === 'font-sans').nextElementSibling.textContent);
check(sans.startsWith('font-family: ui-sans-serif'), 'tables use the default theme, not this site\'s fonts (' + sans.slice(0, 40) + '…)');

// playground: HTML + a script on a sandboxed canvas (an opaque origin: the page reaches it only through Playwright's frame API)
await page.goto(base + '/playground', { waitUntil: 'networkidle' });
const canvasFrame = () => page.frames().find((f) => f !== page.mainFrame() && f.url() === 'about:srcdoc');
const canvasEval = async (fn, arg) => {
  for (let i = 0; i < 50; i++) {
    try {
      return await canvasFrame().evaluate(fn, arg);
    } catch (e) {
      // the canvas was just replaced (a fresh run): try again
      await page.waitForTimeout(100);
    }
  }
  throw new Error('canvas never settled');
};
await page.waitForFunction(() => document.querySelector('iframe[title="Playground canvas"]')?.srcdoc.includes('One set of classes'), null, { timeout: 15000 });
await page.waitForTimeout(800);
const landing = await canvasEval(() => ({
  radius: getComputedStyle(document.querySelector('.rounded-xl')).borderTopLeftRadius,
  command: document.getElementById('command').textContent,
}));
check(landing.radius === '12px' && landing.command === 'npm install @kbach/react', 'playground renders the first example and runs its script (' + JSON.stringify(landing) + ')');
// its own page: full screen, the code beside the preview, nothing of the docs around it
const boxes = await page.evaluate(() => {
  const ed = document.querySelector('.cm-editor').closest('section').getBoundingClientRect();
  const pv = document.querySelector('iframe[title="Playground canvas"]').closest('section').getBoundingClientRect();
  return { beside: pv.left >= ed.right - 1, bottom: Math.round(Math.max(ed.bottom, pv.bottom)), scrollH: document.documentElement.scrollHeight };
});
const pgChrome = await page.evaluate(() => ({
  header: !!document.querySelector('header'),
  footer: !!document.querySelector('footer'),
  sidebar: !!document.querySelector('aside nav[aria-label="Documentation"]'),
  text: !!document.querySelector('main article'),
  examplesMenu: !!document.querySelector('button[aria-haspopup="menu"]:not([aria-label="More"]):not([aria-label="Layout"])'),
  fullScreenToggle: !!document.querySelector('button[aria-label="Full screen"], button[aria-label="Leave full screen"]'),
}));
check(Object.values(pgChrome).every((v) => !v), 'the playground alone: no navbar, footer, sidebar, page text, examples menu or full-screen toggle ' + JSON.stringify(pgChrome));
check(boxes.beside && boxes.bottom <= 900 && boxes.scrollH <= 900, 'full screen: code beside the preview, filling the window without scrolling ' + JSON.stringify(boxes));

// responsive: the navbar's links show from md up, and its menu button works below
await openExample(page, base, 'navbar');
await page.click('button[title="Phone, 390×844"]');
await page.waitForTimeout(1200);
const links390 = await canvasEval(() => getComputedStyle(document.querySelector('.md\\:flex')).display);
await canvasFrame().click('#menu');
await page.waitForTimeout(400);
const menuOpen = await canvasEval(() => ({ expanded: document.getElementById('menu').getAttribute('aria-expanded'), opacity: getComputedStyle(document.getElementById('panel')).opacity }));
check(links390 === 'none' && menuOpen.expanded === 'true' && menuOpen.opacity === '1', 'at 390px the links fold away and the menu button opens the panel (' + JSON.stringify(menuOpen) + ')');
await page.click('button[title="Desktop, 1280×800"]');
await page.waitForTimeout(700);
const links1280 = await canvasEval(() => getComputedStyle(document.querySelector('.md\\:flex')).display);
check(links1280 === 'flex', 'at 1280px the links show (md: from the canvas width)');
// phone: real size, scaled into the panel, and rotation
await page.click('button[title="Phone, 390×844"]');
await page.waitForTimeout(600);
const phone = await page.evaluate(() => { const f = document.querySelector('iframe[title="Playground canvas"]'); return { w: f.offsetWidth, h: f.offsetHeight }; });
check(phone.w === 390 && phone.h === 844, 'phone view is 390×844 (' + JSON.stringify(phone) + ')');
await page.click('button[aria-label="Rotate to landscape"]');
await page.waitForTimeout(700);
const turned = await page.evaluate(() => { const f = document.querySelector('iframe[title="Playground canvas"]'); return f.offsetWidth + 'x' + f.offsetHeight; });
const linksTurned = await canvasEval(() => getComputedStyle(document.querySelector('.md\\:flex')).display);
check(turned === '844x390' && linksTurned === 'flex', 'rotating the phone swaps it to 844×390, and md: kicks in (' + turned + ')');
await page.click('button[aria-label="Rotate to portrait"]');
await page.click('button[title="Fill the panel"]');

// dark canvas
const darkBefore = await canvasEval(() => document.documentElement.classList.contains('dark'));
await page.click('button[aria-label^="Preview in"]');
await page.waitForTimeout(400);
const darkAfter = await canvasEval(() => document.documentElement.classList.contains('dark'));
check(darkBefore !== darkAfter, 'canvas dark mode toggles on its own');

// runtime classes: the color explorer builds bg-<family>-<shade> in its script, and the CSS follows
await openExample(page, base, 'colors');
await page.waitForTimeout(700);
await canvasFrame().click('button[title="rose"]');
await canvasFrame().fill('#shade', '9');
await page.waitForTimeout(800);
const card = await canvasEval(() => ({ cls: document.getElementById('card').className, bg: getComputedStyle(document.getElementById('card')).backgroundColor }));
check(card.cls.includes('bg-rose-9') && card.bg !== 'rgba(0, 0, 0, 0)', 'a class the script builds at runtime gets its CSS (' + card.bg + ')');

// typing, the Tailwind-shade fix, and the script tab
await page.click('button[role="tab"]:has-text("script")');
await page.fill('.cm-editor:visible .cm-content', '');
await page.click('button[role="tab"]:has-text("index.html")');
// (a whole page, as HTML mode has one: kbach.config.js, then Kbach's CDN script, which styles #t)
await page.fill('.cm-editor:visible .cm-content', cdnPage('<div id="t" class="p-6 rounded-xl bg-blue-500 text-white">hi</div><img src="x" onerror="try { parent.__pwned = 1 } catch {}">'));
await page.waitForTimeout(800);
const fix = page.locator('section[aria-label="Code"] button:has-text("Fix 1 class")');
check((await fix.count()) === 1, 'unknown bg-blue-500: the editor status bar offers Fix 1 class');
await fix.click();
await page.waitForTimeout(800);
const fixed = await page.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent).join('\n'));
// (the CDN script styles the new class a moment after the page changes)
let bg = '';
for (let i = 0; i < 40 && bg !== 'rgb(59, 130, 246)'; i++) {
  bg = await canvasEval(() => getComputedStyle(document.getElementById('t')).backgroundColor);
  if (bg !== 'rgb(59, 130, 246)') await page.waitForTimeout(100);
}
check(fixed.includes('bg-blue-6 ') && bg === 'rgb(59, 130, 246)', 'one click applies the fix (' + bg + ')');

// a script runs, logs to the Console tab, and still can't reach the docs page
await page.click('button[role="tab"]:has-text("script")');
await page.fill('.cm-editor:visible .cm-content', [
  "document.getElementById('t').textContent = 'from the script';",
  "console.log('hello', { a: 1 });",
  "let reached = 'no';",
  "try { parent.document.title = 'pwned'; reached = 'yes'; } catch { }",
  "try { parent.localStorage.setItem('pwned', '1'); reached = 'yes'; } catch { }",
  "console.info('reached the page:', reached);",
].join('\n'));
await page.waitForTimeout(1500);
const ran = await canvasEval(() => document.getElementById('t').textContent);
await page.click('button:has-text("Console")');
const consoleText = await page.locator('section:has(iframe) .font-mono.leading-5').innerText();
check(ran === 'from the script' && consoleText.includes('hello { a: 1 }'), 'the script runs and console.log shows in the Console tab');
check(consoleText.includes('reached the page: no') && (await page.title()) !== 'pwned' && (await page.evaluate(() => window.__pwned === undefined && localStorage.getItem('pwned') === null)), 'the script and inline handlers cannot reach the docs page');
// an infinite loop is stopped, with its line
await page.fill('.cm-editor:visible .cm-content', 'let n = 0;\nwhile (true) {\n  n++;\n}');
await page.waitForTimeout(4500);
const loopText = await page.locator('section:has(iframe) .font-mono.leading-5').innerText();
check(/Stopped the loop on line 2/.test(loopText) && loopText.includes('script.js:2'), 'an infinite loop is stopped and reported with its line');
// TypeScript
await page.click('[aria-label="Script language"] button:has-text("TS")');
await page.fill('.cm-editor:visible .cm-content', "interface P { n: number }\nconst p: P = { n: 2 };\nconsole.log('ts', p.n * 21);");
await page.waitForTimeout(1500);
const tsText = await page.locator('section:has(iframe) .font-mono.leading-5').innerText();
check(tsText.includes('ts 42') && (await page.$('button[role="tab"]:has-text("script.ts")')) !== null, 'TypeScript compiles and runs (script.ts)');
await page.click('button:has-text("Preview")');

// the generated CSS: the editor's kbach.css tab
await page.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("kbach.css")');
const generated = await page.$$eval('.cm-editor:visible .cm-line', (ls) => ls.map((l) => l.textContent).join(String.fromCharCode(10)));
check(generated.includes('.rounded-xl {') && generated.includes('.bg-blue-6 {'), 'the kbach.css tab lists the generated rules');
await page.click('[role="tablist"][aria-label="Files"] [role="tab"]:has-text("index.html")');
await page.click('button:has-text("Preview")');

// share link restores the HTML and the script
// (Share goes to the new link: the page loads again from it)
await Promise.all([page.waitForEvent('load'), page.click('button:has-text("Share")')]);
const link = await page.evaluate(() => navigator.clipboard.readText());
check(link.includes('/playground#code=') && link.includes('&js=') && link.includes('&lang=ts'), 'Share copies a link with the code and the script');
await page.evaluate(() => localStorage.clear());
await page.goto('about:blank'); // the link only differs by its #hash: load it fresh
await page.goto(link, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const restored = await page.$$eval('.cm-line', (ls) => ls.map((l) => l.textContent).join('\n'));
const restoredTab = await page.$('button[role="tab"]:has-text("script.ts")');
check(restored.includes('id="t"') && restored.includes('bg-blue-6') && !!restoredTab, 'opening the shared link restores the code and the script');
await page.screenshot({ path: shots + '/playground-dark.png', fullPage: false });

// sidebar: fold a section, and the active link stays in view after Next
await page.goto(base + '/troubleshooting', { waitUntil: 'networkidle' });
const sideLink = async () => page.$eval('aside nav[aria-label="Documentation"] a[aria-current="page"]', (a) => {
  let box = a.parentElement;
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
  const r = a.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  return r.top >= b.top && r.bottom <= b.bottom;
});
await page.setViewportSize({ width: 1440, height: 520 });
await page.goto(base + '/introduction', { waitUntil: 'networkidle' });
for (let k = 0; k < 6; k++) {
  await page.click('nav[aria-label="Previous and next page"] a:has-text("Next")');
  await page.waitForTimeout(250);
}
check(await sideLink(), 'after six Nexts the active sidebar link is in view (' + page.url().replace(base, '') + ')');
await page.setViewportSize({ width: 1440, height: 900 });
const section = page.locator('aside nav[aria-label="Documentation"] button[aria-expanded]').nth(3);
await section.click();
const folded = await section.getAttribute('aria-expanded');
await page.reload({ waitUntil: 'networkidle' });
const stillFolded = await page.locator('aside nav[aria-label="Documentation"] button[aria-expanded]').nth(3).getAttribute('aria-expanded');
check(folded === 'false' && stillFolded === 'false', 'a sidebar section folds, and stays folded after a reload');
await page.locator('aside nav[aria-label="Documentation"] button[aria-expanded]').nth(3).click();

// tables: code stays on one line; scrollbars use the theme
await page.goto(base + '/react-api', { waitUntil: 'networkidle' });
const ws = await page.$eval('main table code', (c) => getComputedStyle(c).whiteSpace);
check(ws === 'nowrap', 'code in a table does not wrap (' + ws + ')');
const sc = await page.evaluate(() => getComputedStyle(document.body).scrollbarColor);
check(/rgb/.test(sc), 'scrollbars use the theme colors (' + sc + ')');

// colors page: palette swatches + copy
await page.goto(base + '/colors', { waitUntil: 'networkidle' });
const swatches = await page.$$('button[aria-label^="Copy bg-"]');
check(swatches.length === 26 * 12, 'palette has 312 swatches (' + swatches.length + ')');
await swatches[5].click();
check((await page.evaluate(() => navigator.clipboard.readText())) === 'bg-gray-6', 'swatch copies its class');
// the "Copied" label sits on the swatch clicked (it was a line under the whole table, out of
// view), and the table's scroller doesn't clip it: not on the top row, not at the right edge
const copiedLabel = (i) =>
  page.evaluate((i) => {
    const btn = document.querySelectorAll('button[aria-label^="Copy bg-"]')[i];
    const label = [...btn.querySelectorAll('span')].find((s) => s.textContent.startsWith('Copied'));
    if (!label) return null;
    const scroller = btn.closest('.overflow-x-auto').getBoundingClientRect();
    const l = label.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    return { text: label.textContent.trim(), above: l.bottom <= b.top + 1 && b.top - l.bottom < 12, inside: l.top >= scroller.top && l.right <= scroller.right + 0.5 && l.left >= scroller.left - 0.5 };
  }, i);
let lbl = await copiedLabel(5);
check(lbl?.text === 'Copied bg-gray-6' && lbl.above && lbl.inside, 'the swatch shows "Copied bg-gray-6" right above it ' + JSON.stringify(lbl));
await swatches[11].click();
lbl = await copiedLabel(11);
check(lbl?.text === 'Copied bg-gray-12' && lbl.inside, 'at the right edge too, inside the table ' + JSON.stringify(lbl));
await page.waitForTimeout(1600);
check((await copiedLabel(11)) === null, 'and it goes away after a moment');
await page.screenshot({ path: shots + '/colors-dark.png' });

// light screenshots of intro
await page.click('[role="radio"][aria-label="Light"]');
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.screenshot({ path: shots + '/intro-light.png' });
await page.screenshot({ path: shots + '/intro-light-full.png', fullPage: true });

// deep link with hash
await page.goto(base + '/dark-mode#avoid-a-flash-on-load', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const top = await page.$eval('#avoid-a-flash-on-load', (el) => el.getBoundingClientRect().top);
check(Math.round(top) === 72, 'deep link puts the h2 divider just under the 64px header (top ' + Math.round(top) + ')');
// clicking TOC links: each lands under the header, and the TOC marks the one clicked
for (const id of ['the-kbach-object', 'add-a-toggle', 'a-default-mode', 'react-native']) {
  if (!(await page.$('#' + id))) continue;
  await page.click('nav[aria-label="On this page"] a[href="#' + id + '"]');
  await page.waitForTimeout(700);
  const r = await page.$eval('#' + id, (el) => ({ top: Math.round(el.getBoundingClientRect().top), text: Math.round(el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop)) }));
  const active = await page.$eval('nav[aria-label="On this page"] a.text-accent', (a) => a.getAttribute('href'));
  const atBottom = await page.evaluate(() => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4);
  check((atBottom || (r.text >= 72 && r.text <= 110)) && (atBottom || active === '#' + id), 'TOC link #' + id + ': text at ' + r.text + 'px, active ' + active + (atBottom ? ' (page end)' : ''));
}

// 404
await page.goto(base + '/nope', { waitUntil: 'networkidle' });
check((await page.textContent('main h1')) === 'Page not found', '404 page');

// mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true });
const mp = await m.newPage();
mp.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message));
await mp.goto(base + '/variants', { waitUntil: 'networkidle' });
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check(overflow <= 0, 'no horizontal page scroll on mobile (' + overflow + 'px)');
check(await mp.evaluate(() => document.documentElement.classList.contains('dark')), 'system dark mode followed on first visit');
await mp.screenshot({ path: shots + '/mobile-variants.png' });
await mp.click('button[aria-label="Open navigation"]');
await mp.waitForTimeout(400);
await mp.screenshot({ path: shots + '/mobile-menu.png' });
await mp.click('[aria-hidden="false"] a[href="/colors"]');
await mp.waitForTimeout(400);
check(mp.url().endsWith('/colors') && (await mp.evaluate(() => document.body.style.overflow)) === '', 'mobile menu navigates and closes');

check(errors.length === 0, 'no page errors' + (errors.length ? ':\n   ' + errors.join('\n   ') : ''));
await browser.close();
console.log(failures === 0 ? '\nALL PASSED' : '\n' + failures + ' FAILED');
process.exit(failures ? 1 : 0);
