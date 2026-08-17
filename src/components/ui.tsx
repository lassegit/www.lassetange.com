import type { ReactNode } from 'react';
import { countryName, placeName, type Engagement } from '../lib/data';
import { formatPeriod, type Locale } from '../lib/i18n';

/* -------------------------------------------------------------------------------------------------
 * Shared class strings
 *
 * Tailwind's preflight strips link styling and list markers, so anything the markup does not name has
 * no style at all. For elements written in JSX that is a class attribute; for the HTML `marked`
 * produces it has to be an arbitrary variant on the container. Both live here so a link on one page
 * cannot drift from a link on another.
 *
 * Every class name appears literally in this file — Tailwind finds them by scanning source text, so
 * a name assembled from pieces at runtime would generate no CSS. Composing these constants is safe;
 * building new ones out of fragments is not.
 * ---------------------------------------------------------------------------------------------- */

/** An inline link in body text. */
export const LINK = 'text-accent underline decoration-1 underline-offset-2 hover:text-accent-hover hover:decoration-2';

/** A link that carries a heading or a card — the underline would be noise, so it appears on hover. */
export const QUIET_LINK = 'text-ink no-underline hover:text-accent hover:underline hover:decoration-1 hover:underline-offset-2';

/** {@link LINK}, reaching into rendered markdown rather than a JSX element. */
export const PROSE_LINKS =
  '[&_a]:text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2 [&_a:hover]:text-accent-hover [&_a:hover]:decoration-2';

/** Styles for rendered markdown, reaching into HTML this file did not write. */
export const PROSE = [
  'text-pretty',
  '[&>*+*]:mt-3.5',
  '[&_strong]:font-semibold',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5',
  '[&_li+li]:mt-1.5 [&_li]:marker:text-muted',
  PROSE_LINKS,
].join(' ');

/** The opening paragraph of a page, set larger and quieter than the body it introduces. */
export const LEAD = 'text-lg/relaxed text-muted';

/** The two headings the site has. Preflight resets `font-weight`, so it has to be said out loud. */
export const PAGE_TITLE = 'mb-3 text-display font-semibold text-balance';
export const ENTRY_TITLE = 'mb-0.5 text-heading font-semibold text-balance';

/* -------------------------------------------------------------------------------------------------
 * Components
 * ---------------------------------------------------------------------------------------------- */

/** The single column everything on the site sits in — header, main and footer share its edges. */
export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-shell px-5 print:max-w-none print:px-0 ${className}`}>{children}</div>;
}

/** Markdown output. The source is our own content files, so it is rendered as authored. */
export function Prose({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`${PROSE} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** The technologies behind an entry — present on every one, so always in the same place and weight. */
export function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li className="rounded-full border border-line bg-surface px-2 py-0.5 text-xs whitespace-nowrap text-muted" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The dot-separated facts line under an entry heading. The separators are real elements rather than
 * `::before` content, so they are hidden from screen readers and no rule has to except the badge.
 */
export function Facts({ items, children }: { items: readonly string[]; children?: ReactNode }) {
  return (
    <p className="mb-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted">
      {items.map((item, index) => (
        <span className="flex items-center gap-x-2" key={item}>
          {index > 0 && (
            <span className="text-line-strong" aria-hidden="true">
              ·
            </span>
          )}
          {item}
        </span>
      ))}
      {children}
    </p>
  );
}

/**
 * “Copenhagen, Denmark” — where an engagement sat, named in the reader's language. An array rather
 * than a string, so a remote engagement contributes nothing to the line it is spread into.
 */
export function placeLabel(engagement: Engagement, locale: Locale): string[] {
  if (!engagement.place) return [];
  return [`${placeName(engagement.place, locale)}, ${countryName(engagement.place, locale)}`];
}

/**
 * Period · place · agency, for the CV. `/client-work` composes the same pieces itself: it sets the
 * period beside the title and leaves the agency out, so only the place reaches its facts line.
 */
export function engagementFacts(engagement: Engagement, locale: Locale): string[] {
  const facts = [formatPeriod(engagement.start, engagement.end, locale), ...placeLabel(engagement, locale)];
  if (engagement.via) facts.push(engagement.via);
  return facts;
}

/** A ruled heading and the block it introduces — the shape every section on the site takes. */
export function Section({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="mt-11" aria-labelledby={`${id}-title`}>
      <h2 className="mb-5 border-b border-line pb-2 text-heading font-semibold text-balance" id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A technology group's list. Deliberately not `<Prose>`: preflight already strips markers and
 * padding from a `<ul>`, and these read better as a bare column than as bullets. Layering
 * `list-none` over `<Prose>`'s `list-disc` would leave the outcome to Tailwind's own sort order.
 */
export function TechList({ html }: { html: string }) {
  return <div className="[&_li+li]:mt-1.5 [&_ul]:text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * One engagement at list density: title and dates on a line, role beneath, a paragraph, and the
 * stack. Used for the long tail on `/client-work` and for everything on the CV, where completeness
 * matters more than depth. `printUrl` prints the address after the title, which only the CV wants.
 */
export function CompactEntry({
  title,
  href,
  period,
  role,
  html,
  stack,
  printUrl,
}: {
  title: string;
  href?: string;
  period?: string;
  role?: string;
  html?: string;
  stack?: readonly string[];
  printUrl?: boolean;
}) {
  return (
    <li className="border-t border-line py-3.5 break-inside-avoid first:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h3 className="text-base leading-snug font-semibold">
          {href ? (
            <a className={QUIET_LINK} href={href} data-print-url={printUrl ? '' : undefined}>
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {period && <span className="text-sm whitespace-nowrap text-muted tabular-nums">{period}</span>}
      </div>
      {role && <p className="text-sm text-muted">{role}</p>}
      {html && <p className={`mt-1.5 text-sm ${PROSE_LINKS}`} dangerouslySetInnerHTML={{ __html: html }} />}
      {stack && stack.length > 0 && <p className="mt-1 text-xs text-muted">{stack.join(' · ')}</p>}
    </li>
  );
}
