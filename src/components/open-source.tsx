import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { EXTENSIONS, OPEN_SOURCE, PROFILE } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { ENTRY_TITLE, LEAD, LINK, PAGE_TITLE, Prose, QUIET_LINK } from './ui';

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
            <li className="border-t border-line py-7 first:border-t-0 first:pt-1" key={project.id}>
              <h2 className={ENTRY_TITLE}>
                <a className={QUIET_LINK} href={project.url}>
                  {entry.title}
                </a>
              </h2>
              {entry.subtitle && <p className="mb-2 text-muted">{entry.subtitle}</p>}
              <Prose html={entry.html} />

              {links.length > 0 && (
                <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                  {links.map((link) => (
                    <li key={link.url}>
                      <a className={LINK} href={link.url}>
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

      <p className="mt-11">
        <a className={LINK} href={PROFILE.github}>
          {t.moreOnGithub} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
