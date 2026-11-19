import { SITE } from '../../lib/content';

export const dynamic = 'force-static';

export function GET() {
  return new Response('User-agent: *\nAllow: /\n' + (SITE ? '\nSitemap: ' + SITE + '/sitemap.xml\n' : ''), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
