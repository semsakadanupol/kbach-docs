import type { Metadata } from 'next';
import { pageInfos } from '../lib/content';
import { RootDocument } from '../components/site/RootDocument';
import { NotFoundSite } from '../components/site/NotFound';

// The 404 page, for any address the site has no page for (404.html in the
// build). It's outside the [lang] layout, so it brings its own <html>, and
// picks English or Khmer from the address in the browser.
export const metadata: Metadata = {
  title: 'Not found · Kbach Docs',
  description: 'This page does not exist.',
  robots: { index: false },
};

// An address from before every page had its language (/installation, from an
// old link): the same page in English, before anything shows. One with a
// language that still has no page stays here.
const ADD_LANGUAGE = `
if (!/^\\/(en|km)(\\/|$)/.test(location.pathname)) location.replace('/en' + location.pathname + location.search + location.hash);
`;

export default function GlobalNotFound() {
  return (
    <RootDocument locale="en">
      <script dangerouslySetInnerHTML={{ __html: ADD_LANGUAGE }} />
      <NotFoundSite pages={{ en: pageInfos('en'), km: pageInfos('km') }} />
    </RootDocument>
  );
}
