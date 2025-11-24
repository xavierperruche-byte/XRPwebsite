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

export const collections = { products };