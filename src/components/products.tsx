import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PRODUCTS, PROFILE } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { Chips, Prose } from './ui';

/** The four products I built and run myself — structure from `data.ts`, prose from the locale's markdown. */
export default function Products({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'products');

  return (
    <Layout locale={locale} path="/products" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className="page-title">{doc.title}</h1>
      <Prose html={doc.lead} className="lead prose" />

      <ul className="entries section">
        {PRODUCTS.map((product) => {
          const entry = section(doc, product.id);
          if (!entry) return null;

          return (
            <li className="entry" key={product.id}>
              <h2 className="entry-title">
                <a href={product.url}>{entry.title}</a>
              </h2>
              {entry.subtitle && <p className="entry-role">{entry.subtitle}</p>}

              <p className="entry-meta">
                <span>{formatPeriod(product.start, undefined, locale)}</span>
                {product.profitable && <span className="badge">{t.profitable}</span>}
              </p>

              <Prose html={entry.html} className="prose entry-body" />
              <Chips items={product.stack} />

              <ul className="entry-links">
                <li>
                  <a href={product.url}>
                    {t.visitSite} <span aria-hidden="true">→</span>
                  </a>
                </li>
              </ul>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
}
