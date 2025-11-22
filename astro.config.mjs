// astro.config.mjs

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';


export default defineConfig({
  // 1. Configuration de base
  site: 'https://demo.we-theagency.com', 
  base: '/', 
  outDir: './dist', // Le dossier de sortie est bien './dist'

  integrations: [
    react(), // Intégration React
    sitemap() // Intégration Sitemap
  ],
  
  devToolbar: {
    enabled: false // Évite la toolbar astro en mode dev
  },

});