/**
 * The facts a CV is made of, in the one form that does not need translating: dates as `YYYY-MM`,
 * URLs, company names, technology names.
 *
 * Every entry's `id` is the key a `## Heading {#id}` in `src/content/<locale>/*.md` matches on, so
 * the prose about an engagement — and its heading, which for a public institution really does differ
 * per language — lives in markdown while the structure lives here. Ordering is by significance for
 * products and reverse-chronological for work, and the pages render them in the order given.
 */

import { LOCALE_TAGS, type Locale } from './i18n';

/* -------------------------------------------------------------------------------------------------
 * Profile
 * ---------------------------------------------------------------------------------------------- */

export const PROFILE = {
  name: 'Lasse Tange',
  email: 'contact@lassetange.com',
  siteUrl: 'https://www.lassetange.com',
  /** Shown at 120px on the front page and 88px on the CV, so a 480px derivative is plenty — the
   *  full-size original is kept for `og:image`, where the crawler wants the larger file. */
  photo: '/profile-picture-480.jpg',
  photoWidth: 319,
  photoHeight: 480,
  socialImage: '/profile-picture.jpg',
  github: 'https://github.com/lassegit',
  linkedin: 'https://www.linkedin.com/in/lassetange',
  blog: 'https://sometechblog.com',
} as const;

/* -------------------------------------------------------------------------------------------------
 * Places
 *
 * Only four cities appear across twenty-odd engagements, and two of them have a Danish, English and
 * German form. A four-entry table beats an `Intl` API that does not cover cities.
 * ---------------------------------------------------------------------------------------------- */

const PLACES = {
  copenhagen: { da: 'København', en: 'Copenhagen', de: 'Kopenhagen' },
  berlin: { da: 'Berlin', en: 'Berlin', de: 'Berlin' },
  aarhus: { da: 'Aarhus', en: 'Aarhus', de: 'Aarhus' },
  stuttgart: { da: 'Stuttgart', en: 'Stuttgart', de: 'Stuttgart' },
} as const satisfies Record<string, Record<Locale, string>>;

export type Place = keyof typeof PLACES;

export function placeName(place: Place, locale: Locale): string {
  return PLACES[place][locale];
}

/** The country a place sits in, named in the reader's language — “Tyskland”, “Germany”, “Deutschland”. */
export function countryName(place: Place, locale: Locale): string {
  const region = place === 'berlin' || place === 'stuttgart' ? 'DE' : 'DK';
  return new Intl.DisplayNames([LOCALE_TAGS[locale]], { type: 'region' }).of(region) ?? region;
}

/* -------------------------------------------------------------------------------------------------
 * Products
 * ---------------------------------------------------------------------------------------------- */

export interface Product {
  id: string;
  name: string;
  url: string;
  /** `YYYY` or `YYYY-MM`. All four are still running, so none has an end. */
  start: string;
  /** Shown as a badge next to the period. */
  profitable?: true;
  stack: readonly string[];
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'sqlai',
    name: 'SQLAI.ai',
    url: 'https://www.sqlai.ai',
    start: '2023',
    profitable: true,
    stack: ['TypeScript', 'React', 'Next.js', 'Astro', 'Node.js', 'PostgreSQL', 'LLM APIs', 'RAG', 'Stripe', 'Cloudflare'],
  },
  {
    id: 'chartmaker',
    name: 'Chartmaker.io',
    url: 'https://www.chartmaker.io',
    start: '2024',
    stack: ['TypeScript', 'React', 'Node.js', 'LLM APIs', 'Stripe'],
  },
  {
    id: 'websitefeedback',
    name: 'WebsiteFeedback.ai',
    url: 'https://www.websitefeedback.ai',
    start: '2024',
    stack: ['TypeScript', 'React', 'Node.js', 'LLM APIs', 'Stripe'],
  },
  {
    id: 'viewdiff',
    name: 'ViewDiff.ai',
    url: 'https://www.viewdiff.ai',
    start: '2025',
    stack: ['TypeScript', 'React', 'Node.js', 'LLM APIs', 'Stripe'],
  },
];

/* -------------------------------------------------------------------------------------------------
 * Client work
 * ---------------------------------------------------------------------------------------------- */

