import type { PageProps } from '@rshono/core';
import { PROFILE } from '../lib/data';
import { canonicalPath, dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';

export default function NotFound({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);

  return (
    <Layout locale={locale} path={canonicalPath(url.pathname)} title={`${t.notFoundTitle} — ${PROFILE.name}`} noIndex>
      <p className="error-code">404</p>
      <h1 className="page-title">{t.notFoundTitle}</h1>
      <p className="lead">{t.notFoundBody}</p>
      <p className="section">
        <a href={localePath('/', locale)}>
          {t.backHome} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
