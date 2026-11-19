// A small Markdown reader for the pages in content/. It covers what the
// docs use and nothing more: front matter, headings, paragraphs, lists,
// tables, fenced code (with titles, line highlights and tab groups),
// GitHub-style callouts, and "::name" lines that place a live component.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'code'; v: string }
  | { t: 'strong'; c: Inline[] }
  | { t: 'em'; c: Inline[] }
  | { t: 'link'; href: string; c: Inline[] }
  | { t: 'kbd'; v: string };

export interface CodeBlock {
  t: 'code';
  lang: string;
  code: string;
  title?: string;
  tab?: string;
  highlight: Set<number>;
}

export type Block =
  | { t: 'heading'; level: 2 | 3 | 4; id: string; text: string; c: Inline[] }
  | { t: 'p'; c: Inline[] }
  | CodeBlock
  | { t: 'tabs'; items: CodeBlock[] }
  | { t: 'preview'; html: string; title?: string }
  | { t: 'callout'; kind: 'note' | 'tip' | 'warning' | 'important'; title?: string; c: Block[] }
  | { t: 'list'; ordered: boolean; items: Inline[][] }
  | { t: 'table'; head: Inline[][]; align: ('left' | 'center' | 'right')[]; rows: Inline[][][] }
  | { t: 'hr' }
  | { t: 'component'; name: string; args: string }
  | { t: 'tabgroup'; tabs: Tab[] };

/** One panel of a ":::tabs" group: the page shows one at a time. */
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  note?: string;
  blocks: Block[];
}

export interface Heading {
  level: 2 | 3;
  id: string;
  text: string;
  /** Set when the heading sits inside a tab: it only exists while that tab is shown. */
  tab?: string;
  tabLabel?: string;
}

export interface Page {
  meta: Record<string, string>;
  blocks: Block[];
  headings: Heading[];
  /** The tabs of the page's ":::tabs" group, if it has one. */
  tabs: { id: string; label: string }[];
  /** Plain text of the whole page, for search. */
  text: string;
}

/** Ids the page layout uses itself: a heading must never take one (App.tsx: <main id="content">). */
const LAYOUT_IDS = new Set(['content', 'root']);

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

const INLINE_RE = /(\x60+)([\s\S]*?[^\x60])\1(?!\x60)|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|\[([^\]]+)\]\(([^)\s]+)\)|<kbd>([^<]+)<\/kbd>/g;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of src.matchAll(INLINE_RE)) {
    if (m.index! > last) out.push({ t: 'text', v: src.slice(last, m.index) });
    if (m[1]) out.push({ t: 'code', v: m[2].trim() === '' ? m[2] : m[2].replace(/^ (.*) $/, '$1') });
    else if (m[3]) out.push({ t: 'strong', c: parseInline(m[3]) });
    else if (m[4]) out.push({ t: 'em', c: parseInline(m[4]) });
    else if (m[5]) out.push({ t: 'link', href: m[6], c: parseInline(m[5]) });
    else if (m[7]) out.push({ t: 'kbd', v: m[7] });
    last = m.index! + m[0].length;
  }
  if (last < src.length) out.push({ t: 'text', v: src.slice(last) });
  return out;
}

export function inlineText(c: Inline[]): string {
  return c.map((n) => ('v' in n ? n.v : inlineText(n.c))).join('');
}

/** "{1,3-5}" becomes {1,3,4,5} */
function parseHighlight(spec: string | undefined): Set<number> {
  const set = new Set<number>();
  if (!spec) return set;
  for (const part of spec.split(',')) {
    const [a, b] = part.split('-').map((n) => parseInt(n, 10));
    if (Number.isNaN(a)) continue;
    for (let i = a; i <= (Number.isNaN(b) || b === undefined ? a : b); i++) set.add(i);
  }
  return set;
}

/** Reads the info string of a fence: lang title="x" tab="y" {1,3} */
function parseFenceInfo(info: string) {
  const lang = info.split(/\s+/)[0] || 'text';
  const attr = (name: string) => info.match(new RegExp(name + '="([^"]*)"'))?.[1];
  return { lang, title: attr('title'), tab: attr('tab'), highlight: parseHighlight(info.match(/\{([\d,\s-]+)\}/)?.[1]) };
}

const CALLOUT_RE = /^\[!(NOTE|TIP|WARNING|IMPORTANT)\]\s*(.*)$/i;

/**
 * A ":::tabs" group, from the line after ":::tabs" to a line that is just
 * ":::". Each ":::tab Label {#id} icon=name note="text"" line starts a panel.
 * Returns the group and the index of the line after it.
 */
