/**
 * The whole of the site's internationalisation: three locales, one dictionary of interface labels
 * each, and the path helpers that map a request URL onto a locale and back.
 *
 * Substantive text — everything a reader actually reads — lives in `src/content/<locale>/*.md`.
 * What is here is interface chrome: nav labels, field names, button text. Splitting them this way
 * keeps prose editable without touching TypeScript, and keeps short labels out of markdown where
 * they would only add ceremony.
 */

export const LOCALES = ['da', 'en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

/** Danish is the primary language and sits at the web root; the others are prefixed. */
export const DEFAULT_LOCALE: Locale = 'da';

/** Endonyms — a language is always offered in its own language, never translated. */
export const LOCALE_NAMES: Record<Locale, string> = { da: 'Dansk', en: 'English', de: 'Deutsch' };

/** BCP 47 tags, for `<html lang>`, `hreflang` and `Intl`. */
export const LOCALE_TAGS: Record<Locale, string> = { da: 'da-DK', en: 'en-GB', de: 'de-DE' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------------------------------
 * Paths
 *
 * Every page has one canonical path — the Danish one, e.g. `/products`. `localePath` prefixes it for
 * the other two, `localeFromPath` and `canonicalPath` take a request pathname back apart. Path
 * segments stay English in all three languages, so there is one route table shape, not three.
 * ---------------------------------------------------------------------------------------------- */

/** The locale a request pathname belongs to — the first segment if it names one, else Danish. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** A request pathname with any locale prefix removed, e.g. `/de/products` → `/products`. */
export function canonicalPath(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (!first || !isLocale(first)) return pathname === '' ? '/' : pathname;
  return rest.length ? `/${rest.join('/')}` : '/';
}

/** A canonical path rendered in `locale`, e.g. `('/products', 'de')` → `/de/products`. */
export function localePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/* -------------------------------------------------------------------------------------------------
 * Navigation
 * ---------------------------------------------------------------------------------------------- */

/** The tab strip, in order. `/contact` is deliberately absent — it lives in the header instead. */
export const PAGES = [
  { path: '/', key: 'navAbout' },
  { path: '/products', key: 'navProducts' },
  { path: '/client-work', key: 'navClientWork' },
  { path: '/technologies', key: 'navTechnologies' },
  { path: '/open-source', key: 'navOpenSource' },
  { path: '/resume', key: 'navResume' },
] as const satisfies ReadonlyArray<{ path: string; key: keyof Dictionary }>;

/* -------------------------------------------------------------------------------------------------
 * Interface labels
 * ---------------------------------------------------------------------------------------------- */

export interface Dictionary {
  navAbout: string;
  navProducts: string;
  navClientWork: string;
  navTechnologies: string;
  navOpenSource: string;
  navResume: string;

  skipToContent: string;
  sections: string;
  contact: string;
  homeLabel: string;

  language: string;
  currentLanguage: string;

  present: string;
  since: string;
  stack: string;
  visitSite: string;
  sourceOnGithub: string;
  profitable: string;

  productsNoun: string;
  engagementsNoun: string;
  areasNoun: string;
  projectsNoun: string;

  printResume: string;
  printHint: string;
  profile: string;
  spokenLanguages: string;
  alsoBuilt: string;
  fullHistory: string;

  moreOnGithub: string;
  emailMe: string;
  basedIn: string;
  city: string;

  notFoundTitle: string;
  notFoundBody: string;
  errorTitle: string;
  backHome: string;

  /** Spoken-language proficiencies, for the CV page. */
  fluencies: ReadonlyArray<{ name: string; level: string }>;
}

const da: Dictionary = {
  navAbout: 'Om mig',
  navProducts: 'Produkter',
  navClientWork: 'Kundeopgaver',
  navTechnologies: 'Teknologier',
  navOpenSource: 'Open source',
  navResume: 'CV',

  skipToContent: 'Gå til indhold',
  sections: 'Sektioner',
  contact: 'Kontakt',
  homeLabel: 'Forside',

  language: 'Sprog',
  currentLanguage: 'Nuværende sprog',

  present: 'i dag',
  since: 'Siden',
  stack: 'Teknologi',
  visitSite: 'Besøg sitet',
  sourceOnGithub: 'Kildekode på GitHub',
  profitable: 'Profitabelt',

  productsNoun: 'produkter',
  engagementsNoun: 'opgaver',
  areasNoun: 'områder',
  projectsNoun: 'projekter',

  printResume: 'Print eller gem som PDF',
  printHint: 'Åbner browserens printdialog. Vælg “Gem som PDF” for at hente CV’et som fil.',
  profile: 'Profil',
  spokenLanguages: 'Sprog',
  alsoBuilt: 'Øvrige opgaver',
  fullHistory: 'Fuld arbejdshistorik',

  moreOnGithub: 'Se flere projekter på GitHub',
  emailMe: 'Skriv til mig',
  basedIn: 'Bosat i',
  city: 'København',

  notFoundTitle: 'Siden findes ikke',
  notFoundBody: 'Der er ikke noget på denne adresse. Prøv en af sektionerne ovenfor.',
  errorTitle: 'Noget gik galt',
  backHome: 'Tilbage til forsiden',

  fluencies: [
    { name: 'Dansk', level: 'Modersmål' },
    { name: 'Engelsk', level: 'Flydende, professionelt niveau' },
    { name: 'Tysk', level: 'Flydende, professionelt niveau' },
  ],
};

const en: Dictionary = {
  navAbout: 'About',
  navProducts: 'Products',
  navClientWork: 'Client work',
  navTechnologies: 'Technologies',
  navOpenSource: 'Open source',
  navResume: 'Résumé',

  skipToContent: 'Skip to content',
  sections: 'Sections',
  contact: 'Contact',
  homeLabel: 'Home',

  language: 'Language',
  currentLanguage: 'Current language',

  present: 'present',
  since: 'Since',
  stack: 'Stack',
  visitSite: 'Visit site',
  sourceOnGithub: 'Source on GitHub',
  profitable: 'Profitable',

  productsNoun: 'products',
  engagementsNoun: 'engagements',
  areasNoun: 'areas',
  projectsNoun: 'projects',

  printResume: 'Print or save as PDF',
  printHint: 'Opens your browser’s print dialog. Choose “Save as PDF” to download the CV as a file.',
  profile: 'Profile',
  spokenLanguages: 'Languages',
  alsoBuilt: 'Other engagements',
  fullHistory: 'Full work history',

  moreOnGithub: 'More projects on GitHub',
  emailMe: 'Send me an email',
  basedIn: 'Based in',
  city: 'Copenhagen',

  notFoundTitle: 'Page not found',
  notFoundBody: 'There is nothing at this address. Try one of the sections above.',
  errorTitle: 'Something went wrong',
  backHome: 'Back to the front page',

  fluencies: [
    { name: 'Danish', level: 'Native speaker' },
    { name: 'English', level: 'Full professional proficiency' },
    { name: 'German', level: 'Full professional proficiency' },
  ],
};

const de: Dictionary = {
  navAbout: 'Über mich',
  navProducts: 'Produkte',
  navClientWork: 'Kundenprojekte',
  navTechnologies: 'Technologien',
  navOpenSource: 'Open Source',
  navResume: 'Lebenslauf',

  skipToContent: 'Zum Inhalt springen',
  sections: 'Bereiche',
  contact: 'Kontakt',
  homeLabel: 'Startseite',

  language: 'Sprache',
  currentLanguage: 'Aktuelle Sprache',

  present: 'heute',
  since: 'Seit',
  stack: 'Technologie',
  visitSite: 'Website ansehen',
  sourceOnGithub: 'Quellcode auf GitHub',
  profitable: 'Profitabel',

  productsNoun: 'Produkte',
  engagementsNoun: 'Projekte',
  areasNoun: 'Bereiche',
  projectsNoun: 'Projekte',

  printResume: 'Drucken oder als PDF speichern',
  printHint: 'Öffnet den Druckdialog des Browsers. Wählen Sie „Als PDF speichern“, um den Lebenslauf herunterzuladen.',
  profile: 'Profil',
  spokenLanguages: 'Sprachen',
  alsoBuilt: 'Weitere Projekte',
  fullHistory: 'Vollständiger Werdegang',

  moreOnGithub: 'Weitere Projekte auf GitHub',
  emailMe: 'Schreiben Sie mir',
  basedIn: 'Wohnhaft in',
  city: 'Kopenhagen',

  notFoundTitle: 'Seite nicht gefunden',
  notFoundBody: 'Unter dieser Adresse gibt es nichts. Probieren Sie einen der Bereiche oben.',
  errorTitle: 'Etwas ist schiefgelaufen',
  backHome: 'Zurück zur Startseite',

  fluencies: [
    { name: 'Dänisch', level: 'Muttersprache' },
    { name: 'Englisch', level: 'Verhandlungssicher' },
    { name: 'Deutsch', level: 'Verhandlungssicher' },
  ],
};

const DICTIONARIES: Record<Locale, Dictionary> = { da, en, de };

export function dictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/* -------------------------------------------------------------------------------------------------
 * Dates
 *
 * Engagement dates are stored as `YYYY` or `YYYY-MM` — language-neutral — and formatted per locale
 * at render time, so `2018-08` reads as “aug. 2018”, “Aug 2018” or “Aug. 2018” without three copies
 * of the same fact.
 * ---------------------------------------------------------------------------------------------- */

function formatDate(value: string, locale: Locale): string {
  const [year, month] = value.split('-');
  if (!month) return year;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/**
 * A date range for display: `“aug. 2018 – nov. 2020”`, `“Siden 2023”` for open-ended work, or a
 * single date when a job started and ended in the same month.
 */
export function formatPeriod(start: string, end: string | undefined, locale: Locale): string {
  const from = formatDate(start, locale);
  if (!end) return `${dictionary(locale).since} ${from}`;
  const to = formatDate(end, locale);
  return from === to ? from : `${from} – ${to}`;
}

/** A list rendered with the locale's own conjunction — “A, B og C” / “A, B and C” / “A, B und C”. */
export function formatList(items: readonly string[], locale: Locale): string {
  return new Intl.ListFormat(LOCALE_TAGS[locale], { style: 'long', type: 'conjunction' }).format(items);
}
