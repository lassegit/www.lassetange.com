import { PROFILE } from '../lib/data';
import { LOCALES, LOCALE_NAMES, LOCALE_TAGS, dictionary, localePath, type Locale } from '../lib/i18n';
import { Shell } from './ui';

const LANGUAGE = 'underline decoration-line-strong hover:text-accent hover:decoration-current';

/**
 * The language selector is three plain links rather than a `<select>`: it needs no JavaScript, it is
 * crawlable, and each one lands on the same page in the other language rather than dumping the
 * reader back at the front page.
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
                      href={localePath(path, option)}
                      hrefLang={LOCALE_TAGS[option]}
                      lang={LOCALE_TAGS[option]}
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
