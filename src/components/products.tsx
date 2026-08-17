import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PRODUCTS, PROFILE } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { Chips, Facts, LEAD, LINK, Prose, QUIET_LINK } from './ui';

/** The four products I built and run myself — structure from `data.ts`, prose from the locale's markdown. */
export default function Products({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'products');

  return (
    <Layout locale={locale} path="/products" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className="mb-3 text-display font-semibold text-balance">{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-11">
        {PRODUCTS.map((product) => {
          const entry = section(doc, product.id);
          if (!entry) return null;

          return (
            <li className="border-t border-line py-7 first:border-t-0 first:pt-1" key={product.id}>
              <h2 className="mb-0.5 text-heading font-semibold text-balance">
                <a className={QUIET_LINK} href={product.url}>
                  {entry.title}
                </a>
              </h2>
              {entry.subtitle && <p className="mb-2 text-muted">{entry.subtitle}</p>}

              <Facts items={[formatPeriod(product.start, undefined, locale)]}>
                {product.profitable && (
                  <span className="inline-block rounded-full border border-accent px-1.5 py-px text-xs leading-snug font-semibold text-accent">
                    {t.profitable}
                  </span>
                )}
              </Facts>

              <Prose html={entry.html} className="mb-4" />
              <Chips items={product.stack} />

              <p className="mt-3.5 text-sm">
                <a className={LINK} href={product.url}>
                  {t.visitSite} <span aria-hidden="true">→</span>
                </a>
              </p>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
}
