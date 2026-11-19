// The API pages against the packages: every name a package exports is on
// its API page (in both languages), and every subpath export too. A new
// export without docs fails here instead of going unnoticed. (No browser.)
import { readFileSync } from 'fs';

const root = new URL('../../../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf-8');
let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

/** The names an entry file exports: `export { a, b as c }`, `export type { T }`, `export function f`. */
function exportsOf(src) {
  const names = new Set();
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const m of code.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop();
      if (name) names.add(name);
    }
  }
  for (const m of code.matchAll(/export\s+(?:const|let|function|class|interface|type|enum)\s+(\w+)/g)) names.add(m[1]);
  return [...names];
}

for (const [pkg, page] of [
  ['react', 'react-api'],
  ['react-native', 'react-native-api'],
]) {
  const names = exportsOf(read('packages/' + pkg + '/src/index.ts'));
  const subpaths = Object.keys(JSON.parse(read('packages/' + pkg + '/package.json')).exports)
    .filter((k) => k !== '.' && k !== './package.json')
    .map((k) => '@kbach/' + pkg + k.slice(1));
  check(names.length > 10, '@kbach/' + pkg + ': ' + names.length + ' exports found');
  for (const [lang, file] of [
    ['en', 'apps/kbach-docs/content/' + page + '.md'],
    ['km', 'apps/kbach-docs/content/km/' + page + '.md'],
  ]) {
    const md = read(file);
    const missing = names.filter((n) => !new RegExp('\\b' + n + '\\b').test(md));
    check(missing.length === 0, '/' + (lang === 'km' ? 'km/' : '') + page + ' names every export of @kbach/' + pkg + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
    const missingSub = subpaths.filter((s) => !md.includes(s));
    check(missingSub.length === 0, '/' + (lang === 'km' ? 'km/' : '') + page + ' names its subpath exports' + (missingSub.length ? ' (missing: ' + missingSub.join(', ') + ')' : ''));
  }
}
process.exit(failures ? 1 : 0);
