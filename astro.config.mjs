// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ivy-bacchus.github.io',
  base: '/coffee-site',
  output: 'static',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
