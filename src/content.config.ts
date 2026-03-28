import { defineCollection, z } from 'astro:content';
// Importation du loader glob pour les fichiers locaux
import { glob } from 'astro/loaders';

const products = defineCollection({
  // Utilisation du loader glob pour la collection products
  loader: glob({ pattern: '**/[^_]*.{md,mdx,json}', base: "./src/content/products" }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    currency: z.string(),
    image: z.string(),
    description: z.string(),
  }),
});

const articles = defineCollection({
  // Utilisation du loader glob pour la collection articles
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(), 
    mainImage: z.string(), 
    mainImageAlt: z.string(), 
    tags: z.array(z.string()), 
    publishDate: z.string().or(z.date()).optional(), 
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
  products, 
  articles 
};