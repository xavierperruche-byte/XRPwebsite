// astro.config.mjs

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
// Supprimez cette ligne :
// import node from "@astrojs/node"; 

export default defineConfig({
  // Configuration de base
  site: 'https://www.we-theagency.com/', 
  base: '/', 
  outDir: './dist',

  integrations: [
    react(),
    sitemap()
  ],
  
  output: 'static', // Mode statique pour Bluehost
  
  // Supprimez complètement la section adapter
  // adapter: node({ ... }),

  devToolbar: {
    enabled: false
  },
});
