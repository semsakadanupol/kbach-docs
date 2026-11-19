import { searchJson } from '../../_site/pages';
import { langParams, toLocale } from '../../_site/layout';

// What the search box looks through (/en/search.json, /km/search.json), built once with the site.
export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = langParams;

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  return searchJson(toLocale((await params).lang));
}
