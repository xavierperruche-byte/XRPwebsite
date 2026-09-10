import { defineCollection, z } from 'astro:content';
// Importation du loader glob pour les fichiers locaux
import { glob } from 'astro/loaders';


const articles = defineCollection({
  // Utilisation du loader glob pour la collection articles
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(), 
    mainImage: z.string(), 
    mainImageAlt: z.string(), 
    tags: z.array(z.string()), 
    publishDate: z.date().optional(), 
    carouselImages: z.array(z.object({ 
      src: z.string(), 
      alt: z.string(), 
      caption: z.string().optional(), 
    })).optional(),
    keywords: z.array(z.string()).optional(), 
  }),
});

// Exportation des collections mises à jour
export const collections = { 
  articles 
};