import { HomeRoute, homeMetadata } from '../_site/pages';
import { toLocale } from '../_site/layout';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return homeMetadata(toLocale((await params).lang));
}

export default function Page() {
  return <HomeRoute />;
}
