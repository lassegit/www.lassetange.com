import { PROFILE } from '../lib/data';
import { LOCALES, LOCALE_NAMES, LOCALE_TAGS, dictionary, localePath, localeSwitchPath, type Locale } from '../lib/i18n';
import { Shell } from './ui';

const LANGUAGE = 'underline decoration-line-strong hover:text-accent hover:decoration-current';

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
 */
export function Footer({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <footer className="border-t border-line pt-6 pb-10 text-sm text-muted print:hidden">
      <Shell>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <nav aria-label={t.language}>
            <ul className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
              {LOCALES.map((option) => {
                const current = option === locale;
                return (
                  <li key={option}>
                    <a
                      className={`${LANGUAGE} ${current ? 'font-semibold text-ink' : 'text-muted'}`}
                      href={current ? localePath(path, option) : localeSwitchPath(path, option)}
                      hrefLang={LOCALE_TAGS[option]}
                      lang={LOCALE_TAGS[option]}
                      data-native
                      aria-current={current ? 'true' : undefined}
                      aria-label={current ? `${LOCALE_NAMES[option]} — ${t.currentLanguage}` : LOCALE_NAMES[option]}
                    >
                      {LOCALE_NAMES[option]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

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
