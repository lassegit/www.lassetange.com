/**
 * Every content file in the site, imported statically so the bundler can see them and the pages
 * cannot ask for a locale or a page that does not exist.
 *
 * These imports only ever appear in server components, so no markdown reaches the browser bundle.
 */

import { parseContent, type ContentDocument, type Section } from './markdown';
import type { Locale } from './i18n';

import daContact from '../content/da/contact.md';
import daHome from '../content/da/home.md';
import daOpenSource from '../content/da/open-source.md';
import daResume from '../content/da/resume.md';
import daTechnologies from '../content/da/technologies.md';

import enContact from '../content/en/contact.md';
import enHome from '../content/en/home.md';
import enOpenSource from '../content/en/open-source.md';
import enResume from '../content/en/resume.md';
import enTechnologies from '../content/en/technologies.md';

import deContact from '../content/de/contact.md';
import deHome from '../content/de/home.md';
import deOpenSource from '../content/de/open-source.md';
import deResume from '../content/de/resume.md';
import deTechnologies from '../content/de/technologies.md';

/**
 * Every page with a content file, in every locale. A section may borrow another page's section by
 * this key — `{{home#about}}` — which is how one paragraph ends up on two pages without being written
 * twice.
 */
const CONTENT_KEYS = ['home', 'technologies', 'open-source', 'resume', 'contact'] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

const SOURCES: Record<Locale, Record<ContentKey, string>> = {
  da: {
    home: daHome,
    technologies: daTechnologies,
    'open-source': daOpenSource,
    resume: daResume,
    contact: daContact,
  },
  en: {
    home: enHome,
    technologies: enTechnologies,
    'open-source': enOpenSource,
    resume: enResume,
    contact: enContact,
  },
  de: {
    home: deHome,
    technologies: deTechnologies,
    'open-source': deOpenSource,
    resume: deResume,
    contact: deContact,
  },
};

/** A content file's key, as written in a `{{document#section}}` reference. */
function isContentKey(value: string): value is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(value);
}

/**
 * A page, with any `{{document#section}}` reference in it filled in.
 *
 * The reference is always resolved within the page's own locale, so the German CV borrows the German
 * profile. Resolution lives here rather than in the parser because only this module knows which
 * documents exist.
 */
export function content(locale: Locale, key: ContentKey): ContentDocument {
  return resolve(locale, key, []);
}

/**
 * `trail` is the chain of documents the lookup came through. It is what lets a reference recurse into
 * a document that has references of its own while a pair of pages that include each other stops with
 * a warning instead of overflowing the stack.
 */
function resolve(locale: Locale, key: ContentKey, trail: readonly ContentKey[]): ContentDocument {
  const document = parseContent(SOURCES[locale][key]);
  const path = [...trail, key];

  return {
    ...document,
    sections: document.sections.map((entry) => {
      if (!entry.include) return entry;

      const { document: target, section: id } = entry.include;
      if (!isContentKey(target)) {
        console.warn(`[content] ${locale}: "${key}.md" includes "${target}#${id}", and "${target}" is not a page`);
        return withBody(entry, '');
      }

      return withBody(entry, find(locale, target, id, path)?.html ?? '');
    }),
  };
}

/** The section as it renders on the including page: its own heading and subtitle, the borrowed body. */
function withBody(entry: Section, html: string): Section {
  return { id: entry.id, title: entry.title, subtitle: entry.subtitle, html };
}

function find(locale: Locale, key: ContentKey, id: string, trail: readonly ContentKey[]): Section | undefined {
  if (trail.includes(key)) {
    console.warn(`[content] ${locale}: can't include "${key}#${id}" — ${trail.join(' → ')} → ${key} is a cycle`);
    return undefined;
  }

  const found = resolve(locale, key, trail).sections.find((entry) => entry.id === id);
  if (!found) console.warn(`[content] ${locale}: no section "${id}" in "${key}.md" to include`);
  return found;
}
