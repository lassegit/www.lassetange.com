import { defineConfig } from '@rshono/core';

export default defineConfig({
  deploy: 'cloudflare',
  /** Tailwind is a PostCSS plugin, so postcss-loader has to run ahead of Rspack's native CSS parser. */
  rspack(config) {
    config.module!.rules!.push({ test: /\.css$/i, use: ['postcss-loader'], type: 'css/auto' });
  },
});
