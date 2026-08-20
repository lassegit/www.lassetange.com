import { PROFILE } from '../lib/data';
import { PAGES, dictionary, localePath, type Locale } from '../lib/i18n';
import { CloseIcon, GitHubIcon, LinkedInIcon, MenuIcon } from './icons';
import { MobileMenu } from './mobile-menu';
import { Shell } from './ui';

/** A tab in the desktop strip. Accent throughout, so the strip reads as links rather than as labels,
    and a rule heavy enough to be seen at a glance next to its neighbours. The weight sits on the two
    states rather than on `TAB`, so the current tab is marked twice — by its rule and by its weight —
    without one class having to beat another in the stylesheet. */
const TAB = 'block border-b-4 px-2.5 pt-2 pb-2.5 text-[0.9375rem] whitespace-nowrap no-underline';
const TAB_IDLE = 'border-transparent font-medium text-accent hover:border-accent/40 hover:text-accent-hover';
const TAB_CURRENT = 'border-accent font-medium text-accent';

/** A row in the mobile menu — the same rules as a tab, turned on their side. The border stays at 2px
    so a row's text keeps lining up with the name above it (see `LIST_INDENT`). */
const ROW = 'flex font-medium items-center gap-1.5 border-l-4 py-2.5 pl-3 no-underline';
const ROW_IDLE = 'border-transparent text-accent hover:text-accent-hover';
const ROW_CURRENT = 'border-accent text-accent';

/** The lists pull left by their own indent, so a row's text aligns with the name above it. */
const LIST_INDENT = '-ml-3.5';

/** Contact, in words, in the top row. */
const META = 'inline-flex items-center gap-1.5 text-muted no-underline hover:text-accent hover:underline';

/** A profile in the top row, where it is its mark alone. The padding is a target a thumb can hit and
    the negative margin takes it back out of the layout, so the marks neither space the row apart nor
    add to its height. */
const ICON = '-m-1.5 flex p-1.5 text-muted no-underline hover:text-accent';

/**
 * Two rows, deliberately: the top one is who I am and how to reach me, the bottom one is where you
 * can go. The tab strip is the site's primary navigation — some sections run long, so they are pages
 * rather than anchors, and the current tab is marked with `aria-current` as well as a heavier rule.
 *
 * Below `sm` there is no room for six tabs, so both rows collapse into a burger menu. It is a native
 * `<details>` disclosure rather than a script: the browser owns the open state and announces it as a
 * button, and it works before (and without) hydration. Following a link out of it is the one point where
 * the browser needs help — a same-origin link is soft-navigated, so the document, and the open panel with
 * it, survives the click — and {@link MobileMenu} adds that and nothing else. The trade-off left standing
 * is that only the burger closes it — a tap outside will not.
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

          <MobileMenu className="group sm:hidden">
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
          </MobileMenu>
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
    <ul className={tabs ? '-mb-px flex' : LIST_INDENT}>
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

/**
 * Contact, GitHub and LinkedIn — the top row on desktop, the foot of the menu on mobile.
 *
 * In the top row the two profiles are their marks alone. That row shares a line with the name and sits
 * above six tabs, and spelling out “GitHub” beside a mark that already says it is what makes the line
 * crowded. A mark carries no accessible name of its own — the SVGs are `aria-hidden` — so the link has
 * to say what it is: `aria-label` for a screen reader, `title` for a mouse. The menu is a column with
 * room to spare and keeps the words.
 */
function MetaLinks({ locale, as }: { locale: Locale; as: 'row' | 'menu' }) {
  const t = dictionary(locale);
  const row = as === 'row';

  const links = [
    { label: t.contact, href: localePath('/contact', locale) },
    { label: 'GitHub', href: PROFILE.github, rel: 'me noopener', icon: <GitHubIcon /> },
    { label: 'LinkedIn', href: PROFILE.linkedin, rel: 'me noopener', icon: <LinkedInIcon /> },
  ];

  return (
    <ul className={row ? 'flex items-center gap-3 text-sm' : LIST_INDENT}>
      {links.map((link) => {
        const mark = row && link.icon !== undefined;
        return (
          <li key={link.href}>
            <a
              className={row ? (mark ? ICON : META) : `${ROW} ${ROW_IDLE}`}
              href={link.href}
              rel={link.rel}
              aria-label={mark ? link.label : undefined}
              title={mark ? link.label : undefined}
            >
              {link.icon}
              {!mark && link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
