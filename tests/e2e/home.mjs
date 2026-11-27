// The home page (/): what's on it, that what it shows is the engine's real output, that it fits
// every width, and where its links go.
import { chromium, firefox } from 'playwright';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);

check((await p.title()).startsWith('Kbach'), 'the home page has its own title (' + (await p.title()) + ')');
const h1 = await p.$eval('h1', (e) => e.textContent);
check(h1.includes('Write a class once'), 'the hero headline: ' + h1);
check((await p.$('aside nav[aria-label="Documentation"]')) === null, 'no docs sidebar on the home page');
const sections = await p.$$eval('main h2', (hs) => hs.map((h) => h.textContent));
check(
  sections.join(' / ') === 'Read a class like a sentence / 26 colors, 12 shades each / A wrong class gets a name, not a blank space / Three ways in / Everything in the docs',
  'it has its sections: ' + sections.join(' / '),
);

// every class on the page has CSS (a class the engine doesn't know would be bare)
const missing = await p.evaluate(() => {
  const text = [...document.styleSheets].map((s) => {
    try {
      return [...s.cssRules].map((r) => r.cssText).join('\n');
    } catch {
      return '';
    }
  }).join('\n');
  const tokens = new Set([...document.querySelectorAll('main [class]')].flatMap((e) => String(e.className.baseVal ?? e.className).split(/\s+/).filter(Boolean)));
  return [...tokens].filter((t) => !text.includes('.' + CSS.escape(t)));
});
check(missing.length === 0, 'every class on it has CSS' + (missing.length ? ': missing ' + missing.join(' ') : ''));

// the setup command: Copy copies it
{
  const init = await p.$eval('[data-init]', (c) => c.textContent);
  check(init === 'npx @kbach/cli init', 'the hero gives the setup command (' + init + ')');
  await p.click('[data-init] + button[aria-label="Copy code"]');
  await p.waitForTimeout(200);
  check((await p.evaluate(() => navigator.clipboard.readText())) === init, 'Copy copies it');
}

