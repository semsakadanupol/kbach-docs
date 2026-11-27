// What makes the site read as the official docs: under every page when it
// last changed and where to edit it,
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
const REPO = 'https://github.com/semsakadanupol/kbach-docs'; // the docs' own repository
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
await p.goto(BASE + '/installation', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
let r = await metaOf();
check(r.edit === REPO + '/edit/main/content/installation.md', '"Edit this page" opens its Markdown file on GitHub (' + r.edit + ')');
check(!!r.issue && decodeURIComponent(r.issue).includes('title=Docs: Installation'), '"Report an issue" starts an issue named after the page');
check(!!r.date && !isNaN(Date.parse(r.date)) && /^[A-Z][a-z]+ \d{1,2}, 20\d\d$/.test(r.shown ?? ''), '"Last updated" shows a date: ' + r.shown);

// --- English only, at the root (2026-11-27): no language switch; an old /en/… or Khmer /km/…
// address lands on the page (vercel.json redirects it on the live site; the 404 page's script on any host)
const only = await p.evaluate(() => ({ lang: document.documentElement.lang, switch: !!document.querySelector('[aria-label*="anguage" i]'), km: /[\u1780-\u17ff]/.test(document.body.textContent) }));
check(only.lang === 'en' && !only.switch && !only.km, 'the page is English only: lang="en", no language switch, no Khmer text ' + JSON.stringify(only));
await p.goto(BASE + '/km/installation?tab=vite#troubleshooting', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
check(new URL(p.url()).pathname === '/installation' && p.url().includes('?tab=vite') && p.url().endsWith('#troubleshooting'), 'an old /km/ address goes to the page, keeping its ?tab and #section (' + p.url().replace(BASE, '') + ')');
await p.goto(BASE + '/installation', { waitUntil: 'networkidle' });
const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf-8'));
check(
  vercel.redirects?.some((r) => r.source === '/:lang(en|km)' && r.destination === '/' && r.permanent) &&
    vercel.redirects?.some((r) => r.source === '/:lang(en|km)/:path*' && r.destination === '/:path*' && r.permanent),
  'vercel.json sends /en, /km and everything under them to the page at the root, for good (a 308, for search engines)',
);

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
await p.goto(BASE + '/no-such-page', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
r = await p.evaluate(() => ({
  h1: document.querySelector('article h1')?.textContent,
  popular: [...document.querySelectorAll('article > div ul a')].map((a) => a.getAttribute('href')),
}));
check(r.h1 === 'Page not found' && r.popular.length === 6 && r.popular.includes('/installation'), '404: popular pages to go to ' + JSON.stringify(r.popular));
await p.click('article button:has-text("Search the docs")');
await p.waitForTimeout(300);
check(await p.locator('[role="dialog"] input').isVisible(), '404: "Search the docs" opens search');
await p.keyboard.press('Escape');

// --- the built pages: share tags, a picture, robots.txt, a 404 kept out of search
const html = readFileSync(OUT + 'colors.html', 'utf-8');
check(
  /<meta property="og:title" content="Colors · Kbach Docs"/.test(html) && /<meta name="twitter:card" content="summary_large_image"/.test(html),
  'a built page has its share tags (title, card)',
);
check(!/hreflang|km_KH|\/km\/|\/en\//.test(html) && !existsSync(OUT + 'km') && !existsSync(OUT + 'en') && existsSync(OUT + 'index.html'), 'every page is at the root (no en/ or km/ folder), and no page points to one');
// the share picture needs the site's full address (KBACH_DOCS_URL): without it there's no picture tag, never a localhost one
// (both kinds of build: a production one, with KBACH_DOCS_URL, has the picture at its full address)
const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
check(!/localhost/.test(html) && (ogImage === undefined || /^https:\/\/[^/]+\/og\.png$/.test(ogImage)), 'og:image only with the site address, and then a full one (' + (ogImage ?? 'none') + '); never a localhost address');
check(existsSync(OUT + 'og.png') && existsSync(OUT + 'robots.txt'), 'og.png and robots.txt are in the build');

// structured data (src/lib/structuredData.tsx): full addresses only, so none
// without KBACH_DOCS_URL; with it (a production build, the same checks run on
// it), the site's name on the home page and a breadcrumb on a docs page
const jsonLd = (file) => [...readFileSync(OUT + file, 'utf-8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const graph = (file) => jsonLd(file).flatMap((d) => d['@graph']);
if (!/og:image/.test(html)) {
  check(jsonLd('index.html').length === 0 && jsonLd('variants.html').length === 0, 'without the site address, no structured data');
} else {
  const site = graph('index.html').find((g) => g['@type'] === 'WebSite');
  check(site?.name === 'Kbach' && /^https:\/\//.test(site.url), 'the home page names the site "Kbach" for search engines (' + site?.url + ')');
  const crumbs = graph('variants.html').find((g) => g['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
  check(crumbs.length === 3 && crumbs[0].name === 'Kbach Docs' && crumbs[2].item.endsWith('/variants'), 'a docs page has its breadcrumb, with full addresses');
}
check(/<meta name="robots" content="noindex/.test(readFileSync(OUT + '404.html', 'utf-8')), '404.html is kept out of search engines');

// sitemap.xml (reworked 2026-11-27, when the pages moved to the root): full addresses only, so
// empty without KBACH_DOCS_URL; with it, the home page, every docs page with its date, the playground
const sitemap = readFileSync(OUT + 'sitemap.xml', 'utf-8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!/og:image/.test(html)) {
  check(/<urlset/.test(sitemap) && locs.length === 0, 'without the site address, sitemap.xml lists nothing');
} else {
  const site = new URL(locs[0]).origin;
  const dated = [...sitemap.matchAll(/<url>\s*<loc>[^<]+<\/loc>\s*<lastmod>\d{4}-\d\d-\d\d<\/lastmod>\s*<\/url>/g)].length;
  check(
    locs[0] === site + '/' && locs.includes(site + '/installation') && locs.at(-1) === site + '/playground' && !locs.some((l) => /\/(en|km)(\/|$)|\/cdn$|\/tailwind-differences$/.test(l)),
    'sitemap.xml: the home page first, every docs page at the root, the playground last, no old or moved address (' + locs.length + ' pages)',
  );
  check(dated === locs.length - 1 && new Set(locs).size === locs.length, 'every page but the home page has its <lastmod>, and none is listed twice');
  check(readFileSync(OUT + 'robots.txt', 'utf-8').includes('Sitemap: ' + site + '/sitemap.xml'), 'robots.txt points to the sitemap');
}

// --- for AI assistants: the rules (from the "Using AI assistants" page) and every page
const llms = readFileSync(OUT + 'llms.txt', 'utf-8');
check(/^# Kbach/.test(llms) && llms.includes('50→1 100→2') && llms.includes('BEFORE') && /\[Common mistakes\]\((https:\/\/[^/)]+)?\/common-mistakes\)/.test(llms), 'llms.txt has the rules and links every page');
const llmsFull = readFileSync(OUT + 'llms-full.txt', 'utf-8');
check(llmsFull.includes('# Common mistakes') && llmsFull.includes('# React Native API') && !/\{#[\w-]+\}/.test(llmsFull), 'llms-full.txt has every page, without heading ids');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
