// The Khmer site (/km/…): its language, its interface, links that stay in
// Khmer, the language switch, the English page with a note where there's no
// Khmer one yet, and the English site unchanged.
import { chromium } from 'playwright';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const CONTENT = fileURLToPath(new URL('../../content/', import.meta.url));
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const khmer = /[ក-៿]/;

// --- the home page in Khmer
await p.goto(BASE + '/km', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
let r = await p.evaluate(() => ({
  lang: document.documentElement.lang,
  title: document.title,
  h1: document.querySelector('h1')?.textContent,
  getStarted: [...document.querySelectorAll('header a[href="/km/introduction"]')].map((a) => a.textContent.trim()).find((t) => t.startsWith('ចាប់ផ្តើម')),
  englishLinks: [...document.querySelectorAll('main a[href^="/"]')].map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('/km') && !/\.[a-z]+$/.test(h)),
}));
check(r.lang === 'km' && /[ក-៿]/.test(r.title) && /[ក-៿]/.test(r.h1), '/km: the page is Khmer (lang, title, headline) ' + JSON.stringify({ lang: r.lang, h1: r.h1 }));
check(r.getStarted === 'ចាប់ផ្តើម', 'the header’s Get started is ចាប់ផ្តើម, and goes to /km/introduction');
check(r.englishLinks.length === 0, 'every link on the Khmer home page stays in Khmer ' + JSON.stringify(r.englishLinks));
// big type: tighter than body text (the gap grows with the size), still clear of Khmer's marks (1.22em)
const lead = await p.evaluate(() => {
  const ratio = (el) => { const cs = getComputedStyle(el); return +(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2); };
  return { h1: ratio(document.querySelector('main h1')), text: ratio(document.querySelector('main h1 + p')) };
});
check(lead.h1 >= 1.2 && lead.h1 <= 1.3 && lead.text === 1.7, 'the hero: headline ' + lead.h1 + '×, its text ' + lead.text + '× (body text is 1.85×)');
// headings set in Fraunces (a serif) take their Khmer from a serif too, not the text's sans
{
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const fontsOf = async (sel) => {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
    return (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts.map((f) => f.familyName);
  };
  const hero = await fontsOf('main h1');
  const text = await fontsOf('main h1 + p');
  check(hero.includes('Noto Serif Khmer') && !hero.includes('Kantumruy Pro') && text.includes('Kantumruy Pro'), 'the headline’s Khmer is Noto Serif Khmer (beside Fraunces), the text’s is Kantumruy Pro ' + JSON.stringify({ hero, text }));
}

// --- a translated page
await p.goto(BASE + '/km/introduction', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
r = await p.evaluate(() => ({
  h1: document.querySelector('article h1')?.textContent,
  note: !!document.querySelector('article p.rounded-lg[lang="km"]'),
  bodyLinks: [...document.querySelectorAll('article a[href^="/"]')].map((a) => a.getAttribute('href')),
  sidebar: [...document.querySelectorAll('aside nav a')].slice(0, 3).map((a) => a.textContent.trim() + ' ' + a.getAttribute('href')),
  toc: document.querySelector('nav[aria-label="នៅលើទំព័រនេះ"]') !== null,
  code: [...document.querySelectorAll('article pre')].some((pre) => pre.textContent.includes('className="rounded-xl bg-white p-6 shadow-lg"')),
}));
check(r.h1 === 'សេចក្តីផ្តើម' && !r.note, '/km/introduction: the Khmer page, with no "not translated" note');
check(r.bodyLinks.length > 0 && r.bodyLinks.every((h) => h === '/km' || h.startsWith('/km/')), 'links in its text go to Khmer pages ' + JSON.stringify(r.bodyLinks.slice(0, 4)));
check(r.sidebar[0].startsWith('សេចក្តីផ្តើម /km/introduction') && r.toc, 'the sidebar and the contents are in Khmer ' + JSON.stringify(r.sidebar));
check(r.code, 'its code is untouched (English, as written)');

// --- type: Khmer letters in their own font, scaled up (size-adjust), with more room between lines
const type = await p.evaluate(async () => {
  await document.fonts.ready;
  const para = document.querySelector('article .mt-10 p');
  const cs = getComputedStyle(para);
  const face = [...document.fonts].find((f) => f.family.replace(/"/g, '') === 'Kantumruy Pro');
  return {
    loaded: face?.status,
    sizeAdjust: face?.sizeAdjust,
    fromSite: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes('/fonts/kantumruy-pro-khmer.woff2')); } catch { return false; } }),
    ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
    size: cs.fontSize,
  };
});
// (115% made a Khmer consonant as tall as an English capital: the English beside it looked small)
check(type.loaded === 'loaded' && type.sizeAdjust === '103%' && type.fromSite, 'the Khmer font (Kantumruy Pro) loads from the site, matched to the Latin by size-adjust ' + JSON.stringify(type));
check(type.ratio > 1.84 && type.size === '17px', 'Khmer text is a step bigger (' + type.size + '), with room for its stacked marks: line-height ' + type.ratio.toFixed(2) + '×');

