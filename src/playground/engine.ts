import init, { generate_css, suggest_class } from '@kbach/core-engine';
import { listItems, prettyRules, swatchColor } from '../reference/prettyCss';
import { propertyRank } from './classOrder';
import { getTheme, initKbach, type ThemeConfig } from '@kbach/react';
// The Vite/PostCSS plugin's own code, so the playground's kbach.css is the
// file a real project gets: the reset, :root (--kb-dark-mode, the color and
// spacing variables), then the rules, in the same layout.
import { formatKbachCSS, KBACH_END, KBACH_START, withColorVariables } from '@kbach/react/tools';

// The playground renders the reader's HTML in a sandboxed <iframe>, so its
// stylesheet has to live in there too. Rather than copying rules out of the
// docs page (whose two sheets, kbach.css and kb()'s runtime one, each have
// their own order), it asks the engine for exactly the classes on the
// canvas and writes them in the engine's own cascade order, the same thing
// a project's kbach.css would contain.

let ready: Promise<void> | null = null;

/** Loads the engine (the same WASM build @kbach/react uses). */
export function loadPlaygroundEngine(): Promise<void> {
  ready ??= Promise.all([init(), initKbach()]).then(() => undefined);
  return ready;
}

// The playground's theme: the defaults with the reader's kbach.config.js
// applied (see setPlaygroundTheme). Until it's set, the site's.
let playgroundTheme: ThemeConfig | null = null;
let themeVersion = 0;

/** Use this theme for everything here: the CSS, the checks, completion, hover. */
export function setPlaygroundTheme(theme: ThemeConfig): void {
  if (theme === playgroundTheme) return;
  playgroundTheme = theme;
  themeVersion++;
}

/** Changes whenever the theme does (completion rebuilds its list then). */
export function playgroundThemeVersion(): number {
  return themeVersion;
}

function activeTheme(): ThemeConfig {
  return playgroundTheme ?? getTheme();
}

// Classes the reader defined in an inline <style> in index.html: their own
// CSS, like a project's stylesheet, so never "unknown".
let projectClasses = new Set<string>();
export function setProjectClasses(classes: Set<string>): void {
  projectClasses = classes;
}

let themeFor: ThemeConfig | null = null;
let themeJson = '';

type Rule = { rule: string; order: number };
/** One class's rules, cached until the theme changes (the canvas asks for the same classes on every keystroke). */
const ruleCache = new Map<string, Rule[]>();

function syncTheme() {
  const theme = activeTheme();
  if (theme !== themeFor) {
    themeFor = theme;
    // what the plugin hands the engine: light/dark colors as rgb(var(--kb-color-<name>))
    themeJson = JSON.stringify(withColorVariables(theme));
    ruleCache.clear();
    swatches.clear();
  }
}

function rulesFor(cls: string): Rule[] {
  syncTheme();
  let rules = ruleCache.get(cls);
  if (!rules) {
    rules = (JSON.parse(generate_css(cls, themeJson)) as { rules: Rule[] }).rules;
    if (ruleCache.size > 20000) ruleCache.clear();
    ruleCache.set(cls, rules);
  }
  return rules;
}

export interface PlaygroundCss {
  /** The whole stylesheet for the canvas: kbach.css, then `base` (page basics). */
  stylesheet: string;
  /** kbach.css as a project has it, between its markers. */
  file: string;
  /** How many rules the classes made. */
  ruleCount: number;
  /** Classes the engine has no CSS for (and the reader's own CSS doesn't define). */
  unknown: string[];
}

/**
 * kbach.css for `classes`, made the way the build plugin makes it: each
 * class through the engine, then formatKbachCSS (the reset pruned to
 * `usedTags`, the :root variables, the rules in cascade order). The canvas
 * gets the same text, then `base`, whose selectors (html body) outrank the
 * reset but not a class. Call after loadPlaygroundEngine().
 */
export function cssForClasses(classes: string[], usedTags: Set<string>, base = ''): PlaygroundCss {
  syncTheme();
  const byClass = new Map<string, Rule[]>();
  const unknown: string[] = [];
  let ruleCount = 0;
  for (const cls of classes) {
    if (byClass.has(cls) || cls === 'group' || cls === 'peer' || /^(group|peer)\/./.test(cls) || cls === 'dark') continue;
    const rules = rulesFor(cls);
    if (!rules.length) {
      if (!projectClasses.has(cls)) unknown.push(cls);
      continue;
    }
    byClass.set(cls, rules);
    ruleCount += rules.length;
  }
  const css = formatKbachCSS(byClass, activeTheme(), usedTags);
  return { stylesheet: [css, base].join('\n'), file: [KBACH_START, css, KBACH_END, ''].join('\n'), ruleCount, unknown };
}

