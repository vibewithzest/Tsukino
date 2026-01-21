// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['middle-def-boxed-champion.trycloudflare.com']
    }
  },

  adapter: node({
    mode: 'standalone'
  })
});