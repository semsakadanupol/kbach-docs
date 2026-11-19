import { DocRoute, docMetadata, docParams } from '../../_site/pages';
import { toLocale } from '../../_site/layout';

// One page per file in content/, in each language (Khmer from content/km/
// where it has the page, else the English text). Built ahead of time; any
// other address is the 404 page.
export const dynamicParams = false;
export const generateStaticParams = docParams;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  return docMetadata(slug, toLocale(lang));
}

export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  return <DocRoute slug={slug} locale={toLocale(lang)} />;
}
