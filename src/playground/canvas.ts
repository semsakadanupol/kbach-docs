import runtime from './canvas-runtime.js?raw';
import { sansStack } from './engine';
import { darkHtmlTag, pageParts, parseInert } from './document';

// The canvas document. It's sandboxed with allow-scripts but WITHOUT
// allow-same-origin: the reader's script runs in an opaque origin and can't
// touch the docs page (its DOM, storage or cookies), which matters because a
// shared link carries someone else's script. The page talks to it only
// through postMessage (see canvas-runtime.js).

export const CANVAS_SANDBOX = 'allow-scripts allow-forms';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500&display=swap';

/** Page basics for the canvas, placed between the reset and the utilities. */
export function canvasBase(): string {
  return (
    'html { color-scheme: light; } html.dark { color-scheme: dark; }' +
    // (html body: after kbach.css's reset, which sets body's margin and padding,
    // and still below any class on the body)
    ' html body { margin: 0; padding: 1.5rem; min-height: 100vh; box-sizing: border-box; font-family: ' +
    sansStack() +
    '; color: #1f272b; background: #ffffff; -webkit-font-smoothing: antialiased; }' +
    ' html.dark body { color: #ece6d8; background: #12181b; }'
  );
}

/**
 * A whole canvas document: the stylesheet, the runtime, the reader's HTML,
 * and their script (already compiled to JavaScript) as a module at the end.
 * `gen` stamps the runtime's messages, so ones from a replaced canvas are ignored.
 */
export function canvasDocument(opts: {
  html: string;
  css: string;
  dark: boolean;
  script: string | null;
  gen: number;
  inspecting?: boolean;
  /** where the last canvas was scrolled to: a re-run lands in the same place */
  scroll?: { x: number; y: number } | null;
}): string {
  // index.html's own head (its <style>s, <title>) after Kbach's stylesheet; its body as the body
  const page = pageParts(opts.html);
  const head =
    '<!doctype html>' +
    // index.html's own <html> tag (lang, its classes); dark adds the class and data-theme="dark",
    // so dark: works with any darkMode in kbach.config.js (for 'media', the runtime switches the
    // prefers-color-scheme rules)
    (opts.dark ? darkHtmlTag(page.htmlTag) : page.htmlTag) +
    page.headTag +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="' +
    FONTS +
    '"><style id="kb-css">' +
    opts.css.replace(/<\/style/gi, '<\\/style') +
    '</style>' +
    page.head;
  const body = '</head>' + page.bodyTag + page.body;
  if (opts.script === null) return head + runtimeTag(opts.gen, 0, opts.inspecting, opts.scroll) + body + '</body></html>';
  // The script's first line is the document's line OFFSET + 1, so the runtime
  // can turn an error's line in the document into a line in the Script tab.
  // The offset's digits never add a line, so measure with a placeholder.
  const before = head + runtimeTag(opts.gen, 0, opts.inspecting, opts.scroll) + body + '\n<script type="module">\n';
  const offset = before.split('\n').length - 1;
  return (
    head +
    runtimeTag(opts.gen, offset, opts.inspecting, opts.scroll) +
    body +
    '\n<script type="module">\n' +
    opts.script.replace(/<\/script/gi, '<\\/script') +
    '\n</script></body></html>'
  );
}

function runtimeTag(gen: number, offset: number, inspecting = false, scroll?: { x: number; y: number } | null): string {
  return (
    '<script data-gen="' + gen + '" data-offset="' + offset + '"' +
    (inspecting ? ' data-inspect' : '') +
    (scroll && (scroll.x || scroll.y) ? ' data-scroll="' + Math.round(scroll.x) + ',' + Math.round(scroll.y) + '"' : '') +
    '>' + runtime + '</script>'
  );
}

/**
 * The page as a file of its own: the HTML, its CSS (reset, theme and every
 * class it uses) and its script, with nothing from the playground. Opens
 * anywhere, no Kbach install needed.
 */
