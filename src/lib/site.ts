// Where things live, in one place: Kbach's repository (the GitHub links, the
// license, issues about Kbach), the docs' own repository ("Edit this page"
// and a page's "Report an issue") and each page's source file in it.
import { hrefFor, type DocPage } from './docs';

export const GITHUB = 'https://github.com/semsakadanupol/kbach';
export const LICENSE_URL = GITHUB + '/blob/main/LICENSE';
export const ISSUES_URL = GITHUB + '/issues';
/** The docs' own repository (split out of Kbach's on 2026-11-25). */
export const DOCS_REPO = 'https://github.com/semsakadanupol/kbach-docs';

type PageRef = Pick<DocPage, 'slug' | 'locale' | 'fallback'>;

/** The page's Markdown file, as a path in the docs repository. */
export function sourcePath(page: PageRef): string {
  return 'content/' + (page.locale === 'km' && !page.fallback ? 'km/' : '') + page.slug + '.md';
}

/** GitHub's editor for the page's Markdown file. */
export function editUrl(page: PageRef): string {
  return DOCS_REPO + '/edit/main/' + sourcePath(page);
}

/** A new issue about the page, its title and address filled in. */
export function issueUrl(page: PageRef & Pick<DocPage, 'title'>): string {
  const title = 'Docs: ' + page.title;
  const body = 'Page: ' + hrefFor(page.slug, page.locale) + '\n\n';
  return DOCS_REPO + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
}
