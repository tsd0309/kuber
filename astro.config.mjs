// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    imageService: true
  }),
  integrations: [tailwind()],
  vite: {
    ssr: {
      noExternal: ['drizzle-orm']
    }
  }
});
