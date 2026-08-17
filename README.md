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
rshono.config.ts   deploy target, security and build settings
public/            served verbatim at the web root (favicon.svg → /favicon.svg)
src/
  routes.ts        the route table — the one file rshono requires
  server.ts        a Hono app: middleware, API routes, redirects, error reporting
  components/      pages and components
  styles.css       imported by the layout, so it loads with the page
```

Pages are **server components**: they render the whole document, may be `async`, and await data directly.
Interactive parts are `'use client'` components a page imports — only those ship JavaScript.

## Environment

`.env` holds committed defaults; `.env.local` overrides it and is gitignored. Only `PUBLIC_`-prefixed
variables reach the browser — everything else is server-only, and a stray read of it in client code
compiles to `undefined` rather than shipping. `src/components/layout.tsx` reads `PUBLIC_APP_NAME` that way.

## Deploying

This app is built for `cloudflare`. `pnpm run deploy` does the build and the upload in one step.

Building from a git repo instead: set Workers Builds' **Build command** to `pnpm build`.
Its deploy command already defaults to `npx wrangler deploy`, and it installs dependencies itself.

Change `deploy` in `rshono.config.ts` to target somewhere else, or build for one place without editing the
file: `rshono build --deploy vercel`, or `RSHONO_DEPLOY=vercel` in CI. `dev` always runs the Node dev
server, whatever the target — it is a property of the build, not of developing.

Every deployment target, and what each one needs: <https://www.rshono.com/docs/deployment>
