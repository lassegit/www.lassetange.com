import type { ReactNode } from 'react';
import '../styles.css';
import { PROFILE } from '../lib/data';
import { LOCALES, LOCALE_TAGS, dictionary, localePath, type Locale } from '../lib/i18n';
import { Footer } from './footer';
import { Header } from './header';
import { Shell } from './ui';

export interface LayoutProps {
  locale: Locale;
  /** The page's canonical (unprefixed) path, e.g. `/products`. Drives the tabs, canonical and hreflang. */
  path: string;
  /** The full `<title>`, composed by the page. */
  title: string;
  description?: string;
  /** Set on the 404 and 500 pages, which should not enter an index. */
  noIndex?: boolean;
  /** Structured data for this page, serialised into a JSON-LD script. */
  jsonLd?: object;
  children: ReactNode;
}

/**
 * The document every page renders through: head, skip link, header, main, footer.
 *
 * The head is where the multilingual part of the site becomes visible to machines — a canonical URL
 * per language, `hreflang` alternates in all three plus `x-default`, and `og:locale` — so the Danish,
 * English and German versions of a page are understood as the same page rather than as duplicates.
 */
export function Layout({ locale, path, title, description, noIndex, jsonLd, children }: LayoutProps) {
  const t = dictionary(locale);
  const canonical = new URL(localePath(path, locale), PROFILE.siteUrl).href;

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {noIndex && <meta name="robots" content="noindex, follow" />}

        {/* A 404 has no canonical form and no translations — claiming otherwise would invite a crawler
            to index three copies of an error. */}
        {!noIndex && (
          <>
            <link rel="canonical" href={canonical} />
            {LOCALES.map((alternate) => (
              <link
                key={alternate}
                rel="alternate"
                hrefLang={alternate}
                href={new URL(localePath(path, alternate), PROFILE.siteUrl).href}
              />
            ))}
            <link rel="alternate" hrefLang="x-default" href={new URL(path, PROFILE.siteUrl).href} />
          </>
        )}

        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content={PROFILE.name} />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={LOCALE_TAGS[locale].replace('-', '_')} />
        <meta property="og:image" content={new URL(PROFILE.socialImage, PROFILE.siteUrl).href} />
        <meta name="twitter:card" content="summary" />

        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#131315" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      </head>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-base text-ink antialiased selection:bg-accent-soft">
        <a
          className="absolute top-2 left-5 z-10 -translate-y-[200%] rounded border border-line-strong bg-canvas px-3 py-2 text-ink no-underline focus:translate-y-0"
          href="#main"
        >
          {t.skipToContent}
        </a>
        <Header locale={locale} path={path} />
        <main className="flex-1 pt-10 pb-16 print:py-0" id="main">
          <Shell>{children}</Shell>
        </main>
        <Footer locale={locale} path={path} />
      </body>
    </html>
  );
}
