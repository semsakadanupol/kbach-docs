import { searchJson } from '../_site/pages';

// What the search box looks through (/search.json), built once with the site.
export const dynamic = 'force-static';

export function GET() {
  return searchJson();
}
