import { defineRoutes } from '@rshono/core';

/**
 * Five pages in three languages, written out rather than generated.
 *
 * A `/:lang{en|de}` prefix would be four lines shorter, but a regex param cannot be prerendered — and
 * every page here is static text, so all fifteen are built to HTML at deploy time and served from
 * the edge with an ETag. Writing them out is also what makes the table readable as a sitemap: what
 * exists, in which languages, is the file itself.
 *
 * Paths stay English in all three languages; only the prefix changes. English is the primary language
 * and has no prefix, so `/` is English and `/da` and `/de` are its alternates.
 */
export const routes = defineRoutes({
  routes: [
    // English — the primary language, at the web root.
    { path: '/', render: 'static', component: () => import('./components/home') },
    { path: '/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/contact', render: 'static', component: () => import('./components/contact') },

    // Danish.
    { path: '/da', render: 'static', component: () => import('./components/home') },
    { path: '/da/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/da/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/da/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/da/contact', render: 'static', component: () => import('./components/contact') },

    // German.
    { path: '/de', render: 'static', component: () => import('./components/home') },
    { path: '/de/technologies', render: 'static', component: () => import('./components/technologies') },
    { path: '/de/open-source', render: 'static', component: () => import('./components/open-source') },
    { path: '/de/resume', render: 'static', component: () => import('./components/resume') },
    { path: '/de/contact', render: 'static', component: () => import('./components/contact') },
  ],
  notFound: { component: () => import('./components/404') },
  error: { component: () => import('./components/500') },
});
