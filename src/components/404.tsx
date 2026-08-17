import type { PageProps } from '@rshono/core';
import { PROFILE } from '../lib/data';
import { canonicalPath, dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';
import { LEAD, LINK, PAGE_TITLE } from './ui';

export default function NotFound({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);

  return (
    <Layout locale={locale} path={canonicalPath(url.pathname)} title={`${t.notFoundTitle} — ${PROFILE.name}`} noIndex>
      <p className="mb-2 font-mono text-sm text-muted">404</p>
      <h1 className={PAGE_TITLE}>{t.notFoundTitle}</h1>
      <p className={LEAD}>{t.notFoundBody}</p>
      <p className="mt-11">
        <a className={LINK} href={localePath('/', locale)}>
          {t.backHome} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
