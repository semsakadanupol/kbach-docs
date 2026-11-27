// HTML mode is a plain HTML page (2026-11-27, the user: "the html version … can't use kbach
// config directly and need cdn", then "move the config out but import it as script"): Kbach
// comes from its CDN script, @kbach/browser, as on a real page, and its config is a file of its
// own, kbach.config.js, that sets window.kbachConfig and loads before that script:
//
//   kbach.config.js   window.kbachConfig = { darkMode: 'class', extend: { … } };
//   index.html        <script src="kbach.config.js"></script>
//                     <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
//
// React mode's kbach.config.js is the build plugin's: `module.exports = { … }`. The same object,
// so these turn one into the other (the HTML ↔ React switch, the examples' one config for both
// versions, older saved code). The preview has no folder to load kbach.config.js from (its page
// is an srcdoc), so the canvas and a download get the file's text in place of the tag
// (withConfigInline). (No imports: Node's own test runner reads this file as it is, tests/cdn.mjs.)

/** The CDN script's address, as the docs give it (the latest @kbach/browser). */
export const CDN_SRC = 'https://cdn.jsdelivr.net/npm/@kbach/browser';
/** The config file an HTML page loads. */
export const CONFIG_FILE = 'kbach.config.js';

const NOTE = '<!-- Kbach from its CDN: the config first, since the script reads it once, as it loads -->';
const CDN_TAG = /<script\b[^>]*\bsrc\s*=\s*["'][^"']*@kbach\/browser[^"']*["'][^>]*>\s*<\/script>/i;
const CONFIG_TAG = /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?kbach\.config\.js["'][^>]*>\s*<\/script>/i;
/** an inline <script> (no src) whose text sets window.kbachConfig: a page may set it there instead */
const INLINE_CONFIG = /<script\b(?![^>]*\bsrc\s*=)[^>]*>(?:(?!<\/script>)[\s\S])*?window\.kbachConfig\s*=[\s\S]*?<\/script>/i;
const MODULE_START = /(?:module\.exports|export\s+default)\s*=?\s*/;
const WINDOW_START = /window\.kbachConfig\s*=\s*/;

/** kbach.config.js for a plain page: `window.kbachConfig = { … };` (the @type line kept: the editor types it). */
export function configAsScript(configText: string): string {
  return configText.replace(MODULE_START, 'window.kbachConfig = ');
}

/** kbach.config.js for the build plugin: `module.exports = { … };`. */
export function scriptAsConfig(scriptText: string): string {
  return scriptText.replace(WINDOW_START, 'module.exports = ');
}

/** Whether a kbach.config.js is the build plugin's kind (module.exports), not a plain page's. */
export function isModuleConfig(configText: string): boolean {
  return MODULE_START.test(configText) && !WINDOW_START.test(configText);
}

/** Whether the page loads Kbach's CDN script. */
export function hasCdnScript(html: string): boolean {
  return CDN_TAG.test(html);
}

/** Whether the page loads kbach.config.js (or sets window.kbachConfig in a script of its own). */
export function hasConfigScript(html: string): boolean {
  return CONFIG_TAG.test(html) || INLINE_CONFIG.test(html);
}

/**
 * The page with Kbach's CDN setup at the end of its <head>: a short note, kbach.config.js,
 * then the CDN script. A page that already loads the script is left alone.
 */
export function withCdnSetup(html: string): string {
  if (hasCdnScript(html)) return html;
  const close = /^([ \t]*)<\/head>/m.exec(html);
  if (!close) return html;
  const inner = close[1] + '  ';
  const block = inner + NOTE + '\n' + inner + '<script src="' + CONFIG_FILE + '"></script>\n' + inner + '<script src="' + CDN_SRC + '"></script>\n';
  return html.slice(0, close.index) + block + html.slice(close.index);
}

/** The page without Kbach's CDN setup: the note, the kbach.config.js tag and the CDN script tag. */
export function withoutCdnSetup(html: string): string {
  const strip = (h: string, re: RegExp) => h.replace(new RegExp('^[ \\t]*' + re.source + '[ \\t]*\\n?', 'im'), '').replace(re, '');
  return [new RegExp(NOTE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), CONFIG_TAG, CDN_TAG].reduce(strip, html);
}

/**
 * The page with kbach.config.js's text in place of its tag: what the preview runs (an srcdoc
 * has no folder to load the file from) and what a download holds (one file). Where the tag is,
 * so the order the reader chose stays (after the CDN script, it's read too late, as it would be).
 */
export function withConfigInline(html: string, configText: string): string {
  const m = CONFIG_TAG.exec(html);
  if (!m) return html;
  const body = ('// ' + CONFIG_FILE + '\n' + configText.trim()).replace(/<\/script/gi, '<\\/script');
  return html.slice(0, m.index) + '<script>\n' + body + '\n</script>' + html.slice(m.index + m[0].length);
}

/** What's wrong with the page's Kbach setup, on its lines: no script, no config, or the config after the script. */
export function cdnProblems(html: string): { line: number; message: string }[] {
  const lineAt = (offset: number) => html.slice(0, offset).split('\n').length;
  const head = /<\/head>/i.exec(html);
  const headLine = head ? lineAt(head.index) : 1;
  const tag = CDN_TAG.exec(html);
  if (!tag) return [{ line: headLine, message: 'Kbach isn’t loaded: add <script src="' + CDN_SRC + '"></script> to <head>' }];
  const config = CONFIG_TAG.exec(html) ?? INLINE_CONFIG.exec(html);
  if (!config) return [{ line: lineAt(tag.index), message: 'kbach.config.js isn’t loaded: add <script src="' + CONFIG_FILE + '"></script> before this line' }];
  if (config.index > tag.index) return [{ line: lineAt(config.index), message: 'Load the config before the Kbach script: it reads window.kbachConfig once, as it loads' }];
  return [];
}

// --- the page's own script: index.html loads it, as a real page does (2026-11-27, the user:
// "missing the script that make active the JS/TS"), with a module tag before </body>. script.ts
// is loaded as it is, the way Vite serves one; the preview compiles it. The canvas and a
// download put the compiled script where the tag is (withScriptMark, then canvas.ts); with no
// tag the script doesn't run, as on a real page.

const SCRIPT_TAG = /<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?script\.(?:js|ts)["'][^>]*>\s*<\/script>/i;
/** Where the canvas and a download put the page's compiled script: in place of its tag. */
export const SCRIPT_MARK = '<!--kb-script-->';

/** The script file's name for a language: script.js or script.ts. */
export function scriptFile(lang: string): string {
  return 'script.' + lang;
}

/** Whether index.html loads the page's script (script.js or script.ts). */
export function hasScriptTag(html: string): boolean {
  return SCRIPT_TAG.test(html);
}

/** The page loading its script with a module tag on its own line before </body>. A page that already loads it is left alone. */
export function withScriptTag(html: string, lang: string): string {
  if (hasScriptTag(html)) return html;
  const close = /^([ \t]*)<\/body>/m.exec(html);
  if (!close) return html;
  return html.slice(0, close.index) + close[1] + '  <script type="module" src="' + scriptFile(lang) + '"></script>\n' + html.slice(close.index);
}

/** The page without its script tag (React mode runs App.jsx itself). */
export function withoutScriptTag(html: string): string {
  return html.replace(new RegExp('^[ \\t]*' + SCRIPT_TAG.source + '[ \\t]*\\n?', 'im'), '').replace(SCRIPT_TAG, '');
}

/** The script tag pointing at the file of this language (the JS / TS switch renames the file). */
export function renameScriptTag(html: string, lang: string): string {
  return html.replace(SCRIPT_TAG, (tag) => tag.replace(/script\.(?:js|ts)(?=["'])/, scriptFile(lang)));
}

/** The page with SCRIPT_MARK in place of its script tag (for the canvas and a download). */
export function withScriptMark(html: string): string {
  return html.replace(SCRIPT_TAG, SCRIPT_MARK);
}

/** What's wrong with how the page loads its script, on its line: a script with code that never loads, or the other language's file. */
export function scriptProblems(html: string, hasCode: boolean, lang: string): { line: number; message: string }[] {
  const lineAt = (offset: number) => html.slice(0, offset).split('\n').length;
  const tag = SCRIPT_TAG.exec(html);
  const file = scriptFile(lang);
  if (!tag) {
    if (!hasCode) return [];
    const body = /<\/body>/i.exec(html);
    return [{ line: body ? lineAt(body.index) : 1, message: file + ' doesn’t run: add <script type="module" src="' + file + '"></script> before </body>' }];
  }
  if (!tag[0].includes(file)) return [{ line: lineAt(tag.index), message: 'The script is ' + file + ': load that file' }];
  return [];
}

/** A plain HTML page can't import Kbach's packages (that takes a bundler): the lines that try, for the Script tab. */
export function packageImports(script: string): { line: number; message: string }[] {
  const out: { line: number; message: string }[] = [];
  script.split('\n').forEach((text, i) => {
    if (/\bfrom\s+['"]@kbach\/|import\s*\(?\s*['"]@kbach\//.test(text)) {
      out.push({ line: i + 1, message: 'A plain HTML page has no packages: use window.Kbach (Kbach.ready, Kbach.setMode, Kbach.toggle)' });
    }
  });
  return out;
}

/**
 * Older HTML-mode code (shared links and saved code from before 2026-11-27) had the build
 * plugin's kbach.config.js, no CDN script and no tag for its script (the playground ran it
 * anyway): its config becomes the plain page's kind, the page gets the setup in its <head>, and,
 * when it has a script, the tag that loads it.
 */
export function upgradeHtmlPage<T extends { html: string; config: string; mode: string; script: string; lang: string }>(files: T): T {
  if (files.mode !== 'html') return files;
  const config = isModuleConfig(files.config) ? configAsScript(files.config) : files.config;
  let html = files.html;
  if (!hasCdnScript(html)) {
    html = withCdnSetup(html);
    if (files.script.trim()) html = withScriptTag(html, files.lang);
  }
  return config === files.config && html === files.html ? files : { ...files, config, html };
}
