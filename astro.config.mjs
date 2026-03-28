import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export async function getStaticPaths() {
  const articleEntries = await getCollection('articles');
  
  console.log('IDs:', articleEntries.map(e => e.id));
  
  return articleEntries.map(entry => ({
    params: { slug: entry.id.replace(/\.mdx?$/, '') },
  }));
}
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

