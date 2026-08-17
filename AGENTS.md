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

Browser defaults where they work: semantic elements, real headings, underlined links, no JavaScript
except the CV's print button. The measure is capped near 70 characters and the palette is neutral
plus one blue.

Styling is Tailwind utilities in the markup. `src/styles.css` holds only the `@theme` block those
utilities resolve against — `canvas`, `surface`, `ink`, `muted`, `line`, `line-strong`, `accent`,
plus `text-display`, `text-heading` and `max-w-shell`. Use those names, not `zinc-800` or `blue-700`;
dark mode and print work by redefining the same variables, so a hard-coded colour will not follow.
That is also why there are no `dark:` variants anywhere — there is nothing for them to say.

Repeated class strings live as constants in `src/components/ui.tsx` (`LINK`, `PROSE`, `PAGE_TITLE`
and so on). Compose them; never build a class name from fragments, because Tailwind finds names by
scanning source text and would generate nothing for it.

Markdown output is styled with arbitrary variants (`[&_a]:underline`) rather than the typography
plugin, which would bring its own scale and have to be undone.

`/resume` is designed to be saved as a PDF. Anything added to it needs to survive `print:` — and the
dark-mode block is scoped to `screen` so it cannot leak onto paper.
