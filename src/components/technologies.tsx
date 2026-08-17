import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PROFILE } from '../lib/data';
import { localeFromPath } from '../lib/i18n';
import { Layout } from './layout';
import { LEAD, PAGE_TITLE, Prose, TechList } from './ui';

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
      <h1 className={PAGE_TITLE}>{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-x-8 gap-y-7">
        {doc.sections.map((group) => (
          <li className="break-inside-avoid" key={group.id}>
            <h2 className="mb-2.5 border-b border-line pb-1.5 text-base font-semibold">{group.title}</h2>
            <TechList html={group.html} />
          </li>
        ))}
      </ul>
    </Layout>
  );
}