// What the page shows is real: the hero's class and its three outputs, the class read word by
// word, the warning in the terminal, all checked against the installed engine (@kbach/core-engine)
// and build plugin (@kbach/react/vite). A page that tells readers what Kbach does must not make it up.
{
  const require = createRequire(import.meta.url);
  const engine = require('@kbach/core-engine/node');
  const { defaultTheme } = require('@kbach/react');
  const theme = JSON.stringify(defaultTheme);
  const shown = await p.evaluate(() => ({
    cls: document.querySelector('[data-hero-class]').textContent,
    // (line by line: the code view draws each line as its own element, with no line breaks in its text)
    outputs: Object.fromEntries([...document.querySelectorAll('[data-output]')].map((o) => [o.dataset.output, [...o.querySelectorAll('pre code > span')].map((l) => l.textContent).join('\n')])),
    words: [...document.querySelectorAll('[data-word] code')].map((c) => c.textContent),
    terminal: document.querySelector('[data-terminal]').textContent.replace(/\s+/g, ' '),
    swatches: [...document.querySelectorAll('[data-swatch]')].filter((s) => getComputedStyle(s).backgroundColor !== 'rgba(0, 0, 0, 0)').length,
  }));
  const cls = shown.cls.match(/class="([^"]+)"/)[1];
  // web: every declaration shown is one the engine writes for these classes ("…" ends a shortened value)
  const css = cls.split(' ').flatMap((c) => JSON.parse(engine.generate_css(c, theme)).rules.map((r) => r.rule)).join('\n');
  // (the declarations inside the rules, not the @media line; "…" ends a value shortened on the page)
  const decls = shown.outputs.web
    .split('\n')
    .filter((line) => !line.trim().startsWith('@'))
    .flatMap((line) => [...line.matchAll(/([a-z-]+): ([^;}]+)/g)].map((m) => [m[1], m[2].trim()]));
  const wrong = decls.filter(([prop, value]) => !css.includes(prop + ': ' + value.split('…')[0]));
  const selectors = cls.split(' ').every((c) => shown.outputs.web.includes('.' + c.replace(':', '\\:')));
  check(decls.length >= 4 && wrong.length === 0 && selectors && shown.outputs.web.includes('@media (min-width: 768px)'), 'the web output is the engine’s CSS for ' + cls + (wrong.length ? ': not the engine’s ' + JSON.stringify(wrong) : ''));
  // React Native: the style object, key for key, at a phone's width
  const style = JSON.parse(engine.resolve_style_json(cls, theme, 'light', false, 390));
  const pairs = Object.fromEntries([...shown.outputs.native.matchAll(/(\w+): ('[^']*'|[\d.]+)/g)].map((m) => [m[1], m[2].startsWith("'") ? m[2].slice(1, -1) : Number(m[2])]));
  check(JSON.stringify(Object.keys(pairs).sort()) === JSON.stringify(Object.keys(style).sort()) && Object.entries(pairs).every(([k, v]) => style[k] === v), 'the React Native output is the engine’s style object ' + JSON.stringify({ shown: pairs, engine: style }));
  const wide = JSON.parse(engine.resolve_style_json(cls, theme, 'light', false, 768));
  check(wide.padding === 40, 'and at 768 wide, padding is 40, as its note says (' + wide.padding + ')');
  check(shown.outputs.html.includes('class="' + cls + '"') && shown.outputs.html.includes('https://cdn.jsdelivr.net/npm/@kbach/browser'), 'the HTML output is the same class with the CDN script');
  // the class read word by word: each word is a class the engine knows
  const unknown = shown.words.filter((w) => !JSON.parse(engine.generate_css(w, theme)).rules.length);
  check(shown.words.length === 6 && unknown.length === 0, 'the class read word by word: six words the engine knows ' + JSON.stringify(shown.words) + (unknown.length ? ' unknown: ' + unknown : ''));
  // the terminal: the build plugin's own wording, and the engine's own suggestion
  // (the built plugin writes the two dashes as escapes: \u2014 and \u2013)
  const source = readFileSync(require.resolve('@kbach/react/vite'), 'utf-8').replace(/\\u2014/g, '—').replace(/\\u2013/g, '–');
  check(
    shown.terminal.includes('Unknown class bg-blue-600 — did you mean bg-blue-7? Kbach color shades run 1–12, not 50–950.') &&
      engine.suggest_class('bg-blue-600', theme) === 'bg-blue-7' &&
      source.includes('"Unknown class"') && source.includes('"— did you mean"') && source.includes('" Kbach color shades run 1–12, not 50–950."'),
    'the terminal shows the plugin’s real warning, with the engine’s real suggestion',
  );
  check(shown.swatches === 26 * 12, 'the palette strip has every family and shade, each with its color (' + shown.swatches + ')');
  // the contents: seven parts, every docs page listed under its part
  const parts = await p.$$eval('[data-part]', (ps) => ps.map((x) => x.querySelectorAll('ul a').length));
  const nav = [...readFileSync(new URL('../../src/lib/docs.ts', import.meta.url), 'utf-8').matchAll(/title: '([^']+)',\s*pages: \[([^\]]*)\]/g)].map((m) => [...m[2].matchAll(/'([^']+)'/g)].length);
  check(JSON.stringify(parts) === JSON.stringify(nav), 'the contents list every part and page of the sidebar ' + JSON.stringify(parts));
}

// every internal link lands on a real page
const links = [...new Set(await p.$$eval('main a[href^="/"]', (as) => as.map((a) => a.getAttribute('href'))))];
const bad = [];
for (const href of links) {
  const t = await ctx.newPage();
  await t.goto(BASE + href, { waitUntil: 'networkidle' });
  const notFound = await t.$('text=Page not found');
  if (notFound) bad.push(href);
  await t.close();
}
check(bad.length === 0 && links.length > 20, links.length + ' internal links, all real pages' + (bad.length ? ': broken ' + bad.join(' ') : ''));

// the hero's Get started goes to the introduction, which is a docs page with the sidebar
await p.click('main a:has-text("Get started")');
await p.waitForTimeout(500);
check(new URL(p.url()).pathname === '/introduction' && (await p.$('aside nav[aria-label="Documentation"]')) !== null, 'Get started opens /introduction, with the sidebar');
const crumb = await p.$eval('main article > div:first-child', (e) => e.textContent);
check(crumb.includes('Getting started') && crumb.includes('Introduction'), 'a doc page names its section and page above the title: ' + crumb);

// fits every width, in both themes
for (const [w, scheme] of [[320, 'light'], [390, 'dark'], [768, 'light'], [1024, 'dark'], [1440, 'light'], [1920, 'dark']]) {
  const t = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.waitForTimeout(300);
  const m = await t.evaluate(() => ({
    over: document.documentElement.scrollWidth - innerWidth,
    h1: Math.round(document.querySelector('h1').getBoundingClientRect().right),
    vw: innerWidth,
  }));
  check(m.over <= 0 && m.h1 <= m.vw, w + 'px ' + scheme + ': no sideways scroll ' + JSON.stringify(m));
  if (w === 390 || w === 1440) await t.screenshot({ path: 'shots/home-' + w + '-' + scheme + '.png', fullPage: true });
  await t.close();
}

// dark mode details (each was a reported bug)
{
  const t = await b.newPage({ viewport: { width: 1920, height: 1000 }, colorScheme: 'dark' });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.waitForTimeout(400);
  const d = await t.evaluate(() => {
    const grad = getComputedStyle(document.querySelector('h1 span')).backgroundImage;
    // the top light spans the window, not the 90rem column
    const backdrop = document.querySelector('main').previousElementSibling.getBoundingClientRect();
    return { grad, backdropWidth: Math.round(backdrop.width), vw: innerWidth };
  });
  check(!d.grad.includes('141, 105, 56'), 'the headline gradient has no dark bronze in dark mode');
  check(d.backdropWidth === d.vw, 'the hero light spans the whole 1920px window (' + d.backdropWidth + ')');
  await t.close();
}
// a preview's Code tab wraps long class lists, and is as tall as its code
{
  const t = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await t.goto(BASE + '/variants', { waitUntil: 'networkidle' });
  await t.waitForTimeout(500);
  const box = await t.evaluateHandle(() => [...document.querySelectorAll('[data-preview-canvas]')].find((c) => c.textContent.includes('Odd rows')).parentElement);
  await (await box.$('button[role="tab"]:has-text("Code")')).click();
  await t.waitForTimeout(200);
  const c = await box.evaluate((el) => {
    const pre = el.querySelector('pre');
    const panel = pre.parentElement;
    return { sideways: pre.scrollWidth - pre.clientWidth, gap: Math.round(panel.getBoundingClientRect().bottom - pre.getBoundingClientRect().bottom) };
  });
  check(c.sideways <= 0 && c.gap <= 1, 'the Code tab wraps (no sideways scroll) and has no empty space under the code ' + JSON.stringify(c));
  // like the playground editor: a line breaks only at a space, never inside a class (dark:divide-gray-|9)
  const split = await box.evaluate((el) => [...el.querySelectorAll('pre .whitespace-nowrap')].filter((s) => s.getClientRects().length > 1).map((s) => s.textContent));
  check(split.length === 0, 'no class in the Code tab is split across rows' + (split.length ? ': ' + split.join(' ') : ''));
  await t.close();
}
// the hero has no demo: trying classes is the playground's job
{
  const t = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const hero = await t.evaluate(() => {
    const section = document.querySelector('main section');
    return { demo: !!section.querySelector('[data-demo], [aria-label="Accent"]'), playground: !!section.querySelector('a[href="/playground"]') };
  });
  check(!hero.demo && hero.playground, 'the hero has no demo panel, and links to the playground ' + JSON.stringify(hero));
  await t.close();
}

// docs code blocks follow the theme: paper with deep colors in light, slate in dark
for (const scheme of ['light', 'dark']) {
  const t = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  await t.goto(BASE + '/dark-mode', { waitUntil: 'networkidle' });
  const c = await t.evaluate(() => {
    const g = document.querySelector('main .group\\/code');
    const lum = (rgb) => {
      const [r, g2, b2] = rgb.match(/\d+/g).map(Number);
      return (0.299 * r + 0.587 * g2 + 0.114 * b2) / 255;
    };
    const bg = getComputedStyle(g).backgroundColor;
    const tokens = [...g.querySelectorAll('pre span[class*="text-"]')].map((s) => getComputedStyle(s).color);
    // the darkest-on-light (or lightest-on-dark) contrast between a token and the background
    const worst = Math.min(...tokens.map((tc) => Math.abs(lum(tc) - lum(bg))));
    return { bg, light: lum(bg) > 0.5, worst: Math.round(worst * 100) / 100 };
  });
  check(c.light === (scheme === 'light') && c.worst >= 0.3, scheme + ': code blocks have a ' + scheme + ' background and every token stands out from it ' + JSON.stringify(c));
  await t.close();
}
// the docs' title light fades out inside the column on a phone (no hard edges)
{
  const t = await b.newPage({ viewport: { width: 460, height: 400 }, colorScheme: 'dark' });
  await t.goto(BASE + '/layout', { waitUntil: 'networkidle' });
  const glow = await t.evaluate(() => getComputedStyle(document.querySelector('main#content > div[aria-hidden]')).backgroundImage);
  check(/radial-gradient\(50% 80% at 50% 0%/.test(glow), 'the title light is sized by the column, so it fades out before the edges (' + glow.slice(0, 60) + ')');
  await t.close();
}

// the icon tiles and the logo follow the theme: cream and the light logo in light mode, slate and the dark one in dark mode
for (const scheme of ['light', 'dark']) {
  const t = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const tiles = [];
  for (const path of ['/', '/introduction', '/installation']) {
    await t.goto(BASE + path, { waitUntil: 'networkidle' });
    tiles.push(...(await t.evaluate(() => [...document.querySelectorAll('[class*="dark:bg-logo"]')].filter((e) => e.offsetParent && !e.matches('section')).map((e) => getComputedStyle(e).backgroundColor))));
  }
  const want = scheme === 'light' ? 'rgb(245, 234, 210)' : 'rgb(46, 57, 63)';
  check(tiles.length >= 10 && tiles.every((c) => c === want), scheme + ': all ' + tiles.length + ' icon tiles are ' + (scheme === 'light' ? 'cream' : 'slate') + ' ' + JSON.stringify([...new Set(tiles)]));
  const logos = await t.evaluate(() => [...document.querySelectorAll('img[src*="kbach-logo"]')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => new URL(i.currentSrc || i.src).pathname));
  check(logos.length > 0 && logos.every((src) => src.includes('-light-') === (scheme === 'light')), scheme + ': only the ' + scheme + ' logo shows (' + [...new Set(logos)].join(', ') + ')');
  await t.close();
}

// motion and layout: the three outputs side by side on a desktop, one under another on a phone;
// content that rises in; a bar on page change
{
  const place = async (t) =>
    t.evaluate(() => {
      const outs = [...document.querySelectorAll('[data-output]')].map((o) => o.getBoundingClientRect());
      return {
        row: outs.length === 3 && outs.every((r) => Math.abs(r.top - outs[0].top) < 2),
        stacked: outs.length === 3 && outs.every((r, i) => i === 0 || r.top >= outs[i - 1].bottom - 1),
        inView: outs.every((r) => r.left >= 0 && r.right <= innerWidth),
        sideways: [...document.querySelectorAll('[data-output] pre')].map((pre) => pre.scrollWidth - pre.clientWidth),
      };
    });
  const phone = await b.newPage({ viewport: { width: 390, height: 800 } });
  await phone.goto(BASE + '/', { waitUntil: 'networkidle' });
  const onPhone = await place(phone);
  check(onPhone.stacked && onPhone.inView, '390px: the three outputs one under another, inside the window ' + JSON.stringify(onPhone));
  // each output has its own arrow down into it (the user asked where the bottom two's were)
  const arrows = await phone.evaluate(() =>
    [...document.querySelectorAll('[data-output]')].map((o) => {
      const a = o.querySelector('[data-phone-arrow]').getBoundingClientRect();
      const label = o.querySelector('p').getBoundingClientRect();
      return a.height > 0 && a.bottom <= label.top + 1 && label.top - a.bottom < 20;
    }),
  );
  check(arrows.length === 3 && arrows.every(Boolean), '390px: an arrow down into each of the three outputs ' + JSON.stringify(arrows));
  await phone.close();
  // a class never breaks across lines (dark:bg-|gray-10 did on a phone), down to 320px wide
  for (const w of [320, 390]) {
    const small = await b.newPage({ viewport: { width: w, height: 800 } });
    await small.goto(BASE + '/', { waitUntil: 'networkidle' });
    const broken = await small.evaluate(() =>
      [...document.querySelectorAll('[data-word] code')]
        // one line: no taller than 1.6 times its font size (a highlighted md: inside makes two boxes, even on one line)
        .filter((c) => c.getBoundingClientRect().height > parseFloat(getComputedStyle(c).fontSize) * 1.6 || c.getBoundingClientRect().right > c.closest('li').getBoundingClientRect().right + 1)
        .map((c) => c.textContent),
    );
    check(broken.length === 0, w + 'px: every class in "Read a class like a sentence" stays whole, inside its column ' + JSON.stringify(broken));
    await small.close();
  }
  const t = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.waitForTimeout(900);
  const onDesktop = await place(t);
  check(onDesktop.row && onDesktop.inView, '1440px: the three outputs side by side ' + JSON.stringify(onDesktop));
  check(onDesktop.sideways.slice(0, 2).every((x) => x <= 0), '1440px: the CSS and the style object fit their columns ' + JSON.stringify(onDesktop.sideways));
  // Like a ruler (the user's word, 2026-11-19): the header, every section and the footer share
  // their left and right edges; every section after the hero has the same line above it and
  // the same 96px above and below; side-by-side things line up (the three output panels are one
  // height, the three install commands sit on one line) and nothing runs past its column.
  const ruler = await t.evaluate(() => {
    const edges = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return [Math.round(r.left + parseFloat(s.paddingLeft)), Math.round(r.right - parseFloat(s.paddingRight))].join('-');
    };
    const sections = [...document.querySelectorAll('main#content section')];
    const rest = sections.slice(1).map((s) => {
      const cs = getComputedStyle(s);
      return cs.paddingTop + '/' + cs.paddingBottom + '/' + cs.borderTopWidth;
    });
    const commands = [...document.querySelectorAll('[data-platform] code')];
    return {
      header: edges(document.querySelector('header > div')),
      sections: [...new Set(sections.map((s) => { const r = s.getBoundingClientRect(); return Math.round(r.left) + '-' + Math.round(r.right); }))],
      footer: edges(document.querySelector('footer')),
      rhythm: [...new Set(rest)],
      heroBottom: getComputedStyle(sections[0]).paddingBottom,
      panels: [...new Set([...document.querySelectorAll('[data-output] > div:not([data-phone-arrow])')].map((d) => Math.round(d.getBoundingClientRect().height)))],
      commandTops: [...new Set(commands.map((c) => Math.round(c.getBoundingClientRect().top)))],
      commandsInside: commands.every((c) => c.getBoundingClientRect().right <= c.closest('[data-platform]').getBoundingClientRect().right + 1),
    };
  });
  check(ruler.sections.length === 1 && ruler.sections[0] === ruler.header && ruler.footer === ruler.header, '1440px: the header, every section and the footer share their edges ' + JSON.stringify(ruler));
  check(ruler.rhythm.length === 1 && ruler.rhythm[0] === '96px/96px/1px' && ruler.heroBottom === '96px', '1440px: every section has the same line and 96px above and below ' + JSON.stringify(ruler.rhythm));
  check(ruler.panels.length === 1 && ruler.commandTops.length === 1 && ruler.commandsInside, '1440px: the output panels are one height, the install commands on one line and inside their columns ' + JSON.stringify(ruler));
  // the class-to-outputs diagram: centered, and each arrow lands on the middle of its output (they shared
  // a grid with a different gap, and the <figure>'s default 40px margins pushed everything right)
  const tree = await t.evaluate(() => {
    const mid = (el) => Math.round(el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2);
    const main = document.querySelector('main#content').getBoundingClientRect();
    return {
      pill: mid(document.querySelector('[data-hero-class]')) - Math.round(main.left + main.width / 2),
      arrows: [...document.querySelectorAll('[data-arrows] > div.flex')].map(mid),
      outputs: [...document.querySelectorAll('[data-output]')].map(mid),
      figureMargins: [...document.querySelectorAll('main figure')].map((f) => getComputedStyle(f).marginLeft + ' ' + getComputedStyle(f).marginRight),
    };
  });
  check(Math.abs(tree.pill) <= 1 && JSON.stringify(tree.arrows) === JSON.stringify(tree.outputs) && tree.figureMargins.every((m) => m === '0px 0px'), '1440px: the class is centered, each arrow lands on its output, no figure margins ' + JSON.stringify(tree));
  // the docs pages and the 404 page start their columns under the header's edges too
  for (const path of ['/installation', '/nope']) {
    const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await d.goto(BASE + path, { waitUntil: 'networkidle' });
    const r = await d.evaluate(() => {
      const edges = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return [Math.round(r.left + parseFloat(s.paddingLeft)), Math.round(r.right - parseFloat(s.paddingRight))].join('-');
      };
      return { header: edges(document.querySelector('header > div')), columns: edges(document.querySelector('main#content').parentElement), footer: edges(document.querySelector('footer')) };
    });
    check(r.columns === r.header, '1440px ' + path + ': the docs columns line up with the header ' + JSON.stringify(r));
    await d.close();
  }
  {
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const footers = [];
    for (const path of ['/installation', '/nope']) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      footers.push(await page.evaluate(() => { const r = document.querySelector('footer').getBoundingClientRect(); return Math.round(r.left) + '-' + Math.round(r.right); }));
    }
    check(footers[0] === footers[1], '1440px: the 404 page’s text and footer sit where a docs page’s do ' + JSON.stringify(footers));
    await page.close();
  }
  // below the fold: hidden until scrolled to, then shown
  const before = await t.evaluate(() => {
    const r = [...document.querySelectorAll('[data-reveal]')].find((e) => e.getBoundingClientRect().top > innerHeight + 200);
    return r ? { shown: r.hasAttribute('data-in'), opacity: getComputedStyle(r).opacity } : null;
  });
  check(before && !before.shown && before.opacity === '0', 'content below the fold waits to be scrolled to ' + JSON.stringify(before));
  await t.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await t.waitForTimeout(1200);
  const hidden = await t.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => e.getBoundingClientRect().bottom < innerHeight && getComputedStyle(e).opacity !== '1').length);
  check(hidden === 0, 'after scrolling, everything that was passed is shown (' + hidden + ' still hidden)');
  // the page-change bar: none on the first load, one on a page change
  check((await t.$('.animate-\\[kbd-progress_700ms_cubic-bezier\\(0\\.22\\,1\\,0\\.36\\,1\\)_forwards\\]')) === null, 'no page-change bar on the first load');
  await t.evaluate(() => window.scrollTo(0, 0));
  await t.click('header a:has-text("Utilities")');
  // (waits for it: the new page arrives a little later when the machine is busy, and the bar comes with it)
  const bar = await t.waitForSelector('div[class*="kbd-progress"]', { timeout: 3000 }).catch(() => null);
  check(bar !== null, 'a page change runs the gold bar across the top');
  await t.close();
}
// less motion: nothing animates, nothing waits to be scrolled to
{
  const ctxR = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const t = await ctxR.newPage();
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const r = await t.evaluate(() => ({
    hidden: [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    animating: [...document.querySelectorAll('[class*="animate-[kbd-"]')].filter((e) => getComputedStyle(e).animationName !== 'none').length,
    h1: getComputedStyle(document.querySelector('h1')).opacity,
  }));
  check(r.hidden === 0 && r.animating === 0 && r.h1 === '1', 'with reduced motion everything shows at once, nothing animates ' + JSON.stringify(r));
  await ctxR.close();
}

// the sidebar: hovering a link nudges its text, not its border (the border is part of the line)
{
  const t = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await t.goto(BASE + '/variants', { waitUntil: 'networkidle' });
  const link = 'aside nav[aria-label="Documentation"] a[href="/colors"]';
  const measure = () =>
    t.evaluate((sel) => {
      const a = document.querySelector(sel);
      const line = a.closest('ul').getBoundingClientRect().left;
      return { border: Math.round(a.getBoundingClientRect().left - line), text: Math.round(a.querySelector('span').getBoundingClientRect().left - line) };
    }, link);
  const rest = await measure();
  await t.hover(link);
  await t.waitForTimeout(400);
  const hover = await measure();
  check(rest.border === 0 && hover.border === 0 && hover.text > rest.text, 'hovering a sidebar link keeps its border on the line and nudges the text ' + JSON.stringify({ rest, hover }));
  await t.close();
}

// the tab icon follows the BROWSER's theme (it sits in the browser's own bar); every logo in the page,
// the navbar's included, and the bar color follow the SITE's. A light browser with Dark picked, and the
// reverse, also after a reload.
for (const [system, pick] of [['light', 'Dark'], ['dark', 'Light']]) {
  const ctxT = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: system });
  const t = await ctxT.newPage();
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const read = () =>
    t.evaluate(() => ({
      header: [...document.querySelectorAll('header img')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => i.getAttribute('src')),
      footer: [...document.querySelectorAll('footer img')].filter((i) => getComputedStyle(i).display !== 'none').map((i) => i.getAttribute('src')),
      // one icon link, set from the browser's theme (Firefox ignores media on icons)
      icons: document.querySelectorAll('link[rel="icon"]').length,
      icon: document.getElementById('kb-icon').getAttribute('href'),
      bar: document.querySelector('meta[name="theme-color"]').getAttribute('content'),
    }));
  const want = {
    header: [pick === 'Dark' ? '/kbach-logo-64.png' : '/kbach-logo-light-64.png'],
    // the brand's logo, then the small one in the "Built with" row (2026-11-27): both follow the pick
    footer: pick === 'Dark' ? ['/kbach-logo-64.png', '/kbach-logo-32.png'] : ['/kbach-logo-light-64.png', '/kbach-logo-light-32.png'],
    icons: 1,
    icon: system === 'dark' ? '/kbach-icon-64.png' : '/kbach-icon-light-64.png',
    bar: pick === 'Dark' ? '#1a2125' : '#faf7f0',
  };
  await t.click('header [role="radio"][aria-label="' + pick + '"]');
  await t.waitForTimeout(200);
  const after = await read();
  await t.reload({ waitUntil: 'domcontentloaded' });
  const reloaded = await read();
  check(
    JSON.stringify(after) === JSON.stringify(want) && JSON.stringify(reloaded) === JSON.stringify(want),
    system + ' browser, ' + pick + ' picked: the tab icon follows the browser, the navbar and footer logos and the bar color follow the pick ' + JSON.stringify({ after, reloaded }),
  );
  await ctxT.close();
}