export interface Engagement {
  id: string;
  /** Neutral name, used where no translation exists; the markdown heading wins when it does. */
  name: string;
  url?: string;
  /** `YYYY` or `YYYY-MM`. */
  start: string;
  /** Absent means ongoing. */
  end?: string;
  place?: Place;
  /** The agency or talent partner the engagement ran through, where there was one. */
  via?: string;
  stack: readonly string[];
  /** Featured engagements get their own entry on `/client-work`; the rest are listed on `/resume`. */
  featured?: true;
}

export const CLIENT_WORK: readonly Engagement[] = [
  {
    id: 'alpakas',
    name: 'Alpakas',
    url: 'https://alpakas.app',
    start: '2022-02',
    end: '2022-05',
    place: 'berlin',
    stack: ['React Native', 'React', 'TypeScript', 'GraphQL'],
    featured: true,
  },
  {
    id: 'brandturbo',
    name: 'brandTURBO',
    start: '2021-11',
    end: '2021-12',
    place: 'berlin',
    stack: ['JavaScript', 'Frontend'],
  },
  {
    id: 'nuri',
    name: 'Nuri (formerly Bitwala)',
    url: 'https://nuri.com',
    start: '2021-01',
    end: '2021-07',
    place: 'berlin',
    via: 'UPPER Technologies GmbH',
    stack: ['React Native', 'TypeScript', 'GraphQL'],
    featured: true,
  },
  {
    id: 'heycar',
    name: 'hey.car',
    url: 'https://hey.car',
    start: '2019-05',
    end: '2020-11',
    place: 'berlin',
    via: 'MVPF Global Talent Solutions GmbH',
    stack: ['React', 'SSR', 'Redux', 'CSS-in-JS', 'TypeScript', 'Kotlin', 'A/B testing'],
    featured: true,
  },
  {
    id: 'wonderwerk',
    name: 'Wonderwerk',
    url: 'https://www.wonderwerk.co',
    start: '2018-08',
    end: '2018-12',
    place: 'berlin',
    stack: ['React', 'JavaScript', 'TDD', 'Jest', 'Testing Library'],
    featured: true,
  },
  {
    id: 'tomcode',
    name: 'TOMCode.com',
    start: '2018-08',
    end: '2018-08',
    place: 'stuttgart',
    via: 'Coder Society',
    stack: ['JavaScript', 'Frontend', 'Backend'],
  },
  {
    id: 'ufm',
    name: 'Danish Ministry of Higher Education and Science',
    url: 'https://ufm.dk',
    start: '2016-05',
    end: '2018-04',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['React', 'Redux', 'Flask', 'Python', 'MySQL', 'Accessibility'],
    featured: true,
  },
  {
    id: 'autobranchen',
    name: 'Autobranchen Danmark',
    start: '2016-06',
    end: '2017-11',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['WordPress', 'PHP', 'JavaScript', 'MySQL'],
  },
  {
    id: 'integrationsviden',
    name: 'Integrationsviden.dk',
    start: '2017-09',
    end: '2017-09',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['PHP', 'JavaScript', 'Responsive design'],
  },
  {
    id: 'eva',
    name: 'Danish Evaluation Institute (NB-ECEC)',
    start: '2017-08',
    end: '2017-08',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['PHP', 'JavaScript', 'i18n', 'Content management'],
  },
  {
    id: 'socialstyrelsen',
    name: 'Socialstyrelsen',
    start: '2017-06',
    end: '2017-08',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['PHP', 'JavaScript', 'Responsive design'],
  },
  {
    id: 'forsk',
    name: 'Forsk.dk',
    start: '2016-12',
    end: '2016-12',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['PHP', 'JavaScript', 'MySQL', 'E-commerce'],
  },
  {
    id: 'fritzschur',
    name: 'Fritz Schur Group',
    start: '2016-08',
    end: '2016-12',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['WordPress multisite', 'PHP', 'JavaScript', 'i18n'],
  },
  {
    id: 'nmkn',
    name: 'Danish Environmental Board of Appeal',
    url: 'https://nmknafgoerelser.dk',
    start: '2015-12',
    end: '2015-12',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['Backbone', 'Flask', 'Python', 'Elasticsearch', 'Docker'],
  },
  {
    id: 'fredninger',
    name: 'Fredninger.dk',
    url: 'https://www.fredninger.dk',
    start: '2014-12',
    end: '2015-11',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'CartoDB', 'SQL', 'Drupal', 'PHP', 'Geodata'],
    featured: true,
  },
  {
    id: 'bolighed',
    name: 'Bolighed.dk',
    start: '2015-04',
    end: '2015-09',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'PHP', 'MySQL', 'Geodata'],
  },
  {
    id: 'fee',
    name: 'FEE.Global',
    start: '2015-02',
    end: '2015-09',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'PHP', 'Podio API', 'CartoDB'],
  },
  {
    id: 'akademikerne',
    name: 'Akademikernes A-kasse',
    start: '2013-06',
    end: '2015-05',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'Drupal', 'PHP', 'A/B testing', 'Analytics'],
  },
  {
    id: 'aarhus',
    name: 'Aarhus School of Architecture',
    start: '2014-11',
    end: '2015-02',
    place: 'aarhus',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'Drupal', 'PHP', 'Faceted search'],
  },
  {
    id: 'natmus',
    name: 'The National Museum of Denmark',
    url: 'https://natmus.dk',
    start: '2014-10',
    end: '2014-10',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['Angular', 'Express', 'Elasticsearch'],
  },
  {
    id: 'sammenommotion',
    name: 'Sammen om Motion',
    start: '2013-04',
    end: '2014-06',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['Drupal', 'PHP', 'JavaScript', 'Responsive design'],
  },
  {
    id: 'cykelsuperstier',
    name: 'Cykelsuperstier',
    start: '2013-09',
    end: '2013-10',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['JavaScript', 'Drupal', 'PHP', 'Mapping APIs'],
  },
  {
    id: 'headnet-other',
    name: 'Additional clients via Headnet ApS',
    start: '2013',
    end: '2018',
    place: 'copenhagen',
    via: 'Headnet ApS',
    stack: ['WordPress', 'Drupal', 'PHP', 'JavaScript', 'Analytics'],
  },
];

