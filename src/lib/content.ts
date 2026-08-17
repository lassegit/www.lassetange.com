/**
 * Every content file in the site, imported statically so the bundler can see them and the pages
 * cannot ask for a locale or a page that does not exist.
 *
 * These imports only ever appear in server components, so no markdown reaches the browser bundle.
 */

import { parseContent, type ContentDocument } from './markdown';
import type { Locale } from './i18n';

import daClientWork from '../content/da/client-work.md';
import daContact from '../content/da/contact.md';
import daHome from '../content/da/home.md';
import daOpenSource from '../content/da/open-source.md';
import daProducts from '../content/da/products.md';
import daResume from '../content/da/resume.md';
import daTechnologies from '../content/da/technologies.md';

import enClientWork from '../content/en/client-work.md';
import enContact from '../content/en/contact.md';
import enHome from '../content/en/home.md';
import enOpenSource from '../content/en/open-source.md';
import enProducts from '../content/en/products.md';
import enResume from '../content/en/resume.md';
import enTechnologies from '../content/en/technologies.md';

import deClientWork from '../content/de/client-work.md';
import deContact from '../content/de/contact.md';
import deHome from '../content/de/home.md';
import deOpenSource from '../content/de/open-source.md';
import deProducts from '../content/de/products.md';
import deResume from '../content/de/resume.md';
import deTechnologies from '../content/de/technologies.md';

export type ContentKey = 'home' | 'products' | 'client-work' | 'technologies' | 'open-source' | 'resume' | 'contact';

const SOURCES: Record<Locale, Record<ContentKey, string>> = {
  da: {
    home: daHome,
    products: daProducts,
    'client-work': daClientWork,
    technologies: daTechnologies,
    'open-source': daOpenSource,
    resume: daResume,
    contact: daContact,
  },
  en: {
    home: enHome,
    products: enProducts,
    'client-work': enClientWork,
    technologies: enTechnologies,
    'open-source': enOpenSource,
    resume: enResume,
    contact: enContact,
  },
  de: {
    home: deHome,
    products: deProducts,
    'client-work': deClientWork,
    technologies: deTechnologies,
    'open-source': deOpenSource,
    resume: deResume,
    contact: deContact,
  },
};

export function content(locale: Locale, key: ContentKey): ContentDocument {
  return parseContent(SOURCES[locale][key]);
}