// System (the default) follows the device's theme, live; a picked Light or Dark holds until System is picked again
{
  const t = await b.newPage({ viewport: { width: 1280, height: 700 }, colorScheme: 'light' });
  await t.goto(BASE + '/typography', { waitUntil: 'networkidle' });
  const html = () => t.evaluate(() => document.documentElement.className);
  const first = await html();
  await t.emulateMedia({ colorScheme: 'dark' });
  await t.waitForTimeout(300);
  const followed = await html();
  await t.click('header [role="radio"][aria-label="Light"]');
  await t.emulateMedia({ colorScheme: 'dark' });
  await t.waitForTimeout(300);
  const held = await html();
  await t.click('header [role="radio"][aria-label="System"]');
  await t.waitForTimeout(300);
  const back = await html();
  check(first === 'light' && followed === 'dark' && held === 'light' && back === 'dark', 'System follows the device live, a pick holds, System gives it back to the device ' + JSON.stringify({ first, followed, held, back }));
  // with the site held on Light, a browser switch moves the tab icon, not the navbar logo
  await t.click('header [role="radio"][aria-label="Light"]');
  const both = () => t.evaluate(() => ({ navbar: [...document.querySelectorAll('header img')].find((i) => getComputedStyle(i).display !== 'none').getAttribute('src'), tab: document.getElementById('kb-icon').getAttribute('href') }));
  await t.emulateMedia({ colorScheme: 'dark' });
  await t.waitForTimeout(200);
  const inDark = await both();
  await t.emulateMedia({ colorScheme: 'light' });
  await t.waitForTimeout(200);
  const inLight = await both();
  check(
    inDark.navbar === '/kbach-logo-light-64.png' && inLight.navbar === '/kbach-logo-light-64.png' && inDark.tab === '/kbach-icon-64.png' && inLight.tab === '/kbach-icon-light-64.png',
    'a browser switch changes the tab icon live; the navbar logo stays with the site (Light) ' + JSON.stringify({ inDark, inLight }),
  );
  await t.close();
}

