import { PROFILE } from '../lib/data';
import { PAGES, dictionary, localePath, type Locale } from '../lib/i18n';
import { GitHubIcon, LinkedInIcon } from './icons';
import { Shell } from './ui';

const TAB = 'block border-b-2 px-2.5 pt-2 pb-2.5 text-[0.9375rem] whitespace-nowrap no-underline';
const TAB_IDLE = 'border-transparent text-muted hover:border-line-strong hover:text-ink';
const TAB_CURRENT = 'border-accent font-semibold text-ink';

/**
 * Two rows, deliberately: the top one is who I am and how to reach me, the bottom one is where you
 * can go. The tab strip is the site's primary navigation — some sections run long, so they are pages
 * rather than anchors, and the current tab is marked with `aria-current` as well as a heavier rule.
 */
export function Header({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <header className="border-b border-line print:hidden">
      <Shell>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pt-4 pb-3.5">
          <a
            className="font-semibold tracking-tight text-ink no-underline hover:underline hover:decoration-1"
            href={localePath('/', locale)}
          >
            {PROFILE.name}
          </a>

          <ul className="flex items-center gap-4 text-sm">
            <li>
              <a className="text-muted no-underline hover:text-accent hover:underline" href={localePath('/contact', locale)}>
                {t.contact}
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-muted no-underline hover:text-accent hover:underline"
                href={PROFILE.github}
                rel="me noopener"
              >
                <GitHubIcon />
                GitHub
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-muted no-underline hover:text-accent hover:underline"
                href={PROFILE.linkedin}
                rel="me noopener"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </Shell>

      <Shell>
        <nav className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.sections}>
          <ul className="-mb-px flex gap-0.5">
            {PAGES.map((page) => {
              const current = page.path === path;
              return (
                <li key={page.path}>
                  <a
                    className={`${TAB} ${current ? TAB_CURRENT : TAB_IDLE}`}
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
      </Shell>
    </header>
  );
}
