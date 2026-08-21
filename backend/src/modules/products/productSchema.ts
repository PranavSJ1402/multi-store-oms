import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z.string().optional(),
  category: z.string().optional(),
  store_id: z.string(), // Added from frontend
});

export type CreateProductInput = z.infer<typeof ProductSchema>;