// --- a link to a section of another page: the English ids work on Khmer pages
await p.goto(BASE + '/km/installation?tab=react-native#rn-babel', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
r = await p.evaluate(() => {
  const h = document.getElementById('rn-babel');
  return { text: h?.textContent, top: h ? Math.round(h.getBoundingClientRect().top) : null, tab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim() };
});
check(r.text === 'ដាក់ Babel plugin' && r.top !== null && r.top < 200 && r.tab === 'React Native', '/km/installation?tab=react-native#rn-babel: the tab opens and the Khmer section is in view ' + JSON.stringify(r));

// --- the language switch: the same page, its tab and section kept
await p.click('header nav[aria-label="ភាសា"] a[hreflang="en"]');
await p.waitForTimeout(600);
check(new URL(p.url()).pathname + new URL(p.url()).search + new URL(p.url()).hash === '/en/installation?tab=react-native#rn-babel' && (await p.evaluate(() => document.documentElement.lang)) === 'en', 'EN: the same page in English, tab and section kept (' + p.url() + ')');
await p.click('header nav[aria-label="Language"] a[hreflang="km"]');
await p.waitForTimeout(600);
check(new URL(p.url()).pathname === '/km/installation', 'ខ្មែរ: back to Khmer (' + p.url() + ')');

// --- a page not translated yet (whichever is left): the English one, with a note in Khmer
const untranslated = readdirSync(CONTENT).find((f) => f.endsWith('.md') && !['index.md', 'playground.md'].includes(f) && !existsSync(CONTENT + 'km/' + f));
if (!untranslated) console.log('SKIP every page is in Khmer: no fallback page to check');
else {
  const slug = untranslated.replace(/\.md$/, '');
  const title = readFileSync(CONTENT + untranslated, 'utf-8').match(/^title:\s*(.+?)\s*$/m)[1];
  await p.goto(BASE + '/km/' + slug, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  r = await p.evaluate(() => ({
    note: document.querySelector('article p.rounded-lg[lang="km"]')?.textContent,
    articleLang: document.querySelector('article')?.getAttribute('lang'),
    h1: document.querySelector('article h1')?.textContent,
    next: document.querySelector('nav[aria-label="ទំព័រមុន និងបន្ទាប់"] a:last-child')?.getAttribute('href'),
  }));
  check(r.note?.includes('ភាសាខ្មែរ') && r.articleLang === 'en' && r.h1 === title, '/km/' + slug + ' (not translated): the English page, marked lang="en", with a note in Khmer');
  check(r.next?.startsWith('/km/'), 'and its Next link stays in Khmer (' + r.next + ')');
}

// --- search: Khmer results, and an English term finds the page too
await p.keyboard.press('Control+k');
await p.waitForTimeout(300);
await p.keyboard.type('installation');
await p.waitForTimeout(300);
const hits = await p.$$eval('[role="listbox"] a', (as) => as.slice(0, 3).map((a) => a.getAttribute('href') + ' ' + a.textContent.trim().slice(0, 30)));
check(hits.length > 0 && hits[0].startsWith('/km/installation') && khmer.test(hits[0]), 'search: an English word finds the Khmer page ' + JSON.stringify(hits));
await p.keyboard.press('Escape');

// --- the page files: /km/installation is lang="km" with its Khmer title before any script runs
const html = await (await fetch(BASE + '/km/installation')).text();
check(/<html lang="km"/.test(html) && /<title>ការដំឡើង/.test(html), 'out/km/installation.html: lang="km" and the Khmer title');

// --- the English site is as it was
await p.goto(BASE + '/en/installation', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
r = await p.evaluate(() => ({
  lang: document.documentElement.lang,
  h1: document.querySelector('article h1')?.textContent,
  kmLinks: [...document.querySelectorAll('a[href^="/km"]')].filter((a) => !a.closest('nav[aria-label="Language"]')).map((a) => a.getAttribute('href')),
}));
const en = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('[data-prose] p.leading-7')); return { ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), size: cs.fontSize }; });
check(en.ratio < 1.8 && en.size === '16px', 'English text keeps its size and line-height (' + en.size + ', ' + en.ratio.toFixed(2) + '×)');
check(r.lang === 'en' && r.h1 === 'Installation' && r.kmLinks.length === 0, 'English pages are unchanged: lang="en", English text, and only the language switch links to /km ' + JSON.stringify(r.kmLinks));

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
