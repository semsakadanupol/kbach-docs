// The files the playground's TypeScript service needs (src/playground/ts/), gathered into ONE
// JSON file, public/ts/files.json, so the worker loads them in one request, from this site:
//   - TypeScript's own lib files, all of them (the service reads only those its options name:
//     ts/options.ts; listing every one keeps this script plain JavaScript, for Node 20),
//   - the type packages a page imports: react and react-dom (@types, with csstype), and
//     @kbach/react's own .d.ts/.d.mts, each under /node_modules/<name>/ with its package.json,
//     so `import { clsx } from '@kbach/react'` resolves the way it does in a project.
// All from the installed packages, so the types are the versions this site runs.
// Runs before `next build` and `next dev` (package.json). public/ts/ isn't committed.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));

const files = {};
const tsLib = dirname(require.resolve('typescript/lib/lib.d.ts'));
for (const name of readdirSync(tsLib).filter((n) => /^lib\..*\.d\.ts$/.test(n))) files['/' + name] = readFileSync(join(tsLib, name), 'utf8');

/** A package's declaration files and package.json, at /node_modules/<name>/… */
function addPackage(name, keep = (f) => /\.d\.m?ts$/.test(f)) {
  const dir = dirname(require.resolve(name + '/package.json'));
  const walk = (sub) => {
    for (const entry of readdirSync(join(dir, sub), { withFileTypes: true })) {
      const rel = sub ? sub + '/' + entry.name : entry.name;
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'ts5.0') walk(rel);
      } else if (rel === 'package.json' || keep(rel)) files['/node_modules/' + name + '/' + rel] = readFileSync(join(dir, rel), 'utf8');
    }
  };
  walk('');
}
addPackage('@types/react');
addPackage('@types/react-dom');
addPackage('csstype');
addPackage('@kbach/react');

const out = join(root, 'public', 'ts');
mkdirSync(out, { recursive: true });
const json = JSON.stringify(files);
writeFileSync(join(out, 'files.json'), json);
console.log(`ts-files: ${Object.keys(files).length} files, ${(json.length / 1024 / 1024).toFixed(1)} MB → public/ts/files.json`);
