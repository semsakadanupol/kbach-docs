import { PlaygroundRoute, playgroundMetadata } from '../_site/pages';

export const metadata = playgroundMetadata();

export default function Page() {
  return <PlaygroundRoute />;
}
