/**
 * Turns the raw text of a `src/content/**.md` file into something a page can render.
 *
 * A content file looks like this:
 *
 * ```md
 * ---
 * title: Kundeopgaver
 * description: Udvalgte opgaver for startups og offentlige institutioner.
 * ---
 *
 * A lead paragraph, before the first section.
 *
 * ## hey.car {#heycar}
 * ### Udvikler & tech lead
 *
 * The body of the section, in markdown.
 * ```
 *
 * Frontmatter carries the page's `<title>` and meta description. Each `##` starts a section; the
 * optional `{#id}` suffix is the stable key that ties it to an entry in `src/lib/data.ts`, so the
 * heading itself stays free to be translated. An optional `###` immediately after is the section's
 * subtitle — a role, a tagline. Everything else is markdown.
 *
 * Parsing happens on the server only (at build time for prerendered routes), and every document is
 * memoised by source text, so a file is parsed once per process however many pages import it.
 */

import { marked } from 'marked';

export interface Section {
  /** Stable key from `{#id}`, or a slug of the heading when the suffix is omitted. */
  id: string;
  /** The `##` heading text, translated. */
  title: string;
  /** The `###` line directly beneath the heading, if there is one. */
  subtitle?: string;
  /** The rest of the section, rendered to HTML. */
  html: string;
}

export interface ContentDocument {
  /** Frontmatter `title` — the `<h1>` and the basis of the `<title>` tag. */
  title: string;
  /** Frontmatter `description` — the meta description. */
  description: string;
  /** Any other frontmatter key, for the odd page-specific string such as the front page's tagline. */
  meta: Readonly<Record<string, string>>;
  /** Everything between the frontmatter and the first `##`, rendered to HTML. */
  lead: string;
  sections: Section[];
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;
const HEADING = /^##[ \t]+(.+?)[ \t]*$/;
const SUBHEADING = /^###[ \t]+(.+?)[ \t]*$/;
const EXPLICIT_ID = /^(.*?)[ \t]*\{#([A-Za-z0-9_-]+)\}$/;

const cache = new Map<string, ContentDocument>();

/** Parse a markdown module's source. Repeat calls with the same source return the same document. */
export function parseContent(source: string): ContentDocument {
  const cached = cache.get(source);
  if (cached) return cached;

  const { data, body } = splitFrontmatter(source);
  const [lead, sections] = splitSections(body);

  const { title = '', description = '', ...meta } = data;
  const document: ContentDocument = { title, description, meta, lead: toHtml(lead), sections };

  cache.set(source, document);
  return document;
}

/** The section with this id, or `undefined` when the locale's file has not got one yet. */
export function section(document: ContentDocument, id: string): Section | undefined {
  const found = document.sections.find((candidate) => candidate.id === id);
  if (!found && process.env.NODE_ENV !== 'production') {
    console.warn(`[content] no section "${id}" in "${document.title || 'untitled document'}"`);
  }
  return found;
}

/** Render a markdown fragment — a single line of prose from a dictionary, say — to inline HTML. */
export function inlineHtml(markdown: string): string {
  return marked.parseInline(markdown, { async: false, gfm: true });
}

/**
 * A section's opening paragraph. The CV lists every engagement, and at that density one paragraph
 * each is the readable length — so content is written with a self-contained first paragraph, and the
 * longer treatment on `/client-work` picks up from there.
 */
export function firstParagraph(html: string): string {
  return /<p>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
}

function splitFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = FRONTMATTER.exec(source);
  if (!match) return { data: {}, body: source };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) data[key] = stripQuotes(value);
  }

  return { data, body: source.slice(match[0].length) };
}

function stripQuotes(value: string): string {
  const quoted = /^(['"])([\s\S]*)\1$/.exec(value);
  return quoted ? quoted[2] : value;
}

function splitSections(body: string): [lead: string, sections: Section[]] {
  const lines = body.split(/\r?\n/);
  const lead: string[] = [];
  const sections: Section[] = [];
  let current: { id: string; title: string; subtitle?: string; lines: string[] } | undefined;

  for (const line of lines) {
    const heading = HEADING.exec(line);
    if (heading) {
      if (current) sections.push(finish(current));
      const { title, id } = splitHeading(heading[1]);
      current = { id, title, lines: [] };
      continue;
    }

    if (!current) {
      lead.push(line);
      continue;
    }

    // A `###` counts as the section's subtitle only while nothing else has been seen yet; later ones
    // are ordinary headings inside the body.
    const subheading = SUBHEADING.exec(line);
    if (subheading && current.subtitle === undefined && current.lines.every((seen) => seen.trim() === '')) {
      current.subtitle = subheading[1]!;
      continue;
    }

    current.lines.push(line);
  }

  if (current) sections.push(finish(current));
  return [lead.join('\n'), sections];
}

function finish(current: { id: string; title: string; subtitle?: string; lines: string[] }): Section {
  return { id: current.id, title: current.title, subtitle: current.subtitle, html: toHtml(current.lines.join('\n')) };
}

function splitHeading(raw: string): { title: string; id: string } {
  const explicit = EXPLICIT_ID.exec(raw);
  if (explicit) return { title: explicit[1].trim(), id: explicit[2] };
  return { title: raw, id: slug(raw) };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toHtml(markdown: string): string {
  const trimmed = markdown.trim();
  return trimmed ? marked.parse(trimmed, { async: false, gfm: true }) : '';
}
