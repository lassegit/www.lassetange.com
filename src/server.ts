import { onServerError, publicUrl } from '@rshono/core/server';
import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { getCookie, setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { PROFILE } from './lib/data';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  PAGE_PATHS,
  canonicalPath,
  isLocale,
  localeFromPath,
  localePath,
  preferredLocale,
  type Locale,
} from './lib/i18n';

/**
 * Mounted at `/` ahead of the page routes, so middleware registered here wraps page requests too — auth,
 * logging, headers. The flip side: a terminal handler at a page's path shadows the page.
 */
const server = new Hono();

/** Every error the framework catches lands here: a thrown action, a failed render, SSR falling over. */
onServerError((error, { source, request }) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[error] ${source} ${new URL(request.url).pathname}: ${message}`);
});

/** Caps every request body before anything downstream buffers it. Raise it where you accept uploads. */
server.use(bodyLimit({ maxSize: 1024 * 1024 }));

/**
 * HSTS, `X-Content-Type-Options`, a referrer policy and the rest of Hono's hardened defaults. No CSP:
 * nonce-based policies force every document to render per request, and every page here is prerendered.
 */
server.use(secureHeaders());

/** Cross-origin hosts allowed to post server actions, alongside this app's own. */
const ALLOWED_ORIGINS: string[] = [];

/** Rejects a cross-origin POST before it reaches a server action. `publicUrl(c)`, not `c.req.url`: behind a proxy those differ. */
server.use(csrf({ origin: (origin, c) => origin === publicUrl(c).origin || ALLOWED_ORIGINS.includes(origin) }));

/** `/about/` and `/about` should not be two pages. */
server.use(trimTrailingSlash({ alwaysRedirect: true }));

/** Old paths that should keep working. One place to add to, rather than a handler each. */
const REDIRECTS: Record<string, string> = {
  '/cv': '/resume',
  '/kontakt': '/contact',
  '/de/lebenslauf': '/de/resume',
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  server.get(from, (c) => c.redirect(to, 301));
}

/* -------------------------------------------------------------------------------------------------
 * Language
 *
 * A reader who has not said which language they read is sent to the one their browser asks for, and a
 * reader who has said stays where they put themselves. Both live here rather than in the pages: this
 * runs ahead of the page routes, so every page stays `render: 'static'` and is still answered from the
 * prerendered tree. Nothing below reads per-request state during a render.
 * ---------------------------------------------------------------------------------------------- */

/** A year — long enough that a returning reader is not asked twice, short enough that a stale choice lapses. */
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** The two request properties an unprefixed page's answer now turns on, for any cache in between. */
const NEGOTIATED_VARY = 'Accept-Language, Cookie';

/** The paths negotiation applies to. Anything else the server answers — the sitemap, an asset — is left alone. */
const NEGOTIABLE_PATHS = new Set<string>(PAGE_PATHS);

/** Records a reader's language so `Accept-Language` stops deciding for them. */
function rememberLocale(c: Context, locale: Locale): void {
  setCookie(c, LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'Lax',
    // Not unconditional: Safari drops a `Secure` cookie on `http://localhost`, which is where dev runs.
    secure: publicUrl(c).protocol === 'https:',
  });
}

/** Adds to `Vary` rather than replacing it — the page route has already put `RSC` there by the time this runs. */
function appendVary(headers: Headers, value: string): void {
  const existing = headers.get('vary');
  if (existing === null) headers.set('vary', value);
  else if (existing.trim() !== '*') headers.set('vary', `${existing}, ${value}`);
}

/**
 * Danish is the unprefixed language, so `/da/…` is not a second copy of it — it is the one way a reader
 * can say “Danish”, which the page they end up on cannot. The prefix is recorded, then dropped.
 *
 * 302 rather than the 301 this used to be: a permanent redirect is cached by the browser, and a `/da/…`
 * that never reaches the server again would never set the cookie a second time.
 */
server.get('/da', (c) => {
  rememberLocale(c, 'da');
  return c.redirect('/', 302);
});

server.get('/da/*', (c) => {
  rememberLocale(c, 'da');
  return c.redirect(publicUrl(c).pathname.slice('/da'.length) || '/', 302);
});

/**
 * Sends a reader to their own language when the URL has not already named one.
 *
 * Only the unprefixed tree is negotiated. `/en/resume` and `/de/resume` are a reader's own statement of
 * intent and are never second-guessed — they are only *recorded*, so the next unprefixed URL knows. It is
 * `/resume` that is ambiguous, being both the Danish page and the site's `x-default`, and that is where
 * the cookie, and failing that `Accept-Language`, gets to decide.
 *
 * A browser naming none of the three falls through to Danish rather than to a guess, and so does a
 * crawler, which sends no `Accept-Language` at all — which is what keeps the unprefixed tree indexable
 * and the `hreflang` block in `layout.tsx` honest.
 */
server.use(async (c, next) => {
  const { pathname } = publicUrl(c);
  const path = canonicalPath(pathname);
  if (c.req.method !== 'GET' || !NEGOTIABLE_PATHS.has(path)) return next();

  // Only when it would change: a `Set-Cookie` on every page would cost the prerendered tree its cacheability.
  const fromPath = localeFromPath(pathname);
  if (fromPath !== DEFAULT_LOCALE) {
    if (getCookie(c, LOCALE_COOKIE) !== fromPath) rememberLocale(c, fromPath);
    return next();
  }

  const chosen = getCookie(c, LOCALE_COOKIE);
  const locale = chosen !== undefined && isLocale(chosen) ? chosen : preferredLocale(c.req.header('accept-language'));

  if (locale !== null && locale !== DEFAULT_LOCALE) {
    // One reader's answer, so no shared cache may keep it and hand it to the next.
    c.header('cache-control', 'private, no-store');
    c.header('vary', NEGOTIATED_VARY);
    return c.redirect(localePath(path, locale), 302);
  }

  // The Danish page, served from a URL that could have gone either way. Say what it turned on.
  await next();
  appendVary(c.res.headers, NEGOTIATED_VARY);
});

/**
 * Every page in every language, with `hreflang` alternates so the three versions of a page are
 * understood as one page in three languages. Generated from the same table the tabs are built from,
 * so a new page cannot be added to the site and forgotten here.
 */
server.get('/sitemap.xml', (c) => {
  const urls = PAGE_PATHS.flatMap((path) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate}" href="${url(path, alternate)}" />`,
      ).join('\n');

      return [
        '  <url>',
        `    <loc>${url(path, locale)}</loc>`,
        alternates,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(path, 'da')}" />`,
        '  </url>',
      ].join('\n');
    }),
  ).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8' });
});

function url(path: string, locale: (typeof LOCALES)[number]): string {
  return new URL(localePath(path, locale), PROFILE.siteUrl).href;
}

export default server;

/** `hc<AppType>('/')` from `hono/client` gives paths, params and responses typed against the handlers above. */
export type AppType = typeof server;
