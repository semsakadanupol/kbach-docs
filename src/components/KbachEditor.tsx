import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTheme } from '@kbach/react';
import { basicSetup } from 'codemirror';
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  WidgetType,
  scrollPastEnd,
  hoverTooltip,
  keymap,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import { Annotation, ChangeSet, Compartment, EditorSelection, EditorState, Facet, Prec, RangeSetBuilder, StateEffect, StateField, Transaction, type Extension } from '@codemirror/state';
import { html, htmlCompletionSource } from '@codemirror/lang-html';
import { javascript, localCompletionSource, snippets, typescriptSnippets } from '@codemirror/lang-javascript';
import { css as cssLanguage } from '@codemirror/lang-css';
import { HighlightStyle, syntaxHighlighting, indentUnit } from '@codemirror/language';
import { acceptCompletion, autocompletion, completeFromList, type Completion, type CompletionContext, type CompletionResult, type CompletionSource } from '@codemirror/autocomplete';
import { forceLinting, forEachDiagnostic, linter, openLintPanel, type Diagnostic } from '@codemirror/lint';
import { indentWithTab } from '@codemirror/commands';
import { tags as t } from '@lezer/highlight';
import { abbreviationTracker, wrapWithAbbreviation, EmmetKnownSyntax } from '@emmetio/codemirror6-plugin';
import { BASE_UTILITIES, COLOR_PREFIXES } from '@kbach/react/tools';
import { colorForClass, cssForClass, engineLoaded, isKnownClass, playgroundThemeVersion, suggestFor, themeColorNames } from '../playground/engine';
import { formatCode } from '../playground/format';
import { documentParts, editableParts, skeletonKey } from '../playground/document';

// A real code editor (CodeMirror 6) for the playground, with Kbach built in:
// completion, hover and checks on class names, all from the real engine.
// In HTML that's class="…"; in a script it's classList.add('…'),
// className = '…', and class="…" inside template strings.

/**
 * html and js/ts are the reader's files. css (the generated stylesheet) and
 * native (the React Native style objects, as JavaScript) are Kbach's output:
 * read-only, never checked for classes, never formatted.
 */
export type EditorMode = 'html' | 'js' | 'ts' | 'css' | 'native';

/** Kbach's output, not the reader's code. */
const generated = (mode: EditorMode) => mode === 'css' || mode === 'native';

const modeFacet = Facet.define<EditorMode, EditorMode>({ combine: (v) => v[0] ?? 'html' });

