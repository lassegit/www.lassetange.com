import type { ErrorPageProps } from '@rshono/core';
import { PROFILE } from '../lib/data';
import { canonicalPath, dictionary, localeFromPath, localePath } from '../lib/i18n';
import { Layout } from './layout';
import { LEAD, LINK, PAGE_TITLE } from './ui';

export default function ServerError({ url, error }: ErrorPageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);

  return (
    <Layout locale={locale} path={canonicalPath(url.pathname)} title={`${t.errorTitle} — ${PROFILE.name}`} noIndex>
      <p className="mb-2 font-mono text-sm text-muted">500</p>
      <h1 className={PAGE_TITLE}>{t.errorTitle}</h1>
      <p className={LEAD}>{error.message}</p>
      {/* Present in development only — the framework redacts the stack in production. */}
      {error.stack && (
        <pre className="mt-6 overflow-x-auto rounded-md border border-line bg-surface p-4 font-mono text-xs whitespace-pre-wrap">
          {error.stack}
        </pre>
      )}
      <p className="mt-11">
        <a className={LINK} href={localePath('/', locale)}>
          {t.backHome} <span aria-hidden="true">→</span>
        </a>
      </p>
    </Layout>
  );
}
