import { PROFILE } from '../lib/data';
import { PAGES, dictionary, localePath, type Locale } from '../lib/i18n';
import { CloseIcon, GitHubIcon, LinkedInIcon, MenuIcon } from './icons';
import { Shell } from './ui';

/** A tab in the desktop strip. */
const TAB = 'block border-b-2 px-2.5 pt-2 pb-2.5 text-[0.9375rem] whitespace-nowrap no-underline';
const TAB_IDLE = 'border-transparent text-muted hover:border-line-strong hover:text-ink';
const TAB_CURRENT = 'border-accent font-semibold text-ink';

/** A row in the mobile menu — the same rules as a tab, turned on their side. */
const ROW = 'flex items-center gap-1.5 border-l-2 py-2.5 pl-3 no-underline';
const ROW_IDLE = 'border-transparent text-muted hover:text-ink';
const ROW_CURRENT = 'border-accent font-semibold text-ink';

/** The lists pull left by their own indent, so a row's text aligns with the name above it. */
const LIST_INDENT = '-ml-3.5';

/** Contact and the two profiles, in the top row. */
const META = 'inline-flex items-center gap-1.5 text-muted no-underline hover:text-accent hover:underline';

/**
 * Two rows, deliberately: the top one is who I am and how to reach me, the bottom one is where you
 * can go. The tab strip is the site's primary navigation — some sections run long, so they are pages
 * rather than anchors, and the current tab is marked with `aria-current` as well as a heavier rule.
 *
 * Below `sm` there is no room for six tabs, so both rows collapse into a burger menu. It is a native
 * `<details>` disclosure rather than a script: the browser owns the open state and announces it as a
 * button, it works before (and without) hydration, and every link is a new document so the menu is
 * closed again on arrival. The trade-off is that only the burger closes it — a tap outside will not.
 */
export function Header({ locale, path }: { locale: Locale; path: string }) {
  const t = dictionary(locale);

  return (
    <header className="relative border-b border-line print:hidden">
      <Shell>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 pb-3.5 sm:items-baseline">
          <a
            className="font-semibold tracking-tight text-ink no-underline hover:underline hover:decoration-1"
            href={localePath('/', locale)}
          >
            {PROFILE.name}
          </a>

          <div className="hidden sm:block">
            <MetaLinks locale={locale} as="row" />
          </div>

          <details className="group sm:hidden">
            <summary
              className="-mr-2 flex cursor-pointer list-none items-center p-2 text-ink [&::-webkit-details-marker]:hidden"
              aria-label={t.menu}
            >
              <MenuIcon className="group-open:hidden" />
              <CloseIcon className="hidden group-open:block" />
            </summary>

            {/* Out of flow, so opening the menu does not push the page down — the panel hangs off the
                header's lower edge and needs its own background to cover what is behind it. */}
            <div className="absolute inset-x-0 top-full z-10 border-b border-line bg-canvas">
              <Shell className="py-2">
                <nav aria-label={t.sections}>
                  <PageLinks locale={locale} path={path} as="menu" />
                </nav>
                <div className="mt-2 border-t border-line pt-2">
                  <MetaLinks locale={locale} as="menu" />
                </div>
              </Shell>
            </div>
          </details>
        </div>
      </Shell>

      <Shell className="hidden sm:block">
        <nav className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.sections}>
          <PageLinks locale={locale} path={path} as="tabs" />
        </nav>
      </Shell>
    </header>
  );
}

/**
 * The section links, as the desktop tab strip or as the menu's column. One component so that the
 * order, the labels and `aria-current` cannot drift apart between the two.
 */
function PageLinks({ locale, path, as }: { locale: Locale; path: string; as: 'tabs' | 'menu' }) {
  const t = dictionary(locale);
  const tabs = as === 'tabs';

  return (
    <ul className={tabs ? '-mb-px flex gap-0.5' : LIST_INDENT}>
      {PAGES.map((page) => {
        const current = page.path === path;
        return (
          <li key={page.path}>
            <a
              className={tabs ? `${TAB} ${current ? TAB_CURRENT : TAB_IDLE}` : `${ROW} ${current ? ROW_CURRENT : ROW_IDLE}`}
              href={localePath(page.path, locale)}
              aria-current={current ? 'page' : undefined}
            >
              {t[page.key]}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Contact, GitHub and LinkedIn — the top row on desktop, the foot of the menu on mobile. */
function MetaLinks({ locale, as }: { locale: Locale; as: 'row' | 'menu' }) {
  const t = dictionary(locale);
  const row = as === 'row';

  const links = [
    { label: t.contact, href: localePath('/contact', locale) },
    { label: 'GitHub', href: PROFILE.github, rel: 'me noopener', icon: <GitHubIcon /> },
    { label: 'LinkedIn', href: PROFILE.linkedin, rel: 'me noopener', icon: <LinkedInIcon /> },
  ];

  return (
    <ul className={row ? 'flex items-center gap-4 text-sm' : LIST_INDENT}>
      {links.map((link) => (
        <li key={link.href}>
          <a className={row ? META : `${ROW} ${ROW_IDLE}`} href={link.href} rel={link.rel}>
            {link.icon}
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
