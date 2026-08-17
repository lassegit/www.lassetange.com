import { PROFILE } from '../lib/data';
import { PAGES, dictionary, localePath, type Locale } from '../lib/i18n';
import { GitHubIcon, LinkedInIcon } from './icons';

/**
 * Two rows, deliberately: the top one is who I am and how to reach me, the bottom one is where you
 * can go. The tab strip is the site's primary navigation — some sections run long, so they are pages
 * rather than anchors, and the current tab is marked with `aria-current` as well as a heavier rule.
 */
export function Header({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <header className="site-header">
      <div className="shell">
        <div className="header-bar">
          <a className="wordmark" href={localePath('/', locale)}>
            {PROFILE.name}
          </a>

          <ul className="header-links">
            <li>
              <a href={localePath('/contact', locale)}>{t.contact}</a>
            </li>
            <li>
              <a href={PROFILE.github} rel="me noopener">
                <GitHubIcon />
                GitHub
              </a>
            </li>
            <li>
              <a href={PROFILE.linkedin} rel="me noopener">
                <LinkedInIcon />
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell">
        <nav className="tabs" aria-label={t.sections}>
          <ul className="tabs-list">
            {PAGES.map((page) => {
              const current = page.path === path;
              return (
                <li key={page.path}>
                  <a className="tab" href={localePath(page.path, locale)} aria-current={current ? 'page' : undefined}>
                    {t[page.key]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
