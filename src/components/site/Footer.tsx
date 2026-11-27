'use client';

import { KBACH_VERSION, NAV } from '../../lib/docs';
import { GITHUB, ISSUES_URL, LICENSE_URL } from '../../lib/site';
import { Logo } from '../Logo';
import { SiteLink } from '../SiteLink';
import { GitHubIcon } from '../icons';
import { BrandIcon, type Brand, type Tool } from '../BrandIcon';

// (section titles and pages, as the footer renders them)
const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: 'Documentation', links: NAV.map((s) => ({ label: s.title, href: '/' + s.pages[0] })) },
  {
    title: 'Packages',
    links: [
      { label: '@kbach/react', href: 'https://www.npmjs.com/package/@kbach/react' },
      { label: '@kbach/react-native', href: 'https://www.npmjs.com/package/@kbach/react-native' },
      { label: '@kbach/browser', href: 'https://www.npmjs.com/package/@kbach/browser' },
      { label: '@kbach/cli', href: 'https://www.npmjs.com/package/@kbach/cli' },
      { label: 'VS Code extension', href: 'https://marketplace.visualstudio.com/items?itemName=kbach.kbach-vscode' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: GITHUB },
      { label: 'Report an issue', href: ISSUES_URL + '/new' },
      { label: 'Playground', href: '/playground' },
    ],
  },
];

/** What this site is built with, and what each does here (the link's tooltip). */
const BUILT_WITH: { name: string; does: string; href: string; icon?: Brand | Tool }[] = [
  { name: 'Kbach', does: 'Every style on this site', href: '/introduction' },
  { name: 'Next.js', does: 'The pages, exported as static files', href: 'https://nextjs.org', icon: 'nextjs' },
  { name: 'React', does: 'The interface', href: 'https://react.dev', icon: 'react' },
  { name: 'TypeScript', does: 'The code, and the playground’s type checking', href: 'https://www.typescriptlang.org', icon: 'typescript' },
  { name: 'CodeMirror', does: 'The playground’s editor', href: 'https://codemirror.net', icon: 'codemirror' },
  { name: 'Prettier', does: 'Format, in the playground', href: 'https://prettier.io', icon: 'prettier' },
  { name: 'Vercel', does: 'Hosting', href: 'https://vercel.com', icon: 'vercel' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line pt-12 pb-12 text-[13px] leading-6 text-faint">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 lg:col-span-1">
          <SiteLink href="/" className="inline-flex items-center gap-2.5">
            <Logo source={64} shown={32} className="size-8 rounded-lg ring-1 ring-gold/30" />
            <span className="font-display text-lg font-semibold text-ink">Kbach</span>
          </SiteLink>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">Style React, React Native and plain HTML with short class names, from one Rust engine.</p>
          <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="Kbach on GitHub" className="mt-4 -ml-1.5 grid size-8 place-items-center rounded-lg text-base text-muted transition-colors hover:bg-raised hover:text-ink active:bg-raised active:text-ink">
            <GitHubIcon />
          </a>
        </div>
        {FOOTER_LINKS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold tracking-[0.08em] text-ink uppercase">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  {/^https?:/.test(l.href) ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-muted transition-colors hover:text-accent active:text-accent">
                      {l.label}
                    </a>
                  ) : (
                    <SiteLink href={l.href} className="text-sm text-muted transition-colors hover:text-accent active:text-accent">
                      {l.label}
                    </SiteLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-6">
        <p>
          Copyright © 2026 semsakadanupol.{' '}
          <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-accent active:text-accent">
            Released under the MIT License.
          </a>
        </p>
        <p className="font-mono text-xs">@kbach/react {KBACH_VERSION}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-xs font-semibold tracking-[0.08em] text-ink uppercase">Built with</p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Built with">
          {BUILT_WITH.map((b) => {
            const link = `inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent active:text-accent`;
            const label = (
              <>
                {b.icon ? <BrandIcon brand={b.icon} className="text-[13px]" /> : <Logo source={32} shown={14} className="size-3.5 rounded-sm" />}
                {b.name}
              </>
            );
            const title = b.name + ': ' + b.does;
            return (
              <li key={b.name}>
                {b.href.startsWith('/') ? (
                  <SiteLink href={b.href} title={title} className={link}>
                    {label}
                  </SiteLink>
                ) : (
                  <a href={b.href} target="_blank" rel="noreferrer" title={title} className={link}>
                    {label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 max-w-3xl">
        Tailwind CSS is a trademark of Tailwind Labs Inc. Kbach is an independent project and is not affiliated with, sponsored by, or endorsed by Tailwind Labs.
      </p>
    </footer>
  );
}
