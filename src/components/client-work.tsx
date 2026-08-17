import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, FEATURED_WORK, PROFILE } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { firstParagraph, section } from '../lib/markdown';
import { Layout } from './layout';
import { Chips, CompactEntry, ENTRY_TITLE, Facts, LEAD, PAGE_TITLE, Prose, QUIET_LINK, Section, engagementFacts } from './ui';

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
      <h1 className={PAGE_TITLE}>{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-11">
        {FEATURED_WORK.map((engagement) => {
          const entry = section(doc, engagement.id);
          if (!entry) return null;

          return (
            <li className="border-t border-line py-7 first:border-t-0 first:pt-1" key={engagement.id}>
              <h2 className={ENTRY_TITLE}>
                {engagement.url ? (
                  <a className={QUIET_LINK} href={engagement.url}>
                    {entry.title}
                  </a>
                ) : (
                  entry.title
                )}
              </h2>
              {entry.subtitle && <p className="mb-2 text-muted">{entry.subtitle}</p>}

              <Facts items={engagementFacts(engagement, locale)} />

              <Prose html={entry.html} className="mb-4" />
              <Chips items={engagement.stack} />
            </li>
          );
        })}
      </ul>

      <Section title={t.alsoBuilt} id="rest">
        <ul>
          {rest.map((engagement) => {
            const entry = section(doc, engagement.id);
            if (!entry) return null;

            return (
              <CompactEntry
                key={engagement.id}
                title={entry.title}
                href={engagement.url}
                period={formatPeriod(engagement.start, engagement.end, locale)}
                role={entry.subtitle}
                html={firstParagraph(entry.html)}
              />
            );
          })}
        </ul>
      </Section>
    </Layout>
  );
}
