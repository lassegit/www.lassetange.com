import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, FEATURED_WORK, PROFILE } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { firstParagraph, section } from '../lib/markdown';
import { Layout } from './layout';
import { Chips, Prose, engagementFacts } from './ui';

/**
 * Six engagements in full, then the rest in one line each. Listing every one of twenty-three at the
 * same depth would bury the four that matter; hiding the other seventeen would misrepresent a decade
 * of freelancing. Depth for the ones worth reading about, completeness for everything else.
 */
export default function ClientWork({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'client-work');
  const rest = CLIENT_WORK.filter((engagement) => !engagement.featured);

  return (
    <Layout locale={locale} path="/client-work" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className="page-title">{doc.title}</h1>
      <Prose html={doc.lead} className="lead prose" />

      <ul className="entries section">
        {FEATURED_WORK.map((engagement) => {
          const entry = section(doc, engagement.id);
          if (!entry) return null;

          return (
            <li className="entry" key={engagement.id}>
              <h2 className="entry-title">{engagement.url ? <a href={engagement.url}>{entry.title}</a> : entry.title}</h2>
              {entry.subtitle && <p className="entry-role">{entry.subtitle}</p>}

              <p className="entry-meta">
                {engagementFacts(engagement, locale).map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </p>

              <Prose html={entry.html} className="prose entry-body" />
              <Chips items={engagement.stack} />
            </li>
          );
        })}
      </ul>

      <section className="section" aria-labelledby="rest-title">
        <h2 className="section-title" id="rest-title">
          {t.alsoBuilt}
        </h2>
        <ul className="entries">
          {rest.map((engagement) => {
            const entry = section(doc, engagement.id);
            if (!entry) return null;

            return (
              <li className="cv-entry" key={engagement.id}>
                <div className="cv-entry-head">
                  <h3 className="cv-entry-title">{engagement.url ? <a href={engagement.url}>{entry.title}</a> : entry.title}</h3>
                  <span className="cv-entry-period">{formatPeriod(engagement.start, engagement.end, locale)}</span>
                </div>
                {entry.subtitle && <p className="cv-entry-role">{entry.subtitle}</p>}
                <p className="cv-entry-body" dangerouslySetInnerHTML={{ __html: firstParagraph(entry.html) }} />
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}
