// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

const SITE = process.env.SITE_URL ?? 'https://felipefelixluca.github.io';
const BASE = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false }), mdx()],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    server: {
      watch: { ignored: ['**/dist/**'] },
    },
  },
});
