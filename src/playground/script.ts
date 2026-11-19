// The playground's Script tab: TypeScript is stripped to JavaScript
// (Sucrase, loaded only when TS is used), and every loop gets a guard so an
// infinite loop, easy to type by accident while the canvas re-runs on each
// pause, stops with an error instead of freezing the tab.

export type ScriptLang = 'js' | 'ts';

export interface Compiled {
  /** The JavaScript to run, or null when it didn't compile. */
  code: string | null;
  error?: { message: string; line: number | null };
}

/** TypeScript → JavaScript, line numbers unchanged, then loop guards. */
export async function compileScript(source: string, lang: ScriptLang, opts: { guard?: boolean } = {}): Promise<Compiled> {
  let js = source;
  if (lang === 'ts') {
    try {
      const { transform } = await import('sucrase');
      js = transform(source, { transforms: ['typescript'], disableESTransforms: true }).code;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const at = /\((\d+):\d+\)/.exec(message);
      return { code: null, error: { message: message.replace(/\s*\(\d+:\d+\)\s*$/, ''), line: at ? Number(at[1]) : null } };
    }
  }
  // the guard calls a helper only the playground's canvas has: an exported file goes without
  return { code: opts.guard === false ? js : guardLoops(js) };
}

const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof']);

/**
 * Inserts `__kbLoop(<line>);` at the start of every braced `for`, `while`
 * and `do` body. A small scanner, not a parser: it skips strings, template
 * literals, comments and regex literals, and leaves an unbraced loop body
 * alone. Only ever adds text inside a line, so line numbers don't move.
 */
export function guardLoops(src: string): string {
  const n = src.length;
  let out = '';
  let i = 0;
  let line = 1;
  let prev = ''; // last significant character
  let prevWord = '';

  const copy = (end: number) => {
    const chunk = src.slice(i, end);
    for (let k = 0; k < chunk.length; k++) if (chunk.charCodeAt(k) === 10) line++;
    out += chunk;
    i = end;
  };

  /** End index (exclusive) of the string, comment, template or regex starting at `at`, or -1. */
  const skipLiteral = (at: number, regexOk: boolean): number => {
    const c = src[at];
    const d = src[at + 1];
    if (c === '/' && d === '/') {
      const e = src.indexOf('\n', at);
      return e < 0 ? n : e;
    }
    if (c === '/' && d === '*') {
      const e = src.indexOf('*/', at + 2);
      return e < 0 ? n : e + 2;
    }
    if (c === '"' || c === "'") {
      let k = at + 1;
      while (k < n && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1;
      return Math.min(n, k + 1);
    }
    if (c === '`') {
      let k = at + 1;
      let depth = 0;
      while (k < n) {
        const ch = src[k];
        if (ch === '\\') k += 2;
        else if (depth === 0 && ch === '`') return k + 1;
        else if (ch === '$' && src[k + 1] === '{') {
          depth++;
          k += 2;
        } else {
          if (depth > 0 && ch === '{') depth++;
          else if (depth > 0 && ch === '}') depth--;
          k++;
        }
      }
      return n;
    }
    if (c === '/' && regexOk) {
      let k = at + 1;
      let inClass = false;
      while (k < n && src[k] !== '\n') {
        const ch = src[k];
        if (ch === '\\') k += 2;
        else {
          if (ch === '[') inClass = true;
          else if (ch === ']') inClass = false;
          else if (ch === '/' && !inClass) {
            k++;
            while (k < n && /[a-z]/i.test(src[k])) k++;
            return k;
          }
          k++;
        }
      }
      return k;
    }
    return -1;
  };

  const regexAllowed = () => prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev) || REGEX_AFTER_WORD.has(prevWord);

  /** Index just after the `)` matching the `(` at `open`. */
  const matchParen = (open: number): number => {
    let k = open;
    let depth = 0;
    let p = '(';
    while (k < n) {
      const ch = src[k];
      const lit = skipLiteral(k, '(,=:[!&|?{};'.includes(p));
      if (lit >= 0 && ch !== '(' && ch !== ')') {
        k = lit;
        p = '"';
        continue;
      }
      if (ch === '(') depth++;
      else if (ch === ')' && --depth === 0) return k + 1;
      if (!/\s/.test(ch)) p = ch;
      k++;
    }
    return n;
  };

  /** Index of the next significant character at or after `at` (skipping comments). */
  const nextSignificant = (at: number): number => {
    let k = at;
    while (k < n) {
      if (/\s/.test(src[k])) k++;
      else if (src[k] === '/' && (src[k + 1] === '/' || src[k + 1] === '*')) k = skipLiteral(k, false);
      else break;
    }
    return k;
  };

  while (i < n) {
    const c = src[i];
    const lit = skipLiteral(i, regexAllowed());
    if (lit >= 0) {
      const isComment = c === '/' && (src[i + 1] === '/' || src[i + 1] === '*');
      copy(lit);
      if (!isComment) {
        prev = '"';
        prevWord = '';
      }
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let k = i + 1;
      while (k < n && /[\w$]/.test(src[k])) k++;
      const word = src.slice(i, k);
      const isProperty = prev === '.';
      copy(k);
      prevWord = word;
      prev = 'a';
      if (isProperty) continue;
      let bodyAt = -1;
      if (word === 'for' || word === 'while') {
        let open = nextSignificant(i);
        // for await (…)
        if (word === 'for' && src.startsWith('await', open)) open = nextSignificant(open + 5);
        if (src[open] === '(') {
          const close = matchParen(open);
          const brace = nextSignificant(close);
          if (src[brace] === '{') bodyAt = brace;
        }
      } else if (word === 'do') {
        const brace = nextSignificant(i);
        if (src[brace] === '{') bodyAt = brace;
      }
      if (bodyAt >= 0) {
        copy(bodyAt + 1);
        out += '__kbLoop(' + line + ');';
        prev = '{';
        prevWord = '';
      }
      continue;
    }
    copy(i + 1);
    if (!/\s/.test(c)) {
      prev = c;
      prevWord = '';
    }
  }
  return out;
}
