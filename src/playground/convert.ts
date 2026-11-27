// HTML ↔ React for the playground's HTML / React switch, on a page that isn't an example (an
// example has both versions written by hand; examples.ts). Added 2026-11-27, to show the same
// Kbach classes working both ways:
//
//   HTML → React  index.html's body becomes App.jsx's JSX (class → className, for → htmlFor,
//                 style="…" → a style object, SVG's kebab-case attributes → camelCase, void tags
//                 self-closed, comments as {/* … */}). Its script is read (Prettier's parser) and
//                 sorted: a listener added to an element found by id becomes that element's
//                 onClick (onInput, onSubmit, …), an inline onclick="…" becomes onClick too; the
//                 script's functions and values move to the top of the file where handlers can
//                 reach them; the rest runs in a useEffect, once React has drawn the page, so any
//                 DOM script keeps working. A script it can't read goes in the useEffect whole.
//   React → HTML  the markup React rendered (the canvas sends #root's HTML: any component, state
//                 and .map() included) becomes index.html's body; App.jsx's logic stays behind,
//                 and script.js says so (REACT_NOTE).
//
// The markup is parsed by the browser (DOMParser, inert: nothing loads or runs), so this runs in
// the page, not at build time. Prettier (format.ts) lays the result out.

import { formatCode } from './format';

/** Attributes whose JSX name isn't their HTML name camelCased. */
const RENAME: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  novalidate: 'noValidate',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  srcset: 'srcSet',
  enctype: 'encType',
  datetime: 'dateTime',
  allowfullscreen: 'allowFullScreen',
  playsinline: 'playsInline',
  spellcheck: 'spellCheck',
  inputmode: 'inputMode',
  enterkeyhint: 'enterKeyHint',
  'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv',
  'xlink:href': 'xlinkHref',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
};

/** HTML attributes that are on by being there (`disabled`, not `disabled="true"`). */
const BOOLEAN = new Set(
  'allowfullscreen async autofocus autoplay checked controls default defer disabled formnovalidate hidden inert loop multiple muted novalidate open playsinline readonly required reversed selected'.split(' '),
);

/** Elements with no closing tag: self-closed in JSX. */
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));

/** DOM event names whose React prop isn't on + the name capitalized. */
const EVENT_PROPS: Record<string, string> = {
  dblclick: 'onDoubleClick',
  keydown: 'onKeyDown',
  keyup: 'onKeyUp',
  keypress: 'onKeyPress',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  mouseover: 'onMouseOver',
  mouseout: 'onMouseOut',
  mousemove: 'onMouseMove',
  pointerdown: 'onPointerDown',
  pointerup: 'onPointerUp',
  pointerenter: 'onPointerEnter',
  pointerleave: 'onPointerLeave',
  pointermove: 'onPointerMove',
  touchstart: 'onTouchStart',
  touchend: 'onTouchEnd',
  contextmenu: 'onContextMenu',
  animationend: 'onAnimationEnd',
  transitionend: 'onTransitionEnd',
};
const eventProp = (event: string) => EVENT_PROPS[event] ?? 'on' + event[0].toUpperCase() + event.slice(1);

/** What React → HTML leaves in script.js: where the page's logic went. */
export const REACT_NOTE = (appFile: string) =>
  `// This page was made from a React app: index.html is the markup React drew, with the same
// Kbach classes. Its logic (state, event handlers, effects) stays in ${appFile}: switch the top
// bar back to React, or press Undo, to get it back. A script written here runs on the page.
`;

/** Whether a script has code in it (not only comments). */
export function hasCode(script: string): boolean {
  return script.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '').trim() !== '';
}

const camel = (name: string) => name.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());

/** A style attribute as a JSX style object: `color: red; margin-top: 4px` → `{{ color: 'red', marginTop: '4px' }}`. */
function styleObject(css: string): string {
  const props = css
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(':');
      const prop = d.slice(0, i).trim();
      // custom properties keep their name, quoted
      const key = prop.startsWith('--') ? JSON.stringify(prop) : camel(prop.replace(/^-ms-/, 'ms-'));
      return key + ': ' + JSON.stringify(d.slice(i + 1).trim());
    });
  return '{{ ' + props.join(', ') + ' }}';
}

