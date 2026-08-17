import { defineRoutes } from '@rshono/core';

/**
 * Seven pages in three languages, written out rather than generated.
 *
 * A `/:lang{en|de}` prefix would be four lines shorter, but a regex param cannot be prerendered — and
 * every page here is static text, so all twenty-one are built to HTML at deploy time and served from
 * the edge with an ETag. Writing them out is also what makes the table readable as a sitemap: what
 * exists, in which languages, is the file itself.
 *
 * Paths stay English in all three languages; only the prefix changes. Danish is the primary language
 * and has no prefix, so `/` is Danish and `/en` and `/de` are its alternates.
 */
export const routes = defineRoutes({
  routes: [
    // Danish — the primary language, at the web root.
    { path: '/', render: 'static', component: () => import('./components/home') },
    { path: '/products', render: 'static', component: () => import('./components/products') },
    { path: '/client-work', render: 'static', component: () => import('./components/client-work') },
    { path: '/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/contact', render: 'static', component: () => import('./components/contact') },

    // English.
    { path: '/en', render: 'static', component: () => import('./components/home') },
    { path: '/en/products', render: 'static', component: () => import('./components/products') },
    { path: '/en/client-work', render: 'static', component: () => import('./components/client-work') },
    { path: '/en/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/en/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/en/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/en/contact', render: 'static', component: () => import('./components/contact') },

    // German.
    { path: '/de', render: 'static', component: () => import('./components/home') },
    { path: '/de/products', render: 'static', component: () => import('./components/products') },
    { path: '/de/client-work', render: 'static', component: () => import('./components/client-work') },
    { path: '/de/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/de/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/de/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/de/contact', render: 'static', component: () => import('./components/contact') },
  ],
  notFound: { component: () => import('./components/404') },
  error: { component: () => import('./components/500') },
});
