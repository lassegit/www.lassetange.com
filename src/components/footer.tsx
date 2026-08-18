import { PROFILE } from '../lib/data';
import {
  LOCALES,
  LOCALE_FLAGS,
  LOCALE_NAMES,
  LOCALE_TAGS,
  dictionary,
  localePath,
  localeSwitchPath,
  PAGES,
  type Locale,
} from '../lib/i18n';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons';
import { Shell } from './ui';

/**
 * A column's heading — a `<p>` rather than an `<h2>`. It names four or seven links at the foot of the
 * page, and two real headings would enter the outline of every page below the content the page is
 * actually about. The `<nav>`'s own label is what a screen reader navigates by.
 */
const COLUMN_TITLE = 'mb-2 text-xs font-semibold text-ink';

/**
 * A link in a column. The page being read is set in ink rather than muted — the same thing the tab
 * strip says with its rule — and the colour lives on the two states rather than on the shared class,
 * so neither has to out-rank the other in the stylesheet.
 */
const COLUMN_LINK = 'inline-flex items-center gap-1.5 no-underline hover:text-accent hover:underline';
const COLUMN_LINK_IDLE = 'text-muted';
const COLUMN_LINK_CURRENT = 'text-ink';

/**
 * A language is a pill rather than an underlined word: the flag sits inside the same shape as the
 * name, so nothing has to be underlined across a piece of artwork. The border is what says these are
 * controls; the accent one, filled and set in ink, is the language being read.
 */
const LANGUAGE = 'flex items-center gap-1.5 rounded-full border px-2.5 py-1 leading-none no-underline';
const LANGUAGE_IDLE = 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink';
const LANGUAGE_CURRENT = 'border-accent bg-accent-soft font-semibold text-ink';

/**
 * Two columns and a bottom bar: where else on the site to go, where else to find me, and then the
 * language of all of it beside the credit.
 *
 * The columns exist because a reader who has just finished a page is at the bottom of it, and every
 * page but the front one ends without a way onward — the tab strip is a scroll away, back at the top.
 * The pages column is {@link PAGES} itself rather than its own list, so the order here and the order of
 * the tabs cannot drift apart, and it names the page being read with `aria-current` exactly as the
 * header does. `/contact` is the one page it leaves out, in the second column with the rest of the ways
 * to reach me.
 */
export function Footer({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  // Contact is a page rather than a `mailto:` — the page writes the address out, so it works for a
  // reader whose browser has nothing behind the scheme — and it is the only link to it in the footer,
  // so it marks itself when it is the page being read.
  const elsewhere = [
    { label: 'GitHub', href: PROFILE.github, rel: 'me noopener', icon: <GitHubIcon /> },
    { label: 'LinkedIn', href: PROFILE.linkedin, rel: 'me noopener', icon: <LinkedInIcon /> },
    { label: t.contact, href: localePath('/contact', locale), current: path === '/contact', icon: <MailIcon /> },
  ];

  return (
    <footer className="border-t border-line pt-8 pb-10 text-sm text-muted print:hidden">
      <Shell>
        <div className="grid grid-cols-2 gap-x-8 gap-y-7">
          <nav aria-label={t.pages}>
            <p className={COLUMN_TITLE}>{t.pages}</p>
            <ul className="grid gap-1.5">
              {PAGES.map((page) => {
                const current = page.path === path;
                return (
                  <li key={page.path}>
                    <a
                      className={`${COLUMN_LINK} ${current ? COLUMN_LINK_CURRENT : COLUMN_LINK_IDLE}`}
                      href={localePath(page.path, locale)}
                      aria-current={current ? 'page' : undefined}
                    >
                      {t[page.key]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div>
            <p className={COLUMN_TITLE}>{t.elsewhere}</p>
            <ul className="grid gap-1.5">
              {elsewhere.map((link) => (
                <li key={link.href}>
                  <a
                    className={`${COLUMN_LINK} ${link.current ? COLUMN_LINK_CURRENT : COLUMN_LINK_IDLE}`}
                    href={link.href}
                    rel={link.rel}
                    aria-current={link.current ? 'page' : undefined}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-5">
          <LanguageLinks locale={locale} path={path} />

          <p>
            © {PROFILE.name} ·{' '}
            <a
              className="text-muted underline decoration-line-strong hover:text-accent hover:decoration-current"
              href="https://www.rshono.com"
            >
              rshono
            </a>
          </p>
        </div>
      </Shell>
    </footer>
  );
}

/**
 * The language selector is three plain links rather than a `<select>`: it needs no JavaScript, it is
 * crawlable, and each one lands on the same page in the other language rather than dumping the
 * reader back at the front page.
 *
 * The two a reader could switch to point at the prefixed form — `/da/products` included, which is not
 * a page but a statement: `src/server.ts` records it and then redirects to `/products`. That is what
 * makes clicking “Dansk” an explicit choice rather than a round trip through the language negotiation,
 * which would otherwise send a German browser straight back where it came from. The language already
 * being read needs none of that and stays a plain self-link, so no page links to a redirect to itself.
 *
 * `data-native` opts them out of soft navigation. A `Set-Cookie` would survive the flight fetch, but
 * the Danish redirect would not: `history.pushState` has already written `/da/products` by the time
 * `fetch` follows the 302, which would leave that in the address bar with `/products` underneath it.
 *
 * The flags are decoration and marked as such — on Windows they come down as “DK”, “DE”, “GB”, and to
 * a screen reader as nothing at all. The endonym beside them is what actually names each language.
 */
function LanguageLinks({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <nav aria-label={t.language}>
      <ul className="flex flex-wrap items-center gap-2">
        {LOCALES.map((option) => {
          const current = option === locale;
          return (
            <li key={option}>
              <a
                className={`${LANGUAGE} ${current ? LANGUAGE_CURRENT : LANGUAGE_IDLE}`}
                href={current ? localePath(path, option) : localeSwitchPath(path, option)}
                hrefLang={LOCALE_TAGS[option]}
                lang={LOCALE_TAGS[option]}
                data-native
                aria-current={current ? 'true' : undefined}
                aria-label={current ? `${LOCALE_NAMES[option]} — ${t.currentLanguage}` : LOCALE_NAMES[option]}
              >
                <span className="text-base" aria-hidden="true">
                  {LOCALE_FLAGS[option]}
                </span>
                {LOCALE_NAMES[option]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
