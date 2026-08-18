import type { ReactNode } from 'react';
import '../styles.css';
import { content } from '../lib/content';
import { PROFILE, SOCIAL_CARD, socialCardPath } from '../lib/data';
import { LOCALES, LOCALE_TAGS, dictionary, localePath, type Locale } from '../lib/i18n';
import { Footer } from './footer';
import { Header } from './header';
import { Shell } from './ui';

/** Open Graph writes a locale as `da_DK`, where the rest of the web writes `da-DK`. */
function ogLocale(locale: Locale): string {
  return LOCALE_TAGS[locale].replace('-', '_');
}

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
 * per language, `hreflang` alternates in all three plus `x-default`, `og:locale` and a share card in
 * the reader's own language — so the Danish, English and German versions of a page are understood as
 * the same page rather than as duplicates.
 */
export function Layout({ locale, path, title, description, noIndex, jsonLd, children }: LayoutProps) {
  const t = dictionary(locale);
  const canonical = new URL(localePath(path, locale), PROFILE.siteUrl).href;
  const card = new URL(socialCardPath(locale), PROFILE.siteUrl).href;

  /** What the card actually shows. Taking the tagline from the same place the generator takes it
   *  keeps the description of the image and the image itself from drifting apart. */
  const cardAlt = [PROFILE.name, content(locale, 'home').meta.tagline].filter(Boolean).join(' — ');

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
        <meta property="og:locale" content={ogLocale(locale)} />
        {LOCALES.filter((alternate) => alternate !== locale).map((alternate) => (
          <meta key={alternate} property="og:locale:alternate" content={ogLocale(alternate)} />
        ))}

        {/* The card rather than the portrait, and its size spelled out — see {@link SOCIAL_CARD}.
            `secure_url` says nothing new on a site that is https-only, but LinkedIn's parser is old
            enough to look for it, and a duplicated URL is a cheap way to be legible to it. */}
        <meta property="og:image" content={card} />
        <meta property="og:image:secure_url" content={card} />
        <meta property="og:image:type" content={SOCIAL_CARD.type} />
        <meta property="og:image:width" content={String(SOCIAL_CARD.width)} />
        <meta property="og:image:height" content={String(SOCIAL_CARD.height)} />
        <meta property="og:image:alt" content={cardAlt} />

        {/* `summary_large_image` is the 1.91:1 card; plain `summary` would ask for a square one and
            get the middle of this cropped out. Slack and the rest read these as a fallback too. */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={card} />
        <meta name="twitter:image:alt" content={cardAlt} />

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
