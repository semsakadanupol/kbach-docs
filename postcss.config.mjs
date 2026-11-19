// Kbach's PostCSS plugin fills src/app/globals.css (between its kbach:start /
// kbach:end markers) with the CSS for every class it finds in src/, using
// kbach.config.js. It runs on every build and on every save in `npm run dev`.
//
// Page text lives in content/*.md, outside src/, so class names written in
// code samples never end up in the stylesheet. Live previews are the
// exception: their classes are safelisted, so their CSS is there from the
// first paint. Without it a preview has no size until the engine loads and
// styles it, and the page grows under the reader (a link to a section
// further down lands in the wrong place). Only the classes of ```preview
// fences are taken, never plain code samples.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// (Next.js runs this from this folder)
const content = join(process.cwd(), 'content');

function previewClasses() {
  const out = new Set();
  for (const file of readdirSync(content).filter((f) => f.endsWith('.md'))) {
    const md = readFileSync(join(content, file), 'utf8').replace(/\r\n/g, '\n');
    for (const block of md.matchAll(/^```preview[^\n]*\n([\s\S]*?)^```/gm)) {
      for (const attr of block[1].matchAll(/\sclass="([^"]*)"/g)) {
        for (const cls of attr[1].split(/\s+/)) if (cls) out.add(cls);
      }
    }
  }
  return [...out].sort();
}

export default { plugins: { '@kbach/react/postcss': { safelist: previewClasses() } } };
