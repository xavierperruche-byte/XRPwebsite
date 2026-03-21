import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
//import node from "@astrojs/node"; // RÉACTIVÉ : Indispensable pour l'adapter


export default defineConfig({
  site: 'https://www.we-theagency.com/', 
  base: '/', 
  outDir: './dist',
  
  // Mode SERVER indispensable pour ton "Vigile" (Middleware)
  output: 'static', 
  middleware: true,
 // adapter: node({
 //   mode: 'standalone', // Format optimal pour les serveurs Node.js Bluehost
 // }),

  integrations: [
    react(),
    sitemap()
  ],

  devToolbar: {
    enabled: false
  },

  compressHTML: true,

  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-swiper': ['swiper'],
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'swiper'],
    }
  }
});