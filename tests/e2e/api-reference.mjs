// The API pages against the published packages: every name a package exports
// is on its API page (in both languages), and every subpath export too. A
// release with a new export fails here until the page names it. (No browser.)
//
// @kbach/react is a dependency, so it's read from node_modules (the version in
// package.json). @kbach/react-native isn't: installing it would also install
// React Native (its peer), for two files. So its newest release is fetched
// with `npm pack` into node_modules/.cache/kbach-api (once per version; needs
// the network the first time).
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const docs = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, docs), 'utf-8');
const npm = (args, cwd) => execFileSync('npm', args, { cwd, encoding: 'utf-8', shell: process.platform === 'win32' }).trim();
function pkgDir(pkg) {
  if (pkg === 'react') return dirname(require.resolve('@kbach/react/package.json'));
  const version = npm(['view', '@kbach/' + pkg, 'version']);
  const dir = fileURLToPath(new URL('node_modules/.cache/kbach-api/' + pkg + '-' + version + '/', docs));
  if (!existsSync(join(dir, 'package', 'package.json'))) {
    mkdirSync(dir, { recursive: true });
    const tgz = npm(['pack', '@kbach/' + pkg + '@' + version, '--silent'], dir).split('\n').pop();
    // (run in the folder, with a plain file name: Windows' tar reads "C:" as a remote host)
    execFileSync('tar', ['-xzf', tgz, 'package/package.json', 'package/dist/index.d.ts'], { cwd: dir });
  }
  return join(dir, 'package');
}
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
  for (const m of code.matchAll(/export\s+(?:declare\s+)?(?:const|let|function|class|interface|type|enum)\s+(\w+)/g)) names.add(m[1]);
  return [...names];
}

for (const [pkg, page] of [
  ['react', 'react-api'],
  ['react-native', 'react-native-api'],
]) {
  // the published type declarations list exactly what src/index.ts exports
  const names = exportsOf(readFileSync(join(pkgDir(pkg), 'dist', 'index.d.ts'), 'utf-8'));
  const subpaths = Object.keys(JSON.parse(readFileSync(join(pkgDir(pkg), 'package.json'), 'utf-8')).exports)
    .filter((k) => k !== '.' && k !== './package.json')
    .map((k) => '@kbach/' + pkg + k.slice(1));
  check(names.length > 10, '@kbach/' + pkg + ': ' + names.length + ' exports found');
  for (const [lang, file] of [
    ['en', 'content/' + page + '.md'],
    ['km', 'content/km/' + page + '.md'],
  ]) {
    const md = read(file);
    const missing = names.filter((n) => !new RegExp('\\b' + n + '\\b').test(md));
    check(missing.length === 0, '/' + (lang === 'km' ? 'km/' : '') + page + ' names every export of @kbach/' + pkg + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));
    const missingSub = subpaths.filter((s) => !md.includes(s));
    check(missingSub.length === 0, '/' + (lang === 'km' ? 'km/' : '') + page + ' names its subpath exports' + (missingSub.length ? ' (missing: ' + missingSub.join(', ') + ')' : ''));
  }
}
process.exit(failures ? 1 : 0);
