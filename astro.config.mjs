import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.we-theagency.com/', 
  base: '/', 
  outDir: './dist',
  
  output: 'static', 
  middleware: true,

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
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'swiper'],
    }
  }
});

