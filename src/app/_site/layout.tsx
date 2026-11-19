import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { pageInfos } from '../../lib/content';
import { LOCALES, type Locale } from '../../lib/locale';
import { LocaleProvider } from '../../lib/i18n';
import { RootDocument } from '../../components/site/RootDocument';
import { SiteDataProvider } from '../../components/site/SiteData';
import { Shell } from '../../components/site/Shell';

/** The languages the site is built in: /en and /km. */
export function langParams(): { lang: Locale }[] {
  return LOCALES.map((lang) => ({ lang }));
}

/** The address's first part as a language (anything else has no page). */
export function toLocale(lang: string): Locale {
  if (!(LOCALES as string[]).includes(lang)) notFound();
  return lang as Locale;
}

/**
 * Everything around a page, in one language: <html lang>, the page's
 * language and the docs' page names for the components, and the site's
 * header, menu and search (Shell). app/[lang]/layout.tsx is this.
 */
export function SiteLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <RootDocument locale={locale}>
      <LocaleProvider locale={locale}>
        <SiteDataProvider pages={pageInfos(locale)}>
          <Shell>{children}</Shell>
        </SiteDataProvider>
      </LocaleProvider>
    </RootDocument>
  );
}
