// Writes public/logos/*.svg: the official marks of what Kbach works with, in
// each brand's own color, from Simple Icons (simple-icons on npm, CC0). The
// playground's example loads them from there. Run it again after updating
// simple-icons: node scripts/brand-logos.mjs
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { siExpo, siHtml5, siNextdotjs, siPostcss, siReact, siVite } from 'simple-icons';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'logos');
mkdirSync(out, { recursive: true });

const logos = { react: siReact, nextjs: siNextdotjs, vite: siVite, postcss: siPostcss, expo: siExpo, html5: siHtml5 };
for (const [file, icon] of Object.entries(logos)) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">` +
    `<title>${icon.title}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>\n`;
  writeFileSync(join(out, file + '.svg'), svg);
}
console.log('brand-logos: wrote ' + Object.keys(logos).length + ' logos to public/logos');