// the navbar fits where you are
{
  const t = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const header = () =>
    t.evaluate(() => {
      const h = document.querySelector('header');
      return {
        brand: h.querySelector('div > div').textContent.replace(/\s+/g, ' ').trim(),
        main: [...h.querySelectorAll('nav[aria-label="Main"] a')].map((a) => a.textContent),
        site: [...h.querySelectorAll('nav[aria-label="Site"] a')].map((a) => a.textContent + (a.getAttribute('aria-current') ? '*' : '')),
        getStarted: !!h.querySelector('a[href="/introduction"].bg-accent'),
        // the last control on the bar (GitHub, at the far right since 2026-11-27)
        last: [...h.querySelectorAll('a, button')].filter((x) => x.offsetParent).pop()?.getAttribute('aria-label'),
        wideSearch: !!h.querySelector('button:has(kbd) span.truncate'),
        version: !!h.querySelector('a[href*="npmjs"]'),
        border: getComputedStyle(h).borderBottomColor,
        // a link or button taller than the bar's 36px controls has wrapped onto a second line
        rows: [...h.querySelectorAll('a, button')].filter((x) => x.offsetParent).some((x) => x.getBoundingClientRect().height > 44),
      };
    });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const home = await header();
  check(home.brand === 'Kbach' && home.main.join(',') === 'Docs,Utilities,Customization,API,Playground' && !home.getStarted && home.last === 'Kbach on GitHub' && !home.version && home.site.length === 0, 'home: the brand, the main links, no Get started, GitHub at the far right ' + JSON.stringify(home));
  check(home.border === 'rgba(0, 0, 0, 0)', 'home: the bar is see-through over the hero (' + home.border + ')');
  await t.mouse.wheel(0, 600);
  await t.waitForTimeout(500);
  check((await header()).border !== 'rgba(0, 0, 0, 0)', 'home: it gets its border once the page scrolls');
  await t.goto(BASE + '/typography', { waitUntil: 'networkidle' });
  const docs = await header();
  check(docs.brand.includes('Docs') && docs.site.join(',') === 'Docs*,Playground' && docs.wideSearch && docs.version && docs.main.length === 0 && !docs.getStarted && docs.last === 'Kbach on GitHub', 'a docs page: "Kbach / Docs", the wide search, the version, Docs marked in the switch, GitHub at the far right ' + JSON.stringify(docs));
  // the playground is its own full-screen page: no navbar, no footer
  await t.goto(BASE + '/playground', { waitUntil: 'networkidle' });
  const pg = await t.evaluate(() => ({ header: !!document.querySelector('header'), footer: !!document.querySelector('footer') }));
  check(!pg.header && !pg.footer, 'the playground has no navbar and no footer ' + JSON.stringify(pg));
  for (const w of [1024, 1280]) {
    await t.setViewportSize({ width: w, height: 900 });
    await t.goto(BASE + '/', { waitUntil: 'networkidle' });
    check(!(await header()).rows, w + 'px: nothing in the home navbar wraps onto two lines');
  }
  // the phone menu starts with where you are
  await t.setViewportSize({ width: 390, height: 800 });
  await t.goto(BASE + '/typography', { waitUntil: 'networkidle' });
  await t.click('button[aria-label="Open navigation"]');
  await t.waitForTimeout(400);
  const places = await t.$$eval('.fixed nav[aria-label="Site"] a', (as) => as.map((a) => a.textContent + (a.getAttribute('aria-current') ? '*' : '')));
  check(places.join(',') === 'Home,Docs*,Playground', 'the phone menu: Home, Docs (current), Playground, then the sections (' + places.join(',') + ')');
  // on the home page the menu is the home links, not the docs' pages
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.click('button[aria-label="Open navigation"]');
  await t.waitForTimeout(400);
  const homeMenu = await t.evaluate(() => {
    const panel = document.querySelector('.fixed.inset-0.z-40');
    return {
      links: [...panel.querySelectorAll('nav[aria-label="Main"] a span.block.font-semibold, nav[aria-label="Main"] a span.text-\\[15px\\]')].map((s) => s.textContent),
      docsList: !!panel.querySelector('nav[aria-label="Documentation"]'),
      getStarted: /Get started/.test(panel.textContent),
      github: !!panel.querySelector('a[href^="https://github.com/"]'),
    };
  });
  // no Get started in the menu (2026-11-27, as in the header: the hero has it)
  check(homeMenu.links.join(',') === 'Docs,Utilities,Customization,API,Playground' && !homeMenu.docsList && !homeMenu.getStarted && homeMenu.github, 'the home page phone menu: the home links and GitHub, no Get started, not the docs list ' + JSON.stringify(homeMenu));
  await t.click('.fixed.inset-0.z-40 a:has-text("Utilities")');
  await t.waitForTimeout(400);
  check(new URL(t.url()).pathname === '/layout' && !(await t.isVisible('button[aria-label="Close navigation"]')), 'picking one goes there and closes the menu');
  // a docs page's bar starts see-through too
  await t.setViewportSize({ width: 1440, height: 900 });
  await t.goto(BASE + '/typography', { waitUntil: 'networkidle' });
  const top = await t.evaluate(() => ({ bg: getComputedStyle(document.querySelector('header')).backgroundColor, border: getComputedStyle(document.querySelector('header')).borderBottomColor }));
  check(top.bg === 'rgba(0, 0, 0, 0)' && top.border === 'rgba(0, 0, 0, 0)', 'a docs page: the bar is see-through at the top ' + JSON.stringify(top));
  await t.close();
}

