import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PROFILE, countryName } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { Layout } from './layout';
import { LEAD, LINK, PAGE_TITLE, Prose, Section } from './ui';

/**
 * No contact form. A form on a personal site adds a failure mode, a spam surface and a privacy
 * question in exchange for saving the reader one click — so the page hands over the address instead.
 */
export default function Contact({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const t = dictionary(locale);
  const doc = content(locale, 'contact');

  const methods = [
    { label: 'E-mail', href: `mailto:${PROFILE.email}`, text: PROFILE.email },
    { label: 'GitHub', href: PROFILE.github, text: 'github.com/lassegit' },
    { label: 'LinkedIn', href: PROFILE.linkedin, text: 'linkedin.com/in/lassetange' },
  ];

  return (
    <Layout locale={locale} path="/contact" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className={PAGE_TITLE}>{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-6 grid gap-3">
        {methods.map((method) => (
          <li className="flex items-baseline gap-3" key={method.label}>
            <span className="w-22 flex-none text-sm text-muted">{method.label}</span>
            <a className={LINK} href={method.href}>
              {method.text}
            </a>
          </li>
        ))}
        <li className="flex items-baseline gap-3">
          <span className="w-22 flex-none text-sm text-muted">{t.basedIn}</span>
          <span>
            {t.city}, {countryName('copenhagen', locale)}
          </span>
        </li>
      </ul>

      {doc.sections.map((entry) => (
        <Section title={entry.title} id={entry.id} key={entry.id}>
          <Prose html={entry.html} />
        </Section>
      ))}
    </Layout>
  );
}
