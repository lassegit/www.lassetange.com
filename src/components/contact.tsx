import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PROFILE, countryName } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { Layout } from './layout';
import { Prose } from './ui';

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
      <h1 className="page-title">{doc.title}</h1>
      <Prose html={doc.lead} className="lead prose" />

      <ul className="contact-methods">
        {methods.map((method) => (
          <li className="contact-method" key={method.label}>
            <span className="contact-label">{method.label}</span>
            <a href={method.href}>{method.text}</a>
          </li>
        ))}
        <li className="contact-method">
          <span className="contact-label">{t.basedIn}</span>
          <span>
            {t.city}, {countryName('copenhagen', locale)}
          </span>
        </li>
      </ul>

      {doc.sections.map((entry) => (
        <section className="section" key={entry.id} aria-labelledby={`${entry.id}-title`}>
          <h2 className="section-title" id={`${entry.id}-title`}>
            {entry.title}
          </h2>
          <Prose html={entry.html} />
        </section>
      ))}
    </Layout>
  );
}
