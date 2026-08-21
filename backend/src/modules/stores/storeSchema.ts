import { z } from 'zod';

export const StoreSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const UpdateStoreSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type CreateStoreInput = z.infer<typeof StoreSchema>;
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;
