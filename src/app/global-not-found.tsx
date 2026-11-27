import type { Metadata } from 'next';
import { pageInfos } from '../lib/content';
import { RootDocument } from '../components/site/RootDocument';
import { NotFoundSite } from '../components/site/NotFound';

// The 404 page, for any address the site has no page for (404.html in the
// build). It's outside the root layout, so it brings its own <html>.
export const metadata: Metadata = {
  title: 'Not found · Kbach Docs',
  description: 'This page does not exist.',
  robots: { index: false },
};

// An old address, before anything shows: the pages were under /en and /km
// from 2026-11-19 to 2026-11-27 (/en/installation, /km/installation): those go
// to the page without it, keeping ?tab and #section. vercel.json redirects
// them on the live site; this covers any other host. Anything else stays here.
const DROP_LANGUAGE = `
var page = location.pathname.replace(/^\\/(en|km)(?=\\/|$)/, '') || '/';
if (page !== location.pathname) location.replace(page + location.search + location.hash);
`;

export default function GlobalNotFound() {
  return (
    <RootDocument>
      <script dangerouslySetInnerHTML={{ __html: DROP_LANGUAGE }} />
      <NotFoundSite pages={pageInfos()} />
    </RootDocument>
  );
}
