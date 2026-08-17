import type { PageProps } from '@rshono/core';
import { content } from '../lib/content';
import { CLIENT_WORK, PROFILE } from '../lib/data';
import { formatPeriod, localeFromPath } from '../lib/i18n';
import { section } from '../lib/markdown';
import { Layout } from './layout';
import { ENTRY_TITLE, Facts, LEAD, PAGE_TITLE, Prose, QUIET_LINK, placeLabel } from './ui';

/**
 * Twenty-three engagements at one depth, newest first, in a single uninterrupted column. The length
 * of the list is the argument the page makes, so it is built to be scrolled: every entry has the same
 * shape, and the ones that ran for years read longer only because their markdown is longer. Splitting
 * a few out as featured made the rest look like an appendix.
 *
 * Each entry is four lines at most: the title with its dates set out to the right, role · place beneath
 * it, the prose, and the stack. The dates sit in a column of their own from `sm` up, where there is room
 * for one — a decade in order is easier to take in as a column than as the first item of a facts line.
 * Below `sm` they fall in under the title rather than crowd it, which keeps the reading order the same
 * at both widths.
 *
 * The stack is plain dot-separated text rather than chips, and the agency an engagement ran through is
 * left off — repeated down a list this long both turn into texture. `/resume` keeps the agency, and the
 * prose names it wherever it mattered.
 */
export default function ClientWork({ url }: PageProps) {
  const locale = localeFromPath(url.pathname);
  const doc = content(locale, 'client-work');

  return (
    <Layout locale={locale} path="/client-work" title={`${doc.title} — ${PROFILE.name}`} description={doc.description}>
      <h1 className={PAGE_TITLE}>{doc.title}</h1>
      <Prose html={doc.lead} className={LEAD} />

      <ul className="mt-11">
        {CLIENT_WORK.map((engagement) => {
          const entry = section(doc, engagement.id);
          if (!entry) return null;

          return (
            <li className="border-t border-line py-7 first:border-t-0 first:pt-1" key={engagement.id}>
              <div className="mb-1.5 flex flex-col gap-x-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={`${ENTRY_TITLE} sm:mb-0`}>
                  {engagement.url ? (
                    <a className={QUIET_LINK} href={engagement.url}>
                      {entry.title}
                    </a>
                  ) : (
                    entry.title
                  )}
                </h2>
                <span className="text-sm whitespace-nowrap text-muted tabular-nums">
                  {formatPeriod(engagement.start, engagement.end, locale)}
                </span>
              </div>

              <Facts items={[entry.subtitle ?? [], placeLabel(engagement, locale)].flat()} />

              <Prose html={entry.html} className="mb-4" />
              <p className="text-sm text-muted">{engagement.stack.join(' · ')}</p>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
}
