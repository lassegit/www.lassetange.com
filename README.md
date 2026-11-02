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
  routes.ts        the route table — 5 pages × 3 languages, all prerendered
  server.ts        a Hono app: security headers, redirects, sitemap.xml, error reporting
  components/      pages and components
  content/         da|en|de — all prose, in markdown
  lib/             i18n, markdown parsing, and the CV's structured data
  styles.css       the Tailwind @theme — imported by the layout, so it loads with the page
```

Pages are **server components**: they render the whole document, may be `async`, and await data directly.
Interactive parts are `'use client'` components a page imports — only those ship JavaScript. The three on
this site are the CV's print button, the contact form, and the header's mobile menu.

English is the primary language and has no prefix, so `/resume` is English. Danish and German are
prefixed: `/da/resume` and `/de/resume`. The path itself stays English in all three, so the route table
has one shape rather than three.

## Content

Text lives in `src/content/<locale>/*.md` and nowhere else. Facts that do not translate — dates, URLs,
company names, technology names — live in `src/lib/data.ts`, and the two are joined by the `{#id}`
suffix on a section heading:

```md
---
title: CV
description: Shown as the meta description.
---

## hey.car {#heycar}

### Udvikler & tech lead

The body of the section, in markdown. The CV shows the full body for work entries and the
first paragraph for open-source entries.
```

A section body that is nothing but a reference borrows another page's section, so one profile can
appear on two pages without being written twice:

```md
## Profil {#profile}

{{home#about}}
```

The reference resolves inside the same locale — each `resume.md` gets its own language's `home.md`.

Short interface labels — nav, buttons, field names — are in `src/lib/i18n.ts`. Adding a language means
a fourth `Dictionary`, a fourth folder under `content/`, and five more routes.

`src/lib/resume.en.json` is the compiled JSON Resume the content was written from. Nothing imports it;
it is kept as the source of record.

## Styling

Tailwind utilities in the markup; `src/styles.css` is only the `@theme` block they resolve against.
The palette is semantic — `bg-canvas`, `text-ink`, `text-muted`, `border-line`, `text-accent` — and
dark mode and print are the same variables redefined, so nothing carries a `dark:` variant. Repeated
strings (`LINK`, `PROSE`, `PAGE_TITLE`) are constants in `src/components/ui.tsx`; `BUTTON` lives in
`src/components/button.ts`, which is safe to import from client components. Compose them rather than
assembling class names, which Tailwind's scanner would not see.

## Environment

No env file is committed — put values in `.env` or `.env.local` locally; both are gitignored. `pnpm dev`
reads `.env` and `.env.local`. `pnpm preview` (`wrangler dev`) reads `.dev.vars` or `.env`; if both
exist, `.dev.vars` wins. Use `.env` if you want both commands to see the secret. Only
`PUBLIC_`-prefixed variables reach the browser — everything else is server-only, and a stray read of it
in client code compiles to `undefined` rather than shipping.

The contact form's Turnstile sitekey is public and lives in `src/components/contact-form.tsx`. The
secret is a Worker secret: `wrangler secret put TURNSTILE_SECRET_KEY`. Locally, put the secret in
`.env` (or in `.dev.vars` if you only use `pnpm preview`); both are gitignored. The sitekey and secret
must belong to the same widget: use the production pair and add `localhost` to the widget's hostnames,
or temporarily swap `SITE_KEY` to Cloudflare's test sitekey and use the matching test secret. The test
values are listed at
<https://developers.cloudflare.com/turnstile/troubleshooting/testing/>.

The widget itself is `@marsidev/react-turnstile`, which injects Cloudflare's script and exposes
`reset()` through a ref.

## Deploying

This app is built for `cloudflare`. `pnpm run deploy` does the build and the upload in one step.

The contact form sends through the `EMAIL` binding in `wrangler.jsonc`, restricted to
`lassetange@gmail.com` and sent from `noreply@lassetange.com`. Onboard `lassetange.com` for
**Email Sending** in the Cloudflare dashboard before the first deploy, or `EMAIL.send()` will fail with
`E_SENDER_NOT_VERIFIED`. Onboarding also adds a DMARC record; check any other senders on the domain
before relying on it.

Building from a git repo instead: set Workers Builds' **Build command** to `pnpm build`.
Its deploy command already defaults to `npx wrangler deploy`, and it installs dependencies itself.

Change `deploy` in `rshono.config.ts` to target somewhere else, or build for one place without editing the
file: `rshono build --deploy vercel`, or `RSHONO_DEPLOY=vercel` in CI. `dev` always runs the Node dev
server, whatever the target — it is a property of the build, not of developing.

Every deployment target, and what each one needs: <https://www.rshono.com/docs/deployment>
