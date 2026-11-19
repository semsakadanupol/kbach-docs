import { resolve_style_json } from '@kbach/core-engine';
import { defaultTheme as webDefaults, type ThemeConfig } from '@kbach/react';
import { nativeUses } from '../reference/native';

// The playground's native-styles.js tab: what @kbach/react-native gives each
// element of index.html. It asks resolve_style_json, the same Rust code the
// Android build runs, then sorts what comes back with the docs' list of real
// React Native style props (reference/native.ts): a property React Native
// doesn't have is shown as ignored, and a class with nothing for React
// Native under any width, mode or press is "web only". Call it after the
// engine has loaded.

export interface NativeStylesFile {
  /** the file's text */
  file: string;
  /** how many different class lists it shows */
  entries: number;
}

const MARKER = /^(group|peer)(\/[\w-]+)?$|^dark$/;

/**
 * The theme @kbach/react-native would have. The web theme adds a `surface`
 * color that @kbach/react-native's defaults don't have, so unless the
 * reader's kbach.config.js sets it, it isn't there on a phone.
 */
function nativeTheme(theme: ThemeConfig): ThemeConfig {
  const surface = theme.colors?.surface;
  if (!surface || JSON.stringify(surface) !== JSON.stringify(webDefaults.colors.surface)) return theme;
  const { surface: _web, ...colors } = theme.colors;
  return { ...theme, colors };
}

let cachedFor: ThemeConfig | null = null;
let themeJson = '';
/** class → whether it does anything on React Native at some width, mode or press */
const nativeAtAll = new Map<string, boolean>();

function sync(theme: ThemeConfig) {
  if (theme === cachedFor) return;
  cachedFor = theme;
  themeJson = JSON.stringify(nativeTheme(theme));
  nativeAtAll.clear();
}

function resolve(classes: string, scheme: 'light' | 'dark', pressed: boolean, width: number): { style: Record<string, unknown>; warned: boolean } {
  const { __kbachWarnings, ...style } = JSON.parse(resolve_style_json(classes, themeJson, scheme, pressed, width)) as Record<string, unknown>;
  return { style, warned: Array.isArray(__kbachWarnings) && __kbachWarnings.length > 0 };
}

/** The variants in a class (hover:, md:, data-[state=open]:), split at the colons outside brackets. */
function parts(cls: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) {
      out.push(cls.slice(from, i));
      from = i + 1;
    }
  }
  out.push(cls.slice(from));
  return out;
}

// Variants @kbach/react-native settles from the element's own props before
// the engine sees the class (jsxRuntimeCore.ts): the engine alone never
// applies them, so to ask whether such a class does anything on a phone,
// ask about the class without them.
const FROM_PROPS = /^(hover|focus|disabled|data-.+|aria-.+)$/;

/** A class Kbach knows that gives React Native nothing it uses, at any width, in either mode, pressed or not. */
function webOnly(cls: string): boolean {
  let works = nativeAtAll.get(cls);
  if (works === undefined) {
    const p = parts(cls);
    const asked = [...p.slice(0, -1).filter((v) => !FROM_PROPS.test(v)), p[p.length - 1]].join(':');
    if (asked !== cls) return webOnly(asked);
    const wide = resolve(cls, 'light', true, 100000);
    // an unknown class isn't "web only": the HTML editor already marks it
    works = wide.warned || [wide, resolve(cls, 'dark', true, 100000), resolve(cls, 'light', false, 0), resolve(cls, 'dark', false, 0)]
      .some(({ style }) => Object.entries(style).some(([p, v]) => nativeUses(p, v)));
    if (nativeAtAll.size > 20000) nativeAtAll.clear();
    nativeAtAll.set(cls, works);
  }
  return !works;
}

/** A value as JavaScript source: single-quoted strings, unquoted keys, short objects on one line. */
function literal(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(literal).join(', ') + ']';
  if (v && typeof v === 'object') {
    const parts = Object.entries(v).map(([k, x]) => key(k) + ': ' + literal(x));
    return parts.length ? '{ ' + parts.join(', ') + ' }' : '{}';
  }
  if (typeof v === 'string') return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  return String(v);
}
const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : literal(k));

/** The elements with classes, in the order they appear: the body itself first if it has any. */
function classLists(html: string): { tag: string; classes: string }[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [doc.body, ...doc.body.querySelectorAll('[class]')]
    .map((el) => ({ tag: el.tagName.toLowerCase(), classes: (el.getAttribute('class') ?? '').trim().replace(/\s+/g, ' ') }))
    .filter((e) => e.classes);
}

export function nativeStylesFile(html: string, theme: ThemeConfig, { dark, width }: { dark: boolean; width: number }): NativeStylesFile {
  sync(theme);
  const scheme = dark ? 'dark' : 'light';
  // one entry per class list: the same classes give the same style
  const lists = new Map<string, { tag: string; count: number }>();
  for (const { tag, classes } of classLists(html)) {
    const seen = lists.get(classes);
    if (seen) seen.count++;
    else lists.set(classes, { tag, count: 1 });
  }
  const names = new Map<string, number>();
  const body: string[] = [];
  for (const [classes, { tag, count }] of lists) {
    const n = (names.get(tag) ?? 0) + 1;
    names.set(tag, n);
    const name = n === 1 ? tag : tag + '_' + n;
    const { style } = resolve(classes, scheme, false, width);
    const used = Object.entries(style).filter(([p, v]) => nativeUses(p, v));
    const ignored = Object.entries(style).filter(([p, v]) => !nativeUses(p, v));
    const web = classes.split(' ').filter((c) => !MARKER.test(c) && webOnly(c));
    if (body.length) body.push('');
    body.push('  // <' + tag + ' class="' + classes + '">' + (count > 1 ? ' ×' + count : ''));
    if (web.length) body.push('  // web only: ' + web.join(' '));
    if (ignored.length) body.push('  // React Native ignores: ' + ignored.map(([p, v]) => p + ': ' + literal(v)).join(', '));
    body.push(used.length ? '  ' + name + ': {' : '  ' + name + ': {},');
    if (used.length) {
      for (const [p, v] of used) body.push('    ' + key(p) + ': ' + literal(v) + ',');
      body.push('  },');
    }
  }
  const file = [
    '// What @kbach/react-native gives each element of index.html: the style',
    '// objects it builds as the app renders, from the same classes. There is',
    "// no stylesheet to write; this file only shows them. Read-only.",
    '//',
    '// As on a screen ' + width + ' wide, in ' + scheme + ' mode, nothing pressed. Pick a',
    '// device or switch the preview theme to see md: and dark: change it.',
    '// active:, hover:, focus:, disabled:, data-*: and aria-*: apply on a phone',
    '// as the element is pressed, hovered or given those props; not shown here.',
    '// "web only": no React Native style at all (grid-cols-*, transition).',
    '',
    'const styles = {',
    ...body,
    '};',
    '',
  ].join('\n');
  return { file, entries: lists.size };
}
