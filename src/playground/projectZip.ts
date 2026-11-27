// Download (2026-11-27, the user: "make download as zip that keep css/script/html in difference
// place"): the page as a project, each file on its own, in a .zip with one folder.
//
//   An HTML page: index.html, kbach.config.js, script.js (script.ts, and the script.js it
//   compiles to, which index.html loads: a browser can't run TypeScript), kbach.css (the CSS
//   Kbach generated for its classes, as the kbach.css tab shows it: the page is styled from the
//   first paint; the CDN script styles what a script adds later, and runs dark mode), style.css
//   (the preview's page basics) and a README.
//   A React page: a Vite project as the Installation page sets one up: package.json,
//   vite.config, index.html, src/main, src/App, src/kbach.css (what the plugin writes; it
//   rewrites it on the first run), kbach.config.js, .gitignore and a README.
import { strToU8, zipSync } from 'fflate';
import { renameScriptTag } from './cdn';

export interface ProjectInput {
  mode: 'html' | 'react';
  /** the folder's name (and the .zip's) */
  name: string;
  html: string;
  script: string;
  lang: 'js' | 'ts';
  config: string;
  /** an HTML page in TypeScript: script.ts compiled to JavaScript, the script.js index.html loads */
  compiled: string | null;
  /** kbach.css: the CSS Kbach generated for the page's classes (the kbach.css tab) */
  kbachCss: string;
  /** an HTML page: the preview's page basics (style.css) */
  basics: string;
  /** @kbach/react's version, for package.json */
  kbachVersion: string;
}

const SITE = 'https://kbach.vercel.app';

/** One line before the line that holds `close` (a closing tag), indented as that tag's children. */
function insertBefore(html: string, close: RegExp, line: string): string {
  const m = new RegExp('^([ \\t]*)' + close.source, 'm').exec(html);
  if (!m) return html;
  return html.slice(0, m.index) + m[1] + '  ' + line + '\n' + html.slice(m.index);
}

const withNewline = (text: string) => (text.endsWith('\n') ? text : text + '\n');

/** CSS a rule to a line ("a { … } b { … }" → one rule per line). */
const ruleLines = (css: string) => css.replace(/\}\s*/g, '}\n').trim() + '\n';

/** The project's files, by path inside its folder. */
export function projectFiles(p: ProjectInput): Record<string, string> {
  return p.mode === 'react' ? reactProject(p) : htmlProject(p);
}

function htmlProject(p: ProjectInput): Record<string, string> {
  const ts = p.lang === 'ts';
  // a browser loads script.js: the TypeScript page's tag points at what script.ts compiles to
  let html = ts ? renameScriptTag(p.html, 'js') : p.html;
  html = insertBefore(html, /<\/head>/, '<link rel="stylesheet" href="kbach.css" />');
  html = insertBefore(html, /<\/head>/, '<link rel="stylesheet" href="style.css" />');
  const files: Record<string, string> = {
    'index.html': html,
    'kbach.config.js': withNewline(p.config),
    'kbach.css': withNewline(p.kbachCss),
    'style.css': "/* The Kbach playground preview's page basics: its padding and default colors. */\n" + ruleLines(p.basics),
  };
  if (p.script.trim()) {
    if (ts) {
      files['script.ts'] = p.script;
      files['script.js'] = '// script.ts, compiled to JavaScript (a browser runs this one; index.html loads it)\n' + (p.compiled ?? '');
    } else {
      files['script.js'] = p.script;
    }
  }
  files['README.md'] = [
    '# ' + p.name,
    '',
    'A plain HTML page made in the [Kbach playground](' + SITE + '/playground).',
    '',
    '- `index.html`: the page. It loads `kbach.config.js`, then Kbach from its CDN, and its script.',
    '- `kbach.config.js`: Kbach’s settings (`window.kbachConfig`). See [Plain HTML](' + SITE + '/plain-html).',
    ...(p.script.trim() ? [ts ? '- `script.ts`: the page’s script, and `script.js`, what it compiles to (`index.html` loads that one).' : '- `script.js`: the page’s script.'] : []),
    '- `kbach.css`: the CSS Kbach generated for the page’s classes, so it’s styled from the first paint. The CDN script styles what a script adds later, and runs dark mode.',
    '- `style.css`: the playground preview’s page basics (padding, colors).',
    '',
    'Open it through a local server, not as a file: a browser won’t load a module script from `file://`.',
    '',
    '```sh',
    'npx serve .',
    '```',
    '',
  ].join('\n');
  return files;
}

function reactProject(p: ProjectInput): Record<string, string> {
  const x = p.lang === 'ts' ? 'tsx' : 'jsx';
  const configExt = p.lang === 'ts' ? 'ts' : 'js';
  const html = insertBefore(p.html, /<\/body>/, '<script type="module" src="/src/main.' + x + '"></script>');
  const pkg = {
    name: p.name,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: { '@kbach/react': '^' + p.kbachVersion, react: '^19.2.0', 'react-dom': '^19.2.0' },
    devDependencies: { '@vitejs/plugin-react': '^6.3.0', vite: '^8.4.0' },
  };
  return {
    'package.json': JSON.stringify(pkg, null, 2) + '\n',
    ['vite.config.' + configExt]: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport { kbach } from '@kbach/react/vite';\n\nexport default defineConfig({\n  plugins: [kbach(), react()],\n});\n",
    'index.html': html,
    ['src/main.' + x]:
      "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './kbach.css';\n\ncreateRoot(document.getElementById('root')" +
      (p.lang === 'ts' ? '!' : '') +
      ').render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n',
    ['src/App.' + x]: p.script,
    'src/kbach.css': withNewline(p.kbachCss),
    'kbach.config.js': withNewline(p.config),
    '.gitignore': 'node_modules\ndist\n',
    'README.md': [
      '# ' + p.name,
      '',
      'A React page made in the [Kbach playground](' + SITE + '/playground), as a Vite project set up the way [Installation](' + SITE + '/installation) does.',
      '',
      '```sh',
      'npm install',
      'npm run dev',
      '```',
      '',
      '- `src/App.' + x + '`: the page.',
      '- `kbach.config.js`: Kbach’s settings, read by the plugin in `vite.config.' + configExt + '`.',
      '- `src/kbach.css`: the CSS for your classes. The plugin writes it: don’t edit it by hand.',
      '',
    ].join('\n'),
  };
}

/** The project as a .zip, its files in one folder named after it. */
export function projectZip(p: ProjectInput): Uint8Array {
  const files = projectFiles(p);
  return zipSync(Object.fromEntries(Object.entries(files).map(([path, text]) => [p.name + '/' + path, strToU8(text)])), { level: 6 });
}
