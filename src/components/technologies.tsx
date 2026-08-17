import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PROFILE } from '../lib/data';
import { localeFromPath } from '../lib/i18n';
import { Layout } from './layout';
import { Prose } from './ui';

/**
 * Seven groups, each a markdown list. There is no structured data behind this page: the group names
 * and half the entries are phrases rather than product names, so the whole thing translates, and the
 * markdown file is the single source for it.
 */
export default function Technologies({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const doc = content(locale, 'technologies');

  return (
    <Layout locale={locale} path="/technologies" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className="page-title">{doc.title}</h1>
      <Prose html={doc.lead} className="lead prose" />

      <ul className="groups section">
        {doc.sections.map((group) => (
          <li className="group" key={group.id}>
            <h2 className="group-title">{group.title}</h2>
            <Prose html={group.html} className="group-list" />
          </li>
        ))}
      </ul>
    </Layout>
  );
}
