# www.lassetange.com

An [rshono](https://www.rshono.com) app — Hono, Rspack and React Server Components.

Read the framework's documentation before guessing at a convention: <https://www.rshono.com/llms.txt>.

## What this site is

A three-language CV and personal site: Danish at the web root, English under `/en`, German under
`/de`. Path segments stay English in every language, so the three trees are the same shape. All 21
pages are `render: 'static'` — there is no per-request data anywhere, and nothing should introduce
any without a reason.

## Where text goes

Prose belongs in `src/content/<locale>/*.md`, never in a component. Facts that do not translate —
dates as `YYYY-MM`, URLs, company and technology names — belong in `src/lib/data.ts`. The `{#id}` on
a `##` heading is what ties a section to its data entry, which leaves the heading itself free to be
translated (a Danish ministry has a different name in German).

Short interface labels — nav, buttons, field names — belong in the `Dictionary` in `src/lib/i18n.ts`.
Dates and place names are formatted through `Intl` rather than stored per language.

A change to one language's content is a change to all three. `src/lib/resume.en.json` is the source
of record the content was written from.

## Design

Browser defaults where they work: semantic elements, real headings, underlined links, native focus
rings, no JavaScript except the CV's print button. The measure is capped near 70 characters and the
palette is neutral plus one blue. `src/styles.css` is plain CSS with semantic class names — Tailwind
is imported for its preflight reset, and the utilities are available but unused.

`/resume` is designed to be saved as a PDF. Anything added to it needs to survive `@media print`.
