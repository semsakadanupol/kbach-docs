import { SITE, docPages, getPage } from '../../lib/content';
import { hrefFor } from '../../lib/docs';

export const dynamic = 'force-static';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Every page a search engine should know: the home page, the docs in sidebar
 * order, then the playground, each with the date its text last changed
 * (`<lastmod>`, the same date as its "Last updated" line). Moved pages' old
 * addresses (REDIRECTS) are left out: they're noindex. A sitemap needs full
 * addresses: without KBACH_DOCS_URL (see lib/content.ts) it lists nothing.
 */
export function GET() {
  const entries: { path: string; updated?: string }[] = SITE
    ? [{ path: '/' }, ...docPages().map((p) => ({ path: hrefFor(p.slug), updated: p.updated })), { path: '/playground', updated: getPage('playground')?.updated }]
    : [];
  const url = ({ path, updated }: { path: string; updated?: string }) =>
    '  <url>\n    <loc>' + escape(SITE + path) + '</loc>\n' + (updated ? '    <lastmod>' + updated.slice(0, 10) + '</lastmod>\n' : '') + '  </url>';
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(url).join('\n') + (entries.length ? '\n' : '') + '</urlset>\n';
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
