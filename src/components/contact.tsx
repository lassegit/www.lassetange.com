import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { PROFILE } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';
import { ContactForm } from './contact-form';
import { Layout } from './layout';
import { LEAD, LINK, PAGE_TITLE, Prose, Section } from './ui';

/**
 * The form is the primary way to get in touch. The direct links stay below it: they are the fallback
 * for a browser that blocks Turnstile, and the better option for anyone who prefers their own mail
 * client.
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

      <Section title={t.contactForm.title} id="contact-form">
        <ContactForm copy={t.contactForm} email={PROFILE.email} locale={locale} />
      </Section>

      <Section title={t.contactDirect} id="contact-direct">
        <ul className="grid gap-3">
          {methods.map((method) => (
            <li className="flex items-baseline gap-3" key={method.label}>
              <span className="w-22 flex-none text-sm text-muted">{method.label}</span>
              <a className={LINK} href={method.href}>
                {method.text}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {doc.sections.map((entry) => (
        <Section title={entry.title} id={entry.id} key={entry.id}>
          <Prose html={entry.html} />
        </Section>
      ))}
    </Layout>
  );
}
