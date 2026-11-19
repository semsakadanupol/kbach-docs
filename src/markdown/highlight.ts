// A small syntax highlighter for the languages the docs show. It splits
// code into typed tokens; CodeBlock maps each type to a color class.

export type TokenType = 'plain' | 'comment' | 'string' | 'keyword' | 'number' | 'fn' | 'tag' | 'attr' | 'prop' | 'punct' | 'cmd' | 'flag' | 'add' | 'del';
export interface Token {
  type: TokenType;
  text: string;
}

type Rule = [RegExp, TokenType | ((m: string) => TokenType)];

const JS_KEYWORDS = new Set(
  'import export from default const let var function return if else for while of in new class extends async await typeof type interface as declare true false null undefined this module require'.split(
    ' ',
  ),
);

const BT = '\x60'; // a backtick, spelled out so this file has none of its own

// JavaScript and TypeScript, outside JSX tags and text (lexJs adds those)
const JS: Rule[] = [
  [/\/\/[^\n]*/y, 'comment'],
  [/\/\*[\s\S]*?\*\//y, 'comment'],
  [/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y, 'string'],
  [new RegExp(BT + '(?:[^' + BT + '\\\\]|\\\\.)*' + BT, 'y'), 'string'],
  [/\b\d[\d_.]*\b/y, 'number'],
  [/[A-Za-z_$][\w$-]*(?==)/y, 'attr'],
  [/[A-Za-z_$][\w$]*(?=\s*\()/y, (m) => (JS_KEYWORDS.has(m) ? 'keyword' : 'fn')],
  [/[A-Za-z_$][\w$]*(?=\s*:(?!:))/y, (m) => (JS_KEYWORDS.has(m) ? 'keyword' : 'prop')],
  [/[A-Za-z_$][\w$]*/y, (m) => (JS_KEYWORDS.has(m) ? 'keyword' : 'plain')],
  [/[{}()[\];,.=+\-*/!?:&|<>]/y, 'punct'],
];

const SH: Rule[] = [
  [/#[^\n]*/y, 'comment'],
  [/"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/y, 'string'],
  [/(?:^|(?<=[|;&]\s*))(?:npm|npx|pnpm|yarn|bun|cargo|cd|git|code)\b/my, 'cmd'],
  [/\s--?[\w-]+/y, 'flag'],
  [/[^\s"'#]+/y, 'plain'],
];

const CSS: Rule[] = [
  [/\/\*[\s\S]*?\*\//y, 'comment'],
  [/"[^"\n]*"|'[^'\n]*'/y, 'string'],
  [/@[\w-]+/y, 'keyword'],
  [/--?[\w-]+(?=\s*:)|[a-z-]+(?=\s*:[^:])/y, 'prop'],
  [/#[0-9a-fA-F]{3,8}\b|\b\d[\d.]*(?:px|rem|em|ms|s|%|deg|vh|vw|fr)?\b/y, 'number'],
  [/[.#]?[A-Za-z_\\][\w\\:[\]/.-]*/y, 'tag'],
  [/[{}();,:>~+*]/y, 'punct'],
];

// inside an HTML tag (lexHtml switches between this and the text between tags)
const HTML_TAG: Rule[] = [
  [/"[^"]*"|'[^']*'/y, 'string'],
  [/[A-Za-z_:@][\w:.@-]*(?==)/y, 'attr'],
  [/=/y, 'punct'],
  [/[^<>"'=\s/]+/y, 'plain'],
];

const JSON_RULES: Rule[] = [
  [/"(?:[^"\\\n]|\\.)*"(?=\s*:)/y, 'prop'],
  [/"(?:[^"\\\n]|\\.)*"/y, 'string'],
  [/-?\b\d[\d.eE+-]*\b/y, 'number'],
  [/\b(?:true|false|null)\b/y, 'keyword'],
  [/[{}[\],:]/y, 'punct'],
];

const isJs = (lang: string) => ['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(lang);
const isHtml = (lang: string) => lang === 'html' || lang === 'xml';

function rulesFor(lang: string): Rule[] | null {
  switch (lang) {
    case 'sh':
    case 'bash':
    case 'shell':
      return SH;
    case 'css':
      return CSS;
    case 'json':
      return JSON_RULES;
    default:
      return null;
  }
}

/** Collects tokens, merging runs of plain text. */
function tokenList() {
  const out: Token[] = [];
  let plain = '';
  return {
    push(type: TokenType, text: string) {
      if (type === 'plain') {
        plain += text;
        return;
      }
      if (plain) out.push({ type: 'plain', text: plain });
      plain = '';
      out.push({ type, text });
    },
    done(): Token[] {
      if (plain) out.push({ type: 'plain', text: plain });
      return out;
    },
  };
}

/** The first rule that matches at i, as [type, text], or null. */
function matchAt(code: string, i: number, rules: Rule[]): [TokenType, string] | null {
  for (const [re, type] of rules) {
    re.lastIndex = i;
    const m = re.exec(code);
    if (m && m[0].length > 0) return [typeof type === 'function' ? type(m[0]) : type, m[0]];
  }
  return null;
}

function lex(code: string, rules: Rule[]): Token[] {
  const out = tokenList();
  let i = 0;
  while (i < code.length) {
    const hit = matchAt(code, i, rules);
    if (hit) {
      out.push(hit[0], hit[1]);
      i += hit[1].length;
    } else {
      out.push('plain', code[i]);
      i += 1;
    }
  }
  return out.done();
}

// Words after which a "<" starts JSX (return <div>), not a type argument or a comparison.
const BEFORE_JSX = new Set(['return', 'yield', 'default', 'await', 'case', 'else', 'do']);

type JsMode = { kind: 'tag'; closing: boolean } | { kind: 'children' } | { kind: 'expr'; braces: number };

/**
 * JavaScript and TypeScript with JSX: a small state machine over the plain
 * JS rules, so that
 *  - the text between tags is text: in <Text>Hello from Kbach</Text>, "from"
 *    is a word, not the import keyword (it used to light up as one);
 *  - the > of an arrow (=>) or a comparison is punctuation, not a tag's end;
 *  - a TypeScript type argument (useRef<HTMLDivElement>) isn't taken for a tag.
 * The modes, innermost last: inside a tag, an element's children, {an expression}.
 */
function lexJs(code: string): Token[] {
  const out = tokenList();
  const stack: JsMode[] = [];
  const top = () => stack[stack.length - 1];

  // whether the "<" at i starts a JSX tag
  const jsxAt = (i: number) => {
    if (top()?.kind === 'children') return true;
    let j = i - 1;
    while (j >= 0 && /\s/.test(code[j])) j--;
    if (j < 0) return true;
    if (code[j] === ')' || code[j] === ']') return false; // f() < x: a comparison
    if (!/[\w$]/.test(code[j])) return true; // after ( = , ? : { && => and the like
    let k = j;
    while (k >= 0 && /[\w$]/.test(code[k])) k--;
    // after a word: JSX only after return and the like (useRef<T> is a type argument)
    return BEFORE_JSX.has(code.slice(k + 1, j + 1));
  };

  let i = 0;
  while (i < code.length) {
    const mode = top();

    // an element's children: text, up to the next tag or {expression}
    if (mode?.kind === 'children' && code[i] !== '<' && code[i] !== '{') {
      const end = code.slice(i).search(/[<{]/);
      const text = end < 0 ? code.slice(i) : code.slice(i, i + end);
      out.push('plain', text);
      i += text.length;
      continue;
    }

    // a tag's start: <Name, </Name, or a fragment's <> and </>
    if (code[i] === '<' && mode?.kind !== 'tag') {
      const re = /<(\/?)([A-Za-z][\w.:-]*)?(>?)/y;
      re.lastIndex = i;
      const t = re.exec(code);
      if (t && (t[2] || t[3]) && jsxAt(i)) {
        const closing = t[1] === '/';
        if (!t[2]) {
          // a fragment: <> opens children, </> closes them
          out.push('tag', t[0]);
          if (closing) stack.pop();
          else stack.push({ kind: 'children' });
          i += t[0].length;
          continue;
        }
        out.push('tag', '<' + t[1] + t[2]);
        stack.push({ kind: 'tag', closing });
        i += 1 + t[1].length + t[2].length;
        continue;
      }
    }

    // a tag's end: /> closes the element, > opens its children (or ends a closing tag)
    if (mode?.kind === 'tag') {
      if (code.startsWith('/>', i)) {
        out.push('tag', '/>');
        stack.pop();
        i += 2;
        continue;
      }
      if (code[i] === '>') {
        out.push('tag', '>');
        stack.pop();
        if (mode.closing) stack.pop(); // the element's children end with it
        else stack.push({ kind: 'children' });
        i += 1;
        continue;
      }
    }

    // {an expression}, in a tag's attribute or among an element's children
    if (code[i] === '{' && mode && mode.kind !== 'expr') {
      out.push('punct', '{');
      stack.push({ kind: 'expr', braces: 1 });
      i += 1;
      continue;
    }
    if (mode?.kind === 'expr' && (code[i] === '{' || code[i] === '}')) {
      mode.braces += code[i] === '{' ? 1 : -1;
      if (mode.braces === 0) stack.pop();
      out.push('punct', code[i]);
      i += 1;
      continue;
    }

    const hit = matchAt(code, i, JS);
    if (hit) {
      out.push(hit[0], hit[1]);
      i += hit[1].length;
    } else {
      out.push('plain', code[i]);
      i += 1;
    }
  }
  return out.done();
}

/** HTML: strings and attributes only inside a tag, so an apostrophe in text (don't) is just text. */
function lexHtml(code: string): Token[] {
  const out = tokenList();
  let inTag = false;
  let i = 0;
  while (i < code.length) {
    if (!inTag) {
      if (code.startsWith('<!--', i)) {
        const end = code.indexOf('-->', i);
        const text = end < 0 ? code.slice(i) : code.slice(i, end + 3);
        out.push('comment', text);
        i += text.length;
        continue;
      }
      const re = /<\/?[A-Za-z][\w-]*/y;
      re.lastIndex = i;
      const t = re.exec(code);
      if (t) {
        out.push('tag', t[0]);
        inTag = true;
        i += t[0].length;
        continue;
      }
      // text, up to the next tag or comment
      const end = code.slice(i + 1).search(/<[/!A-Za-z]/);
      const text = end < 0 ? code.slice(i) : code.slice(i, i + 1 + end);
      out.push('plain', text);
      i += text.length;
      continue;
    }
    const close = /\/?>/y;
    close.lastIndex = i;
    const c = close.exec(code);
    if (c) {
      out.push('tag', c[0]);
      inTag = false;
      i += c[0].length;
      continue;
    }
    const hit = matchAt(code, i, HTML_TAG);
    if (hit) {
      out.push(hit[0], hit[1]);
      i += hit[1].length;
    } else {
      out.push('plain', code[i]);
      i += 1;
    }
  }
  return out.done();
}

/** Tokens, split into lines (a multi-line comment or string is split too). */
export function highlight(code: string, lang: string): Token[][] {
  if (lang === 'diff') {
    return code.split('\n').map((l) => [{ type: l.startsWith('+') ? 'add' : l.startsWith('-') ? 'del' : 'plain', text: l }]);
  }
  const rules = rulesFor(lang);
  const tokens = isJs(lang) ? lexJs(code) : isHtml(lang) ? lexHtml(code) : rules ? lex(code, rules) : [{ type: 'plain' as const, text: code }];
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split('\n');
    parts.forEach((p, n) => {
      if (n > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ type: tok.type, text: p });
    });
  }
  return lines;
}
