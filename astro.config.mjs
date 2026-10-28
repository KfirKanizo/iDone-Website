import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.idone.co.il',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'he', locales: { he: 'he-IL', en: 'en' } },
      filter: (page) => !page.includes('/404') && page !== 'https://www.idone.co.il/',
    }),
  ],
  vite: { build: { assetsInlineLimit: 0 } },
});
