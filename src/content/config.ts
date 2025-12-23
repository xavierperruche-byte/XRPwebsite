import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(), 
    mainImage: z.string(), 
    mainImageAlt: z.string(), 
    tags: z.array(z.string()), 
    publishDate: z.string().or(z.date()).optional(), 
    carouselImages: z.array(  z.object({    src: z.string(),    alt: z.string(),    caption: z.string().optional(),  })).optional(),
    keywords: z.array(z.string()).optional(), 
  }),
});

export const collections = { 
  products, 
  articles 
};