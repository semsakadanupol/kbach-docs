// The Inspector's Design tab in real Chromium (added 2026-11-26): pick an element in the preview,
// change its look with the controls, and the class lands in the code and the preview, in HTML
// mode (index.html) and React mode (App.jsx's className). The class logic itself is
// tests/design.mjs.
import { chromium } from 'playwright';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};
const BASE = 'http://localhost:5176';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => !/about:srcdoc/.test(e.stack || '') && errors.push(e.message));
const canvas = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc');
// the files as saved (CodeMirror draws only the lines in view, and an HTML page's <head> now holds its
// config: the line being edited can be out of view), else what's drawn
const codeHas = (text) =>
  p.evaluate((t) => [localStorage.getItem('kbach-playground-code'), localStorage.getItem('kbach-playground-script'), ...[...document.querySelectorAll('.cm-content')].map((e) => e.textContent)].some((c) => c?.includes(t)), text);
/** Inspect on, then point at the element and click it (frame element boxes are page coordinates already). */
const pick = async (selector) => {
  if ((await p.getAttribute('button[aria-label="Inspect"]', 'aria-pressed')) !== 'true') await p.click('button[aria-label="Inspect"]');
  for (let i = 0; i < 50 && !(await canvas().evaluate(() => document.documentElement.style.cursor === 'crosshair')); i++) await p.waitForTimeout(20);
  const box = await (await canvas().$(selector)).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await p.mouse.move(x, y);
  await p.waitForTimeout(200);
  await p.mouse.click(x, y);
  await p.waitForSelector('aside[aria-label="Inspector"]');
  await p.waitForTimeout(300);
};
const buttonBg = (text) => canvas().evaluate((t) => getComputedStyle([...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t)).backgroundColor, text);

// --- HTML: the todo list's Add button
await p.goto(BASE + '/playground?design=1#example=8-todo', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await pick('button:has-text("Add")');
check((await p.$eval('[aria-label="Inspector view"] [aria-selected="true"]', (e) => e.textContent)) === 'Design', 'the Inspector opens on Design');
check((await p.$eval('[aria-label="Inspector"] code', (e) => e.textContent).catch(() => '')) !== '', 'the Design tab shows the element’s classes');
await p.click('[aria-label="Background color family"] button[title="rose"]');
await p.click('[aria-label="rose shades"] button[title="bg-rose-6"]');
await p.waitForTimeout(900);
// (the button's own classes: the progress bar keeps its bg-brand)
const addClasses = () => canvas().evaluate(() => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add').className.split(/\s+/));
check((await codeHas('bg-rose-6')) && !(await addClasses()).includes('bg-brand') && (await buttonBg('Add')) === 'rgb(244, 63, 94)', 'a background swatch replaces bg-brand with bg-rose-6, in the code and the preview');
await p.click('[aria-label="When it applies"] button:has-text("Hover")');
await p.click('[aria-label="rose shades"] button[title="bg-rose-7"]');
await p.waitForTimeout(700);
check((await codeHas('hover:bg-rose-7')) && !(await codeHas('hover:bg-brand/90')), 'on Hover it writes hover:bg-rose-7 in place of hover:bg-brand/90');
await p.click('[aria-label="When it applies"] button:has-text("Always")');
await p.selectOption('select[aria-label="Padding x"]', 'px-8');
await p.selectOption('select[aria-label="Corners"]', 'rounded-full');
await p.waitForTimeout(800);
const radius = await canvas().evaluate(() => getComputedStyle([...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add')).borderRadius);
check((await codeHas('px-8')) && (await codeHas('rounded-full')) && parseFloat(radius) > 100, 'padding and corners from their pickers: px-8 rounded-full (radius ' + radius + ')');
await p.selectOption('select[aria-label="Padding x"]', '');
await p.waitForTimeout(700);
check(!(await codeHas(' px-8')), '— none in a picker takes its class out of the code');

// --- React: the todo list's Add button (a static className) and a cn() checkbox (read-only)
await p.goto('about:blank');
await p.goto(BASE + '/playground?design=2#example=8-todo&mode=react', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
await pick('button:has-text("Add")');
check(await p.$eval('aside[aria-label="Inspector"] fieldset', (f) => !f.disabled), 'React: a className written once in App.jsx can be changed');
await p.click('[aria-label="Background color family"] button[title="sky"]');
await p.click('[aria-label="sky shades"] button[title="bg-sky-7"]');
await p.waitForTimeout(2500);
check((await codeHas('bg-sky-7')) && (await buttonBg('Add')) === 'rgb(2, 132, 199)', 'React: the swatch writes bg-sky-7 into App.jsx and React shows it');
await p.click('aside[aria-label="Inspector"] button[aria-label="Close the inspector"]');
await pick('li button[aria-label^="Mark as"]');
check(await p.$eval('aside[aria-label="Inspector"] fieldset', (f) => f.disabled), 'React: classes built with cn() are read-only, with the reason shown');

check(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
await b.close();
process.exit(failures ? 1 : 0);