export const FEATURED_WORK = CLIENT_WORK.filter((engagement) => engagement.featured);

/* -------------------------------------------------------------------------------------------------
 * Open source
 * ---------------------------------------------------------------------------------------------- */

export interface OpenSourceProject {
  id: string;
  name: string;
  /** Where the project lives — a repository, a registry listing or its own site. */
  url: string;
  /** A second link, where the project has both a home page and a repository. */
  repo?: string;
}

export const OPEN_SOURCE: readonly OpenSourceProject[] = [
  { id: 'rshono', name: 'rshono', url: 'https://www.rshono.com', repo: 'https://github.com/rshono/rshono' },
  {
    id: 'es7-snippets',
    name: 'Sublime ES7 React/Redux/React-Native snippets',
    url: 'https://packagecontrol.io/packages/Sublime%20ES7%20React%20Redux%20ReactNative%20JS%20snippets',
  },
  { id: 'flask-reactjs', name: 'flask-reactjs', url: 'https://github.com/lassegit/flask-reactjs' },
  { id: 'flask-scaffolding', name: 'flask-scaffolding', url: 'https://github.com/lassegit/flask-scaffolding' },
  { id: 'react-collapse-simple', name: 'react-collapse-simple', url: 'https://www.npmjs.com/package/react-collapse-simple' },
  { id: 'react-simple-social', name: 'react-simple-social', url: 'https://github.com/lassegit/react-simple-social' },
  { id: 'git18n-node', name: 'git18n-node', url: 'https://github.com/lassegit/git18n-node' },
  { id: 'browser-extensions', name: 'Dictionary and translation extensions', url: 'https://github.com/lassegit/deepl-extension' },
];

/** The three extensions the `browser-extensions` entry covers, linked individually in its prose. */
export const EXTENSIONS: readonly OpenSourceProject[] = [
  { id: 'deepl', name: 'DeepL', url: 'https://github.com/lassegit/deepl-extension' },
  { id: 'langenscheidt', name: 'Langenscheidt', url: 'https://github.com/lassegit/langenscheidt-chrome-ext' },
  { id: 'ordnet', name: 'Ordnet', url: 'https://github.com/lassegit/ordnet-chrome-ext' },
];
