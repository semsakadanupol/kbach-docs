// Runs after `next build` (npm run build). Undoes a Next.js bug on Windows.
//
// For each page, the static export writes the small files the browser asks
// for when it prefetches a link: /installation/__next.!KGVuKQ.$d$slug.__PAGE__.txt,
// one flat name. On Windows, Next.js 16 builds those names from paths with
// backslashes and writes them as folders instead
// (installation/__next.!KGVuKQ/$d$slug/__PAGE__.txt), so every prefetch
// gets a 404 and every link click loads the whole page. This puts each file
// back under its flat name. On macOS and Linux there's nothing to do.
// (next/dist/export/index.js: collectSegmentPaths uses path.relative, then
// convertSegmentPathToStaticExportFilename replaces only "/".)
import { readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const out = join(process.cwd(), 'out');
let moved = 0;

/** Every file under `dir`, as paths relative to it. */
function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name)).map((f) => join(e.name, f)) : [e.name]));
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      for (const file of filesIn(path)) {
        renameSync(join(path, file), join(dir, entry.name + '.' + file.split(sep).join('.')));
        moved++;
      }
      rmSync(path, { recursive: true });
    } else {
      walk(path);
    }
  }
}

if (statSync(out, { throwIfNoEntry: false })?.isDirectory()) {
  walk(out);
  if (moved) console.log('fix-windows-export: gave ' + moved + ' prefetch files in ' + relative(process.cwd(), out) + '/ their flat names');
}