function parseTabGroup(lines: string[], start: number, headings: Heading[], usedIds: Map<string, number>): [Block, number] {
  const tabs: Tab[] = [];
  let i = start;
  let body: string[] | null = null;
  let current: Omit<Tab, 'blocks'> | null = null;
  const flush = () => {
    if (!current || !body) return;
    const own: Heading[] = [];
    const blocks = parseBlocks(body, own, usedIds);
    for (const h of own) headings.push({ ...h, tab: current.id, tabLabel: current.label });
    tabs.push({ ...current, blocks });
  };
  let inFence = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^\x60{3}/.test(line)) inFence = !inFence;
    if (!inFence && /^:::\s*$/.test(line)) break;
    const t = inFence ? null : line.match(/^:::tab\s+(.*)$/);
    if (t) {
      flush();
      const attrs = t[1];
      const label = attrs.replace(/\{#[\w-]+\}|\w+=("[^"]*"|\S+)/g, '').trim();
      current = {
        label,
        id: attrs.match(/\{#([\w-]+)\}/)?.[1] ?? slugify(label),
        icon: attrs.match(/icon=(\S+)/)?.[1],
        note: attrs.match(/note="([^"]*)"/)?.[1],
      };
      body = [];
    } else if (body) body.push(line);
  }
  flush();
  return [{ t: 'tabgroup', tabs }, i + 1];
}

function parseBlocks(lines: string[], headings: Heading[], usedIds: Map<string, number>): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  const isBlank = (l: string | undefined) => l === undefined || l.trim() === '';
  const startsBlock = (l: string) =>
    /^(#{2,4})\s/.test(l) ||
    /^\x60{3}/.test(l) ||
    /^>/.test(l) ||
    /^\s*([-*]|\d+\.)\s/.test(l) ||
    /^\|/.test(l) ||
    /^---+\s*$/.test(l) ||
    /^::\w/.test(l) ||
    /^:::/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }

    if (/^:::tabs\s*$/.test(line)) {
      const [group, next] = parseTabGroup(lines, i + 1, headings, usedIds);
      blocks.push(group);
      i = next;
      continue;
    }

    // heading
    const h = line.match(/^(#{2,4})\s+(.*?)\s*(?:\{#([\w-]+)\})?\s*$/);
    if (h) {
      const level = h[1].length as 2 | 3 | 4;
      const c = parseInline(h[2]);
      const text = inlineText(c);
      let id = h[3] ?? slugify(text);
      // the layout's own ids (the skip link targets #content) stay unique
      if (LAYOUT_IDS.has(id)) id += '-section';
      const n = usedIds.get(id) ?? 0;
      usedIds.set(id, n + 1);
      if (n > 0) id = id + '-' + n;
      blocks.push({ t: 'heading', level, id, text, c });
      if (level < 4) headings.push({ level: level as 2 | 3, id, text });
      i++;
      continue;
    }

    // fenced code
    const f = line.match(/^\x60{3}(.*)$/);
    if (f) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\x60{3}\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      const info = parseFenceInfo(f[1].trim());
      if (info.lang === 'preview') {
        blocks.push({ t: 'preview', html: body.join('\n'), title: info.title });
        continue;
      }
      const block: CodeBlock = { t: 'code', lang: info.lang, code: body.join('\n'), title: info.title, tab: info.tab, highlight: info.highlight };
      const prev = blocks[blocks.length - 1];
      if (block.tab && prev && prev.t === 'tabs') prev.items.push(block);
      else if (block.tab && prev && prev.t === 'code' && prev.tab) blocks[blocks.length - 1] = { t: 'tabs', items: [prev, block] };
      else blocks.push(block);
      continue;
    }

    // blockquote / callout
    if (/^>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ''));
      const head = body[0]?.match(CALLOUT_RE);
      const kind = (head ? head[1].toLowerCase() : 'note') as 'note' | 'tip' | 'warning' | 'important';
      if (head) body.shift();
      blocks.push({ t: 'callout', kind, title: head?.[2] || undefined, c: parseBlocks(body, [], usedIds) });
      continue;
    }

    // list
    const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (m) {
          items.push(m[2]);
          i++;
        } else if (!isBlank(lines[i]) && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else break;
      }
      blocks.push({ t: 'list', ordered, items: items.map(parseInline) });
      continue;
    }

    // table
    if (/^\|/.test(line) && lines[i + 1] && /^\|?\s*:?-+:?\s*\|/.test(lines[i + 1])) {
      const cells = (l: string) =>
        l
          .trim()
          .replace(/^\||\|$/g, '')
          .split(/(?<!\\)\|/)
          .map((c) => c.trim().replace(/\\\|/g, '|'));
      const head = cells(line).map(parseInline);
      const align = cells(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left')) as (
        | 'left'
        | 'center'
        | 'right'
      )[];
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]).map(parseInline));
      blocks.push({ t: 'table', head, align, rows });
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push({ t: 'hr' });
      i++;
      continue;
    }

    const comp = line.match(/^::(\w[\w-]*)\s*(.*)$/);
    if (comp) {
      blocks.push({ t: 'component', name: comp[1], args: comp[2] });
      i++;
      continue;
    }

    // paragraph: runs until a blank line or the start of another block
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i])) para.push(lines[i++].trim());
    blocks.push({ t: 'p', c: parseInline(para.join(' ')) });
  }
  return blocks;
}

function blockText(b: Block): string {
  switch (b.t) {
    case 'heading':
      return b.text;
    case 'p':
      return inlineText(b.c);
    case 'code':
      return b.code;
    case 'tabs':
      return b.items.map((x) => x.code).join('\n');
    case 'preview':
      return '';
    case 'callout':
      return b.c.map(blockText).join('\n');
    case 'list':
      return b.items.map(inlineText).join('\n');
    case 'table':
      return [b.head, ...b.rows].map((r) => r.map(inlineText).join(' ')).join('\n');
    case 'tabgroup':
      return b.tabs.map((t) => t.label + '\n' + t.blocks.map(blockText).join('\n')).join('\n');
    default:
      return '';
  }
}

export function parsePage(src: string): Page {
  const meta: Record<string, string> = {};
  let body = src.replace(/\r\n/g, '\n');
  const fm = body.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    for (const l of fm[1].split('\n')) {
      const m = l.match(/^(\w+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    body = body.slice(fm[0].length);
  }
  const headings: Heading[] = [];
  const blocks = parseBlocks(body.split('\n'), headings, new Map());
  const group = blocks.find((b) => b.t === 'tabgroup');
  const tabs = group && group.t === 'tabgroup' ? group.tabs.map(({ id, label }) => ({ id, label })) : [];
  return { meta, blocks, headings, tabs, text: blocks.map(blockText).join('\n') };
}
