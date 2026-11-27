import type { ReactNode } from 'react';
import '../../app/globals.css';
import '../../styles/motion.css';
import '../../styles/editor.css';

// Runs before the first paint, so a dark-mode reader never sees a flash of
// the light page, and the tab icon matches the browser's theme. It makes the
// tab icon and the phone browser's bar color itself: tags React drew and this
// script then changed, React no longer knows as its own, and it added copies.
const BEFORE_PAINT = `
(function () {
  var head = document.head;
  try {
    var icon = document.createElement('link');
    icon.id = 'kb-icon';
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.setAttribute('sizes', '64x64');
    var browserDark = matchMedia('(prefers-color-scheme: dark)');
    var setIcon = function () {
      icon.href = browserDark.matches ? '/kbach-icon-64.png' : '/kbach-icon-light-64.png';
    };
    setIcon();
    head.appendChild(icon);
    browserDark.addEventListener('change', setIcon);
  } catch (e) {}
  // the saved theme: the same key @kbach/react uses
  var dark = false;
  try {
    var saved = localStorage.getItem('kbach-theme');
    dark = saved === 'dark' || ((!saved || saved === 'system') && matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) {}
  document.documentElement.classList.add(dark ? 'dark' : 'light');
  var bar = document.createElement('meta');
  bar.name = 'theme-color';
  bar.content = dark ? '#1a2125' : '#faf7f0';
  head.appendChild(bar);
})();
`;

// Before the first paint, for the scroll reveal (components/scrollReveal.ts): marks the page
// so motion.css keeps its blocks hidden until the reveal plays them in, the ones on the first
// screen included, without showing them first. Not for reduced motion or a browser the reveal
// can't run in. If the reveal never takes over (its script failed), everything shows after 3s.
const REVEAL_BEFORE_PAINT = `
(function () {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
    var html = document.documentElement;
    html.setAttribute('data-kb-reveal', 'wait');
    setTimeout(function () {
      if (html.getAttribute('data-kb-reveal') === 'wait') html.removeAttribute('data-kb-reveal');
    }, 3000);
  } catch (e) {}
})();
`;

/**
 * The page around everything: <html>, the fonts, the tab icon and the theme.
 * Used by the root layout (app/layout.tsx) and by the 404 page.
 */
export function RootDocument({ children }: { children: ReactNode }) {
  return (
    // the theme script sets a class on <html> before React starts
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* the tab icon and the bar color come from the script; without JavaScript, the light icon */}
        <noscript>
          <link rel="icon" type="image/png" sizes="64x64" href="/kbach-icon-light-64.png" />
        </noscript>
        <link rel="apple-touch-icon" href="/kbach-logo-256.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BEFORE_PAINT }} />
      </head>
      <body className="bg-page">{children}</body>
    </html>
  );
}
