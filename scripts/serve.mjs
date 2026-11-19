// Serves the built site (out/) the way a static host does: /installation is
// out/installation.html, and an address with no file gets out/404.html with a
// 404 status. No dependencies, so the end-to-end checks can start it too.
//
//   node scripts/serve.mjs [folder] [port]      (npm run serve)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** Starts the server; resolves once it listens. */
export function serve(folder, port) {
  const root = resolve(folder);
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^[\\/]+/, '');
    const base = join(root, path);
    let found = null;
    for (const candidate of [base, base + '.html', join(base, 'index.html')]) {
      if (candidate.startsWith(root) && (await isFile(candidate))) {
        found = candidate;
        break;
      }
    }
    const file = found ?? join(root, '404.html');
    res.writeHead(found ? 200 : 404, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, () => ok(server));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [folder = 'out', port = '5175'] = process.argv.slice(2);
  await serve(folder, Number(port));
  console.log('Serving ' + folder + '/ at http://localhost:' + port);
}
