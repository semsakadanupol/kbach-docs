import { SITE, allSlugs } from '../../lib/content';
import { localHref } from '../../lib/locale';

export const dynamic = 'force-static';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Every page in both languages, each naming its other-language version.
 * A sitemap needs full addresses: without KBACH_DOCS_URL (see lib/content.ts)
 * it lists nothing.
 */
export function GET() {
  // each page without its language (/ is the home page), then once per language
  const paths = SITE ? ['/', ...allSlugs().map((slug) => '/' + slug)] : [];
  const url = (loc: string, p: string) => `  <url>
    <loc>${escape(SITE + loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escape(SITE + localHref(p, 'en'))}"/>
    <xhtml:link rel="alternate" hreflang="km" href="${escape(SITE + localHref(p, 'km'))}"/>
  </url>`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.flatMap((p) => [url(localHref(p, 'en'), p), url(localHref(p, 'km'), p)]).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
