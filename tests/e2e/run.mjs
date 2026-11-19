// Runs every end-to-end check against a production build of the docs site.
//
//   npm run test:e2e              build, then run all suites
//   npm run test:e2e -- layout    only the suites whose file name contains "layout"
//
// Each suite is a plain Node script driving Chromium through Playwright. It
// prints one "OK" / "FAIL" line per check and exits non-zero on a failure.
// They expect the built site on http://localhost:5176 (this script serves
// out/ there with scripts/serve.mjs, the way a static host would) and write
// screenshots under ./shots.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../scripts/serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, '..', '..');
const PORT = 5176;
const filter = process.argv[2] ?? '';

const suites = readdirSync(here)
  .filter((f) => f.endsWith('.mjs') && f !== 'run.mjs' && f.includes(filter))
  .sort();
if (suites.length === 0) {
  console.error('No suite matches "' + filter + '"');
  process.exit(1);
}

if (!existsSync(join(docs, 'out', 'index.html'))) {
  console.error('No build in out/: run npm run build first (or npm run test:e2e, which builds).');
  process.exit(1);
}
const server = await serve(join(docs, 'out'), PORT).catch((e) => {
  console.error('Could not serve out/ on port ' + PORT + ' (is it free?): ' + e.message);
  process.exit(1);
});
const stopServer = () => server.close();

mkdirSync(join(here, 'shots'), { recursive: true });
const results = [];
for (const suite of suites) {
  const started = Date.now();
  const out = await new Promise((resolve) => {
    let text = '';
    const child = spawn(process.execPath, [suite], { cwd: here, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (d) => (text += d));
    child.stderr.on('data', (d) => (text += d));
    child.on('exit', (code) => resolve({ code, text }));
  });
  const ok = (out.text.match(/^OK /gm) ?? []).length;
  // each FAIL line, with the indented lines a check prints under it (the page errors, say)
  const lines = out.text.split('\n');
  const failed = lines.flatMap((l, i) => {
    if (!l.startsWith('FAIL ')) return [];
    const detail = [];
    for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) detail.push(lines[j]);
    return [l, ...detail];
  });
  const passed = out.code === 0 && failed.length === 0 && ok > 0;
  results.push(passed);
  console.log((passed ? 'PASS ' : 'FAIL ') + suite.padEnd(36) + String(ok).padStart(3) + ' checks  ' + ((Date.now() - started) / 1000).toFixed(1) + 's');
  if (!passed) console.log(failed.length ? failed.join('\n') : out.text.split('\n').slice(-15).join('\n'));
}

stopServer();
const failures = results.filter((p) => !p).length;
console.log(failures ? failures + ' of ' + results.length + ' suites FAILED' : 'All ' + results.length + ' suites passed');
process.exit(failures ? 1 : 0);
