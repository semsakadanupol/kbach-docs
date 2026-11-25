import Link from 'next/link';
import { LANGUAGE_KEY } from '../../lib/locale';
import { JsonLd, siteJsonLd } from '../../lib/structuredData';

// / → /en or /km, before anything shows: the language the reader used last
// (components/site/Shell.tsx remembers it), else Khmer when the browser asks
// for it, else English. A static site has no server to redirect, so the page
// does it; without JavaScript the meta refresh goes to /en.
const PICK = `
(function () {
  var lang = 'en';
  try {
    var saved = localStorage.getItem('${LANGUAGE_KEY}');
    if (saved === 'en' || saved === 'km') lang = saved;
    else if ((navigator.languages || [navigator.language]).some(function (l) { return /^km/i.test(l); })) lang = 'km';
  } catch (e) {}
  location.replace('/' + lang + location.search + location.hash);
})();
`;

export default function Start() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/en" />
      <JsonLd data={siteJsonLd('en')} />
      <script dangerouslySetInnerHTML={{ __html: PICK }} />
      <p>
        <Link href="/en">Kbach docs in English</Link> · <Link href="/km" lang="km">ឯកសារ Kbach ជាភាសាខ្មែរ</Link>
      </p>
    </>
  );
}
