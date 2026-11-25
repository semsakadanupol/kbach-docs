// What makes the site read as the official docs: under every page when it
// last changed and where to edit it (the right file, in either language),
// the footer's license and community links, a 404 page that helps, and the
// share tags, robots.txt and picture in the built pages.
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const OUT = fileURLToPath(new URL('../../out/', import.meta.url));
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const REPO = 'https://github.com/semsakadanupol/kbach';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));

const metaOf = () =>
  p.evaluate(() => {
    const links = [...document.querySelectorAll('article a[target="_blank"]')];
    const time = document.querySelector('article time');
    return {
      edit: links.find((a) => a.href.includes('/edit/main/'))?.href,
      issue: links.find((a) => a.href.includes('/issues/new'))?.href,
      date: time?.getAttribute('datetime'),
      shown: time?.textContent,
    };
  });

// --- under an English page
await p.goto(BASE + '/en/installation', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
let r = await metaOf();
check(r.edit === REPO + '/edit/main/apps/kbach-docs/content/installation.md', '"Edit this page" opens its Markdown file on GitHub (' + r.edit + ')');
check(!!r.issue && decodeURIComponent(r.issue).includes('title=Docs: Installation'), '"Report an issue" starts an issue named after the page');
check(!!r.date && !isNaN(Date.parse(r.date)) && /^[A-Z][a-z]+ \d{1,2}, 20\d\d$/.test(r.shown ?? ''), '"Last updated" shows a date: ' + r.shown);

// --- under a Khmer page: the Khmer file, a Khmer month
await p.goto(BASE + '/km/installation', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
r = await metaOf();
check(r.edit === REPO + '/edit/main/apps/kbach-docs/content/km/installation.md', 'in Khmer, "Edit this page" opens the Khmer file (' + r.edit + ')');
check(/^\d{1,2} [ក-៿]+ 20\d\d$/.test(r.shown ?? ''), 'in Khmer, the date has a Khmer month: ' + r.shown);

// --- the footer
r = await p.evaluate(() => {
  const f = document.querySelector('footer');
  return {
    license: [...f.querySelectorAll('a')].some((a) => a.href.endsWith('/blob/main/LICENSE')),
    issues: [...f.querySelectorAll('a')].some((a) => a.href.endsWith('/issues/new')),
    copyright: /© 2026/.test(f.textContent),
    version: /@kbach\/react \d+\.\d+\.\d+/.test(f.textContent),
  };
});
check(r.license && r.copyright, 'the footer has the copyright and links the MIT license');
check(r.issues && r.version, 'the footer links "Report an issue" and names the version');

// --- a page that doesn't exist
await p.goto(BASE + '/en/no-such-page', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
r = await p.evaluate(() => ({
  h1: document.querySelector('article h1')?.textContent,
  popular: [...document.querySelectorAll('article > div ul a')].map((a) => a.getAttribute('href')),
}));
check(r.h1 === 'Page not found' && r.popular.length === 6 && r.popular.includes('/en/installation'), '404: popular pages to go to ' + JSON.stringify(r.popular));
await p.click('article button:has-text("Search the docs")');
await p.waitForTimeout(300);
check(await p.locator('[role="dialog"] input').isVisible(), '404: "Search the docs" opens search');
await p.keyboard.press('Escape');

// --- the built pages: share tags, a picture, robots.txt, a 404 kept out of search
const html = readFileSync(OUT + 'km/colors.html', 'utf-8');
check(
  /<meta property="og:title" content="ពណ៌ · ឯកសារ Kbach"/.test(html) && /<meta name="twitter:card" content="summary_large_image"/.test(html),
  'a built page has its share tags (title, card)',
);
// the share picture needs the site's full address (KBACH_DOCS_URL): without it there's no picture tag, never a localhost one
check(!/og:image/.test(html) && !/localhost/.test(html), 'without the site address, no og:image (and no localhost address)');
check(existsSync(OUT + 'og.png') && existsSync(OUT + 'robots.txt'), 'og.png and robots.txt are in the build');

// structured data (src/lib/structuredData.tsx): full addresses only, so none
// without KBACH_DOCS_URL; with it (a production build, the same checks run on
// it), the site's name on the home page and a breadcrumb on a docs page
const jsonLd = (file) => [...readFileSync(OUT + file, 'utf-8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const graph = (file) => jsonLd(file).flatMap((d) => d['@graph']);
if (!/og:image/.test(html)) {
  check(jsonLd('en.html').length === 0 && jsonLd('en/variants.html').length === 0, 'without the site address, no structured data');
} else {
  const site = graph('en.html').find((g) => g['@type'] === 'WebSite');
  check(site?.name === 'Kbach' && /^https:\/\//.test(site.url), 'the home page names the site "Kbach" for search engines (' + site?.url + ')');
  const crumbs = graph('km/variants.html').find((g) => g['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
  check(crumbs.length === 3 && crumbs[0].name === 'ឯកសារ Kbach' && crumbs[2].item.endsWith('/km/variants'), 'a Khmer docs page has its breadcrumb in Khmer, with full addresses');
}
check(/<meta name="robots" content="noindex/.test(readFileSync(OUT + '404.html', 'utf-8')), '404.html is kept out of search engines');

// --- for AI assistants: the rules (from the "Using AI assistants" page) and every page
const llms = readFileSync(OUT + 'llms.txt', 'utf-8');
check(/^# Kbach/.test(llms) && llms.includes('50→1 100→2') && llms.includes('BEFORE') && /\[Common mistakes\]\(\/en\/common-mistakes\)/.test(llms), 'llms.txt has the rules and links every page');
const llmsFull = readFileSync(OUT + 'llms-full.txt', 'utf-8');
check(llmsFull.includes('# Common mistakes') && llmsFull.includes('# React Native API') && !/\{#[\w-]+\}/.test(llmsFull), 'llms-full.txt has every page, without heading ids');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
