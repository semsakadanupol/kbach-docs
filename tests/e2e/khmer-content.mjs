// Every Khmer page (content/km/*.md) against its English one (content/*.md):
// the same section ids (so #links work in both languages), the same code
// blocks and previews, character for character, the same link targets, and
// the same tabs. The translation changes the prose, nothing else. (No browser.)
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const content = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

// as src/markdown/parse.ts
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

function parts(src) {
  src = src.replace(/\r\n/g, '\n');
  const code = [...src.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)].map((m) => m[0]);
  const prose = src.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
  const ids = [...prose.matchAll(/^#{2,4}\s+(.*?)\s*(?:\{#([\w-]+)\})?\s*$/gm)].map((m) => m[2] ?? slugify(m[1].replace(/`/g, '')));
  const links = [...prose.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).sort();
  const tabs = [...prose.matchAll(/^:::tab .*?\{#([\w-]+)\}/gm)].map((m) => m[1]);
  const blocks = [...prose.matchAll(/^::(\w+)/gm)].map((m) => m[1]);
  return { code, ids, links, tabs, blocks };
}

const pages = readdirSync(join(content, 'km')).filter((f) => f.endsWith('.md'));
check(pages.length > 0, pages.length + ' Khmer pages');
for (const file of pages) {
  const en = parts(readFileSync(join(content, file), 'utf-8'));
  const km = parts(readFileSync(join(content, 'km', file), 'utf-8'));
  const name = file.replace(/\.md$/, '');
  const missing = en.ids.filter((id) => !km.ids.includes(id));
  check(missing.length === 0 && km.ids.length === en.ids.length, name + ': the same ' + en.ids.length + ' section ids' + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
  const changed = en.code.findIndex((c, i) => km.code[i] !== c);
  check(km.code.length === en.code.length && changed === -1, name + ': its ' + en.code.length + ' code blocks and previews unchanged' + (changed >= 0 ? ' (block ' + (changed + 1) + ' differs)' : ''));
  check(JSON.stringify(km.links) === JSON.stringify(en.links), name + ': the same ' + en.links.length + ' links' + (JSON.stringify(km.links) !== JSON.stringify(en.links) ? ' ' + JSON.stringify({ en: en.links, km: km.links }) : ''));
  check(JSON.stringify(km.tabs) === JSON.stringify(en.tabs) && JSON.stringify(km.blocks) === JSON.stringify(en.blocks), name + ': the same tabs and blocks');
}
process.exit(failures ? 1 : 0);
