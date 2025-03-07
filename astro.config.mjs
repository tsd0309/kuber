// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    maxDuration: 60
  }),
  vite: {
    ssr: {
      noExternal: [
        'xlsx',
        'drizzle-orm',
        'pg'
      ]
    }
  },
  integrations: [tailwind()]
});
