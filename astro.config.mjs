// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: GitHub Pages デプロイ前にユーザー名とリポジトリ名を変更してください
  // 例: site: 'https://yourusername.github.io', base: '/coffee-site'
  site: 'https://yourusername.github.io',
  base: '/coffee-site',
  output: 'static',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
