// Structured data (schema.org JSON-LD) for search engines. With it, Google
// can show "Kbach" as the site's name with its logo, and a docs page's
// place in the docs (Kbach Docs › Core concepts › Variants) instead of a bare
// address. Only written when the site's address is known (KBACH_DOCS_URL):
// every URL in it must be a full one.
import { SITE } from './content';
import { NAV, type DocPage } from './docs';
import { KM } from './km';
import { localHref, type Locale } from './locale';
import { GITHUB } from './site';
import { HOME_META, SITE_NAME } from './metadata';

const WEBSITE_ID = () => SITE + '/#website';
const ORG_ID = () => SITE + '/#organization';

/** The site itself: on the home pages (/en, /km) and on /. */
export function siteJsonLd(locale: Locale): object | null {
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
        description: HOME_META.en.description,
        inLanguage: ['en', 'km'],
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
        description: HOME_META[locale].description,
        url: SITE + localHref('/', locale),
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
  const { locale } = page;
  const name = (english: string) => (locale === 'km' ? (KM[english] ?? english) : english);
  const home = SITE + localHref('/', locale);
  const url = SITE + localHref('/' + page.slug, locale);
  // A section has no page of its own; its first page stands for it.
  const sectionFirst = NAV.find((s) => s.title === page.section)?.pages[0];
  const crumbs = [
    { name: SITE_NAME[locale], item: home },
    ...(sectionFirst && sectionFirst !== page.slug ? [{ name: name(page.section), item: SITE + localHref('/' + sectionFirst, locale) }] : []),
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
        inLanguage: locale,
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
