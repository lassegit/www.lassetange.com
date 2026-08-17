# www.lassetange.com

```bash
pnpm dev         # dev server with HMR, http://localhost:3000
pnpm build       # production build for cloudflare
pnpm typecheck   # tsc --noEmit
pnpm preview     # build, then run it in workerd — port 8787
pnpm run deploy  # build, then ship it to Cloudflare
pnpm lint:fix    # apply what it can — then run typecheck, see eslint.config.mjs
```

`package.json` has the rest, including whatever your formatter and linter added.

## Layout

```
rshono.config.ts   deploy target, siteUrl, and the .md / .css loader rules
public/            served verbatim at the web root (favicon.svg → /favicon.svg)
src/
  routes.ts        the route table — 7 pages × 3 languages, all prerendered
  server.ts        a Hono app: security headers, redirects, sitemap.xml, error reporting
  components/      pages and components
  content/         da|en|de — all prose, in markdown
  lib/             i18n, markdown parsing, and the CV's structured data
  styles.css       imported by the layout, so it loads with the page
```

Pages are **server components**: they render the whole document, may be `async`, and await data directly.
Interactive parts are `'use client'` components a page imports — only those ship JavaScript. The one on
this site is the CV's print button.

## Content

Text lives in `src/content/<locale>/*.md` and nowhere else. Facts that do not translate — dates, URLs,
company names, technology names — live in `src/lib/data.ts`, and the two are joined by the `{#id}`
suffix on a section heading:

```md
---
title: Kundeopgaver
description: Shown as the meta description.
---

A lead paragraph, before the first section.

## hey.car {#heycar}

### Udvikler & tech lead

The body of the section, in markdown. Its first paragraph is what the CV shows.
```

Short interface labels — nav, buttons, field names — are in `src/lib/i18n.ts`. Adding a language means
a fourth `Dictionary`, a fourth folder under `content/`, and seven more routes.

`src/lib/resume.en.json` is the compiled JSON Resume the content was written from. Nothing imports it;
it is kept as the source of record.

## Environment

`.env` holds committed defaults; `.env.local` overrides it and is gitignored. Only `PUBLIC_`-prefixed
variables reach the browser — everything else is server-only, and a stray read of it in client code
compiles to `undefined` rather than shipping. Nothing on this site needs one yet.

## Deploying

This app is built for `cloudflare`. `pnpm run deploy` does the build and the upload in one step.

Building from a git repo instead: set Workers Builds' **Build command** to `pnpm build`.
Its deploy command already defaults to `npx wrangler deploy`, and it installs dependencies itself.

Change `deploy` in `rshono.config.ts` to target somewhere else, or build for one place without editing the
file: `rshono build --deploy vercel`, or `RSHONO_DEPLOY=vercel` in CI. `dev` always runs the Node dev
server, whatever the target — it is a property of the build, not of developing.

Every deployment target, and what each one needs: <https://www.rshono.com/docs/deployment>
