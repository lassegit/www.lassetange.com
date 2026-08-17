import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, OPEN_SOURCE, PRODUCTS, PROFILE, countryName } from '../lib/data';
import { dictionary, formatPeriod, localeFromPath } from '../lib/i18n';
import { firstParagraph, section } from '../lib/markdown';
import { Layout } from './layout';
import { PrintButton } from './print-button';
import { CompactEntry, LINK, Prose, Section, TechList, placeLabel } from './ui';

/**
 * The whole CV on one page, in the order a recruiter reads: who, then what I have built, then who I
 * have built it for, then the tools, then the languages.
 *
 * This page is designed to leave the browser as a PDF. `print:` variants drop the header, tabs,
 * footer and the print bar itself, the theme's colour variables swap to black on white, and entries
 * carry `break-inside-avoid` — so what comes out of “Save as PDF” is a document, not a screenshot of
 * a website. It reuses the same markdown as `/products` and `/client-work`, trimmed to each entry's
 * opening paragraph, so there is no second copy of the text to keep in sync.
 */
export default function Resume({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'resume');
  const products = content(locale, 'products');
  const clientWork = content(locale, 'client-work');
  const technologies = content(locale, 'technologies');
  const openSource = content(locale, 'open-source');
  const tagline = content(locale, 'home').meta.tagline ?? '';
  const profile = section(doc, 'profile');

  return (
    <Layout locale={locale} path="/resume" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <div className="mb-9 flex flex-wrap items-baseline gap-x-4 gap-y-2 rounded-md border border-line bg-surface px-4 py-3.5 print:hidden">
        <PrintButton label={t.printResume} />
        <p className="flex-1 basis-56 text-sm text-muted">{t.printHint}</p>
      </div>

      <header className="flex flex-wrap items-start gap-5 border-b-2 border-ink pb-6 break-inside-avoid">
        <img
          className="size-22 flex-none rounded object-cover object-[50%_5%]"
          src={PROFILE.photo}
          width={PROFILE.photoWidth}
          height={PROFILE.photoHeight}
          alt=""
        />
        <div className="flex-1 basis-60">
          <h1 className="text-display font-semibold text-balance">{PROFILE.name}</h1>
          <p className="mt-1 text-lg text-muted">{tagline}</p>
          <ul className="mt-2.5 text-sm text-muted [&_li+li]:mt-0.5">
            <li>
              <a className={LINK} href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
            </li>
            <li>
              <a className={LINK} href={PROFILE.siteUrl}>
                www.lassetange.com
              </a>{' '}
              ·{' '}
              <a className={LINK} href={PROFILE.github}>
                github.com/lassegit
              </a>{' '}
              ·{' '}
              <a className={LINK} href={PROFILE.linkedin}>
                linkedin.com/in/lassetange
              </a>
            </li>
            <li>
              {t.city}, {countryName('copenhagen', locale)}
            </li>
          </ul>
        </div>
      </header>

      {profile && (
        <Section title={profile.title} id="cv-profile">
          <Prose html={profile.html} />
        </Section>
      )}

      <Section title={t.navProducts} id="cv-products">
        <ul>
          {PRODUCTS.map((product) => {
            const entry = section(products, product.id);
            if (!entry) return null;

            return (
              <CompactEntry
                key={product.id}
                title={entry.title}
                href={product.url}
                printUrl
                period={formatPeriod(product.start, undefined, locale)}
                role={[entry.subtitle ?? [], product.profitable ? t.profitable : []].flat().join(' · ')}
                html={firstParagraph(entry.html)}
                stack={product.stack}
              />
            );
          })}
        </ul>
      </Section>

      <Section title={t.navClientWork} id="cv-work">
        <ul>
          {CLIENT_WORK.map((engagement) => {
            const entry = section(clientWork, engagement.id);
            if (!entry) return null;

            return (
              <CompactEntry
                key={engagement.id}
                title={entry.title}
                href={engagement.url}
                printUrl
                period={formatPeriod(engagement.start, engagement.end, locale)}
                // Role first — it is what a reader scans for — then the place. The period is
                // already set on the line above.
                role={[entry.subtitle ?? [], placeLabel(engagement, locale)].flat().join(' · ')}
                html={firstParagraph(entry.html)}
                stack={engagement.stack}
              />
            );
          })}
        </ul>
      </Section>

      <Section title={t.navTechnologies} id="cv-technologies">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-x-8 gap-y-7">
          {technologies.sections.map((group) => (
            <li className="break-inside-avoid" key={group.id}>
              <h3 className="mb-2.5 border-b border-line pb-1.5 text-base font-semibold">{group.title}</h3>
              <TechList html={group.html} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.spokenLanguages} id="cv-languages">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-6 gap-y-2 text-sm">
          {t.fluencies.map((fluency) => (
            <li key={fluency.name}>
              <span className="font-semibold">{fluency.name}</span> — {fluency.level}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.navOpenSource} id="cv-open-source">
        <ul>
          {OPEN_SOURCE.map((project) => {
            const entry = section(openSource, project.id);
            if (!entry) return null;

            return <CompactEntry key={project.id} title={entry.title} href={project.url} printUrl html={firstParagraph(entry.html)} />;
          })}
        </ul>
      </Section>
    </Layout>
  );
}