let loaded = false;
loadPlaygroundEngine().then(() => (loaded = true));

/** Whether the engine has loaded (the editor's hover, completion and checks wait for it). */
export function engineLoaded(): boolean {
  return loaded;
}

const MARKER = /^(group|peer)(\/[\w-]+)?$/;

/** The CSS one class compiles to, laid out one declaration per line; '' when it has none. */
export function cssForClass(cls: string): string {
  const rules = rulesFor(cls);
  if (!rules.length) return '';
  // what the element ends up with (shadow-lg is a box-shadow, not the
  // engine's --kb-* plumbing), the way the reference tables show it
  const sel = '.' + CSS.escape(cls);
  const out: string[] = [];
  const decls = (lines: string[], indent: string) => lines.flatMap((l) => breakLongDeclaration(l, indent));
  for (const b of prettyRules(rules)) {
    if (b.label === '') out.push(sel + ' {', ...decls(b.lines, '  '), '}');
    else if (b.label.startsWith('&')) out.push(sel + b.label.slice(1) + ' {', ...decls(b.lines, '  '), '}');
    else if (b.label.startsWith('@keyframes')) out.push(b.label + ' {', ...b.lines.map((l) => '  ' + l), '}');
    else {
      // "@media (…)" or "@media (…) &:hover": the at-rule around the class's rule
      const amp = b.label.indexOf(' &');
      const at = amp < 0 ? b.label : b.label.slice(0, amp);
      const suffix = amp < 0 ? '' : b.label.slice(amp + 2);
      out.push(at + ' {', '  ' + sel + suffix + ' {', ...decls(b.lines, '    '), '  }', '}');
    }
  }
  return out.join('\n');
}

/**
 * A declaration on its own line, or, when it's long and a comma list (a font
 * stack, shadow layers, transition properties), one item per line:
 *   font-family:
 *     ui-sans-serif,
 *     system-ui;
 */
function breakLongDeclaration(line: string, indent: string): string[] {
  const m = /^([-\w]+):\s(.*);$/.exec(line);
  if (!m || line.length + indent.length <= 60) return [indent + line];
  const items = listItems(m[2]);
  if (items.length < 2) return [indent + line];
  return [indent + m[1] + ':', ...items.map((item, i) => indent + '  ' + item + (i < items.length - 1 ? ',' : ';'))];
}

/** Whether a class means something to Kbach: it has CSS, or it's a group/peer marker. */
export function isKnownClass(cls: string): boolean {
  if (MARKER.test(cls) || projectClasses.has(cls)) return true;
  return rulesFor(cls).length > 0;
}

/** Every color name in the theme (palette shades plus the config's own), for completion. */
export function themeColorNames(): string[] {
  return Object.keys(activeTheme().colors);
}

/** The engine's "did you mean" for an unknown class (bg-blue-500 -> bg-blue-6), or null. */
export function suggestFor(cls: string): string | null {
  syncTheme();
  return suggest_class(cls, themeJson) || null;
}

/** The theme's sans font stack, for the canvas body. */
export function sansStack(): string {
  return activeTheme().fontFamily?.sans ?? 'ui-sans-serif, system-ui, sans-serif';
}

/** The color a class sets (for the editor's swatches), or null. Cached per theme with the rules. */
const swatches = new Map<string, string | null>();
export function colorForClass(cls: string): string | null {
  if (!loaded) return null;
  const rules = rulesFor(cls);
  if (!rules.length) return null;
  if (!swatches.has(cls)) swatches.set(cls, swatchColor(prettyRules(rules)));
  return swatches.get(cls)!;
}

/**
 * Where a class sorts, as [variant order, property rank]: the engine's order
 * puts plain classes first and variants after (hover: before dark: before
 * md:), and within that the CSS property decides (see classOrder.ts).
 * Unknown classes (and group/peer markers) get [-1, -1], so they sort
 * first, as the Tailwind CSS class sorter does with classes it doesn't know.
 */
export function classSortKey(cls: string): [number, number] {
  if (!loaded || MARKER.test(cls)) return [-1, -1];
  const rules = rulesFor(cls);
  if (!rules.length) return [-1, -1];
  const first = rules.reduce((a, b) => (b.order < a.order ? b : a));
  // the declarations of the innermost block (inside any @media or selector)
  const body = first.rule.slice(first.rule.lastIndexOf('{') + 1, first.rule.indexOf('}'));
  return [first.order, propertyRank(body)];
}