// "Works with", as a map beside the headline: the engine, its three packages, seven setups. Pointing at a
// setup lights its path back to the engine (two lines) and says how Kbach plugs in; every node is a link.
for (const [w, beside] of [[1440, true], [1024, true], [390, false]]) {
  const t = await b.newPage({ viewport: { width: w, height: 900 } });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.waitForTimeout(900); // the hero's rise-in
  const m = await t.evaluate(() => {
    const box = document.querySelector('[data-network]').getBoundingClientRect();
    const h1 = document.querySelector('h1').getBoundingClientRect();
    const nodes = [...document.querySelectorAll('[data-network] a')].map((a) => a.getBoundingClientRect());
    const overlap = nodes.some((a, i) => nodes.some((c, j) => j > i && a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1));
    return {
      nodes: nodes.length,
      beside: box.left >= h1.right - 1,
      below: box.top >= h1.bottom,
      inside: nodes.every((n) => n.left >= 0 && n.right <= innerWidth),
      overlap,
    };
  });
  check(m.nodes === 11 && (beside ? m.beside : m.below) && m.inside && !m.overlap, w + 'px: the map is ' + (beside ? 'beside' : 'under') + ' the headline, its 11 nodes inside the window, none on another ' + JSON.stringify(m));
  if (w === 1440) {
    const lit = () => t.evaluate(() => ({ lines: document.querySelectorAll('[data-network] line[data-lit]').length, says: document.querySelector('[data-network-says]').textContent }));
    const before = await lit();
    await t.hover('[data-tool="Next.js"]');
    await t.waitForTimeout(350);
    const next = await lit();
    check(before.lines === 0 && next.lines === 2 && next.says.includes('globals.css'), 'pointing at Next.js lights its two lines and says how it plugs in ' + JSON.stringify({ before, next }));
    await t.hover('[data-package="native"]');
    await t.waitForTimeout(350);
    const native = await lit();
    check(native.lines === 3 && native.says.includes('React Native and Expo'), 'pointing at @kbach/react-native lights it and its two setups (3 lines) ' + JSON.stringify(native));
    await t.mouse.move(5, 5);
    await t.waitForTimeout(350);
    check((await lit()).lines === 0, 'and moving away puts the map back');
    // the keyboard too
    await t.focus('[data-tool="Plain HTML"]');
    await t.waitForTimeout(350);
    const keyed = await lit();
    check(keyed.lines === 2 && keyed.says.includes('script tag'), 'a node in focus lights its path too ' + JSON.stringify(keyed));
    const hrefs = await t.$$eval('[data-network] a', (as) => as.map((a) => a.getAttribute('href')));
    check(hrefs.includes('/installation?tab=nextjs') && hrefs.includes('/how-it-works') && hrefs.includes('/plain-html'), 'its nodes link to where to start ' + JSON.stringify(hrefs));
  }
  await t.close();
}

