/**
 * The whole of the site's internationalization: three locales, one dictionary of interface labels
 * each, and the path helpers that map a request URL onto a locale and back.
 *
 * Substantive text — everything a reader actually reads — lives in `src/content/<locale>/*.md`.
 * What is here is interface chrome: nav labels, field names, button text. Splitting them this way
 * keeps prose editable without touching TypeScript, and keeps short labels out of markdown where
 * they would only add ceremony.
 */

export const LOCALES = ['en', 'da', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

/** English is the primary language and sits at the web root; the others are prefixed. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Endonyms — a language is always offered in its own language, never translated. */
export const LOCALE_NAMES: Record<Locale, string> = { da: 'Dansk', en: 'English', de: 'Deutsch' };

/**
 * Flags for the language selector, and only there. A flag names a country rather than a language —
 * the US flag stands in for English by convention, not by right — so they sit beside the endonym
 * as decoration, hidden from screen readers, and never carry the label on their own.
 */
export const LOCALE_FLAGS: Record<Locale, string> = { da: '🇩🇰', en: '🇺🇸', de: '🇩🇪' };

/** BCP 47 tags, for `<html lang>`, `hreflang` and `Intl`. */
export const LOCALE_TAGS: Record<Locale, string> = { da: 'da-DK', en: 'en-US', de: 'de-DE' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------------------------------
 * Paths
 *
 * Every page has one canonical path — the English one, e.g. `/resume`. `localePath` prefixes it for
 * the other two, `localeFromPath` and `canonicalPath` take a request pathname back apart. Path
 * segments stay English in all three languages, so there is one route table shape, not three.
 * ---------------------------------------------------------------------------------------------- */

/** The locale a request pathname belongs to — the first segment if it names one, else English. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** A request pathname with any locale prefix removed, e.g. `/de/resume` → `/resume`. */
export function canonicalPath(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (!first || !isLocale(first)) return pathname === '' ? '/' : pathname;
  return rest.length ? `/${rest.join('/')}` : '/';
}

/** A canonical path under a locale's prefix — `('/resume', 'da')` → `/da/resume`. */
function prefixedPath(path: string, locale: Locale): string {
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** A canonical path rendered in `locale`, e.g. `('/resume', 'da')` → `/da/resume`. */
export function localePath(path: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? path : prefixedPath(path, locale);
}

/* -------------------------------------------------------------------------------------------------
 * Navigation
 * ---------------------------------------------------------------------------------------------- */

/** The tab strip, in order. */
export const PAGES = [
  { path: '/', key: 'navAbout' },
  { path: '/resume', key: 'navResume' },
  { path: '/technologies', key: 'navTechnologies' },
  { path: '/open-source', key: 'navOpenSource' },
  { path: '/contact', key: 'navContact' },
] as const satisfies ReadonlyArray<{ path: string; key: keyof Dictionary }>;

/**
 * Every canonical page path — the tabs themselves. The sitemap enumerates it to build one entry per
 * page per language.
 */
export const PAGE_PATHS: readonly string[] = PAGES.map((page) => page.path);

/* -------------------------------------------------------------------------------------------------
 * Interface labels
 * ---------------------------------------------------------------------------------------------- */

/** Every string the contact form renders, in the reader's language. */
export interface ContactFormCopy {
  title: string;
  name: string;
  email: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  success: string;
  invalidSummary: string;
  invalidName: string;
  invalidEmail: string;
  invalidMessage: string;
  verification: string;
  /** Follows a failed verification, as the usual causes are local to the reader's browser. */
  verificationHint: string;
  error: string;
  noScript: string;
  turnstileError: string;
}

export interface Dictionary {
  navAbout: string;
  navTechnologies: string;
  navOpenSource: string;
  navResume: string;
  navContact: string;

  skipToContent: string;
  sections: string;
  /** The burger button's accessible name, below `sm` where the tab strip becomes a menu. */
  menu: string;
  homeLabel: string;
  /** The footer's two columns: the site's own pages, and everywhere else I am. */
  pages: string;
  elsewhere: string;

  language: string;
  currentLanguage: string;

  present: string;
  since: string;
  stack: string;
  sourceOnGithub: string;
  profitable: string;

  areasNoun: string;
  projectsNoun: string;

  printResume: string;
  printHint: string;
  profile: string;
  experience: string;
  spokenLanguages: string;
  fullHistory: string;

  moreOnGithub: string;
  emailMe: string;
  basedIn: string;
  city: string;

  contactDirect: string;
  contactForm: ContactFormCopy;

  notFoundTitle: string;
  notFoundBody: string;
  errorTitle: string;
  backHome: string;

  /** Spoken-language proficiencies, for the CV page. */
  fluencies: ReadonlyArray<{ name: string; level: string }>;
}

const da: Dictionary = {
  navAbout: 'Om mig',
  navTechnologies: 'Teknologier',
  navOpenSource: 'Open source',
  navResume: 'CV',
  navContact: 'Kontakt',

  skipToContent: 'Gå til indhold',
  sections: 'Sektioner',
  menu: 'Menu',
  homeLabel: 'Forside',
  pages: 'Sider',
  elsewhere: 'Andre steder',

  language: 'Sprog',
  currentLanguage: 'Nuværende sprog',

  present: 'i dag',
  since: 'Siden',
  stack: 'Teknologi',
  sourceOnGithub: 'Kildekode på GitHub',
  profitable: 'Profitabelt',

  areasNoun: 'områder',
  projectsNoun: 'projekter',

  printResume: 'Print eller gem som PDF',
  printHint: 'Åbner browserens printdialog. Vælg “Gem som PDF” for at hente CV’et som fil.',
  profile: 'Profil',
  experience: 'Erfaring',
  spokenLanguages: 'Sprog',
  fullHistory: 'Fuld arbejdshistorik',

  moreOnGithub: 'Se flere projekter på GitHub',
  emailMe: 'Skriv til mig',
  basedIn: 'Bosat i',
  city: 'København',

  contactDirect: 'Eller skriv direkte',
  contactForm: {
    title: 'Send en besked',
    name: 'Navn',
    email: 'E-mail',
    message: 'Besked',
    messagePlaceholder: 'Projekt, rolle og tidslinje — eller bare et hej.',
    send: 'Send besked',
    sending: 'Sender…',
    success: 'Tak for beskeden. Jeg vender tilbage hurtigst muligt.',
    invalidSummary: 'Tjek de markerede felter.',
    invalidName: 'Skriv et navn på 2–100 tegn.',
    invalidEmail: 'Skriv en gyldig e-mailadresse.',
    invalidMessage: 'Beskeden skal være mindst 10 tegn.',
    verification: 'Kunne ikke verificere, at du er et menneske. Prøv igen, eller skriv til {email}.',
    verificationHint:
      'Det skyldes oftest en VPN, en browser med fokus på privatliv eller en udvidelse, der blokerer verifikationen. Slå den fra på denne side, og genindlæs.',
    error: 'Der skete en fejl. Prøv igen, eller skriv til {email}.',
    noScript: 'Formularen kræver JavaScript. Skriv i stedet til {email}.',
    turnstileError: 'Verificeringen kunne ikke indlæses. Skriv til {email} i stedet.',
  },

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
  navTechnologies: 'Technologies',
  navOpenSource: 'Open source',
  navResume: 'Résumé',
  navContact: 'Contact',

  skipToContent: 'Skip to content',
  sections: 'Sections',
  menu: 'Menu',
  homeLabel: 'Home',
  pages: 'Pages',
  elsewhere: 'Elsewhere',

  language: 'Language',
  currentLanguage: 'Current language',

  present: 'present',
  since: 'Since',
  stack: 'Stack',
  sourceOnGithub: 'Source on GitHub',
  profitable: 'Profitable',

  areasNoun: 'areas',
  projectsNoun: 'projects',

  printResume: 'Print or save as PDF',
  printHint: 'Opens your browser’s print dialog. Choose “Save as PDF” to download the CV as a file.',
  profile: 'Profile',
  experience: 'Experience',
  spokenLanguages: 'Languages',
  fullHistory: 'Full work history',

  moreOnGithub: 'More projects on GitHub',
  emailMe: 'Send me an email',
  basedIn: 'Based in',
  city: 'Copenhagen',

  contactDirect: 'Or write directly',
  contactForm: {
    title: 'Send a message',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    messagePlaceholder: 'Project, role and timeline — or just say hello.',
    send: 'Send message',
    sending: 'Sending…',
    success: 'Thanks for your message. I’ll get back to you as soon as I can.',
    invalidSummary: 'Check the fields marked below.',
    invalidName: 'Enter a name between 2 and 100 characters.',
    invalidEmail: 'Enter a valid email address.',
    invalidMessage: 'Your message must be at least 10 characters.',
    verification: 'Could not verify that you are human. Try again, or email {email}.',
    verificationHint:
      'This is usually caused by a VPN, a privacy-focused browser or an extension blocking the verification. Turn it off for this page and reload.',
    error: 'Something went wrong. Try again, or email {email}.',
    noScript: 'This form needs JavaScript. Email {email} instead.',
    turnstileError: 'Verification could not load. Email {email} instead.',
  },

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
  navTechnologies: 'Technologien',
  navOpenSource: 'Open Source',
  navResume: 'Lebenslauf',
  navContact: 'Kontakt',

  skipToContent: 'Zum Inhalt springen',
  sections: 'Bereiche',
  menu: 'Menü',
  homeLabel: 'Startseite',
  pages: 'Seiten',
  elsewhere: 'Anderswo',

  language: 'Sprache',
  currentLanguage: 'Aktuelle Sprache',

  present: 'heute',
  since: 'Seit',
  stack: 'Technologie',
  sourceOnGithub: 'Quellcode auf GitHub',
  profitable: 'Profitabel',

  areasNoun: 'Bereiche',
  projectsNoun: 'Projekte',

  printResume: 'Drucken oder als PDF speichern',
  printHint: 'Öffnet den Druckdialog des Browsers. Wählen Sie „Als PDF speichern“, um den Lebenslauf herunterzuladen.',
  profile: 'Profil',
  experience: 'Berufserfahrung',
  spokenLanguages: 'Sprachen',
  fullHistory: 'Vollständiger Werdegang',

  moreOnGithub: 'Weitere Projekte auf GitHub',
  emailMe: 'Schreiben Sie mir',
  basedIn: 'Wohnhaft in',
  city: 'Kopenhagen',

  contactDirect: 'Oder direkt schreiben',
  contactForm: {
    title: 'Nachricht senden',
    name: 'Name',
    email: 'E-Mail',
    message: 'Nachricht',
    messagePlaceholder: 'Projekt, Rolle und Zeitrahmen — oder einfach Hallo.',
    send: 'Nachricht senden',
    sending: 'Wird gesendet…',
    success: 'Danke für Ihre Nachricht. Ich melde mich so bald wie möglich.',
    invalidSummary: 'Bitte prüfen Sie die markierten Felder.',
    invalidName: 'Bitte geben Sie einen Namen mit 2 bis 100 Zeichen ein.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    invalidMessage: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
    verification: 'Die Überprüfung ist fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie an {email}.',
    verificationHint:
      'Meist liegt das an einem VPN, einem datenschutzorientierten Browser oder einer Erweiterung, die die Überprüfung blockiert. Deaktivieren Sie sie für diese Seite und laden Sie neu.',
    error: 'Etwas ist schiefgelaufen. Versuchen Sie es erneut oder schreiben Sie an {email}.',
    noScript: 'Das Formular benötigt JavaScript. Schreiben Sie stattdessen an {email}.',
    turnstileError: 'Die Überprüfung konnte nicht geladen werden. Schreiben Sie stattdessen an {email}.',
  },

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