/** Text as JSX text: the characters JSX gives a meaning to, written so they show as themselves. */
function jsxText(text: string): string {
  return text.replace(/[{}<>& ]/g, (c) => ({ '{': "{'{'}", '}': "{'}'}", '<': '&lt;', '>': '&gt;', '&': '&amp;', ' ': '&nbsp;' })[c]!);
}

// --- the script --------------------------------------------------------------

/** Handlers for the markup: by element id, the React prop and the function's code. */
type Handlers = Map<string, { prop: string; code: string }[]>;

interface ScriptPlan {
  imports: string[];
  /** the top of the file: functions, values, and `let` for what the effect fills in */
  module: string[];
  /** the useEffect's body, in the script's order */
  effect: string[];
  handlers: Handlers;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Babel's and typescript-estree's nodes, read by type name */
type AnyNode = any;

/** Sorts a script for App.jsx (see the top of the file). Unreadable: all of it in the effect. */
async function planScript(code: string, ts: boolean, ids: Set<string>): Promise<ScriptPlan> {
  const plan: ScriptPlan = { imports: [], module: [], effect: [], handlers: new Map() };
  if (!hasCode(code)) return plan;
  let body: AnyNode[];
  try {
    const plugin = ts ? await import('prettier/plugins/typescript') : await import('prettier/plugins/babel');
    const parsers = ((plugin as AnyNode).default ?? plugin).parsers;
    const ast = await (ts ? parsers.typescript : parsers.babel).parse(code, {});
    body = (ast.program ?? ast).body;
  } catch {
    plan.effect.push(code.trim());
    return plan;
  }

  const span = (n: AnyNode): [number, number] => n.range ?? [n.start, n.end];
  const src = (n: AnyNode) => code.slice(...span(n));
  const unwrap = (n: AnyNode): AnyNode => {
    while (n && /^(?:TSNonNullExpression|TSAsExpression|TSSatisfiesExpression|TSTypeAssertion|ParenthesizedExpression|ChainExpression)$/.test(n.type)) n = n.expression;
    return n;
  };
  const text = (n: AnyNode): string | null => {
    n = unwrap(n);
    if (!n) return null;
    if ((n.type === 'StringLiteral' || n.type === 'Literal') && typeof n.value === 'string') return n.value;
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return n.quasis[0].value.cooked;
    return null;
  };
  const isCall = (n: AnyNode) => n && (n.type === 'CallExpression' || n.type === 'OptionalCallExpression');
  const member = (n: AnyNode) => (n && (n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression') && !n.computed ? n : null);
  // the top-level names that hold an element found by id
  const elementVars = new Map<string, string>();
  /** The id of the element an expression finds: document.getElementById('x'), querySelector('#x'), or a name holding one. */
  const idOf = (n: AnyNode): string | null => {
    n = unwrap(n);
    if (!n) return null;
    if (n.type === 'Identifier') return elementVars.get(n.name) ?? null;
    if (!isCall(n)) return null;
    const callee = member(unwrap(n.callee));
    if (!callee || unwrap(callee.object)?.name !== 'document') return null;
    const arg = text(n.arguments[0]);
    if (arg === null) return null;
    if (callee.property.name === 'getElementById') return arg;
    if (callee.property.name === 'querySelector' && /^#[\w-]+$/.test(arg)) return arg.slice(1);
    return null;
  };
  /** A value that can sit at the top of the file: a literal, a function, a list or object of those. */
  const plain = (n: AnyNode): boolean => {
    n = unwrap(n);
    if (!n) return true;
    if (/^(?:StringLiteral|NumericLiteral|BooleanLiteral|NullLiteral|BigIntLiteral|RegExpLiteral|Literal|ArrowFunctionExpression|FunctionExpression)$/.test(n.type)) return true;
    if (n.type === 'TemplateLiteral') return n.expressions.length === 0;
    if (n.type === 'UnaryExpression') return plain(n.argument);
    if (n.type === 'ArrayExpression') return n.elements.every((e: AnyNode) => e && e.type !== 'SpreadElement' && plain(e));
    if (n.type === 'ObjectExpression')
      return n.properties.every((p: AnyNode) => (p.type === 'ObjectProperty' || p.type === 'Property') && !p.computed && (p.kind === undefined || p.kind === 'init') && plain(p.value));
    return false;
  };

  let prev = 0;
  for (const stmt of body) {
    const [start, end] = span(stmt);
    // the comments just above a statement go with it
    const lead = code.slice(prev, start).trim();
    const withLead = (s: string) => (lead ? lead + '\n' + s : s);
    prev = end;
    if (stmt.type === 'ImportDeclaration') {
      plan.imports.push(withLead(src(stmt)));
      continue;
    }
    if (stmt.type === 'FunctionDeclaration') {
      plan.module.push(withLead(src(stmt)));
      continue;
    }
    if (stmt.type === 'VariableDeclaration' && stmt.declarations.every((d: AnyNode) => d.id.type === 'Identifier')) {
      const lets: string[] = [];
      const fills: string[] = [];
      for (const d of stmt.declarations) {
        const id = idOf(d.init);
        if (id !== null && ids.has(id)) elementVars.set(d.id.name, id);
        if (plain(d.init)) lets.push(stmt.kind + ' ' + code.slice(span(d)[0], span(d)[1]) + ';');
        else {
          // worked out once the page is drawn; declared up top so handlers can see it
          lets.push('let ' + d.id.name + ';');
          fills.push(d.id.name + ' = ' + src(d.init) + ';');
        }
      }
      plan.module.push(withLead(lets.join('\n')));
      if (fills.length) plan.effect.push(fills.join('\n'));
      continue;
    }
    // el.addEventListener('click', handler) on an element of the markup: its onClick
    const call = stmt.type === 'ExpressionStatement' ? unwrap(stmt.expression) : null;
    const callee = isCall(call) ? member(unwrap(call.callee)) : null;
    if (callee && callee.property.name === 'addEventListener' && call.arguments.length === 2) {
      const id = idOf(callee.object);
      const event = text(call.arguments[0]);
      if (id !== null && ids.has(id) && event) {
        const list = plan.handlers.get(id) ?? [];
        list.push({ prop: eventProp(event), code: src(call.arguments[1]) });
        plan.handlers.set(id, list);
        continue;
      }
    }
    plan.effect.push(withLead(src(stmt)));
  }
  const tail = code.slice(prev).trim();
  if (tail) plan.effect.push(tail);
  return plan;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- the markup --------------------------------------------------------------

function attributes(el: Element, handlers: Handlers): string {
  const tag = el.localName;
  const out: string[] = [];
  // its handlers: from the script (by id) and inline on…="" attributes, one prop per event
  const byProp = new Map<string, string[]>();
  for (const h of handlers.get(el.id) ?? []) byProp.set(h.prop, [...(byProp.get(h.prop) ?? []), h.code]);
  for (const { name, value } of [...el.attributes]) {
    if (/^on[a-z]+$/i.test(name)) {
      // inline code: a function of the event (this: the element it's on)
      if (value.trim()) {
        const prop = eventProp(name.slice(2).toLowerCase());
        byProp.set(prop, [...(byProp.get(prop) ?? []), '(event) => { ' + value.replace(/\bthis\b/g, 'event.currentTarget').trim().replace(/;?$/, ';') + ' }']);
      }
      continue;
    }
    if (name === 'style') {
      out.push('style=' + styleObject(value));
      continue;
    }
    let jsxName = RENAME[name] ?? (/^(?:data|aria)-/.test(name) ? name : camel(name));
    // a form field's starting value: React's uncontrolled props
    if ((tag === 'input' || tag === 'select' || tag === 'textarea') && (name === 'value' || name === 'checked')) jsxName = name === 'value' ? 'defaultValue' : 'defaultChecked';
    if (BOOLEAN.has(name) && (value === '' || value.toLowerCase() === name)) out.push(jsxName);
    else out.push(jsxName + '=' + (value.includes('"') ? '{' + JSON.stringify(value) + '}' : '"' + value + '"'));
  }
  for (const [prop, fns] of byProp) out.push(prop + '={' + (fns.length === 1 ? fns[0] : '(event) => { ' + fns.map((f) => '(' + f + ')(event);').join(' ') + ' }') + '}');
  return out.length ? ' ' + out.join(' ') : '';
}

/** One node and what's inside it, as JSX on one line (Prettier lays it out); scripts go to `scripts`. */
function node(n: Node, scripts: string[], handlers: Handlers, first: boolean, last: boolean): string {
  if (n.nodeType === Node.COMMENT_NODE) return '{/* ' + (n.textContent ?? '').trim().replace(/\*\//g, '* /') + ' */}';
  if (n.nodeType === Node.TEXT_NODE) {
    const text = n.textContent ?? '';
    // whitespace that only lays the source out (it has a line break): none in JSX either
    if (!text.trim()) return /\n/.test(text) ? '' : ' ';
    // the rest collapses to single spaces, as the browser shows it; a line break at the start or
    // end of an element's text is layout too
    let t = text.replace(/\s+/g, ' ');
    if (first && /^\s*\n/.test(text)) t = t.trimStart();
    if (last && /\n\s*$/.test(text)) t = t.trimEnd();
    return jsxText(t);
  }
  if (n.nodeType !== Node.ELEMENT_NODE) return '';
  const el = n as Element;
  const tag = el.localName;
  if (tag === 'script') {
    if (!el.getAttribute('src') && el.textContent?.trim()) scripts.push(el.textContent);
    return '';
  }
  // a <style> keeps its CSS as it is, as a template string
  if (tag === 'style') return '<style>{`' + (el.textContent ?? '').replace(/[`\\]/g, '\\$&').replace(/\$\{/g, '\\${') + '`}</style>';
  if (tag === 'textarea') return '<textarea' + attributes(el, handlers) + (el.textContent ? ' defaultValue=' + JSON.stringify(el.textContent) : '') + ' />';
  if (VOID.has(tag)) return '<' + tag + attributes(el, handlers) + ' />';
  const inner = children(el, scripts, handlers);
  return inner ? '<' + tag + attributes(el, handlers) + '>' + inner + '</' + tag + '>' : '<' + tag + attributes(el, handlers) + ' />';
}

function children(parent: ParentNode, scripts: string[], handlers: Handlers): string {
  const list = [...parent.childNodes];
  return list.map((c, i) => node(c, scripts, handlers, i === 0, i === list.length - 1)).join('');
}

/**
 * The App.jsx for an HTML page: its body as JSX, its handlers as props, its script sorted between
 * the top of the file and a useEffect (see the top of this file).
 */
export async function htmlToReact(html: string, script: string, ts: boolean): Promise<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const inline = [...doc.body.querySelectorAll('script:not([src])')].map((s) => s.textContent ?? '');
  const ids = new Set([...doc.body.querySelectorAll('[id]')].map((el) => el.id));
  const plan = await planScript([...inline, script].filter((s) => s.trim()).join('\n\n'), ts, ids);

  let jsx = children(doc.body, [], plan.handlers).trim();
  // one element at the top, or a fragment around several
  const top = [...doc.body.childNodes].filter((c) => (c.nodeType === Node.ELEMENT_NODE && (c as Element).localName !== 'script') || (c.nodeType === Node.TEXT_NODE && (c.textContent ?? '').trim()) || c.nodeType === Node.COMMENT_NODE);
  if (top.length !== 1 || top[0].nodeType !== Node.ELEMENT_NODE) jsx = '<>' + jsx + '</>';

  const moved = plan.handlers.size > 0;
  const source = [
    ...(plan.effect.length ? ["import { useEffect } from 'react';"] : []),
    ...plan.imports,
    '',
    '// Made from index.html: the same Kbach classes, as className' + (moved ? "; the script's listeners as props (onClick, …)" : '') + '.',
    // (a blank line before a function or anything with its comment, as you'd write it)
    ...(plan.module.length ? ['', ...plan.module.map((m, i) => (i > 0 && m.includes('\n') ? '\n' + m : m))] : []),
    '',
    'export default function App() {',
    ...(plan.effect.length ? ['  useEffect(() => {', "    // the rest of index.html's script, run once React has drawn the page", ...plan.effect, '  }, []);', ''] : []),
    '  return (' + jsx + ');',
    '}',
    '',
  ].join('\n');
  try {
    return (await formatCode(source, ts ? 'tsx' : 'jsx')).code;
  } catch {
    return source; // something Prettier can't read: as it is
  }
}

/** index.html for a React page's rendered markup: the page's own tags and head, the markup as its body. */
export async function renderedToHtml(page: string, rendered: string): Promise<string> {
  const open = /<body\b[^>]*>/i.exec(page);
  const close = page.lastIndexOf('</body>');
  const html = open && close > open.index ? page.slice(0, open.index + open[0].length) + '\n' + rendered + '\n' + page.slice(close) : page;
  try {
    return (await formatCode(html, 'html')).code;
  } catch {
    return html;
  }
}
