import { defineConfig } from '@rshono/core';

export default defineConfig({
  deploy: 'cloudflare',
  /** Prerendered pages have no request to read a Host from — canonical, hreflang and og:url need this. */
  siteUrl: 'https://www.lassetange.com',
  rspack(config) {
    /** Tailwind is a PostCSS plugin, so postcss-loader has to run ahead of Rspack's native CSS parser. */
    config.module!.rules!.push({ test: /\.css$/i, use: ['postcss-loader'], type: 'css/auto' });
    /** Content lives in `src/content/**.md`; importing one yields its raw source, parsed on the server. */
    config.module!.rules!.push({ test: /\.md$/i, type: 'asset/source' });
  },
});
