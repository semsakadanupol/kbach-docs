// Uploads the built site (out/) to Vercel as plain static files.
//
//   KBACH_DOCS_URL=https://kbach.vercel.app npm run build
//   node scripts/deploy-vercel.mjs            (a preview address)
//   node scripts/deploy-vercel.mjs --prod     (https://kbach.vercel.app)
//
// Vercel doesn't build the docs itself: they need the Rust engine (wasm-pack)
// and the workspace's own @kbach/react build, which its build machines don't
// have. So the site is built here and only out/ is sent. The project is
// "kbach" in the cyclone-studio team; this folder must be linked to it once
// (`npx vercel link --project kbach --scope cyclone-studio`, which writes the
// git-ignored .vercel/). Don't connect the GitHub repository to the project:
// a push would start a Vercel build, and it fails.
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
// runs, inside a git repository: run in out/, it uploaded all of
// apps/kbach-docs and Vercel tried to build Next.js. So out/ is copied to a
// folder outside the repository first and deployed from there.
const stage = mkdtempSync(join(tmpdir(), 'kbach-docs-deploy-'));
cpSync(out, stage, { recursive: true });
cpSync(join(root, '.vercel'), join(stage, '.vercel'), { recursive: true });
// Serve the files as they are: no framework, no build. An address with no
// dot in its last part (/en/installation) is served from that name plus
// .html, like scripts/serve.mjs; files that exist are served first, and a
// missing page gets 404.html. Not cleanUrls: it also redirects every .html
// address (/googlec034efb1ead34943.html, Google Search Console's ownership
// file in public/, has to be served as it is, not redirected).
writeFileSync(
  join(stage, 'vercel.json'),
  JSON.stringify(
    {
      framework: null,
      buildCommand: null,
      installCommand: null,
      outputDirectory: null,
      trailingSlash: false,
      rewrites: [{ source: '/:path((?:[^/]+/)*[^/.]+)', destination: '/:path.html' }],
    },
    null,
    2,
  ),
);

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
