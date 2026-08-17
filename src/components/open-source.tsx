import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { EXTENSIONS, OPEN_SOURCE, PROFILE } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { Prose } from './ui';

/** Projects I wrote and still maintain, each linked to wherever it actually lives. */
export default function OpenSource({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'open-source');

  return (
    <Layout locale={locale} path="/open-source" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className="page-title">{doc.title}</h1>
      <Prose html={doc.lead} className="lead prose" />

      <ul className="entries section">
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
            <li className="entry" key={project.id}>
              <h2 className="entry-title">
                <a href={project.url}>{entry.title}</a>
              </h2>
              {entry.subtitle && <p className="entry-role">{entry.subtitle}</p>}
              <Prose html={entry.html} className="prose entry-body" />

              {links.length > 0 && (
                <ul className="entry-links">
                  {links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url}>
                        {link.name} <span aria-hidden="true">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <p className="section">
        <a href={PROFILE.github}>
          {t.moreOnGithub} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
