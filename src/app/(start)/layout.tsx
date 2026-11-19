import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// The site's root address, /, on its own: every page is under its language
// (/en, /km), so / only sends the reader on (page.tsx). Its own root layout,
// next to app/[lang]/layout.tsx.
export const metadata: Metadata = {
  title: 'Kbach Docs',
  description: 'Style React, React Native and plain HTML with short class names, from one Rust engine.',
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
