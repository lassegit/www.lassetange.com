import type { ErrorPageProps } from '@rshono/core';
import { PROFILE } from '../lib/data';
import { canonicalPath, dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';

export default function ServerError({ url, error }: ErrorPageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);

  return (
    <Layout locale={locale} path={canonicalPath(url.pathname)} title={`${t.errorTitle} — ${PROFILE.name}`} noIndex>
      <p className="error-code">500</p>
      <h1 className="page-title">{t.errorTitle}</h1>
      <p className="lead">{error.message}</p>
      {/* Present in development only — the framework redacts the stack in production. */}
      {error.stack && <pre className="error-detail">{error.stack}</pre>}
      <p className="section">
        <a href={localePath('/', locale)}>
          {t.backHome} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
