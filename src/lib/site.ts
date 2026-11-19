// Where the docs live, in one place: the repository (for "Edit this page"
// and "Report an issue") and each page's source file in it.
import { hrefFor, type DocPage } from './docs';

export const GITHUB = 'https://github.com/semsakadanupol/kbach';
export const LICENSE_URL = GITHUB + '/blob/main/LICENSE';
export const ISSUES_URL = GITHUB + '/issues';

type PageRef = Pick<DocPage, 'slug' | 'locale' | 'fallback'>;

/** The page's Markdown file, as a path in the repository. */
export function sourcePath(page: PageRef): string {
  return 'apps/kbach-docs/content/' + (page.locale === 'km' && !page.fallback ? 'km/' : '') + page.slug + '.md';
}

/** GitHub's editor for the page's Markdown file. */
export function editUrl(page: PageRef): string {
  return GITHUB + '/edit/main/' + sourcePath(page);
}

/** A new issue about the page, its title and address filled in. */
export function issueUrl(page: PageRef & Pick<DocPage, 'title'>): string {
  const title = 'Docs: ' + page.title;
  const body = 'Page: ' + hrefFor(page.slug, page.locale) + '\n\n';
  return ISSUES_URL + '/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
}
