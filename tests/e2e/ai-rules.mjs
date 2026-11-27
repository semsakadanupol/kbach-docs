// Kbach's rules for AI assistants come from the main repository
// (packages/cli/src/aiRules.ts) and ship in every package's llms.txt. The
// "Using AI assistants" page (and from it this site's llms.txt) keeps a copy:
// it must match the rules in the installed @kbach/react's llms.txt, so after
// a release that changes them, update node_modules (npm install) and copy
// them into content/ai-assistants.md. (No browser.)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const llms = readFileSync(require.resolve('@kbach/react/package.json').replace(/package\.json$/, 'llms.txt'), 'utf-8').replace(/\r\n/g, '\n');
const rules = llms.split('## Rules for AI assistants\n')[1]?.trim();
const version = require('@kbach/react/package.json').version;
let failures = 0;
for (const file of ['content/ai-assistants.md']) {
  const md = readFileSync(new URL('../../' + file, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');
  const block = md.match(/^```text\n([\s\S]*?)^```/m)?.[1]?.trim();
  const ok = !!rules && block === rules;
  if (!ok) failures++;
  console.log((ok ? 'OK   ' : 'FAIL ') + file + ' has the AI rules of @kbach/react ' + version + (ok ? '' : ' (copy them from node_modules/@kbach/react/llms.txt)'));
}
process.exit(failures ? 1 : 0);
