import { defineConfig } from 'astro/config';
import react from '@astrojs/react'; // Import the integration

export default defineConfig({
  // 1. Site and Base Configuration
  site: 'https://demo.we-theagency.com', 
  base: '/', 
  
  devToolbar: {
    enabled: false // ✅ ceci est la correction
  },
  
  // 2. Integrations Array (where React is added)
  integrations: [
    react()
  ],
  
  // You can add other configurations here (e.g., markdown, output, etc.)
});