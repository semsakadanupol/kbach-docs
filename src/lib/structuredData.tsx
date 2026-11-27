// Structured data (schema.org JSON-LD) for search engines. With it, Google
// can show "Kbach" as the site's name with its logo, and a docs page's
// place in the docs (Kbach Docs › Core concepts › Variants) instead of a bare
// address. Only written when the site's address is known (KBACH_DOCS_URL):
// every URL in it must be a full one.
import { SITE } from './content';
import { NAV, hrefFor, type DocPage } from './docs';
import { GITHUB } from './site';
import { HOME_META, SITE_NAME } from './metadata';

const WEBSITE_ID = () => SITE + '/#website';
const ORG_ID = () => SITE + '/#organization';

/** The site itself: on the home page (/). */
export function siteJsonLd(): object | null {
  if (!SITE) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID(),
        url: SITE + '/',
        name: 'Kbach',
        alternateName: ['Kbach Docs', 'Kbach CSS'],
        description: HOME_META.description,
        inLanguage: 'en',
        publisher: { '@id': ORG_ID() },
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID(),
        name: 'Kbach',
        url: SITE + '/',
        logo: SITE + '/kbach-logo-256.png',
        sameAs: [GITHUB, 'https://www.npmjs.com/package/@kbach/react'],
      },
      {
        '@type': 'SoftwareSourceCode',
        name: 'Kbach',
        description: HOME_META.description,
        url: SITE + '/',
        codeRepository: GITHUB,
        programmingLanguage: ['Rust', 'TypeScript'],
        runtimePlatform: ['React', 'React Native', 'Web browser'],
        license: 'https://opensource.org/licenses/MIT',
        publisher: { '@id': ORG_ID() },
      },
    ],
  };
}

/** A docs page: where it sits in the docs, and the page as an article. */
export function docJsonLd(page: DocPage): object | null {
  if (!SITE) return null;
  const home = SITE + '/';
  const url = SITE + hrefFor(page.slug);
  // A section has no page of its own; its first page stands for it.
  const sectionFirst = NAV.find((s) => s.title === page.section)?.pages[0];
  const crumbs = [
    { name: SITE_NAME, item: home },
    ...(sectionFirst && sectionFirst !== page.slug ? [{ name: page.section, item: SITE + hrefFor(sectionFirst) }] : []),
    { name: page.title, item: url },
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
      },
      {
        '@type': 'TechArticle',
        headline: page.title,
        description: page.description,
        url,
        inLanguage: 'en',
        ...(page.updated && { dateModified: page.updated }),
        isPartOf: { '@id': WEBSITE_ID() },
        publisher: { '@id': ORG_ID() },
        image: SITE + '/og.png',
      },
    ],
  };
}

/** The <script> tag. `<` is escaped so page text can never close the tag early. */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