// The map fits whatever its labels' widths: a 320px phone, a bigger text size in the
// browser (the user saw labels run out of the map). It measures its labels and nudges any that would
// cross an edge, or touch the engine, back in; the lines go to where the labels really are.
for (const [lang, w, root] of [['en', 320, '16px'], ['en', 320, '20px'], ['en', 430, '20px'], ['en', 1440, '20px']]) {
  const t = await b.newPage({ viewport: { width: w, height: 900 } });
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  await t.evaluate((size) => (document.documentElement.style.fontSize = size), root);
  await t.waitForTimeout(1200);
  const m = await t.evaluate(() => {
    const box = document.querySelector('[data-network]');
    const r = box.getBoundingClientRect();
    const svg = box.querySelector('svg');
    const vb = svg.viewBox.baseVal;
    const s = svg.getBoundingClientRect();
    const nodes = [...box.querySelectorAll('a')].map((a) => ({ name: a.textContent.trim() || 'engine', r: a.getBoundingClientRect() }));
    const mids = nodes.map(({ r }) => [r.left + r.width / 2, r.top + r.height / 2]);
    const ends = [...box.querySelectorAll('line')].flatMap((l) => [
      [s.left + (l.x1.baseVal.value / vb.width) * s.width, s.top + (l.y1.baseVal.value / vb.height) * s.height],
      [s.left + (l.x2.baseVal.value / vb.width) * s.width, s.top + (l.y2.baseVal.value / vb.height) * s.height],
    ]);
    return {
      outside: nodes.filter(({ r: n }) => n.left < r.left - 0.5 || n.right > r.right + 0.5 || n.top < r.top - 0.5 || n.bottom > r.bottom + 0.5).map((n) => n.name),
      overlap: nodes.flatMap((a, i) => nodes.filter((c, j) => j > i && a.r.left < c.r.right - 1 && c.r.left < a.r.right - 1 && a.r.top < c.r.bottom - 1 && c.r.top < a.r.bottom - 1).map((c) => a.name + ' / ' + c.name)),
      loose: ends.filter(([x, y]) => !mids.some(([mx, my]) => Math.abs(mx - x) < 1.5 && Math.abs(my - y) < 1.5)).length,
    };
  });
  check(m.outside.length === 0 && m.overlap.length === 0 && m.loose === 0, lang + ' ' + w + 'px, text ' + root + ': every label inside the map, none on another, every line on a label ' + JSON.stringify(m));
  await t.close();
}

