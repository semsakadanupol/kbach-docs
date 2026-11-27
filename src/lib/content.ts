import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parsePage } from '../markdown/parse';
import { NAV, REDIRECTS, hrefFor, type DocPage, type PageInfo } from './docs';

// Reads content/ at build time (Node only: server components, route
// handlers). Components in the browser get what they need from here
// through their page or layout, never by reading files.

const CONTENT = join(process.cwd(), 'content');

const read = (file: string) => readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
const slugsIn = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : []);

// When each page last changed, for the "Last updated" line under it: the
// date of the last commit that touched its file (one git call for all of
// them), else, for a file not committed yet, when it was last saved.
// Keyed by slug ("installation").
let dates: Record<string, string> | null = null;
function pageDates(): Record<string, string> {
  if (dates) return dates;
  dates = {};
  try {
    // --relative: paths relative to content/, wherever the repository's root is
    // (it was the Kbach monorepo until 2026-11-25). On Vercel, VERCEL_DEEP_CLONE
    // gives the build the whole history; a shallow clone would date old pages today.
    const log = execFileSync('git', ['log', '--format=@%cI', '--name-only', '--relative', '--', '.'], { cwd: CONTENT, encoding: 'utf8', maxBuffer: 64 << 20 });
    let date = '';
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) date = line.slice(1).trim();
      else if (line.endsWith('.md') && !line.includes('/')) {
        const key = line.trim().slice(0, -3);
        if (!(key in dates)) dates[key] = date;
      }
    }
  } catch {
    // not a git checkout: modified times only
  }
  for (const slug of slugsIn(CONTENT)) {
    if (!(slug in dates)) dates[slug] = statSync(join(CONTENT, slug + '.md')).mtime.toISOString();
  }
  return dates;
}

const cache = new Map<string, DocPage | null>();

/** A page from content/, or undefined when there's no such file. */
export function getPage(slug: string): DocPage | undefined {
  if (cache.has(slug)) return cache.get(slug) ?? undefined;
  const file = join(CONTENT, slug + '.md');
  let page: DocPage | null = null;
  if (/^[\w-]+$/.test(slug) && existsSync(file)) {
    const parsed = parsePage(read(file));
    page = {
      ...parsed,
      slug,
      section: NAV.find((s) => s.pages.includes(slug))?.title ?? '',
      title: parsed.meta.title ?? slug,
      description: parsed.meta.description ?? '',
      updated: pageDates()[slug],
    };
  }
  cache.set(slug, page);
  return page ?? undefined;
}

/** Every page in content/ (the docs, and playground.md). */
export function allSlugs(): string[] {
  return slugsIn(CONTENT);
}

/** The docs' pages in sidebar order. */
export function docPages(): DocPage[] {
  return NAV.flatMap((s) => s.pages)
    .map((slug) => getPage(slug))
    .filter((p): p is DocPage => !!p);
}

/** Every page's name, for the sidebar, the pager and the home page (small enough to send to the browser). */
export function pageInfos(): PageInfo[] {
  return docPages().map((p) => ({ slug: p.slug, title: p.title, nav: p.meta.nav ?? p.title, section: p.section }));
}

/** The pages a moved page's old address can go to. */
export function redirectSlugs(): string[] {
  return Object.keys(REDIRECTS);
}

export interface SearchEntry {
  href: string;
  title: string;
  /** the page's section title, or the page's title for a heading */
  section: string;
  kind: 'page' | 'heading';
  haystack: string;
  text: string;
}

/**
 * What the search box looks through: one entry per page, per tab and per
 * heading. A heading inside a tab links with ?tab=, so the right tab opens.
 * Served as /search.json.
 */
export function searchEntries(): SearchEntry[] {
  return docPages().flatMap((p) => [
    {
      href: hrefFor(p.slug),
      title: p.title,
      section: p.section,
      kind: 'page' as const,
      haystack: (p.title + ' ' + p.description).toLowerCase(),
      text: p.text,
    },
    ...p.tabs.map((t) => ({
      href: hrefFor(p.slug) + '?tab=' + t.id,
      title: p.title + ': ' + t.label,
      section: p.section,
      kind: 'page' as const,
      haystack: (t.label + ' ' + t.id.replace(/-/g, ' ') + ' ' + p.title).toLowerCase(),
      text: '',
    })),
    ...p.headings.map((h) => ({
      href: hrefFor(p.slug) + (h.tab ? '?tab=' + h.tab : '') + '#' + h.id,
      title: h.text,
      section: h.tabLabel ? p.title + ' · ' + h.tabLabel : p.title,
      kind: 'heading' as const,
      haystack: (h.text + (h.tabLabel ? ' ' + h.tabLabel : '')).toLowerCase(),
      text: '',
    })),
  ]);
}

// --- for AI assistants (https://llmstxt.org): /llms.txt and /llms-full.txt ---

/**
 * The site's address, for the tags and files that need a full URL
 * (canonical, og:url, sitemap.xml, llms.txt).
 * Set it when deploying:  KBACH_DOCS_URL=https://docs.example.com npm run build
 * Without it the pages still get their share tags, but no canonical or
 * sitemap entries, and llms.txt links are relative.
 */
export const SITE = (process.env.KBACH_DOCS_URL ?? '').replace(/\/+$/, '');

const SUMMARY =
  'Kbach styles React (web), React Native and plain HTML pages with short utility class names, from one Rust engine. Class names follow Tailwind CSS v4.3, except the colors: shades run 1 to 12, not 50 to 950.';

/** The rules from the "Using AI assistants" page: its first ```text block, so the page and the files can't disagree. */
function aiRules(): string {
  return read(join(CONTENT, 'ai-assistants.md')).match(/^```text\n([\s\S]*?)^```/m)![1].trim();
}

/** llms.txt: what Kbach is, the rules, then every page in sidebar order. */
export function llmsTxt(): string {
  const lines = ['# Kbach', '', '> ' + SUMMARY, '', '## Rules', '', aiRules(), ''];
  for (const section of NAV) {
    lines.push('## ' + section.title, '');
    for (const slug of section.pages) {
      const p = getPage(slug);
      if (p) lines.push('- [' + p.title + '](' + SITE + hrefFor(slug) + '): ' + p.description);
    }
    lines.push('');
  }
  lines.push('## Optional', '', '- [The whole documentation in one file](' + SITE + '/llms-full.txt)', '');
  return lines.join('\n');
}

/** llms-full.txt: the rules, then the whole documentation as plain Markdown. */
export function llmsFullTxt(): string {
  const full = ['# Kbach documentation', '', '## Rules', '', aiRules(), ''];
  for (const section of NAV) {
    for (const slug of section.pages) {
      const p = getPage(slug);
      if (!p) continue;
      const body = read(join(CONTENT, slug + '.md'))
        .replace(/^---\n[\s\S]*?\n---\n/, '')
        .replace(/^::(cards|palette|extension|playground)\s*$/gm, '')
        // the Installation page's tabs: each tab becomes a plain section title
        .replace(/^:::tab (.+?) \{#[\w-]+\}.*$/gm, '## For $1')
        .replace(/^:::(tabs)?\s*$/gm, '')
        .replace(/\s\{#[\w-]+\}$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      full.push('---', '', '# ' + p.title, '', 'Source: ' + SITE + hrefFor(slug), '', p.description, '', body, '');
    }
  }
  return full.join('\n');
}
