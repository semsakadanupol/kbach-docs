// Kbach's rules for AI assistants exist in one place, packages/cli/src/aiRules.ts,
// and are copied into the docs page (and from there llms.txt), each package's
// llms.txt and README. This fails when a copy is out of date: run
// node scripts/sync-ai-rules.mjs from the repository root. (No browser.)
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
let ok = true;
try {
  const out = execFileSync(process.execPath, ['scripts/sync-ai-rules.mjs', '--check'], { cwd: root, encoding: 'utf-8' });
  console.log('OK   ' + out.trim().split('\n').pop());
} catch (e) {
  ok = false;
  console.log('FAIL ' + (e.stdout || e.message).trim().replace(/\n/g, '; '));
}
process.exit(ok ? 0 : 1);