// Each label is as wide as its text, in Firefox too: a label placed near the right edge (left: 80%) was
// sized to the room left on its right, and Firefox squeezed it narrower than its text (React Native,
// Expo and Plain HTML ran out past their borders). Chromium never showed it, so Firefox runs this.
for (const engine of [chromium, firefox]) {
  const fb = await engine.launch();
  for (const [lang, w] of [['en', 390], ['en', 487], ['en', 1440]]) {
    const t = await fb.newPage({ viewport: { width: w, height: 900 } });
    await t.goto(BASE + '/', { waitUntil: 'networkidle' });
    await t.waitForTimeout(600);
    const squeezed = await t.evaluate(() =>
      [...document.querySelectorAll('[data-network] a')].flatMap((a) => {
        const box = a.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(a);
        const text = range.getBoundingClientRect();
        return text.right > box.right + 0.5 || text.left < box.left - 0.5 || a.scrollWidth > a.clientWidth + 1 ? [a.textContent.trim() + ' ' + Math.round(box.width) + '/' + Math.round(text.width)] : [];
      }),
    );
    check(squeezed.length === 0, engine.name() + ' ' + lang + ' ' + w + 'px: every map label as wide as its text ' + JSON.stringify(squeezed));
    await t.close();
  }
  await fb.close();
}

