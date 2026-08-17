import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, OPEN_SOURCE, PRODUCTS, PROFILE, countryName } from '../lib/data';
import { dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';
import { Prose } from './ui';

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
    image: new URL(PROFILE.socialImage, PROFILE.siteUrl).href,
    email: `mailto:${PROFILE.email}`,
    address: { '@type': 'PostalAddress', addressLocality: t.city, addressCountry: 'DK' },
    sameAs: [PROFILE.github, PROFILE.linkedin, ...PRODUCTS.map((product) => product.url)],
    knowsLanguage: t.fluencies.map((fluency) => fluency.name),
  };

  return (
    <Layout locale={locale} path="/" title={`${doc.title} — ${tagline}`} description={doc.description} jsonLd={jsonLd}>
      {/* `alt=""`: the name is in the `<h1>` right beside it, so describing the portrait would only
          make a screen reader say it twice. */}
      <div className="hero">
        <img
          className="hero-photo"
          src={PROFILE.photo}
          width={PROFILE.photoWidth}
          height={PROFILE.photoHeight}
          alt=""
          fetchPriority="high"
        />
        <div className="hero-body">
          <h1>{PROFILE.name}</h1>
          <p className="hero-tagline">{tagline}</p>
          <p className="hero-place">
            {t.basedIn} {t.city}, {countryName('copenhagen', locale)}
          </p>
        </div>
      </div>

      <Prose html={doc.lead} className="lead prose" />

      {doc.sections.map((entry) => (
        <section className="section" key={entry.id} aria-labelledby={`${entry.id}-title`}>
          <h2 className="section-title" id={`${entry.id}-title`}>
            {entry.title}
          </h2>
          <Prose html={entry.html} />
        </section>
      ))}

      <nav className="section" aria-label={t.sections}>
        <ul className="cards">
          {destinations.map((destination) => (
            <li key={destination.path}>
              <a className="card" href={localePath(destination.path, locale)}>
                <span className="card-title">{destination.label}</span>
                <span className="card-note">{destination.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Layout>
  );
}
