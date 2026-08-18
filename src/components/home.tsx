import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, OPEN_SOURCE, PRODUCTS, PROFILE, countryName } from '../lib/data';
import { dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';
import { LEAD, Prose, Section } from './ui';

/**
 * The front page answers “who is this and should I keep reading?” before anything else: a photo, a
 * name, a role, and a lead paragraph. Everything below it is prose, and the cards at the foot restate
 * the tabs for a reader who has just finished reading and is looking for where to go next.
 */
export default function Home({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'home');
  const tagline = doc.meta.tagline ?? '';

  const destinations = [
    { path: '/products', label: t.navProducts, note: `${PRODUCTS.length} ${t.productsNoun}` },
    { path: '/client-work', label: t.navClientWork, note: `${CLIENT_WORK.length} ${t.engagementsNoun}` },
    { path: '/technologies', label: t.navTechnologies, note: `${content(locale, 'technologies').sections.length} ${t.areasNoun}` },
    { path: '/open-source', label: t.navOpenSource, note: `${OPEN_SOURCE.length} ${t.projectsNoun}` },
    { path: '/resume', label: t.navResume, note: t.fullHistory },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: tagline,
    url: PROFILE.siteUrl,
    image: new URL(PROFILE.portrait, PROFILE.siteUrl).href,
    email: `mailto:${PROFILE.email}`,
    address: { '@type': 'PostalAddress', addressLocality: t.city, addressCountry: 'DK' },
    sameAs: [PROFILE.github, PROFILE.linkedin, ...PRODUCTS.map((product) => product.url)],
    knowsLanguage: t.fluencies.map((fluency) => fluency.name),
  };

  return (
    <Layout locale={locale} path="/" title={`${doc.title} — ${tagline}`} description={doc.description} jsonLd={jsonLd}>
      {/* `alt=""`: the name is in the `<h1>` right beside it, so describing the portrait would only
          make a screen reader say it twice. */}
      <div className="mb-8 flex flex-wrap items-start gap-6">
        <img
          className="size-30 flex-none rounded-full bg-surface object-cover object-[50%_5%]"
          src={PROFILE.photo}
          width={PROFILE.photoWidth}
          height={PROFILE.photoHeight}
          alt=""
          fetchPriority="high"
        />
        <div className="flex-1 basis-64">
          <h1 className="text-display font-semibold text-balance">{PROFILE.name}</h1>
          <p className="mt-1 text-lg text-muted">{tagline}</p>
          <p className="mt-2 text-sm text-muted">
            <span role="img" aria-label="Location pin">
              📍
            </span>
            {t.basedIn} {t.city}, {countryName('copenhagen', locale)}
          </p>
        </div>
      </div>

      <Prose html={doc.lead} className={LEAD} />

      {doc.sections.map((entry) => (
        <Section title={entry.title} id={entry.id} key={entry.id}>
          <Prose html={entry.html} />
        </Section>
      ))}

      <nav className="mt-11" aria-label={t.sections}>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3">
          {destinations.map((destination) => (
            <li key={destination.path}>
              <a
                className="block h-full rounded-md border border-line px-4 py-3.5 no-underline hover:border-line-strong hover:bg-surface"
                href={localePath(destination.path, locale)}
              >
                <span className="font-semibold text-accent">{destination.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{destination.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Layout>
  );
}
