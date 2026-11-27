import { parser } from '@lezer/html';
import type { SyntaxNode } from '@lezer/common';

// Maps an element in the canvas to its tag in index.html, and back.
//
// Both sides describe an element by its trail from <body>: at each level the
// tag, and which one of that tag it is among its element siblings
// ({ tag: 'li', n: 2 } is the third <li>). Counting per tag, not per child,
// means an element the script added elsewhere in the parent doesn't throw
// the count off. Elements the script created have no trail in the source.

export interface TrailStep {
  tag: string;
  n: number;
}
export type Trail = TrailStep[];

export interface SourceElement {
  tag: string;
  /** the whole element, start tag to end tag */
  from: number;
  to: number;
  /** just the start tag ("<div class=…>") */
  openFrom: number;
  openTo: number;
  /** the class attribute's value, when it has one (positions inside the quotes) */
  classFrom: number | null;
  classTo: number | null;
  children: SourceElement[];
  parent: SourceElement | null;
}

function tagNameOf(el: SyntaxNode, src: string): { open: SyntaxNode; name: string } | null {
  const open = el.getChild('OpenTag') ?? el.getChild('SelfClosingTag');
  const nameNode = open?.getChild('TagName');
  if (!open || !nameNode) return null;
  return { open, name: src.slice(nameNode.from, nameNode.to).toLowerCase() };
}

function classValue(open: SyntaxNode, src: string): { from: number; to: number } | null {
  for (let a = open.firstChild; a; a = a.nextSibling) {
    if (a.name !== 'Attribute') continue;
    const name = a.getChild('AttributeName');
    if (!name || src.slice(name.from, name.to).toLowerCase() !== 'class') continue;
    const value = a.getChild('AttributeValue') ?? a.getChild('UnquotedAttributeValue');
    if (!value) return null;
    const quoted = /^["']/.test(src[value.from]);
    return quoted ? { from: value.from + 1, to: value.to - 1 } : { from: value.from, to: value.to };
  }
  return null;
}

/** The elements of an HTML fragment, or of a whole document's <body>, as a tree with source positions. */
export function sourceTree(src: string): SourceElement[] {
  const roots: SourceElement[] = [];
  const walk = (node: SyntaxNode, parent: SourceElement | null, into: SourceElement[]) => {
    for (let c = node.firstChild; c; c = c.nextSibling) {
      if (c.name !== 'Element') {
        // documents parsed as fragments can wrap elements in other nodes
        if (c.name !== 'Text' && c.name !== 'Comment') walk(c, parent, into);
        continue;
      }
      const t = tagNameOf(c, src);
      if (!t) continue;
      const cls = classValue(t.open, src);
      const el: SourceElement = {
        tag: t.name,
        from: c.from,
        to: c.to,
        openFrom: t.open.from,
        openTo: t.open.to,
        classFrom: cls?.from ?? null,
        classTo: cls?.to ?? null,
        children: [],
        parent,
      };
      into.push(el);
      walk(c, el, el.children);
    }
  };
  walk(parser.parse(src).topNode, null, roots);
  // a whole document: trails start at <body> (as in the canvas), so its children are the roots
  const body = roots.find((e) => e.tag === 'html')?.children.find((e) => e.tag === 'body');
  if (!body) return roots;
  for (const el of body.children) el.parent = null;
  return body.children;
}

/** The source element a canvas trail points at, or null (made by the script, or the page changed shape). */
export function elementForTrail(tree: SourceElement[], trail: Trail): SourceElement | null {
  let level = tree;
  let found: SourceElement | null = null;
  for (const step of trail) {
    // <tbody> in the canvas that the source never wrote: the parser added it
    if (step.tag === 'tbody' && found?.tag === 'table' && !level.some((e) => e.tag === 'tbody')) continue;
    const same = level.filter((e) => e.tag === step.tag);
    found = same[step.n] ?? null;
    if (!found) return null;
    level = found.children;
  }
  return found;
}

/** The trail of a source element, for finding it in the canvas. */
export function trailForElement(tree: SourceElement[], el: SourceElement): Trail {
  const trail: Trail = [];
  for (let node: SourceElement | null = el; node; node = node.parent) {
    const siblings = node.parent ? node.parent.children : tree;
    trail.unshift({ tag: node.tag, n: siblings.filter((s) => s.tag === node!.tag).indexOf(node) });
  }
  return trail;
}

/** The innermost element whose source contains `pos`. */
export function elementAt(tree: SourceElement[], pos: number): SourceElement | null {
  let level = tree;
  let found: SourceElement | null = null;
  for (;;) {
    const inside = level.find((e) => pos >= e.from && pos <= e.to);
    if (!inside) return found;
    found = inside;
    level = inside.children;
  }
}

/** The source with `cls` added to the element's class attribute (or a new class attribute). */
export function addClassInSource(src: string, el: SourceElement, cls: string): string {
  if (el.classFrom !== null && el.classTo !== null) {
    const current = src.slice(el.classFrom, el.classTo);
    if (current.split(/\s+/).includes(cls)) return src;
    const value = current.trim() ? current.replace(/\s+$/, '') + ' ' + cls : cls;
    return src.slice(0, el.classFrom) + value + src.slice(el.classTo);
  }
  // after the tag name: <div …> → <div class="cls" …>
  const at = el.openFrom + 1 + el.tag.length;
  return src.slice(0, at) + ' class="' + cls + '"' + src.slice(at);
}

/**
 * The source with `remove` taken out of the element's class attribute and `add` put in, in one
 * edit (the Design tab replaces a class this way: two edits in a row would use stale offsets).
 */
export function setClassesInSource(src: string, el: SourceElement, remove: string[], add: string[]): string {
  if (el.classFrom === null || el.classTo === null) return add.length ? addClassInSource(src, el, add.join(' ')) : src;
  const tokens = src.slice(el.classFrom, el.classTo).split(/\s+/).filter((c) => c && !remove.includes(c));
  for (const a of add) if (!tokens.includes(a)) tokens.push(a);
  return src.slice(0, el.classFrom) + tokens.join(' ') + src.slice(el.classTo);
}

/** The source with `cls` taken out of the element's class attribute. */
export function removeClassInSource(src: string, el: SourceElement, cls: string): string {
  if (el.classFrom === null || el.classTo === null) return src;
  const kept = src.slice(el.classFrom, el.classTo).split(/\s+/).filter((c) => c && c !== cls);
  return src.slice(0, el.classFrom) + kept.join(' ') + src.slice(el.classTo);
}
