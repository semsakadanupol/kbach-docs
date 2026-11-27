// VS Code's TypeScript features in the playground's editor (2026-11-27), from the TypeScript
// service (client.ts → ts.worker.ts): completion (auto-imports included), hover with types and
// docs, problems in .ts/.tsx files, signature help while typing a call's arguments, F12 to go
// to a definition, F2 to rename. Each editor says which file it is with tsPath (null: HTML,
// kbach.css, native-styles.js: none of this). Class strings are Kbach's: `inClassText` keeps
// TypeScript out of them, so completion and hover there stay the class ones.
import { completionStatus, startCompletion, type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { linter, type Diagnostic } from '@codemirror/lint';
import { EditorSelection, Facet, StateEffect, StateField, type EditorState, type Extension } from '@codemirror/state';
import { EditorView, hoverTooltip, keymap, showTooltip, ViewPlugin, type Tooltip, type ViewUpdate } from '@codemirror/view';
import { syncFile, ts } from './client';

/** This editor's file, as the TypeScript service names it (PATHS in options.ts); null: not code. */
export const tsPath = Facet.define<string | null, string | null>({ combine: (v) => v[0] ?? null });

const pathOf = (state: EditorState) => state.facet(tsPath);
/** The service has this editor's text as it is now. */
const synced = async (state: EditorState) => {
  const path = pathOf(state);
  if (path) await syncFile(path, state.doc.toString());
  return path;
};

const el = (tag: string, cls: string, text?: string) => {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/** A signature or type, its docs and tags, as VS Code's hover and suggestion details show them. */
function infoNode(detail: string, docs: string, tags: string): HTMLElement {
  const box = el('div', 'cm-ts-info');
  if (detail) box.append(el('pre', 'cm-ts-sig', detail));
  if (docs) box.append(el('div', 'cm-ts-docs', docs));
  if (tags) box.append(el('div', 'cm-ts-tags', tags));
  return box;
}

// --- completion -------------------------------------------------------------------------------

const KIND: Record<string, string> = {
  function: 'function',
  'local function': 'function',
  method: 'method',
  property: 'property',
  getter: 'property',
  setter: 'property',
  var: 'variable',
  'local var': 'variable',
  let: 'variable',
  const: 'constant',
  parameter: 'variable',
  class: 'class',
  'local class': 'class',
  interface: 'interface',
  type: 'type',
  alias: 'variable',
  enum: 'enum',
  'enum member': 'enum',
  module: 'namespace',
  'external module name': 'namespace',
  keyword: 'keyword',
  string: 'text',
  'JSX attribute': 'property',
};

/**
 * TypeScript's suggestions where the cursor is: names in scope, members after a dot, exports of
 * '@kbach/react' and 'react' (picking one that isn't imported yet adds its import, as VS Code
 * does), JSX attributes, string values a parameter takes. `inClassText`: Kbach's own, instead.
 */
export function tsCompletions(inClassText: (state: EditorState, pos: number) => boolean) {
  return async (ctx: CompletionContext): Promise<CompletionResult | null> => {
    if (!pathOf(ctx.state) || inClassText(ctx.state, ctx.pos)) return null;
    const word = ctx.matchBefore(/[\w$]+$/);
    const before = ctx.state.sliceDoc(Math.max(0, ctx.pos - 1), ctx.pos);
    if (!word && !ctx.explicit && !/[.'"`/@<]/.test(before)) return null;
    const path = await synced(ctx.state);
    const res = path ? await ts('completions', path, ctx.pos) : null;
    // typed on while it was worked out (the editor asks once and waits): this answer is for text
    // that's gone, so the editor asks again for the text as it is now (requeryPlugin)
    if (ctx.view && ctx.view.state.doc !== ctx.state.doc) {
      requery.add(ctx.view);
      return null;
    }
    if (!path || !res || ctx.aborted || !res.entries.length) return null;
    const from = word ? word.from : ctx.pos;
    const options: Completion[] = res.entries.map((c) => {
      const range = c.span ? { from: c.span.start, to: c.span.start + c.span.length } : null;
      return {
        label: c.name,
        type: KIND[c.kind] ?? 'text',
        detail: c.source && c.hasAction ? 'from ' + c.source.replace(/^.*\/node_modules\//, '').replace(/\/dist\/.*$/, '') : undefined,
        // TypeScript's order: lower sortText first
        boost: -Math.min(99, parseInt(c.sortText, 10) || 11),
        info: async () => {
          const d = await ts('details', path, ctx.pos, c.name, c.source, c.data);
          return d ? infoNode(d.detail, d.docs, d.tags) : null;
        },
        apply: (view, _completion, applyFrom, applyTo) => {
          const insert = c.insertText ?? c.name;
          const span = range ?? { from: applyFrom, to: applyTo };
          // an auto-import: its edits are in the text as it was, so they go with the insertion, at once
          const extra = c.hasAction ? ts('details', path, ctx.pos, c.name, c.source, c.data) : Promise.resolve(null);
          void extra.then((d) => {
            const edits = (d?.edits ?? []).map((t) => ({ from: t.span.start, to: t.span.start + t.span.length, insert: t.newText }));
            view.dispatch({
              changes: [{ from: span.from, to: span.to, insert }, ...edits],
              selection: EditorSelection.cursor(span.from + insert.length),
              userEvent: 'input.complete',
            });
          });
        },
      };
    });
    return { from, options, validFor: /^[\w$]*$/ };
  };
}

/** Editors whose last suggestion answer came too late: asked again once the list settles. */
const requery = new WeakSet<EditorView>();

/**
 * Asks for suggestions again after an out-of-date answer, once the completion state is no longer
 * pending, if the cursor is still at the end of a word or after a dot (as VS Code keeps up).
 */
const requeryPlugin = ViewPlugin.fromClass(
  class {
    update(u: ViewUpdate) {
      if (!requery.has(u.view) || completionStatus(u.state) === 'pending') return;
      requery.delete(u.view);
      const pos = u.state.selection.main.head;
      if (/[\w$.]$/.test(u.state.sliceDoc(Math.max(0, pos - 1), pos))) setTimeout(() => startCompletion(u.view));
    }
  },
);

// --- hover ------------------------------------------------------------------------------------

/** A name's type and docs on hover (not in class strings: those show their CSS). */
export function tsHover(inClassText: (state: EditorState, pos: number) => boolean): Extension {
  return hoverTooltip(async (view, pos) => {
    if (!pathOf(view.state) || inClassText(view.state, pos)) return null;
    const path = await synced(view.state);
    const q = path ? await ts('quickInfo', path, pos) : null;
    if (!q || (!q.detail && !q.docs)) return null;
    return { pos: q.start, end: q.start + q.length, above: true, create: () => ({ dom: infoNode(q.detail, q.docs, q.tags) }) };
  });
}

// --- problems ---------------------------------------------------------------------------------

/** TypeScript's errors in a .ts/.tsx file, as VS Code underlines them (JavaScript isn't type-checked). */
export const tsLint = linter(
  async (view): Promise<Diagnostic[]> => {
    const path = pathOf(view.state);
    if (!path || !/\.tsx?$/.test(path)) return [];
    await synced(view.state);
    const list = (await ts('diagnostics', path)) ?? [];
    const end = view.state.doc.length;
    return list.map((d) => ({
      from: Math.min(d.start, end),
      to: Math.min(d.start + Math.max(d.length, 1), end),
      severity: d.severity === 'error' ? 'error' : d.severity === 'warning' ? 'warning' : 'info',
      source: 'ts(' + d.code + ')',
      message: d.message,
    }));
  },
  { delay: 600 },
);

// --- signature help ---------------------------------------------------------------------------

type Signature = NonNullable<Awaited<ReturnType<typeof getSignature>>>;
const getSignature = (path: string, pos: number) => ts('signature', path, pos);
const setSignature = StateEffect.define<{ pos: number; help: Signature } | null>();

const signatureField = StateField.define<Tooltip | null>({
  create: () => null,
  update(tip, tr) {
    for (const e of tr.effects) if (e.is(setSignature)) return e.value ? signatureTooltip(e.value.pos, e.value.help) : null;
    return tip && tr.docChanged ? { ...tip, pos: tr.changes.mapPos(tip.pos) } : tip;
  },
  provide: (f) => showTooltip.from(f),
});

function signatureTooltip(pos: number, help: Signature): Tooltip {
  return {
    pos,
    above: true,
    strictSide: false,
    create: () => {
      const item = help.items[help.selected] ?? help.items[0];
      const dom = el('div', 'cm-ts-info cm-ts-signature');
      const sig = el('pre', 'cm-ts-sig');
      sig.append(item.prefix);
      item.params.forEach((p, i) => {
        if (i) sig.append(item.separator);
        // the argument being typed, in bold
        sig.append(i === help.argument ? el('b', 'cm-ts-param', p.label) : p.label);
      });
      sig.append(item.suffix);
      dom.append(sig);
      const param = item.params[help.argument];
      if (param?.docs) dom.append(el('div', 'cm-ts-docs', param.docs));
      else if (item.docs) dom.append(el('div', 'cm-ts-docs', item.docs));
      if (help.items.length > 1) dom.append(el('div', 'cm-ts-tags', help.selected + 1 + ' of ' + help.items.length));
      return { dom };
    },
  };
}

/** Asks for signature help at the cursor; shows it, or hides it outside a call. */
async function updateSignature(view: EditorView) {
  const path = await synced(view.state);
  if (!path) return;
  const pos = view.state.selection.main.head;
  const help = await getSignature(path, pos);
  if (view.state.selection.main.head !== pos) return; // the cursor moved on meanwhile
  view.dispatch({ effects: setSignature.of(help && help.items.length ? { pos, help } : null) });
}

/** Shows after ( or , while typing a call, follows the cursor while shown, Esc hides it. */
const signaturePlugin = ViewPlugin.fromClass(
  class {
    update(u: ViewUpdate) {
      const open = u.state.field(signatureField) !== null;
      const typed = u.transactions.some((tr) => tr.isUserEvent('input.type'));
      let trigger = false;
      if (typed) {
        const pos = u.state.selection.main.head;
        trigger = /[(,<]/.test(u.state.sliceDoc(pos - 1, pos));
      }
      if (trigger || (open && (u.docChanged || u.selectionSet))) queueMicrotask(() => void updateSignature(u.view));
    }
  },
);

// --- go to definition, rename -----------------------------------------------------------------

/**
 * F12: where the name under the cursor is defined. In the reader's own files, the cursor goes
 * there (`onOpen` opens another file); a library's (React, @kbach/react) is named in `onExternal`.
 */
export async function goToDefinition(view: EditorView, onOpen: (path: string, from: number, to: number) => void, onExternal: (text: string) => void) {
  const path = await synced(view.state);
  if (!path) return;
  const defs = (await ts('definition', path, view.state.selection.main.head)) ?? [];
  const own = defs.find((d) => d.own);
  if (own) onOpen(own.path, own.start, own.start + own.length);
  else if (defs[0]) onExternal('Defined in ' + defs[0].path.replace(/^\/node_modules\//, '').replace(/\/(?:dist|index).*$/, ''));
  else onExternal('No definition found');
}

const setRename = StateEffect.define<{ from: number; to: number; name: string } | null>();
const renameField = StateField.define<Tooltip | null>({
  create: () => null,
  update(tip, tr) {
    for (const e of tr.effects) if (e.is(setRename)) return e.value ? renameTooltip(e.value) : null;
    return tr.docChanged ? null : tip;
  },
  provide: (f) => showTooltip.from(f),
});

function renameTooltip(at: { from: number; to: number; name: string }): Tooltip {
  return {
    pos: at.from,
    above: false,
    create: (view) => {
      const dom = el('div', 'cm-ts-rename');
      const input = document.createElement('input');
      input.value = at.name;
      input.setAttribute('aria-label', 'New name');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          view.dispatch({ effects: setRename.of(null) });
          view.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          void applyRename(view, at.from, input.value.trim());
        }
      });
      dom.append(input, el('span', 'cm-ts-tags', 'Enter to rename, Esc to cancel'));
      return { dom, mount: () => (input.focus(), input.select()) };
    },
  };
}

async function applyRename(view: EditorView, pos: number, name: string) {
  const path = pathOf(view.state);
  const res = path && name ? await ts('rename', path, pos) : null;
  const places = res && 'places' in res ? (res.places ?? []).filter((p) => p.path === path) : [];
  view.dispatch({
    effects: setRename.of(null),
    changes: places.map((p) => ({ from: p.start, to: p.start + p.length, insert: p.prefix + name + p.suffix })),
    userEvent: 'rename',
  });
  view.focus();
}

/** F2: a box under the name to type its new one; Enter renames it everywhere in the file. */
export async function startRename(view: EditorView, onNotice: (text: string) => void) {
  const path = await synced(view.state);
  if (!path) return;
  const pos = view.state.selection.main.head;
  const res = await ts('rename', path, pos);
  if (!res || 'error' in res) {
    onNotice((res && 'error' in res && res.error) || 'This can’t be renamed');
    return;
  }
  const word = view.state.wordAt(pos);
  view.dispatch({ effects: setRename.of({ from: word?.from ?? pos, to: word?.to ?? pos, name: res.name ?? '' }) });
}

/** Everything above, for an editor of code (its keys: F12, F2, Ctrl+Shift+Space, Esc). */
export function tsExtensions(opts: {
  inClassText: (state: EditorState, pos: number) => boolean;
  onOpen: (path: string, from: number, to: number) => void;
  onNotice: (text: string) => void;
}): Extension {
  return [
    requeryPlugin,
    tsHover(opts.inClassText),
    tsLint,
    signatureField,
    signaturePlugin,
    renameField,
    keymap.of([
      { key: 'F12', run: (v) => (void goToDefinition(v, opts.onOpen, opts.onNotice), true) },
      { key: 'F2', run: (v) => (void startRename(v, opts.onNotice), true) },
      { key: 'Mod-Shift-Space', run: (v) => (void updateSignature(v), true) },
      {
        key: 'Escape',
        run: (v) => {
          if (!v.state.field(signatureField)) return false;
          v.dispatch({ effects: setSignature.of(null) });
          return true;
        },
      },
    ]),
    // Ctrl/Cmd+click: go to the definition, as in VS Code
    EditorView.domEventHandlers({
      mousedown(e, v) {
        if (!(e.ctrlKey || e.metaKey) || e.button !== 0) return false;
        const pos = v.posAtCoords({ x: e.clientX, y: e.clientY });
        if (pos === null) return false;
        v.dispatch({ selection: { anchor: pos } });
        void goToDefinition(v, opts.onOpen, opts.onNotice);
        e.preventDefault();
        return true;
      },
    }),
  ];
}
