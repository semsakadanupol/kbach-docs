import { DocRoute, docMetadata, docParams } from '../_site/pages';

// One page per file in content/, at /<slug>. Built ahead of time; any other
// address is the 404 page. (The static routes beside it, /playground,
// /search.json, /sitemap.xml and the rest, win over a slug.)
export const dynamicParams = false;
export const generateStaticParams = docParams;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return docMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <DocRoute slug={(await params).slug} />;
}
