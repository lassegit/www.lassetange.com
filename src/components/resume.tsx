import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, OPEN_SOURCE, PRODUCTS, PROFILE, countryName } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { firstParagraph, section } from '../lib/markdown';
import { Layout } from './layout';
import { PrintButton } from './print-button';
import { Prose, engagementFacts } from './ui';

/**
 * The whole CV on one page, in the order a recruiter reads: who, then what I have built, then who I
 * have built it for, then the tools, then the languages.
 *
 * This page is designed to leave the browser as a PDF. The print stylesheet drops the header, tabs,
 * footer and the print bar itself, switches to black on white, and keeps entries from breaking across
 * pages — so what comes out of “Save as PDF” is a document, not a screenshot of a website. It reuses
 * the same markdown as `/products` and `/client-work`, trimmed to each entry's opening paragraph, so
 * there is no second copy of the text to keep in sync.
 */
export default function Resume({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'resume');
  const products = content(locale, 'products');
  const clientWork = content(locale, 'client-work');
  const technologies = content(locale, 'technologies');
  const openSource = content(locale, 'open-source');
  const tagline = content(locale, 'home').meta.tagline ?? '';
  const profile = section(doc, 'profile');

  return (
    <Layout locale={locale} path="/resume" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <div className="print-bar">
        <PrintButton label={t.printResume} />
        <p className="print-hint">{t.printHint}</p>
      </div>

      <header className="cv-header">
        <img className="cv-photo" src={PROFILE.photo} width={PROFILE.photoWidth} height={PROFILE.photoHeight} alt="" />
        <div className="cv-identity">
          <h1>{PROFILE.name}</h1>
          <p className="hero-tagline">{tagline}</p>
          <ul className="cv-contact">
            <li>
              <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            </li>
            <li>
              <a href={PROFILE.siteUrl}>www.lassetange.com</a> · <a href={PROFILE.github}>github.com/lassegit</a> ·{' '}
              <a href={PROFILE.linkedin}>linkedin.com/in/lassetange</a>
            </li>
            <li>
              {t.city}, {countryName('copenhagen', locale)}
            </li>
          </ul>
        </div>
      </header>

      {profile && (
        <section className="section" aria-labelledby="cv-profile">
          <h2 className="section-title" id="cv-profile">
            {profile.title}
          </h2>
          <Prose html={profile.html} />
        </section>
      )}

      <section className="section" aria-labelledby="cv-products">
        <h2 className="section-title" id="cv-products">
          {t.navProducts}
        </h2>
        <ul className="entries">
          {PRODUCTS.map((product) => {
            const entry = section(products, product.id);
            if (!entry) return null;

            return (
              <li className="cv-entry" key={product.id}>
                <div className="cv-entry-head">
                  <h3 className="cv-entry-title">
                    <a href={product.url}>{entry.title}</a>
                  </h3>
                  <span className="cv-entry-period">{formatPeriod(product.start, undefined, locale)}</span>
                </div>
                <p className="cv-entry-role">
                  {entry.subtitle}
                  {product.profitable && ` · ${t.profitable}`}
                </p>
                <p className="cv-entry-body" dangerouslySetInnerHTML={{ __html: firstParagraph(entry.html) }} />
                <p className="cv-entry-stack">{product.stack.join(' · ')}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section" aria-labelledby="cv-work">
        <h2 className="section-title" id="cv-work">
          {t.navClientWork}
        </h2>
        <ul className="entries">
          {CLIENT_WORK.map((engagement) => {
            const entry = section(clientWork, engagement.id);
            if (!entry) return null;

            return (
              <li className="cv-entry" key={engagement.id}>
                <div className="cv-entry-head">
                  <h3 className="cv-entry-title">{engagement.url ? <a href={engagement.url}>{entry.title}</a> : entry.title}</h3>
                  <span className="cv-entry-period">{formatPeriod(engagement.start, engagement.end, locale)}</span>
                </div>
                {/* Role first — it is what a reader scans for. The period is already on the line above,
                    so `slice(1)` drops it and leaves place and agency. */}
                <p className="cv-entry-role">{[entry.subtitle ?? [], engagementFacts(engagement, locale).slice(1)].flat().join(' · ')}</p>
                <p className="cv-entry-body" dangerouslySetInnerHTML={{ __html: firstParagraph(entry.html) }} />
                <p className="cv-entry-stack">{engagement.stack.join(' · ')}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section" aria-labelledby="cv-technologies">
        <h2 className="section-title" id="cv-technologies">
          {t.navTechnologies}
        </h2>
        <ul className="groups">
          {technologies.sections.map((group) => (
            <li className="group" key={group.id}>
              <h3 className="group-title">{group.title}</h3>
              <Prose html={group.html} className="group-list" />
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="cv-languages">
        <h2 className="section-title" id="cv-languages">
          {t.spokenLanguages}
        </h2>
        <ul className="cv-facts">
          {t.fluencies.map((fluency) => (
            <li key={fluency.name}>
              <span className="cv-fact-label">{fluency.name}</span> — {fluency.level}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="cv-open-source">
        <h2 className="section-title" id="cv-open-source">
          {t.navOpenSource}
        </h2>
        <ul className="entries">
          {OPEN_SOURCE.map((project) => {
            const entry = section(openSource, project.id);
            if (!entry) return null;

            return (
              <li className="cv-entry" key={project.id}>
                <div className="cv-entry-head">
                  <h3 className="cv-entry-title">
                    <a href={project.url}>{entry.title}</a>
                  </h3>
                </div>
                <p className="cv-entry-body" dangerouslySetInnerHTML={{ __html: firstParagraph(entry.html) }} />
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}
