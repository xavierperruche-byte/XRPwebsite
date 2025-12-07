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

  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      // Option 1 : Utiliser esbuild (plus rapide que Terser)
      minify: 'esbuild',
      
      // Option 2 : Si vous voulez Terser, décommentez ci-dessous
      // minify: 'terser',
      // terserOptions: {
      //   compress: {
      //     drop_console: true, // Supprime les console.log en production
      //   }
      // },
      
      // Optimisations supplémentaires
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Sépare les vendors pour un meilleur cache
            'vendor-react': ['react', 'react-dom'],
            'vendor-swiper': ['swiper'],
          }
        }
      }
    },
    
    // Optimisations de développement
    server: {
      hmr: {
        overlay: false, // Désactive l'overlay d'erreur si gênant
      }
    },
    
    // Optimisations de chargement
    optimizeDeps: {
      include: ['react', 'react-dom', 'swiper'],
    }
  },
  
  // Optimisations Astro
  output: 'static', // ou 'server' si vous utilisez SSR
  
  build: {
    inlineStylesheets: 'auto', // Inline les petits CSS
  },
  
  // Compression des assets
  compressHTML: true,
});
