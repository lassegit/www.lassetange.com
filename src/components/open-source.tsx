import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { EXTENSIONS, OPEN_SOURCE, PROFILE } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { CompactEntry, LEAD, LINK, PAGE_TITLE, Prose } from './ui';

/** Projects I wrote and still maintain, each linked to wherever it actually lives. */
export default function OpenSource({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'open-source');

  return (
    <Layout locale={locale} path="/open-source" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className={PAGE_TITLE}>{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-11">
        {OPEN_SOURCE.map((project) => {
          const entry = section(doc, project.id);
          if (!entry) return null;

          // The extensions entry stands for three separate repositories, so it links to all three.
          const links =
            project.id === 'browser-extensions'
              ? EXTENSIONS
              : project.repo
                ? [{ ...project, name: t.sourceOnGithub, url: project.repo }]
                : [];

          return (
            <CompactEntry
              headingLevel={2}
              key={project.id}
              id={project.id}
              title={entry.title}
              href={project.url}
              role={entry.subtitle}
              html={entry.html}
              links={links}
            />
          );
        })}
      </ul>

      <p className="mt-11">
        <a className={LINK} href={PROFILE.github}>
          {t.moreOnGithub} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