export function exportDocument(opts: { html: string; css: string; dark: boolean; script: string | null }): string {
  const page = pageParts(withFullUrls(opts.html));
  const own = page.head.trim();
  const lines = [
    '<!doctype html>',
    opts.dark ? darkHtmlTag(page.htmlTag).replace(/ data-theme="dark">$/, '>') : page.htmlTag,
    page.headTag,
    // index.html's own head (its meta tags and title); a page from before index.html had one gets these
    ...(own ? [own] : ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<title>Kbach playground</title>']),
    '<!-- Made in the Kbach playground. The CSS below is what Kbach generated for the classes on this page. -->',
    '<link rel="stylesheet" href="' + FONTS + '">',
    '<style>',
    opts.css.replace(/<\/style/gi, '<\\/style'),
    '</style>',
    '</head>',
    page.bodyTag,
    page.body.trim(),
  ];
  if (opts.script) lines.push('<script type="module">', opts.script.replace(/<\/script/gi, '<\\/script'), '</script>');
  lines.push('</body>', '</html>', '');
  return lines.join('\n');
}

/**
 * Site-relative URLs (src="/kbach-logo-64.png") made full: in the preview
 * they load from this site, but a downloaded file, or a tab opened from a
 * blob, has no site to resolve them against. Not "#top" or "page.html": those
 * mean the same wherever the file is.
 */
function withFullUrls(html: string): string {
  return html.replace(/(\s(?:src|href|poster)\s*=\s*["'])\/(?!\/)/gi, (_, attr: string) => attr + location.origin + '/');
}

/**
 * A page that shows an exported document in a sandboxed frame. "Open in a new
 * tab" uses this: the tab itself is on this site, so the reader's script runs
 * inside the frame (no allow-same-origin), never on the docs site's origin.
 */
export function sandboxedTab(doc: string): string {
  const escaped = doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return (
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Kbach playground</title><style>html,body{margin:0;height:100%}iframe{display:block;border:0;width:100%;height:100%}</style></head>' +
    '<body><iframe sandbox="allow-scripts allow-forms allow-modals allow-popups" title="Kbach playground page" srcdoc="' + escaped + '"></iframe></body></html>'
  );
}

/**
 * What index.html carries besides its markup, parsed inert: the code of its
 * inline <script>s (their class names get CSS up front, like the script
 * file's), the classes its inline <style>s define (the reader's own CSS, so
 * never "unknown"), and the tags it uses (the reset keeps only theirs, as the
 * build plugin does).
 */
export function inlineParts(html: string): { scripts: string; styleClasses: Set<string>; tags: Set<string> } {
  const doc = parseInert(html);
  const scripts = [...doc.querySelectorAll('script')].map((s) => s.textContent ?? '').join('\n');
  const css = [...doc.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const styleClasses = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
  const tags = new Set([...doc.body.querySelectorAll('*')].map((el) => el.tagName.toLowerCase()));
  return { scripts, styleClasses, tags };
}

/** Every class used in an HTML string (parsed inert, nothing loads or runs). */
export function classesInHtml(html: string): string[] {
  const doc = parseInert(html);
  const out = new Set<string>();
  doc.querySelectorAll('[class]').forEach((el) => {
    for (const c of (el.getAttribute('class') ?? '').split(/\s+/)) if (c) out.add(c);
  });
  return [...out];
}

/**
 * Words in a script that could be classes, the way Kbach's own scanner reads
 * source: anything between quotes, backticks or spaces. Their CSS is made up
 * front, so a class the script adds later is styled the moment it lands
 * (a transition plays on its first use, too). A class built from pieces at
 * runtime still works: the canvas reports it and its CSS follows.
 */
export function scriptCandidates(script: string): string[] {
  const out = new Set<string>();
  for (const m of script.matchAll(/(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
    for (const word of m[2].split(/[\s"'`]+/)) {
      if (word.length > 1 && word.length < 80 && /^[!-~]+$/.test(word) && !/[${}<>;]/.test(word) && /[a-z]/.test(word)) out.add(word);
    }
  }
  return [...out];
}
