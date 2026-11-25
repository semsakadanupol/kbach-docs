// A manual deploy, for when a change has to go up without a push: uploads
// the site built here (out/) to Vercel as plain static files.
//
//   KBACH_DOCS_URL=https://kbach.vercel.app npm run build
//   node scripts/deploy-vercel.mjs            (a preview address)
//   node scripts/deploy-vercel.mjs --prod     (https://kbach.vercel.app)
//
// Normally there's nothing to run: the Vercel project "kbach" (cyclone-studio
// team) is connected to this repository and builds every push to main with
// vercel.json. This folder must be linked to the project once
// (`npx vercel link --project kbach --scope cyclone-studio`, which writes the
// git-ignored .vercel/).
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const out = join(root, 'out');
const VERCEL = 'vercel@66.6.0';

if (!existsSync(join(root, '.vercel', 'project.json'))) {
  console.error('Not linked to a Vercel project. Run: npx vercel link --project kbach --scope cyclone-studio');
  process.exit(1);
}
if (!existsSync(join(out, 'robots.txt')) || !readFileSync(join(out, 'robots.txt'), 'utf8').includes('Sitemap:')) {
  console.error('out/ is missing or was built without KBACH_DOCS_URL (no canonical links, empty sitemap).\nRun: KBACH_DOCS_URL=https://kbach.vercel.app npm run build');
  process.exit(1);
}

// The CLI deploys the project folder it finds by walking up from where it
// runs: run in out/, it uploads the whole repository and builds it. So out/
// is copied to a folder outside the repository first and deployed from there.
const stage = mkdtempSync(join(tmpdir(), 'kbach-docs-deploy-'));
cpSync(out, stage, { recursive: true });
cpSync(join(root, '.vercel'), join(stage, '.vercel'), { recursive: true });
// vercel.json's addresses (its rewrites), without its build: the files are built.
const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
writeFileSync(join(stage, 'vercel.json'), JSON.stringify({ ...config, installCommand: null, buildCommand: null, outputDirectory: null }, null, 2));

const args = ['--yes', VERCEL, 'deploy', '--yes', ...(process.argv.includes('--prod') ? ['--prod'] : [])];
const result = spawnSync(['npx', ...args].join(' '), { cwd: stage, stdio: 'inherit', shell: true });
// Windows can keep a lock on the folder for a moment after the CLI exits; a
// leftover temp folder isn't worth failing a finished deploy for.
try {
  rmSync(stage, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  console.warn(`(couldn't delete ${stage}; it's a temporary copy of out/)`);
}
process.exit(result.status ?? 1);