// the contents, compact: each part shows its first 5 pages; "Show N more" shows the rest, "Show fewer" hides them again
{
  const t = await ctx.newPage();
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const visible = () => t.$$eval('[data-part]', (ps) => ps.map((p) => [...p.querySelectorAll('ul a')].filter((a) => a.offsetParent).length));
  const before = await visible();
  // (a part folds only when that hides 2 pages or more: Core concepts' 6 all show)
  check(JSON.stringify(before) === JSON.stringify([4, 6, 3, 5, 3, 5, 5]), 'the contents show 5 pages a part, all of a part with 6 or fewer ' + JSON.stringify(before));
  const utilities = t.locator('[data-part]').nth(3);
  const button = utilities.locator('button');
  check((await button.textContent()).trim() === 'Show 10 more' && (await button.getAttribute('aria-expanded')) === 'false', 'Utilities (15 pages) offers "Show 10 more" (' + (await button.textContent()).trim() + ')');
  check((await t.locator('[data-part]').nth(2).locator('button').count()) === 0 && (await t.locator('[data-part]').nth(1).locator('button').count()) === 0, 'Platforms (3 pages) and Core concepts (6) have no button');
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const opened = await visible();
  check(opened[3] === 15 && (await button.getAttribute('aria-expanded')) === 'true' && (await button.textContent()).trim() === 'Show fewer', 'clicking it shows all 15, and it becomes "Show fewer" ' + JSON.stringify(opened));
  await button.click();
  check((await visible())[3] === 5, 'and "Show fewer" folds it back to 5');
  await t.close();
}

// the contents: a part's title opens its first page
{
  const t = await ctx.newPage();
  await t.goto(BASE + '/', { waitUntil: 'networkidle' });
  const part = t.locator('[data-part]').first().locator('div a');
  await part.scrollIntoViewIfNeeded();
  await part.click();
  await t.waitForURL(BASE + '/introduction');
  check(new URL(t.url()).pathname === '/introduction', 'the contents: "Getting started" opens its first page');
  await t.close();
}

check(errors.length === 0, 'no page errors ' + errors.join(' | '));
await b.close();
console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
