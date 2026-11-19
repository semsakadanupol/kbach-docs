// Turns the engine's rules for one class into what a reader needs to see:
// the CSS the element ends up with.
//
// The engine writes composable utilities through --kb-* custom properties
// (shadow-lg and ring-2 share one box-shadow; blur-sm and grayscale share one
// filter), so its raw output is full of var(--kb-…, fallback) slots. Here each
// var() is replaced by what it is for this class alone: the value the same
// rule sets, else its fallback. Then the empty slots and no-op arithmetic
// that leaves (0 0 #0000 shadows, translate(0,0), calc(x * 0)) are dropped.
// What remains is the effective CSS, the way Tailwind's docs show it.

export type EngineRule = { rule: string; order: number };

export interface PrettyBlock {
  /** '' for the class itself; else what wraps it ("& > * + *", "@media (…)", "@keyframes kb-spin"). */
  label: string;
  lines: string[];
}

/** Index of the paren that closes the one opened at `open`, or -1. */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

/** Splits at `sep` where it's not inside parentheses or quotes. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === quote && s[i - 1] !== '\\') quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === sep && depth === 0) {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out;
}

function resolveVars(value: string, defined: Map<string, string>, depth = 0): string {
  if (depth > 8) return value;
  let out = '';
  let i = 0;
  for (;;) {
    const at = value.indexOf('var(', i);
    if (at < 0) return out + value.slice(i);
    const end = closing(value, at + 3);
    if (end < 0) return out + value.slice(i);
    const inner = value.slice(at + 4, end);
    const comma = splitTop(inner, ',');
    const name = comma[0].trim();
    const fallback = comma.length > 1 ? comma.slice(1).join(',') : undefined;
    let replacement: string;
    if (defined.has(name)) replacement = resolveVars(defined.get(name)!, defined, depth + 1);
    else if (fallback !== undefined) replacement = resolveVars(fallback.trim(), defined, depth + 1);
    else replacement = 'var(' + inner + ')'; // a variable from the page, like a theme color
    out += value.slice(i, at) + replacement;
    i = end + 1;
  }
}

function tidy(value: string): string {
  let v = value.replace(/\s+/g, ' ').trim();
  for (let pass = 0; pass < 4; pass++) {
    const before = v;
    v = v
      .replace(/calc\(\s*1\s*-\s*0\s*\)/g, '1')
      .replace(/calc\(\s*([^()]+?)\s*\*\s*0\s*\)/g, '0')
      .replace(/calc\(\s*([^()]+?)\s*\*\s*1\s*\)/g, '$1')
      .replace(/calc\(\s*([^()+]+?)\s*\+\s*0(?:px)?\s*\)/g, '$1')
      .replace(/calc\(\s*0(?:px)?\s*\+\s*([^()]+?)\s*\)/g, '$1');
    if (v === before) break;
  }
  // empty shadow slots
  v = v.replace(/(?:^|,)\s*0 0 #0000(?=\s*(?:,|$))/g, '').replace(/^\s*,\s*/, '');
  // empty mask layers (a white gradient lets everything through)
  const layers = splitTop(v, ',').map((l) => l.trim());
  const real = layers.filter((l) => l !== 'linear-gradient(#fff, #fff)');
  if (layers.length > 1 && real.length && real.length < layers.length) v = real.join(', ');
  // translate(0,0) in front of a transform that has something else
  v = v.replace(/^translate\(0,\s*0\)\s+(?=\S)/, '');
  // rgba(r,g,b,1) reads better as rgb(r g b)
  v = v.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*1\)/g, 'rgb($1 $2 $3)');
  v = v.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0?\.\d+|0)\)/g, 'rgb($1 $2 $3 / $4)');
  return v.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();
}

function declarations(body: string): [string, string][] {
  return splitTop(body, ';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const colon = d.indexOf(':');
      return [d.slice(0, colon).trim(), d.slice(colon + 1).trim()] as [string, string];
    });
}

function prettyBody(body: string): string[] {
  const decls = declarations(body);
  const defined = new Map(decls.filter(([p]) => p.startsWith('--')).map(([p, v]) => [p, v]));
  const real = decls.filter(([p]) => !p.startsWith('--'));
  // A class that only sets custom properties (ring-sky-6, snap-mandatory)
  // works through other classes: show what it sets.
  const shown = real.length ? real : decls;
  return shown
    .map(([p, v]) => [p, tidy(resolveVars(v, real.length ? defined : new Map()))] as const)
    .filter(([, v]) => v !== '')
    .map(([p, v]) => p + ': ' + v + ';');
}

/** The leading class selector of a rule ("\.p-4" in ".p-4 > * + *"). */
const LEADING_CLASS = /^\.(?:\\.|[\w-])+/;

function parseRule(rule: string): PrettyBlock[] {
  const r = rule.trim();
  const brace = r.indexOf('{');
  const head = r.slice(0, brace).trim();
  const inner = r.slice(brace + 1, r.lastIndexOf('}')).trim();
  if (head.startsWith('@keyframes')) {
    const frames: string[] = [];
    let rest = inner;
    while (rest.includes('{')) {
      const b = rest.indexOf('{');
      const e = rest.indexOf('}', b);
      frames.push(rest.slice(0, b).trim() + ' { ' + declarations(rest.slice(b + 1, e)).map(([p, v]) => p + ': ' + v).join('; ') + ' }');
      rest = rest.slice(e + 1);
    }
    return [{ label: head, lines: frames }];
  }
  if (head.startsWith('@')) {
    // @media / @container / @supports around one rule
    return parseRule(inner).map((b) => ({ label: head + (b.label ? ' ' + b.label : ''), lines: b.lines }));
  }
  const m = LEADING_CLASS.exec(head);
  const rest = m ? head.slice(m[0].length) : head;
  return [{ label: rest ? '&' + rest : '', lines: prettyBody(inner) }];
}

/** The engine's rules for one class, as readable blocks: its own declarations first. */
export function prettyRules(rules: EngineRule[]): PrettyBlock[] {
  const blocks = [...rules].sort((a, b) => a.order - b.order).flatMap((r) => parseRule(r.rule));
  // the class's own declarations first, keyframes last
  return blocks.sort((a, b) => rank(a) - rank(b));
}

function rank(b: PrettyBlock): number {
  if (b.label === '') return 0;
  if (b.label.startsWith('@keyframes')) return 2;
  return 1;
}

/** The items of a comma list (a font stack, transition properties, shadow layers), ignoring commas inside parentheses. */
export function listItems(value: string): string[] {
  return splitTop(value, ',').map((s) => s.trim()).filter(Boolean);
}

/** A color to show as a swatch, when the class's main job is setting one. */
export function swatchColor(blocks: PrettyBlock[]): string | null {
  const own = blocks.find((b) => b.label === '' || b.label.startsWith('&'));
  if (!own || own.lines.length !== 1) return null;
  const m = /^(?:--kb-[\w-]*color|--kb-gradient-(?:from|to)|[\w-]*color|fill|stroke):\s*(#[0-9a-f]{3,8}\b|rgba?\([^)]*\))/i.exec(own.lines[0]);
  return m ? m[1] : null;
}