// --- where the cursor is: inside a class list? -------------------------------
const HTML_OPEN = [/\bclass(?:Name)?\s*=\s*(["'])([^"']*)$/];
const SCRIPT_OPEN = [
  /classList\.(?:add|remove|toggle|replace|contains)\(\s*(?:(["'`])[^"'`]*\1\s*,\s*)*(["'`])([^"'`]*)$/,
  /\bclassName\s*\+?=\s*(["'`])([^"'`]*)$/,
  /\bclass\s*=\s*\\?(["'])([^"'`]*)$/,
];

/** The class text before `pos`, when `pos` is inside a class list. */
function classContext(state: EditorState, pos: number): { start: number; token: string } | null {
  if (generated(state.facet(modeFacet))) return null;
  const before = state.sliceDoc(Math.max(0, pos - 2000), pos);
  for (const re of state.facet(modeFacet) === 'html' ? HTML_OPEN : SCRIPT_OPEN) {
    const m = re.exec(before);
    if (!m) continue;
    const token = /[^\s"'`]*$/.exec(m[m.length - 1])![0];
    if (token.includes('$')) return null; // a template's ${…}
    return { start: pos - token.length, token };
  }
  return null;
}

/** The whole class token around `pos` (for hover), inside a class list. */
function tokenAt(state: EditorState, pos: number): { from: number; to: number; text: string } | null {
  const line = state.doc.lineAt(pos);
  const text = line.text;
  let a = pos - line.from;
  let b = a;
  while (a > 0 && !/[\s"'`]/.test(text[a - 1])) a--;
  while (b < text.length && !/[\s"'`]/.test(text[b])) b++;
  if (a === b) return null;
  if (!classContext(state, line.from + a)) return null;
  return { from: line.from + a, to: line.from + b, text: text.slice(a, b) };
}

/** Every class name in the document, with where it is (for the checks). */
function classRanges(doc: string, mode: EditorMode): { from: number; cls: string }[] {
  if (generated(mode)) return [];
  const found: { from: number; cls: string }[] = [];
  const addValue = (value: string, at: number) => {
    for (const tm of value.matchAll(/[^\s]+/g)) {
      if (/[${}]/.test(tm[0])) continue; // built from a template: not a whole class
      found.push({ from: at + tm.index!, cls: tm[0] });
    }
  };
  if (mode === 'html') {
    for (const m of doc.matchAll(/\bclass(?:Name)?\s*=\s*(["'])([^"']*)\1/g)) addValue(m[2], m.index! + m[0].indexOf(m[1]) + 1);
    return found;
  }
  for (const m of doc.matchAll(/classList\.(?:add|remove|toggle|replace|contains)\(([^)]*)\)/g)) {
    const argsAt = m.index! + m[0].indexOf('(') + 1;
    for (const s of m[1].matchAll(/(["'`])([^"'`]*)\1/g)) addValue(s[2], argsAt + s.index! + 1);
  }
  for (const m of doc.matchAll(/\bclassName\s*\+?=\s*(["'`])([^"'`]*)\1/g)) addValue(m[2], m.index! + m[0].lastIndexOf(m[1], m[0].length - m[2].length - 1) + 1);
  for (const m of doc.matchAll(/\bclass\s*=\s*\\?(["'])([^"'`]*?)\\?\1/g)) addValue(m[2], m.index! + m[0].indexOf(m[1]) + 1);
  return found;
}

// --- completion --------------------------------------------------------------
const VARIANTS = [
  'hover:', 'focus:', 'focus-visible:', 'active:', 'disabled:', 'dark:',
  'sm:', 'md:', 'lg:', 'xl:', '2xl:', 'max-sm:', 'max-md:', 'max-lg:',
  'group-hover:', 'group-focus:', 'peer-checked:', 'peer-focus:',
  'first:', 'last:', 'odd:', 'even:', 'before:', 'after:', 'placeholder:', 'selection:',
  'motion-safe:', 'motion-reduce:', 'print:', 'rtl:', 'ltr:', 'open:',
  'aria-expanded:', 'data-[state=open]:', 'has-[:checked]:', '*:', '@min-[28rem]:',
];

let options: Completion[] | null = null;
let optionsForTheme = -1;

/** Built once the engine is up (and again when kbach.config.js changes the theme): utilities, every color utility, and variants. */
function completionOptions(): Completion[] {
  if (options && optionsForTheme === playgroundThemeVersion()) return options;
  optionsForTheme = playgroundThemeVersion();
  const seen = new Set<string>();
  const out: Completion[] = [];
  const add = (label: string, type: string, boost = 0) => {
    if (seen.has(label)) return;
    seen.add(label);
    // numbers sort as numbers: bg-rose-2 before bg-rose-10
    out.push({ label, type, boost, sortText: label.replace(/\d+/g, (n) => n.padStart(4, '0')) });
  };
  for (const v of VARIANTS) add(v, 'keyword', 2);
  const colors = themeColorNames();
  for (const prefix of COLOR_PREFIXES) for (const c of colors) add(prefix + '-' + c, 'constant');
  for (const u of BASE_UTILITIES) if (!u.includes(':')) add(u, 'property', 1);
  options = out;
  return out;
}

function kbachCompletions(ctx: CompletionContext): CompletionResult | null {
  if (!engineLoaded()) return null;
  const at = classContext(ctx.state, ctx.pos);
  if (!at) return null;
  // complete the part after the last variant (`hover:bg-…` completes `bg-…`)
  const variantEnd = at.token.lastIndexOf(':') + 1;
  const from = at.start + variantEnd;
  const prefix = at.token.slice(0, variantEnd);
  if (!ctx.explicit && at.token.length === 0) return null;
  return {
    from,
    validFor: /^[\w\-/.[\]#%]*$/,
    options: completionOptions().map((o) => ({
      ...o,
      info: () => {
        const css = cssForClass(prefix + o.label);
        if (!css) return null;
        const pre = document.createElement('pre');
        pre.className = 'cm-kb-css';
        pre.textContent = css;
        return pre;
      },
    })),
  };
}

/** A source that only answers in the given modes. */
const inModes = (modes: EditorMode[], source: CompletionSource): CompletionSource => (ctx) =>
  modes.includes(ctx.state.facet(modeFacet)) ? source(ctx) : null;

const jsSnippets = completeFromList(snippets);
const tsSnippets = completeFromList(typescriptSnippets);

// the page's own globals, for document., console., window. and friends
function globalsSource(ctx: CompletionContext): CompletionResult | null {
  const m = ctx.matchBefore(/(?:\b(document|window|console|Math|JSON|navigator|localStorage)\.)?[\w$]*$/);
  if (!m || (m.from === m.to && !ctx.explicit)) return null;
  const inString = /["'`][^"'`]*$/.test(ctx.state.sliceDoc(ctx.state.doc.lineAt(ctx.pos).from, ctx.pos));
  if (inString) return null;
  const dot = m.text.indexOf('.');
  if (dot < 0) return null;
  const owner = (window as unknown as Record<string, object>)[m.text.slice(0, dot)];
  if (!owner) return null;
  const names = new Set<string>();
  for (let o: object | null = owner; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
    for (const k of Object.getOwnPropertyNames(o)) if (!k.startsWith('_') && !/^on/.test(k)) names.add(k);
  }
  return {
    from: m.from + dot + 1,
    validFor: /^[\w$]*$/,
    options: [...names].map((label) => {
      let type = 'property';
      try {
        type = typeof (owner as Record<string, unknown>)[label] === 'function' ? 'method' : 'property';
      } catch {
        // a getter that throws
      }
      return { label, type };
    }),
  };
}

// --- hover: the CSS a class compiles to --------------------------------------
const classHover = hoverTooltip((view, pos) => {
  if (!engineLoaded()) return null;
  const tok = tokenAt(view.state, pos);
  if (!tok) return null;
  const css = cssForClass(tok.text);
  // an unknown class already has the check's tooltip, with its fix
  if (!css) return null;
  return {
    pos: tok.from,
    end: tok.to,
    above: true,
    create() {
      const dom = document.createElement('div');
      dom.className = 'cm-kb-hover';
      const pre = document.createElement('pre');
      pre.className = 'cm-kb-css';
      pre.textContent = css;
      dom.appendChild(pre);
      return { dom };
    },
  };
});

// --- color swatches in front of color classes, like an IDE's color decorators --
class SwatchWidget extends WidgetType {
  constructor(readonly color: string) {
    super();
  }
  eq(other: SwatchWidget) {
    return other.color === this.color;
  }
  toDOM() {
    const s = document.createElement('span');
    s.className = 'cm-kb-swatch';
    s.style.background = this.color;
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
}

function swatchDecorations(view: EditorView): DecorationSet {
  if (!engineLoaded()) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  const visible = view.visibleRanges;
  const found = classRanges(view.state.doc.toString(), view.state.facet(modeFacet))
    .filter(({ from }) => visible.some((r) => from >= r.from && from <= r.to))
    .sort((a, b) => a.from - b.from);
  for (const { from, cls } of found) {
    const color = colorForClass(cls);
    if (color) builder.add(from, from, Decoration.widget({ widget: new SwatchWidget(color), side: -1 }));
  }
  return builder.finish();
}

const swatchPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    engine = engineLoaded();
    constructor(view: EditorView) {
      this.decorations = swatchDecorations(view);
    }
    update(u: ViewUpdate) {
      // also once the engine has loaded after the editor
      if (u.docChanged || u.viewportChanged || (!this.engine && engineLoaded())) {
        this.engine = engineLoaded();
        this.decorations = swatchDecorations(u.view);
      }
    }
  },
  { decorations: (p) => p.decorations },
);

// --- the inspector's pick: the selected element's tag, marked in the code -------
const setPicked = StateEffect.define<{ from: number; to: number } | null>();
const pickedMark = Decoration.mark({ class: 'cm-kb-picked' });
const pickedField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setPicked)) deco = e.value && e.value.to > e.value.from ? Decoration.set([pickedMark.range(e.value.from, e.value.to)]) : Decoration.none;
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// --- errors from the last run, on their lines (as an IDE's inline errors do) ---
class ErrorMessage extends WidgetType {
  constructor(readonly text: string) {
    super();
  }
  eq(other: ErrorMessage) {
    return other.text === this.text;
  }
  toDOM() {
    const s = document.createElement('span');
    s.className = 'cm-kb-errmsg';
    s.textContent = this.text;
    return s;
  }
}
export interface RunError {
  line: number;
  message: string;
}
const setRunErrors = StateEffect.define<RunError[]>();
// --- index.html's skeleton: <!doctype html>, <html>, <head>, <body> stay; what's inside them is the reader's

/** A change the playground made (a loaded example, the inspector's edit), not the reader's typing. */
const fromOutside = Annotation.define<boolean>();

/**
 * Keeps the skeleton: an edit that leaves it whole goes through as it is
 * (typing inside <head> or <body>, or in the <html>, <head> and <body> tags'
 * attributes; Format, Undo, pasting a whole document). One that would break
 * it keeps only its parts in those places (select all + Delete empties the
 * head and the body, the tags stay), and only if what's left still has the
 * skeleton. One that only touches the fixed text does nothing.
 */
const skeletonFilter = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged || tr.annotation(fromOutside)) return tr;
  const before = tr.startState.doc.toString();
  const parts = documentParts(before);
  if (!parts) return tr; // not a whole document: nothing to keep
  const key = skeletonKey(before);
  const after = tr.newDoc.toString();
  if (skeletonKey(after) === key) return tr;
  const userEvent = tr.annotation(Transaction.userEvent);
  /** these changes instead, if the document they make still has the skeleton; else nothing */
  const instead = (changes: { from: number; to: number; insert: string }[], cursor: (set: ChangeSet) => number) => {
    const set = tr.startState.changes(changes);
    if (set.empty || skeletonKey(set.apply(tr.startState.doc).toString()) !== key) return [];
    return { changes: set, selection: EditorSelection.cursor(cursor(set)), scrollIntoView: true, userEvent };
  };
  // Everything replaced (select all + typing or pasting, select all + Delete): the new text
  // is the body's content, whole. (Not cut to the parts inside <head> and <body>: the
  // browser reports a replacement as the smallest change, so a "<" it shares with
  // "<!doctype" would be lost.)
  let all = false;
  tr.changes.iterChangedRanges((fromA, toA) => {
    if (fromA <= parts.head.from && toA >= parts.body.to) all = true;
  });
  if (all) {
    const text = after.trim() ? '\n' + after.trim().replace(/^(?=.)/gm, '    ') + '\n  ' : '';
    // the tags' attributes the selection took in go too (they're the reader's, like the content)
    const covered = (r: { from: number; to: number }) => {
      let inside = false;
      tr.changes.iterChangedRanges((fromA, toA) => {
        if (fromA <= r.from && toA >= r.to) inside = true;
      });
      return inside;
    };
    const changes = [
      ...(covered(parts.htmlAttrs) ? [{ from: parts.htmlAttrs.from, to: parts.htmlAttrs.to, insert: '' }] : []),
      ...(covered(parts.headAttrs) ? [{ from: parts.headAttrs.from, to: parts.headAttrs.to, insert: '' }] : []),
      { from: parts.head.from, to: parts.head.to, insert: '' },
      ...(covered(parts.bodyAttrs) ? [{ from: parts.bodyAttrs.from, to: parts.bodyAttrs.to, insert: '' }] : []),
      { from: parts.body.from, to: parts.body.to, insert: text },
    ];
    // the cursor at the end of the new text (before the line </body> is on)
    return instead(changes, (set) => {
      const now = documentParts(set.apply(tr.startState.doc).toString());
      return now ? now.body.to - (text ? 3 : 0) : 0;
    });
  }
  const regions = editableParts(parts);
  const attrs = [parts.htmlAttrs, parts.headAttrs, parts.bodyAttrs];
  const changes: { from: number; to: number; insert: string }[] = [];
  let typedAt: number | null = null;
  let typedLength = 0;
  tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
    let text = inserted.toString();
    // the parts of the change in the editable places (empty ones too: where typed text can go)
    const pieces = regions
      .map((r) => ({ from: Math.max(r.from, fromA), to: Math.min(r.to, toA), region: r }))
      .filter((p) => p.from <= p.to);
    pieces.forEach((p, i) => {
      const last = i === pieces.length - 1;
      // typed straight after "<html": a space first, so it's an attribute, not a longer tag name
      if (last && text && attrs.includes(p.region) && p.from === p.region.from && !/^\s/.test(text)) text = ' ' + text;
      changes.push({ from: p.from, to: p.to, insert: last ? text : '' });
      if (last && text) {
        typedAt = p.from;
        typedLength = text.length;
      }
    });
  });
  const real = changes.filter((c) => c.to > c.from || c.insert);
  if (!real.length) return [];
  return instead(real, (set) => (typedAt !== null ? set.mapPos(typedAt, -1) + typedLength : set.mapPos(real[real.length - 1].from)));
});

/** The skeleton's fixed text, dimmed: it's on every page. The code goes inside it, attributes in its tags. */
const lockedMark = Decoration.mark({ class: 'cm-kb-locked', attributes: { title: 'Every page has this. Write inside <head> and <body>, or add attributes to their tags.' } });
function lockedTags(state: EditorState): DecorationSet {
  const doc = state.doc.toString();
  const parts = documentParts(doc);
  if (!parts) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  for (const r of parts.locked) {
    for (const m of doc.slice(r.from, r.to).matchAll(/\S+/g)) builder.add(r.from + m.index!, r.from + m.index! + m[0].length, lockedMark);
  }
  return builder.finish();
}
const lockedField = StateField.define<DecorationSet>({
  create: lockedTags,
  update: (deco, tr) => (tr.docChanged ? lockedTags(tr.state) : deco),
  provide: (f) => EditorView.decorations.from(f),
});

const skeletonLock: Extension = [skeletonFilter, lockedField];

const errorLine = Decoration.line({ class: 'cm-kb-errline' });
const runErrorsField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    // the code moved on since that run: the marks move with it
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setRunErrors)) continue;
      const builder = new RangeSetBuilder<Decoration>();
      const seen = new Set<number>();
      for (const err of [...e.value].sort((a, b) => a.line - b.line)) {
        if (err.line < 1 || err.line > tr.state.doc.lines || seen.has(err.line)) continue;
        seen.add(err.line);
        const line = tr.state.doc.line(err.line);
        builder.add(line.from, line.from, errorLine);
        builder.add(line.to, line.to, Decoration.widget({ widget: new ErrorMessage(err.message), side: 1 }));
      }
      deco = builder.finish();
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// --- checks: unknown classes, with the engine's fix ----------------------------
const kbachLint = linter(
  (view) => {
    if (!engineLoaded()) return [];
    const found: Diagnostic[] = [];
    for (const { from, cls } of classRanges(view.state.doc.toString(), view.state.facet(modeFacet))) {
      if (isKnownClass(cls)) continue;
      const fix = suggestFor(cls);
      found.push({
        from,
        to: from + cls.length,
        severity: 'warning',
        message: fix ? 'Unknown class "' + cls + '". Did you mean "' + fix + '"?' : 'Unknown class "' + cls + '"',
        actions: fix ? [{ name: 'Use ' + fix, apply: (v, f, tt) => v.dispatch({ changes: { from: f, to: tt, insert: fix } }) }] : [],
      });
    }
    return found;
  },
  { delay: 250 },
);

// --- wrapping: at spaces, with the continuation indented under the code -------
// The browser may break a line after any "-", which splits class names
// (rounded-|2xl). Each run of non-space characters is marked nowrap, so a
// wrap only happens at a space. Runs are capped at 60 characters, so a very
// long token (a URL) can still break instead of running off the side.
const nowrapRuns = new MatchDecorator({ regexp: /\S{1,60}/g, decoration: Decoration.mark({ class: 'cm-kb-run' }) });
const nowrapPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = nowrapRuns.createDeco(view);
    }
    update(u: ViewUpdate) {
      this.decorations = nowrapRuns.updateDeco(u, this.decorations);
    }
  },
  { decorations: (p) => p.decorations },
);

// A wrapped line continues 2 characters in from its own indentation, as in VS Code.
const hangCache = new Map<number, Decoration>();
function hangFor(indent: number): Decoration {
  let d = hangCache.get(indent);
  if (!d) {
    const ch = indent + 2;
    d = Decoration.line({ attributes: { style: 'padding-left: calc(' + ch + 'ch + 6px); text-indent: -' + ch + 'ch' } });
    hangCache.set(indent, d);
  }
  return d;
}
function hangingIndents(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const tab = view.state.tabSize;
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
      let cols = 0;
      for (const c of line.text) {
        if (c === ' ') cols++;
        else if (c === '\t') cols += tab - (cols % tab);
        else break;
      }
      builder.add(line.from, line.from, hangFor(cols));
      pos = line.to + 1;
    }
  }
  return builder.finish();
}
const hangPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = hangingIndents(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = hangingIndents(u.view);
    }
  },
  { decorations: (p) => p.decorations },
);

const wrapExtension: Extension = [EditorView.lineWrapping, nowrapPlugin, hangPlugin];

// --- the right edge: text stops short of it, fading out, not under the scrollbar
const edgeFade = ViewPlugin.fromClass(
  class {
    dom: HTMLDivElement;
    constructor(readonly view: EditorView) {
      this.dom = document.createElement('div');
      this.dom.className = 'cm-kb-edge';
      this.dom.setAttribute('aria-hidden', 'true');
      view.dom.appendChild(this.dom);
      this.place();
    }
    update(u: ViewUpdate) {
      if (u.geometryChanged || u.viewportChanged) this.place();
    }
    place() {
      this.view.requestMeasure({
        read: (view) => {
          const s = view.scrollDOM;
          // left of our own scrollbar, above the horizontal one
          const v = s.scrollHeight > s.clientHeight + 1 ? VBAR : 0;
          const h = s.scrollWidth > s.clientWidth + 1 ? HBAR : 0;
          return { top: s.offsetTop, height: s.clientHeight - h, right: v };
        },
        write: (m) => {
          this.dom.style.top = m.top + 'px';
          this.dom.style.height = m.height + 'px';
          this.dom.style.right = m.right + 'px';
        },
      });
    }
    destroy() {
      this.dom.remove();
    }
  },
);

// --- scrollbars, drawn by the editor as VS Code does ------------------------------
// The browser's own can be overlay scrollbars (Windows 11, macOS) that only
// show while scrolling. These are always there when there's more to see, and
// the vertical one is an overview ruler too: marks for warnings, errors from
// the last run, the inspector's pick and the cursor, at their place in the file.
const VBAR = 14;
const HBAR = 12;

interface Mark {
  /** offset in the scrolled content, px */
  y: number;
  color: string;
  /** a thin line (the cursor) rather than a block */
  line?: boolean;
}

const scrollbars = ViewPlugin.fromClass(
  class {
    vbar: HTMLDivElement;
    vthumb: HTMLDivElement;
    marks: HTMLDivElement;
    hbar: HTMLDivElement;
    hthumb: HTMLDivElement;
    ro: ResizeObserver;
    drag: { axis: 'y' | 'x'; start: number; scroll: number; ratio: number } | null = null;

    constructor(readonly view: EditorView) {
      const el = (cls: string, parent: HTMLElement) => {
        const d = document.createElement('div');
        d.className = cls;
        parent.appendChild(d);
        return d;
      };
      this.vbar = el('cm-kb-vbar', view.dom);
      this.marks = el('cm-kb-marks', this.vbar);
      this.vthumb = el('cm-kb-thumb', this.vbar);
      this.hbar = el('cm-kb-hbar', view.dom);
      this.hthumb = el('cm-kb-thumb', this.hbar);
      for (const bar of [this.vbar, this.hbar]) bar.setAttribute('aria-hidden', 'true');
      view.scrollDOM.addEventListener('scroll', this.onScroll, { passive: true });
      this.ro = new ResizeObserver(() => this.draw());
      this.ro.observe(view.scrollDOM);
      for (const [bar, thumb, axis] of [
        [this.vbar, this.vthumb, 'y'],
        [this.hbar, this.hthumb, 'x'],
      ] as const) {
        thumb.addEventListener('pointerdown', (e) => this.startDrag(e, axis));
        bar.addEventListener('pointerdown', (e) => {
          if (e.target === bar || e.target === this.marks) this.page(e, axis);
        });
      }
      window.addEventListener('pointermove', this.onMove);
      window.addEventListener('pointerup', this.onUp);
      this.draw();
    }

    onScroll = () => this.draw();

    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged || u.geometryChanged || u.selectionSet || u.transactions.some((t) => t.effects.length)) this.draw();
    }

    draw() {
      this.view.requestMeasure({
        key: this,
        read: (view) => {
          const s = view.scrollDOM;
          const gutters = view.dom.querySelector('.cm-gutters') as HTMLElement | null;
          const marks: Mark[] = [];
          const at = (pos: number) => view.lineBlockAt(Math.min(pos, view.state.doc.length)).top + view.documentPadding.top;
          forEachDiagnostic(view.state, (d, from) => marks.push({ y: at(from), color: d.severity === 'error' ? 'var(--ed-error)' : 'var(--ed-warn)' }));
          view.state.field(runErrorsField, false)?.between(0, view.state.doc.length, (from, _to, deco) => {
            if (deco.spec.class === 'cm-kb-errline') marks.push({ y: at(from), color: 'var(--ed-error)' });
          });
          view.state.field(pickedField, false)?.between(0, view.state.doc.length, (from) => {
            marks.push({ y: at(from), color: '#c7a25d' });
          });
          marks.push({ y: at(view.state.selection.main.head), color: '#c7a25d', line: true });
          return {
            top: s.offsetTop,
            left: s.offsetLeft + (gutters?.offsetWidth ?? 0),
            sh: s.scrollHeight,
            ch: s.clientHeight,
            st: s.scrollTop,
            sw: s.scrollWidth,
            cw: s.clientWidth,
            sl: s.scrollLeft,
            gutter: gutters?.offsetWidth ?? 0,
            marks,
          };
        },
        write: (m) => {
          const showV = m.sh > m.ch + 1;
          const showH = m.sw > m.cw + 1;
          // vertical: the whole height of the scroller, less the horizontal bar
          const vh = m.ch - (showH ? HBAR : 0);
          this.vbar.style.display = showV ? 'block' : 'none';
          this.vbar.style.top = m.top + 'px';
          this.vbar.style.height = vh + 'px';
          if (showV) {
            const thumb = Math.max(24, (m.ch / m.sh) * vh);
            this.vthumb.style.height = thumb + 'px';
            this.vthumb.style.transform = 'translateY(' + (m.st / (m.sh - m.ch)) * (vh - thumb) + 'px)';
            this.marks.replaceChildren(
              ...m.marks.slice(0, 400).map((mk) => {
                const d = document.createElement('div');
                d.className = mk.line ? 'cm-kb-mark cm-kb-mark-line' : 'cm-kb-mark';
                d.style.top = Math.min(vh - 3, (mk.y / m.sh) * vh) + 'px';
                d.style.background = mk.color;
                return d;
              }),
            );
          }
          // horizontal: under the text, not under the line numbers
          const hw = m.cw - m.gutter - (showV ? VBAR : 0);
          this.hbar.style.display = showH ? 'block' : 'none';
          this.hbar.style.left = m.left + 'px';
          this.hbar.style.width = Math.max(0, hw) + 'px';
          this.hbar.style.top = m.top + m.ch - HBAR + 'px';
          if (showH) {
            const thumb = Math.max(24, (m.cw / m.sw) * hw);
            this.hthumb.style.width = thumb + 'px';
            this.hthumb.style.transform = 'translateX(' + (m.sl / (m.sw - m.cw)) * (hw - thumb) + 'px)';
          }
        },
      });
    }

    /** Drag the thumb: the content follows, in proportion. */
    startDrag(e: PointerEvent, axis: 'y' | 'x') {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const s = this.view.scrollDOM;
      const track = axis === 'y' ? this.vbar.clientHeight - this.vthumb.offsetHeight : this.hbar.clientWidth - this.hthumb.offsetWidth;
      const range = axis === 'y' ? s.scrollHeight - s.clientHeight : s.scrollWidth - s.clientWidth;
      this.drag = { axis, start: axis === 'y' ? e.clientY : e.clientX, scroll: axis === 'y' ? s.scrollTop : s.scrollLeft, ratio: track > 0 ? range / track : 0 };
      (axis === 'y' ? this.vthumb : this.hthumb).classList.add('cm-kb-thumb-active');
    }
    onMove = (e: PointerEvent) => {
      if (!this.drag) return;
      const s = this.view.scrollDOM;
      const d = this.drag;
      const moved = ((d.axis === 'y' ? e.clientY : e.clientX) - d.start) * d.ratio;
      if (d.axis === 'y') s.scrollTop = d.scroll + moved;
      else s.scrollLeft = d.scroll + moved;
    };
    onUp = () => {
      if (!this.drag) return;
      this.vthumb.classList.remove('cm-kb-thumb-active');
      this.hthumb.classList.remove('cm-kb-thumb-active');
      this.drag = null;
    };

    /** A click on the track, above or below the thumb: a page that way, as VS Code does. */
    page(e: PointerEvent, axis: 'y' | 'x') {
      if (e.button !== 0) return;
      e.preventDefault();
      const s = this.view.scrollDOM;
      const thumb = (axis === 'y' ? this.vthumb : this.hthumb).getBoundingClientRect();
      if (axis === 'y') s.scrollBy({ top: e.clientY < thumb.top ? -s.clientHeight * 0.9 : s.clientHeight * 0.9 });
      else s.scrollBy({ left: e.clientX < thumb.left ? -s.clientWidth * 0.9 : s.clientWidth * 0.9 });
    }

    destroy() {
      this.view.scrollDOM.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      this.ro.disconnect();
      this.vbar.remove();
      this.hbar.remove();
    }
  },
);

// --- look: VS Code's, light (Light Modern) or dark (Dark+) as the site is: the colors are
// CSS variables in editor.css, so one theme serves both
const kbachTheme = EditorView.theme(
  {
    '&': { height: '100%', backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)', fontSize: '13px' },
    '.cm-scroller': { fontFamily: 'Menlo, Monaco, Consolas, "Geist Mono", "Courier New", monospace', lineHeight: '1.6', scrollbarWidth: 'none' },
    // room after the longest line, so its end never sits against the edge
    '.cm-content': { padding: '8px 40px 8px 0', caretColor: 'var(--ed-cursor)' },
    '.cm-kb-edge': {
      position: 'absolute',
      width: '28px',
      zIndex: '2',
      pointerEvents: 'none',
      background: 'linear-gradient(to right, transparent, var(--ed-bg) 70%)',
    },
    '.cm-lineWrapping .cm-kb-run': { whiteSpace: 'nowrap' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ed-cursor)', borderLeftWidth: '2px' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'var(--ed-selection)',
    },
    // VS Code outlines the current line rather than filling it
    '.cm-activeLine': { backgroundColor: 'transparent', boxShadow: 'inset 0 1px 0 var(--ed-line), inset 0 -1px 0 var(--ed-line)' },
    '.cm-gutters': { backgroundColor: 'var(--ed-bg)', color: 'var(--ed-gutter)', border: 'none' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ed-gutter-on)' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 14px' },
    '.cm-foldGutter .cm-gutterElement': { color: 'var(--ed-fold)', padding: '0 4px' },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: 'rgba(0, 100, 0, 0.1)', outline: '1px solid var(--ed-bracket)' },
    '.cm-selectionMatch': { backgroundColor: 'var(--ed-selection-match)' },
    '.cm-searchMatch': { backgroundColor: 'rgba(234, 92, 0, 0.33)', outline: '1px solid rgba(234, 92, 0, 0.6)' },
    '.cm-foldPlaceholder': { backgroundColor: 'var(--ed-fold-mark)', border: 'none', color: 'var(--ed-muted)' },
    // never wider than the screen: long CSS wraps, a long block scrolls
    '.cm-tooltip': {
      backgroundColor: 'var(--ed-widget)',
      border: '1px solid var(--ed-widget-border)',
      borderRadius: '4px',
      color: 'var(--ed-widget-fg)',
      boxShadow: '0 12px 32px var(--ed-shadow)',
      overflow: 'hidden',
      maxWidth: 'min(34rem, calc(100vw - 16px))',
    },
    // the browser's scrollbars give way to the editor's own (below)
    '.cm-scroller::-webkit-scrollbar': { display: 'none' },
    '.cm-kb-vbar, .cm-kb-hbar': { position: 'absolute', zIndex: '3', display: 'none' },
    '.cm-kb-vbar': { right: '0', width: VBAR + 'px', borderLeft: '1px solid var(--ed-fold-mark)' },
    '.cm-kb-hbar': { height: HBAR + 'px' },
    '.cm-kb-vbar:hover, .cm-kb-hbar:hover': { backgroundColor: 'var(--ed-fold-mark)' },
    '.cm-kb-thumb': { position: 'absolute', borderRadius: '999px', backgroundColor: 'var(--ed-thumb)', transition: 'background-color 0.15s' },
    '.cm-kb-vbar .cm-kb-thumb': { left: '3px', right: '3px', top: '0' },
    '.cm-kb-hbar .cm-kb-thumb': { top: '3px', bottom: '3px', left: '0' },
    '.cm-kb-thumb:hover': { backgroundColor: 'var(--ed-thumb-hover)' },
    '.cm-kb-thumb.cm-kb-thumb-active': { backgroundColor: 'rgba(199,162,93,0.6)' },
    '.cm-kb-marks': { position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '1' },
    '.cm-kb-mark': { position: 'absolute', left: '2px', right: '2px', height: '3px', borderRadius: '1px', opacity: '0.9' },
    '.cm-kb-mark-line': { height: '2px', left: '0', right: '0', opacity: '0.75' },
    '.cm-tooltip-autocomplete > ul': { fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: '12.5px', maxHeight: '16rem' },
    '.cm-tooltip-autocomplete > ul > li': { padding: '3px 10px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--ed-pick)', color: 'var(--ed-pick-fg)' },
    '.cm-completionMatchedText': { textDecoration: 'none', color: 'var(--ed-match)', fontWeight: '600' },
    '.cm-completionDetail': { color: 'var(--ed-muted)', fontStyle: 'normal', marginLeft: '0.75em' },
    '.cm-completionInfo': { padding: '0', maxWidth: 'min(26rem, calc(100vw - 16px))' },
    '.cm-kb-css': {
      margin: '0',
      padding: '8px 12px',
      fontFamily: '"Geist Mono", ui-monospace, monospace',
      fontSize: '12px',
      lineHeight: '1.6',
      color: 'var(--ed-css)',
      // a value too long for the tooltip (a long URL) wraps instead of running out of it
      whiteSpace: 'pre-wrap',
      overflowWrap: 'anywhere',
      maxHeight: 'min(22rem, 60vh)',
      overflowY: 'auto',
    },
    '.cm-kb-hover': { fontSize: '12px', color: 'var(--ed-muted)' },
    '.cm-tooltip-lint': { padding: '0' },
    '.cm-diagnostic': { padding: '6px 10px', fontFamily: '"Geist", ui-sans-serif, sans-serif', fontSize: '12.5px' },
    '.cm-diagnostic-warning': { borderLeft: '3px solid var(--ed-warn)' },
    '.cm-diagnosticAction': { backgroundColor: '#c7a25d', color: '#1a1b1b', borderRadius: '4px', padding: '1px 8px', fontWeight: '600' },
    '.cm-lintRange-warning': { backgroundImage: 'none', textDecoration: 'underline wavy var(--ed-warn)', textUnderlineOffset: '3px' },
    '.cm-panels': { backgroundColor: 'var(--ed-widget)', color: 'var(--ed-widget-fg)', borderTop: '1px solid var(--ed-widget-border)' },
    '.cm-panel.cm-search input, .cm-panel.cm-search button': { fontSize: '12px' },
    '.cm-kb-swatch': {
      display: 'inline-block',
      width: '0.7em',
      height: '0.7em',
      marginRight: '0.3em',
      borderRadius: '2px',
      verticalAlign: 'middle',
      boxShadow: '0 0 0 1px var(--ed-swatch-ring)',
      transform: 'translateY(-1px)',
    },
    '.cm-kb-errline': { backgroundColor: 'var(--ed-error-line)' },
    '.cm-kb-errmsg': {
      marginLeft: '2.5ch',
      color: 'var(--ed-error)',
      fontSize: '12px',
      fontStyle: 'italic',
      opacity: '0.9',
      pointerEvents: 'none',
      whiteSpace: 'pre',
    },
    '.cm-kb-locked': { opacity: '0.6' },
    '.cm-kb-picked': { backgroundColor: 'rgba(199, 162, 93, 0.16)', outline: '1px solid rgba(199, 162, 93, 0.55)', borderRadius: '2px' },
    // Emmet: the abbreviation being typed, and its preview
    '.emmet-tracker': { textDecoration: 'underline 1px dotted var(--ed-emmet)', textUnderlineOffset: '3px' },
    '.cm-tooltip:has(.emmet-preview)': { padding: '6px 10px' },
    '.emmet-preview': { fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: '12px', color: 'var(--ed-widget-fg)' },
    '.emmet-preview_error': { color: 'var(--ed-error)' },
    '.cm-panel.cm-lint-panel': { backgroundColor: 'var(--ed-bg)' },
    '.cm-panel.cm-lint-panel ul [aria-selected]': { backgroundColor: 'var(--ed-pick)', color: 'var(--ed-pick-fg)' },
    '.cm-textfield': { backgroundColor: 'var(--ed-field)', border: '1px solid var(--ed-widget-border)', borderRadius: '4px', color: 'var(--ed-widget-fg)' },
    '.cm-button': { backgroundImage: 'none', backgroundColor: 'var(--ed-field)', border: '1px solid var(--ed-widget-border)', borderRadius: '4px', color: 'var(--ed-widget-fg)' },
  },
);

// VS Code's token colors: Light+ or Dark+ (editor.css)
const kbachHighlight = HighlightStyle.define([
  { tag: [t.tagName, t.standard(t.tagName)], color: 'var(--ed-tag)' },
  { tag: [t.angleBracket], color: 'var(--ed-bracket-angle)' },
  { tag: [t.punctuation, t.separator], color: 'var(--ed-punct)' },
  { tag: t.attributeName, color: 'var(--ed-attr)' },
  { tag: t.attributeValue, color: 'var(--ed-attr-value)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--ed-string)' },
  { tag: t.comment, color: 'var(--ed-comment)' },
  { tag: [t.controlKeyword, t.moduleKeyword], color: 'var(--ed-control)' },
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.definitionKeyword, t.bool, t.null], color: 'var(--ed-keyword)' },
  { tag: [t.number, t.unit], color: 'var(--ed-number)' },
  { tag: t.color, color: 'var(--ed-string)' },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: 'var(--ed-property)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--ed-function)' },
  { tag: [t.className, t.typeName, t.namespace], color: 'var(--ed-type)' },
  { tag: [t.variableName, t.definition(t.variableName)], color: 'var(--ed-variable)' },
  { tag: t.regexp, color: 'var(--ed-regexp)' },
  { tag: t.content, color: 'var(--ed-fg)' },
  { tag: t.invalid, color: 'var(--ed-invalid)' },
]);

function languageFor(mode: EditorMode): Extension {
  // the generated stylesheet: selectable, searchable, copyable, but Kbach writes it
  if (mode === 'css') return [cssLanguage(), modeFacet.of(mode), EditorState.readOnly.of(true)];
  if (mode === 'native') return [javascript(), modeFacet.of(mode), EditorState.readOnly.of(true)];
  if (mode !== 'html') return [javascript({ typescript: mode === 'ts' }), modeFacet.of(mode)];
  return [
    html({ autoCloseTags: true }),
    modeFacet.of(mode),
    // Emmet: type ul>li*3 and press Tab. Above the indent-on-Tab binding, so
    // Tab expands when there's an abbreviation and indents when there isn't.
    Prec.high(abbreviationTracker({ syntax: EmmetKnownSyntax.html, mark: true, previewEnabled: true })),
    // select some code, Ctrl+Shift+A, type an abbreviation: the selection is wrapped in it
    wrapWithAbbreviation('Mod-Shift-a'),
  ];
}

export interface EditorStatus {
  line: number;
  col: number;
  /** characters selected, over every selection */
  selected: number;
  cursors: number;
  errors: number;
  warnings: number;
  /** the cursor's offset in the document */
  pos: number;
  /** whether the editor has the keyboard focus */
  focused: boolean;
}

/** What the playground can do with an editor from outside. */
export interface EditorHandle {
  /** Selects a range, scrolls it into the middle of the view and focuses the editor. */
  select(from: number, to: number): void;
  /** Marks a range (the inspector's pick) without moving the cursor; null clears it. */
  mark(range: { from: number; to: number } | null): void;
  /** Puts the cursor on a line (1-based) and selects it. */
  goToLine(line: number): void;
  openProblems(): void;
  format(): Promise<void>;
  focus(): void;
}

interface KbachEditorProps {
  value: string;
  onChange: (v: string) => void;
  mode?: EditorMode;
  /** Soft-wrap long lines (at spaces) instead of scrolling sideways. */
  wrap?: boolean;
  /** Changes when a whole new document is loaded (an example). */
  docKey?: string | number;
  /** Kept mounted (with its undo history) but not shown. */
  hidden?: boolean;
  label: string;
  /** Cursor, selection and problem counts, for a status bar. */
  onStatus?: (s: EditorStatus) => void;
  /** Ctrl+Enter or Ctrl+S: run the page again. */
  onRun?: () => void;
  /** A short message to show (formatted, or why formatting failed). */
  onNotice?: (text: string, kind: 'ok' | 'error') => void;
  /** Errors from the last run, shown on their lines. */
  errors?: RunError[];
  /** A new value re-runs the class checks (kbach.config.js changed which classes exist). */
  recheck?: string | number;
  /** index.html: its <!doctype html>, <html>, <head> and <body> can't be deleted, only what's inside them. */
  lockSkeleton?: boolean;
}

/** CodeMirror with Kbach completion, hover and checks. Controlled by `value`/`onChange`. */
export const KbachEditor = forwardRef<EditorHandle, KbachEditorProps>(function KbachEditor(
  { value, onChange, mode = 'html', wrap = false, docKey, hidden = false, label, onStatus, onRun, onNotice, errors, recheck, lockSkeleton = false },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const wrapping = useRef(new Compartment());
  const darkness = useRef(new Compartment());
  const site = useTheme();
  const language = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const cb = useRef({ onStatus, onRun, onNotice, mode });
  cb.current = { onStatus, onRun, onNotice, mode };
  const lastStatus = useRef('');

  const format = async () => {
    const v = view.current;
    // the generated stylesheet is Kbach's to write (and a program's change gets past read-only)
    if (!v || generated(cb.current.mode)) return;
    const before = v.state.doc.toString();
    try {
      const out = await formatCode(before, cb.current.mode);
      if (v.state.doc.toString() !== before) return; // typed meanwhile: don't clobber it
      if (out.code !== before) {
        // one change, so one Ctrl+Z undoes the whole format
        const head = Math.min(v.state.selection.main.head, out.code.length);
        v.dispatch({ changes: { from: 0, to: before.length, insert: out.code }, selection: { anchor: head }, userEvent: 'format' });
      }
      cb.current.onNotice?.(out.code === before ? 'Already formatted' : out.sorted ? 'Formatted, classes sorted' : 'Formatted', 'ok');
    } catch (e) {
      const msg = e instanceof Error ? e.message.split('\n')[0] : String(e);
      cb.current.onNotice?.('Can’t format: ' + msg, 'error');
    }
  };
  const formatRef = useRef(format);
  formatRef.current = format;

  useImperativeHandle(ref, () => ({
    select(from, to) {
      const v = view.current;
      if (!v) return;
      v.dispatch({ selection: { anchor: from, head: to }, effects: EditorView.scrollIntoView(from, { y: 'center' }) });
      v.focus();
    },
    mark(range) {
      view.current?.dispatch({ effects: setPicked.of(range) });
    },
    goToLine(n) {
      const v = view.current;
      if (!v) return;
      const line = v.state.doc.line(Math.max(1, Math.min(n, v.state.doc.lines)));
      v.dispatch({ selection: { anchor: line.from, head: line.to }, effects: EditorView.scrollIntoView(line.from, { y: 'center' }) });
      v.focus();
    },
    openProblems() {
      const v = view.current;
      if (v) openLintPanel(v);
    },
    format: () => formatRef.current(),
    focus() {
      view.current?.focus();
    },
  }));

  const reportStatus = (state: EditorState, focused: boolean) => {
    const report = cb.current.onStatus;
    if (!report) return;
    const head = state.selection.main.head;
    const line = state.doc.lineAt(head);
    let errors = 0;
    let warnings = 0;
    forEachDiagnostic(state, (d) => (d.severity === 'error' ? errors++ : warnings++));
    const s: EditorStatus = {
      line: line.number,
      col: head - line.from + 1,
      selected: state.selection.ranges.reduce((n, r) => n + r.to - r.from, 0),
      cursors: state.selection.ranges.length,
      errors,
      warnings,
      pos: head,
      focused,
    };
    const key = JSON.stringify(s);
    if (key !== lastStatus.current) {
      lastStatus.current = key;
      report(s);
    }
  };

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          // Tab takes the highlighted suggestion, as in VS Code; with no list open it falls
          // through to Emmet (ul>li*3) and then to indenting
          Prec.highest(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
          Prec.high(
            keymap.of([
              { key: 'Shift-Alt-f', run: () => (void formatRef.current(), true) },
              { key: 'Mod-Enter', run: () => (cb.current.onRun?.(), true) },
              { key: 'Mod-s', run: () => (cb.current.onRun?.(), true), preventDefault: true },
            ]),
          ),
          keymap.of([indentWithTab]),
          indentUnit.of('  '),
          EditorState.tabSize.of(2),
          language.current.of(languageFor(mode)),
          wrapping.current.of(wrap ? wrapExtension : []),
          autocompletion({
            override: [
              kbachCompletions,
              // HTML tags and attributes; in a script, its own names, snippets and the page's globals
              inModes(['html'], htmlCompletionSource),
              inModes(['js', 'ts'], localCompletionSource),
              inModes(['js', 'ts'], globalsSource),
              inModes(['js'], jsSnippets),
              inModes(['ts'], tsSnippets),
            ],
            icons: false,
            maxRenderedOptions: 60,
          }),
          classHover,
          kbachLint,
          swatchPlugin,
          pickedField,
          runErrorsField,
          lockSkeleton ? skeletonLock : [],
          kbachTheme,
          darkness.current.of(EditorView.darkTheme.of(site.isDark)),
          syntaxHighlighting(kbachHighlight),
          edgeFade,
          scrollbars,
          // scroll on past the last line until it's at the top, as VS Code does
          scrollPastEnd(),
          // keep the cursor clear of the right edge when typing at a line's end
          EditorView.scrollMargins.of(() => ({ right: 48 })),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
            reportStatus(u.state, u.view.hasFocus);
          }),
        ],
      }),
    });
    view.current = v;
    reportStatus(v.state, false);
    return () => v.destroy();
    // created once; later prop changes are applied below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: wrapping.current.reconfigure(wrap ? wrapExtension : []) });
  }, [wrap]);

  useEffect(() => {
    view.current?.dispatch({ effects: darkness.current.reconfigure(EditorView.darkTheme.of(site.isDark)) });
  }, [site.isDark]);

  useEffect(() => {
    view.current?.dispatch({ effects: language.current.reconfigure(languageFor(mode)) });
  }, [mode]);

  // shown again after being hidden: measure, since sizes were zero meanwhile
  useEffect(() => {
    if (!hidden) view.current?.requestMeasure();
  }, [hidden]);

  // A value set from outside (a one-click fix, a loaded example) is applied
  // as one undoable change over just the part that differs, so Ctrl+Z brings
  // the old code back and the cursor stays put. A new `docKey` (an example
  // was loaded) also puts the cursor and the scroll back at the top.
  // kbach.config.js changed which classes exist: check again now, not on the next keystroke
  useEffect(() => {
    if (view.current && recheck !== undefined) forceLinting(view.current);
  }, [recheck]);

  const lastDocKey = useRef(docKey);
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const old = v.state.doc.toString();
    const fresh = lastDocKey.current !== docKey;
    lastDocKey.current = docKey;
    if (old === value && !fresh) return;
    let a = 0;
    while (a < old.length && a < value.length && old[a] === value[a]) a++;
    let b = 0;
    while (b < old.length - a && b < value.length - a && old[old.length - 1 - b] === value[value.length - 1 - b]) b++;
    v.dispatch({
      changes: { from: a, to: old.length - b, insert: value.slice(a, value.length - b) },
      annotations: fromOutside.of(true),
      ...(fresh ? { selection: { anchor: 0 }, effects: EditorView.scrollIntoView(0, { y: 'start' }) } : {}),
    });
    if (fresh) v.scrollDOM.scrollLeft = 0;
  }, [value, docKey]);

  // a new run's errors replace the last run's
  const errorsKey = JSON.stringify(errors ?? []);
  useEffect(() => {
    view.current?.dispatch({ effects: setRunErrors.of(errors ?? []) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorsKey]);

  // the shown editor is the one the status bar describes
  useEffect(() => {
    if (!hidden && view.current) {
      lastStatus.current = '';
      reportStatus(view.current.state, view.current.hasFocus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  return <div ref={host} className={hidden ? 'hidden' : 'min-h-0 flex-1 overflow-hidden'} />;
});
