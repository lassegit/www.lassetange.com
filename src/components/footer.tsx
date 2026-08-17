import { PROFILE } from '../lib/data';
import { LOCALES, LOCALE_NAMES, LOCALE_TAGS, dictionary, localePath, type Locale } from '../lib/i18n';

/**
 * The language selector is three plain links rather than a `<select>`: it needs no JavaScript, it is
 * crawlable, and each one lands on the same page in the other language rather than dumping the
 * reader back at the front page.
 */
export function Footer({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-row">
          <nav aria-label={t.language}>
            <ul className="languages">
              {LOCALES.map((option) => {
                const current = option === locale;
                return (
                  <li key={option}>
                    <a
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

          <p className="footer-note">
            © {PROFILE.name} · <a href="https://www.rshono.com">rshono</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
