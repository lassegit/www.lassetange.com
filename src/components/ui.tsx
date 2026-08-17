import type { ReactNode } from 'react';
import { countryName, placeName, type Engagement } from '../lib/data';
import { formatPeriod, type Locale } from '../lib/i18n';

/** Markdown output. The source is our own content files, so it is rendered as authored. */
export function Prose({ html, className = 'prose' }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** The technologies behind an entry — present on every one, so always in the same place and weight. */
export function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="chips">
      {items.map((item) => (
        <li className="chip" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The dot-separated facts line: period first, then place, then whoever the engagement ran through. */
export function EntryMeta({ children }: { children: ReactNode }) {
  return <p className="entry-meta">{children}</p>;
}

/** Period · place · agency, assembled the same way on `/client-work` and on the CV. */
export function engagementFacts(engagement: Engagement, locale: Locale): string[] {
  const facts = [formatPeriod(engagement.start, engagement.end, locale)];
  if (engagement.place) facts.push(`${placeName(engagement.place, locale)}, ${countryName(engagement.place, locale)}`);
  if (engagement.via) facts.push(engagement.via);
  return facts;
}

/** A heading that links to the thing it names, when there is somewhere to link to. */
export function EntryTitle({ href, children, className = 'entry-title' }: { href?: string; children: ReactNode; className?: string }) {
  return <h2 className={className}>{href ? <a href={href}>{children}</a> : children}</h2>;
}

/** The section wrapper used on the front page and the CV — a ruled heading and its content. */
export function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section className="section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 className="section-title" id={id ? `${id}-title` : undefined}>
        {title}
      </h2>
      {children}
    </section>
  );
}
