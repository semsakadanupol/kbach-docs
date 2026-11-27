// index.html is a whole document: <!doctype html>, <html>, <head> and <body>
// are always there. The reader edits what's inside <head> and <body>, and the
// attributes of the <html>, <head> and <body> tags (lang="kh",
// class="scroll-smooth"); the tags themselves can't be deleted or renamed
// (KbachEditor's lockSkeleton). Older code (a share link, saved code from
// before) was just the body's markup: it's wrapped in the skeleton when it's
// loaded.

/**
 * A tag's attributes: nothing, or whitespace and then anything up to its ">"
 * (a ">" inside a quoted value too). A quote not closed yet, as while typing
 * class=", counts as a character. Never a "<" outside quotes: with the tag's
 * ">" deleted, the attributes would run on into the next tag.
 */
const ATTRS = `((?:\\s(?:[^<>"']|"[^"\\n]*"|'[^'\\n]*'|["'])*)?)`;

/**
 * The skeleton. Groups: 2, 4 and 8 are the <html>, <head> and <body> tags'
 * attributes; 6 and 10 the head's and the body's content. The rest is fixed.
 */
const SKELETON = new RegExp(
  '^(\\s*<!doctype html\\s*>\\s*<html)' + ATTRS + '(>\\s*<head)' + ATTRS + '(>)([\\s\\S]*?)(<\\/head\\s*>\\s*<body)' + ATTRS + '(>)([\\s\\S]*)(<\\/body\\s*>\\s*<\\/html\\s*>\\s*)$',
  'i',
);

const DEFAULT_HEAD = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Playground</title>
  `;

/** A document with nothing in its body: what Clear all leaves. */
export const EMPTY_DOCUMENT = documentWith('');

/** The words a new blank page opens with, selected so typing replaces them. */
export const STARTER_TEXT = 'Write something here';

/**
 * A new blank page (the gallery's Blank page card, New blank page in ⋯): a heading to type over
 * and a line about Kbach, in classes of the default palette (any kbach.config.js has them). Its
 * React version is made from this by convert.ts, so the two never drift apart.
 */
export const STARTER_DOCUMENT = documentWith(`
<div class="grid min-h-[80vh] place-items-center text-center">
  <div>
    <h1 class="bg-linear-to-r from-violet-6 to-rose-5 bg-clip-text pb-1 text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
      ${STARTER_TEXT}
    </h1>
    <p class="mt-3 text-gray-6 dark:text-gray-4">Every class gets its CSS from Kbach as you type.</p>
  </div>
</div>`);

function documentWith(body: string): string {
  const inner = body.trim() ? body.trim().replace(/^(?=.)/gm, '    ') : '    ';
  return '<!doctype html>\n<html lang="en">\n  <head>' + DEFAULT_HEAD + '</head>\n  <body>\n' + inner + '\n  </body>\n</html>\n';
}

type Range = { from: number; to: number };

export interface DocumentParts {
  /** the fixed runs of text, in order (the doctype, the tag names and brackets, the end tags) */
  locked: Range[];
  /** the attributes of the <html>, <head> and <body> tags (editable; empty, or starting with a space) */
  htmlAttrs: Range;
  headAttrs: Range;
  bodyAttrs: Range;
  /** what's inside <head> and inside <body> (editable) */
  head: Range;
  body: Range;
}

/** Where the skeleton and the editable parts are, or null when `html` isn't a whole document. */
export function documentParts(html: string): DocumentParts | null {
  const m = SKELETON.exec(html);
  if (!m) return null;
  // the groups' ranges, in order
  const ranges: Range[] = [];
  let at = 0;
  for (let g = 1; g < m.length; g++) {
    ranges.push({ from: at, to: at + m[g].length });
    at += m[g].length;
  }
  const [lead, htmlAttrs, toHead, headAttrs, headOpenEnd, head, toBody, bodyAttrs, bodyOpenEnd, body, tail] = ranges;
  return { locked: [lead, toHead, headOpenEnd, toBody, bodyOpenEnd, tail], htmlAttrs, headAttrs, bodyAttrs, head, body };
}

/** The editable parts, in document order. */
export function editableParts(parts: DocumentParts): Range[] {
  return [parts.htmlAttrs, parts.headAttrs, parts.head, parts.bodyAttrs, parts.body];
}

/** The skeleton's fixed text, whitespace aside: two documents with the same one have the same skeleton. */
export function skeletonKey(html: string): string | null {
  const parts = documentParts(html);
  if (!parts) return null;
  return parts.locked.map((r) => html.slice(r.from, r.to).replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim().toLowerCase()).join('|');
}

/**
 * A whole document as it is. One with <html> and <body> but laid out
 * otherwise (a comment between </head> and <body>, no doctype, no <head>) is
 * rebuilt around its own head and body: anything between the tags goes to the
 * top of the body, never a document inside another one's body. Anything else
 * (just the body's markup) is put in the body of a new one.
 */
export function ensureDocument(html: string): string {
  if (documentParts(html)) return html;
  const htmlTag = /<html\b([^>]*)>/i.exec(html);
  const body = /<body\b([^>]*)>([\s\S]*)<\/body\s*>/i.exec(html);
  if (!htmlTag || !body) return documentWith(html);
  const head = /<head\b([^>]*)>([\s\S]*?)<\/head\s*>/i.exec(html);
  // what sits between <html …> (or </head>) and <body …>: comments, stray markup
  const strayFrom = head ? head.index + head[0].length : htmlTag.index + htmlTag[0].length;
  const stray = body.index > strayFrom ? html.slice(strayFrom, body.index).trim() : '';
  const bodyContent = stray ? '\n    ' + stray + body[2] : body[2];
  return (
    '<!doctype html>\n<html' + htmlTag[1] + '>\n  <head' + (head?.[1] ?? '') + '>' + (head?.[2] ?? DEFAULT_HEAD) + '</head>\n  <body' + body[1] + '>' + bodyContent + '</body>\n</html>\n'
  );
}

/** The pieces a page is built from: the <html> and <body> start tags (with their attributes), and the head's and the body's content. */
export function pageParts(html: string): { htmlTag: string; headTag: string; bodyTag: string; head: string; body: string } {
  const parts = documentParts(html);
  if (!parts) return { htmlTag: '<html>', headTag: '<head>', bodyTag: '<body>', head: '', body: html };
  const slice = (r: Range) => html.slice(r.from, r.to);
  return {
    htmlTag: '<html' + slice(parts.htmlAttrs) + '>',
    headTag: '<head' + slice(parts.headAttrs) + '>',
    bodyTag: '<body' + slice(parts.bodyAttrs) + '>',
    head: slice(parts.head),
    body: slice(parts.body),
  };
}

/** The <html> tag with `dark` added to its classes (and data-theme="dark"), for a page shown dark. */
export function darkHtmlTag(htmlTag: string): string {
  const cls = /(\sclass\s*=\s*)(["'])([^"']*)\2/i.exec(htmlTag);
  let tag = cls
    ? htmlTag.slice(0, cls.index) + cls[1] + cls[2] + ('dark ' + cls[3]).trim() + cls[2] + htmlTag.slice(cls.index + cls[0].length)
    : htmlTag.replace(/^<html/i, '<html class="dark"');
  if (!/\sdata-theme\s*=/i.test(tag)) tag = tag.replace(/>$/, ' data-theme="dark">');
  return tag;
}

/** The document, parsed inert (nothing loads or runs): a whole one as it is, a fragment as a body. */
export function parseInert(html: string): Document {
  return new DOMParser().parseFromString(documentParts(html) ? html : '<body>' + html, 'text/html');
}
